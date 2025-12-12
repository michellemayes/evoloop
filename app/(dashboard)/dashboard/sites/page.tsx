"use client"

import { useState } from "react"
import Link from "next/link"
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
import { Plus, Globe, ExternalLink, MoreVertical } from "lucide-react"
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
  autonomyMode: "supervised" | "training_wheels" | "full_auto"
  variantCount: number
  visitors: number
  conversionRate: number
}

export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([])
  const [newSiteUrl, setNewSiteUrl] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleAddSite = async () => {
    // TODO: Call API to create site
    console.log("Adding site:", newSiteUrl)
    setNewSiteUrl("")
    setIsDialogOpen(false)
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
              <Button onClick={handleAddSite}>Add Site</Button>
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
                    <p className="text-2xl font-bold">{site.variantCount}</p>
                    <p className="text-xs text-muted-foreground">Variants</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{site.visitors}</p>
                    <p className="text-xs text-muted-foreground">Visitors</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{site.conversionRate}%</p>
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
