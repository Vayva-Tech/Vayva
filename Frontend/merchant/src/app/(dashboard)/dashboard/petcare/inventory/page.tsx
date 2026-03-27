/**
 * Pet Care - Inventory Management Page
 */
"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package } from "lucide-react";

export default function PetCareInventoryPage() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/petcare")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Inventory</h1>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-semibold mb-2">Inventory Management</h3>
            <p className="text-muted-foreground">Track medicines, supplies, and equipment</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
