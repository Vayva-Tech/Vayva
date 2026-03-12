"use client";

import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { logger } from "@vayva/shared";
import { Badge, Button, Card, Icon } from "@vayva/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface InventoryMovement {
  id: string;
  type: string; // "adjustment", "order", "return"
  quantity: number;
  reason: string | null;
  createdAt: string;
  variantName: string;
  performedBy: string | null;
}

import { apiJson } from "@/lib/api-client-shared";

export const InventoryHistory = ({ productId }: { productId: string }) => {
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchHistory();
  }, [productId]);

  const fetchHistory = async () => {
    try {
      const data = await apiJson<InventoryMovement[]>(
        `/api/products/${productId}/inventory/history`,
      );
      if (data) {
        setMovements(data);
      }
    } catch (err: unknown) {
      const _errMsg = err instanceof Error ? err.message : String(err);
      logger.error("[FETCH_INVENTORY_HISTORY_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="text-center p-4 text-text-tertiary">
        Loading history...
      </div>
    );

  return (
    <Card className="p-0 overflow-hidden">
      <div className="p-4 border-b border-border/40 flex justify-between items-center bg-white/30">
        <h3 className="font-bold text-sm uppercase tracking-wider text-text-secondary">
          Stock History
        </h3>
        <Button variant="ghost" size="sm" onClick={fetchHistory}>
          <Icon name="RefreshCcw" size={14} />
        </Button>
      </div>

      {movements.length === 0 ? (
        <div className="p-8 text-center text-text-tertiary text-sm">
          No stock movements recorded.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white/40 text-text-tertiary font-medium border-b border-border/40">
              <tr>
                <th className="p-3 pl-4">Date</th>
                <th className="p-3">Variant</th>
                <th className="p-3">Type</th>
                <th className="p-3 text-right">Change</th>
                <th className="p-3">Reason</th>
                <th className="p-3">User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {movements.map((move) => (
                <tr key={move.id} className="hover:bg-white/30">
                  <td className="p-3 pl-4 text-text-secondary">
                    {format(new Date(move.createdAt), "MMM d, HH:mm")}
                  </td>
                  <td className="p-3 font-medium text-text-primary">
                    {move.variantName}
                  </td>
                  <td className="p-3">
                    <Badge variant={move.quantity > 0 ? "success" : "default"}>
                      {move.type}
                    </Badge>
                  </td>
                  <td
                    className={`p-3 text-right font-mono ${move.quantity > 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {move.quantity > 0 ? "+" : ""}
                    {move.quantity}
                  </td>
                  <td className="p-3 text-text-tertiary max-w-[200px] truncate">
                    {move.reason || "-"}
                  </td>
                  <td className="p-3 text-text-tertiary text-xs">
                    {move.performedBy || "System"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};
