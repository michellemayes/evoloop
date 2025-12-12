"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { VariantVisualization } from "@/components/landing/variant-visualization"
import { AnimatedSection } from "@/components/landing/animated-section"
import { Code2, Sparkles, Zap, Check, ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="font-semibold text-lg">Evoloop</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/sign-in">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <AnimatedSection>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Autonomous A/B testing powered by AI
            </div>
          </AnimatedSection>
          <AnimatedSection delay={100}>
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-gray-900 mb-6">
              Your landing page,
              <br />
              <span className="text-emerald-500">evolving while you sleep</span>
            </h1>
          </AnimatedSection>
          <AnimatedSection delay={200}>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Add one script. AI generates variants, tests them with Thompson Sampling,
              and continuously optimizes—no babysitting required.
            </p>
          </AnimatedSection>
          <AnimatedSection delay={300}>
            <div className="flex items-center justify-center gap-4">
              <Link href="/auth/sign-up">
                <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 h-12 px-8 text-base">
                  Start for $5
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 text-base"
                onClick={() => document.getElementById('visualization')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Watch it work
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Animated Visualization - NO scroll animation, it has its own internal animations */}
      <section id="visualization" className="py-16 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <VariantVisualization />
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Set it and forget it
              </h2>
              <p className="text-lg text-gray-600">
                Three steps to autonomous optimization
              </p>
            </div>
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg h-full">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
                  <Code2 className="w-6 h-6 text-emerald-600" />
                </div>
                <CardTitle className="text-xl">Add one script tag</CardTitle>
                <CardDescription className="text-base">
                  2-minute setup. Paste our snippet before your closing body tag. That's it.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <code className="text-sm bg-gray-100 px-3 py-2 rounded-lg block text-gray-700 overflow-x-auto">
                  {'<script src="evoloop.js" />'}
                </code>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg h-full">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-emerald-600" />
                </div>
                <CardTitle className="text-xl">AI generates variants</CardTitle>
                <CardDescription className="text-base">
                  We analyze your page, extract brand constraints, and generate optimized
                  headlines, CTAs, and hero images.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-emerald-500" />
                  Respects your brand identity
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg h-full">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-emerald-600" />
                </div>
                <CardTitle className="text-xl">It optimizes itself</CardTitle>
                <CardDescription className="text-base">
                  Thompson Sampling allocates traffic to winners automatically.
                  Losers get retired. New variants evolve from what works.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-emerald-500" />
                  No manual intervention needed
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Simple, transparent pricing
              </h2>
              <p className="text-lg text-gray-600">
                Start small. Scale when you're ready.
              </p>
            </div>
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 border-gray-200 bg-white h-full">
              <CardHeader>
                <CardTitle className="text-xl">Starter</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$5</span>
                  <span className="text-gray-600 ml-2">one-time</span>
                </div>
                <CardDescription className="text-base mt-2">
                  Perfect to try it out
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-emerald-500" />
                    Initial AI credits included
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-emerald-500" />
                    Up to 5 variants
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-emerald-500" />
                    Basic analytics
                  </li>
                </ul>
                <Link href="/auth/sign-up" className="block">
                  <Button className="w-full bg-emerald-500 hover:bg-emerald-600">
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 border-emerald-500 bg-white relative h-full">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-emerald-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                  Most flexible
                </span>
              </div>
              <CardHeader>
                <CardTitle className="text-xl">Pay-as-you-go</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">Usage</span>
                  <span className="text-gray-600 ml-2">based</span>
                </div>
                <CardDescription className="text-base mt-2">
                  Only pay for what you use
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-emerald-500" />
                    Top up credits anytime
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-emerald-500" />
                    Unlimited variants
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-emerald-500" />
                    Full analytics dashboard
                  </li>
                </ul>
                <Link href="/auth/sign-up" className="block">
                  <Button className="w-full bg-emerald-500 hover:bg-emerald-600">
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200 bg-white h-full">
              <CardHeader>
                <CardTitle className="text-xl">Pro</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$49</span>
                  <span className="text-gray-600 ml-2">/month</span>
                </div>
                <CardDescription className="text-base mt-2">
                  For serious optimizers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-emerald-500" />
                    Unlimited everything
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-emerald-500" />
                    Priority variant generation
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-emerald-500" />
                    Advanced stats & exports
                  </li>
                </ul>
                <Link href="/auth/sign-up" className="block">
                  <Button className="w-full" variant="outline">
                    Go Pro
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
          <AnimatedSection delay={300}>
            <p className="text-center text-sm text-gray-500 mt-8">
              Estimated costs: Text variants ~$3-8/mo • Text + images ~$15-40/mo
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <AnimatedSection>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Stop guessing.
              <br />
              <span className="text-emerald-500">Start evolving.</span>
            </h2>
          </AnimatedSection>
          <AnimatedSection delay={100}>
            <p className="text-xl text-gray-600 mb-8">
            Join other founders who let AI optimize their landing pages 24/7.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-emerald-500 flex items-center justify-center">
              <span className="text-white font-bold text-xs">E</span>
            </div>
            <span className="font-medium">Evoloop</span>
          </div>
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Evoloop. Autonomous landing page optimization.
          </p>
        </div>
      </footer>
    </div>
  )
}
