# Evoloop Presentation Design

## Overview

A 10-15 minute Reveal.js presentation showcasing Evoloop, the autonomous landing page optimization engine. Designed for a mixed audience (business + technical), combining product demo with technical deep-dive.

## Presentation Details

| Aspect | Decision |
|--------|----------|
| **Audience** | Mixed (business + technical) |
| **Goal** | Product demo + technical deep-dive hybrid |
| **Duration** | 10-15 minutes |
| **Slides** | 14 slides |
| **Framework** | Reveal.js |
| **Style** | Light mode, landing-page-quality polish |

## Visual Design

### Color Palette (Light Mode)
- Primary background: Clean white/off-white
- Secondary backgrounds: Soft grays for contrast sections
- Accent: Vibrant primary color for CTAs, highlights, key data
- Text: Deep charcoal/near-black for readability
- Subtle gradients: Soft color washes to add depth

### Typography
- Headlines: Bold, punchy - large enough to command attention
- Body: Clean and airy with generous line height
- Code: Monospace in subtle rounded containers

### Visual Elements
- Device mockups with soft shadows (floating effect)
- Architecture diagram with rounded nodes, soft connecting lines
- Competitor matrix with icons
- Data visualizations with smooth curves and gradient fills
- Stack diagram as modern "card" layers with subtle depth

### Reveal.js Features
- **Fragments** - Build up complex diagrams piece by piece
- **Vertical slides** - Nest related content
- **Code highlighting** - Step through code with line-by-line focus
- **Transitions** - Smooth, subtle (slide or fade)

## Slide Structure

### Slide 1: Hook
- **Headline:** "What if your landing page optimized itself?"
- **Subtext:** None - let the question land
- **Visual:** Subtle animated loop icon or abstract "evolution" graphic

### Slide 2: Why Landing Pages Matter
- **Headline:** "Your landing page is the multiplier"
- **Content (fragments):**
  - "You pay for every visitor" (ad spend, SEO effort, content marketing)
  - "Your landing page decides if that investment converts"
  - "A 1% lift compounds into thousands of dollars"
- **Visual:** Simple funnel graphic: Traffic → Landing Page → Conversions

### Slide 3: The Math
- **Headline:** "Small changes, massive impact"
- **Content (animated build):**
  - 10,000 monthly visitors
  - 2% conversion → 200 customers
  - 3% conversion → 300 customers
  - **+50% more revenue from 1% lift**
- **Visual:** Numbers animating up

### Slide 4: The Problem
- **Headline:** "But most founders never optimize"
- **Content (fragments):**
  - "A/B testing tools are complex and expensive"
  - "You need traffic, time, and statistical knowledge"
  - "So you guess once and hope for the best"
- **Visual:** Abandoned test dashboard or "TODO: optimize later" aesthetic

### Slide 5: Why Now?
- **Headline:** "The timing is perfect"
- **Content (two columns):**
  - **LLMs got cheap** - "GPT-4 level output at 1/10th the cost"
  - **Solo founders need leverage** - "One person doing the work of a growth team"
- **Visual:** Trend lines showing cost dropping, founder productivity rising

### Slide 6: The Landscape
- **Headline:** "You've had to choose"
- **Content (two columns):**
  - **A/B Testing Tools** (Optimizely, VWO): "You write the variants. You wait weeks. You interpret stats."
  - **AI Landing Page Builders** (Unbounce, Instapage): "They generate pages. You still test manually."
- **Bottom:** Evoloop logo - "What if you didn't have to choose?"

### Slide 7: The Solution
- **Headline:** "Evoloop: Autonomous optimization"
- **Content (three beats):**
  - "Drop in one script tag"
  - "We extract your brand, generate variants, run experiments"
  - "Your page evolves based on what converts"
- **Visual:** Animated loop: Analyze → Generate → Test → Learn → Repeat
- **Tagline:** "Set it. Forget it. Watch it improve."

### Slide 8: The Autonomy Spectrum
- **Headline:** "You control how much control you give up"
- **Content (left to right):**
  - **Supervised** - "Review every variant before it goes live"
  - **Training Wheels** - "Auto-publish within brand guardrails, alerts on big changes"
  - **Full Auto** - "Total autonomy. Just watch the numbers climb."
