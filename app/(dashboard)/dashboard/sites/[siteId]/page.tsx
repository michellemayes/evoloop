"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Play,
  Pause,
  RefreshCw,
  Check,
  X,
  TrendingUp,
  Eye,
  Target,
} from "lucide-react"
import { toast } from "sonner"

interface Site {
  id: string
  url: string
  status: "analyzing" | "analyzed" | "running" | "paused"
  autonomy_mode: "supervised" | "training_wheels" | "full_auto"
  approvals_remaining: number
  brand_constraints: Record<string, any>
  image_generation_enabled: boolean
  created_at: string
  updated_at?: string
}

interface VariantStats {
  visitors: number
  conversions: number
  conversion_rate: number
  prob_best: number
}

interface Variant {
  id: string
  status: "active" | "pending_review" | "killed"
  patch: {
    headline?: string
    subheadline?: string
    cta?: string
    heroImage?: string
  }
  stats: VariantStats
  visitors: number // For backwards compatibility
  conversions: number
  conversionRate: number
  probBest: number
}

type AutonomyMode = "supervised" | "training_wheels" | "full_auto"

export default function SiteDetailPage() {
  const params = useParams()
  const siteId = params.siteId as string

  const [site, setSite] = useState<Site | null>(null)
  const [variants, setVariants] = useState<Variant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [updatingStats, setUpdatingStats] = useState(false)

  // Sync local state with site data
  const autonomyMode = site?.autonomy_mode as AutonomyMode || "training_wheels"
  const imageGeneration = site?.image_generation_enabled || false

  useEffect(() => {
    fetchSiteData()
    fetchVariants()
  }, [siteId])

  const fetchSiteData = async () => {
    try {
      const res = await fetch(`/api/sites/${siteId}`)
      if (res.ok) {
        const data = await res.json()
        setSite(data)
      } else {
        setError("Failed to load site data")
      }
    } catch (error) {
      console.error("Failed to fetch site:", error)
      setError("Failed to load site data")
    } finally {
      setLoading(false)
    }
  }

  const fetchVariants = async () => {
    try {
      const res = await fetch(`/api/sites/${siteId}/variants`)
      if (res.ok) {
        const data = await res.json()
        // Transform backend data to match frontend interface
        const transformedVariants = data.map((v: any) => ({
          id: v.id,
          status: v.status,
          patch: v.patch || {},
          stats: v.stats || { visitors: 0, conversions: 0, conversion_rate: 0, prob_best: 0 },
          visitors: v.stats?.visitors || 0,
          conversions: v.stats?.conversions || 0,
          conversionRate: v.stats?.conversion_rate || 0,
          probBest: v.stats?.prob_best || 0,
        }))
        setVariants(transformedVariants)
      }
    } catch (error) {
      console.error("Failed to fetch variants:", error)
    }
  }

  const updateSiteSettings = async (updates: Partial<Site>) => {
    try {
      const res = await fetch(`/api/sites/${siteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (res.ok) {
        const updatedSite = await res.json()
        setSite(updatedSite)
      }
    } catch (error) {
      console.error("Failed to update site:", error)
    }
  }

  const handleGenerateVariants = async () => {
    if (!site) {
      toast.error("Site data not loaded yet.")
      return
    }

    setIsGenerating(true)
    try {
      console.log("Generating variants for site:", siteId, "URL:", site.url)

      // Step 1: First analyze the site to extract brand constraints
      const analyzeRes = await fetch('/api/trigger/analyze-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId: siteId,
          url: site.url,
        }),
      })

      if (!analyzeRes.ok) {
        const errorText = await analyzeRes.text()
        console.error('Analyze site failed:', errorText)
        toast.error("Failed to analyze site.")
        return
      }

      const analyzeResult = await analyzeRes.json()
      console.log('Site analysis completed:', analyzeResult)

      // Step 2: Generate variants using the extracted brand constraints
      const generateRes = await fetch('/api/trigger/generate-variants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId: siteId,
          brandConstraints: analyzeResult.brandConstraints,
          count: 3, // Generate 3 variants
          includeImages: site.image_generation_enabled,
        }),
      })

      if (generateRes.ok) {
        const generateResult = await generateRes.json()
        console.log('Variant generation completed:', generateResult)
        toast.success(`Generated ${generateResult.variantsCreated} variants!`)
        fetchVariants() // Refresh variants list
        fetchSiteData() // Refresh site data (brand constraints, status)
      } else {
        const errorText = await generateRes.text()
        console.error('Generate variants failed:', errorText)
        toast.error("Failed to generate variants.")
      }
    } catch (error) {
      console.error("Failed to generate variants:", error)
      toast.error("Failed to generate variants.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleStartExperiment = async () => {
    setIsStarting(true)
    try {
      // Update site status to running
      await updateSiteSettings({ status: "running" })
      console.log("Experiment started for site:", siteId)
    } catch (error) {
      console.error("Failed to start experiment:", error)
    } finally {
      setIsStarting(false)
    }
  }

  const handlePause = async () => {
    try {
      // Update site status to paused
      await updateSiteSettings({ status: "paused" })
      console.log("Experiment paused for site:", siteId)
    } catch (error) {
      console.error("Failed to pause experiment:", error)
    }
  }

  const handleApprove = async (variantId: string) => {
    try {
      const res = await fetch(`/api/variants/${variantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: "active" }),
      })
      if (res.ok) {
        await fetchVariants() // Refresh variants list
        console.log("Variant approved:", variantId)
      }
    } catch (error) {
      console.error("Failed to approve variant:", error)
    }
  }

  const handleKill = async (variantId: string) => {
    try {
      const res = await fetch(`/api/variants/${variantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: "killed" }),
      })
      if (res.ok) {
        await fetchVariants() // Refresh variants list
        console.log("Variant killed:", variantId)
      }
    } catch (error) {
      console.error("Failed to kill variant:", error)
    }
  }

  const handleUpdateStats = async () => {
    setUpdatingStats(true)
    try {
      const res = await fetch(`/api/sites/${siteId}/stats`, {
        method: 'POST',
      })
      if (res.ok) {
        // Refresh variants to get updated stats
        await fetchVariants()
        console.log("Stats updated successfully")
      }
    } catch (error) {
      console.error("Failed to update stats:", error)
    } finally {
      setUpdatingStats(false)
    }
  }

  const handleDeleteSite = async () => {
    if (!confirm("Are you sure you want to delete this site? This action cannot be undone.")) {
      return
    }

    try {
      const res = await fetch(`/api/sites/${siteId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        // Redirect to sites list
        window.location.href = '/dashboard/sites'
      }
    } catch (error) {
      console.error("Failed to delete site:", error)
    }
  }

  const handleAutonomyModeChange = (mode: AutonomyMode) => {
    updateSiteSettings({ autonomy_mode: mode })
  }

  const handleImageGenerationChange = (enabled: boolean) => {
    updateSiteSettings({ image_generation_enabled: enabled })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Site Details</h2>
          <p className="text-muted-foreground">{new URL(site!.url).hostname}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleGenerateVariants}
            disabled={isGenerating}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Generating...' : 'Generate Variants'}
          </Button>
          <Button
            variant="outline"
            onClick={handleUpdateStats}
            disabled={updatingStats}
          >
            <TrendingUp className={`w-4 h-4 mr-2 ${updatingStats ? 'animate-pulse' : ''}`} />
            {updatingStats ? 'Updating...' : 'Update Stats'}
          </Button>
          <Button variant="outline" onClick={handlePause}>
            <Pause className="w-4 h-4 mr-2" />
            Pause
          </Button>
          <Button onClick={handleStartExperiment} disabled={isStarting}>
            <Play className="w-4 h-4 mr-2" />
            {isStarting ? 'Starting...' : 'Start Experiment'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="variants" className="space-y-4">
        <TabsList>
          <TabsTrigger value="variants">Variants</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="variants" className="space-y-4">
          {variants.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <TrendingUp className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No variants yet</h3>
                <p className="text-muted-foreground text-center mb-4 max-w-md">
                  Click "Generate Variants" to create AI-powered landing page
                  variations based on your site's brand constraints.
                </p>
                <Button
                  onClick={handleGenerateVariants}
                  disabled={isGenerating}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                  {isGenerating ? 'Generating...' : 'Generate First Variants'}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {variants.map((variant) => (
                <Card key={variant.id}>
                  <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {variant.patch.headline || "Untitled Variant"}
                      </CardTitle>
                      <CardDescription>
                        {variant.patch.subheadline}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          variant.status === "active"
                            ? "default"
                            : variant.status === "pending_review"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {variant.status.replace("_", " ")}
                      </Badge>
                      {variant.status === "pending_review" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApprove(variant.id)}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleKill(variant.id)}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-lg font-semibold">
                            {variant.visitors}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Visitors
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-lg font-semibold">
                            {variant.conversions}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Conversions
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-lg font-semibold">
                            {variant.conversionRate.toFixed(1)}%
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Conv. Rate
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-lg font-semibold">
                          {(variant.probBest * 100).toFixed(0)}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Prob. Best
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evolution Timeline</CardTitle>
              <CardDescription>
                Git-like visualization of variant evolution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Timeline visualization coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Statistics</CardTitle>
              <CardDescription>
                Deep dive into experiment performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Statistics charts coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Autonomy Mode</CardTitle>
              <CardDescription>
                Control how much freedom Evoloop has to make changes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                value={autonomyMode}
                onValueChange={handleAutonomyModeChange}
              >
                <SelectTrigger className="w-[300px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="supervised">
                    Supervised - Approve every change
                  </SelectItem>
                  <SelectItem value="training_wheels">
                    Training Wheels - Approve first 5, then auto
                  </SelectItem>
                  <SelectItem value="full_auto">
                    YOLO Mode - Full autonomy
                  </SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Image Generation</CardTitle>
              <CardDescription>
                Enable AI-generated images for variants (additional cost)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Switch
                  id="image-gen"
                  checked={imageGeneration}
                  onCheckedChange={handleImageGenerationChange}
                />
                <Label htmlFor="image-gen">Enable image generation</Label>
              </div>
              {imageGeneration && (
                <p className="text-sm text-muted-foreground mt-2">
                  Estimated cost: ~$0.03 per image generated
                </p>
              )}
            </CardContent>
          </Card>

          <Separator />

          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible actions for this site
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={handleDeleteSite}>
                Delete Site
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
