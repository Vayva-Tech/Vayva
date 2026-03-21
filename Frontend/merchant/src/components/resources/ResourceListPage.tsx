/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-case-declarations */
"use client";

import React from "react";
import Link from "next/link";
import { logger } from "@vayva/shared";
import { Button, Card, Icon, Badge } from "@vayva/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PrimaryObject } from "@/lib/templates/types";
import { usePathname } from "next/navigation";

interface ResourceListPageProps {
  primaryObject: PrimaryObject;
  title: string;
}

import { apiJson } from "@/lib/api-client-shared";

export const ResourceListPage = ({
  primaryObject,
  title,
}: ResourceListPageProps) => {
  const pathname = usePathname();
  const [items, setItems] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadItems = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiJson<unknown[]>(
        `/api/resources/list?type=${primaryObject}`,
      );
      if (Array.isArray(data)) setItems(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load items";
      logger.error("[LOAD_RESOURCES_LIST_ERROR]", {
        error: msg,
        app: "merchant",
      });
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [primaryObject]);

  React.useEffect(() => {
    void loadItems();
  }, [loadItems]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-6 px-4">
        <div className="flex items-center justify-center h-96" aria-live="polite" role="status">
          <div className="text-center">
            <Icon
              name="Loader2"
              className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-3"
            />
            <p className="text-sm text-gray-400">
              Loading {title.toLowerCase()}...
            </p>
            <span className="sr-only">Loading {title.toLowerCase()}...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto py-6 px-4" aria-live="assertive" role="alert">
        <Card className="p-12 text-center border-red-500/20 bg-red-500">
          <Icon
            name="AlertCircle"
            className="h-12 w-12 text-red-500 mx-auto mb-4"
          />
          <h3 className="text-lg font-bold text-red-500 mb-2">
            Failed to Load
          </h3>
          <p className="text-red-500/80 mb-6">{error}</p>
          <Button onClick={() => loadItems()} variant="outline">
            <Icon name="RefreshCw" className="mr-2" size={16} />
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6 apple-stagger">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">
            {title}
          </h1>
          <p className="text-gray-400 mt-1">
            Manage your {title.toLowerCase()} and inventory
          </p>
        </div>
        <Link href={`${pathname}/new`}>
          <Button className="bg-green-500 text-white hover:bg-green-500 font-bold apple-button apple-ripple">
            <Icon name="Plus" className="mr-2" size={18} />
            Add {title.slice(0, -1)}
          </Button>
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-100 p-16 text-center">
          <div className="h-20 w-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-6 text-gray-400 mx-auto">
            <Icon name="PackageOpen" size={40} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            No {title.toLowerCase()} yet
          </h3>
          <p className="text-gray-400 max-w-md mx-auto mb-8">
            Get started by adding your first item. It will appear on your
            storefront immediately and customers can start purchasing.
          </p>
          <Link href={`${pathname}/new`}>
            <Button className="bg-green-500 text-white hover:bg-green-500 font-bold apple-button apple-ripple apple-scale-bounce">
              <Icon name="Plus" className="mr-2" size={18} />
              Create Your First {title.slice(0, -1)}
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between shadow-sm apple-card apple-gpu">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                <Icon name="Package" size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-400">
                  Total Items
                </p>
                <p className="text-2xl font-black text-gray-900">{items.length}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item: any) => (
              <Link key={item.id} href={`${pathname}/${item.id}`}>
                <Card className="overflow-hidden hover:shadow-lg cursor-pointer group border-gray-100 apple-card apple-gpu apple-transition">
                  <div className="aspect-square bg-gray-100 overflow-hidden relative">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <Icon name="Image" size={48} />
                      </div>
                    )}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg">
                        Edit
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 truncate mb-1">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {item.price
                        ? `NGN ${Number(item.price).toLocaleString()}`
                        : "Free"}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
