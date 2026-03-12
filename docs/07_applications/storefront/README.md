# Storefront Documentation

**Application:** Customer Storefront  
**Owner:** Nyamsi Fredrick, Founder  
**Last Updated:** March 2026  
**Framework:** Next.js 15 + React + TypeScript  
**URL Pattern:** `https://{storeSlug}.vayva.ng`

---

## Overview

The Vayva Storefront is the customer-facing shopping experience for each merchant. It's a multi-tenant application that renders unique storefronts based on the merchant's template selection, branding, and product catalog.

## Architecture

```
Frontend/storefront/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── [storeSlug]/        # Dynamic store routes
│   │   │   ├── page.tsx        # Store homepage
│   │   │   ├── products/       # Product listing
│   │   │   ├── products/[id]/  # Product detail
│   │   │   ├── cart/           # Shopping cart
│   │   │   ├── checkout/       # Checkout flow
│   │   │   └── ...             # Other pages
│   │   ├── api/                # API routes
│   │   ├── layout.tsx          # Root layout
│   │   └── global-error.tsx    # Global error handler
│   ├── components/             # React components
│   │   ├── storefront/         # Store-specific components
│   │   ├── products/           # Product components
│   │   ├── cart/               # Cart components
│   │   ├── checkout/           # Checkout components
│   │   └── templates/          # Template components
│   ├── lib/                    # Utilities
│   │   ├── store-context.tsx   # Store data context
│   │   ├── templates-registry.ts # Template definitions
│   │   └── utils.ts            # Helpers
│   ├── hooks/                  # Custom hooks
│   └── types/                  # TypeScript definitions
├── public/                     # Static assets
├── templates/                  # Template implementations
└── package.json
```

## Multi-Tenant Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    STOREFRONT ARCHITECTURE                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Request: https://fashion-store.vayva.ng                   │
│                          │                                  │
│                          ▼                                  │
│   ┌─────────────────────────────────────┐                  │
│   │   Middleware: Extract storeSlug     │                  │
│   │   fashion-store → storeSlug         │                  │
│   └─────────────────────────────────────┘                  │
│                          │                                  │
│                          ▼                                  │
│   ┌─────────────────────────────────────┐                  │
│   │   Fetch Store Data                  │                  │
│   │   - Store config                    │                  │
│   │   - Template selection              │                  │
│   │   - Products                        │                  │
│   │   - Theme settings                  │                  │
│   └─────────────────────────────────────┘                  │
│                          │                                  │
│                          ▼                                  │
│   ┌─────────────────────────────────────┐                  │
│   │   Render Template                   │                  │
│   │   Template: AA-Fashion              │                  │
│   │   Theme: Light + Brand Colors       │                  │
│   └─────────────────────────────────────┘                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Template System

### Template Categories

| Category | Count | Examples |
|----------|-------|----------|
| Retail | 10+ | Fashion, Electronics, Home |
| Food | 5+ | Restaurants, Delivery, Catering |
| Services | 8+ | Bookings, Professional |
| Events | 4+ | Ticketing, Venues |
| Education | 4+ | Courses, Learning |
| Real Estate | 3+ | Listings, Rentals |
| B2B | 3+ | Wholesale, Marketplaces |
| Digital | 4+ | Downloads, Software |
| Nonprofit | 2+ | Fundraising |

### Template Registry

**Location:** `src/lib/templates-registry.ts`

```typescript
export enum TemplateCategory {
  RETAIL = "Retail",
  SERVICE = "Service",
  FOOD = "Food",
  DIGITAL = "Digital",
  EVENTS = "Events",
  B2B = "B2B",
  MARKETPLACE = "Marketplace",
  NONPROFIT = "Nonprofit",
  REAL_ESTATE = "Real Estate",
  AUTOMOTIVE = "Automotive",
  TRAVEL = "Travel",
  BLOG = "Blog",
  EDUCATION = "Education",
  ONE_PRODUCT = "One Product",
}

export enum TemplatePlanTier {
  FREE = "free",
  GROWTH = "growth",
  PRO = "pro",
}
```

### Template Configuration

```typescript
{
  templateId: "vayva-aa-fashion",
  slug: "aa-fashion",
  displayName: "AA Fashion",
  category: TemplateCategory.RETAIL,
  businessModel: "Retail",
  primaryUseCase: "Fashion & Apparel",
  requiredPlan: "free",
  defaultTheme: "light",
  status: "implemented",
  features: ["Collections", "Lookbook", "Size Guide"],
}
```

## Key Features

### 1. Dynamic Store Rendering

**Store Resolution:**
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host');
  const storeSlug = extractStoreSlug(hostname);
  
  // Attach storeSlug to request
  request.headers.set('x-store-slug', storeSlug);
  
  return NextResponse.next();
}
```

**Store Data Loading:**
```typescript
// app/[storeSlug]/page.tsx
export default async function StorePage({ params }) {
  const { storeSlug } = params;
  const store = await getStoreBySlug(storeSlug);
  const products = await getStoreProducts(store.id);
  const template = getTemplateById(store.templateId);
  
  return <TemplateRenderer template={template} store={store} products={products} />;
}
```

### 2. Product Catalog

**Features:**
- Grid/List view toggle
- Category filtering
- Price range filter
- Search functionality
- Sort options (price, name, newest)
- Quick view modal

**Product Display:**
- Product images (with zoom)
- Price and variants
- Add to cart button
- Wishlist (optional)
- Social sharing

### 3. Shopping Cart

**Features:**
- Add/remove items
- Quantity adjustment
- Variant selection
- Cart persistence (localStorage + server)
- Mini cart (slide-out)
- Full cart page

**Cart Context:**
```typescript
interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  variant?: {
    size?: string;
    color?: string;
  };
  image: string;
}

