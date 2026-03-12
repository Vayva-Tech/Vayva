"use client";

import { useState, useEffect } from "react";
import { Button, Badge } from "@vayva/ui";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { apiJson } from "@/lib/api-client-shared";
import { 
  Trash, 
  ArrowCounterClockwise,
  Clock, 
  Warning,
  Package,
  Users,
  Storefront
} from "@phosphor-icons/react/ssr";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface TrashedItem {
  id: string;
  type: "product" | "customer" | "order" | "category" | "coupon";
  name: string;
  deletedAt: string;
  deletedBy: string;
  expiresAt: string;
  details: Record<string, unknown>;
}

export function TrashBin() {
  const [items, setItems] = useState<TrashedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [itemToRestore, setItemToRestore] = useState<TrashedItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<TrashedItem | null>(null);

  useEffect(() => {
    fetchTrashedItems();
  }, []);

  const fetchTrashedItems = async () => {
    try {
      const data = await apiJson<{ items: TrashedItem[] }>(
        "/api/trash-bin",
        { method: "GET" }
      );
      setItems(data.items || []);
    } catch {
      // Show empty state on error — no mock data in production
      setItems([]);
      toast.error("Failed to load trash bin items");
    } finally {
      setLoading(false);
    }
  };

  const restoreItem = async (item: TrashedItem) => {
    try {
      await apiJson("/api/trash-bin/restore", {
        method: "POST",
        body: JSON.stringify({ itemId: item.id, type: item.type }),
      });

      setItems((prev) => prev.filter((i) => i.id !== item.id));
      toast.success(`${item.name} restored successfully`);
      setItemToRestore(null);
    } catch {
      toast.error("Failed to restore item");
    }
  };

  const permanentlyDelete = async (item: TrashedItem) => {
    try {
      await apiJson("/api/trash-bin/permanent-delete", {
        method: "POST",
        body: JSON.stringify({ itemId: item.id, type: item.type }),
      });

      setItems((prev) => prev.filter((i) => i.id !== item.id));
      toast.success(`${item.name} permanently deleted`);
      setItemToDelete(null);
    } catch {
      toast.error("Failed to delete item");
    }
  };

  const emptyTrash = async () => {
    try {
      await apiJson("/api/trash-bin/empty", { method: "POST" });
      setItems([]);
      toast.success("Trash bin emptied");
    } catch {
      toast.error("Failed to empty trash");
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "product":
        return Package;
      case "customer":
        return Users;
      case "order":
        return Storefront;
      default:
        return Trash;
    }
  };

  const filteredItems = activeTab === "all" 
    ? items 
    : items.filter((item) => item.type === activeTab);

  const formatTimeRemaining = (expiresAt: string) => {
    const expires = new Date(expiresAt).getTime();
    const now = Date.now();
    const days = Math.ceil((expires - now) / 86400000);
    return days <= 3 
      ? <span className="text-destructive font-medium">{days} days left</span>
      : <span>{days} days left</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Trash Bin</h1>
          <p className="text-muted-foreground">
            Items are automatically deleted after 30 days
          </p>
        </div>
        {items.length > 0 && (
          <Button variant="destructive" onClick={emptyTrash}>
            <Trash className="w-4 h-4 mr-2" />
            Empty Trash
          </Button>
        )}
      </div>

      {/* Alert */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
        <Warning className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-yellow-800">Important</p>
          <p className="text-sm text-yellow-700">
            Items in trash will be permanently deleted after 30 days and cannot be recovered.
            Restore items you want to keep.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            All ({items.length})
          </TabsTrigger>
          <TabsTrigger value="product">
            Products ({items.filter(i => i.type === "product").length})
          </TabsTrigger>
          <TabsTrigger value="customer">
            Customers ({items.filter(i => i.type === "customer").length})
          </TabsTrigger>
          <TabsTrigger value="order">
            Orders ({items.filter(i => i.type === "order").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Trash className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Trash bin is empty</p>
              <p className="text-sm">Deleted items will appear here</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left">Item</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left">Deleted</th>
                    <th className="px-4 py-3 text-left">Retention</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredItems.map((item: TrashedItem) => {
                    const Icon = getTypeIcon(item.type);
                    return (
                      <tr key={item.id} className="hover:bg-muted/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-xs text-muted-foreground">
                                by {item.deletedBy}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="capitalize">
                            {item.type}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(item.deletedAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            {formatTimeRemaining(item.expiresAt)}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setItemToRestore(item)}
                            >
                              <ArrowCounterClockwise className="w-4 h-4 mr-2" />
                              Restore
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              onClick={() => setItemToDelete(item)}
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Restore Dialog */}
      {itemToRestore && (
        <ConfirmDialog
          open={!!itemToRestore}
          title="Restore Item"
          description={`Are you sure you want to restore "${itemToRestore?.name}"? It will be returned to its original location.`}
          confirmLabel="Restore"
          cancelLabel="Cancel"
          variant="default"
          onConfirm={() => itemToRestore && restoreItem(itemToRestore)}
          onCancel={() => setItemToRestore(null)}
        />
      )}

      {/* Permanent Delete Dialog */}
      {itemToDelete && (
        <ConfirmDialog
          open={!!itemToDelete}
          title="Permanently Delete"
          description={`Are you sure you want to permanently delete "${itemToDelete?.name}"? This action cannot be undone.`}
          confirmLabel="Delete Forever"
          cancelLabel="Cancel"
          variant="danger"
          onConfirm={() => itemToDelete && permanentlyDelete(itemToDelete)}
          onCancel={() => setItemToDelete(null)}
        />
      )}
    </div>
  );
}
