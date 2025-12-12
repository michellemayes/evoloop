import { describe, it, expect, beforeEach, vi } from 'vitest'
import { generateVariantsTask } from '../generate-variants'

// Mock fetch globally
const mockFetch = global.fetch as any

describe('generateVariantsTask', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('successfully generates and persists variants', async () => {
    // Mock OpenRouter response for text generation
    const mockTextResponse = {
      choices: [{
        message: {
          content: '{"headline": "AI-Powered Solutions", "subheadline": "Transform your workflow with intelligent automation", "cta": "Start Free Trial"}'
        }
      }]
    }

    // Mock second text generation call
    const mockTextResponse2 = {
      choices: [{
        message: {
          content: '{"headline": "Second Variant", "subheadline": "Another approach", "cta": "Try Now"}'
        }
      }]
    }

    // Mock image generation response (optional)
    const mockImageResponse = {
      data: [{ url: 'https://example.com/generated-image.jpg' }]
    }

    // Mock API responses for variant creation
    const mockVariantResponse1 = { id: 'variant-1', success: true }
    const mockVariantResponse2 = { id: 'variant-2', success: true }

    mockFetch
      // First text generation call
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTextResponse)
      })
      // Second text generation call
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTextResponse2)
      })
      // Image generation call (optional)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockImageResponse)
      })
      // Variant creation calls
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockVariantResponse1)
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockVariantResponse2)
      })

    const payload = {
      siteId: 'test-site-id',
      brandConstraints: {
        colors: { primary: '#3B82F6' },
        typography: { headingFont: 'Inter' },
        tone: 'professional',
        imageryStyle: 'photography'
      },
      count: 2,
      includeImages: true
    }

    const result = await generateVariantsTask.run(payload)

    // Verify OpenRouter was called for text generation (twice for 2 variants)
    expect(mockFetch).toHaveBeenCalledTimes(5) // 2 text + 1 image + 2 variant creation

    // Check text generation calls
    expect(mockFetch).toHaveBeenNthCalledWith(
      1,
      'https://openrouter.ai/api/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('anthropic/claude-3-haiku')
      })
    )

    // Check image generation call
    expect(mockFetch).toHaveBeenNthCalledWith(
      3,
      'https://openrouter.ai/api/v1/images/generations',
      expect.objectContaining({
        method: 'POST'
      })
    )

    // Check variant creation calls
    expect(mockFetch).toHaveBeenNthCalledWith(
      4,
      'http://localhost:8000/api/variants',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"site_id":"test-site-id"')
      })
    )

    expect(result).toEqual({
      siteId: 'test-site-id',
      variantsCreated: 2
    })
  })

  it('skips image generation when disabled', async () => {
    const mockTextResponse = {
      choices: [{
        message: {
          content: JSON.stringify({
            headline: 'Test Headline',
            subheadline: 'Test Subheadline',
            cta: 'Test CTA'
          })
        }
      }]
    }

    mockFetch
      .mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockTextResponse)
      })
      .mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ id: 'variant-1' })
      })

    const payload = {
      siteId: 'test-site-id',
      brandConstraints: { colors: { primary: '#000' } },
      count: 1,
      includeImages: false // Disabled
    }

    await generateVariantsTask.run(payload)

    // Should not call image generation endpoint
    const imageCalls = mockFetch.mock.calls.filter(call =>
      call[0].includes('images/generations')
    )
    expect(imageCalls).toHaveLength(0)
  })

  it('handles OpenRouter text generation errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('OpenRouter text error'))

    const payload = {
      siteId: 'test-site-id',
      brandConstraints: { colors: { primary: '#000' } },
      count: 1,
      includeImages: false
    }

    await expect(generateVariantsTask.run(payload)).rejects.toThrow('OpenRouter text error')
  })

  it('handles variant creation API errors', async () => {
    const mockTextResponse = {
      choices: [{
        message: {
          content: JSON.stringify({
            headline: 'Test',
            subheadline: 'Test',
            cta: 'Test'
          })
        }
      }]
    }

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTextResponse)
      })
      .mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request'
      })

    const payload = {
      siteId: 'test-site-id',
      brandConstraints: { colors: { primary: '#000' } },
      count: 1,
      includeImages: false
    }

    await expect(generateVariantsTask.run(payload)).rejects.toThrow()
  })

  it('handles invalid JSON from OpenRouter', async () => {
    const mockTextResponse = {
      choices: [{
        message: {
          content: 'Invalid JSON response from AI: {invalid json}'
        }
      }]
    }

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTextResponse)
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'variant-1' })
      })

    const payload = {
      siteId: 'test-site-id',
      brandConstraints: { colors: { primary: '#000' } },
      count: 1,
      includeImages: false
    }

    // Should succeed because it falls back gracefully or the JSON extraction handles it
    const result = await generateVariantsTask.run(payload)
    expect(result).toHaveProperty('siteId', 'test-site-id')
  })

  it('includes brand constraints in AI prompt', async () => {
    const mockTextResponse = {
      choices: [{
        message: {
          content: JSON.stringify({
            headline: 'Test',
            subheadline: 'Test',
            cta: 'Test'
          })
        }
      }]
    }

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTextResponse)
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'variant-1' })
      })

    const brandConstraints = {
      colors: { primary: '#FF0000', secondary: '#00FF00' },
      typography: { headingFont: 'Arial', bodyFont: 'Helvetica' },
      tone: 'energetic',
      imageryStyle: 'modern'
    }

    const payload = {
      siteId: 'test-site-id',
      brandConstraints,
      count: 1,
      includeImages: false
    }

    await generateVariantsTask.run(payload)

    // Verify brand constraints were included in the prompt
    const textCall = mockFetch.mock.calls.find(call =>
      call[0].includes('chat/completions')
    )
    const requestBody = JSON.parse(textCall[1].body)
    expect(requestBody.messages[0].content).toContain(JSON.stringify(brandConstraints))
  })
})
