"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  TrendingUp,
  Users,
  MousePointerClick,
  Globe,
  Plus,
  Loader2
} from "lucide-react"

interface Site {
  id: string
  url: string
  variant_count?: number
  visitors?: number
  conversions?: number
  conversion_rate?: number
}

interface Variant {
  id: string
  site_id: string
  site_url?: string
  headline?: string
  impressions: number
  conversions: number
  conversion_rate: number
}

export default function AnalyticsPage() {
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await fetch("/api/sites")
      if (res.ok) {
        const data = await res.json()
        setSites(Array.isArray(data) ? data : (data.sites || []))
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate aggregate stats from real data
  const stats = {
    totalVisitors: sites.reduce((sum, site) => sum + (site.visitors || 0), 0),
    totalConversions: sites.reduce((sum, site) => sum + (site.conversions || 0), 0),
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

  // Empty state
  if (sites.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">
            Track performance across all your sites and experiments.
          </p>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BarChart3 className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No analytics data yet</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Add your first site and start running experiments to see analytics data here.
            </p>
            <Button asChild>
              <Link href="/dashboard/sites">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Site
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
        <p className="text-muted-foreground">
          Track performance across all your sites and experiments.
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVisitors.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across {sites.length} site{sites.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalConversions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Total successful conversions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Conversion Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
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
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVariants}</div>
            <p className="text-xs text-muted-foreground">
              Being tested
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sites Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Site Performance</CardTitle>
          <CardDescription>
            Performance breakdown by site
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sites.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No sites yet. Add a site to start tracking performance.
            </p>
          ) : (
            <div className="space-y-4">
              {sites.map((site) => {
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
                        <p className="text-sm text-muted-foreground">Conv. Rate</p>
                        <p className="font-bold text-emerald-500">
                          {site.conversion_rate ? `${site.conversion_rate.toFixed(2)}%` : "—"}
                        </p>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
