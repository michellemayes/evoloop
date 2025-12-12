import { NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params
    console.log('GET /api/sites/[siteId]/stats - fetching stats for site:', siteId)

    const res = await fetch(`${API_URL}/api/stats/site/${siteId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      console.error('Backend returned error:', res.status, res.statusText)
      const errorText = await res.text()
      console.error('Backend error:', errorText)
      return NextResponse.json({ error: "Failed to fetch stats" }, { status: res.status })
    }

    const data = await res.json()
    console.log('GET /api/sites/[siteId]/stats - backend response:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to fetch stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params
    console.log('POST /api/sites/[siteId]/stats - updating stats for site:', siteId)

    const res = await fetch(`${API_URL}/api/stats/update/${siteId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      console.error('Backend returned error:', res.status, res.statusText)
      const errorText = await res.text()
      console.error('Backend error:', errorText)
      return NextResponse.json({ error: "Failed to update stats" }, { status: res.status })
    }

    const data = await res.json()
    console.log('POST /api/sites/[siteId]/stats - backend response:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to update stats:", error)
    return NextResponse.json({ error: "Failed to update stats" }, { status: 500 })
  }
}
