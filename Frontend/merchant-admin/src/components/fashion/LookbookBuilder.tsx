"use client";

import { useState } from "react";
import { Button, Input, Textarea, Label } from "@vayva/ui";
import { Plus, Trash, Eye, Images, ArrowUp, ArrowDown } from "@phosphor-icons/react/ssr";
import { toast } from "sonner";

export interface LookbookItem {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  productIds?: string[];
  order: number;
}

export interface LookbookCollection {
  id: string;
  name: string;
  description?: string;
  coverImage?: string;
  items: LookbookItem[];
  isPublished: boolean;
}

interface LookbookBuilderProps {
  value: LookbookCollection[];
  onChange: (collections: LookbookCollection[]) => void;
}

export function LookbookBuilder({ value, onChange }: LookbookBuilderProps) {
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(
    value[0]?.id || null,
  );
  const [newCollectionName, setNewCollectionName] = useState("");

  const activeCollection = value.find((c) => c.id === activeCollectionId);

  const addCollection = () => {
    if (!newCollectionName.trim()) {
      toast.error("Collection name is required");
      return;
    }

    const newCollection: LookbookCollection = {
      id: crypto.randomUUID(),
      name: newCollectionName.trim(),
      items: [],
      isPublished: false,
    };

    onChange([...value, newCollection]);
    setActiveCollectionId(newCollection.id);
    setNewCollectionName("");
  };

  const removeCollection = (id: string) => {
    const newCollections = value.filter((c) => c.id !== id);
    onChange(newCollections);
    if (activeCollectionId === id) {
      setActiveCollectionId(newCollections[0]?.id || null);
    }
  };

  const updateCollection = (id: string, updates: Partial<LookbookCollection>) => {
    onChange(
      value.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    );
  };

  const addItem = (collectionId: string) => {
    const collection = value.find((c) => c.id === collectionId);
    if (!collection) return;

    const newItem: LookbookItem = {
      id: crypto.randomUUID(),
      title: "",
      imageUrl: "",
      order: collection.items.length,
    };

    updateCollection(collectionId, {
      items: [...collection.items, newItem],
    });
  };

  const removeItem = (collectionId: string, itemId: string) => {
    const collection = value.find((c) => c.id === collectionId);
    if (!collection) return;

    updateCollection(collectionId, {
      items: collection.items.filter((i) => i.id !== itemId),
    });
  };

  const updateItem = (
    collectionId: string,
    itemId: string,
    updates: Partial<LookbookItem>,
  ) => {
    const collection = value.find((c) => c.id === collectionId);
    if (!collection) return;

    updateCollection(collectionId, {
      items: collection.items.map((i) =>
        i.id === itemId ? { ...i, ...updates } : i,
      ),
    });
  };

  const moveItem = (collectionId: string, itemId: string, direction: "up" | "down") => {
    const collection = value.find((c) => c.id === collectionId);
    if (!collection) return;

    const items = [...collection.items];
    const index = items.findIndex((i) => i.id === itemId);
    if (index === -1) return;

    if (direction === "up" && index > 0) {
      [items[index], items[index - 1]] = [items[index - 1], items[index]];
    } else if (direction === "down" && index < items.length - 1) {
      [items[index], items[index + 1]] = [items[index + 1], items[index]];
    }

    updateCollection(collectionId, { items });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Images className="h-5 w-5 text-text-secondary" />
        <h3 className="font-semibold text-text-primary">Lookbook Collections</h3>
      </div>

      {/* Collection Tabs */}
      <div className="flex flex-wrap gap-2">
        {value.map((collection) => (
          <Button
            key={collection.id}
            onClick={() => setActiveCollectionId(collection.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border transition-colors ${
              activeCollectionId === collection.id
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background/50 border-border/40 hover:bg-background"
            }`}
          >
            <span className="truncate max-w-[120px]">{collection.name}</span>
            {!collection.isPublished && (
              <span className="text-[10px] px-1 bg-yellow-500/20 text-yellow-600 rounded">
                Draft
              </span>
            )}
          </Button>
        ))}
        <div className="flex items-center gap-1">
          <Input
            value={newCollectionName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCollectionName(e.target.value)}
            placeholder="New collection..."
            className="w-36 h-8 text-sm"
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && (e.preventDefault(), addCollection())}
          />
          <Button size="sm" variant="outline" onClick={addCollection} className="h-8 px-2">
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Active Collection */}
      {activeCollection ? (
        <div className="space-y-4 border border-border/40 rounded-lg p-4 bg-background/50">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div>
                <Label className="text-xs">Collection Name</Label>
                <Input
                  value={activeCollection.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateCollection(activeCollection.id, { name: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Description</Label>
                <Textarea
                  value={activeCollection.description || ""}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    updateCollection(activeCollection.id, { description: e.target.value })
                  }
                  placeholder="Describe this collection..."
                  rows={2}
                  className="mt-1 resize-none"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  updateCollection(activeCollection.id, {
                    isPublished: !activeCollection.isPublished,
                  })
                }
              >
                <Eye className="h-4 w-4 mr-1" />
                {activeCollection.isPublished ? "Published" : "Draft"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeCollection(activeCollection.id)}
                className="text-text-tertiary hover:text-red-500"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Items Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Items ({activeCollection.items.length})</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => addItem(activeCollection.id)}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Item
              </Button>
            </div>

            {activeCollection.items.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {activeCollection.items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="group relative bg-background rounded-lg border border-border/40 overflow-hidden"
                  >
                    {/* Image Preview */}
                    <div className="aspect-square bg-muted flex items-center justify-center">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Images className="h-8 w-8 text-text-tertiary" />
                      )}
                    </div>

                    {/* Controls */}
                    <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => moveItem(activeCollection.id, item.id, "up")}
                        disabled={idx === 0}
                        className="h-7 w-7 p-0"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => moveItem(activeCollection.id, item.id, "down")}
                        disabled={idx === activeCollection.items.length - 1}
                        className="h-7 w-7 p-0"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(activeCollection.id, item.id)}
                        className="h-7 w-7 p-0"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Inputs */}
                    <div className="p-2 space-y-2">
                      <Input
                        value={item.imageUrl}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          updateItem(activeCollection.id, item.id, {
                            imageUrl: e.target.value,
                          })
                        }
                        placeholder="Image URL"
                        className="h-7 text-xs"
                      />
                      <Input
                        value={item.title}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          updateItem(activeCollection.id, item.id, { title: e.target.value })
                        }
                        placeholder="Title"
                        className="h-7 text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-tertiary italic py-4 text-center">
                No items yet. Click "Add Item" to build your lookbook.
              </p>
            )}
          </div>
        </div>
      ) : value.length === 0 ? (
        <p className="text-sm text-text-tertiary italic">
          No collections. Create your first lookbook collection above.
        </p>
      ) : null}
    </div>
  );
}
