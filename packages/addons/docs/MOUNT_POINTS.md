# Add-On Mount Points Guide

This guide explains how to integrate add-on mount points into storefront templates.

## Overview

Mount points are predefined locations in templates where add-ons can inject their components. This allows merchants to extend their storefront functionality without modifying template code.

## Quick Start

### 1. Wrap Your Storefront with AddOnProvider

```tsx
// app/layout.tsx or storefront/layout.tsx
import { AddOnProvider } from '@vayva/addons';

export default function StorefrontLayout({ 
  children,
  params: { storeId }
}: { 
  children: React.ReactNode;
  params: { storeId: string };
}) {
  return (
    <AddOnProvider storeId={storeId}>
      {children}
    </AddOnProvider>
  );
}
```

### 2. Add Mount Points to Templates

```tsx
import { MountPoint } from '@vayva/addons';

// In your product page template
export default function ProductPage() {
  return (
    <div className="product-page">
      <MountPoint id="product-page.header" />
      
      <div className="product-grid">
        <MountPoint id="product-page.gallery" />
        <MountPoint id="product-page.sidebar" />
      </div>
      
      <MountPoint id="product-page.description" />
      <MountPoint id="product-page.reviews" />
      <MountPoint id="product-page.footer" />
    </div>
  );
}
```

## Available Mount Points

### Product Page

| Mount Point ID | Location | Multiple |
|----------------|----------|----------|
| `product-page.header` | Above product title | No |
| `product-page.sidebar` | Product info sidebar | Yes |
| `product-page.gallery` | Image gallery area | No |
| `product-page.description` | Below description | Yes |
| `product-page.reviews` | Reviews section | No |
| `product-page.footer` | Bottom of page | Yes |

### Cart

| Mount Point ID | Location | Multiple |
|----------------|----------|----------|
| `cart.drawer` | Cart drawer content | Yes |
| `cart.empty` | Empty cart state | No |

### Checkout

| Mount Point ID | Location | Multiple |
|----------------|----------|----------|
| `checkout.header` | Top of checkout | No |
| `checkout.sidebar` | Order summary sidebar | Yes |
| `checkout.footer` | Bottom of checkout | Yes |

### Store Layout

| Mount Point ID | Location | Multiple |
|----------------|----------|----------|
| `store.header` | Site-wide header | Yes |
| `store.footer` | Site-wide footer | Yes |
| `store.sidebar` | Global sidebar | Yes |

### Homepage

| Mount Point ID | Location | Multiple |
|----------------|----------|----------|
| `homepage.hero` | Hero section | No |
| `homepage.content` | Main content area | Yes |

### Collection

| Mount Point ID | Location | Multiple |
|----------------|----------|----------|
| `collection.header` | Above products | No |
| `collection.filter` | Filter sidebar | Yes |
| `collection.product-card` | Inside each card | Yes |
| `collection.empty` | Empty collection | No |

## Template Integration Examples

### Product Page Template

```tsx
// templates/product-page.tsx
import { MountPoint } from '@vayva/addons';
import { ProductGallery } from './ProductGallery';
import { ProductInfo } from './ProductInfo';

export function ProductPageTemplate({ product }) {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Add-on header injection */}
      <MountPoint id="product-page.header" />
      
      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        {/* Main gallery with add-on support */}
        <MountPoint 
          id="product-page.gallery"
          className="relative"
        >
          <ProductGallery images={product.images} />
        </MountPoint>
        
        {/* Product info sidebar */}
        <div className="space-y-6">
          <ProductInfo product={product} />
          
          {/* Add-on sidebar widgets */}
          <MountPoint id="product-page.sidebar" />
        </div>
      </div>
      
      {/* Description section */}
      <div className="prose max-w-none mb-12">
        <h2>Description</h2>
        <div dangerouslySetInnerHTML={{ __html: product.description }} />
        
        {/* Add-on description extensions */}
        <MountPoint id="product-page.description" />
      </div>
      
      {/* Reviews section */}
      <div className="mb-12">
        <h2>Customer Reviews</h2>
        <MountPoint id="product-page.reviews" />
      </div>
      
      {/* Footer add-ons */}
      <MountPoint id="product-page.footer" />
    </div>
  );
}
```

### Cart Drawer Template

```tsx
// components/cart/CartDrawer.tsx
import { MountPoint } from '@vayva/addons';

export function CartDrawer({ isOpen, items, onClose }) {
  const isEmpty = items.length === 0;
  
  return (
    <Drawer open={isOpen} onClose={onClose}>
      <div className="cart-drawer">
        <h2>Shopping Cart ({items.length})</h2>
        
        {isEmpty ? (
          <MountPoint id="cart.empty">
            <div className="text-center py-8">
              <ShoppingBag className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-2">Your cart is empty</p>
              <Button onClick={onClose} className="mt-4">
                Continue Shopping
              </Button>
            </div>
          </MountPoint>
        ) : (
          <>
            <div className="cart-items">
              {items.map(item => (
                <CartItem key={item.id} {...item} />
              ))}
            </div>
            
            {/* Add-on cart extensions */}
            <MountPoint id="cart.drawer" />
            
            <div className="cart-footer">
              <div className="subtotal">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <Button className="w-full" onClick={checkout}>
                Checkout
              </Button>
            </div>
          </>
        )}
      </div>
    </Drawer>
  );
}
```

