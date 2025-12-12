import { task } from "@trigger.dev/sdk/v3"

interface GenerateVariantsPayload {
  siteId: string
  brandConstraints: object
  count: number
  includeImages: boolean
}

interface VariantPatch {
  headline?: string
  subheadline?: string
  cta?: string
  heroImage?: string
}

function extractJsonObject(text: string): string | null {
  const trimmed = text.trim()
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) return trimmed

  const first = trimmed.indexOf("{")
  const last = trimmed.lastIndexOf("}")
  if (first === -1 || last === -1 || last <= first) return null
  return trimmed.slice(first, last + 1)
}

export const generateVariantsTask = task({
  id: "generate-variants",
  maxDuration: 300,
  run: async (payload: GenerateVariantsPayload) => {
    const { siteId, brandConstraints, count, includeImages } = payload

    const variants: VariantPatch[] = []

    for (let i = 0; i < count; i++) {
      // Step 1: Generate text variations via OpenRouter
      const apiKey = process.env.OPENROUTER_API_KEY
      if (!apiKey) throw new Error("Missing OPENROUTER_API_KEY")

      const textResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
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
                "You generate landing page copy variants. Return ONLY valid JSON. No markdown. No commentary.",
            },
            {
              role: "user",
              content: [
                "Generate a landing page variant. Return a JSON object with keys: headline, subheadline, cta.",
                `Brand constraints: ${JSON.stringify(brandConstraints)}`,
              ].join("\n\n"),
            },
          ],
        }),
      })

      if (!textResponse.ok) {
        throw new Error(`OpenRouter request failed: ${textResponse.status} ${textResponse.statusText}`)
      }

      const textData = await textResponse.json()
      const content: string | undefined = textData?.choices?.[0]?.message?.content
      if (!content) throw new Error("OpenRouter returned empty content")

      const jsonStr = extractJsonObject(content)
      if (!jsonStr) throw new Error("Failed to extract JSON object from LLM output")
      const parsed = JSON.parse(jsonStr)

      const variant: VariantPatch = {
        headline: parsed?.headline,
        subheadline: parsed?.subheadline,
        cta: parsed?.cta,
      }

      // Step 2: Generate image if enabled via OpenRouter (Nano Banana)
      if (includeImages) {
        const imageResponse = await fetch("https://openrouter.ai/api/v1/images/generations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-image-preview",
            prompt: `Hero image for landing page with headline: ${variant.headline}`,
          }),
        })

        if (imageResponse.ok) {
          const imageData = await imageResponse.json()
          variant.heroImage = imageData.data?.[0]?.url
        }
      }

      variants.push(variant)
    }

    // Step 3: Create variants in database
    for (const patch of variants) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/variants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          site_id: siteId,
          patch,
        }),
      })
    }

    return { siteId, variantsCreated: variants.length }
  },
})
