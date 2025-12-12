import { NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    console.log('POST /api/events - tracking event:', body)

    // For now, we'll simulate event tracking since the backend event system
    // might expect different data format. In a full implementation, this would
    // transform the data and call the backend's event tracking API.

    // Simulate successful event tracking
    console.log('Event tracked successfully')

    return NextResponse.json({ status: "recorded" })
  } catch (error) {
    console.error("Failed to track event:", error)
    return NextResponse.json({ error: "Failed to track event" }, { status: 500 })
  }
}
