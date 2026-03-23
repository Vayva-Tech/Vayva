# Storefront

> **Application:** `Frontend/storefront`
> **URL:** `https://{store-slug}.vayva.ng`
> **Framework:** Next.js 16, React 19, TypeScript

## Purpose

The Storefront is the customer-facing online store for each Vayva merchant. Every merchant gets a unique subdomain (e.g., `fashionhub.vayva.ng`) where their customers can browse products, place orders, and make payments. The storefront is a multi-tenant application that dynamically renders the correct store based on the requested domain.

## How Wildcard Domains Work

### Subdomain Routing

Vayva uses wildcard DNS and Next.js middleware to support multi-tenant storefronts:

1. **DNS configuration** -- A wildcard DNS record (`*.vayva.ng`) points all subdomains to the storefront application
2. **Request interception** -- Next.js middleware extracts the subdomain from the incoming request's `Host` header
3. **Store resolution** -- The subdomain is used to look up the corresponding store in the database
4. **Context injection** -- The resolved store's ID, theme, and configuration are injected into the request context
5. **Rendering** -- All pages render using the resolved store's data (products, branding, settings)

### Custom Domains

PRO and PRO_PLUS merchants can connect their own domains:

- **Domain verification** -- Merchant adds a CNAME or A record pointing to Vayva's infrastructure
- **SSL provisioning** -- Automatic TLS certificate generation for custom domains
- **Domain mapping** -- The custom domain is mapped to the merchant's store in the database
- **Fallback** -- The `{slug}.vayva.ng` subdomain continues to work alongside the custom domain

## Store Rendering Pipeline

```
Browser request (fashionhub.vayva.ng/products)
  --> CDN / Edge Network (Vercel)
  --> Next.js Middleware
      - Extract subdomain: "fashionhub"
      - Resolve store from database
      - Set store context headers
  --> App Router (Server Components)
      - Fetch store theme and configuration
      - Fetch page-specific data (products, collections, etc.)
      - Render with store's branding
  --> HTML response with hydration data
  --> Client-side React hydration
```

### Data Fetching

- **Server Components** -- Product listings, store info, and collections are fetched server-side for SEO and performance
- **Client Components** -- Cart state, user authentication, and interactive elements are handled client-side
- **API routes** -- The storefront includes its own API routes under `/api/` for cart operations, authentication, and payment processing

## Key Pages

### Home Page (`/`)

The store's landing page, rendered based on the merchant's chosen template:

- **Hero section** -- Featured products or promotional banner
- **Featured collections** -- Highlighted product categories
- **New arrivals** -- Recently added products
- **Store information** -- Business hours, location, and contact details

### Product Listing (`/products`)

- **Product grid** -- Responsive grid of all store products with images, titles, and prices
- **Filtering** -- Filter by category, price range, availability, and tags
- **Search** -- Full-text search across product titles and descriptions
- **Sorting** -- Sort by price (low-high, high-low), newest, and popularity
- **Pagination** -- Server-side pagination for performance

### Product Detail (`/products/[id]`)

- **Image gallery** -- Multiple product images with zoom capability
- **Product information** -- Title, description, price, and availability
- **Variant selection** -- Size, color, and other variant pickers
- **Add to cart** -- Quantity selector and add-to-cart button
- **Related products** -- Algorithmically suggested similar items
- **Reviews** -- Customer reviews and ratings (where enabled)

### Collections (`/collections/[id]`)

- **Collection page** -- Curated groups of products defined by the merchant
- **Collection description** -- Merchant-authored description and banner image
- **Product grid** -- Filtered product listing within the collection

### Cart (`/cart`)

- **Cart items** -- List of added products with quantities and line totals
- **Quantity adjustments** -- Increase, decrease, or remove items
- **Coupon application** -- Enter and apply discount codes (`/api/cart/apply-coupon`)
- **Coupon removal** -- Remove applied coupons (`/api/cart/remove-coupon`)
- **Cart total** -- Subtotal, discounts, delivery fee, and grand total
- **Abandoned cart recovery** -- Carts that are inactive for a configurable period trigger recovery messages via WhatsApp

### Checkout (`/checkout`)

The checkout flow collects delivery information and processes payment:

1. **Contact information** -- Name, email, and phone number
2. **Delivery address** -- Street address, city, state, and optional landmark
3. **Fulfillment method** -- Choose between delivery or pickup (if merchant supports both)
4. **Payment** -- Paystack inline payment (card, bank transfer, USSD)
5. **Order confirmation** -- Summary of the order with estimated delivery time

### Order Status (`/order/status`, `/order/confirmation`, `/order/success`)

