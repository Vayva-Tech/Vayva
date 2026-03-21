"use client";

import { ReactNode } from "react";
import { Button, Icon } from "@vayva/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";

interface Entity {
  id: string;
  name: string;
}

interface EntityListProps<T extends Entity> {
  title: string;
  icon: string;
  items: T[];
  loading: boolean;
  error: string | null;
  onCreate: () => void;
  onRefresh: () => void;
  renderItem: (item: T) => ReactNode;
  emptyMessage?: string;
  createLabel?: string;
}

export function EntityList<T extends Entity>({
  title,
  icon,
  items,
  loading,
  error,
  onCreate,
  onRefresh,
  renderItem,
  emptyMessage = "No items found",
  createLabel = "Create New",
}: EntityListProps<T>) {
  if (loading) {
    return <LoadingState message={`Loading ${title.toLowerCase()}...`} />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRefresh} />;
  }

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Icon name={icon} className="h-6 w-6 text-green-500" />
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
        <Button onClick={onCreate}>
          <Icon name="Plus" className="mr-2" size={16} />
          {createLabel}
        </Button>
      </div>

      {/* Items Grid */}
      {items.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Icon name={icon} className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">{emptyMessage}</h3>
            <p className="text-sm text-gray-400 mb-6">
              Get started by creating your first item.
            </p>
            <Button onClick={onCreate}>
              <Icon name="Plus" className="mr-2" size={16} />
              {createLabel}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">{item.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {renderItem(item)}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
