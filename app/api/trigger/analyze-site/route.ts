import { NextResponse } from "next/server"
import { analyzeSiteTask } from "../../../../trigger/analyze-site"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { siteId, url } = body

    if (!siteId || !url) {
      return NextResponse.json(
        { error: "Missing siteId or url" },
        { status: 400 }
      )
    }

    console.log('Triggering analyze-site task for site:', siteId, 'URL:', url)

    // Trigger the analyze-site task
    const result = await analyzeSiteTask.trigger({
      siteId,
      url,
    })

    console.log('Analyze-site task triggered successfully:', result)

    return NextResponse.json({
      success: true,
      runId: result.id,
      message: "Site analysis started",
    })
  } catch (error) {
    console.error("Failed to trigger analyze-site task:", error)
    return NextResponse.json(
      { error: "Failed to trigger site analysis" },
      { status: 500 }
    )
  }
}
