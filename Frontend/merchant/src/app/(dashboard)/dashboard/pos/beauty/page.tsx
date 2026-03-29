'use client';

import { useState, useEffect } from 'react';
import { POSProvider, usePOS, POSCartItem as CartItemType } from '@/components/pos/POSProvider';
import { Button } from '@vayva/ui/components/ui/button';
import { Input } from '@vayva/ui/components/ui/input';
import { ScrollArea } from '@vayva/ui/components/ui/scroll-area';
import { posApi, POSTable } from '@/lib/pos-api-client';
import { useMerchant } from '@/hooks/useMerchant';
import { toast } from 'sonner';
import { 
  Sparkles, 
  User, 
  Clock, 
  Plus, 
  Minus, 
  Trash2,
  Search,
  Scissors
} from 'lucide-react';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

interface BeautyPOSInnerProps {
  storeId: string;
}

function BeautyPOSInner({ storeId }: BeautyPOSInnerProps) {
  const { addItem, state, removeItem, updateQuantity, setStaff, calculateTotals } = usePOS();
  const [services, setServices] = useState<POSTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [customerName, setCustomerName] = useState('');

  // Mock staff - in real app, fetch from API
  const staff: StaffMember[] = [
    { id: '1', name: 'Sarah O.', role: 'Senior Stylist' },
    { id: '2', name: 'Chioma A.', role: 'Nail Tech' },
    { id: '3', name: 'Blessing K.', role: 'Therapist' },
    { id: '4', name: 'Funmi L.', role: 'Junior Stylist' },
  ];

  // Load services
  useEffect(() => {
    async function loadServices() {
      try {
        setLoading(true);
        const response = await posApi.getItems(storeId, { type: 'SERVICE' });
        if (response.success) {
          setServices(response.data);
        }
      } catch (error) {
        console.error('Failed to load services:', error);
        toast.error('Failed to load services');
      } finally {
        setLoading(false);
      }
    }

    loadServices();
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
    toast.success(`Added ${item.name} to booking`);
  };

  const filteredServices = services.filter(item => 
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
            <Scissors className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Salon Reception</h1>
          </div>
          
          {/* Customer Check-in */}
          <div className="flex items-center gap-2">
            <Input
              placeholder="Customer name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-64"
            />
            <Button>Check-In Customer</Button>
          </div>
        </div>

        {/* Staff Selection */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={!selectedStaff ? 'default' : 'outline'}
            onClick={() => setSelectedStaff(undefined)}
            className="min-w-[100px]"
          >
            <div className="flex flex-col items-center">
              <User className="h-5 w-5 mb-1" />
              <span className="text-xs">Any Staff</span>
            </div>
          </Button>
          {staff.map((member) => (
            <Button
              key={member.id}
              variant={selectedStaff === member.id ? 'default' : 'outline'}
              onClick={() => setSelectedStaff(member.id)}
              className="min-w-[100px]"
            >
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mb-1">
                  <span className="text-xs font-medium">{member.name.charAt(0)}</span>
                </div>
                <span className="text-xs truncate w-full text-center">{member.name.split(' ')[0]}</span>
                <span className="text-xs text-gray-500 truncate w-full text-center">{member.role}</span>
              </div>
            </Button>
          ))}
        </div>

        {/* Search */}
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Main Content - Responsive */}
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        {/* Left: Services Grid - Full width on mobile */}
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
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Sparkles className="h-16 w-16 mx-auto mb-4" />
              <p className="text-lg">No services found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  onClick={() => handleAddToCart(service)}
                  className="p-4 bg-white rounded-lg border hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="aspect-square bg-gradient-to-br from-primary/10 to-primary/5 rounded mb-3 flex items-center justify-center">
                    <Sparkles className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="font-medium text-sm mb-1">{service.name}</h3>
                  <p className="text-xs text-gray-500 mb-2">
                    {(service.metadata?.duration as string) || 'N/A'} min
                  </p>
                  <div className="text-lg font-bold">₦{Number(service.price).toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Booking Panel - Slide-up on mobile */}
        <div className="w-full md:w-96 bg-white border-t md:border-l border-gray-200 flex flex-col h-[45vh] md:h-full fixed md:relative bottom-0 md:bottom-auto z-10 shadow-lg md:shadow-none">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-lg">Current Booking</h2>
            {selectedStaff && (
              <p className="text-sm text-gray-500 mt-1">
                Staff: {staff.find(s => s.id === selectedStaff)?.name}
              </p>
            )}
            {customerName && (
              <p className="text-sm text-gray-500">
                Customer: {customerName}
              </p>
            )}
          </div>

          {cartItemCount === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
              <Sparkles className="h-16 w-16 mb-4" />
              <p className="text-lg font-medium">No services selected</p>
              <p className="text-sm">Select services to book</p>
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
                  Complete Booking - ₦{totals.total.toLocaleString()}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function BeautyPOS() {
  const storeId = 'store_123';

  return (
    <POSProvider>
      <BeautyPOSInner storeId={storeId} />
    </POSProvider>
  );
}
