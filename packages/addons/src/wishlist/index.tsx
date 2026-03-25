'use client';
import { Button } from "@vayva/ui";

/**
 * Wishlist Add-On Components
 * 
 * Provides wishlist functionality including:
 * - WishlistButton: Heart icon toggle for products
 * - WishlistDrawer: Slide-out wishlist panel
 * - WishlistPage: Full wishlist management page
 * - WishlistProvider: Context for managing wishlist state
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  X,
  ShoppingCart,
  Trash2,
  ArrowRight,
  Package,
  Share2,
  Bell,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  image?: string;
  inStock: boolean;
  addedAt: string;
  notifyOnRestock: boolean;
}

interface WishlistContextValue {
  items: WishlistItem[];
  isOpen: boolean;
  itemCount: number;
  isLoading: boolean;
  addItem: (item: Omit<WishlistItem, 'id' | 'addedAt'>) => void;
  removeItem: (id: string) => void;
  moveToCart: (id: string) => void;
  toggleNotify: (id: string) => void;
  toggleWishlist: () => void;
  openWishlist: () => void;
  closeWishlist: () => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

// ============================================================================
// WISHLIST CONTEXT
// ============================================================================

const WishlistContext = React.createContext<WishlistContextValue | null>(null);

export function useWishlist(): WishlistContextValue {
  const context = React.useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
}

// ============================================================================
// WISHLIST PROVIDER
// ============================================================================

interface WishlistProviderProps {
  children: React.ReactNode;
  storeId: string;
  maxItems?: number;
}

export function WishlistProvider({ children, storeId, maxItems = 100 }: WishlistProviderProps) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading] = useState(false);

  // Load wishlist from localStorage
  useEffect(() => {
    queueMicrotask(() => {
      const saved = localStorage.getItem(`wishlist_${storeId}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setItems(parsed.items || []);
        } catch {
          // Invalid data
        }
      }
    });
  }, [storeId]);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(`wishlist_${storeId}`, JSON.stringify({ items }));
  }, [items, storeId]);

  const addItem = useCallback((item: Omit<WishlistItem, 'id' | 'addedAt'>) => {
    setItems(prev => {
      // Check if already exists
      if (prev.some(i => i.productId === item.productId)) {
        return prev;
      }
      
      if (prev.length >= maxItems) {
        return prev; // Max items reached
      }

      const newItem: WishlistItem = {
        ...item,
        id: `${item.productId}_${Date.now()}`,
        addedAt: new Date().toISOString(),
      };

      return [newItem, ...prev];
    });
  }, [maxItems]);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const moveToCart = useCallback((id: string) => {
    // This would integrate with cart system
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const toggleNotify = useCallback((id: string) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, notifyOnRestock: !item.notifyOnRestock } : item
      )
    );
  }, []);

  const toggleWishlist = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const openWishlist = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeWishlist = useCallback(() => {
    setIsOpen(false);
  }, []);

  const isInWishlist = useCallback((productId: string) => {
    return items.some(item => item.productId === productId);
  }, [items]);

  const clearWishlist = useCallback(() => {
    setItems([]);
  }, []);

  const value: WishlistContextValue = {
    items,
    isOpen,
    itemCount: items.length,
    isLoading,
    addItem,
    removeItem,
    moveToCart,
    toggleNotify,
    toggleWishlist,
    openWishlist,
    closeWishlist,
    isInWishlist,
    clearWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

// ============================================================================
// WISHLIST BUTTON
// ============================================================================

interface WishlistButtonProps {
  productId: string;
  product: {
    name: string;
    price: number;
    compareAtPrice?: number;
    image?: string;
    inStock?: boolean;
  };
  variant?: 'default' | 'icon' | 'floating';
  className?: string;
  showCount?: boolean;
}

export function WishlistButton({ 
  productId, 
  product, 
  variant = 'default',
  className,
  showCount = false
}: WishlistButtonProps) {
  const { addItem, removeItem, isInWishlist, itemCount, openWishlist } = useWishlist();
  const isWishlisted = isInWishlist(productId);

  const handleToggle = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    
    if (isWishlisted) {
      removeItem(productId);
    } else {
      addItem({
        productId,
        name: product.name,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        image: product.image,
        inStock: product.inStock ?? true,
        notifyOnRestock: false,
      });
    }
  };

  if (variant === 'icon') {
    return (
      <Button
        onClick={handleToggle}
        className={cn(
          'p-2 rounded-lg transition-all',
          isWishlisted 
            ? 'bg-red-50 text-red-500' 
            : 'bg-muted hover:bg-accent',
          className
        )}
        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart className={cn('w-5 h-5', isWishlisted && 'fill-current')} />
      </Button>
    );
  }

  if (variant === 'floating') {
    return (
      <Button
        onClick={isWishlisted ? openWishlist : handleToggle}
        className={cn(
          'fixed bottom-20 right-4 z-40 p-3 rounded-full shadow-lg transition-colors',
          isWishlisted ? 'bg-red-500 text-white' : 'bg-background border',
          className
        )}
        aria-label="Wishlist"
      >
        <div className="relative">
          <Heart className={cn('w-5 h-5', isWishlisted && 'fill-current')} />
          {showCount && itemCount > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </div>
      </Button>
    );
  }

  return (
    <Button
      onClick={handleToggle}
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
        isWishlisted 
          ? 'bg-red-50 text-red-600 border border-red-200' 
          : 'border hover:bg-accent',
        className
      )}
    >
      <Heart className={cn('w-4 h-4', isWishlisted && 'fill-current')} />
      {isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}
    </Button>
  );
}

// ============================================================================
// WISHLIST ICON (Header)
// ============================================================================

interface WishlistIconProps {
  className?: string;
}

export function WishlistIcon({ className }: WishlistIconProps) {
  const { itemCount, toggleWishlist } = useWishlist();

  return (
    <Button
      onClick={toggleWishlist}
      className={cn(
        'relative p-2 rounded-lg hover:bg-accent transition-colors',
        className
      )}
      aria-label={`Wishlist with ${itemCount} items`}
    >
      <Heart className="w-5 h-5" />
      
      {itemCount > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-medium flex items-center justify-center"
        >
          {itemCount > 99 ? '99+' : itemCount}
        </motion.span>
      )}
    </Button>
  );
}

// ============================================================================
// WISHLIST DRAWER
// ============================================================================

interface WishlistDrawerProps {
  className?: string;
}

export function WishlistDrawer({ className }: WishlistDrawerProps) {
  const { isOpen, closeWishlist, items, removeItem, moveToCart, toggleNotify } = useWishlist();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeWishlist}
            className="fixed inset-0 bg-black/50 z-50"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              'fixed right-0 top-0 h-full w-full max-w-md bg-background shadow-2xl z-50',
              className
            )}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  <h2 className="font-semibold">My Wishlist ({items.length})</h2>
                </div>
                <Button 
                  onClick={closeWishlist}
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto">
                {items.length === 0 ? (
                  <EmptyWishlist onClose={closeWishlist} />
                ) : (
                  <div className="divide-y">
                    {items.map((item) => (
                      <WishlistItemRow 
                        key={item.id} 
                        item={item}
                        onRemove={() => removeItem(item.id)}
                        onMoveToCart={() => moveToCart(item.id)}
                        onToggleNotify={() => toggleNotify(item.id)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {items.length > 0 && (
                <div className="border-t p-4 space-y-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{items.length} items</span>
                    <span>
                      ₦{items.reduce((sum, item) => sum + item.price, 0).toLocaleString()} total
                    </span>
                  </div>
                  
                  <Button
                    onClick={closeWishlist}
                    className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    Continue Shopping
                    <ArrowRight className="w-4 h-4" />
                  </Button>
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
// WISHLIST ITEM ROW
// ============================================================================

function WishlistItemRow({ 
  item, 
  onRemove, 
  onMoveToCart,
  onToggleNotify 
}: { 
  item: WishlistItem;
  onRemove: () => void;
  onMoveToCart: () => void;
  onToggleNotify: () => void;
}) {
  const discount = item.compareAtPrice 
    ? Math.round(((item.compareAtPrice - item.price) / item.compareAtPrice) * 100)
    : 0;

  return (
    <div className="p-4 flex gap-4">
      {/* Image */}
      <a href={`/products/${item.productId}`} className="w-20 h-20 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <Package className="w-8 h-8 text-muted-foreground m-auto" />
        )}
      </a>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <a href={`/products/${item.productId}`}>
          <h3 className="font-medium truncate hover:text-primary transition-colors">
            {item.name}
          </h3>
        </a>

        {/* Price */}
        <div className="flex items-center gap-2 mt-1">
          <span className="font-semibold">₦{item.price.toLocaleString()}</span>
          {item.compareAtPrice && (
            <>
              <span className="text-sm text-muted-foreground line-through">
                ₦{item.compareAtPrice.toLocaleString()}
              </span>
              <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                -{discount}%
              </span>
            </>
          )}
        </div>

        {/* Stock Status */}
        {!item.inStock && (
          <div className="mt-2">
            <span className="text-xs text-orange-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Out of Stock
            </span>
            <Button
              onClick={onToggleNotify}
              className={cn(
                'mt-1 text-xs flex items-center gap-1 transition-colors',
                item.notifyOnRestock ? 'text-green-600' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Bell className="w-3 h-3" />
              {item.notifyOnRestock ? 'You\'ll be notified' : 'Notify when available'}
            </Button>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3">
          <Button
            onClick={onMoveToCart}
            disabled={!item.inStock}
            className="flex-1 py-2 px-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
          >
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </Button>
          <Button
            onClick={onRemove}
            className="p-2 text-muted-foreground hover:text-destructive transition-colors"
            aria-label="Remove from wishlist"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// EMPTY WISHLIST
// ============================================================================

function EmptyWishlist({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Heart className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-lg mb-2">Your wishlist is empty</h3>
      <p className="text-muted-foreground text-center mb-6">
        Save items you love to your wishlist and buy them later.
      </p>
      <Button
        onClick={onClose}
        className="py-2 px-6 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
      >
        Start Shopping
      </Button>
    </div>
  );
}

// ============================================================================
// WISHLIST PAGE (Full Page)
// ============================================================================

interface WishlistPageProps {
  className?: string;
}

export function WishlistPage({ className }: WishlistPageProps) {
  const { items, removeItem, moveToCart, clearWishlist } = useWishlist();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const toggleSelect = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedItems(items.map(i => i.id));
  };

  const deselectAll = () => {
    setSelectedItems([]);
  };

  const handleBulkRemove = () => {
    selectedItems.forEach(id => removeItem(id));
    setSelectedItems([]);
  };

  const handleBulkMoveToCart = () => {
    selectedItems.forEach(id => moveToCart(id));
    setSelectedItems([]);
  };

  return (
    <div className={cn('max-w-4xl mx-auto', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Wishlist</h1>
          <p className="text-muted-foreground">{items.length} items saved</p>
        </div>
        {items.length > 0 && (
          <Button
            onClick={clearWishlist}
            className="text-sm text-destructive hover:underline"
          >
            Clear All
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border">
          <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
          <p className="text-muted-foreground mb-6">
            Items you add to your wishlist will appear here.
          </p>
          <a
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Browse Products
          </a>
        </div>
      ) : (
        <>
          {/* Bulk Actions */}
          {selectedItems.length > 0 && (
            <div className="flex items-center justify-between mb-4 p-3 bg-primary/5 rounded-lg">
              <span className="text-sm font-medium">
                {selectedItems.length} items selected
              </span>
              <div className="flex gap-2">
                <Button
                  onClick={handleBulkMoveToCart}
                  className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg"
                >
                  Add to Cart
                </Button>
                <Button
                  onClick={handleBulkRemove}
                  className="px-3 py-1.5 text-sm border rounded-lg hover:bg-accent"
                >
                  Remove
                </Button>
              </div>
            </div>
          )}

          {/* Select All */}
          <div className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              checked={selectedItems.length === items.length}
              onChange={selectedItems.length === items.length ? deselectAll : selectAll}
              className="rounded border-input"
            />
            <span className="text-sm text-muted-foreground">
              {selectedItems.length === items.length ? 'Deselect All' : 'Select All'}
            </span>
          </div>

          {/* Items Grid */}
          <div className="grid gap-4">
            {items.map((item) => (
              <div 
                key={item.id} 
                className="flex items-center gap-4 p-4 bg-card rounded-xl border"
              >
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={() => toggleSelect(item.id)}
                  className="rounded border-input"
                />
                
                <a 
                  href={`/products/${item.productId}`}
                  className="w-24 h-24 bg-muted rounded-lg flex-shrink-0 overflow-hidden"
                >
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-8 h-8 text-muted-foreground m-auto" />
                  )}
                </a>

                <div className="flex-1 min-w-0">
                  <a href={`/products/${item.productId}`}>
                    <h3 className="font-medium hover:text-primary transition-colors">
                      {item.name}
                    </h3>
                  </a>
                  <p className="font-semibold mt-1">₦{item.price.toLocaleString()}</p>
                  
                  {!item.inStock && (
                    <p className="text-sm text-orange-600 mt-1">Out of Stock</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => moveToCart(item.id)}
                    disabled={!item.inStock}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    Add to Cart
                  </Button>
                  <Button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================================
// SHARE WISHLIST
// ============================================================================

interface ShareWishlistProps {
  className?: string;
}

export function ShareWishlist({ className }: ShareWishlistProps) {
  const { items } = useWishlist();
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/wishlist/share?items=${items.map(i => i.productId).join(',')}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  if (items.length === 0) return null;

  return (
    <Button
      onClick={handleShare}
      className={cn(
        'flex items-center gap-2 px-4 py-2 border rounded-lg font-medium transition-colors',
        copied ? 'bg-green-50 text-green-600 border-green-200' : 'hover:bg-accent',
        className
      )}
    >
      <Share2 className="w-4 h-4" />
      {copied ? 'Copied!' : 'Share Wishlist'}
    </Button>
  );
}

