import { NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ variantId: string }> }
) {
  try {
    const { variantId } = await params
    const body = await request.json()

    console.log('PATCH /api/variants/[variantId] - updating variant:', variantId, 'with:', body)

    const res = await fetch(`${API_URL}/api/variants/${variantId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      console.error('Backend returned error:', res.status, res.statusText)
      const errorText = await res.text()
      console.error('Backend error:', errorText)
      return NextResponse.json({ error: "Failed to update variant" }, { status: res.status })
    }

    const data = await res.json()
    console.log('PATCH /api/variants/[variantId] - backend response:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to update variant:", error)
    return NextResponse.json({ error: "Failed to update variant" }, { status: 500 })
  }
}
