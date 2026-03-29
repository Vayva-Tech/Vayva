/**
 * Real Estate Listings Page - Active/Pending/Sold Listings
 */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiJson } from "@/lib/api-client-shared";
import { logger, formatCurrency, formatDate } from "@vayva/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, Key, Plus } from "lucide-react";

interface Listing {
  id: string;
  propertyId: string;
  listPrice: number;
  listDate: string;
  status: "active" | "pending" | "sold" | "withdrawn";
  daysOnMarket: number;
}

export default function RealEstateListingsPage() {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const response = await apiJson<{ data: Listing[] }>("/realestate/listings?limit=200");
      setListings(response.data || []);
    } catch (error) {
      logger.warn("Failed to fetch listings", error);
      setListings([]);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/dashboard/realestate")}>
              <ChevronLeft className="h-5 w-5 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg">
                <Key className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Listing Management
              </h1>
            </div>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Listing
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 md:px-6 py-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              All Listings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {listings.length === 0 ? (
              <div className="text-center py-12">
                <Key className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Listings Yet</h3>
                <p className="text-muted-foreground mb-4">Create your first listing to start marketing properties</p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Listing
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property ID</TableHead>
                    <TableHead>List Price</TableHead>
                    <TableHead>List Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Days on Market</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listings.map((listing) => (
                    <TableRow key={listing.id}>
                      <TableCell className="font-medium">{listing.propertyId}</TableCell>
                      <TableCell className="font-semibold">{formatCurrency(listing.listPrice)}</TableCell>
                      <TableCell>{formatDate(listing.listDate)}</TableCell>
                      <TableCell><Badge variant={listing.status === "active" ? "default" : "secondary"}>{listing.status}</Badge></TableCell>
                      <TableCell>{listing.daysOnMarket} days</TableCell>
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

// No mock data - requires real estate API integration
