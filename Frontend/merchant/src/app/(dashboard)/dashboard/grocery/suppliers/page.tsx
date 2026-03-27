/**
 * Grocery - Suppliers Management Page
 * Manage vendor relationships, purchase orders, and deliveries
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Truck, Plus, Mail, Phone } from "lucide-react";

interface Supplier {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  category: string;
  activeProducts: number;
  rating: number;
  leadTimeDays: number;
}

export default function GrocerySuppliersPage() {
  const router = useRouter();

  const suppliers: Supplier[] = [
    { id: "1", name: "Fresh Farms Inc.", contactName: "John Miller", email: "john@freshfarms.com", phone: "+1 (555) 123-4567", category: "Produce", activeProducts: 45, rating: 4.8, leadTimeDays: 2 },
    { id: "2", name: "Dairy Delights Co.", contactName: "Sarah Chen", email: "sarah@dairydelights.com", phone: "+1 (555) 234-5678", category: "Dairy", activeProducts: 28, rating: 4.9, leadTimeDays: 1 },
    { id: "3", name: "Premium Meats LLC", contactName: "Mike Johnson", email: "mike@premiummeats.com", phone: "+1 (555) 345-6789", category: "Meat", activeProducts: 32, rating: 4.7, leadTimeDays: 3 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/grocery")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Suppliers</h1>
            <p className="text-muted-foreground">Manage vendors and purchase orders</p>
          </div>
        </div>
        <Button onClick={() => router.push("/dashboard/grocery/suppliers/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Supplier
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {suppliers.map((supplier) => (
          <Card key={supplier.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{supplier.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{supplier.category}</p>
                </div>
                <Badge variant="default">{supplier.rating}★</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{supplier.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{supplier.phone}</span>
              </div>
              <div className="pt-3 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Active Products:</span>
                  <span className="font-medium">{supplier.activeProducts}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Lead Time:</span>
                  <span className="font-medium">{supplier.leadTimeDays} days</span>
                </div>
              </div>
              <div className="flex gap-2 pt-3">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => router.push(`/dashboard/grocery/suppliers/${supplier.id}`)}>
                  View Details
                </Button>
                <Button size="sm" className="flex-1">
                  Create PO
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
