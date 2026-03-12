/**
 * Vayva Add-On Registry
 * 
 * Central registry of all available add-ons in the Vayva ecosystem.
 * This includes official add-ons and serves as the source of truth
 * for the add-on gallery.
 */

import type { AddOnDefinition } from './types';

// ============================================================================
// CORE E-COMMERCE ADD-ONS
// ============================================================================

export const SHOPPING_CART_ADDON: AddOnDefinition = {
  id: 'shopping-cart',
  name: 'Shopping Cart',
  tagline: 'Full-featured cart with add to cart, quantities, and persistent storage',
  description: `Add a complete shopping cart system to your website. Features include:

- **Add to Cart**: One-click product addition with variant support
- **Quantity Management**: Increase/decrease quantities directly in cart
- **Persistent Storage**: Cart persists across sessions using localStorage
- **Mini Cart**: Slide-out cart preview without leaving the page
- **Cart Icon**: Dynamic cart icon with item count in header
- **Save for Later**: Let customers save items for future purchase
- **Cart Recovery**: Abandoned cart reminder emails (requires Email add-on)

Perfect for transforming any template into a fully functional e-commerce store.`,
  category: 'ecommerce',
  tags: ['cart', 'ecommerce', 'conversion', 'essential'],
  icon: 'ShoppingCart',
  previewImages: {
    thumbnail: '/addons/shopping-cart/thumbnail.jpg',
    screenshots: [
      '/addons/shopping-cart/screenshot-1.jpg',
      '/addons/shopping-cart/screenshot-2.jpg',
      '/addons/shopping-cart/screenshot-3.jpg',
    ],
    demoVideo: '/addons/shopping-cart/demo.mp4',
  },
  author: {
    name: 'Vayva',
    url: 'https://vayva.com',
    isVerified: true,
    isOfficial: true,
  },
  version: '2.1.0',
  versionHistory: [
    { version: '2.1.0', date: '2026-02-15', changes: ['Added cart recovery feature', 'Improved mobile responsiveness'] },
    { version: '2.0.0', date: '2026-01-10', changes: ['Complete UI redesign', 'Added save for later'] },
    { version: '1.0.0', date: '2025-11-01', changes: ['Initial release'] },
  ],
  
  // Compatibility - Works with ALL templates that have products
  compatibleTemplates: [
    'agriculture', 'aquavibe', 'artistry', 'autodealer', 'autolane', 'automotive',
    'baby', 'base', 'beauty', 'books', 'campout', 'cloudhost', 'codecamp', 'courseacademy',
    'craftbrew', 'craftcorner', 'crypto', 'cryptovault', 'edulearn', 'electronics',
    'eventhorizon', 'events', 'fashun', 'fashion', 'fitpulse', 'food', 'freshmarket',
    'furniture', 'gardenia', 'gearvault', 'greenlife', 'grover', 'healthcare', 'homecraft',
    'hoperise', 'hospitality', 'jewelry', 'jobnexus', 'kidspace', 'larkhomes', 'legalease',
    'medibay', 'medicare', 'musicflow', 'nightpulse', 'partypop', 'petcare', 'petpal',
    'photoframe', 'playzone', 'realestate', 'saasflow', 'services', 'sports', 'standard',
    'staysavvy', 'studiobox', 'stylehub', 'techgear', 'toolcraft', 'toys', 'tradehub',
    'travel', 'urbanscape', 'vintagewoods', 'wellness', 'zenith',
  ],
  incompatibleTemplates: [],
  conflictsWith: [],
  requires: [],
  recommended: ['checkout-flow', 'product-pages'],
  minTemplateVersion: '1.0.0',
  
  installationType: 'automatic',
  isDefault: false,
  canUninstall: true,
  installTimeEstimate: 2,
  requiresCodeReview: false,
  
  provides: {
    pages: [
      { route: '/cart', title: 'Shopping Cart', description: 'Full-page cart view', layout: 'default' },
    ],
    components: [
      { mountPoint: 'header-right', componentName: 'CartIcon', priority: 10 },
      { mountPoint: 'product-card', componentName: 'AddToCartButton', priority: 5 },
      { mountPoint: 'product-detail', componentName: 'ProductPurchaseSection', priority: 10 },
      { mountPoint: 'floating-button', componentName: 'FloatingCartButton', priority: 20, 
        conditions: { pageTypes: ['product', 'category'] } },
    ],
    apiRoutes: [
      { path: '/api/cart', methods: ['GET', 'POST', 'PUT', 'DELETE'], description: 'Cart CRUD operations' },
      { path: '/api/cart/sync', methods: ['POST'], description: 'Sync cart with database for logged-in users' },
    ],
    databaseModels: ['Cart', 'CartItem'],
  },
  
  configSchema: {
    fields: [
      { key: 'cartStyle', label: 'Cart Style', type: 'select', required: true, 
        options: [{ label: 'Slide-out Drawer', value: 'drawer' }, { label: 'Modal Popup', value: 'modal' }, { label: 'Full Page Only', value: 'page' }],
        defaultValue: 'drawer' },
      { key: 'showCartIcon', label: 'Show Cart Icon in Header', type: 'boolean', defaultValue: true },
      { key: 'enableSaveForLater', label: 'Enable Save for Later', type: 'boolean', defaultValue: true },
      { key: 'enableGuestCart', label: 'Allow Guest Checkout', type: 'boolean', defaultValue: true },
      { key: 'cartIconColor', label: 'Cart Icon Color', type: 'color', defaultValue: '#000000' },
      { key: 'freeShippingThreshold', label: 'Free Shipping Threshold', type: 'number', description: 'Show progress bar for free shipping (0 to disable)', defaultValue: 0 },
      { key: 'abandonedCartTimeout', label: 'Abandoned Cart Timeout (minutes)', type: 'number', defaultValue: 60 },
      { key: 'maxCartItems', label: 'Maximum Items in Cart', type: 'number', defaultValue: 100, validation: { min: 1, max: 1000 } },
    ],
    sections: [
      { title: 'Display Options', description: 'How the cart appears to customers', fields: ['cartStyle', 'showCartIcon', 'cartIconColor'] },
      { title: 'Features', description: 'Enable additional cart features', fields: ['enableSaveForLater', 'enableGuestCart'] },
      { title: 'Advanced', description: 'Fine-tune cart behavior', fields: ['freeShippingThreshold', 'abandonedCartTimeout', 'maxCartItems'] },
    ],
  },
  defaultConfig: {
    cartStyle: 'drawer',
    showCartIcon: true,
    enableSaveForLater: true,
    enableGuestCart: true,
    cartIconColor: '#000000',
    freeShippingThreshold: 0,
    abandonedCartTimeout: 60,
    maxCartItems: 100,
  },
  configRequired: false,
  
  pricing: {
    type: 'free',
  },
  
  stats: {
    installCount: 15420,
    rating: 4.8,
    reviewCount: 342,
    lastUpdated: '2026-02-15',
    createdAt: '2025-11-01',
  },
  
  highlights: [
    'One-click installation',
    'Works with any template',
    'Persistent cart across sessions',
    'Mobile-optimized design',
    'Guest checkout support',
  ],
  
  docs: {
    setup: '/docs/addons/shopping-cart/setup',
    api: '/docs/addons/shopping-cart/api',
    faq: '/docs/addons/shopping-cart/faq',
    support: '/support/addons/shopping-cart',
  },
};

