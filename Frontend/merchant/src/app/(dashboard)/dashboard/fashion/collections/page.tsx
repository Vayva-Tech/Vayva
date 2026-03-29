/**
 * Fashion Collections Management Page
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
import { ChevronLeft, Layers, Plus } from "lucide-react";

interface Collection {
  id: string;
  name: string;
  season: string;
  year: number;
  productCount: number;
  totalValue: number;
  launchDate: string;
  status: string;
}

export default function FashionCollectionsPage() {
  const router = useRouter();
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const response = await apiJson<{ data: Collection[] }>("/fashion/collections");
      setCollections(response.data || []);
    } catch (error) {
      logger.warn("Failed to fetch fashion collections", error);
      setCollections([]);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/dashboard/fashion")}>
              <ChevronLeft className="h-5 w-5 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-rose-600 to-pink-600 rounded-lg">
                <Layers className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                Collections & Seasons
              </h1>
            </div>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Collection
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 md:px-6 py-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>All Collections</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Collection Name</TableHead>
                  <TableHead>Season</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Launch Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {collections.map((collection) => (
                  <TableRow key={collection.id}>
                    <TableCell className="font-medium">{collection.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{collection.season} {collection.year}</Badge>
                    </TableCell>
                    <TableCell><Badge variant="secondary">{collection.productCount} items</Badge></TableCell>
                    <TableCell className="font-semibold">{formatCurrency(collection.totalValue)}</TableCell>
                    <TableCell>{formatDate(collection.launchDate)}</TableCell>
                    <TableCell>
                      <Badge variant={collection.status === "active" ? "default" : collection.status === "upcoming" ? "secondary" : "outline"}>
                        {collection.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

// No mock data - requires real API integration
