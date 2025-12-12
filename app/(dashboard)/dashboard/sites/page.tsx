"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Globe, ExternalLink, MoreVertical, Loader2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Site {
  id: string
  url: string
  status: "analyzing" | "analyzed" | "running" | "paused"
  autonomy_mode: "supervised" | "training_wheels" | "full_auto"
  variant_count?: number
  visitors?: number
  conversion_rate?: number
}

export default function SitesPage() {
  const { data: session } = useSession()
  const [sites, setSites] = useState<Site[]>([])
  const [newSiteUrl, setNewSiteUrl] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchSites()
  }, [])

  const fetchSites = async () => {
    try {
      const res = await fetch("/api/sites")
      if (res.ok) {
        const data = await res.json()
        setSites(data)
      }
    } catch (error) {
      console.error("Failed to fetch sites:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddSite = async () => {
    if (!newSiteUrl) return
    setCreating(true)
    try {
      const res = await fetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: newSiteUrl }),
      })
      if (res.ok) {
        const newSite = await res.json()
        setSites([...sites, newSite])
        setNewSiteUrl("")
        setIsDialogOpen(false)
      }
    } catch (error) {
      console.error("Failed to create site:", error)
    } finally {
      setCreating(false)
    }
  }

  const getStatusColor = (status: Site["status"]) => {
    switch (status) {
      case "running":
        return "bg-green-500"
      case "analyzing":
        return "bg-yellow-500"
      case "analyzed":
        return "bg-blue-500"
      case "paused":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Sites</h2>
          <p className="text-muted-foreground">
            Manage your landing pages and experiments.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Site
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Site</DialogTitle>
              <DialogDescription>
                Enter your landing page URL to start optimizing it with Evoloop.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="url">Landing Page URL</Label>
                <Input
                  id="url"
                  placeholder="https://example.com/landing"
                  value={newSiteUrl}
                  onChange={(e) => setNewSiteUrl(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddSite} disabled={creating}>
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Site"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {sites.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Globe className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No sites yet</h3>
            <p className="text-muted-foreground text-center mb-4 max-w-md">
              Add your first landing page to start generating and testing
              AI-powered variants automatically.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Site
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sites.map((site) => (
            <Card key={site.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="space-y-1">
                  <CardTitle className="text-base font-medium">
                    <Link
                      href={`/dashboard/sites/${site.id}`}
                      className="hover:underline"
                    >
                      {new URL(site.url).hostname}
                    </Link>
                  </CardTitle>
                  <CardDescription className="text-xs truncate max-w-[200px]">
                    {site.url}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={`${getStatusColor(site.status)} text-white`}
                  >
                    {site.status}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Visit Site
                      </DropdownMenuItem>
                      <DropdownMenuItem>Pause</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">{site.variant_count ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Variants</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{site.visitors ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Visitors</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{(site.conversion_rate ?? 0).toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">Conv. Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