// ============================================================================

export const CHECKOUT_FLOW_ADDON: AddOnDefinition = {
  id: 'checkout-flow',
  name: 'Checkout Flow',
  tagline: 'Multi-step checkout with shipping, payment, and order confirmation',
  description: `Complete checkout system that turns browsers into buyers. Features include:

- **Multi-Step Checkout**: Step-by-step flow (Information → Shipping → Payment → Confirmation)
- **Guest Checkout**: No account required to complete purchase
- **Address Validation**: Automatic address validation and autocomplete
- **Multiple Payment Methods**: Cards, Paystack, Apple Pay, Google Pay
- **Shipping Options**: Real-time shipping rates and delivery estimates
- **Order Summary**: Review items, shipping, and totals before payment
- **Tax Calculation**: Automatic tax calculation based on location
- **Order Confirmation**: Beautiful confirmation page with order details

Requires Shopping Cart add-on to be installed first.`,
  category: 'ecommerce',
  tags: ['checkout', 'payment', 'ecommerce', 'conversion', 'essential'],
  icon: 'CreditCard',
  previewImages: {
    thumbnail: '/addons/checkout-flow/thumbnail.jpg',
    screenshots: [
      '/addons/checkout-flow/screenshot-1.jpg',
      '/addons/checkout-flow/screenshot-2.jpg',
    ],
  },
  author: {
    name: 'Vayva',
    url: 'https://vayva.com',
    isVerified: true,
    isOfficial: true,
  },
  version: '2.3.1',
  versionHistory: [
    { version: '2.3.1', date: '2026-02-20', changes: ['Security patch for payment validation'] },
    { version: '2.3.0', date: '2026-02-01', changes: ['Added Apple Pay support', 'Improved mobile UX'] },
    { version: '2.0.0', date: '2025-12-10', changes: ['Complete redesign', 'Added multi-step flow'] },
  ],
  
  compatibleTemplates: [
    'agriculture', 'aquavibe', 'artistry', 'autodealer', 'autolane', 'automotive',
    'baby', 'base', 'beauty', 'books', 'campout', 'cloudhost', 'codecamp', 'courseacademy',
    'craftbrew', 'craftcorner', 'crypto', 'cryptovault', 'edulearn', 'electronics',
    'eventhorizon', 'events', 'fashun', 'fashion', 'fitpulse', 'food', 'freshmarket',
    'furniture', 'gardenia', 'gearvault', 'greenlife', 'grover', 'healthcare', 'homecraft',
    'hoperise', 'hospitality', 'jewelry', 'jobnexus', 'kidspace', 'larkhomes', 'legalease',
    'medibay', 'medicare', 'musicflow', 'nightpulse', 'partypop', 'petcare', 'petpal',
    'photoframe', 'playzone', 'realestate', 'saasflow', 'services', 'sports', 'standard',
    'staysavvy', 'studiobox', 'stylehub', 'techgear', 'toolcraft', 'toys', 'tradehub',
    'travel', 'urbanscape', 'vintagewoods', 'wellness', 'zenith',
  ],
  incompatibleTemplates: [],
  conflictsWith: [],
  requires: ['shopping-cart'],
  recommended: ['product-pages', 'order-tracking'],
  minTemplateVersion: '1.0.0',
  
  installationType: 'automatic',
  isDefault: false,
  canUninstall: true,
  installTimeEstimate: 3,
  requiresCodeReview: false,
  
  provides: {
    pages: [
      { route: '/checkout', title: 'Checkout', description: 'Multi-step checkout', layout: 'full-width' },
      { route: '/checkout/success', title: 'Order Confirmed', description: 'Order confirmation', layout: 'default' },
    ],
    components: [
      { mountPoint: 'checkout-summary', componentName: 'OrderSummary', priority: 10 },
      { mountPoint: 'checkout-header', componentName: 'CheckoutProgress', priority: 5 },
    ],
    apiRoutes: [
      { path: '/api/checkout', methods: ['POST'], description: 'Create checkout session' },
      { path: '/api/checkout/shipping-rates', methods: ['POST'], description: 'Get shipping rates' },
      { path: '/api/checkout/validate-address', methods: ['POST'], description: 'Validate shipping address' },
      { path: '/api/orders', methods: ['POST'], description: 'Create order after payment' },
      { path: '/api/webhooks/payment', methods: ['POST'], description: 'Payment provider webhooks' },
    ],
    databaseModels: ['Order', 'OrderItem', 'ShippingAddress', 'Payment'],
  },
  
  configSchema: {
    fields: [
      { key: 'checkoutStyle', label: 'Checkout Style', type: 'select', required: true,
        options: [{ label: 'Multi-step', value: 'multistep' }, { label: 'Single Page', value: 'single' }],
        defaultValue: 'multistep' },
      { key: 'requireAccount', label: 'Require Account', type: 'boolean', description: 'Force users to create account', defaultValue: false },
      { key: 'enableGuestCheckout', label: 'Enable Guest Checkout', type: 'boolean', defaultValue: true },
      { key: 'enableShippingCalculator', label: 'Show Shipping Calculator', type: 'boolean', defaultValue: true },
      { key: 'enableOrderNotes', label: 'Allow Order Notes', type: 'boolean', defaultValue: true },
      { key: 'enableGiftMessage', label: 'Enable Gift Messages', type: 'boolean', defaultValue: false },
      { key: 'paymentMethods', label: 'Payment Methods', type: 'multiselect', required: true,
        options: [
          { label: 'Credit Card', value: 'card' },
          { label: 'Paystack', value: 'paystack' },
          { label: 'Bank Transfer', value: 'bank_transfer' },
          { label: 'Cash on Delivery', value: 'cod' },
        ],
        defaultValue: ['card', 'paystack'] },
      { key: 'taxCalculation', label: 'Tax Calculation', type: 'select',
        options: [{ label: 'Disabled', value: 'none' }, { label: 'Automatic', value: 'auto' }, { label: 'Manual Rate', value: 'manual' }],
        defaultValue: 'none' },
      { key: 'taxRate', label: 'Manual Tax Rate (%)', type: 'number', defaultValue: 0 },
    ],
    sections: [
      { title: 'Checkout Flow', fields: ['checkoutStyle', 'requireAccount', 'enableGuestCheckout'] },
      { title: 'Payment', fields: ['paymentMethods'] },
      { title: 'Shipping & Tax', fields: ['enableShippingCalculator', 'taxCalculation', 'taxRate'] },
      { title: 'Options', fields: ['enableOrderNotes', 'enableGiftMessage'] },
    ],
  },
  defaultConfig: {
    checkoutStyle: 'multistep',
    requireAccount: false,
    enableGuestCheckout: true,
    enableShippingCalculator: true,
    enableOrderNotes: true,
    enableGiftMessage: false,
    paymentMethods: ['card', 'paystack'],
    taxCalculation: 'none',
    taxRate: 0,
  },
  configRequired: true,
  
  pricing: {
    type: 'free',
  },
  
  stats: {
    installCount: 12350,
    rating: 4.9,
    reviewCount: 289,
    lastUpdated: '2026-02-20',
    createdAt: '2025-11-01',
  },
  
  highlights: [
    'Multi-step or single-page checkout',
    'Guest checkout supported',
    'Multiple payment providers',
    'Automatic tax calculation',
    'Address validation',
  ],
  
  docs: {
    setup: '/docs/addons/checkout-flow/setup',
    api: '/docs/addons/checkout-flow/api',
    faq: '/docs/addons/checkout-flow/faq',
    support: '/support/addons/checkout-flow',
  },
};

