"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { logger } from "@vayva/shared";
import { toast } from "sonner";
import { BackButton } from "@/components/ui/BackButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Button,
  Input,
  Label,
  Switch,
  Textarea,
} from "@vayva/ui";
import { FoodProductMetadata } from "@/lib/types/food";
import { Spinner as Loader2 } from "@phosphor-icons/react/ssr";
import { apiJson } from "@/lib/api-client-shared";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageWithInsights } from "@/components/layout/PageWithInsights";

export default function NewMenuItemPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    imageUrl: "",
  });
  const [metadata, setMetadata] = useState<FoodProductMetadata>({
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    spiceLevel: "MILD",
    prepTimeMinutes: 15,
    calories: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiJson<{ success: boolean }>("/api/menu-items", {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          metadata,
        }),
      });

      toast.success("Menu item created!");
      router.push("/dashboard/menu-items");
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[CREATE_MENU_ITEM_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error("Failed to create menu item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageWithInsights
        insights={
          <>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Tip
              </div>
              <div className="mt-2 text-sm font-semibold text-gray-900">
                Better descriptions sell
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Mention ingredients, portion size, and spice level to reduce questions.
              </p>
            </div>
          </>
        }
      >
        <div className="flex items-center gap-4">
          <BackButton
            href="/dashboard/menu-items"
            label="Back to Menu"
            className="mb-0"
          />
          <PageHeader
            title="Add Menu Item"
            subtitle="Create a new dish for your restaurant menu."
          />
        </div>

        <form onSubmit={handleSubmit} className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Basic Details</CardTitle>
            <CardDescription>
              Dish name, price, and description.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Dish Name</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, name: e.target?.value })
                }
                placeholder="e.g. Spicy Chicken Burger"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">Price (NGN)</Label>
              <Input
                id="price"
                type="number"
                required
                value={formData.price}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, price: e.target?.value })
                }
                placeholder="0.00"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData({ ...formData, description: e.target?.value })
                }
                placeholder="Describe the dish..."
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Food Specifics</CardTitle>
            <CardDescription>
              Dietary info, prep time, and spice level.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between border p-4 rounded-lg">
              <div className="space-y-0.5">
                <Label>Vegetarian</Label>
                <p className="text-xs text-gray-500">
                  Is this dish vegetarian friendly?
                </p>
              </div>
              <Switch
                checked={metadata.isVegetarian ?? false}
                onCheckedChange={(checked) =>
                  setMetadata({ ...metadata, isVegetarian: checked })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="prepTime">Prep Time (mins)</Label>
                <Input
                  id="prepTime"
                  type="number"
                  value={metadata.prepTimeMinutes}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setMetadata({
                      ...metadata,
                      prepTimeMinutes: parseInt(e.target?.value),
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Spice Level</Label>
                <Select
                  value={metadata.spiceLevel}
                  onValueChange={(val: string) =>
                    setMetadata({ ...metadata, spiceLevel: val as 'MILD' | 'MEDIUM' | 'HOT' | 'EXTRA_HOT' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MILD">Mild</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HOT">Hot</SelectItem>
                    <SelectItem value="EXTRA_HOT">Extra Hot</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="calories">Calories (kcal)</Label>
              <Input
                id="calories"
                type="number"
                value={metadata.calories}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setMetadata({
                    ...metadata,
                    calories: parseInt(e.target?.value),
                  })
                }
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Dish
            </Button>
          </CardFooter>
        </Card>
        </form>
      </PageWithInsights>
    </div>
  );
}
