/**
 * Affiliate System Components for Vayva Storefront
 * 
 * This module provides all the components and utilities needed for merchants
 * to integrate affiliate tracking into their storefronts.
 * 
 * ## Quick Start
 * 
 * 1. Add the ReferralTracker to your layout to enable affiliate link tracking:
 *    ```tsx
 *    import { AffiliateReferralTracker } from "@/components/affiliate";
 *    
 *    export default function Layout({ children }) {
 *      return (
 *        <>
 *          <AffiliateReferralTracker />
 *          {children}
 *        </>
 *      );
 *    }
 *    ```
 * 
 * 2. Add the AffiliateWidget to promote your affiliate program:
 *    ```tsx
 *    import { AffiliateWidget } from "@/components/affiliate";
 *    
 *    // Floating button variant
 *    <AffiliateWidget variant="floating" position="bottom-right" />
 *    
 *    // Footer banner variant
 *    <AffiliateWidget variant="footer" />
 *    
 *    // Inline banner variant
 *    <AffiliateWidget variant="inline" />
 *    ```
 * 
 * 3. Use the AffiliateLinkGenerator for affiliate dashboards:
 *    ```tsx
 *    import { AffiliateLinkGenerator } from "@/components/affiliate";
 *    
 *    <AffiliateLinkGenerator
 *      baseUrl="https://mystore.vayva.ng"
 *      referralCode="ABC123"
 *      productId="optional-product-id"
 *    />
 *    ```
 * 
 * 4. Add affiliate badges to product pages:
 *    ```tsx
 *    import { AffiliateBadge, ShareAndEarnButton } from "@/components/affiliate";
 *    
 *    <AffiliateBadge />
 *    <ShareAndEarnButton productId="123" productName="Cool Product" />
 *    ```
 * 
 * ## How It Works
 * 
 * 1. Affiliate shares their unique referral link (e.g., `?ref=ABC123`)
 * 2. Customer clicks link → ReferralTracker sets cookie (30 days)
 * 3. Customer makes purchase → Checkout reads cookie and tracks conversion
 * 4. Affiliate earns commission based on configured rate
 * 
 * ## API Routes
 * 
 * - `POST /api/affiliate/track-click` - Track affiliate link clicks
 * - `POST /api/affiliate/track-conversion` - Track successful conversions
 * 
 * ## Cookie Details
 * 
 * - Name: `vayva_referral_code`
 * - Duration: 30 days
 * - Secure: Yes (HTTPS only)
 * - SameSite: Lax
 */

// Main tracking component
export {
  AffiliateReferralTracker,
  getReferralCookie,
  clearReferralCookie,
} from "./ReferralTracker";

// Widget components
export {
  AffiliateWidget,
  AffiliateBadge,
  ShareAndEarnButton,
} from "./AffiliateWidget";

// Link generation
export { AffiliateLinkGenerator } from "./ReferralTracker";