### Checkout Page Template

```tsx
// templates/checkout.tsx
import { MountPoint } from '@vayva/addons';
import { CheckoutForm } from './CheckoutForm';

export function CheckoutTemplate() {
  return (
    <div className="checkout-page">
      <MountPoint id="checkout.header" />
      
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <CheckoutForm />
        </div>
        
        <div className="order-summary">
          <h3>Order Summary</h3>
          <OrderSummary items={cartItems} />
          
          {/* Add-on checkout extensions */}
          <MountPoint id="checkout.sidebar" />
        </div>
      </div>
      
      <MountPoint id="checkout.footer" />
    </div>
  );
}
```

### Store Layout Template

```tsx
// app/storefront/layout.tsx
import { MountPoint } from '@vayva/addons';

export default function StoreLayout({ children }) {
  return (
    <div className="store-layout">
      <header className="store-header">
        <Logo />
        <Navigation />
        <CartIcon />
        
        {/* Add-on header widgets */}
        <MountPoint id="store.header" />
      </header>
      
      <div className="store-body">
        <aside className="store-sidebar">
          <MountPoint id="store.sidebar" />
        </aside>
        
        <main className="store-main">
          {children}
        </main>
      </div>
      
      <footer className="store-footer">
        <FooterContent />
        <MountPoint id="store.footer" />
      </footer>
    </div>
  );
}
```

### Homepage Template

```tsx
// templates/homepage.tsx
import { MountPoint } from '@vayva/addons';

export function HomepageTemplate() {
  return (
    <div className="homepage">
      <section className="hero">
        <MountPoint id="homepage.hero">
          <HeroContent />
        </MountPoint>
      </section>
      
      <section className="featured-products">
        <h2>Featured Products</h2>
        <ProductGrid products={featuredProducts} />
      </section>
      
      {/* Add-on content sections */}
      <MountPoint id="homepage.content" />
      
      <section className="newsletter">
        <NewsletterSignup />
      </section>
    </div>
  );
}
```

### Collection Page Template

```tsx
// templates/collection.tsx
import { MountPoint } from '@vayva/addons';

export function CollectionTemplate({ collection, products }) {
  const isEmpty = products.length === 0;
  
  return (
    <div className="collection-page">
      <MountPoint id="collection.header">
        <CollectionHeader collection={collection} />
      </MountPoint>
      
      <div className="collection-layout">
        <aside className="collection-filters">
          <FilterSidebar />
          <MountPoint id="collection.filter" />
        </aside>
        
        <div className="collection-products">
          {isEmpty ? (
            <MountPoint id="collection.empty">
              <div className="empty-collection">
                <p>No products found</p>
              </div>
            </MountPoint>
          ) : (
            <ProductGrid>
              {products.map(product => (
                <ProductCard key={product.id} product={product}>
                  <MountPoint 
                    id="collection.product-card"
                    className="product-card-addons"
                  />
                </ProductCard>
              ))}
            </ProductGrid>
          )}
        </div>
      </div>
    </div>
  );
}
```

## Advanced Usage

### Conditional Mount Points

```tsx
import { MountPoint, useAddOn } from '@vayva/addons';

function ProductPage() {
  // Check if specific add-on is active
  const wishlistAddOn = useAddOn('wishlist');
  
  return (
    <div>
      {wishlistAddOn?.status === 'ACTIVE' && (
        <MountPoint id="product-wishlist-button" />
      )}
      
      <MountPoint id="product-page.sidebar" />
    </div>
  );
}
```

### Custom Fallback

```tsx
<MountPoint 
  id="product-page.sidebar"
  fallback={<LoadingSkeleton />}
>
  <DefaultProductInfo />
</MountPoint>
```

### Wrapper Element

```tsx
<MountPoint 
  id="store.header"
  wrapper="header"
  className="header-addons"
>
  <Navigation />
</MountPoint>
```

## Best Practices

1. **Always wrap your storefront** with `AddOnProvider` at the layout level
2. **Use semantic wrapper elements** for better accessibility (e.g., `aside`, `header`, `footer`)
3. **Provide sensible defaults** inside mount points for when no add-ons are installed
4. **Use fallbacks** for better loading states
5. **Test with and without** add-ons to ensure graceful degradation
6. **Document mount points** in your template documentation

## Troubleshooting

### Mount points not rendering
- Verify `AddOnProvider` is wrapping your component tree
- Check that the store has active add-ons installed
- Ensure the mount point ID matches exactly (case-sensitive)

### Add-ons not loading
- Check browser console for errors
- Verify the storefront API route is returning add-ons
- Confirm add-on status is `ACTIVE` in the database

### Styling conflicts
- Use the `className` prop on `MountPoint` to scope styles
- Add-ons should use BEM or CSS-in-JS to avoid conflicts

## Migration Guide

### From Legacy Extensions

Replace extension hooks with mount points:

```tsx
// Before
import { useExtension } from '@/lib/extensions';
const { components } = useExtension('product-sidebar');

// After
import { MountPoint } from '@vayva/addons';
<MountPoint id="product-page.sidebar" />
```
