"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  CreditCard,
  Zap,
  Check,
  Plus,
  Receipt,
  AlertCircle
} from "lucide-react"

export default function BillingPage() {
  const [credits, setCredits] = useState({
    remaining: 2450,
    total: 5000,
    percentUsed: 51,
  })

  const currentPlan = {
    name: "Pay-as-you-go",
    description: "Only pay for what you use",
  }

  const usageHistory = [
    { date: "Dec 10, 2025", description: "Variant generation (3 variants)", amount: -150 },
    { date: "Dec 8, 2025", description: "Image generation (2 images)", amount: -200 },
    { date: "Dec 5, 2025", description: "Site analysis", amount: -50 },
    { date: "Dec 1, 2025", description: "Credits purchased", amount: 1000 },
  ]

  const plans = [
    {
      name: "Starter",
      price: "$5",
      period: "one-time",
      description: "Perfect to try it out",
      features: ["Initial AI credits included", "Up to 5 variants", "Basic analytics"],
      current: false,
    },
    {
      name: "Pay-as-you-go",
      price: "Usage",
      period: "based",
      description: "Only pay for what you use",
      features: ["Top up credits anytime", "Unlimited variants", "Full analytics dashboard"],
      current: true,
    },
    {
      name: "Pro",
      price: "$49",
      period: "/month",
      description: "For serious optimizers",
      features: ["Unlimited everything", "Priority variant generation", "Advanced stats & exports"],
      current: false,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Billing</h2>
        <p className="text-muted-foreground">
          Manage your credits and subscription.
        </p>
      </div>

      {/* Credits Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              AI Credits
            </CardTitle>
            <CardDescription>
              Credits are used for variant generation and analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-4xl font-bold">{credits.remaining.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">credits remaining</p>
              </div>
              <p className="text-sm text-muted-foreground">
                of {credits.total.toLocaleString()} total
              </p>
            </div>
            <Progress value={100 - credits.percentUsed} className="h-2" />
            {credits.remaining < 500 && (
              <div className="flex items-center gap-2 text-yellow-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                Running low on credits
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Buy More Credits
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Current Plan
            </CardTitle>
            <CardDescription>
              {currentPlan.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-emerald-900">{currentPlan.name}</p>
                  <Badge className="bg-emerald-500">Active</Badge>
                </div>
                <p className="text-sm text-emerald-700">{currentPlan.description}</p>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Estimated costs this month:</p>
                <p className="text-lg font-semibold text-foreground">~$12.50</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              Change Plan
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Usage History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Usage History
          </CardTitle>
          <CardDescription>
            Recent credit transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {usageHistory.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 border-b last:border-0"
              >
                <div>
                  <p className="font-medium">{item.description}</p>
                  <p className="text-sm text-muted-foreground">{item.date}</p>
                </div>
                <p className={`font-semibold ${item.amount > 0 ? "text-emerald-500" : "text-muted-foreground"}`}>
                  {item.amount > 0 ? "+" : ""}{item.amount} credits
                </p>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="ghost" className="w-full">
            View All Transactions
          </Button>
        </CardFooter>
      </Card>

      {/* Available Plans */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Available Plans</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.name} className={plan.current ? "border-emerald-500 border-2" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{plan.name}</CardTitle>
                  {plan.current && <Badge className="bg-emerald-500">Current</Badge>}
                </div>
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
                      <Check className="h-4 w-4 text-emerald-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.current ? "outline" : "default"}
                  disabled={plan.current}
                >
                  {plan.current ? "Current Plan" : "Upgrade"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
