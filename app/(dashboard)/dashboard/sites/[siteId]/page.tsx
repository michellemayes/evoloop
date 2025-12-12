"use client"

import { useState } from "react"
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

interface Variant {
  id: string
  status: "active" | "pending_review" | "killed"
  patch: {
    headline?: string
    subheadline?: string
    cta?: string
    heroImage?: string
  }
  visitors: number
  conversions: number
  conversionRate: number
  probBest: number
}

type AutonomyMode = "supervised" | "training_wheels" | "full_auto"

export default function SiteDetailPage() {
  const params = useParams()
  const siteId = params.siteId as string

  const [autonomyMode, setAutonomyMode] = useState<AutonomyMode>("training_wheels")
  const [imageGeneration, setImageGeneration] = useState(false)
  const [variants, setVariants] = useState<Variant[]>([])

  const handleApprove = (variantId: string) => {
    // TODO: Call API to approve variant
    console.log("Approving variant:", variantId)
  }

  const handleKill = (variantId: string) => {
    // TODO: Call API to kill variant
    console.log("Killing variant:", variantId)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Site Details</h2>
          <p className="text-muted-foreground">example.com</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Generate Variants
          </Button>
          <Button variant="outline">
            <Pause className="w-4 h-4 mr-2" />
            Pause
          </Button>
          <Button>
            <Play className="w-4 h-4 mr-2" />
            Start Experiment
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
                <Button>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Generate First Variants
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
                onValueChange={(v) => setAutonomyMode(v as AutonomyMode)}
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
                  onCheckedChange={setImageGeneration}
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
              <Button variant="destructive">Delete Site</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
