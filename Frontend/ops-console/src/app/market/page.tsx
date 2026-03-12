"use client";

import React, { useEffect, useState } from "react";
// Assuming Ops Console has a Shell or Layout
// I'll build a standalone page content
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@vayva/ui";

interface Seller {
  id: string;
  name: string;
  tier: string;
  verificationLevel: string;
  slaScore: number;
  StoreProfile?: { city?: string };
}

export default function MarketOpsPage(): React.JSX.Element {
  const { toast } = useToast();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSellers = () => {
    fetch("/api/market/sellers")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setSellers(data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const handleUpdate = async (storeId: string, updates: Partial<Seller>) => {
    if (!confirm("Confirm update?")) return;

    try {
      const res = await fetch("/api/market/sellers", {
        method: "PUT",
        body: JSON.stringify({ storeId, ...updates }),
      });
      if (res.ok) {
        toast({ title: "Success", description: "Store updated successfully." });
        fetchSellers();
      } else {
        toast({
          title: "Error",
          description: "Update failed.",
          variant: "destructive",
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Marketplace Operations</h1>

      <div className="bg-background/70 backdrop-blur-xl rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-background/40 backdrop-blur-sm border-b">
            <tr>
              <th className="p-4">Store</th>
              <th className="p-4">Location</th>
              <th className="p-4">Tier</th>
              <th className="p-4">Verification</th>
              <th className="p-4">SLA</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {sellers.map((store) => (
              <tr key={store.id} className="hover:bg-white/60">
                <td className="p-4">
                  <div className="font-bold">{store.name}</div>
                  <div className="text-xs text-gray-500">{store.id}</div>
                </td>
                <td className="p-4 text-sm">
                  {store.StoreProfile?.city || "-"}
                </td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      store.tier === "GOLD"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {store.tier}
                  </span>
                </td>
                <td className="p-4 text-sm">{store.verificationLevel}</td>
                <td className="p-4 text-sm">{store.slaScore}/100</td>
                <td className="p-4 flex gap-2">
                  {store.tier !== "GOLD" && (
                    <Button
                      onClick={() =>
                        handleUpdate(store.id, {
                          tier: "GOLD",
                          verificationLevel: "BUSINESS_VERIFIED",
                        })
                      }
                      className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 h-auto"
                      aria-label={`Verify ${store.name} as Gold`}
                    >
                      Verify Gold
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => handleUpdate(store.id, { slaScore: 100 })}
                    className="px-3 py-1 text-xs rounded hover:bg-white/60 h-auto"
                    aria-label={`Reset SLA score for ${store.name}`}
                  >
                    Reset SLA
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sellers.length === 0 && !loading && (
          <div className="p-8 text-center text-gray-400">
            No active sellers found.
          </div>
        )}
      </div>
    </div>
  );
}
