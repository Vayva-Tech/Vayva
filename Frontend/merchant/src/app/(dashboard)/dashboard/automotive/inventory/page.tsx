/**
 * Automotive Industry - Vehicle Inventory Management Page
 * Manage vehicle stock, listings, and dealership inventory
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Car, Search, Plus, TrendingUp, AlertTriangle } from "lucide-react";
import { useState } from "react";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  price: number;
  cost: number;
  mileage: number;
  condition: "new" | "used" | "certified";
  bodyType: "sedan" | "suv" | "truck" | "coupe" | "convertible" | "van";
  fuelType: "gasoline" | "diesel" | "electric" | "hybrid";
  transmission: "automatic" | "manual";
  exteriorColor: string;
  interiorColor: string;
  status: "available" | "reserved" | "sold" | "in-transit";
  daysInStock: number;
}

export default function AutomotiveInventoryPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const vehicles: Vehicle[] = [
    { id: "1", make: "Tesla", model: "Model 3", year: 2024, vin: "5YJ3E1EA1PF123456", price: 42990, cost: 38000, mileage: 0, condition: "new", bodyType: "sedan", fuelType: "electric", transmission: "automatic", exteriorColor: "Pearl White", interiorColor: "Black", status: "available", daysInStock: 12 },
    { id: "2", make: "BMW", model: "X5", year: 2024, vin: "5UXCR6C09P9L12345", price: 68500, cost: 61000, mileage: 5200, condition: "certified", bodyType: "suv", fuelType: "gasoline", transmission: "automatic", exteriorColor: "Jet Black", interiorColor: "Cognac", status: "available", daysInStock: 8 },
    { id: "3", make: "Mercedes-Benz", model: "C-Class", year: 2023, vin: "55SWF4KB5PU123456", price: 48900, cost: 43500, mileage: 12500, condition: "used", bodyType: "sedan", fuelType: "gasoline", transmission: "automatic", exteriorColor: "Silver", interiorColor: "Black", status: "reserved", daysInStock: 21 },
    { id: "4", make: "Ford", model: "F-150", year: 2024, vin: "1FTFW1E84PFA12345", price: 58750, cost: 52000, mileage: 0, condition: "new", bodyType: "truck", fuelType: "hybrid", transmission: "automatic", exteriorColor: "Blue", interiorColor: "Gray", status: "available", daysInStock: 5 },
    { id: "5", make: "Audi", model: "e-tron GT", year: 2024, vin: "WAUAVAF19PN123456", price: 106500, cost: 95000, mileage: 1800, condition: "certified", bodyType: "coupe", fuelType: "electric", transmission: "automatic", exteriorColor: "Daytona Gray", interiorColor: "Red", status: "available", daysInStock: 15 },
    { id: "6", make: "Toyota", model: "RAV4", year: 2023, vin: "2T3W1RFV8PC123456", price: 32500, cost: 28500, mileage: 18200, condition: "used", bodyType: "suv", fuelType: "hybrid", transmission: "automatic", exteriorColor: "White", interiorColor: "Black", status: "sold", daysInStock: 45 },
    { id: "7", make: "Porsche", model: "911 Carrera", year: 2024, vin: "WP0AA2A99PS123456", price: 125900, cost: 112000, mileage: 0, condition: "new", bodyType: "coupe", fuelType: "gasoline", transmission: "automatic", exteriorColor: "Guards Red", interiorColor: "Black", status: "in-transit", daysInStock: 0 },
    { id: "8", make: "Honda", model: "Accord", year: 2023, vin: "1HGCY1F39PA123456", price: 29900, cost: 26000, mileage: 22100, condition: "used", bodyType: "sedan", fuelType: "gasoline", transmission: "automatic", exteriorColor: "Gray", interiorColor: "Beige", status: "available", daysInStock: 32 },
  ];

  const filteredVehicles = vehicles.filter(vehicle =>
    `${vehicle.make} ${vehicle.model}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.vin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.bodyType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: vehicles.length,
    available: vehicles.filter(v => v.status === "available").length,
    new: vehicles.filter(v => v.condition === "new").length,
    used: vehicles.filter(v => v.condition === "used").length,
    certified: vehicles.filter(v => v.condition === "certified").length,
    avgDaysInStock: Math.round(vehicles.reduce((sum, v) => sum + v.daysInStock, 0) / vehicles.length),
    totalValue: vehicles.filter(v => v.status !== "sold").reduce((sum, v) => sum + v.price, 0),
    totalCost: vehicles.reduce((sum, v) => sum + v.cost, 0),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/dashboard/automotive")} className="h-10 w-10 p-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-700 to-gray-700 bg-clip-text text-transparent">
                Vehicle Inventory
              </h1>
              <p className="text-muted-foreground mt-1">Manage dealership stock and listings</p>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-slate-700 to-gray-700 hover:from-slate-800 hover:to-gray-800">
            <Plus className="h-4 w-4 mr-2" />
            Add Vehicle
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Vehicles</CardTitle>
              <Car className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">{stats.available} available</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">New Vehicles</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.new}</div>
              <p className="text-xs text-muted-foreground mt-1">{stats.used} used, {stats.certified} certified</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Days in Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.avgDaysInStock}</div>
              <p className="text-xs text-muted-foreground mt-1">Industry avg: 45 days</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Inventory Value</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">${(stats.totalValue / 1000).toFixed(0)}K</div>
              <p className="text-xs text-muted-foreground mt-1">Total cost: ${(stats.totalCost / 1000).toFixed(0)}K</p>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by make, model, VIN, or body type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Inventory Table */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Vehicles ({filteredVehicles.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Vehicle</th>
                    <th className="text-left py-3 px-4 font-semibold">VIN</th>
                    <th className="text-left py-3 px-4 font-semibold">Year</th>
                    <th className="text-left py-3 px-4 font-semibold">Condition</th>
                    <th className="text-left py-3 px-4 font-semibold">Mileage</th>
                    <th className="text-left py-3 px-4 font-semibold">Price</th>
                    <th className="text-left py-3 px-4 font-semibold">Days in Stock</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVehicles.map((vehicle) => (
                    <tr key={vehicle.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-semibold">{vehicle.make} {vehicle.model}</p>
                          <p className="text-xs text-muted-foreground">{vehicle.exteriorColor} / {vehicle.interiorColor}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-sm">{vehicle.vin}</td>
                      <td className="py-3 px-4 font-medium">{vehicle.year}</td>
                      <td className="py-3 px-4">
                        <Badge variant={vehicle.condition === "new" ? "default" : vehicle.condition === "certified" ? "secondary" : "outline"} className="capitalize">
                          {vehicle.condition}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm">{vehicle.mileage.toLocaleString()} mi</td>
                      <td className="py-3 px-4 font-mono font-semibold text-green-600">${vehicle.price.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className={vehicle.daysInStock > 30 ? "text-orange-600 font-medium" : "text-muted-foreground"}>
                          {vehicle.daysInStock} days
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={vehicle.status === "available" ? "default" : vehicle.status === "reserved" ? "secondary" : vehicle.status === "sold" ? "destructive" : "outline"}>
                          {vehicle.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/automotive/inventory/${vehicle.id}`)}>
                            View
                          </Button>
                          {vehicle.status === "available" && (
                            <Button variant="outline" size="sm" className="text-blue-600">
                              Edit
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
