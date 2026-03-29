/**
 * Restaurant Suppliers Page - Vendor Management
 */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiJson } from "@/lib/api-client-shared";
import { logger } from "@vayva/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, DollarSign, Plus } from "lucide-react";

interface Supplier {
  id: string;
  name: string;
  category: string;
  contactEmail: string;
  contactPhone: string;
  rating: number;
}

export default function RestaurantSuppliersPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await apiJson<{ data: Supplier[] }>("/restaurant/suppliers?limit=200");
      setSuppliers(response.data || []);
    } catch (error) {
      logger.warn("Failed to fetch suppliers", error);
      setSuppliers([]);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/dashboard/restaurant")}>
              <ChevronLeft className="h-5 w-5 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Supplier Management
              </h1>
            </div>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Supplier
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 md:px-6 py-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Vendors & Suppliers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {suppliers.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Suppliers Yet</h3>
                <p className="text-muted-foreground mb-4">Add vendors for ingredients, equipment, and supplies</p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Supplier
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell className="font-medium">{supplier.name}</TableCell>
                      <TableCell><Badge variant="outline">{supplier.category}</Badge></TableCell>
                      <TableCell>{supplier.contactEmail}</TableCell>
                      <TableCell>{supplier.contactPhone}</TableCell>
                      <TableCell>{"⭐".repeat(Math.round(supplier.rating))}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

// No mock data - requires real restaurant API integration
