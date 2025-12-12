import { NextResponse } from "next/server"
import { authClient } from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export async function GET() {
  try {
    // Auth is handled by neonAuthMiddleware in proxy.ts
    // For now, return empty array - client will handle actual backend calls
    return NextResponse.json([])
  } catch (error) {
    console.error("Failed to fetch sites:", error)
    return NextResponse.json({ error: "Failed to fetch sites" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Auth is handled by neonAuthMiddleware in proxy.ts
    const body = await request.json()

    // For now, return a mock response - client will handle actual backend calls
    const mockSite = {
      id: crypto.randomUUID(),
      name: body.name || "New Site",
      url: body.url || "",
      status: "pending",
      user_id: "temp-user-id",
      created_at: new Date().toISOString(),
    }

    return NextResponse.json(mockSite)
  } catch (error) {
    console.error("Failed to create site:", error)
    return NextResponse.json({ error: "Failed to create site" }, { status: 500 })
  }
}
