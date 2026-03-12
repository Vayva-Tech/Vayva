"use client";

import React from "react";
import Link from "next/link";
import { logger } from "@vayva/shared";
import { Button, Card, Icon } from "@vayva/ui";
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      if (Array.isArray(data)) setItems(data as Record<string, unknown>[]);
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
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Icon
              name="Loader2"
              className="h-8 w-8 animate-spin text-text-tertiary mx-auto mb-3"
            />
            <p className="text-sm text-text-tertiary">
              Loading {title.toLowerCase()}...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto py-6 px-4">
        <Card className="p-12 text-center border-red-200 bg-red-50">
          <Icon
            name="AlertCircle"
            className="h-12 w-12 text-red-500 mx-auto mb-4"
          />
          <h3 className="text-lg font-bold text-red-900 mb-2">
            Failed to Load
          </h3>
          <p className="text-red-700 mb-6">{error}</p>
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
          <h1 className="text-3xl font-black tracking-tight text-black">
            {title}
          </h1>
          <p className="text-text-tertiary mt-1">
            Manage your {title.toLowerCase()} and inventory
          </p>
        </div>
        <Link href={`${pathname}/new`}>
          <Button className="bg-vayva-green text-white hover:bg-vayva-green/90 font-bold apple-button apple-ripple">
            <Icon name="Plus" className="mr-2" size={18} />
            Add {title.slice(0, -1)}
          </Button>
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="bg-background rounded-2xl border-2 border-dashed border-border p-16 text-center">
          <div className="h-20 w-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center mb-6 text-text-tertiary mx-auto">
            <Icon name="PackageOpen" size={40} />
          </div>
          <h3 className="text-2xl font-bold text-text-primary mb-3">
            No {title.toLowerCase()} yet
          </h3>
          <p className="text-text-tertiary max-w-md mx-auto mb-8">
            Get started by adding your first item. It will appear on your
            storefront immediately and customers can start purchasing.
          </p>
          <Link href={`${pathname}/new`}>
            <Button className="bg-black text-white hover:bg-text-primary font-bold apple-button apple-ripple apple-scale-bounce">
              <Icon name="Plus" className="mr-2" size={18} />
              Create Your First {title.slice(0, -1)}
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-background rounded-xl border border-border p-4 flex items-center justify-between shadow-sm apple-card apple-gpu">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <Icon name="Package" size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-text-tertiary">
                  Total Items
                </p>
                <p className="text-2xl font-black text-black">{items.length}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <Link key={item.id as string} href={`${pathname}/${item.id}`}>
                <Card className="overflow-hidden hover:shadow-lg cursor-pointer group border-border apple-card apple-gpu apple-transition">
                  <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden relative">
                    {item.image ? (
                      <img
                        src={item.image as string}
                        alt={item.name as string}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-text-tertiary">
                        <Icon name="Image" size={48} />
                      </div>
                    )}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="bg-black text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg">
                        Edit
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-black truncate mb-1">
                      {item.name as string}
                    </h3>
                    <p className="text-sm text-text-tertiary">
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