interface Cart {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}
```

### 4. Checkout Flow

**Steps:**
1. **Cart Review** - Review items, apply discounts
2. **Customer Info** - Email, shipping address
3. **Delivery** - Select delivery method
4. **Payment** - Paystack integration
5. **Confirmation** - Order confirmation page

**Checkout Implementation:**
```typescript
// checkout/page.tsx
export default function CheckoutPage() {
  const [step, setStep] = useState<CheckoutStep>('cart');
  const { cart } = useCart();
  
  const steps = {
    cart: <CartReview onNext={() => setStep('customer')} />,
    customer: <CustomerInfo onNext={() => setStep('delivery')} />,
    delivery: <DeliverySelect onNext={() => setStep('payment')} />,
    payment: <PaymentForm onComplete={handlePayment} />,
    confirmation: <OrderConfirmation order={order} />,
  };
  
  return steps[step];
}
```

### 5. Payment Integration

**Paystack Integration:**
```typescript
async function initializePayment(orderData: OrderData) {
  const response = await fetch('/api/checkout/initiate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: orderData.total,
      email: orderData.customer.email,
      metadata: {
        order_id: orderData.id,
        store_id: store.id,
      },
    }),
  });
  
  const { authorization_url } = await response.json();
  window.location.href = authorization_url;
}
```

### 6. Theme Customization

**Theme Variables:**
```css
:root {
  --primary: #10b981;
  --secondary: #1f2937;
  --accent: #f59e0b;
  --background: #ffffff;
  --foreground: #111827;
}
```

**Dynamic Theme Loading:**
```typescript
// Apply merchant's brand colors
function applyTheme(theme: StoreTheme) {
  document.documentElement.style.setProperty('--primary', theme.primaryColor);
  document.documentElement.style.setProperty('--secondary', theme.secondaryColor);
}
```

## Error Handling

**Rescue System Integration:**
```typescript
// global-error.tsx
import { RescueOverlay } from "@/components/rescue/RescueOverlay";

export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body>
        <RescueOverlay error={error} reset={reset} />
      </body>
    </html>
  );
}
```

## API Routes

### Store Data

```
GET /api/storefront/:storeSlug          - Get store info
GET /api/storefront/:storeSlug/products - List products
GET /api/storefront/:storeSlug/products/:id - Get product
GET /api/storefront/:storeSlug/categories - List categories
```

### Cart

```
GET    /api/storefront/:storeSlug/cart     - Get cart
POST   /api/storefront/:storeSlug/cart     - Update cart
DELETE /api/storefront/:storeSlug/cart     - Clear cart
```

### Checkout

```
POST /api/storefront/:storeSlug/checkout/initiate - Start checkout
POST /api/storefront/:storeSlug/checkout/verify   - Verify payment
```

## Environment Variables

```bash
# Required
NEXT_PUBLIC_APP_URL=https://vayva.ng
NEXT_PUBLIC_API_URL=https://api.vayva.ng
NEXT_PUBLIC_PAYSTACK_KEY=pk_test_...

# Storefront specific
NEXT_PUBLIC_DEFAULT_TEMPLATE=vayva-standard
NEXT_PUBLIC_IMAGE_CDN_URL=

# Rescue System
GROQ_API_KEY_RESCUE=
```

## Deployment

**Platform:** Vercel

**Domains:**
- Production: `*.vayva.ng` (wildcard)
- Staging: `*.staging.vayva.ng`

**Vercel Configuration:**
```json
{
  "rewrites": [
    { "source": "/:storeSlug/:path*", "destination": "/:storeSlug/:path*" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Store-Slug", "value": "$1" }
      ]
    }
  ]
}
```

## Performance Optimization

### Static Generation

```typescript
// Generate static pages for popular stores
export async function generateStaticParams() {
  const stores = await getAllStores();
  return stores.map(store => ({
    storeSlug: store.slug,
  }));
}

export const revalidate = 60; // ISR: Revalidate every 60 seconds
```

### Image Optimization

```typescript
import Image from 'next/image';

<Image
  src={product.image}
  alt={product.name}
  width={600}
  height={400}
  priority={isFeatured}
  placeholder="blur"
  blurDataURL={product.blurDataUrl}
/>
```

### Caching

```typescript
// Cache store data
const getStore = cache(async (slug: string) => {
  return await prisma.store.findUnique({ where: { slug } });
});
```

## Monitoring

- Vercel Analytics
- Core Web Vitals
- Sentry error tracking
- Rescue system incident tracking

## Related Documentation

- [Template Gallery](../../01_product/features/template-gallery.md)
- [Checkout Flow](../../01_product/features/checkout.md)
- [Vayva Rescue](../../05_operations/automation/vayva-rescue.md)
- [Paystack Integration](../../08_reference/integrations/paystack.md)

---

**Storefront Questions?** Contact the frontend team or check the [Development Guide](../../03_development/).
