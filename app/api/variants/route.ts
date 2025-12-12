import { NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    console.log('POST /api/variants - creating variant with:', body)

    const res = await fetch(`${API_URL}/api/variants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      console.error('Backend returned error:', res.status, res.statusText)
      const errorText = await res.text()
      console.error('Backend error details:', errorText)
      return NextResponse.json({ error: "Failed to create variant" }, { status: res.status })
    }

    const data = await res.json()
    console.log('POST /api/variants - backend response:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to create variant:", error)
    return NextResponse.json({ error: "Failed to create variant" }, { status: 500 })
  }
}
