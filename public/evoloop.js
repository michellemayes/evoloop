/**
 * Evoloop Runtime Script
 * Inject this script into your landing page to enable A/B testing
 *
 * Usage:
 * <script src="https://cdn.evoloop.ai/evoloop.js" data-site-id="YOUR_SITE_ID"></script>
 */
(function() {
  'use strict';

  // Get API URL from Evoloop script tag or default to production
  const getApiUrl = () => {
    const scripts = document.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; i++) {
      const script = scripts[i];
      const src = script.getAttribute('src') || '';
      // Only check data-api-url on the Evoloop script
      if (src.includes('evoloop.js')) {
        const apiUrl = script.getAttribute('data-api-url');
        if (apiUrl) return apiUrl;
      }
    }
    return 'https://api.evoloop.ai';
  };

  const EVOLOOP_API = getApiUrl();
  const STORAGE_KEY = 'evoloop_visitor_id';
  const VARIANT_KEY = 'evoloop_variant';

  // Get or create visitor ID
  function getVisitorId() {
    let visitorId = localStorage.getItem(STORAGE_KEY);
    if (!visitorId) {
      visitorId = 'v_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem(STORAGE_KEY, visitorId);
    }
    return visitorId;
  }

  // Get site ID from Evoloop script tag
  function getSiteId() {
    const scripts = document.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; i++) {
      const script = scripts[i];
      const src = script.getAttribute('src') || '';
      // Only check data-site-id on the Evoloop script
      if (src.includes('evoloop.js')) {
        const siteId = script.getAttribute('data-site-id');
        if (siteId) return siteId;
      }
    }
    console.error('[Evoloop] No site ID found. Add data-site-id to the script tag.');
    return null;
  }

  // Fetch assigned variant
  async function fetchVariant(siteId, visitorId) {
    try {
      const response = await fetch(
        `${EVOLOOP_API}/v1/assign?site_id=${siteId}&visitor_id=${visitorId}`
      );
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('[Evoloop] Failed to fetch variant:', error);
      return null;
    }
  }

  // Apply variant patch to the page
  function applyPatch(patch) {
    if (!patch || typeof patch !== 'object') return;

    // Apply headline
    if (patch.headline) {
      const h1 = document.querySelector('h1');
      if (h1) h1.textContent = patch.headline;
    }

    // Apply subheadline
    if (patch.subheadline) {
      const selectors = ['h2', '.subheadline', '.subtitle', '[data-evoloop="subheadline"]'];
      for (const selector of selectors) {
        const el = document.querySelector(selector);
        if (el) {
          el.textContent = patch.subheadline;
          break;
        }
      }
    }

    // Apply CTA button text
    if (patch.cta) {
      const selectors = ['button.cta', '.cta-button', '[data-evoloop="cta"]', 'a.btn-primary'];
      for (const selector of selectors) {
        const el = document.querySelector(selector);
        if (el) {
          el.textContent = patch.cta;
          break;
        }
      }
    }

    // Apply hero image
    if (patch.heroImage) {
      const selectors = ['.hero-image', '[data-evoloop="hero"]', '.hero img', 'header img'];
      for (const selector of selectors) {
        const el = document.querySelector(selector);
        if (el && el.tagName === 'IMG') {
          el.src = patch.heroImage;
          break;
        }
      }
    }
  }

  // Record event
  async function recordEvent(type, metadata = {}) {
    const siteId = getSiteId();
    const visitorId = getVisitorId();
    const variantData = JSON.parse(sessionStorage.getItem(VARIANT_KEY) || '{}');

    if (!siteId || !variantData.variant_id) return;

    try {
      await fetch(`${EVOLOOP_API}/v1/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          site_id: siteId,
          variant_id: variantData.variant_id,
          visitor_id: visitorId,
          type: type,
          metadata: metadata,
        }),
      });
    } catch (error) {
      console.error('[Evoloop] Failed to record event:', error);
    }
  }

  // Initialize Evoloop
  async function init() {
    const siteId = getSiteId();
    if (!siteId) return;

    const visitorId = getVisitorId();

    // Check for cached variant in this session
    let variantData = JSON.parse(sessionStorage.getItem(VARIANT_KEY) || 'null');

    if (!variantData) {
      variantData = await fetchVariant(siteId, visitorId);
      if (variantData) {
        sessionStorage.setItem(VARIANT_KEY, JSON.stringify(variantData));
      }
    }

    if (variantData && variantData.patch) {
      applyPatch(variantData.patch);
    }

    // Record impression
    recordEvent('impression');

    // Set up conversion tracking
    window.evoloop = {
      trackConversion: (metadata) => recordEvent('conversion', metadata),
      trackEvent: (type, metadata) => recordEvent(type, metadata),
    };

    // Auto-track form submissions
    document.addEventListener('submit', (e) => {
      if (e.target.tagName === 'FORM') {
        recordEvent('conversion', { type: 'form_submit' });
      }
    });

    // Auto-track CTA clicks
    document.querySelectorAll('[data-evoloop="cta"], .cta-button, button.cta').forEach((el) => {
      el.addEventListener('click', () => {
        recordEvent('conversion', { type: 'cta_click' });
      });
    });

    console.log('[Evoloop] Initialized with variant:', variantData?.variant_id);
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