// ============================================================================

export const PRODUCT_PAGES_ADDON: AddOnDefinition = {
  id: 'product-pages',
  name: 'Product Pages',
  tagline: 'Beautiful product detail pages with images, variants, and reviews',
  description: `Transform your product listings into conversion-optimized product pages:

- **Image Gallery**: Zoom, lightbox, and thumbnail navigation
- **Variant Selection**: Size, color, and custom variants with price adjustments
- **Stock Display**: Show inventory levels ("Only 3 left!")
- **Related Products**: AI-powered "You may also like" recommendations
- **Social Proof**: Display recent purchases and review count
- **Product Tabs**: Description, specifications, shipping info in tabs
- **Size Guides**: Built-in size chart popups for apparel
- **Wishlist Button**: One-click add to wishlist (requires Wishlist add-on)
- **Share Buttons**: Social sharing for products

Works seamlessly with Shopping Cart and Checkout Flow add-ons.`,
  category: 'ecommerce',
  tags: ['product', 'ecommerce', 'display', 'conversion'],
  icon: 'Package',
  previewImages: {
    thumbnail: '/addons/product-pages/thumbnail.jpg',
    screenshots: [
      '/addons/product-pages/screenshot-1.jpg',
      '/addons/product-pages/screenshot-2.jpg',
    ],
  },
  author: {
    name: 'Vayva',
    url: 'https://vayva.com',
    isVerified: true,
    isOfficial: true,
  },
  version: '1.8.0',
  versionHistory: [
    { version: '1.8.0', date: '2026-02-10', changes: ['Added image zoom feature', 'Improved mobile gallery'] },
    { version: '1.5.0', date: '2026-01-15', changes: ['Added variant swatches', 'Size guide feature'] },
    { version: '1.0.0', date: '2025-11-15', changes: ['Initial release'] },
  ],
  
  compatibleTemplates: [
    'agriculture', 'aquavibe', 'artistry', 'autodealer', 'autolane', 'automotive',
    'baby', 'base', 'beauty', 'books', 'campout', 'cloudhost', 'codecamp', 'courseacademy',
    'craftbrew', 'craftcorner', 'crypto', 'cryptovault', 'edulearn', 'electronics',
    'eventhorizon', 'events', 'fashun', 'fashion', 'fitpulse', 'food', 'freshmarket',
    'furniture', 'gardenia', 'gearvault', 'greenlife', 'grover', 'healthcare', 'homecraft',
    'hoperise', 'hospitality', 'jewelry', 'jobnexus', 'kidspace', 'larkhomes', 'legalease',
    'medibay', 'medicare', 'musicflow', 'nightpulse', 'partypop', 'petcare', 'petpal',
    'photoframe', 'playzone', 'realestate', 'saasflow', 'services', 'sports', 'standard',
    'staysavvy', 'studiobox', 'stylehub', 'techgear', 'toolcraft', 'toys', 'tradehub',
    'travel', 'urbanscape', 'vintagewoods', 'wellness', 'zenith',
  ],
  incompatibleTemplates: [],
  conflictsWith: [],
  requires: [],
  recommended: ['shopping-cart', 'reviews-ratings'],
  minTemplateVersion: '1.0.0',
  
  installationType: 'automatic',
  isDefault: false,
  canUninstall: true,
  installTimeEstimate: 2,
  requiresCodeReview: false,
  
  provides: {
    pages: [
      { route: '/product/[slug]', title: 'Product Detail', description: 'Dynamic product page', layout: 'default' },
    ],
    components: [
      { mountPoint: 'product-detail', componentName: 'ProductGallery', priority: 1 },
      { mountPoint: 'product-detail', componentName: 'ProductInfo', priority: 2 },
      { mountPoint: 'product-detail', componentName: 'ProductVariants', priority: 3 },
      { mountPoint: 'product-detail', componentName: 'ProductTabs', priority: 4 },
      { mountPoint: 'product-detail', componentName: 'RelatedProducts', priority: 10 },
      { mountPoint: 'product-detail', componentName: 'RecentlyViewed', priority: 11 },
      { mountPoint: 'product-card', componentName: 'QuickViewButton', priority: 3, conditions: { pageTypes: ['category', 'home'] } },
    ],
    apiRoutes: [
      { path: '/api/products/[slug]', methods: ['GET'], description: 'Get product details' },
      { path: '/api/products/[slug]/related', methods: ['GET'], description: 'Get related products' },
      { path: '/api/products/[slug]/reviews', methods: ['GET', 'POST'], description: 'Product reviews' },
    ],
  },
  
  configSchema: {
    fields: [
      { key: 'galleryStyle', label: 'Image Gallery Style', type: 'select', required: true,
        options: [{ label: 'Grid with Zoom', value: 'grid-zoom' }, { label: 'Slider', value: 'slider' }, { label: 'Stacked', value: 'stacked' }],
        defaultValue: 'grid-zoom' },
      { key: 'enableZoom', label: 'Enable Image Zoom', type: 'boolean', defaultValue: true },
      { key: 'enableLightbox', label: 'Enable Lightbox', type: 'boolean', defaultValue: true },
      { key: 'showStockLevel', label: 'Show Stock Level', type: 'boolean', defaultValue: true },
      { key: 'lowStockThreshold', label: 'Low Stock Threshold', type: 'number', defaultValue: 5 },
      { key: 'enableRelatedProducts', label: 'Show Related Products', type: 'boolean', defaultValue: true },
      { key: 'relatedProductsCount', label: 'Related Products Count', type: 'number', defaultValue: 4, validation: { min: 1, max: 12 } },
      { key: 'enableSizeGuide', label: 'Enable Size Guide', type: 'boolean', defaultValue: false },
      { key: 'enableSocialShare', label: 'Enable Social Share', type: 'boolean', defaultValue: true },
      { key: 'enableQuickView', label: 'Enable Quick View', type: 'boolean', defaultValue: true },
      { key: 'tabOrder', label: 'Tab Order', type: 'multiselect',
        options: [
          { label: 'Description', value: 'description' },
          { label: 'Specifications', value: 'specs' },
          { label: 'Reviews', value: 'reviews' },
          { label: 'Shipping', value: 'shipping' },
        ],
        defaultValue: ['description', 'specs', 'reviews', 'shipping'] },
    ],
    sections: [
      { title: 'Gallery', fields: ['galleryStyle', 'enableZoom', 'enableLightbox'] },
      { title: 'Inventory', fields: ['showStockLevel', 'lowStockThreshold'] },
      { title: 'Recommendations', fields: ['enableRelatedProducts', 'relatedProductsCount'] },
      { title: 'Features', fields: ['enableSizeGuide', 'enableSocialShare', 'enableQuickView'] },
      { title: 'Content', fields: ['tabOrder'] },
    ],
  },
  defaultConfig: {
    galleryStyle: 'grid-zoom',
    enableZoom: true,
    enableLightbox: true,
    showStockLevel: true,
    lowStockThreshold: 5,
    enableRelatedProducts: true,
    relatedProductsCount: 4,
    enableSizeGuide: false,
    enableSocialShare: true,
    enableQuickView: true,
    tabOrder: ['description', 'specs', 'reviews', 'shipping'],
  },
  configRequired: false,
  
  pricing: {
    type: 'free',
  },
  
  stats: {
    installCount: 14200,
    rating: 4.7,
    reviewCount: 298,
    lastUpdated: '2026-02-10',
    createdAt: '2025-11-15',
  },
  
  highlights: [
    'Beautiful image galleries',
    'Variant swatches and selectors',
    'Related products recommendations',
    'Mobile-optimized layouts',
    'Quick view from category pages',
  ],
  
  docs: {
    setup: '/docs/addons/product-pages/setup',
    api: '/docs/addons/product-pages/api',
    faq: '/docs/addons/product-pages/faq',
    support: '/support/addons/product-pages',
  },
};

