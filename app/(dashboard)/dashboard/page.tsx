"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Globe, TrendingUp, Users, Zap, Plus, ArrowRight, Loader2 } from "lucide-react"

interface Site {
  id: string
  url: string
  status: string
  variant_count?: number
  visitors?: number
  conversions?: number
  conversion_rate?: number
}

export default function DashboardPage() {
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSites()
  }, [])

  const fetchSites = async () => {
    try {
      const res = await fetch("/api/sites")
      if (res.ok) {
        const data = await res.json()
        setSites(Array.isArray(data) ? data : (data.sites || []))
      }
    } catch (error) {
      console.error("Failed to fetch sites:", error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate stats from real data
  const stats = {
    activeSites: sites.length,
    totalVisitors: sites.reduce((sum, site) => sum + (site.visitors || 0), 0),
    avgConversionRate: sites.length > 0
      ? sites.reduce((sum, site) => sum + (site.conversion_rate || 0), 0) / sites.length
      : 0,
    totalVariants: sites.reduce((sum, site) => sum + (site.variant_count || 0), 0),
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Empty state - no sites yet
  if (sites.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome to Evoloop! Let&apos;s get started.
          </p>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <Globe className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Add your first site</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Start optimizing your landing pages with AI-powered A/B testing.
              Add your first site to begin generating and testing variants.
            </p>
            <Button asChild size="lg">
              <Link href="/dashboard/sites">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Site
              </Link>
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">1. Add a site</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Enter your landing page URL and we&apos;ll analyze it to extract
                your brand constraints.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">2. Generate variants</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                AI generates optimized headlines, CTAs, and hero images that
                match your brand.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">3. Watch it optimize</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Thompson Sampling automatically allocates traffic to winning
                variants.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Normal dashboard with data
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Overview of your landing page optimization performance.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/sites">
            <Plus className="w-4 h-4 mr-2" />
            Add Site
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sites</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSites}</div>
            <p className="text-xs text-muted-foreground">
              Site{stats.activeSites !== 1 ? "s" : ""} running experiments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVisitors.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all sites
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.avgConversionRate > 0 ? `${stats.avgConversionRate.toFixed(2)}%` : "—"}
            </div>
            <p className="text-xs text-muted-foreground">
              Average across all sites
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Variants</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVariants}</div>
            <p className="text-xs text-muted-foreground">
              Variants being tested
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sites list */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Your Sites</CardTitle>
            <CardDescription>
              Quick overview of all your sites
            </CardDescription>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/dashboard/sites">
              View all
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sites.slice(0, 5).map((site) => {
              let hostname = site.url
              try {
                hostname = new URL(site.url).hostname
              } catch {
                // Use full URL if parsing fails
              }
              return (
                <Link
                  key={site.id}
                  href={`/dashboard/sites/${site.id}`}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                      <Globe className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{hostname}</p>
                      <p className="text-sm text-muted-foreground">
                        {site.variant_count || 0} variant{(site.variant_count || 0) !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Visitors</p>
                      <p className="font-medium">{(site.visitors || 0).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Conv.</p>
                      <p className="font-bold text-emerald-500">
                        {site.conversion_rate ? `${site.conversion_rate.toFixed(1)}%` : "—"}
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
