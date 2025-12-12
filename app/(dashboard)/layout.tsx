import { Suspense } from "react"
import { stackServerApp } from "@/lib/stack"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"

function HeaderSkeleton() {
  return (
    <header className="flex items-center justify-between h-16 px-6 border-b bg-card">
      <div className="h-6 w-32 bg-muted animate-pulse rounded" />
      <div className="flex items-center gap-4">
        <div className="h-8 w-8 bg-muted animate-pulse rounded-full" />
      </div>
    </header>
  )
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Page-level protection - redirects to sign-in if not authenticated
  await stackServerApp.getUser({ or: "redirect" })

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Suspense fallback={<HeaderSkeleton />}>
          <Header />
        </Suspense>
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
