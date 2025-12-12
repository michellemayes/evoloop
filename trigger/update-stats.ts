import { task, schedules } from "@trigger.dev/sdk/v3"

interface UpdateStatsPayload {
  siteId?: string
}

export const updateStatsTask = task({
  id: "update-stats",
  maxDuration: 120,
  run: async (payload: UpdateStatsPayload) => {
    const { siteId } = payload

    // Fetch all active sites (or specific site)
    const sitesUrl = siteId
      ? `${process.env.API_URL}/api/stats/update/${siteId}`
      : `${process.env.API_URL}/api/stats/update-all`

    const response = await fetch(sitesUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })

    if (!response.ok) {
      throw new Error(`Failed to update stats: ${response.statusText}`)
    }

    const result = await response.json()
    return result
  },
})

// Schedule stats update every 5 minutes
export const scheduledStatsUpdate = schedules.task({
  id: "scheduled-stats-update",
  cron: "*/5 * * * *",
  run: async () => {
    const response = await fetch(`${process.env.API_URL}/api/stats/update-all`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })

    if (!response.ok) {
      throw new Error(`Scheduled stats update failed: ${response.statusText}`)
    }

    return { status: "completed", timestamp: new Date().toISOString() }
  },
})
