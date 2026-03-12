# Vayva Affiliate System Integration Guide

## Overview

The Vayva Affiliate System allows merchants to have affiliates who refer customers via tracked affiliate links. When a customer clicks an affiliate link and makes a purchase, the affiliate earns a commission.

## How It Works

1. **Affiliate Registration**: Affiliates register through the merchant dashboard (`/dashboard/affiliate/join`)
2. **Referral Link**: Each affiliate gets a unique referral code (e.g., `ABC123`)
3. **Link Sharing**: Affiliates share links with `?ref=ABC123` parameter
4. **Click Tracking**: The `AffiliateReferralTracker` component detects clicks and sets a 30-day cookie
5. **Conversion Tracking**: When customer completes checkout, the conversion is tracked
6. **Commission Payout**: Affiliates earn commissions based on configured rates (default 10%)

## Quick Integration

### Step 1: Add Tracking to Your Layout

Add the `AffiliateReferralTracker` component to your root layout to enable affiliate tracking:

```tsx
// app/layout.tsx
import { AffiliateReferralTracker } from "@/components/affiliate";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AffiliateReferralTracker />
        {children}
      </body>
    </html>
  );
}
```

### Step 2: Add Promotional Widget (Optional)

Add the affiliate widget to promote your program:

```tsx
// Floating button in bottom-right corner
import { AffiliateWidget } from "@/components/affiliate";

<AffiliateWidget variant="floating" position="bottom-right" />

// Footer banner
<AffiliateWidget variant="footer" />

// Inline banner on specific pages
<AffiliateWidget variant="inline" />
```

### Step 3: Add Affiliate Badges to Product Pages

```tsx
import { AffiliateBadge, ShareAndEarnButton } from "@/components/affiliate";

// Small badge near product price
<AffiliateBadge />

// Share button for customers to share products
<ShareAndEarnButton 
  productId="product-123" 
  productName="Premium Widget" 
/>
```

## Components Reference

### AffiliateReferralTracker

**Purpose**: Tracks affiliate link clicks and sets cookies

**Usage**: Include once in your layout or main page

**Behavior**:
- Detects `?ref=CODE` in URL
- Validates code format (alphanumeric, 6-20 chars)
- Sets 30-day cookie `vayva_referral_code`
- Sends click event to backend
- Clears cookie after successful purchase

### AffiliateWidget

**Purpose**: Promotional widget to encourage affiliate signups

**Props**:
- `variant`: `"floating" | "footer" | "inline"`
- `position`: `"bottom-right" | "bottom-left"` (for floating variant)

### AffiliateBadge

**Purpose**: Small badge to display near products

**Usage**: Add to product cards or product detail pages

### ShareAndEarnButton

**Purpose**: Allows customers to share products and earn

**Props**:
- `productId`: Optional product ID
- `productName`: Optional product name
- `className`: Optional CSS classes

### AffiliateLinkGenerator

**Purpose**: Generate referral links for affiliates

**Usage**: Use in affiliate dashboard

**Props**:
- `baseUrl`: Store base URL
- `referralCode`: Affiliate's referral code
- `productId`: Optional specific product ID

## API Routes

The following API routes handle affiliate tracking:

### POST /api/affiliate/track-click

Tracks when a customer clicks an affiliate link.

**Body**:
```json
{
  "referralCode": "ABC123",
  "source": "facebook",
  "landingPage": "/products/widget"
}
```

### POST /api/affiliate/track-conversion

Tracks when a referred customer completes a purchase.

**Body**:
```json
{
  "referralCode": "ABC123",
  "orderId": "order-uuid",
  "orderAmount": 50000,
  "customerEmail": "customer@example.com"
}
```

### POST /api/affiliate/confirm-conversion

Confirms affiliate conversion after successful payment.

**Body**:
```json
{
  "referralCode": "ABC123",
  "orderId": "order-uuid"
}
```

## Cookie Details

- **Name**: `vayva_referral_code`
- **Duration**: 30 days
- **Secure**: Yes (HTTPS only)
- **SameSite**: Lax
- **Path**: `/`

## Commission Calculation

Default commission rate: **10% of order total**

Example:
- Customer orders ₦50,000
- Affiliate earns ₦5,000 commission

Commission rates can be configured per affiliate in the merchant dashboard.

## Payout Methods

1. **Bank Transfer**: Direct transfer to affiliate's bank account via Paystack
2. **Wallet**: Credit to affiliate's Vayva wallet (for merchant-specific wallets)

## Testing the Integration

1. Register an affiliate in the merchant dashboard
2. Get the affiliate's referral code
3. Visit your storefront with `?ref=CODE` parameter
4. Check browser cookies for `vayva_referral_code`
5. Complete a purchase
6. Verify conversion appears in affiliate dashboard
7. Confirm commission is calculated correctly

## Common Issues

### Affiliate clicks not tracking
- Verify `AffiliateReferralTracker` is mounted
- Check browser console for errors
- Verify affiliate code is active (not PENDING or SUSPENDED)

### Conversions not appearing
- Verify referral cookie is set (check browser dev tools)
- Ensure checkout flow is properly integrated
- Check webhook handler for payment confirmation

### Commission calculation incorrect
- Verify commission rate in affiliate settings
- Check order amount is correct
- Ensure conversion status is CONFIRMED (not just PENDING)

## Support

For issues or questions about the affiliate system:
- Check logs for `[Affiliate]` tagged messages
- Review webhook events in Paystack dashboard
- Contact Vayva support with order and affiliate IDs
