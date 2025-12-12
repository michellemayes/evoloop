"use client"

import { useEffect, useState, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Users, MousePointerClick } from "lucide-react"

interface Variant {
  id: string
  headline: string
  subheadline: string
  cta: string
  conversionRate: number
  visitors: number
  color: string
}

const variants: Variant[] = [
  {
    id: "A",
    headline: "Ship faster with AI",
    subheadline: "Automate your workflow and focus on what matters",
    cta: "Get Started Free",
    conversionRate: 3.2,
    visitors: 1247,
    color: "bg-blue-500",
  },
  {
    id: "B",
    headline: "10x your productivity",
    subheadline: "Join 50,000+ developers who ship faster",
    cta: "Try It Now",
    conversionRate: 4.8,
    visitors: 1183,
    color: "bg-purple-500",
  },
  {
    id: "C",
    headline: "Build without limits",
    subheadline: "The platform that grows with your ambition",
    cta: "Start Building",
    conversionRate: 5.7,
    visitors: 1456,
    color: "bg-emerald-500",
  },
]

export function VariantVisualization() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [stats, setStats] = useState({
    totalVisitors: 3886,
    avgConversion: 4.6,
    lift: 78,
  })
  const [isTransitioning, setIsTransitioning] = useState(false)

  const cycleVariant = useCallback(() => {
    setIsTransitioning(true)
    setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % variants.length)
      setStats((prev) => ({
        totalVisitors: prev.totalVisitors + Math.floor(Math.random() * 50) + 10,
        avgConversion: Math.min(6.5, prev.avgConversion + (Math.random() * 0.2 - 0.05)),
        lift: Math.min(95, prev.lift + Math.floor(Math.random() * 3)),
      }))
      setIsTransitioning(false)
    }, 300)
  }, [])

  useEffect(() => {
    const interval = setInterval(cycleVariant, 3000)
    return () => clearInterval(interval)
  }, [cycleVariant])

  const activeVariant = variants[activeIndex]

  return (
    <div className="relative">
      {/* Section header */}
      <div className="text-center mb-8">
        <Badge variant="outline" className="mb-4 text-emerald-600 border-emerald-200">
          Live Demo
        </Badge>
        <h2 className="text-2xl font-bold text-gray-900">
          Watch variants evolve in real-time
        </h2>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        {/* Mock landing page */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur opacity-20" />
          <div className="relative bg-white rounded-xl shadow-2xl overflow-hidden border">
            {/* Browser chrome */}
            <div className="bg-gray-100 px-4 py-3 border-b flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-white rounded-md px-3 py-1 text-xs text-gray-500 text-center">
                  yoursite.com
                </div>
              </div>
              <Badge className={`${activeVariant.color} text-white text-xs`}>
                Variant {activeVariant.id}
              </Badge>
            </div>

            {/* Page content */}
            <div className="p-8 min-h-[320px]">
              {/* Nav placeholder */}
              <div className="flex items-center justify-between mb-12">
                <div className="w-24 h-6 bg-gray-200 rounded" />
                <div className="flex gap-4">
                  <div className="w-16 h-4 bg-gray-100 rounded" />
                  <div className="w-16 h-4 bg-gray-100 rounded" />
                  <div className="w-16 h-4 bg-gray-100 rounded" />
                </div>
              </div>

              {/* Hero content - this morphs */}
              <div className="text-center space-y-4">
                <h3
                  className={`text-2xl font-bold text-gray-900 transition-all duration-300 ${
                    isTransitioning ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
                  }`}
                >
                  {activeVariant.headline}
                </h3>
                <p
                  className={`text-gray-600 transition-all duration-300 delay-75 ${
                    isTransitioning ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
                  }`}
                >
                  {activeVariant.subheadline}
                </p>
                <button
                  className={`${activeVariant.color} text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 delay-150 ${
                    isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"
                  }`}
                >
                  {activeVariant.cta}
                </button>
              </div>

              {/* Feature placeholders */}
              <div className="grid grid-cols-3 gap-4 mt-12">
                <div className="h-16 bg-gray-50 rounded-lg" />
                <div className="h-16 bg-gray-50 rounded-lg" />
                <div className="h-16 bg-gray-50 rounded-lg" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats panel */}
        <div className="space-y-6">
          {/* Live metrics */}
          <div className="bg-white rounded-xl border shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-semibold text-gray-900">Live Metrics</h4>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-xs text-gray-500">Updating</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Users className="w-5 h-5 text-gray-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {stats.totalVisitors.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">Visitors</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <MousePointerClick className="w-5 h-5 text-gray-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {stats.avgConversion.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">Conversion</div>
              </div>
              <div className="text-center p-4 bg-emerald-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-emerald-600">
                  +{stats.lift}%
                </div>
                <div className="text-xs text-gray-500">Lift vs Original</div>
              </div>
            </div>
          </div>

          {/* Variant performance */}
          <div className="bg-white rounded-xl border shadow-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Variant Performance</h4>
            <div className="space-y-3">
              {variants.map((variant, index) => (
                <div
                  key={variant.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    index === activeIndex
                      ? "bg-emerald-50 ring-1 ring-emerald-200"
                      : "bg-gray-50"
                  }`}
                >
                  <Badge className={`${variant.color} text-white`}>
                    {variant.id}
                  </Badge>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {variant.headline}
                    </div>
                    <div className="text-xs text-gray-500">
                      {variant.visitors.toLocaleString()} visitors
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900">
                      {variant.conversionRate}%
                    </div>
                    {index === 2 && (
                      <Badge variant="outline" className="text-emerald-600 border-emerald-200 text-xs">
                        Winner
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Thompson Sampling visualization */}
          <div className="bg-white rounded-xl border shadow-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Traffic Allocation</h4>
            <div className="space-y-3">
              {variants.map((variant) => {
                const allocation =
                  variant.id === "C" ? 55 : variant.id === "B" ? 30 : 15
                return (
                  <div key={variant.id} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Variant {variant.id}</span>
                      <span className="font-medium">{allocation}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${variant.color} transition-all duration-1000`}
                        style={{ width: `${allocation}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Thompson Sampling automatically shifts traffic to better-performing variants
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