- **Order confirmation** -- Displayed immediately after successful payment
- **Order tracking** -- Real-time status updates (confirmed, processing, shipped, delivered)
- **Order history** -- Authenticated customers can view past orders at `/orders`

### Customer Account (`/[lang]/account`)

Localized customer account pages:

- **Login / Register** -- Authentication via email and password
- **Profile** -- Manage personal details
- **Addresses** -- Save and manage delivery addresses
- **Payment methods** -- View saved payment methods
- **Order history** -- List of past orders with status and reorder options
- **Favorites** -- Saved/wishlisted products
- **Help** -- Store-specific help and contact information

### Blog (`/blog`)

- **Blog listing** -- Merchant-authored blog posts for content marketing
- **Blog post** (`/blog/[slug]`) -- Individual article page with rich content

### Additional Pages

- **Menu** (`/[lang]/menu`) -- Restaurant/food vertical menu display
- **Gift Cards** (`/[lang]/gift-cards`) -- Gift card purchase and redemption
- **Past Deliveries** (`/[lang]/past-deliveries`) -- Delivery history for food/grocery verticals
- **Contact** (`/contact`) -- Store contact form
- **Policies** (`/policies/[slug]`) -- Store policies (shipping, returns, privacy)
- **Tracking** (`/tracking`) -- Delivery tracking page
- **Affiliate** (`/affiliate`) -- Affiliate program pages (join, dashboard)
- **Vendors** (`/vendors`) -- Multi-vendor marketplace listing (if enabled)

## Paystack Payment Integration

### Payment Flow

```
Customer clicks "Pay Now"
  --> Storefront initializes Paystack inline popup
  --> Customer enters payment details (card / bank / USSD)
  --> Paystack processes payment
  --> Paystack redirects back to storefront with reference
  --> Storefront verifies payment via /api/webhooks/paystack
  --> Order status updated to "confirmed"
  --> Customer sees order confirmation page
```

### Supported Payment Methods

- **Card payments** -- Visa, Mastercard, and Verve cards (Nigerian and international)
- **Bank transfer** -- Direct bank transfer with automatic verification
- **USSD** -- Pay via USSD codes for customers without smartphones or cards
- **Mobile money** -- Where supported by Paystack in the region

### Webhook Processing

- **Paystack webhooks** -- Received at `/api/webhooks/paystack`
- **Payment verification** -- Each webhook payload is verified using the Paystack secret key
- **Idempotency** -- Duplicate webhook deliveries are handled gracefully
- **Event types** -- `charge.success`, `transfer.success`, `refund.processed`

## WhatsApp Chat Widget

Each storefront includes a WhatsApp chat widget that connects customers to the store's AI sales agent:

- **Floating button** -- Positioned in the bottom-right corner of every page
- **Click to chat** -- Opens WhatsApp (web or mobile app) with the store's business number pre-filled
- **Pre-filled message** -- Optional greeting message based on the page the customer was viewing
- **Product context** -- When clicked from a product page, the message includes the product name for context
- **Mobile-optimized** -- Opens the native WhatsApp app on mobile devices

## SEO Per Store

Each merchant storefront is independently optimized for search engines:

### Automatic SEO

- **Dynamic meta tags** -- Title, description, and Open Graph tags generated from store and product data
- **Structured data** -- JSON-LD markup for Organization (store), Product (each product), and BreadcrumbList
- **Sitemap** -- Auto-generated sitemap at `/sitemap.xml` listing all products, collections, and pages
- **Robots.txt** -- Generated at `/robots.txt` with sitemap reference
- **Canonical URLs** -- Self-referencing canonicals to prevent duplicate content across subdomain and custom domain

### Merchant-Configurable SEO

- **Store SEO title** -- Override the default store name in search results
- **Store meta description** -- Custom description for search engine snippets
- **Product SEO** -- Per-product title and description overrides
- **Social images** -- Custom Open Graph images for social sharing

## Templates and Theming

The storefront supports multiple visual templates:

- **Template gallery** -- Merchants choose from pre-built templates during onboarding
- **Theme customization** -- Colors, fonts, and layout options configurable from the merchant dashboard
- **Commerce blocks** -- Modular, reusable UI components (hero banners, product grids, testimonials) that merchants can arrange
- **Industry-aware defaults** -- Template defaults adapt based on the merchant's industry vertical

## Technical Notes

- **Internationalization** -- Localized routes via `[lang]` parameter (currently English with framework for additional languages)
- **Multi-tenant caching** -- Cache keys are scoped per store to prevent cross-tenant data leakage
- **Health check** -- `/healthz` endpoint for uptime monitoring
- **Edge rendering** -- Leverages Vercel Edge Network for low-latency responses across Africa
