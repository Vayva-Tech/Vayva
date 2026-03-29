'use client';

import { useState, useEffect } from 'react';
import { POSProvider, usePOS, POSCartItem as CartItemType } from '@/components/pos/POSProvider';
import { Button } from '@vayva/ui/components/ui/button';
import { Input } from '@vayva/ui/components/ui/input';
import { ScrollArea } from '@vayva/ui/components/ui/scroll-area';
import { Badge } from '@vayva/ui/components/ui/badge';
import { posApi, POSTable } from '@/lib/pos-api-client';
import { useMerchant } from '@/hooks/useMerchant';
import { toast } from 'sonner';
import { 
  Ticket, 
  Users, 
  Calendar,
  QrCode,
  Plus, 
  Minus, 
  Trash2,
  Search,
  PartyPopper,
  Clock
} from 'lucide-react';

interface EventTicket {
  id: string;
  name: string;
  price: number;
  available: number;
  totalCapacity: number;
  eventDate: string;
  eventType: 'general' | 'vip' | 'early-bird';
}

interface EventsPOSInnerProps {
  storeId: string;
}

function EventsPOSInner({ storeId }: EventsPOSInnerProps) {
  const { addItem, state, removeItem, updateQuantity, calculateTotals } = usePOS();
  const [tickets, setTickets] = useState<EventTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<string | undefined>();
  const [attendeeName, setAttendeeName] = useState('');
  const [attendeeEmail, setAttendeeEmail] = useState('');

  // Mock events - in real app, fetch from API
  const events = [
    { id: '1', name: 'Tech Conference 2026', date: '2026-04-15' },
    { id: '2', name: 'Music Festival', date: '2026-05-20' },
    { id: '3', name: 'Business Summit', date: '2026-06-10' },
  ];

  // Load tickets
  useEffect(() => {
    async function loadTickets() {
      try {
        setLoading(true);
        const response = await posApi.getItems(storeId, { type: 'TIME_SLOT' });
        if (response.success) {
          const ticketData: EventTicket[] = response.data.map(item => ({
            id: item.id,
            name: item.name,
            price: Number(item.price),
            available: Number(item.metadata?.available || 100),
            totalCapacity: Number(item.metadata?.capacity || 100),
            eventDate: item.metadata?.eventDate as string || 'TBA',
            eventType: (item.metadata?.type as string) || 'general',
          }));
          setTickets(ticketData);
        }
      } catch (error) {
        console.error('Failed to load tickets:', error);
        toast.error('Failed to load tickets');
      } finally {
        setLoading(false);
      }
    }

    loadTickets();
  }, [storeId]);

  const handleAddToCart = (ticket: EventTicket) => {
    if (ticket.available <= 0) {
      toast.error('Sold out!');
      return;
    }

    const cartItem: CartItemType = {
      posItemId: ticket.id,
      name: `${ticket.name} - ${ticket.eventType.toUpperCase()}`,
      price: ticket.price,
      quantity: 1,
      discount: 0,
      notes: undefined,
      modifiers: [{
        name: 'Event Date',
        value: ticket.eventDate,
      }],
    };
    addItem(cartItem);
    toast.success(`Added ${ticket.name} ticket`);
  };

  const filteredTickets = tickets.filter(ticket => 
    !searchQuery || ticket.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totals = calculateTotals();
  const cartItemCount = state.cart.length;

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <PartyPopper className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Event Ticketing</h1>
              <p className="text-sm text-gray-500">Sell tickets and manage registrations</p>
            </div>
          </div>
          
          {/* Event Selector */}
          <div className="flex items-center gap-2">
            <select
              value={selectedEvent || ''}
              onChange={(e) => setSelectedEvent(e.target.value || undefined)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Events</option>
              {events.map(event => (
                <option key={event.id} value={event.id}>{event.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Attendee Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <Input
            placeholder="Attendee name"
            value={attendeeName}
            onChange={(e) => setAttendeeName(e.target.value)}
          />
          <Input
            placeholder="Attendee email"
            type="email"
            value={attendeeEmail}
            onChange={(e) => setAttendeeEmail(e.target.value)}
          />
          <Button className="bg-purple-600 hover:bg-purple-700">
            Register Attendee
          </Button>
        </div>

        {/* Search */}
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        {/* Left: Tickets Grid */}
        <div className="flex-1 overflow-auto p-4 md:p-6 w-full md:w-auto">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="p-4 bg-white rounded-xl border animate-pulse">
                  <div className="bg-gray-200 h-20 rounded-lg mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Ticket className="h-16 w-16 mx-auto mb-4" />
              <p className="text-lg">No tickets available</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => ticket.available > 0 && handleAddToCart(ticket)}
                  className={`p-4 bg-white rounded-xl border-2 transition-all cursor-pointer ${
                    ticket.available <= 0 
                      ? 'opacity-50 cursor-not-allowed border-gray-200' 
                      : 'hover:border-purple-400 hover:shadow-lg'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant={ticket.eventType === 'vip' ? 'default' : 'secondary'}>
                      {ticket.eventType.toUpperCase()}
                    </Badge>
                    {ticket.available <= 0 && (
                      <Badge variant="destructive">SOLD OUT</Badge>
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-sm mb-2">{ticket.name}</h3>
                  
                  <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>{ticket.eventDate}</span>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Available:</span>
                      <span className={ticket.available < 10 ? 'text-red-500' : 'text-green-500'}>
                        {ticket.available}/{ticket.totalCapacity}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          ticket.available < 10 ? 'bg-red-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${(ticket.available / ticket.totalCapacity) * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="text-xl font-bold text-purple-600">
                    ₦{ticket.price.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Order Panel */}
        <div className="w-full md:w-96 bg-white border-t md:border-l border-gray-200 flex flex-col h-[50vh] md:h-full fixed md:relative bottom-0 md:bottom-auto z-10 shadow-lg md:shadow-none">
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Ticket className="h-5 w-5 text-purple-600" />
              Ticket Order
            </h2>
            {attendeeName && (
              <p className="text-sm text-gray-600 mt-1">
                For: {attendeeName}
              </p>
            )}
          </div>

          {cartItemCount === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
              <Ticket className="h-16 w-16 mb-4 text-purple-300" />
              <p className="text-lg font-medium">No tickets selected</p>
              <p className="text-sm">Select tickets to add to order</p>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {state.cart.map((item, index) => (
                    <div key={`${item.posItemId}-${index}`} className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{item.name}</h4>
                          <p className="text-xs text-gray-500">₦{item.price.toLocaleString()}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-red-500 hover:bg-red-50"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 border-purple-200"
                          onClick={() => updateQuantity(index, Math.max(1, item.quantity - 1))}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 border-purple-200"
                          onClick={() => updateQuantity(index, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <div className="ml-auto font-bold text-purple-600">
                          ₦{(item.price * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="p-4 border-t border-gray-200 space-y-2 bg-gradient-to-r from-purple-50 to-blue-50">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">₦{totals.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (7.5%):</span>
                  <span className="font-medium">₦{totals.totalTax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-purple-600">
                  <span>Total:</span>
                  <span>₦{totals.total.toLocaleString()}</span>
                </div>
                <Button className="w-full bg-purple-600 hover:bg-purple-700" size="lg">
                  <QrCode className="h-4 w-4 mr-2" />
                  Generate Tickets & Checkout
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function EventsPOS() {
  const storeId = 'store_123';

  return (
    <POSProvider>
      <EventsPOSInner storeId={storeId} />
    </POSProvider>
  );
}
