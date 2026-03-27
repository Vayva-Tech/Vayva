/**
 * Nightlife - Menu Management Page
 * Manage drink menus, food offerings, and pricing
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Wine, Search, Plus, Utensils, Coffee } from "lucide-react";
import { useState } from "react";

interface MenuItem {
  id: string;
  name: string;
  category: "cocktail" | "beer" | "wine" | "spirit" | "food" | "non-alcoholic";
  price: number;
  cost: number;
  description: string;
  available: boolean;
  popular: boolean;
}

export default function NightlifeMenuPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const menuItems: MenuItem[] = [
    { id: "1", name: "Signature Mojito", category: "cocktail", price: 14, cost: 4.50, description: "Fresh mint, lime, white rum, soda", available: true, popular: true },
    { id: "2", name: "Craft IPA", category: "beer", price: 8, cost: 2.80, description: "Local brewery tap", available: true, popular: true },
    { id: "3", name: "Cabernet Sauvignon", category: "wine", price: 12, cost: 4.00, description: "Glass - Napa Valley", available: true, popular: false },
    { id: "4", name: "Truffle Fries", category: "food", price: 9, cost: 2.20, description: "Hand-cut fries with truffle oil", available: true, popular: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/nightlife")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Menu</h1>
            <p className="text-muted-foreground">Manage drinks and food offerings</p>
          </div>
        </div>
        <Button onClick={() => router.push("/dashboard/nightlife/menu/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{menuItems.length}</p>
              </div>
              <Wine className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-bold">{menuItems.filter(m => m.available).length}</p>
              </div>
              <Utensils className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Popular Items</p>
                <p className="text-2xl font-bold">{menuItems.filter(m => m.popular).length}</p>
              </div>
              <Coffee className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Margin</p>
                <p className="text-2xl font-bold">{((menuItems.reduce((acc, item) => acc + ((item.price - item.cost) / item.price), 0) / menuItems.length) * 100).toFixed(0)}%</p>
              </div>
              <Wine className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left text-sm text-muted-foreground">
                  <th className="py-3 px-4 font-medium">Item Name</th>
                  <th className="py-3 px-4 font-medium">Category</th>
                  <th className="py-3 px-4 font-medium">Description</th>
                  <th className="py-3 px-4 font-medium">Price</th>
                  <th className="py-3 px-4 font-medium">Cost</th>
                  <th className="py-3 px-4 font-medium">Margin</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {menuItems.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-semibold">{item.name}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="capitalize">{item.category}</Badge>
                    </td>
                    <td className="py-3 px-4 text-sm truncate max-w-[250px]">{item.description}</td>
                    <td className="py-3 px-4 font-bold">${item.price.toFixed(2)}</td>
                    <td className="py-3 px-4 text-sm">${item.cost.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-green-600">{(((item.price - item.cost) / item.price) * 100).toFixed(0)}%</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Badge variant={item.available ? "default" : "outline"}>{item.available ? "Available" : "86'd"}</Badge>
                        {item.popular && <Badge variant="secondary">⭐ Popular</Badge>}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/nightlife/menu/${item.id}`)}>
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
