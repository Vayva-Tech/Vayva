"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Package,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Calendar,
  MapPin,
  CreditCard
} from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  deliveryAddress: string;
  paymentMethod: string;
  items: OrderItem[];
}

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // In a real implementation, this would fetch from /api/orders
        // For now, using mock data to demonstrate the feature
        const mockOrders: Order[] = [
          {
            id: "1",
            orderNumber: "ORD-2024-001",
            status: "completed",
            total: 12500,
            createdAt: "2024-01-15T10:30:00Z",
            deliveryAddress: "123 Fashion Street, Lagos",
            paymentMethod: "card",
            items: [
              {
                id: "1-1",
                name: "Premium Cotton T-Shirt",
                quantity: 2,
                price: 3500,
                image: "/images/tshirt.jpg"
              },
              {
                id: "1-2", 
                name: "Designer Jeans",
                quantity: 1,
                price: 5500,
                image: "/images/jeans.jpg"
              }
            ]
          },
          {
            id: "2",
            orderNumber: "ORD-2024-002", 
            status: "processing",
            total: 8900,
            createdAt: "2024-01-18T14:20:00Z",
            deliveryAddress: "456 Style Avenue, Abuja",
            paymentMethod: "card",
            items: [
              {
                id: "2-1",
                name: "Leather Jacket",
                quantity: 1,
                price: 8900,
                image: "/images/jacket.jpg"
              }
            ]
          },
          {
            id: "3",
            orderNumber: "ORD-2024-003",
            status: "shipped",
            total: 4200,
            createdAt: "2024-01-20T09:15:00Z",
            deliveryAddress: "789 Trendy Road, Port Harcourt",
            paymentMethod: "cash",
            items: [
              {
                id: "3-1",
                name: "Summer Dress",
                quantity: 1,
                price: 4200,
                image: "/images/dress.jpg"
              }
            ]
          }
        ];
        
        setOrders(mockOrders);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'shipped':
        return <Package className="h-5 w-5 text-blue-500" />;
      default:
        return <Clock className="h-5 w-5 text-orange-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-orange-100 text-orange-800';
    }
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status.toLowerCase() === filter);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-card rounded-lg p-6 border">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/shop" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back to Shop
            </Link>
            <h1 className="text-2xl font-bold">Order History</h1>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={filter === 'all' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('all')}
            >
              All Orders
            </Button>
            <Button 
              variant={filter === 'completed' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('completed')}
            >
              Completed
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-24 w-24 mx-auto text-muted-foreground/50 mb-6" />
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {filter === 'all' ? 'No orders yet' : `No ${filter} orders`}
            </h2>
            <p className="text-muted-foreground mb-8">
              {filter === 'all' 
                ? 'Start shopping to see your order history!' 
                : `You don't have any ${filter} orders`}
            </p>
            <Button asChild size="lg">
              <Link href="/shop">Continue Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredOrders.map(order => (
              <Card key={order.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">Order {order.orderNumber}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {getStatusIcon(order.status)}
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Order Items */}
                    <div className="space-y-3">
                      {order.items.map(item => (
                        <div key={item.id} className="flex items-center gap-3">
                          {item.image ? (
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded-md"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                              <span className="text-muted-foreground text-xs">{item.name[0]}</span>
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Qty: {item.quantity} × ₦{(item.price / 100).toFixed(2)}
                            </p>
                          </div>
                          <p className="font-medium text-sm">
                            ₦{((item.price * item.quantity) / 100).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Order Details */}
                    <div className="pt-4 border-t space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Delivered to:</span>
                        <span className="truncate">{order.deliveryAddress}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Payment:</span>
                        <span className="capitalize">{order.paymentMethod}</span>
                      </div>
                    </div>

                    {/* Status and Total */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="font-bold text-lg">₦{(order.total / 100).toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        View Details
                      </Button>
                      {order.status === 'completed' && (
                        <Button variant="outline" size="sm">
                          Reorder
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}