// ============================================================================
// ADDITIONAL E-COMMERCE ADD-ONS
// ============================================================================

export const WISHLIST_ADDON: AddOnDefinition = {
  id: 'wishlist',
  name: 'Wishlist',
  tagline: 'Let customers save favorites and share wishlists',
  description: 'Add wishlist functionality to your store. Customers can save items, create multiple wishlists, and share with friends.',
  category: 'ecommerce',
  tags: ['wishlist', 'engagement', 'conversion'],
  icon: 'Heart',
  previewImages: { thumbnail: '/addons/wishlist/thumbnail.jpg', screenshots: [] },
  author: { name: 'Vayva', isVerified: true, isOfficial: true },
  version: '1.2.0',
  versionHistory: [{ version: '1.2.0', date: '2026-01-20', changes: ['Added wishlist sharing'] }],
  
  compatibleTemplates: ['agriculture', 'beauty', 'books', 'crypto', 'electronics', 'events', 'fashion', 'food', 'furniture', 'healthcare', 'hospitality', 'jewelry', 'sports', 'toys', 'travel', 'base', 'standard'],
  conflictsWith: [],
  requires: ['shopping-cart'],
  recommended: [],
  
  installationType: 'automatic',
  isDefault: false,
  canUninstall: true,
  installTimeEstimate: 2,
  
  provides: {
    pages: [
      { route: '/wishlist', title: 'My Wishlist', layout: 'default' },
    ],
    components: [
      { mountPoint: 'header-right', componentName: 'WishlistIcon', priority: 15 },
      { mountPoint: 'product-card', componentName: 'AddToWishlistButton', priority: 2 },
      { mountPoint: 'product-detail', componentName: 'WishlistButton', priority: 5 },
    ],
    apiRoutes: [
      { path: '/api/wishlist', methods: ['GET', 'POST', 'DELETE'] },
    ],
    databaseModels: ['Wishlist', 'WishlistItem'],
  },
  
  configSchema: {
    fields: [
      { key: 'enableMultipleLists', label: 'Allow Multiple Wishlists', type: 'boolean', defaultValue: false },
      { key: 'enableSharing', label: 'Enable Wishlist Sharing', type: 'boolean', defaultValue: true },
      { key: 'showInHeader', label: 'Show in Header', type: 'boolean', defaultValue: true },
    ],
  },
  defaultConfig: { enableMultipleLists: false, enableSharing: true, showInHeader: true },
  configRequired: false,
  
  pricing: { type: 'free' },
  
  stats: { installCount: 8200, rating: 4.6, reviewCount: 156, lastUpdated: '2026-01-20', createdAt: '2025-11-20' },
  highlights: ['Save for later functionality', 'Multiple wishlists', 'Share with friends', 'Guest wishlist support'],
  docs: { setup: '/docs/addons/wishlist/setup' },
};

