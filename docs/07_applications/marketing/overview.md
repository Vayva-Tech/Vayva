# Marketing Website

> **Application:** `apps/marketing`
> **URL:** `https://vayva.ng`
> **Framework:** Next.js 16, React 19, TypeScript

## Purpose

The marketing website is the public-facing web presence for Vayva. It serves as the primary acquisition channel, educating prospective merchants about the platform, communicating pricing, and converting visitors into registered merchants. The site targets Nigerian entrepreneurs, SMBs, and growing businesses looking for AI-powered commerce tools.

## Pages

### Home (`/`)

The landing page communicates Vayva's core value proposition: AI-powered commerce for Africa.

Key sections:
- **Hero** -- Headline, subheadline, and primary CTA ("Start Free Trial")
- **Feature highlights** -- Cards showing AI sales agent, multi-channel selling, WhatsApp commerce, and analytics
- **Industry verticals** -- Visual grid showing the 20+ supported industries (restaurant, fashion, events, travel, healthcare, etc.)
- **Social proof** -- Merchant testimonials, order volume stats, and WhatsApp conversation counts
- **Pricing preview** -- Condensed tier comparison with link to full pricing page
- **Footer CTA** -- Final conversion prompt with signup button

### About (`/about`)

Company story and mission page:
- **Mission statement** -- Vayva's goal to democratize AI-powered commerce across Africa
- **Team section** -- Founder and leadership profiles
- **Vision** -- Roadmap highlights and long-term platform direction
- **Values** -- Core principles (merchant-first, AI transparency, local-first infrastructure)

### Pricing (`/pricing`)

Detailed tier comparison page:

| | STARTER | PRO | PRO_PLUS |
|---|---------|-----|----------|
| **Monthly** | N25,000 | N35,000 | N50,000 |
| **AI messages** | 500 | 2,000 | 10,000 |
| **Products** | 100 | 300 | 500 |
| **Team members** | 1 | 3 | 5 |

Additional content:
- **Feature matrix** -- Exhaustive feature-by-tier comparison table
- **FAQ section** -- Common pricing questions (billing cycle, upgrades, refund policy)
- **Credit system explainer** -- How AI credits work (0.24 credits per 1K tokens)
- **Add-on pricing** -- Extra credits and additional feature costs
- **CTA per tier** -- Each column has a "Get Started" button leading to signup

### Help Center (`/help`)

Self-service support hub:
- **Getting started guides** -- Step-by-step onboarding walkthroughs
- **Feature documentation** -- How-to articles for each dashboard feature
- **FAQ** -- Searchable frequently asked questions
- **Contact support** -- Email and WhatsApp support channels
- **Video tutorials** -- Embedded instructional videos (where available)

### Legal Pages

- **Terms of Service** (`/terms`) -- Platform usage agreement
- **Privacy Policy** (`/privacy`) -- Data collection and processing disclosures
- **Acceptable Use Policy** (`/acceptable-use`) -- Prohibited activities and content
- **Cookie Policy** (`/cookies`) -- Cookie usage and consent management

## SEO Strategy

### Technical SEO

- **Server-side rendering** -- All pages are SSR'd via Next.js for optimal crawlability
- **Structured data** -- JSON-LD schema markup for Organization, Product (pricing tiers), and FAQ
- **Sitemap** -- Auto-generated XML sitemap at `/sitemap.xml`
- **Robots.txt** -- Configured to allow all crawlers with sitemap reference
- **Canonical URLs** -- Self-referencing canonical tags on all pages
- **Open Graph / Twitter Cards** -- Social sharing metadata on every page

### Content SEO

- **Target keywords** -- "AI commerce Nigeria", "WhatsApp business automation", "online store Nigeria", "sell on WhatsApp"
- **Blog** -- Content marketing hub targeting long-tail keywords (commerce tips, AI guides, merchant success stories)
- **Localized content** -- Copy written for Nigerian English with local currency (Naira) references

### Performance

- **Core Web Vitals** -- Optimized for LCP, FID, and CLS scores
- **Image optimization** -- Next.js Image component with WebP/AVIF auto-conversion
- **Font loading** -- Self-hosted fonts with `font-display: swap`
- **Bundle size** -- Tree-shaking and code-splitting per route

## Conversion Funnels

### Primary Funnel: Visitor to Signup

```
Landing page visit
  --> Feature exploration (scroll / click)
  --> Pricing page visit
  --> "Get Started" CTA click
  --> Signup form (name, email, phone, business name)
  --> Email verification
  --> Onboarding flow in Merchant Dashboard
```

### Secondary Funnel: Blog to Signup

```
Blog article (organic search / social)
  --> In-article CTA or sidebar CTA
  --> Pricing page
  --> Signup
```

### Conversion Tracking

- **UTM parameters** -- Tracked across the funnel for attribution
- **Event tracking** -- Key interactions (CTA clicks, pricing toggle, FAQ expansion) tracked for analytics
- **Funnel visualization** -- Drop-off rates between each step monitored in analytics

## Key Components

### Shared Layout Components

- **Navbar** -- Logo, navigation links (Home, About, Pricing, Help), and "Get Started" / "Login" buttons
- **Footer** -- Company links, legal links, social media links, and newsletter signup
- **CTA Banner** -- Reusable conversion banner component used across pages

### Page-Specific Components

- **PricingTable** -- Interactive tier comparison with monthly toggle
- **FeatureCard** -- Standardized card for feature highlights with icon, title, and description
- **TestimonialCarousel** -- Rotating merchant testimonials with photos and business names
- **IndustryGrid** -- Visual grid of supported industry verticals with icons
- **FAQAccordion** -- Expandable FAQ sections with smooth animations

## Content Management

### Static Content

Most marketing copy is managed as static content within the Next.js application:
- **Copy updates** require a code deployment
- **Images** are stored in the `/public` directory and optimized at build time

### Dynamic Content

- **Blog posts** -- Not shipped on the marketing app today; future long-form content may use a CMS or markdown in-repo
- **Testimonials** -- Stored in the database and fetched at build time via ISR (Incremental Static Regeneration)
- **Pricing data** -- Tier pricing and feature lists are defined in a shared configuration to ensure consistency with the billing system

## Deployment

- **Hosting** -- Vercel
- **Domain** -- `vayva.ng` with `www.vayva.ng` redirecting to the apex domain
- **Preview deployments** -- Every pull request gets a preview URL for content review
- **Environment** -- Production environment with Vercel Edge Network for global CDN delivery
