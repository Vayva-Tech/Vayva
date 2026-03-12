"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  ForkKnife,
  Plus,
  Spinner as Loader2,
  PencilSimple as Edit,
  Trash,
  CheckCircle,
  X,
  Fire,
  Leaf,
  MagnifyingGlass,
  List,
} from "@phosphor-icons/react/ssr";
import { Wheat } from "lucide-react";
import { logger, formatCurrency } from "@vayva/shared";
import { PageHeader } from "@/components/wix-style/PageHeader";
import { Button, Input, Badge } from "@vayva/ui";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { apiJson } from "@/lib/api-client-shared";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  subCategory?: string;
  isAvailable: boolean;
  isPopular: boolean;
  dietaryInfo: {
    vegetarian?: boolean;
    vegan?: boolean;
    glutenFree?: boolean;
    dairyFree?: boolean;
    nutFree?: boolean;
    spicy?: boolean;
    halal?: boolean;
    kosher?: boolean;
  };
  ingredients: string[];
  allergens: string[];
  calories?: number;
  preparationTime?: number; // in minutes
  imageUrl?: string;
  sku: string;
  costOfGoods?: number;
  profitMargin?: number;
}

export default function MenuItemsPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("all");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    subCategory: "",
    isAvailable: true,
    isPopular: false,
    dietaryInfo: {
      vegetarian: false,
      vegan: false,
      glutenFree: false,
      dairyFree: false,
      nutFree: false,
      spicy: false,
      halal: false,
      kosher: false,
    },
    ingredients: "",
    allergens: "",
    calories: "",
    preparationTime: "",
    sku: "",
    costOfGoods: "",
  });

  useEffect(() => {
    void fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await apiJson<MenuItem[]>("/api/menu-items");
      setItems(data || []);
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[FETCH_MENU_ITEMS_ERROR]", { error: _errMsg, app: "merchant" });
      toast.error(_errMsg || "Could not load menu items");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const priceNum = Number(formData.price);
    if (!formData.name || isNaN(priceNum) || !formData.category) {
      return toast.error("Please fill all required fields (Name, Price, Category)");
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        price: priceNum,
        calories: formData.calories ? Number(formData.calories) : undefined,
        preparationTime: formData.preparationTime ? Number(formData.preparationTime) : undefined,
        costOfGoods: formData.costOfGoods ? Number(formData.costOfGoods) : undefined,
        ingredients: formData.ingredients.split(",").map((i) => i.trim()).filter(Boolean),
        allergens: formData.allergens.split(",").map((a) => a.trim()).filter(Boolean),
      };

      if (editingItem) {
        await apiJson(`/api/menu-items/${editingItem.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        toast.success("Menu item updated");
      } else {
        await apiJson("/api/menu-items", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Menu item added");
      }

      setIsOpen(false);
      setEditingItem(null);
      resetForm();
      void fetchItems();
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[SAVE_MENU_ITEM_ERROR]", { error: _errMsg, app: "merchant" });
      toast.error(_errMsg || "Failed to save menu item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiJson(`/api/menu-items/${id}`, { method: "DELETE" });
      toast.success("Menu item removed");
      setDeleteConfirm(null);
      void fetchItems();
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[DELETE_MENU_ITEM_ERROR]", { error: _errMsg, app: "merchant" });
      toast.error(_errMsg || "Failed to remove menu item");
    }
  };

  const openEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || "",
      price: String(item.price),
      category: item.category,
      subCategory: item.subCategory || "",
      isAvailable: item.isAvailable,
      isPopular: item.isPopular,
      dietaryInfo: {
        vegetarian: item.dietaryInfo?.vegetarian || false,
        vegan: item.dietaryInfo?.vegan || false,
        glutenFree: item.dietaryInfo?.glutenFree || false,
        dairyFree: item.dietaryInfo?.dairyFree || false,
        nutFree: item.dietaryInfo?.nutFree || false,
        spicy: item.dietaryInfo?.spicy || false,
        halal: item.dietaryInfo?.halal || false,
        kosher: item.dietaryInfo?.kosher || false,
      },
      ingredients: item.ingredients?.join(", ") || "",
      allergens: item.allergens?.join(", ") || "",
      calories: item.calories ? String(item.calories) : "",
      preparationTime: item.preparationTime ? String(item.preparationTime) : "",
      sku: item.sku || "",
      costOfGoods: item.costOfGoods ? String(item.costOfGoods) : "",
    });
    setIsOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      subCategory: "",
      isAvailable: true,
      isPopular: false,
      dietaryInfo: {
        vegetarian: false,
        vegan: false,
        glutenFree: false,
        dairyFree: false,
        nutFree: false,
        spicy: false,
        halal: false,
        kosher: false,
      },
      ingredients: "",
      allergens: "",
      calories: "",
      preparationTime: "",
      sku: "",
      costOfGoods: "",
    });
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    const matchesAvailability = availabilityFilter === "all"
      || (availabilityFilter === "available" && item.isAvailable)
      || (availabilityFilter === "unavailable" && !item.isAvailable);
    return matchesSearch && matchesCategory && matchesAvailability;
  });

  const categories = [...new Set(items.map((i) => i.category).filter(Boolean))];
  const totalItems = items.length;
  const availableItems = items.filter((i) => i.isAvailable).length;
  const popularItems = items.filter((i) => i.isPopular).length;

  const getDietaryBadges = (item: MenuItem) => {
    const badges = [];
    if (item.dietaryInfo?.vegetarian) badges.push({ icon: Leaf, label: "Veg", color: "text-green-600" });
    if (item.dietaryInfo?.vegan) badges.push({ icon: Leaf, label: "Vegan", color: "text-green-600" });
    if (item.dietaryInfo?.glutenFree) badges.push({ icon: Wheat, label: "GF", color: "text-yellow-600" });
    if (item.dietaryInfo?.spicy) badges.push({ icon: Fire, label: "Spicy", color: "text-red-600" });
    return badges;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Menu Items"
        description="Manage your restaurant menu, dishes, and offerings"
        primaryAction={{
          label: "Add Item",
          icon: "Plus",
          onClick: () => {
            setEditingItem(null);
            resetForm();
            setIsOpen(true);
          }
        }}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-background/70 backdrop-blur-xl p-4 rounded-xl border">
          <p className="text-sm text-muted-foreground">Total Items</p>
          <p className="text-2xl font-bold">{totalItems}</p>
        </div>
        <div className="bg-background/70 backdrop-blur-xl p-4 rounded-xl border">
          <p className="text-sm text-muted-foreground">Available</p>
          <p className="text-2xl font-bold text-green-600">{availableItems}</p>
        </div>
        <div className="bg-background/70 backdrop-blur-xl p-4 rounded-xl border">
          <p className="text-sm text-muted-foreground">Categories</p>
          <p className="text-2xl font-bold">{categories.length}</p>
        </div>
        <div className="bg-background/70 backdrop-blur-xl p-4 rounded-xl border">
          <p className="text-sm text-muted-foreground">Popular</p>
          <p className="text-2xl font-bold text-orange-600">{popularItems}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border bg-background"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={availabilityFilter}
          onChange={(e) => setAvailabilityFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border bg-background"
        >
          <option value="all">All Items</option>
          <option value="available">Available Only</option>
          <option value="unavailable">Unavailable</option>
        </select>
      </div>

      {/* Menu Items Grid */}
      <div className="bg-background/70 backdrop-blur-xl rounded-xl border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <ForkKnife className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold">No menu items yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Add your first menu item to start serving customers.
            </p>
            <Button onClick={() => setIsOpen(true)} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`bg-background/50 rounded-xl border p-4 hover:shadow-md transition-shadow ${!item.isAvailable ? "opacity-60" : ""}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <ForkKnife className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{item.name}</h3>
                        {item.isPopular && (
                          <Badge variant="default" className="text-xs">Popular</Badge>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">{item.category}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => setDeleteConfirm({ id: item.id, name: item.name })}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl font-bold text-primary">{formatCurrency(item.price)}</span>
                  {!item.isAvailable && (
                    <Badge variant="error" className="text-xs">Unavailable</Badge>
                  )}
                </div>

                {/* Dietary Badges */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {getDietaryBadges(item).map((badge) => (
                    <Badge key={badge.label} variant="outline" className={`text-xs ${badge.color} flex items-center gap-1`}>
                      <badge.icon className="h-3 w-3" />
                      {badge.label}
                    </Badge>
                  ))}
                </div>

                {/* Additional Info */}
                <div className="space-y-1 text-xs text-muted-foreground">
                  {item.calories && <span>{item.calories} cal</span>}
                  {item.preparationTime && (
                    <span className="ml-2">• {item.preparationTime} min prep</span>
                  )}
                  {item.costOfGoods && (
                    <span className="ml-2">• Margin: {Math.round((item.price - item.costOfGoods) / item.price * 100)}%</span>
                  )}
                </div>

                {/* Allergens */}
                {item.allergens?.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-red-600">Allergens:</span> {item.allergens.join(", ")}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Menu Item" : "Add Menu Item"}</DialogTitle>
            <DialogDescription>
              {editingItem ? "Update menu item details" : "Enter details for a new menu item"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Item Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Grilled Salmon"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the dish..."
                className="w-full px-3 py-2 rounded-lg border bg-background min-h-[80px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Mains, Starters"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="calories">Calories</Label>
                <Input
                  id="calories"
                  type="number"
                  value={formData.calories}
                  onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                  placeholder="e.g., 450"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prepTime">Prep Time (min)</Label>
                <Input
                  id="prepTime"
                  type="number"
                  value={formData.preparationTime}
                  onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
                  placeholder="e.g., 15"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="Item code"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ingredients">Ingredients (comma-separated)</Label>
              <Input
                id="ingredients"
                value={formData.ingredients}
                onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                placeholder="e.g., Salmon, Lemon, Herbs, Olive Oil"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="allergens">Allergens (comma-separated)</Label>
              <Input
                id="allergens"
                value={formData.allergens}
                onChange={(e) => setFormData({ ...formData, allergens: e.target.value })}
                placeholder="e.g., Fish, Gluten, Dairy"
              />
            </div>
            {/* Dietary Options */}
            <div className="space-y-2">
              <Label>Dietary Information</Label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(formData.dietaryInfo).map(([key, value]) => (
                  <Label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setFormData({
                        ...formData,
                        dietaryInfo: { ...formData.dietaryInfo, [key]: e.target.checked }
                      })}
                      className="rounded"
                    />
                    <span className="capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                  </Label>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 flex items-center">
                <Label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPopular}
                    onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                    className="rounded"
                  />
                  Mark as Popular
                </Label>
              </div>
              <div className="space-y-2 flex items-center">
                <Label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                    className="rounded"
                  />
                  Available for Order
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : editingItem ? "Update" : "Add Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm.id)}
        title="Remove Menu Item"
        message={`Are you sure you want to remove "${deleteConfirm?.name}" from your menu?`}
        confirmText="Remove Item"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
