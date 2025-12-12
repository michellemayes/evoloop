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

export const generateVariantsTask = task({
  id: "generate-variants",
  maxDuration: 300,
  run: async (payload: GenerateVariantsPayload) => {
    const { siteId, brandConstraints, count, includeImages } = payload

    const variants: VariantPatch[] = []

    for (let i = 0; i < count; i++) {
      // Step 1: Generate text variations via OpenRouter
      const textResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        },
        body: JSON.stringify({
          model: "anthropic/claude-3-haiku",
          messages: [
            {
              role: "system",
              content: `Generate landing page copy variations. Brand constraints: ${JSON.stringify(brandConstraints)}`,
            },
            {
              role: "user",
              content: "Generate a headline, subheadline, and CTA button text for a landing page variation.",
            },
          ],
        }),
      })

      const textData = await textResponse.json()
      const variant: VariantPatch = {
        headline: `Variant ${i + 1} Headline`,
        subheadline: `Engaging subheadline for variant ${i + 1}`,
        cta: "Get Started Now",
      }

      // Step 2: Generate image if enabled via OpenRouter (Nano Banana)
      if (includeImages) {
        const imageResponse = await fetch("https://openrouter.ai/api/v1/images/generations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
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
      await fetch(`${process.env.API_URL}/api/variants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          site_id: siteId,
          patch,
          status: "pending_review",
        }),
      })
    }

    return { siteId, variantsCreated: variants.length }
  },
})
