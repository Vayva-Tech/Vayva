'use client';

import { useState, useEffect } from 'react';
import { POSProvider, usePOS, POSCartItem as CartItemType } from '@/components/pos/POSProvider';
import { Button } from '@vayva/ui/components/ui/button';
import { Input } from '@vayva/ui/components/ui/input';
import { ScrollArea } from '@vayva/ui/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@vayva/ui/components/ui/tabs';
import { posApi, POSTable } from '@/lib/pos-api-client';
import { useMerchant } from '@/hooks/useMerchant';
import { toast } from 'sonner';
import { 
  UtensilsCrossed, 
  Users, 
  Clock, 
  Plus, 
  Minus, 
  Trash2,
  Search,
  ChefHat
} from 'lucide-react';

interface Table {
  id: string;
  name: string;
  seats: number;
  status: 'available' | 'occupied' | 'reserved';
}

interface RestaurantPOSInnerProps {
  storeId: string;
}

function RestaurantPOSInner({ storeId }: RestaurantPOSInnerProps) {
  const { addItem, state, removeItem, updateQuantity, calculateTotals } = usePOS();
  const { merchant } = useMerchant();
  const [menuItems, setMenuItems] = useState<POSTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'dine-in' | 'takeout' | 'delivery'>('dine-in');

  // Mock tables - in real app, fetch from API
  const tables: Table[] = [
    { id: '1', name: 'Table 1', seats: 4, status: 'available' },
    { id: '2', name: 'Table 2', seats: 2, status: 'occupied' },
    { id: '3', name: 'Table 3', seats: 6, status: 'available' },
    { id: '4', name: 'Table 4', seats: 4, status: 'reserved' },
    { id: '5', name: 'Table 5', seats: 8, status: 'available' },
  ];

  // Load menu items
  useEffect(() => {
    async function loadMenu() {
      try {
        setLoading(true);
        const response = await posApi.getItems(storeId, { type: 'PRODUCT' });
        if (response.success) {
          setMenuItems(response.data);
        }
      } catch (error) {
        console.error('Failed to load menu:', error);
        toast.error('Failed to load menu items');
      } finally {
        setLoading(false);
      }
    }

    loadMenu();
  }, [storeId]);

  const handleAddToCart = (item: POSTable) => {
    const cartItem: CartItemType = {
      posItemId: item.id,
      name: item.name,
      price: Number(item.price),
      quantity: 1,
      discount: 0,
      notes: undefined,
      modifiers: [],
    };
    addItem(cartItem);
    toast.success(`Added ${item.name} to order`);
  };

  const filteredItems = menuItems.filter(item => 
    !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totals = calculateTotals();
  const cartItemCount = state.cart.length;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <ChefHat className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Restaurant POS</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant={activeTab === 'dine-in' ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab('dine-in')}>
              Dine-In
            </Button>
            <Button variant={activeTab === 'takeout' ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab('takeout')}>
              Takeout
            </Button>
            <Button variant={activeTab === 'delivery' ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab('delivery')}>
              Delivery
            </Button>
          </div>
        </div>

        {/* Table Selection for Dine-In */}
        {activeTab === 'dine-in' && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {tables.map((table) => (
              <Button
                key={table.id}
                variant={selectedTable === table.id ? 'default' : 'outline'}
                className={`min-w-[120px] ${
                  table.status === 'occupied' ? 'border-red-500' :
                  table.status === 'reserved' ? 'border-yellow-500' : ''
                }`}
                onClick={() => setSelectedTable(table.id)}
                disabled={table.status !== 'available' && !selectedTable}
              >
                <div className="flex flex-col items-center">
                  <span className="font-medium">{table.name}</span>
                  <span className="text-xs">{table.seats} seats</span>
                  <span className="text-xs capitalize">{table.status}</span>
                </div>
              </Button>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Main Content - Responsive */}
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        {/* Left: Menu Items Grid - Full width on mobile */}
        <div className="flex-1 overflow-auto p-4 md:p-6 w-full md:w-auto">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="p-4 bg-white rounded-lg border animate-pulse">
                  <div className="bg-gray-200 h-24 rounded mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <UtensilsCrossed className="h-16 w-16 mx-auto mb-4" />
              <p className="text-lg">No menu items found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleAddToCart(item)}
                  className="p-4 bg-white rounded-lg border hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="aspect-square bg-gray-100 rounded mb-3 flex items-center justify-center">
                    <UtensilsCrossed className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="font-medium text-sm mb-1">{item.name}</h3>
                  <p className="text-xs text-gray-500 mb-2">
                    {(item.metadata?.prepTime as string) || 'N/A'} min
                  </p>
                  <div className="text-lg font-bold">₦{Number(item.price).toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Order Panel - Slide-up on mobile */}
        <div className="w-full md:w-96 bg-white border-t md:border-l border-gray-200 flex flex-col h-[45vh] md:h-full fixed md:relative bottom-0 md:bottom-auto z-10 shadow-lg md:shadow-none">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-lg">Current Order</h2>
            {selectedTable && (
              <p className="text-sm text-gray-500 mt-1">
                {tables.find(t => t.id === selectedTable)?.name}
              </p>
            )}
          </div>

          {cartItemCount === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
              <UtensilsCrossed className="h-16 w-16 mb-4" />
              <p className="text-lg font-medium">Order is empty</p>
              <p className="text-sm">Select menu items to start</p>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {state.cart.map((item, index) => (
                    <div key={`${item.posItemId}-${index}`} className="p-3 bg-gray-50 rounded-lg border">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.name}</h4>
                          <p className="text-xs text-gray-500">₦{item.price.toLocaleString()}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-red-500"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(index, Math.max(1, item.quantity - 1))}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(index, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <div className="ml-auto font-semibold">
                          ₦{(item.price * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="p-4 border-t border-gray-200 space-y-2">
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
                <Button className="w-full" size="lg">
                  Send to Kitchen - ₦{totals.total.toLocaleString()}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function RestaurantPOS() {
  const storeId = 'store_123';

  return (
    <POSProvider>
      <RestaurantPOSInner storeId={storeId} />
    </POSProvider>
  );
}
