import { describe, it, expect, beforeEach, vi } from 'vitest'
import { generateVariantsTask } from '../generate-variants'

// Access the mock from global
const mockFetch = global.fetch as any

describe('generateVariantsTask', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockClear()
  })

  it('generates variants successfully', async () => {
    // Ensure mock is set up correctly
    const mockTextResponse = {
      choices: [{
        message: {
          content: '{"headline": "Test Headline", "subheadline": "Test Subheadline", "cta": "Test CTA"}'
        }
      }]
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTextResponse)
    })

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'variant-1' })
    })

    const payload = {
      siteId: 'test-site-id',
      brandConstraints: {
        colors: { primary: '#3B82F6' },
        typography: { headingFont: 'Inter' },
        tone: 'professional',
        imageryStyle: 'photography'
      },
      count: 1,
      includeImages: false
    }

    const result = await generateVariantsTask.run(payload)

    expect(result).toHaveProperty('siteId', 'test-site-id')
    expect(result).toHaveProperty('variantsCreated', 1)
  })

  it('handles image generation disabled', async () => {
    const mockTextResponse = {
      choices: [{
        message: {
          content: '{"headline": "Test Headline", "subheadline": "Test Subheadline", "cta": "Test CTA"}'
        }
      }]
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTextResponse)
    })

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'variant-1' })
    })

    const payload = {
      siteId: 'test-site-id',
      brandConstraints: { colors: { primary: '#000' } },
      count: 1,
      includeImages: false
    }

    const result = await generateVariantsTask.run(payload)
    expect(result).toHaveProperty('siteId', 'test-site-id')
  })

  it('handles brand constraints', async () => {
    const mockTextResponse = {
      choices: [{
        message: {
          content: '{"headline": "Test Headline", "subheadline": "Test Subheadline", "cta": "Test CTA"}'
        }
      }]
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTextResponse)
    })

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'variant-1' })
    })

    const payload = {
      siteId: 'test-site-id',
      brandConstraints: {
        colors: { primary: '#FF0000', secondary: '#00FF00' },
        typography: { headingFont: 'Arial', bodyFont: 'Helvetica' },
        tone: 'energetic',
        imageryStyle: 'modern'
      },
      count: 1,
      includeImages: false
    }

    const result = await generateVariantsTask.run(payload)
    expect(result).toHaveProperty('siteId', 'test-site-id')
  })
})