export const REVIEWS_RATINGS_ADDON: AddOnDefinition = {
  id: 'reviews-ratings',
  name: 'Reviews & Ratings',
  tagline: 'Customer reviews with photos, verified badges, and moderation',
  description: 'Add a complete review system to your products. Customers can leave star ratings, written reviews, and upload photos.',
  category: 'ecommerce',
  tags: ['reviews', 'social-proof', 'seo'],
  icon: 'Star',
  previewImages: { thumbnail: '/addons/reviews/thumbnail.jpg', screenshots: [] },
  author: { name: 'Vayva', isVerified: true, isOfficial: true },
  version: '1.5.0',
  versionHistory: [{ version: '1.5.0', date: '2026-02-01', changes: ['Added photo reviews'] }],
  
  compatibleTemplates: ['agriculture', 'baby', 'beauty', 'books', 'crypto', 'electronics', 'events', 'fashion', 'food', 'furniture', 'healthcare', 'hospitality', 'jewelry', 'sports', 'toys', 'travel', 'base', 'standard'],
  conflictsWith: [],
  requires: [],
  recommended: ['product-pages'],
  
  installationType: 'automatic',
  isDefault: false,
  canUninstall: true,
  installTimeEstimate: 2,
  
  provides: {
    components: [
      { mountPoint: 'product-detail', componentName: 'ProductReviews', priority: 5 },
      { mountPoint: 'product-card', componentName: 'ReviewStars', priority: 1 },
    ],
    apiRoutes: [
      { path: '/api/reviews', methods: ['GET', 'POST'] },
      { path: '/api/reviews/[id]', methods: ['PUT', 'DELETE'] },
    ],
    databaseModels: ['Review', 'ReviewPhoto'],
    dashboardWidgets: [{ id: 'recent-reviews', title: 'Recent Reviews', defaultPosition: { x: 0, y: 0, w: 2, h: 2 } }],
  },
  
  configSchema: {
    fields: [
      { key: 'enablePhotoReviews', label: 'Enable Photo Reviews', type: 'boolean', defaultValue: true },
      { key: 'requireApproval', label: 'Require Moderation', type: 'boolean', defaultValue: true },
      { key: 'verifiedPurchaseOnly', label: 'Verified Purchases Only', type: 'boolean', defaultValue: false },
      { key: 'enableHelpfulVoting', label: 'Enable Helpful Voting', type: 'boolean', defaultValue: true },
      { key: 'minReviewLength', label: 'Minimum Review Length', type: 'number', defaultValue: 10 },
      { key: 'maxReviewLength', label: 'Maximum Review Length', type: 'number', defaultValue: 2000 },
    ],
  },
  defaultConfig: {
    enablePhotoReviews: true,
    requireApproval: true,
    verifiedPurchaseOnly: false,
    enableHelpfulVoting: true,
    minReviewLength: 10,
    maxReviewLength: 2000,
  },
  configRequired: false,
  
  pricing: { type: 'free' },
  
  stats: { installCount: 9800, rating: 4.8, reviewCount: 201, lastUpdated: '2026-02-01', createdAt: '2025-11-10' },
  highlights: ['Photo reviews', 'Verified purchase badges', 'Moderation dashboard', 'Rich snippets for SEO'],
  docs: { setup: '/docs/addons/reviews/setup' },
};

