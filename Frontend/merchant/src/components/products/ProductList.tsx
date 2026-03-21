"use client";
import React from "react";
import {
  ProductServiceItem,
  ProductServiceType,
  ProductServiceStatus,
} from "@vayva/shared";
import { Badge, Button, Icon, cn } from "@vayva/ui";
import { ResponsiveTable, Column } from "@/components/ui/ResponsiveTable";

interface ProductListProps {
  items: ProductServiceItem[];
  onEdit: (item: ProductServiceItem) => void;
  onDelete: (id: string, name: string) => void;
  onCreate?: () => void;
  isLoading: boolean;
}

export const ProductList: React.FC<ProductListProps> = ({
  items,
  onEdit,
  onDelete,
  onCreate,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-400">
        Loading products...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="p-16 text-center text-gray-400 flex flex-col items-center">
        <div className="w-20 h-20 bg-white/40 rounded-full flex items-center justify-center mb-6 ring-8 ring-gray-50/50">
          <Icon name="Package" size={40} className="text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Your product catalog is empty
        </h3>
        <p className="text-gray-400 max-w-sm mb-8">
          Add products so Vayva can generate invoices, track inventory, and help
          customers order online.
        </p>
        <Button
          variant="outline"
          className="gap-2 touch-target"
          onClick={onCreate}
        >
          <Icon name="Plus" size={16} /> Add your first product
        </Button>
      </div>
    );
  }

  const columns: Column<ProductServiceItem>[] = [
    {
      key: "name",
      label: "Product",
      priority: "high",
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-white/40 border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
            {item.images?.[0] ? (
              <img
                src={item.images[0]}
                alt={item.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <Icon name="Image" size={20} className="text-gray-400" />
            )}
          </div>
          <div className="min-w-0">
            <div className="font-medium text-gray-900 line-clamp-1">
              {item.name}
            </div>
            <div className="text-xs text-gray-400 line-clamp-1">
              {item.description || "No description"}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      priority: "medium",
      render: (item) => (
        <Badge
          variant={
            item.type === ProductServiceType.RETAIL
              ? "default"
              : item.type === ProductServiceType.FOOD
                ? "warning"
                : "info"
          }
          className="uppercase text-[10px] tracking-wider"
        >
          {item.type}
        </Badge>
      ),
    },
    {
      key: "price",
      label: "Price",
      priority: "high",
      render: (item) => (
        <span className="font-mono text-sm text-gray-500">
          {item.currency} {item.price.toLocaleString()}
        </span>
      ),
    },
    {
      key: "inventory",
      label: "Status / Stock",
      mobileLabel: "Stock",
      priority: "medium",
      render: (item) => {
        if (item.inventory?.enabled) {
          return (
            <div
              className={cn(
                "flex items-center gap-2 text-sm",
                item.inventory.quantity <=
                  (item.inventory.lowStockThreshold || 5)
                  ? "text-orange-600"
                  : "text-gray-500",
              )}
            >
              <span
                className={cn(
                  "w-2 h-2 rounded-full",
                  item.inventory.quantity === 0
                    ? "bg-red-500"
                    : item.inventory.quantity <=
                        (item.inventory.lowStockThreshold || 5)
                      ? "bg-orange-500"
                      : "bg-green-500",
                )}
              />
              {item.inventory.quantity} in stock
            </div>
          );
        }
        return (
          <div className="text-sm text-gray-400">
            {item.type === ProductServiceType.SERVICE
              ? "Booking Available"
              : "Always in stock"}
          </div>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      priority: "high",
      render: (item) => (
        <div
          className="flex items-center justify-end gap-1"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-400 hover:text-black touch-target-sm"
            onClick={() => onEdit(item)}
            aria-label={`Edit ${item.name}`}
            title={`Edit ${item.name}`}
          >
            <Icon name="Pencil" size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 touch-target-sm"
            onClick={() => onDelete(item.id, item.name)}
            aria-label={`Delete ${item.name}`}
            title={`Delete ${item.name}`}
          >
            <Icon name="Trash2" size={14} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <ResponsiveTable<ProductServiceItem>
      data={items}
      columns={columns}
      keyExtractor={(item) => item.id}
      onRowClick={onEdit}
      loading={isLoading}
      emptyMessage="No products found"
    />
  );
};
