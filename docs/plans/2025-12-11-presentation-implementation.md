# Evoloop Presentation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a beautiful 14-slide Reveal.js presentation showcasing Evoloop's autonomous landing page optimization engine.

**Architecture:** Static HTML presentation using Reveal.js CDN, custom CSS for light mode landing-page aesthetic, organized in `/presentation` directory with assets subfolder.

**Tech Stack:** Reveal.js 5.x (CDN), HTML5, CSS3, optional: live-server for local preview

---

## Task 1: Initialize Presentation Directory Structure

**Files:**
- Create: `presentation/index.html`
- Create: `presentation/css/custom.css`
- Create: `presentation/assets/.gitkeep`

**Step 1: Create directory structure**

```bash
mkdir -p presentation/css presentation/assets
touch presentation/assets/.gitkeep
```

**Step 2: Create base HTML with Reveal.js CDN**

Create `presentation/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Evoloop - Autonomous Landing Page Optimization</title>

  <!-- Reveal.js CSS -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/dist/reveal.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/dist/theme/white.css">

  <!-- Highlight.js for code -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/plugin/highlight/monokai.css">

  <!-- Custom styles -->
  <link rel="stylesheet" href="css/custom.css">

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body>
  <div class="reveal">
    <div class="slides">
      <!-- Slides will go here -->
      <section>
        <h1>Evoloop</h1>
        <p>Presentation loading...</p>
      </section>
    </div>
  </div>

  <!-- Reveal.js -->
  <script src="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/dist/reveal.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/plugin/highlight/highlight.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/plugin/notes/notes.js"></script>

  <script>
    Reveal.initialize({
      hash: true,
      slideNumber: true,
      transition: 'slide',
      backgroundTransition: 'fade',
      plugins: [RevealHighlight, RevealNotes]
    });
  </script>
</body>
</html>
```

**Step 3: Create base custom CSS**

Create `presentation/css/custom.css`:

```css
/* ============================================
   Evoloop Presentation - Custom Styles
   Light mode, landing-page-quality polish
   ============================================ */

:root {
  /* Colors */
  --color-background: #ffffff;
  --color-background-alt: #f8fafc;
  --color-text: #1e293b;
  --color-text-muted: #64748b;
  --color-primary: #6366f1;
  --color-primary-light: #818cf8;
  --color-accent: #f472b6;
  --color-success: #22c55e;
  --color-warning: #f59e0b;

  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  /* Spacing */
  --space-xs: 0.5rem;
  --space-sm: 1rem;
  --space-md: 2rem;
  --space-lg: 4rem;
  --space-xl: 6rem;
}

/* Base Reveal overrides */
.reveal {
  font-family: var(--font-sans);
  font-size: 42px;
  color: var(--color-text);
}

.reveal .slides {
  text-align: left;
}

.reveal .slides section {
  padding: var(--space-lg);
}

/* Typography */
.reveal h1, .reveal h2, .reveal h3 {
  font-family: var(--font-sans);
  font-weight: 700;
  color: var(--color-text);
  text-transform: none;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.reveal h1 {
  font-size: 2.5em;
  font-weight: 800;
}

.reveal h2 {
  font-size: 1.8em;
  margin-bottom: var(--space-md);
}

.reveal h3 {
  font-size: 1.3em;
  color: var(--color-text-muted);
}

.reveal p {
  line-height: 1.6;
  margin-bottom: var(--space-sm);
}

/* Accent text */
.reveal .highlight {
  color: var(--color-primary);
}

.reveal .muted {
  color: var(--color-text-muted);
}

/* Lists */
.reveal ul, .reveal ol {
  margin-left: 0;
  padding-left: 1.5em;
}

.reveal li {
  margin-bottom: var(--space-xs);
  line-height: 1.5;
}

/* Code blocks */
.reveal pre {
  background: var(--color-background-alt);
  border-radius: 12px;
  padding: var(--space-sm);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  font-size: 0.55em;
  width: 100%;
  margin: var(--space-sm) 0;
}

.reveal code {
  font-family: var(--font-mono);
}

.reveal p code {
  background: var(--color-background-alt);
  padding: 0.2em 0.4em;
  border-radius: 6px;
  font-size: 0.85em;
}

/* Slide backgrounds */
.reveal .slides section[data-background-color] {
  color: white;
}

/* Fragment animations */
.reveal .fragment.fade-up {
  transform: translateY(20px);
  opacity: 0;
}

.reveal .fragment.fade-up.visible {
  transform: translateY(0);
  opacity: 1;
}

/* Custom components */
.card {
  background: var(--color-background);
  border-radius: 16px;
  padding: var(--space-md);
  box-shadow: 0 10px 40px -10px rgb(0 0 0 / 0.1);
  border: 1px solid #e2e8f0;
}

.badge {
  display: inline-block;
  background: var(--color-primary);
  color: white;
  padding: 0.25em 0.75em;
  border-radius: 9999px;
  font-size: 0.6em;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Grid layouts */
.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
  align-items: start;
}

.grid-3 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: var(--space-md);
  align-items: start;
}

/* Centered slides */
.reveal .slides section.center {
  text-align: center;
}

.reveal .slides section.center h1,
.reveal .slides section.center h2 {
  margin-left: auto;
  margin-right: auto;
}

/* Tagline style */
.tagline {
  font-size: 1.4em;
  font-weight: 500;
  color: var(--color-text-muted);
  margin-top: var(--space-md);
}

/* Stats/numbers */
.stat {
  font-size: 3em;
  font-weight: 800;
  color: var(--color-primary);
  line-height: 1;
}

.stat-label {
  font-size: 0.9em;
  color: var(--color-text-muted);
  margin-top: var(--space-xs);
}

/* Comparison table */
.comparison {
  width: 100%;
  border-collapse: collapse;
}

.comparison th,
.comparison td {
  padding: var(--space-sm);
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.comparison th {
  font-weight: 600;
  color: var(--color-text-muted);
  font-size: 0.8em;
}

/* Icon placeholders */
.icon {
  width: 48px;
  height: 48px;
  background: var(--color-primary);
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  margin-bottom: var(--space-sm);
}

/* Spectrum/slider visualization */
.spectrum {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  background: var(--color-background-alt);
  padding: var(--space-sm) var(--space-md);
  border-radius: 9999px;
  margin: var(--space-md) 0;
}

.spectrum-item {
  flex: 1;
  text-align: center;
  padding: var(--space-sm);
  border-radius: 9999px;
  font-size: 0.7em;
  font-weight: 600;
  transition: all 0.3s ease;
}

.spectrum-item.active {
  background: var(--color-primary);
  color: white;
}

/* Architecture diagram placeholder */
.architecture-box {
  background: var(--color-background-alt);
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: var(--space-sm) var(--space-md);
  text-align: center;
  font-weight: 600;
  font-size: 0.8em;
}

.architecture-arrow {
  color: var(--color-primary);
  font-size: 1.5em;
  margin: var(--space-xs) 0;
}

/* Slide-specific styles */
.slide-hook h1 {
  font-size: 2.8em;
  max-width: 12ch;
}

.slide-cta {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
}

.slide-cta h2,
.slide-cta p {
  color: white;
}
```

**Step 4: Verify structure and commit**

```bash
ls -la presentation/
git add presentation/
git commit -m "feat(presentation): initialize Reveal.js structure with custom CSS"
```

---

## Task 2: Build Slides 1-3 (Hook & Why Landing Pages Matter)

**Files:**
- Modify: `presentation/index.html`

**Step 1: Replace placeholder slide with slides 1-3**

In `presentation/index.html`, replace the slides div content:

```html
<div class="slides">

  <!-- Slide 1: Hook -->
  <section class="center slide-hook">
    <h1>What if your landing page <span class="highlight">optimized itself?</span></h1>
    <aside class="notes">
      Pause. Let them think about it. This is the central question.
    </aside>
  </section>

  <!-- Slide 2: Why Landing Pages Matter -->
  <section>
    <h2>Your landing page is the <span class="highlight">multiplier</span></h2>
    <div style="margin-top: var(--space-lg);">
      <p class="fragment fade-up" style="font-size: 1.1em;">
        <strong>You pay for every visitor</strong><br>
        <span class="muted">Ad spend. SEO effort. Content marketing. It all costs.</span>
      </p>
      <p class="fragment fade-up" style="font-size: 1.1em; margin-top: var(--space-md);">
        <strong>Your landing page decides if that converts</strong><br>
        <span class="muted">Same traffic. Wildly different outcomes.</span>
      </p>
      <p class="fragment fade-up" style="font-size: 1.1em; margin-top: var(--space-md);">
        <strong>A 1% lift compounds into thousands</strong><br>
        <span class="muted">Small changes. Massive impact.</span>
      </p>
    </div>
    <aside class="notes">
      Traffic is the cost, conversion is the return, landing page is the lever.
    </aside>
  </section>

  <!-- Slide 3: The Math -->
  <section class="center">
    <h2>Small changes, <span class="highlight">massive impact</span></h2>
    <div style="margin-top: var(--space-lg);">
      <p class="muted" style="font-size: 0.9em;">10,000 monthly visitors</p>
      <div class="grid-2" style="max-width: 600px; margin: var(--space-md) auto;">
        <div class="card fragment fade-up">
          <div class="stat">2%</div>
          <div class="stat-label">conversion rate</div>
          <p style="margin-top: var(--space-sm); font-size: 0.8em;"><strong>200</strong> customers</p>
        </div>
        <div class="card fragment fade-up">
          <div class="stat" style="color: var(--color-success);">3%</div>
          <div class="stat-label">conversion rate</div>
          <p style="margin-top: var(--space-sm); font-size: 0.8em;"><strong>300</strong> customers</p>
        </div>
      </div>
      <p class="fragment fade-up tagline" style="margin-top: var(--space-md);">
        <strong>+50% more revenue</strong> from just 1% lift
      </p>
    </div>
    <aside class="notes">
      This is the "aha" moment for non-technical folks. Keep numbers simple.
    </aside>
  </section>

</div>
```

**Step 2: Preview in browser**

```bash
# Option A: Use Python's built-in server
cd presentation && python3 -m http.server 8000

# Option B: Just open the file directly
open presentation/index.html
```

**Step 3: Commit progress**

```bash
git add presentation/index.html
git commit -m "feat(presentation): add hook and landing page importance slides (1-3)"
```

---

## Task 3: Build Slides 4-6 (Problem, Why Now, Landscape)

**Files:**
- Modify: `presentation/index.html`

**Step 1: Add slides 4-6 after slide 3**

Add after the closing `</section>` of slide 3:

```html
  <!-- Slide 4: The Problem -->
  <section>
    <h2>But most founders <span class="highlight">never optimize</span></h2>
    <div style="margin-top: var(--space-lg);">
      <p class="fragment fade-up" style="font-size: 1.1em;">
        <strong>A/B testing tools are complex and expensive</strong><br>
        <span class="muted">Enterprise pricing. Steep learning curves.</span>
      </p>
      <p class="fragment fade-up" style="font-size: 1.1em; margin-top: var(--space-md);">
        <strong>You need traffic, time, and statistical knowledge</strong><br>
        <span class="muted">Weeks to reach significance. P-values to interpret.</span>
      </p>
      <p class="fragment fade-up" style="font-size: 1.1em; margin-top: var(--space-md);">
        <strong>So you guess once and hope for the best</strong><br>
        <span class="muted">Ship it. Move on. Leave money on the table.</span>
      </p>
    </div>
    <aside class="notes">
      Relatable frustration - they've felt this pain.
    </aside>
  </section>

  <!-- Slide 5: Why Now? -->
  <section>
    <h2>The timing is <span class="highlight">perfect</span></h2>
    <div class="grid-2" style="margin-top: var(--space-lg);">
      <div class="card fragment fade-up">
        <div class="icon">📉</div>
        <h3 style="margin-bottom: var(--space-xs);">LLMs got cheap</h3>
        <p class="muted" style="font-size: 0.8em;">
          GPT-4 level output at 1/10th the cost. What was impossible is now affordable.
        </p>
      </div>
      <div class="card fragment fade-up">
        <div class="icon">🚀</div>
        <h3 style="margin-bottom: var(--space-xs);">Solo founders need leverage</h3>
        <p class="muted" style="font-size: 0.8em;">
          One person doing the work of a growth team. Automation, not more tools.
        </p>
      </div>
    </div>
    <aside class="notes">
      This answers "why didn't this exist before?"
    </aside>
  </section>

  <!-- Slide 6: The Landscape -->
  <section>
    <h2>You've had to <span class="highlight">choose</span></h2>
    <div class="grid-2" style="margin-top: var(--space-lg);">
      <div class="fragment fade-up">
        <h3 style="color: var(--color-text-muted); font-size: 0.9em; margin-bottom: var(--space-sm);">A/B Testing Tools</h3>
        <p style="font-size: 0.85em; margin-bottom: var(--space-xs);"><span class="muted">Optimizely, VWO, AB Tasty</span></p>
        <ul style="font-size: 0.75em; color: var(--color-text-muted);">
          <li>You write all the variants</li>
          <li>You wait weeks for results</li>
          <li>You interpret the statistics</li>
        </ul>
      </div>
      <div class="fragment fade-up">
        <h3 style="color: var(--color-text-muted); font-size: 0.9em; margin-bottom: var(--space-sm);">AI Landing Page Builders</h3>
        <p style="font-size: 0.85em; margin-bottom: var(--space-xs);"><span class="muted">Unbounce, Instapage, Leadpages</span></p>
        <ul style="font-size: 0.75em; color: var(--color-text-muted);">
          <li>They generate pages for you</li>
          <li>You still test manually</li>
          <li>No continuous optimization</li>
        </ul>
      </div>
    </div>
    <p class="fragment fade-up tagline" style="text-align: center; margin-top: var(--space-lg);">
      What if you didn't have to choose?
    </p>
    <aside class="notes">
      Set up the gap that Evoloop fills.
    </aside>
  </section>
```

**Step 2: Preview and verify**

Refresh browser at `http://localhost:8000` or reopen `presentation/index.html`

**Step 3: Commit**

```bash
git add presentation/index.html
git commit -m "feat(presentation): add problem, timing, and landscape slides (4-6)"
```

---

## Task 4: Build Slides 7-8 (Solution & Autonomy Spectrum)

**Files:**
- Modify: `presentation/index.html`

**Step 1: Add slides 7-8**

Add after slide 6:

```html
  <!-- Slide 7: The Solution -->
  <section data-background-color="#6366f1" class="center">
    <h2 style="color: white;">Evoloop</h2>
    <p style="color: rgba(255,255,255,0.9); font-size: 1.2em; margin-top: var(--space-sm);">
      Autonomous landing page optimization
    </p>
    <div style="margin-top: var(--space-lg); color: rgba(255,255,255,0.95);">
      <p class="fragment fade-up" style="font-size: 1em; margin-bottom: var(--space-sm);">
        <strong>Drop in one script tag</strong>
      </p>
      <p class="fragment fade-up" style="font-size: 1em; margin-bottom: var(--space-sm);">
        <strong>We extract your brand, generate variants, run experiments</strong>
      </p>
      <p class="fragment fade-up" style="font-size: 1em;">
        <strong>Your page evolves based on what converts</strong>
      </p>
    </div>
    <p class="fragment fade-up" style="margin-top: var(--space-lg); font-size: 0.9em; color: rgba(255,255,255,0.7);">
      Set it. Forget it. Watch it improve.
    </p>
    <aside class="notes">
      This is the "here's what we do" moment - keep it crisp.
    </aside>
  </section>

  <!-- Slide 8: The Autonomy Spectrum -->
  <section>
    <h2>You control how much control you <span class="highlight">give up</span></h2>
    <div class="grid-3" style="margin-top: var(--space-lg);">
      <div class="card fragment fade-up" style="text-align: center;">
        <div class="badge" style="background: var(--color-warning);">Supervised</div>
        <p style="margin-top: var(--space-sm); font-size: 0.75em;">
          Review every variant before it goes live
        </p>
      </div>
      <div class="card fragment fade-up" style="text-align: center;">
        <div class="badge" style="background: var(--color-primary);">Training Wheels</div>
        <p style="margin-top: var(--space-sm); font-size: 0.75em;">
          Auto-publish within brand guardrails, alerts on big changes
        </p>
      </div>
      <div class="card fragment fade-up" style="text-align: center;">
        <div class="badge" style="background: var(--color-success);">Full Auto</div>
        <p style="margin-top: var(--space-sm); font-size: 0.75em;">
          Total autonomy. Just watch the numbers climb.
        </p>
      </div>
    </div>
    <p class="fragment fade-up muted" style="text-align: center; margin-top: var(--space-lg); font-size: 0.85em;">
      Start supervised. Build trust. Go full auto when you're ready.
    </p>
    <aside class="notes">
      Addresses the "but what if it breaks my page?" fear.
    </aside>
  </section>
```

