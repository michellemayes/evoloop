import { describe, it, expect, beforeEach, vi } from 'vitest'
import { updateStatsTask } from '../update-stats'

// Access the mock from global
const mockFetch = global.fetch as any

describe('updateStatsTask', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockClear()
  })

  it('successfully updates stats for all sites', async () => {
    const mockSitesResponse = {
      sites: [
        { id: 'site-1', status: 'running' },
        { id: 'site-2', status: 'running' }
      ]
    }

    const mockStatsResponse1 = {
      success: true,
      updatedVariants: 3,
      updatedStats: 3
    }

    const mockStatsResponse2 = {
      success: true,
      updatedVariants: 2,
      updatedStats: 2
    }

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSitesResponse)
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockStatsResponse1)
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockStatsResponse2)
      })

    const result = await updateStatsTask.run({})

    // Verify sites endpoint was called
    expect(mockFetch).toHaveBeenNthCalledWith(
      1,
      'http://localhost:8000/api/stats/update-all',
      expect.objectContaining({
        method: 'POST'
      })
    )

    expect(result).toEqual(mockSitesResponse)
  })

  it('successfully updates stats for specific site', async () => {
    const mockStatsResponse = {
      success: true,
      updatedVariants: 3,
      updatedStats: 3
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockStatsResponse)
    })

    const payload = { siteId: 'specific-site-id' }
    const result = await updateStatsTask.run(payload)

    // Verify specific site endpoint was called
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/stats/update/specific-site-id',
      expect.objectContaining({
        method: 'POST'
      })
    )

    expect(result).toEqual(mockStatsResponse)
  })

  it('handles basic stats update', async () => {
    const mockResponse = {
      success: true,
      updatedVariants: 2,
      updatedStats: 2
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    })

    const result = await updateStatsTask.run({})
    expect(result).toEqual(mockResponse)
  })
})
