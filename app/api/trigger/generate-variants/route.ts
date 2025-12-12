import { NextResponse } from "next/server"
import { generateVariantsTask } from "../../../../trigger/generate-variants"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { siteId, brandConstraints, count = 3, includeImages = false } = body

    if (!siteId || !brandConstraints) {
      return NextResponse.json(
        { error: "Missing siteId or brandConstraints" },
        { status: 400 }
      )
    }

    console.log('Triggering generate-variants task for site:', siteId)

    // Trigger the generate-variants task
    const result = await generateVariantsTask.trigger({
      siteId,
      brandConstraints,
      count,
      includeImages,
    })

    console.log('Generate-variants task triggered successfully:', result)

    return NextResponse.json({
      success: true,
      runId: result.id,
      message: "Variant generation started",
    })
  } catch (error) {
    console.error("Failed to trigger generate-variants task:", error)
    return NextResponse.json(
      { error: "Failed to trigger variant generation" },
      { status: 500 }
    )
  }
}
