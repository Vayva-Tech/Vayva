'use client';

/**
 * Shopping Cart Add-On Components
 * 
 * Provides cart functionality including:
 * - CartIcon: Header cart icon with item count
 * - CartDrawer: Slide-out cart panel
 * - AddToCartButton: Product card add-to-cart button
 * - ProductPurchaseSection: Product detail purchase controls
 * - FloatingCartButton: Floating cart button on mobile
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  X,
  ArrowRight,
  Heart,
  ShoppingBag,
  Package,
  Truck,
  CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// CART CONTEXT & HOOKS
// ============================================================================

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variant?: { name: string; value: string }[];
  maxQuantity?: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  isLoading: boolean;
  savedForLater: CartItem[];
}

interface CartContextValue extends CartState {
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  moveToSaved: (id: string) => void;
  moveToCart: (id: string) => void;
  removeFromSaved: (id: string) => void;
  itemCount: number;
  subtotal: number;
}

const CartContext = React.createContext<CartContextValue | null>(null);

export function useCart(): CartContextValue {
  const context = React.useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}

// ============================================================================
// CART PROVIDER
// ============================================================================

interface CartProviderProps {
  children: React.ReactNode;
  config?: {
    enableGuestCart?: boolean;
    enableSaveForLater?: boolean;
    maxCartItems?: number;
    freeShippingThreshold?: number;
  };
  storeId: string;
}

export function CartProvider({ children, config = {}, storeId }: CartProviderProps) {
  const [state, setState] = useState<CartState>({
    items: [],
    isOpen: false,
    isLoading: false,
    savedForLater: [],
  });

  // Load cart from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(`cart_${storeId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState(prev => ({
          ...prev,
          items: parsed.items || [],
          savedForLater: parsed.savedForLater || [],
        }));
      } catch {
        // Invalid cart data, ignore
      }
    }
  }, [storeId]);

  // Save cart to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(`cart_${storeId}`, JSON.stringify({
      items: state.items,
      savedForLater: state.savedForLater,
    }));
  }, [state.items, state.savedForLater, storeId]);

  const addItem = useCallback((item: Omit<CartItem, 'id'>) => {
    setState(prev => {
      // Check if item already exists with same variant
      const existingIndex = prev.items.findIndex(i => 
        i.productId === item.productId && 
        JSON.stringify(i.variant) === JSON.stringify(item.variant)
      );

      if (existingIndex >= 0) {
        // Update existing item
        const newItems = [...prev.items];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: Math.min(
            newItems[existingIndex].quantity + item.quantity,
            item.maxQuantity || 99
          ),
        };
        return { ...prev, items: newItems, isOpen: true };
      }

      // Add new item
      const newItem: CartItem = {
        ...item,
        id: `${item.productId}_${Date.now()}`,
      };

      return { 
        ...prev, 
        items: [...prev.items, newItem],
        isOpen: true,
      };
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id),
    }));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity < 1) return;
    
    setState(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === id 
          ? { ...item, quantity: Math.min(quantity, item.maxQuantity || 99) }
          : item
      ),
    }));
  }, []);

  const clearCart = useCallback(() => {
    setState(prev => ({ ...prev, items: [] }));
  }, []);

  const toggleCart = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: !prev.isOpen }));
  }, []);

  const openCart = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: true }));
  }, []);

  const closeCart = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const moveToSaved = useCallback((id: string) => {
    setState(prev => {
      const item = prev.items.find(i => i.id === id);
      if (!item) return prev;
      
      return {
        ...prev,
        items: prev.items.filter(i => i.id !== id),
        savedForLater: [...prev.savedForLater, item],
      };
    });
  }, []);

  const moveToCart = useCallback((id: string) => {
    setState(prev => {
      const item = prev.savedForLater.find(i => i.id === id);
      if (!item) return prev;
      
      return {
        ...prev,
        savedForLater: prev.savedForLater.filter(i => i.id !== id),
        items: [...prev.items, item],
        isOpen: true,
      };
    });
  }, []);

  const removeFromSaved = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      savedForLater: prev.savedForLater.filter(i => i.id !== id),
    }));
  }, []);

  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const value: CartContextValue = {
    ...state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    toggleCart,
    openCart,
    closeCart,
    moveToSaved,
    moveToCart,
    removeFromSaved,
    itemCount,
    subtotal,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

// ============================================================================
// CART ICON (Header Component)
// ============================================================================

interface CartIconProps {
  className?: string;
  iconColor?: string;
  showCount?: boolean;
}

export function CartIcon({ className, iconColor = 'currentColor', showCount = true }: CartIconProps) {
  const { itemCount, toggleCart } = useCart();

  return (
    <button
      onClick={toggleCart}
      className={cn(
        'relative p-2 rounded-lg hover:bg-accent transition-colors',
        className
      )}
      aria-label={`Shopping cart with ${itemCount} items`}
    >
      <ShoppingCart className="w-5 h-5" style={{ color: iconColor }} />
      
      {showCount && itemCount > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={cn(
            'absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-medium flex items-center justify-center',
            itemCount > 9 ? 'bg-destructive text-destructive-foreground' : 'bg-primary text-primary-foreground'
          )}
        >
          {itemCount > 99 ? '99+' : itemCount}
        </motion.span>
      )}
    </button>
  );
}

// ============================================================================
// CART DRAWER
// ============================================================================

interface CartDrawerProps {
  cartStyle?: 'drawer' | 'modal' | 'page';
  enableSaveForLater?: boolean;
  freeShippingThreshold?: number;
}

export function CartDrawer({ 
  cartStyle = 'drawer',
  enableSaveForLater = true,
  freeShippingThreshold = 0 
}: CartDrawerProps) {
  const { 
    isOpen, 
    closeCart, 
    items, 
    subtotal, 
    removeItem, 
    updateQuantity,
    savedForLater,
    moveToSaved,
    moveToCart,
    removeFromSaved,
  } = useCart();

  const remainingForFreeShipping = freeShippingThreshold > 0 
    ? Math.max(0, freeShippingThreshold - subtotal)
    : 0;

  const progressPercent = freeShippingThreshold > 0
    ? Math.min(100, (subtotal / freeShippingThreshold) * 100)
    : 0;

  if (cartStyle === 'page') return null; // Full page cart is a separate route

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/50 z-50"
          />
          
          {/* Drawer/Modal */}
          <motion.div
            initial={cartStyle === 'drawer' ? { x: '100%' } : { opacity: 0, scale: 0.95 }}
            animate={cartStyle === 'drawer' ? { x: 0 } : { opacity: 1, scale: 1 }}
            exit={cartStyle === 'drawer' ? { x: '100%' } : { opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              'fixed z-50 bg-background shadow-2xl overflow-hidden',
              cartStyle === 'drawer' 
                ? 'right-0 top-0 h-full w-full max-w-md' 
                : 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg rounded-xl max-h-[90vh]'
            )}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  <h2 className="font-semibold">Your Cart ({items.length})</h2>
                </div>
                <button 
                  onClick={closeCart}
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                  aria-label="Close cart"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Free Shipping Progress */}
              {freeShippingThreshold > 0 && (
                <div className="px-4 py-3 bg-muted/50 border-b">
                  {remainingForFreeShipping > 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Add <span className="font-medium text-foreground">₦{remainingForFreeShipping.toLocaleString()}</span> more for free shipping
                    </p>
                  ) : (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <Truck className="w-4 h-4" />
                      You qualify for free shipping!
                    </p>
                  )}
                  <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto">
                {items.length === 0 ? (
                  <EmptyCart onClose={closeCart} />
                ) : (
                  <div className="divide-y">
                    {items.map((item) => (
                      <CartItemRow 
                        key={item.id} 
                        item={item}
                        onUpdateQuantity={updateQuantity}
                        onRemove={removeItem}
                        onSaveForLater={enableSaveForLater ? moveToSaved : undefined}
                      />
                    ))}
                  </div>
                )}

                {/* Saved for Later */}
                {enableSaveForLater && savedForLater.length > 0 && (
                  <div className="mt-6">
                    <h3 className="px-4 py-2 text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      Saved for Later ({savedForLater.length})
                    </h3>
                    <div className="divide-y">
                      {savedForLater.map((item) => (
                        <SavedItemRow
                          key={item.id}
                          item={item}
                          onMoveToCart={moveToCart}
                          onRemove={removeFromSaved}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              {items.length > 0 && (
                <div className="border-t p-4 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">₦{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="text-muted-foreground">Calculated at checkout</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={closeCart}
                      className="flex-1 py-3 px-4 border rounded-lg font-medium hover:bg-accent transition-colors"
                    >
                      Continue Shopping
                    </button>
                    <button
                      className="flex-1 py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                    >
                      Checkout
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// CART ITEM ROW
// ============================================================================

function CartItemRow({ 
  item, 
  onUpdateQuantity, 
  onRemove,
  onSaveForLater 
}: { 
  item: CartItem;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onSaveForLater?: (id: string) => void;
}) {
  return (
    <div className="p-4 flex gap-4">
      {/* Product Image */}
      <div className="w-20 h-20 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium truncate">{item.name}</h3>
        
        {/* Variants */}
        {item.variant && item.variant.length > 0 && (
          <p className="text-sm text-muted-foreground mt-0.5">
            {item.variant.map(v => `${v.name}: ${v.value}`).join(', ')}
          </p>
        )}

        {/* Price */}
        <p className="font-semibold mt-1">₦{(item.price * item.quantity).toLocaleString()}</p>

        {/* Quantity Controls */}
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center border rounded-lg">
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="p-1.5 hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              disabled={item.maxQuantity ? item.quantity >= item.maxQuantity : false}
              className="p-1.5 hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 ml-auto">
            {onSaveForLater && (
              <button
                onClick={() => onSaveForLater(item.id)}
                className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Save for later"
              >
                <Heart className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => onRemove(item.id)}
              className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
              aria-label="Remove item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SAVED ITEM ROW
// ============================================================================

function SavedItemRow({ 
  item, 
  onMoveToCart, 
  onRemove 
}: { 
  item: CartItem;
  onMoveToCart: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="p-4 flex gap-4 opacity-75">
      <div className="w-16 h-16 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <Package className="w-6 h-6 text-muted-foreground m-auto" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm truncate">{item.name}</h3>
        <p className="text-sm text-muted-foreground">₦{item.price.toLocaleString()}</p>
        
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => onMoveToCart(item.id)}
            className="text-xs text-primary hover:underline"
          >
            Move to Cart
          </button>
          <span className="text-muted-foreground">·</span>
          <button
            onClick={() => onRemove(item.id)}
            className="text-xs text-muted-foreground hover:text-destructive"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// EMPTY CART
// ============================================================================

function EmptyCart({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <ShoppingCart className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-lg mb-2">Your cart is empty</h3>
      <p className="text-muted-foreground text-center mb-6">
        Looks like you haven&apos;t added anything to your cart yet.
      </p>
      <button
        onClick={onClose}
        className="py-2 px-6 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
      >
        Start Shopping
      </button>
    </div>
  );
}

// ============================================================================
// ADD TO CART BUTTON
// ============================================================================

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    image?: string;
    variants?: { name: string; value: string }[];
    maxQuantity?: number;
  };
  variant?: 'default' | 'icon' | 'full';
  className?: string;
  showQuantity?: boolean;
}

export function AddToCartButton({ 
  product, 
  variant = 'default',
  className,
  showQuantity = true,
}: AddToCartButtonProps) {
  const { addItem, openCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const handleAdd = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.image,
      variant: product.variants,
      maxQuantity: product.maxQuantity,
    });
    
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleAdd}
        className={cn(
          'p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all',
          isAdded && 'bg-green-500',
          className
        )}
        aria-label="Add to cart"
      >
        {isAdded ? <ShoppingBag className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
      </button>
    );
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {showQuantity && (
        <div className="flex items-center border rounded-lg">
          <button
            onClick={() => setQuantity(q => Math.max(1, q - 1))}
            className="p-2 hover:bg-accent"
            aria-label="Decrease quantity"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-10 text-center font-medium">{quantity}</span>
          <button
            onClick={() => setQuantity(q => q + 1)}
            className="p-2 hover:bg-accent"
            aria-label="Increase quantity"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}
      
      <button
        onClick={handleAdd}
        disabled={isAdded}
        className={cn(
          'flex-1 py-2.5 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2',
          isAdded 
            ? 'bg-green-500 text-white' 
            : 'bg-primary text-primary-foreground hover:bg-primary/90'
        )}
      >
        {isAdded ? (
          <>
            <ShoppingBag className="w-4 h-4" />
            Added!
          </>
        ) : (
          <>
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </>
        )}
      </button>
    </div>
  );
}

// ============================================================================
// PRODUCT PURCHASE SECTION
// ============================================================================

interface ProductPurchaseSectionProps {
  product: {
    id: string;
    name: string;
    price: number;
    compareAtPrice?: number;
    image?: string;
    variants?: { name: string; options: string[] }[];
    maxQuantity?: number;
    inStock?: boolean;
    stockQuantity?: number;
  };
  className?: string;
}

export function ProductPurchaseSection({ product, className }: ProductPurchaseSectionProps) {
  const { addItem } = useCart();
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    const variantArray = Object.entries(selectedVariants).map(([name, value]) => ({
      name,
      value,
    }));

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.image,
      variant: variantArray,
      maxQuantity: product.maxQuantity,
    });
  };

  const discount = product.compareAtPrice 
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Price */}
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold">₦{product.price.toLocaleString()}</span>
        {product.compareAtPrice && (
          <>
            <span className="text-lg text-muted-foreground line-through">
              ₦{product.compareAtPrice.toLocaleString()}
            </span>
            <span className="text-sm text-green-600 font-medium">
              Save {discount}%
            </span>
          </>
        )}
      </div>

      {/* Variants */}
      {product.variants?.map((variant) => (
        <div key={variant.name} className="space-y-2">
          <label className="text-sm font-medium">
            {variant.name}: {selectedVariants[variant.name] || 'Select an option'}
          </label>
          <div className="flex flex-wrap gap-2">
            {variant.options.map((option) => (
              <button
                key={option}
                onClick={() => setSelectedVariants(prev => ({ ...prev, [variant.name]: option }))}
                className={cn(
                  'px-3 py-1.5 text-sm border rounded-lg transition-colors',
                  selectedVariants[variant.name] === option
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'hover:bg-accent'
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Stock Status */}
      {product.stockQuantity !== undefined && (
        <p className={cn(
          'text-sm',
          product.stockQuantity > 10 ? 'text-green-600' : 
          product.stockQuantity > 0 ? 'text-orange-500' : 'text-destructive'
        )}>
          {product.stockQuantity > 10 ? '✓ In Stock' : 
           product.stockQuantity > 0 ? `Only ${product.stockQuantity} left` : 
           'Out of Stock'}
        </p>
      )}

      {/* Quantity & Add to Cart */}
      <div className="flex items-center gap-3 pt-2">
        <div className="flex items-center border rounded-lg">
          <button
            onClick={() => setQuantity(q => Math.max(1, q - 1))}
            className="p-3 hover:bg-accent"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-12 text-center font-medium">{quantity}</span>
          <button
            onClick={() => setQuantity(q => Math.min(product.maxQuantity || 99, q + 1))}
            className="p-3 hover:bg-accent"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={product.inStock === false}
          className="flex-1 py-3 px-6 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <ShoppingCart className="w-5 h-5" />
          Add to Cart
        </button>
      </div>

      {/* Trust Badges */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground pt-4 border-t">
        <span className="flex items-center gap-1">
          <Truck className="w-4 h-4" />
          Free shipping over ₦50,000
        </span>
        <span className="flex items-center gap-1">
          <CreditCard className="w-4 h-4" />
          Secure checkout
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// FLOATING CART BUTTON (Mobile)
// ============================================================================

interface FloatingCartButtonProps {
  className?: string;
}

export function FloatingCartButton({ className }: FloatingCartButtonProps) {
  const { itemCount, subtotal, toggleCart } = useCart();

  if (itemCount === 0) return null;

  return (
    <motion.button
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      onClick={toggleCart}
      className={cn(
        'fixed bottom-4 left-4 right-4 z-40 bg-primary text-primary-foreground',
        'rounded-xl shadow-lg px-4 py-3 flex items-center justify-between',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <div className="relative">
          <ShoppingCart className="w-5 h-5" />
          <span className="absolute -top-2 -right-2 w-5 h-5 bg-white text-primary text-xs font-bold rounded-full flex items-center justify-center">
            {itemCount}
          </span>
        </div>
        <span className="font-medium">View Cart</span>
      </div>
      <span className="font-semibold">₦{subtotal.toLocaleString()}</span>
    </motion.button>
  );
}