// ============================================================================
// BOOKING & SCHEDULING ADD-ONS
// ============================================================================

export const APPOINTMENT_BOOKING_ADDON: AddOnDefinition = {
  id: 'appointment-booking',
  name: 'Appointment Booking',
  tagline: 'Calendar-based booking for services, consultations, and meetings',
  description: 'Allow customers to book appointments with calendar integration. Supports multiple staff, services, and locations.',
  category: 'booking',
  tags: ['booking', 'appointments', 'services', 'calendar'],
  icon: 'Calendar',
  previewImages: { thumbnail: '/addons/appointment-booking/thumbnail.jpg', screenshots: [] },
  author: { name: 'Vayva', isVerified: true, isOfficial: true },
  version: '2.0.0',
  versionHistory: [{ version: '2.0.0', date: '2026-01-25', changes: ['Added staff management'] }],
  
  compatibleTemplates: ['aquavibe', 'campout', 'craftbrew', 'craftcorner', 'fitpulse', 'healthcare', 'hospitality', 'kidspace', 'legalease', 'medicare', 'musicflow', 'partypop', 'petcare', 'petpal', 'photoframe', 'playzone', 'services', 'staysavvy', 'studiobox', 'wellness'],
  conflictsWith: [],
  requires: [],
  recommended: [],
  
  installationType: 'automatic',
  isDefault: false,
  canUninstall: true,
  installTimeEstimate: 5,
  
  provides: {
    pages: [
      { route: '/book', title: 'Book Appointment', layout: 'default' },
      { route: '/bookings', title: 'My Bookings', layout: 'default' },
    ],
    components: [
      { mountPoint: 'page-sidebar', componentName: 'BookingCalendar', priority: 10 },
      { mountPoint: 'header-nav', componentName: 'BookNowButton', priority: 50 },
    ],
    apiRoutes: [
      { path: '/api/bookings', methods: ['GET', 'POST'] },
      { path: '/api/bookings/availability', methods: ['GET'] },
      { path: '/api/bookings/[id]', methods: ['PUT', 'DELETE'] },
    ],
    databaseModels: ['Booking', 'BookingSlot', 'Service', 'Staff'],
    dashboardWidgets: [
      { id: 'today-bookings', title: "Today's Bookings", defaultPosition: { x: 0, y: 0, w: 2, h: 1 } },
      { id: 'upcoming-appointments', title: 'Upcoming Appointments', defaultPosition: { x: 2, y: 0, w: 2, h: 2 } },
    ],
  },
  
  configSchema: {
    fields: [
      { key: 'bookingWindowDays', label: 'Booking Window (days)', type: 'number', defaultValue: 30 },
      { key: 'slotDuration', label: 'Slot Duration (minutes)', type: 'select', options: [{ label: '15 min', value: '15' }, { label: '30 min', value: '30' }, { label: '1 hour', value: '60' }], defaultValue: '30' },
      { key: 'bufferTime', label: 'Buffer Between Appointments (minutes)', type: 'number', defaultValue: 0 },
      { key: 'enableOnlinePayment', label: 'Require Payment to Book', type: 'boolean', defaultValue: false },
      { key: 'enableReminders', label: 'Send Email Reminders', type: 'boolean', defaultValue: true },
      { key: 'reminderHours', label: 'Reminder Hours Before', type: 'number', defaultValue: 24 },
      { key: 'allowRescheduling', label: 'Allow Customer Rescheduling', type: 'boolean', defaultValue: true },
      { key: 'cancellationPolicy', label: 'Cancellation Policy', type: 'richtext', defaultValue: 'Cancellations must be made at least 24 hours in advance.' },
    ],
  },
  defaultConfig: {
    bookingWindowDays: 30,
    slotDuration: '30',
    bufferTime: 0,
    enableOnlinePayment: false,
    enableReminders: true,
    reminderHours: 24,
    allowRescheduling: true,
    cancellationPolicy: 'Cancellations must be made at least 24 hours in advance.',
  },
  configRequired: true,
  
  pricing: {
    type: 'subscription',
    basePrice: 1900, // $19/month
    billingInterval: 'monthly',
    trialDays: 14,
  },
  
  stats: { installCount: 4500, rating: 4.7, reviewCount: 128, lastUpdated: '2026-01-25', createdAt: '2025-12-01' },
  highlights: ['Calendar integration', 'Staff management', 'Multiple locations', 'Automated reminders', 'Payment integration'],
  docs: { setup: '/docs/addons/appointment-booking/setup' },
};