**Step 2: Preview and verify**

**Step 3: Commit**

```bash
git add presentation/index.html
git commit -m "feat(presentation): add solution and autonomy spectrum slides (7-8)"
```

---

## Task 5: Build Slides 9-10 (Onboarding & Dashboard)

**Files:**
- Modify: `presentation/index.html`

**Step 1: Add slides 9-10**

Add after slide 8:

```html
  <!-- Slide 9: Onboarding Flow -->
  <section>
    <h2>Up and running in <span class="highlight">3 steps</span></h2>
    <div style="margin-top: var(--space-md);">
      <div class="fragment fade-up" style="display: flex; align-items: flex-start; gap: var(--space-md); margin-bottom: var(--space-md);">
        <div class="stat" style="font-size: 1.5em; min-width: 50px;">1</div>
        <div>
          <h3 style="margin-bottom: var(--space-xs); font-size: 1em;">Paste your URL</h3>
          <p class="muted" style="font-size: 0.75em;">We scrape your page and extract brand constraints—colors, fonts, tone, imagery.</p>
        </div>
      </div>
      <div class="fragment fade-up" style="display: flex; align-items: flex-start; gap: var(--space-md); margin-bottom: var(--space-md);">
        <div class="stat" style="font-size: 1.5em; min-width: 50px;">2</div>
        <div>
          <h3 style="margin-bottom: var(--space-xs); font-size: 1em;">Set your conversion goal</h3>
          <p class="muted" style="font-size: 0.75em;">Click, form submission, or URL-based. We auto-detect if you're not sure.</p>
        </div>
      </div>
      <div class="fragment fade-up" style="display: flex; align-items: flex-start; gap: var(--space-md);">
        <div class="stat" style="font-size: 1.5em; min-width: 50px;">3</div>
        <div>
          <h3 style="margin-bottom: var(--space-xs); font-size: 1em;">Install the script</h3>
          <p class="muted" style="font-size: 0.75em;">One line in your <code>&lt;head&gt;</code>. Anti-flicker built in.</p>
          <pre style="margin-top: var(--space-xs);"><code class="language-html">&lt;script src="https://evoloop.io/v1/runtime.js" data-site="abc123"&gt;&lt;/script&gt;</code></pre>
        </div>
      </div>
    </div>
    <p class="fragment fade-up muted" style="margin-top: var(--space-md); font-size: 0.8em;">
      First variants generated automatically. Experiment starts immediately.
    </p>
    <aside class="notes">
      Show how lightweight the setup is.
    </aside>
  </section>

  <!-- Slide 10: Dashboard Tour (Vertical stack) -->
  <section>
    <section>
      <h2>See what matters, <span class="highlight">dive deeper when you want</span></h2>
      <p class="muted" style="margin-top: var(--space-sm);">Three dashboard views for different needs</p>
      <p style="margin-top: var(--space-lg); font-size: 0.8em;">↓ Press down to explore each view</p>
    </section>

    <section>
      <h3><span class="badge">Minimal View</span></h3>
      <p style="margin-top: var(--space-sm);">Current status at a glance</p>
      <div class="card" style="margin-top: var(--space-md); max-width: 500px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <p class="muted" style="font-size: 0.6em; margin: 0;">BEST PERFORMER</p>
            <p style="font-size: 0.9em; margin: var(--space-xs) 0;"><strong>Variant B</strong></p>
          </div>
          <div style="text-align: right;">
            <p class="muted" style="font-size: 0.6em; margin: 0;">LIFT</p>
            <p style="font-size: 1.2em; margin: var(--space-xs) 0; color: var(--color-success);"><strong>+23%</strong></p>
          </div>
          <div style="text-align: right;">
            <p class="muted" style="font-size: 0.6em; margin: 0;">CONFIDENCE</p>
            <p style="font-size: 0.9em; margin: var(--space-xs) 0;"><strong>94%</strong></p>
          </div>
        </div>
      </div>
      <p class="muted" style="margin-top: var(--space-md); font-size: 0.75em;">One card. Everything you need to know.</p>
    </section>

    <section>
      <h3><span class="badge">Timeline View</span></h3>
      <p style="margin-top: var(--space-sm);">Git-log style experiment history</p>
      <div style="margin-top: var(--space-md); max-width: 550px; font-size: 0.7em; font-family: var(--font-mono);">
        <div style="padding: var(--space-xs) 0; border-left: 3px solid var(--color-success); padding-left: var(--space-sm);">
          <span class="muted">2h ago</span> · <strong style="color: var(--color-success);">Variant B promoted to winner</strong>
        </div>
        <div style="padding: var(--space-xs) 0; border-left: 3px solid var(--color-primary); padding-left: var(--space-sm); margin-top: var(--space-xs);">
          <span class="muted">1d ago</span> · <span style="color: var(--color-primary);">Variant C generated</span> (CTA copy test)
        </div>
        <div style="padding: var(--space-xs) 0; border-left: 3px solid var(--color-warning); padding-left: var(--space-sm); margin-top: var(--space-xs);">
          <span class="muted">3d ago</span> · <span style="color: var(--color-warning);">Variant A killed</span> (underperforming)
        </div>
        <div style="padding: var(--space-xs) 0; border-left: 3px solid #e2e8f0; padding-left: var(--space-sm); margin-top: var(--space-xs);">
          <span class="muted">5d ago</span> · Experiment started
        </div>
      </div>
      <p class="muted" style="margin-top: var(--space-md); font-size: 0.75em;">See every decision. Understand evolution.</p>
    </section>

    <section>
      <h3><span class="badge">Stats Deep-Dive</span></h3>
      <p style="margin-top: var(--space-sm);">For the data nerds</p>
      <div class="grid-2" style="margin-top: var(--space-md); max-width: 600px;">
        <div class="card" style="padding: var(--space-sm);">
          <p class="muted" style="font-size: 0.6em; margin: 0;">POSTERIOR DISTRIBUTION</p>
          <p style="font-size: 0.8em; margin-top: var(--space-xs);">Beta(α=142, β=2847)</p>
        </div>
        <div class="card" style="padding: var(--space-sm);">
          <p class="muted" style="font-size: 0.6em; margin: 0;">95% CREDIBLE INTERVAL</p>
          <p style="font-size: 0.8em; margin-top: var(--space-xs);">4.2% – 5.6%</p>
        </div>
        <div class="card" style="padding: var(--space-sm);">
          <p class="muted" style="font-size: 0.6em; margin: 0;">PROBABILITY OF BEST</p>
          <p style="font-size: 0.8em; margin-top: var(--space-xs); color: var(--color-success);"><strong>87.3%</strong></p>
        </div>
        <div class="card" style="padding: var(--space-sm);">
          <p class="muted" style="font-size: 0.6em; margin: 0;">SAMPLES</p>
          <p style="font-size: 0.8em; margin-top: var(--space-xs);">2,989 visitors</p>
        </div>
      </div>
      <p class="muted" style="margin-top: var(--space-md); font-size: 0.75em;">Real statistics. Not vanity metrics.</p>
    </section>
  </section>
```

