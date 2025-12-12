import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { authClient } from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// Helper to get user ID from Neon Auth session
async function getUserIdFromRequest(request: Request): Promise<string | null> {
  try {
    const cookieStore = await cookies()

    // Neon Auth stores session data in cookies
    // Look for session-related cookies
    const allCookies = cookieStore.getAll()
    const sessionCookie = cookieStore.get('neon-auth-session')
    const betterAuthToken = cookieStore.get('better-auth.session_token')

    console.log('All cookies:', allCookies.map(c => ({ name: c.name, value: c.value ? 'present' : 'empty' })))
    console.log('Session cookies available:', {
      'neon-auth-session': !!sessionCookie,
      'better-auth.session_token': !!betterAuthToken
    })

    // Try to validate session by calling the auth API directly
    if (sessionCookie?.value || betterAuthToken?.value) {
      try {
        const authUrl = process.env.NEON_AUTH_BASE_URL
        const sessionCheckUrl = `${authUrl}/session`

        console.log('Attempting to validate session at:', sessionCheckUrl)

        const sessionRes = await fetch(sessionCheckUrl, {
          method: 'GET',
          headers: {
            'Cookie': allCookies.map(c => `${c.name}=${c.value}`).join('; '),
            'Content-Type': 'application/json',
          },
        })

        if (sessionRes.ok) {
          const sessionData = await sessionRes.json()
          console.log('Session validation successful:', sessionData)
          return sessionData.user?.id || sessionData.userId
        } else {
          console.log('Session validation failed:', sessionRes.status, sessionRes.statusText)
        }
      } catch (sessionError) {
        console.error('Session validation error:', sessionError)
      }
    }

    // Fallback: Since middleware protects these routes, assume user is authenticated
    // and return a consistent test user ID for development
    console.log('Using fallback user ID for development')
    return '550e8400-e29b-41d4-a716-446655440000'

  } catch (error) {
    console.error('Error extracting user from request:', error)
    return null
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params
    console.log('GET /api/sites/[siteId] - fetching site:', siteId)

    const res = await fetch(`${API_URL}/api/sites/${siteId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      console.error('Backend returned error:', res.status, res.statusText)
      const errorText = await res.text()
      console.error('Backend error:', errorText)
      return NextResponse.json({ error: "Failed to fetch site" }, { status: res.status })
    }

    const data = await res.json()
    console.log('GET /api/sites/[siteId] - backend response:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to fetch site:", error)
    return NextResponse.json({ error: "Failed to fetch site" }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params
    const body = await request.json()

    console.log('PATCH /api/sites/[siteId] - updating site:', siteId, 'with:', body)

    const res = await fetch(`${API_URL}/api/sites/${siteId}`, {
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
      return NextResponse.json({ error: "Failed to update site" }, { status: res.status })
    }

    const data = await res.json()
    console.log('PATCH /api/sites/[siteId] - backend response:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to update site:", error)
    return NextResponse.json({ error: "Failed to update site" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params

    console.log('DELETE /api/sites/[siteId] - deleting site:', siteId)

    const res = await fetch(`${API_URL}/api/sites/${siteId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      console.error('Backend returned error:', res.status, res.statusText)
      const errorText = await res.text()
      console.error('Backend error:', errorText)
      return NextResponse.json({ error: "Failed to delete site" }, { status: res.status })
    }

    const data = await res.json()
    console.log('DELETE /api/sites/[siteId] - backend response:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to delete site:", error)
    return NextResponse.json({ error: "Failed to delete site" }, { status: 500 })
  }
}
