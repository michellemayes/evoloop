import { task } from "@trigger.dev/sdk/v3"

interface AnalyzeSitePayload {
  siteId: string
  url: string
}

interface BrandConstraints {
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
  }
  typography: {
    headingFont: string
    bodyFont: string
    headingSize: string
    bodySize: string
  }
  tone: string
  imageryStyle: string
}

export const analyzeSiteTask = task({
  id: "analyze-site",
  maxDuration: 300,
  run: async (payload: AnalyzeSitePayload) => {
    const { siteId, url } = payload

    // Step 1: Scrape the page (Playwright would run here)
    console.log(`Scraping ${url}...`)

    // Step 2: Extract brand constraints via LLM
    const brandConstraints: BrandConstraints = {
      colors: {
        primary: "#3B82F6",
        secondary: "#1E40AF",
        accent: "#F59E0B",
        background: "#FFFFFF",
      },
      typography: {
        headingFont: "Inter",
        bodyFont: "Inter",
        headingSize: "48px",
        bodySize: "16px",
      },
      tone: "professional",
      imageryStyle: "photography",
    }

    // Step 3: Update site in database
    const response = await fetch(`${process.env.API_URL}/api/sites/${siteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        brand_constraints: brandConstraints,
        status: "analyzed",
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to update site: ${response.statusText}`)
    }

    return { siteId, brandConstraints }
  },
})
