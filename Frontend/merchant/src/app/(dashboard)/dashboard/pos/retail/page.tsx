'use client';

import { useState, useEffect, useCallback } from 'react';
import { POSProvider, usePOS, POSCartItem as CartItemType } from '@/components/pos/POSProvider';
import { POSProductGrid } from './POSProductGrid';
import { POSCart } from './POSCart';
import { POSTopBar } from './POSTopBar';
import { Button } from '@vayva/ui/components/ui/button';
import { ShoppingCart, ScanLine } from 'lucide-react';
import { posApi, POSTable } from '@/lib/pos-api-client';
import { useMerchant } from '@/hooks/useMerchant';
import { toast } from 'sonner';

interface RetailPOSInnerProps {
  storeId: string;
}

function RetailPOSInner({ storeId }: RetailPOSInnerProps) {
  const { addItem, clearCart, calculateTotals } = usePOS();
  const { merchant } = useMerchant();
  const [searchQuery, setSearchQuery] = useState('');
  const [barcode, setBarcode] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [products, setProducts] = useState<POSTable[]>([]);
  const [loading, setLoading] = useState(true);

  // Load products from API
  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const response = await posApi.getItems(storeId);
        if (response.success) {
          setProducts(response.data);
        }
      } catch (error) {
        console.error('Failed to load products:', error);
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [storeId]);

  // Handle barcode scan
  useEffect(() => {
    if (barcode.length > 8) {
      const product = products.find(p => p.metadata?.barcode === barcode || p.name.includes(barcode));
      if (product) {
        handleAddToCart(product);
        setBarcode('');
      }
    }
  }, [barcode, products]);

  const handleAddToCart = useCallback((product: POSTable) => {
    const cartItem: CartItemType = {
      posItemId: product.id,
      name: product.name,
      price: Number(product.price),
      quantity: 1,
      discount: 0,
      notes: undefined,
      modifiers: [],
    };
    addItem(cartItem);
    toast.success(`Added ${product.name} to cart`);
  }, [addItem]);

  // Auto-focus barcode scanner
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // If we're not in an input field, focus on barcode
      if (
        e.target instanceof HTMLElement &&
        e.target.tagName !== 'INPUT' &&
        e.target.tagName !== 'TEXTAREA'
      ) {
        const barcodeInput = document.getElementById('barcode-scanner');
        if (barcodeInput) {
          barcodeInput.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const totals = calculateTotals();
  const cartItemCount = usePOS().state.cart.length;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top Bar */}
      <POSTopBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        barcode={barcode}
        onBarcodeChange={setBarcode}
        cartCount={cartItemCount}
      />

      {/* Main Content - Responsive layout */}
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        {/* Left: Product Grid - Full width on mobile */}
        <div className="flex-1 overflow-auto p-4 md:p-6 w-full md:w-auto">
          <POSProductGrid
            products={products}
            loading={loading}
            searchQuery={searchQuery}
            onAddToCart={handleAddToCart}
          />
        </div>

        {/* Right: Cart - Slide-in panel on mobile, fixed sidebar on desktop */}
        <div className="w-full md:w-96 bg-white border-t md:border-l border-gray-200 flex flex-col h-[40vh] md:h-full fixed md:relative bottom-0 md:bottom-auto z-10 shadow-lg md:shadow-none">
          {cartItemCount === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
              <ShoppingCart className="h-16 w-16 mb-4" />
              <p className="text-lg font-medium">Cart is empty</p>
              <p className="text-sm">Scan a barcode or select products to start</p>
            </div>
          ) : (
            <>
              <POSCart />
              <div className="p-4 border-t border-gray-200">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">₦{totals.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (7.5%):</span>
                    <span className="font-medium">₦{totals.totalTax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total:</span>
                    <span>₦{totals.total.toLocaleString()}</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => setShowCheckout(true)}
                >
                  Checkout - ₦{totals.total.toLocaleString()}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function RetailPOS() {
  // In real implementation, get storeId from context/auth
  const storeId = 'store_123'; 

  return (
    <POSProvider>
      <RetailPOSInner storeId={storeId} />
    </POSProvider>
  );
}
