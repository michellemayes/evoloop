import { describe, it, expect, beforeEach } from 'vitest'
import { analyzeSiteTask } from '../analyze-site'
import { mockFetch, resetMocks } from './setup'

describe('analyzeSiteTask', () => {
  beforeEach(() => {
    resetMocks()
  })

  it('successfully analyzes site and extracts brand constraints', async () => {
    // Mock successful OpenRouter response for brand analysis
    const mockOpenRouterResponse = {
      choices: [{
        message: {
          content: JSON.stringify({
            colors: {
              primary: '#3B82F6',
              secondary: '#1E40AF',
              accent: '#F59E0B',
              background: '#FFFFFF'
            },
            typography: {
              headingFont: 'Inter',
              bodyFont: 'Inter',
              headingSize: '48px',
              bodySize: '16px'
            },
            tone: 'professional',
            imageryStyle: 'photography'
          })
        }
      }]
    }

    // Mock successful API call to update site
    const mockApiResponse = { success: true }

    // Mock page fetch first
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve('<html><body><h1>Test Page</h1></body></html>')
    })

    // Then OpenRouter API call
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockOpenRouterResponse)
    })

    // Finally site update API call
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResponse)
    })

    const payload = {
      siteId: 'test-site-id',
      url: 'https://example.com'
    }

    const result = await analyzeSiteTask.run(payload)

    // Verify the expected API calls were made
    expect(mockFetch).toHaveBeenCalledWith(
      'https://example.com',
      expect.objectContaining({
        headers: expect.objectContaining({
          'User-Agent': expect.stringContaining('EvoloopBot')
        })
      })
    )

    expect(mockFetch).toHaveBeenCalledWith(
      'https://openrouter.ai/api/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-openrouter-key'
        })
      })
    )

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/sites/test-site-id',
      expect.objectContaining({
        method: 'PATCH',
        body: expect.stringContaining('"status":"running"')
      })
    )

    // Verify site was updated with brand constraints and status
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/sites/test-site-id',
      expect.objectContaining({
        method: 'PATCH',
        body: expect.stringContaining('"status":"running"')
      })
    )

    expect(result).toEqual({
      siteId: 'test-site-id',
      brandConstraints: expect.objectContaining({
        colors: expect.any(Object),
        typography: expect.any(Object),
        tone: 'professional',
        imageryStyle: 'photography'
      })
    })
  })

  it('handles OpenRouter API errors gracefully', async () => {
    // Mock page fetch first
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve('<html><body><h1>Test Page</h1></body></html>')
    })

    // Mock OpenRouter failure
    mockFetch.mockRejectedValueOnce(new Error('OpenRouter API error'))

    const payload = {
      siteId: 'test-site-id',
      url: 'https://example.com'
    }

    await expect(analyzeSiteTask.run(payload)).rejects.toThrow('OpenRouter API error')
  })

  it('handles site update API errors gracefully', async () => {
    // Mock page fetch first
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve('<html><body><h1>Test Page</h1></body></html>')
    })

    // Mock successful OpenRouter
    const mockOpenRouterResponse = {
      choices: [{
        message: {
          content: JSON.stringify({
            colors: { primary: '#000' },
            typography: { headingFont: 'Arial' },
            tone: 'casual',
            imageryStyle: 'illustrations'
          })
        }
      }]
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockOpenRouterResponse)
    })

    // Mock failed site update
    mockFetch.mockResolvedValueOnce({
      ok: false,
      statusText: 'Internal Server Error'
    })

    const payload = {
      siteId: 'test-site-id',
      url: 'https://example.com'
    }

    await expect(analyzeSiteTask.run(payload)).rejects.toThrow('Failed to update site')
  })

  it('handles invalid JSON response from OpenRouter', async () => {
    // Mock OpenRouter response with invalid JSON
    const mockOpenRouterResponse = {
      choices: [{
        message: {
          content: 'Invalid JSON response'
        }
      }]
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockOpenRouterResponse)
    })

    const payload = {
      siteId: 'test-site-id',
      url: 'https://example.com'
    }

    await expect(analyzeSiteTask.run(payload)).rejects.toThrow()
    // Should fail when trying to parse invalid JSON
  })
})
