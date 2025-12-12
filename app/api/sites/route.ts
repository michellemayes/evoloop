import { NextResponse } from "next/server"
import { cookies } from "next/headers"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// Helper to get user ID from Neon Auth session
async function getUserIdFromSession(): Promise<string | null> {
  try {
    console.log('Getting user session...')

    // Try to get session from auth client
    const { data: session } = await authClient.getSession()

    if (session?.user?.id) {
      console.log('Auth successful, user ID:', session.user.id)
      return session.user.id
    }

    // If auth client fails, try manual session validation
    console.log('Auth client failed, trying manual validation...')
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    const sessionToken = cookieStore.get('__Secure-neon-auth.session_token')

    if (sessionToken?.value) {
      // Call Neon Auth session endpoint directly
      const authUrl = process.env.NEON_AUTH_BASE_URL
      if (authUrl) {
        try {
          const sessionRes = await fetch(`${authUrl}/session`, {
            headers: {
              'Cookie': allCookies.map(c => `${c.name}=${c.value}`).join('; '),
            },
          })

          if (sessionRes.ok) {
            const sessionData = await sessionRes.json()
            if (sessionData?.user?.id) {
              console.log('Manual auth successful, user ID:', sessionData.user.id)
              return sessionData.user.id
            }
          }
        } catch (manualError) {
          console.error('Manual auth failed:', manualError)
        }
      }
    }

    console.log('All auth methods failed')
    return null
  } catch (error) {
    console.error('Session validation error:', error)
    return null
  }
}

export async function GET(request: Request) {
  try {
    // Get authenticated user from session
    let userId = await getUserIdFromSession()

    // If auth client fails, try to get user ID from middleware/session
    if (!userId) {
      // Check if we can get user from request headers or middleware
      const cookieStore = await cookies()
      const userFromCookie = cookieStore.get('user_id')?.value
      if (userFromCookie) {
        userId = userFromCookie
        console.log('Got user ID from cookie:', userId)
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log('GET /api/sites - user ID:', userId)
    console.log('GET /api/sites - calling backend at:', `${API_URL}/api/sites?user_id=${userId}`)

    const res = await fetch(`${API_URL}/api/sites?user_id=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      console.error('Backend returned error:', res.status, res.statusText)
      const errorText = await res.text()
      console.error('Backend error:', errorText)
      return NextResponse.json({ error: "Failed to fetch sites" }, { status: res.status })
    }

    const data = await res.json()
    console.log('GET /api/sites - backend response:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to fetch sites:", error)
    return NextResponse.json({ error: "Failed to fetch sites" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Get authenticated user from session
    const userId = await getUserIdFromSession()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const siteData = {
      url: body.url,
      user_id: userId
    }

    console.log('POST /api/sites - user ID:', userId)
    console.log('POST /api/sites - calling backend at:', `${API_URL}/api/sites`)
    console.log('POST /api/sites - request body:', siteData)

    const res = await fetch(`${API_URL}/api/sites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(siteData),
    })

    if (!res.ok) {
      console.error('Backend returned error:', res.status, res.statusText)
      const errorText = await res.text()
      console.error('Backend error details:', errorText)
      return NextResponse.json({ error: "Failed to create site" }, { status: res.status })
    }

    const data = await res.json()
    console.log('POST /api/sites - backend response:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to create site:", error)
    return NextResponse.json({ error: "Failed to create site" }, { status: 500 })
  }
}
