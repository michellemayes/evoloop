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

function extractJsonObject(text: string): string | null {
  const trimmed = text.trim()
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) return trimmed

  const first = trimmed.indexOf("{")
  const last = trimmed.lastIndexOf("}")
  if (first === -1 || last === -1 || last <= first) return null
  return trimmed.slice(first, last + 1)
}

async function extractBrandConstraintsViaOpenRouter(
  pageUrl: string,
  html: string
): Promise<BrandConstraints> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error("Missing OPENROUTER_API_KEY")

  // Keep prompts bounded.
  const htmlSnippet = html.slice(0, 20000)

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "anthropic/claude-3-haiku",
      messages: [
        {
          role: "system",
          content:
            "You extract brand constraints from landing pages. Return ONLY valid JSON. No markdown. No commentary.",
        },
        {
          role: "user",
          content: [
            "Analyze this landing page and infer brand constraints.",
            "Return a JSON object with this exact shape:",
            `{
  "colors": { "primary": string, "secondary": string, "accent": string, "background": string },
  "typography": { "headingFont": string, "bodyFont": string, "headingSize": string, "bodySize": string },
  "tone": string,
  "imageryStyle": string
}`,
            "Color values must be hex like #RRGGBB. Font names should be human-readable (e.g. Inter). Sizes should be CSS sizes (e.g. 48px, 16px).",
            `URL: ${pageUrl}`,
            "HTML (truncated):",
            htmlSnippet,
          ].join("\n\n"),
        },
      ],
    }),
  })

  if (!res.ok) {
    throw new Error(`OpenRouter request failed: ${res.status} ${res.statusText}`)
  }

  const data = await res.json()
  const content: string | undefined = data?.choices?.[0]?.message?.content
  if (!content) throw new Error("OpenRouter returned empty content")

  const jsonStr = extractJsonObject(content)
  if (!jsonStr) throw new Error("Failed to extract JSON object from LLM output")

  const parsed = JSON.parse(jsonStr)
  return parsed as BrandConstraints
}

export const analyzeSiteTask = task({
  id: "analyze-site",
  maxDuration: 300,
  run: async (payload: AnalyzeSitePayload) => {
    const { siteId, url } = payload

    // Step 1: Fetch the page HTML (keep simple; JS-rendered pages can be upgraded to Playwright later)
    const pageRes = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; EvoloopBot/1.0; +https://evoloop.ai)",
        Accept: "text/html,application/xhtml+xml",
      },
    })
    if (!pageRes.ok) {
      throw new Error(`Failed to fetch page HTML: ${pageRes.status} ${pageRes.statusText}`)
    }
    const html = await pageRes.text()

    // Step 2: Extract brand constraints via LLM
    const brandConstraints = await extractBrandConstraintsViaOpenRouter(url, html)

    // Step 3: Update site in database (and move to running so runtime can serve)
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/sites/${siteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        brand_constraints: brandConstraints,
        status: "running",
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to update site: ${response.statusText}`)
    }

    return { siteId, brandConstraints }
  },
})
