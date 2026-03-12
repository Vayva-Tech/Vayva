/**
 * Checkout Flow Add-On
 * 
 * Complete checkout experience with multi-step forms, payment integration, and order confirmation
 */

import { AddOnDefinition } from '../../types';

export const CHECKOUT_FLOW_ADDON: AddOnDefinition = {
  id: 'vayva.checkout-flow',
  name: 'Checkout Flow',
  description: 'A conversion-optimized checkout with guest checkout, saved addresses, multiple payment methods, and order tracking',
  tagline: 'Checkout that converts browsers to buyers',
  version: '1.0.0',
  category: 'storefront',
  price: 0,
  isFree: true,
  developer: 'Vayva',
  icon: 'CreditCard',
  tags: ['checkout', 'payment', 'orders', 'conversion', 'ecommerce'],
  compatibleTemplates: ['*'],
  mountPoints: ['checkout-header', 'checkout-summary', 'page-footer'],
  configSchema: {
    type: 'object',
    properties: {
      guestCheckout: { type: 'boolean', default: true },
      expressCheckout: { type: 'boolean', default: true },
      savedAddresses: { type: 'boolean', default: true },
      multiStep: { type: 'boolean', default: true },
      orderNotes: { type: 'boolean', default: true },
      giftOptions: { type: 'boolean', default: false },
      promoCode: { type: 'boolean', default: true },
      loyaltyPoints: { type: 'boolean', default: false },
      paymentMethods: {
        type: 'array',
        items: { type: 'string' },
        default: ['card', 'bank_transfer', 'wallet'],
      },
    },
  },
  defaultConfig: {
    guestCheckout: true,
    expressCheckout: true,
    savedAddresses: true,
    multiStep: true,
    orderNotes: true,
    giftOptions: false,
    promoCode: true,
    loyaltyPoints: false,
    paymentMethods: ['card', 'bank_transfer', 'wallet'],
  },
  previewImages: {
    thumbnail: '/addons/checkout-flow/thumbnail.jpg',
    screenshots: [
      '/addons/checkout-flow/screenshot-1.jpg',
      '/addons/checkout-flow/screenshot-2.jpg',
      '/addons/checkout-flow/screenshot-3.jpg',
    ],
  },
  author: {
    name: 'Vayva',
    isOfficial: true,
    isVerified: true,
  },
  pricing: {
    type: 'free',
  },
  stats: {
    installCount: 12800,
    rating: 4.9,
    reviewCount: 756,
    lastUpdated: '2024-01-20',
    createdAt: '2023-06-01',
  },
  provides: {
    pages: [
      { route: '/checkout', title: 'Checkout' },
      { route: '/checkout/success', title: 'Order Confirmation' },
      { route: '/checkout/pending', title: 'Payment Pending' },
    ],
    components: [
      { componentName: 'CheckoutProgress', mountPoint: 'checkout-header' },
      { componentName: 'OrderSummary', mountPoint: 'checkout-summary' },
      { componentName: 'SecureCheckoutBadge', mountPoint: 'page-footer' },
    ],
    apiRoutes: [
      { path: '/api/checkout', methods: ['POST'] },
      { path: '/api/checkout/validate', methods: ['POST'] },
      { path: '/api/checkout/shipping', methods: ['POST', 'GET'] },
      { path: '/api/checkout/payment', methods: ['POST'] },
      { path: '/api/checkout/apply-coupon', methods: ['POST'] },
    ],
    databaseModels: ['CheckoutSession', 'ShippingAddress', 'PaymentAttempt'],
  },
  highlights: [
    'Guest checkout support',
    'Multi-step or single-page checkout',
    'Saved addresses for logged-in users',
    'Real-time shipping calculation',
    'Promo code support',
  ],
  installTimeEstimate: 3,
};

export const CHECKOUT_FLOW_MODELS = `
model CheckoutSession {
  id            String   @id @default(cuid())
  storeId       String
  cartId        String
  customerId    String?
  email         String?
  status        CheckoutStatus @default(ACTIVE)
  shippingAddress Json?
  billingAddress  Json?
  shippingMethod  String?
  shippingCost    Decimal @default(0) @db.Decimal(10, 2)
  taxAmount       Decimal @default(0) @db.Decimal(10, 2)
  discountAmount  Decimal @default(0) @db.Decimal(10, 2)
  total           Decimal @default(0) @db.Decimal(10, 2)
  couponCode      String?
  notes           String?
  metadata        Json?
  expiresAt       DateTime?
  completedAt     DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([storeId, status])
  @@index([cartId])
  @@index([expiresAt])
}

model ShippingAddress {
  id          String   @id @default(cuid())
  customerId  String
  name        String
  phone       String
  address     String
  city        String
  state       String
  country     String   @default("Nigeria")
  postalCode  String?
  isDefault   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([customerId])
}

model PaymentAttempt {
  id            String   @id @default(cuid())
  checkoutId    String
  method        String
  provider      String
  amount        Decimal  @db.Decimal(10, 2)
  currency      String   @default("NGN")
  status        PaymentStatus @default(PENDING)
  reference     String   @unique
  metadata      Json?
  errorMessage  String?
  createdAt     DateTime @default(now())
  completedAt   DateTime?
  
  @@index([checkoutId])
  @@index([reference])
  @@index([status])
}

enum CheckoutStatus {
  ACTIVE
  SHIPPING_SELECTED
  PAYMENT_SELECTED
  COMPLETED
  EXPIRED
  ABANDONED
}

enum PaymentStatus {
  PENDING
  PROCESSING
  SUCCESS
  FAILED
  REFUNDED
  CANCELLED
}
`;

export default CHECKOUT_FLOW_ADDON;
