/**
 * Real Estate - Listings Management Page
 * Manage property listings, MLS, and marketing
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, List, Plus, Globe, Camera } from "lucide-react";

interface Listing {
  id: string;
  propertyAddress: string;
  listPrice: number;
  mlsNumber: string;
  listingDate: string;
  status: "active" | "pending" | "contingent" | "sold" | "withdrawn";
  listingType: "buy" | "rent" | "lease";
  daysOnMarket: number;
  views: number;
}

export default function RealEstateListingsPage() {
  const router = useRouter();

  const listings: Listing[] = [
    { id: "1", propertyAddress: "123 Oak Street, Beverly Hills, CA", listPrice: 2450000, mlsNumber: "BH24001", listingDate: "2024-01-05", status: "active", listingType: "buy", daysOnMarket: 12, views: 847 },
    { id: "2", propertyAddress: "456 Palm Avenue, Miami Beach, FL", listPrice: 1850000, mlsNumber: "MB24002", listingDate: "2024-01-09", status: "active", listingType: "buy", daysOnMarket: 8, views: 623 },
    { id: "3", propertyAddress: "789 Maple Drive, Austin, TX", listPrice: 975000, mlsNumber: "ATX24003", listingDate: "2024-01-12", status: "pending", listingType: "buy", daysOnMarket: 5, views: 412 },
    { id: "4", propertyAddress: "321 Pine Lane, Seattle, WA", listPrice: 1250000, mlsNumber: "SEA24004", listingDate: "2023-12-27", status: "active", listingType: "buy", daysOnMarket: 21, views: 1024 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/real-estate")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Listings</h1>
            <p className="text-muted-foreground">Manage MLS listings and marketing</p>
          </div>
        </div>
        <Button onClick={() => router.push("/dashboard/real-estate/listings/new")}>
          <Plus className="h-4 w-4 mr-2" />
          New Listing
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Listings</p>
                <p className="text-2xl font-bold">{listings.filter(l => l.status === "active").length}</p>
              </div>
              <List className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{listings.filter(l => l.status === "pending").length}</p>
              </div>
              <List className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">${(listings.reduce((acc, l) => acc + l.listPrice, 0) / 1000000).toFixed(1)}M</p>
              </div>
              <List className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg DOM</p>
                <p className="text-2xl font-bold">{Math.round(listings.reduce((acc, l) => acc + l.daysOnMarket, 0) / listings.length)}</p>
              </div>
              <List className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b" scope="col">
                <tr className="text-left text-sm text-muted-foreground">
                  <th className="py-3 px-4 font-medium" scope="col">Property</th>
                  <th className="py-3 px-4 font-medium" scope="col">MLS #</th>
                  <th className="py-3 px-4 font-medium" scope="col">Price</th>
                  <th className="py-3 px-4 font-medium" scope="col">Status</th>
                  <th className="py-3 px-4 font-medium" scope="col">DOM</th>
                  <th className="py-3 px-4 font-medium" scope="col">Views</th>
                  <th className="py-3 px-4 font-medium" scope="col"></th>
                </tr>
              </thead>
              <tbody>
                {listings.map((listing) => (
                  <tr key={listing.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <p className="font-medium">{listing.propertyAddress.split(',')[0]}</p>
                      <p className="text-xs text-muted-foreground">{listing.propertyAddress.split(',').slice(1).join(',')}</p>
                    </td>
                    <td className="py-3 px-4 font-mono">{listing.mlsNumber}</td>
                    <td className="py-3 px-4 font-bold">${listing.listPrice.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <Badge variant={listing.status === "active" ? "default" : listing.status === "pending" ? "secondary" : "outline"}>
                        {listing.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">{listing.daysOnMarket} days</td>
                    <td className="py-3 px-4">{listing.views.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/real-estate/listings/${listing.id}`)}>
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <Globe className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Camera className="h-4 w-4" />
                        </Button>
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
  );
}