**Step 2: Preview and verify (test vertical navigation)**

**Step 3: Commit**

```bash
git add presentation/index.html
git commit -m "feat(presentation): add onboarding and dashboard slides (9-10)"
```

---

## Task 6: Build Slides 11-13 (Technical Deep-Dive)

**Files:**
- Modify: `presentation/index.html`

**Step 1: Add slides 11-13**

Add after slide 10:

```html
  <!-- Slide 11: Architecture -->
  <section>
    <h2>How the pieces <span class="highlight">connect</span></h2>
    <div style="margin-top: var(--space-md); display: flex; flex-direction: column; align-items: center; gap: var(--space-xs);">
      <div class="architecture-box fragment fade-up" style="width: 300px;">
        🌐 Runtime Script <span class="muted" style="font-size: 0.7em;">(Vercel Edge)</span>
      </div>
      <div class="architecture-arrow fragment fade-up">↓↑</div>
      <div class="grid-2 fragment fade-up" style="gap: var(--space-sm);">
        <div class="architecture-box">
          ⚛️ Next.js Frontend
        </div>
        <div class="architecture-box">
          🐍 FastAPI Backend
        </div>
      </div>
      <div class="architecture-arrow fragment fade-up">↓↑</div>
      <div class="architecture-box fragment fade-up" style="width: 300px;">
        🐘 Neon Postgres
      </div>
      <div class="architecture-arrow fragment fade-up">↕</div>
      <div class="grid-2 fragment fade-up" style="gap: var(--space-sm);">
        <div class="architecture-box">
          ⚡ Trigger.dev Jobs
        </div>
        <div class="architecture-box">
          🤖 LLM APIs
        </div>
      </div>
    </div>
    <aside class="notes">
      Build this piece by piece. Show how data flows.
    </aside>
  </section>

  <!-- Slide 12: Thompson Sampling -->
  <section>
    <h2>Smarter than <span class="highlight">A/B testing</span></h2>
    <div class="grid-2" style="margin-top: var(--space-lg);">
      <div class="fragment fade-up">
        <h3 style="font-size: 0.9em; color: var(--color-text-muted);">Traditional A/B</h3>
        <ul style="font-size: 0.75em; margin-top: var(--space-sm);">
          <li>Split traffic 50/50</li>
          <li>Wait weeks for significance</li>
          <li>Waste traffic on losers</li>
        </ul>
      </div>
      <div class="fragment fade-up">
        <h3 style="font-size: 0.9em; color: var(--color-primary);">Thompson Sampling</h3>
        <ul style="font-size: 0.75em; margin-top: var(--space-sm);">
          <li>Send more traffic to winners</li>
          <li>Learn faster, adapt in real-time</li>
          <li>Statistically rigorous</li>
        </ul>
      </div>
    </div>
    <div class="card fragment fade-up" style="margin-top: var(--space-lg); text-align: center; max-width: 500px; margin-left: auto; margin-right: auto;">
      <p style="font-size: 0.85em; margin: 0;">
        <strong>95% credible intervals.</strong><br>
        <span class="muted">Not gut feelings.</span>
      </p>
    </div>
    <aside class="notes">
      Make the stats accessible without dumbing it down.
    </aside>
  </section>

  <!-- Slide 13: Tech Stack -->
  <section>
    <h2>Built with modern, <span class="highlight">boring</span> technology</h2>
    <div class="grid-2" style="margin-top: var(--space-lg); max-width: 700px; margin-left: auto; margin-right: auto;">
      <div class="card fragment fade-up" style="padding: var(--space-sm);">
        <p class="muted" style="font-size: 0.6em; margin: 0;">FRONTEND</p>
        <p style="font-size: 0.8em; margin-top: var(--space-xs);">Next.js 16, React 19<br>shadcn/ui, Tailwind</p>
      </div>
      <div class="card fragment fade-up" style="padding: var(--space-sm);">
        <p class="muted" style="font-size: 0.6em; margin: 0;">BACKEND</p>
        <p style="font-size: 0.8em; margin-top: var(--space-xs);">Python, FastAPI<br>SQLAlchemy 2.0</p>
      </div>
      <div class="card fragment fade-up" style="padding: var(--space-sm);">
        <p class="muted" style="font-size: 0.6em; margin: 0;">DATABASE</p>
        <p style="font-size: 0.8em; margin-top: var(--space-xs);">Neon Postgres<br>Serverless, branching</p>
      </div>
      <div class="card fragment fade-up" style="padding: var(--space-sm);">
        <p class="muted" style="font-size: 0.6em; margin: 0;">INFRASTRUCTURE</p>
        <p style="font-size: 0.8em; margin-top: var(--space-xs);">Vercel, Trigger.dev<br>Edge + Serverless</p>
      </div>
    </div>
    <p class="fragment fade-up muted" style="text-align: center; margin-top: var(--space-lg); font-size: 0.8em;">
      Proven tools. No exotic dependencies.
    </p>
    <aside class="notes">
      "Boring" is a feature - signals reliability.
    </aside>
  </section>
```

