"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"

export function DashboardAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession()
        if (!session) {
          router.push("/auth/sign-in")
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        router.push("/auth/sign-in")
      }
    }

    checkAuth()
  }, [router])

  return <>{children}</>
}
