import { NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// Simple variant assignment logic (in production, this would use Thompson sampling)
function assignVariant(siteId: string, visitorId: string, variants: any[]) {
  if (!variants || variants.length === 0) {
    return null
  }

  // Simple round-robin for demo (production would use Thompson sampling)
  const index = Math.abs(hashString(visitorId)) % variants.length
  const variant = variants[index]

  return {
    variant_id: variant.id,
    patch: variant.patch || {},
  }
}

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get('site_id')
    const visitorId = searchParams.get('visitor_id')

    if (!siteId || !visitorId) {
      return NextResponse.json({ error: "Missing site_id or visitor_id" }, { status: 400 })
    }

    console.log('GET /api/v1/assign - site:', siteId, 'visitor:', visitorId)

    // Fetch variants for this site
    const variantsRes = await fetch(`${API_URL}/api/sites/${siteId}/variants`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!variantsRes.ok) {
      console.log('No variants found, returning null')
      return NextResponse.json(null)
    }

    const variants = await variantsRes.json()
    const activeVariants = variants.filter((v: any) => v.status === 'active')

    if (activeVariants.length === 0) {
      console.log('No active variants found, returning null')
      return NextResponse.json(null)
    }

    const assignment = assignVariant(siteId, visitorId, activeVariants)
    console.log('Assigned variant:', assignment)

    return NextResponse.json(assignment)
  } catch (error) {
    console.error("Failed to assign variant:", error)
    return NextResponse.json({ error: "Failed to assign variant" }, { status: 500 })
  }
}