- **Visual:** Slider or spectrum graphic
- **Subtext:** "Start supervised. Build trust. Go full auto when you're ready."

### Slide 9: Onboarding Flow
- **Headline:** "Up and running in 3 steps"
- **Content (vertical stack or fragments):**
  1. **Paste your URL** - "We scrape your page and extract brand constraints"
     - Visual: Input field, extracted colors/fonts/tone preview
  2. **Set your conversion goal** - "Click, form submit, or URL-based"
     - Visual: Goal type selector UI
  3. **Install the script** - "One line in your `<head>`, anti-flicker built in"
     - Visual: Code snippet
- **Bottom:** "First variants generated automatically. Experiment starts immediately."

### Slide 10: Dashboard Tour
- **Headline:** "See what matters, dive deeper when you want"
- **Content (vertical stack or tabs):**
  1. **Minimal View** - "Current status at a glance: best performer, lift, confidence"
     - Screenshot: Clean card with key metric
  2. **Timeline View** - "Git-log style history of your experiment's evolution"
     - Screenshot: Chronological variant list
  3. **Stats Deep-Dive** - "Posterior distributions, credible intervals, probability of best"
     - Screenshot: Beta distribution charts

### Slide 11: Under The Hood
- **Headline:** "How the pieces connect"
- **Content (animated build):**
  1. **Runtime Script** (edge) → serves variants, tracks events
  2. **Next.js Frontend** → dashboard, onboarding UI
  3. **FastAPI Backend** → API routes, business logic
  4. **Neon Postgres** → users, sites, variants, experiment stats
  5. **Trigger.dev Jobs** → scraping, variant generation, stat updates
  6. **External APIs** → OpenRouter (LLM), Nano Banana (images)
- **Visual:** Architecture diagram with arrows showing data flow

### Slide 12: Thompson Sampling
- **Headline:** "Smarter than A/B testing"
- **Content:**
  - "Traditional A/B: Split traffic 50/50, wait weeks"
  - "Thompson Sampling: Send more traffic to winners automatically"
  - "Learns faster. Wastes less traffic. Statistically rigorous."
- **Visual:** Two beta distribution curves, traffic allocation shifting
- **Bottom:** "95% credible intervals. Not gut feelings."

### Slide 13: The Tech Stack
- **Headline:** "Built with modern, boring technology"
- **Content (layered cards or grid):**
  - **Frontend**: Next.js 16, React 19, shadcn/ui, Tailwind
  - **Backend**: Python, FastAPI, SQLAlchemy 2.0
  - **Database**: Neon Postgres
  - **Jobs**: Trigger.dev
  - **Infra**: Vercel (edge + serverless)
- **Subtext:** "Proven tools. No exotic dependencies."

### Slide 14: What's Next
- **Headline:** "Start evolving"
- **CTA options (pick one):**
  - Early access: "Join the beta → [link]"
  - Learn more: "See it in action → [demo link]"
  - Connect: "Let's talk → [contact]"
- **Visual:** Callback to evolution loop from slide 7

## Key Themes

1. **Why landing pages matter** - Establish the stakes before presenting the problem
2. **"Why now?" timing** - LLM costs dropping, solo founders need automation
3. **Autonomy spectrum** - Build trust gradually (Supervised → Training Wheels → Full Auto)
4. **Visual polish** - Landing-page-quality design that sells while it explains

## Competitor Comparison Points

### A/B Testing Tools (Optimizely, VWO, Google Optimize, AB Tasty)
- Pros: Statistical rigor, enterprise-grade
- Cons: Complex setup, expensive, you write all variants, requires traffic and time

### AI Landing Page Builders (Unbounce Smart Traffic, Instapage, Leadpages)
- Pros: AI-assisted generation, easy to use
- Cons: Still requires manual testing, no continuous evolution

### Evoloop Differentiation
- Combines generation AND testing
- Fully autonomous (with trust controls)
- Lightweight script tag installation
- Thompson Sampling for faster learning
- Continuous evolution, not one-time optimization