// ============================================================================
// MARKETING ADD-ONS
// ============================================================================

export const NEWSLETTER_ADDON: AddOnDefinition = {
  id: 'newsletter',
  name: 'Newsletter Signup',
  tagline: 'Email capture with popups, forms, and automation',
  description: 'Grow your email list with customizable signup forms, exit-intent popups, and welcome email automation.',
  category: 'marketing',
  tags: ['email', 'marketing', 'lead-capture', 'automation'],
  icon: 'Mail',
  previewImages: { thumbnail: '/addons/newsletter/thumbnail.jpg', screenshots: [] },
  author: { name: 'Vayva', isVerified: true, isOfficial: true },
  version: '1.3.0',
  versionHistory: [{ version: '1.3.0', date: '2026-02-05', changes: ['Added popup templates'] }],
  
  compatibleTemplates: ['*'], // All templates
  conflictsWith: [],
  requires: [],
  recommended: [],
  
  installationType: 'automatic',
  isDefault: false,
  canUninstall: true,
  installTimeEstimate: 3,
  
  provides: {
    components: [
      { mountPoint: 'footer-widgets', componentName: 'NewsletterSignup', priority: 10 },
      { mountPoint: 'hero-section', componentName: 'EmailCaptureBanner', priority: 5 },
      { mountPoint: 'page-sidebar', componentName: 'NewsletterWidget', priority: 5 },
    ],
    apiRoutes: [
      { path: '/api/newsletter/subscribe', methods: ['POST'] },
      { path: '/api/newsletter/unsubscribe', methods: ['POST'] },
    ],
    databaseModels: ['NewsletterSubscriber'],
    dashboardWidgets: [
      { id: 'subscriber-growth', title: 'Subscriber Growth', defaultPosition: { x: 0, y: 0, w: 3, h: 2 } },
    ],
  },
  
  configSchema: {
    fields: [
      { key: 'enablePopup', label: 'Enable Exit-Intent Popup', type: 'boolean', defaultValue: true },
      { key: 'popupDelay', label: 'Popup Delay (seconds)', type: 'number', defaultValue: 5 },
      { key: 'popupTemplate', label: 'Popup Template', type: 'select', options: [{ label: 'Modern', value: 'modern' }, { label: 'Minimal', value: 'minimal' }, { label: 'Bold', value: 'bold' }], defaultValue: 'modern' },
      { key: 'discountIncentive', label: 'Offer Discount Incentive', type: 'boolean', defaultValue: false },
      { key: 'discountCode', label: 'Discount Code', type: 'string', defaultValue: 'WELCOME10' },
      { key: 'discountPercent', label: 'Discount Percentage', type: 'number', defaultValue: 10 },
      { key: 'doubleOptIn', label: 'Enable Double Opt-In', type: 'boolean', defaultValue: true },
      { key: 'welcomeEmail', label: 'Send Welcome Email', type: 'boolean', defaultValue: true },
    ],
  },
  defaultConfig: {
    enablePopup: true,
    popupDelay: 5,
    popupTemplate: 'modern',
    discountIncentive: false,
    discountCode: 'WELCOME10',
    discountPercent: 10,
    doubleOptIn: true,
    welcomeEmail: true,
  },
  configRequired: false,
  
  pricing: { type: 'free' },
  
  stats: { installCount: 18500, rating: 4.5, reviewCount: 412, lastUpdated: '2026-02-05', createdAt: '2025-10-01' },
  highlights: ['Exit-intent popups', 'Multiple form styles', 'Welcome automation', 'List growth analytics'],
  docs: { setup: '/docs/addons/newsletter/setup' },
};

