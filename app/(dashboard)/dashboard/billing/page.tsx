"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  CreditCard,
  Zap,
  Check,
  ExternalLink
} from "lucide-react"

export default function BillingPage() {
  const plans = [
    {
      name: "Starter",
      price: "$5",
      period: "one-time",
      description: "Perfect to try it out",
      features: ["Initial AI credits included", "Up to 5 variants", "Basic analytics"],
      highlighted: false,
    },
    {
      name: "Pay-as-you-go",
      price: "Usage",
      period: "based",
      description: "Only pay for what you use",
      features: ["Top up credits anytime", "Unlimited variants", "Full analytics dashboard"],
      highlighted: true,
    },
    {
      name: "Pro",
      price: "$49",
      period: "/month",
      description: "For serious optimizers",
      features: ["Unlimited everything", "Priority variant generation", "Advanced stats & exports"],
      highlighted: false,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Billing</h2>
        <p className="text-muted-foreground">
          Manage your subscription and credits.
        </p>
      </div>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Account Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100">
                <Zap className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold">Free Trial</p>
                <p className="text-sm text-muted-foreground">
                  You&apos;re currently on the free trial
                </p>
              </div>
            </div>
            <Badge variant="secondary">Active</Badge>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            Upgrade to a paid plan to unlock all features and start optimizing your landing pages.
          </p>
        </CardFooter>
      </Card>

      {/* Pricing Plans */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Choose a Plan</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={plan.highlighted ? "border-emerald-500 border-2 relative" : ""}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-emerald-500">Most Flexible</Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-1">{plan.period}</span>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.highlighted ? "default" : "outline"}
                >
                  {plan.highlighted ? "Get Started" : "Choose Plan"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Cost Estimates */}
      <Card>
        <CardHeader>
          <CardTitle>Estimated Costs</CardTitle>
          <CardDescription>
            What you can expect to pay based on usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="font-medium mb-1">Text Variants Only</p>
              <p className="text-2xl font-bold text-emerald-600">~$3-8/mo</p>
              <p className="text-sm text-muted-foreground mt-1">
                Headlines, subheadlines, and CTAs
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="font-medium mb-1">Text + Images</p>
              <p className="text-2xl font-bold text-emerald-600">~$15-40/mo</p>
              <p className="text-sm text-muted-foreground mt-1">
                Full variant generation with hero images
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2">
          <p className="text-sm text-muted-foreground">
            Costs depend on the number of variants generated and traffic volume.
          </p>
          <Button variant="link" className="p-0 h-auto" asChild>
            <a href="https://evoloop.ai/pricing" target="_blank" rel="noopener noreferrer">
              View detailed pricing
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