**Step 2: Preview and verify**

**Step 3: Commit**

```bash
git add presentation/index.html
git commit -m "feat(presentation): add architecture, Thompson Sampling, and tech stack slides (11-13)"
```

---

## Task 7: Build Slide 14 (CTA) & Final Polish

**Files:**
- Modify: `presentation/index.html`

**Step 1: Add closing slide**

Add after slide 13:

```html
  <!-- Slide 14: CTA -->
  <section data-background-color="#6366f1" class="center slide-cta">
    <h2 style="color: white; font-size: 2em;">Start evolving</h2>
    <p style="color: rgba(255,255,255,0.9); margin-top: var(--space-md); font-size: 1.1em;">
      Your landing page should optimize itself.
    </p>
    <div style="margin-top: var(--space-lg);">
      <p style="color: rgba(255,255,255,0.8); font-size: 0.9em;">
        <strong>evoloop.io</strong>
      </p>
    </div>
    <aside class="notes">
      End with momentum. One clear action.
    </aside>
  </section>
```

**Step 2: Add final Reveal.js config tweaks**

Update the Reveal.initialize in `presentation/index.html`:

```html
<script>
  Reveal.initialize({
    hash: true,
    slideNumber: 'c/t',
    transition: 'slide',
    backgroundTransition: 'fade',
    width: 1280,
    height: 720,
    margin: 0.1,
    center: false,
    plugins: [RevealHighlight, RevealNotes]
  });
</script>
```