// ============================================================================
// COMPLETE REGISTRY
// ============================================================================

export const ALL_ADDONS: AddOnDefinition[] = [
  SHOPPING_CART_ADDON,
  CHECKOUT_FLOW_ADDON,
  PRODUCT_PAGES_ADDON,
  WISHLIST_ADDON,
  REVIEWS_RATINGS_ADDON,
  APPOINTMENT_BOOKING_ADDON,
  NEWSLETTER_ADDON,
];

// Registry helpers
export function getAddonById(id: string): AddOnDefinition | undefined {
  return ALL_ADDONS.find(addon => addon.id === id);
}

export function getAddonsByCategory(category: string): AddOnDefinition[] {
  return ALL_ADDONS.filter(addon => addon.category === category);
}

export function getCompatibleAddons(templateId: string): AddOnDefinition[] {
  return ALL_ADDONS.filter(addon => 
    addon.compatibleTemplates.includes(templateId) || 
    addon.compatibleTemplates.includes('*')
  );
}

export function getAddonDependencies(addonId: string): AddOnDefinition[] {
  const addon = getAddonById(addonId);
  if (!addon) return [];
  return addon.requires?.map(id => getAddonById(id)).filter(Boolean) as AddOnDefinition[];
}

// Registry metadata
export const ADDON_REGISTRY_STATS = {
  total: ALL_ADDONS.length,
  byCategory: {
    ecommerce: ALL_ADDONS.filter(a => a.category === 'ecommerce').length,
    booking: ALL_ADDONS.filter(a => a.category === 'booking').length,
    marketing: ALL_ADDONS.filter(a => a.category === 'marketing').length,
  },
  free: ALL_ADDONS.filter(a => a.pricing?.type === 'free').length,
  paid: ALL_ADDONS.filter(a => a.pricing?.type !== 'free').length,
  official: ALL_ADDONS.filter(a => a.author?.isOfficial).length,
  totalInstalls: ALL_ADDONS.reduce((sum, a) => sum + (a.stats?.installCount ?? 0), 0),
};
