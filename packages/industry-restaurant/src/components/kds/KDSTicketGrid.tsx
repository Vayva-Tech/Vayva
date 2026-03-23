// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { KDSService, type Order } from '../../services';
import { Card, CardContent, CardHeader, CardTitle , Badge , Button } from '@vayva/ui';
import { 
  Timer,
  Clock,
  AlertTriangle,
  CheckCircle,
  User,
  Utensils,
  Bell
} from 'lucide-react';

interface KDSTicket {
  id: string;
  orderNumber: string;
  tableNumber: string;
  customerName?: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    modifiers?: string[];
    station: string;
    prepTime: number;
    status: 'pending' | 'preparing' | 'ready' | 'served';
  }>;
  orderTime: Date;
  priority: 'normal' | 'rush' | 'vip';
  status: 'new' | 'in_progress' | 'ready' | 'completed';
  totalTime: number;
  elapsedTime: number;
}

interface KDSTicketGridProps {
  kdsService: KDSService;
}

export function KDSTicketGrid({ kdsService }: KDSTicketGridProps) {
  const [tickets, setTickets] = useState<KDSTicket[]>([]);
  const [stations, setStations] = useState<string[]>(['All', 'Grill', 'Fryer', 'Sauté', 'Cold', 'Expo']);
  const [selectedStation, setSelectedStation] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        // Mock data - in real implementation, this would come from the service
        const mockTickets: KDSTicket[] = [
          {
            id: '1',
            orderNumber: 'ORD-001',
            tableNumber: '12',
            customerName: 'John Smith',
            items: [
              {
                id: '1-1',
                name: 'Grilled Salmon',
                quantity: 1,
                modifiers: ['Lemon Butter Sauce'],
                station: 'Grill',
                prepTime: 12,
                status: 'preparing'
              },
              {
                id: '1-2',
                name: 'Caesar Salad',
                quantity: 1,
                station: 'Cold',
                prepTime: 5,
                status: 'pending'
              }
            ],
            orderTime: new Date(Date.now() - 300000), // 5 mins ago
            priority: 'normal',
            status: 'in_progress',
            totalTime: 17,
            elapsedTime: 5
          },
          {
            id: '2',
            orderNumber: 'ORD-002',
            tableNumber: '5',
            items: [
              {
                id: '2-1',
                name: 'Steak Frites',
                quantity: 1,
                modifiers: ['Medium Rare', 'Truffle Fries'],
                station: 'Grill',
                prepTime: 15,
                status: 'pending'
              }
            ],
            orderTime: new Date(Date.now() - 120000), // 2 mins ago
            priority: 'rush',
            status: 'new',
            totalTime: 15,
            elapsedTime: 2
          },
          {
            id: '3',
            orderNumber: 'ORD-003',
            tableNumber: '18',
            customerName: 'VIP Customer',
            items: [
              {
                id: '3-1',
                name: 'Chocolate Cake',
                quantity: 2,
                station: 'Cold',
                prepTime: 3,
                status: 'ready'
              }
            ],
            orderTime: new Date(Date.now() - 600000), // 10 mins ago
            priority: 'vip',
            status: 'ready',
            totalTime: 3,
            elapsedTime: 10
          }
        ];
        
        setTickets(mockTickets);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch KDS tickets:', error);
        setLoading(false);
      }
    };

    fetchTickets();
    // Poll for updates every 5 seconds for real-time KDS
    const interval = setInterval(fetchTickets, 5000);
    return () => clearInterval(interval);
  }, [kdsService]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'vip':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'rush':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getItemStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-600';
      case 'preparing':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'served':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getTimerColor = (elapsed: number, total: number) => {
    const percentage = (elapsed / total) * 100;
    if (percentage > 90) return 'text-red-600';
    if (percentage > 75) return 'text-orange-600';
    return 'text-green-600';
  };

  const filteredTickets = selectedStation === 'All' 
    ? tickets 
    : tickets.filter(ticket => 
        ticket.items.some(item => item.station === selectedStation)
      );

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBumpItem = (ticketId: string, itemId: string) => {
    setTickets(prev => prev.map(ticket => {
      if (ticket.id === ticketId) {
        return {
          ...ticket,
          items: ticket.items.map(item => 
            item.id === itemId 
              ? { ...item, status: 'ready' }
              : item
          )
        };
      }
      return ticket;
    }));
  };

  const handleCompleteTicket = (ticketId: string) => {
    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId 
        ? { ...ticket, status: 'completed' }
        : ticket
    ));
  };

  if (loading) {
    return (
      <Card className="bg-gray-900 border border-cyan-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-400">
            <Utensils className="h-5 w-5" />
            Kitchen Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-800 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900 border border-cyan-500/30">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-cyan-400">
          <Utensils className="h-5 w-5" />
          Kitchen Queue
          <Badge variant="secondary" className="ml-auto bg-cyan-500/20 text-cyan-300">
            {filteredTickets.length} active
          </Badge>
        </CardTitle>
        
        {/* Station Filter */}
        <div className="flex flex-wrap gap-2 mt-3">
          {stations.map(station => (
            <button
              key={station}
              onClick={() => setSelectedStation(station)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                selectedStation === station
                  ? 'bg-cyan-500 text-gray-900'
                  : 'bg-gray-800 text-cyan-300 hover:bg-cyan-500/20 border border-cyan-500/30'
              }`}
            >
              {station}
            </button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
            <Utensils className="h-12 w-12 mb-4 text-gray-600" />
            <p className="font-medium">No active tickets</p>
            <p className="text-sm">Orders will appear here when received</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTickets.map(ticket => (
              <div 
                key={ticket.id}
                className={`
                  p-4 rounded-xl border-2 transition-all
                  ${ticket.priority === 'vip' ? 'border-purple-500/50 bg-purple-900/20' :
                    ticket.priority === 'rush' ? 'border-red-500/50 bg-red-900/20' :
                    'border-cyan-500/30 bg-gray-800'}
                  ${ticket.status === 'ready' ? 'ring-2 ring-green-500/50 animate-pulse' : ''}
                `}
              >
                {/* Ticket Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-cyan-500 text-gray-900 rounded-lg w-12 h-12 flex items-center justify-center font-bold">
                      #{ticket.orderNumber.split('-')[1]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white">
                          Table {ticket.tableNumber}
                        </h3>
                        {ticket.customerName && (
                          <span className="text-cyan-300 text-sm">
                            • {ticket.customerName}
                          </span>
                        )}
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatTime(ticket.elapsedTime)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Timer className={`h-4 w-4 ${getTimerColor(ticket.elapsedTime, ticket.totalTime)}`} />
                          <span className={getTimerColor(ticket.elapsedTime, ticket.totalTime)}>
                            {formatTime(ticket.totalTime - ticket.elapsedTime)} left
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {ticket.status === 'ready' && (
                    <Bell className="h-6 w-6 text-green-500 animate-bounce" />
                  )}
                </div>

                {/* Items */}
                <div className="space-y-2">
                  {ticket.items
                    .filter(item => selectedStation === 'All' || item.station === selectedStation)
                    .map(item => (
                      <div 
                        key={item.id}
                        className={`
                          flex items-center justify-between p-3 rounded-lg border
                          ${getItemStatusColor(item.status)}
                        `}
                      >
                        <div className="flex-grow">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-current">
                              {item.quantity}× {item.name}
                            </span>
                            <Badge variant="secondary" className="text-xs bg-black/20">
                              {item.station}
                            </Badge>
                          </div>
                          
                          {item.modifiers && item.modifiers.length > 0 && (
                            <div className="text-xs text-current/80">
                              {item.modifiers.join(', ')}
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 text-xs text-current/70 mt-1">
                            <Timer className="h-3 w-3" />
                            {item.prepTime} min prep
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge className={getItemStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                          {item.status === 'preparing' && (
                            <Button
                              size="sm"
                              onClick={() => handleBumpItem(ticket.id, item.id)}
                              className="bg-green-500 hover:bg-green-600 text-white"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  }
                </div>

                {/* Ticket Actions */}
                {ticket.status === 'ready' && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <Button
                      onClick={() => handleCompleteTicket(ticket.id)}
                      className="w-full bg-green-500 hover:bg-green-600 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Completed
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}