**Step 3: Preview full presentation**

Navigate through all slides, test vertical navigation on slide 10.

**Step 4: Final commit**

```bash
git add presentation/
git commit -m "feat(presentation): add CTA slide and finalize Reveal.js config"
```

---

## Task 8: Add README for Presentation

**Files:**
- Create: `presentation/README.md`

**Step 1: Create README**

```markdown
# Evoloop Presentation

A Reveal.js presentation showcasing Evoloop, the autonomous landing page optimization engine.

## Running Locally

```bash
# Option 1: Python's built-in server
cd presentation
python3 -m http.server 8000
# Open http://localhost:8000

# Option 2: Open directly
open presentation/index.html
```

## Navigation

- **→** / **Space**: Next slide
- **←**: Previous slide
- **↓**: Next vertical slide (on slide 10)
- **↑**: Previous vertical slide
- **Esc**: Overview mode
- **S**: Speaker notes (opens new window)
- **F**: Fullscreen

## Structure

- `index.html` - Main presentation
- `css/custom.css` - Custom styling
- `assets/` - Images and media (if needed)

## Slides

1. Hook
2. Why Landing Pages Matter
3. The Math
4. The Problem
5. Why Now?
6. The Landscape
7. The Solution
8. The Autonomy Spectrum
9. Onboarding Flow
10. Dashboard Tour (vertical stack)
11. Architecture
12. Thompson Sampling
13. Tech Stack
14. CTA
```

**Step 2: Commit**

```bash
git add presentation/README.md
git commit -m "docs(presentation): add README with usage instructions"
```

---

## Summary

**Total Tasks:** 8
**Estimated Commits:** 8

**Final Structure:**
```
presentation/
├── index.html          # Main presentation (14 slides)
├── css/
│   └── custom.css      # Light mode, landing-page styling
├── assets/
│   └── .gitkeep        # For future images/media
└── README.md           # Usage instructions
```

**To Present:**
1. `cd presentation && python3 -m http.server 8000`
2. Open `http://localhost:8000`
3. Press `F` for fullscreen, `S` for speaker notes
