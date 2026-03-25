"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { BackButton } from "@/components/ui/BackButton";
import { Button, Input, Label, Select, Textarea } from "@vayva/ui";
import { FloppyDisk as Save, Trash } from "@phosphor-icons/react/ssr";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { logger } from "@vayva/shared";
import { FileUpload } from "@/components/ui/FileUpload";
import { ProductDeliverySection } from "@/components/products/ProductDeliverySection";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageWithInsights } from "@/components/layout/PageWithInsights";

import { apiJson } from "@/lib/api-client-shared";

interface ProductData {
  id: string;
  name: string;
  description: string | null;
  price: number;
  inventory: number;
  status: string;
  images?: string[];
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [product, setProduct] = useState<ProductData | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    inventory: "",
    status: "DRAFT",
    images: [] as string[],
  });

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await apiJson<ProductData>(`/api/products/${id}`);
        setProduct(data);
        setFormData({
          name: data.name,
          description: data.description || "",
          price: data.price?.toString() || "0",
          inventory: data.inventory?.toString() || "0",
          status: (data as any).status,
          images: data.images || [],
        });
      } catch (err: unknown) {
        const _errMsg = err instanceof Error ? err.message : String(err);
        logger.error("[FETCH_PRODUCT_ERROR]", {
          error: _errMsg,
          productId: id,
          app: "merchant",
        });
        toast.error("Failed to load product");
        router.push("/dashboard/products");
      } finally {
        setLoading(false);
      }
    };

    void fetchProduct();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiJson<{ success: boolean }>(`/api/products/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          ...formData,
          images: formData.images,
        }),
      });

      toast.success("Product updated successfully");
      router.push("/dashboard/products");
    } catch (err: unknown) {
      const _errMsg = err instanceof Error ? err.message : String(err);
      logger.error("[UPDATE_PRODUCT_ERROR]", {
        error: _errMsg,
        productId: id,
        app: "merchant",
      });
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await apiJson<{ success: boolean }>(`/api/products/${id}`, {
        method: "DELETE",
      });

      toast.success("Product deleted successfully");
      router.push("/dashboard/products");
    } catch (err: unknown) {
      const _errMsg = err instanceof Error ? err.message : String(err);
      logger.error("[DELETE_PRODUCT_ERROR]", {
        error: _errMsg,
        productId: id,
        app: "merchant",
      });
      toast.error("Delete failed");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-text-green-600" />
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="space-y-6">
      {/* Live region for screen readers */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {saving && <p>Saving product changes...</p>}
        {deleting && <p>Deleting product...</p>}
      </div>

      {/* Loading overlay during save/delete */}
      {(saving || deleting) && (
        <div className="fixed inset-0 bg-gray-50  z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
            <p className="text-sm font-medium text-gray-700">
              {saving ? "Saving changes..." : "Deleting product..."}
            </p>
          </div>
        </div>
      )}

      <PageWithInsights
        insights={
          <>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Quick actions
              </div>
              <div className="mt-3 grid gap-2">
                <Button
                  variant="outline"
                  className="text-red-500 border-red-500/20 hover:bg-red-500 justify-between"
                  onClick={() => setShowDeleteConfirm(true)}
                  aria-label="Delete product"
                >
                  <span>Delete</span>
                  <Trash className="h-4 w-4" />
                </Button>
                <Button onClick={handleSubmit} disabled={saving} className="justify-between">
                  <span>{saving ? "Saving..." : "Save changes"}</span>
                  <Save className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Tip
              </div>
              <div className="mt-2 text-sm font-semibold text-gray-900">
                Keep images consistent
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Similar backgrounds and angles help your catalog look premium.
              </p>
            </div>
          </>
        }
      >
        <div className="flex items-center gap-4">
          <BackButton href="/dashboard/products" />
          <PageHeader title="Edit Product" subtitle="Update your product details" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white  p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-900">Basic Details</h2>
            <div className="space-y-2">
              <Label>Product Name</Label>
              <Input
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, name: e.target?.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData({ ...formData, description: e.target?.value })
                }
                rows={5}
              />
            </div>
          </div>

          <div className="bg-white  p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-900">
              Inventory & Pricing
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price (NGN)</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, price: e.target?.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Stock Quantity</Label>
                <Input
                  type="number"
                  value={formData.inventory}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, inventory: e.target?.value })
                  }
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white  p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-900">Status</h2>
            <Select
              className="w-full p-2 border border-gray-200 rounded-lg"
              value={formData.status}
              aria-label="Product Status"
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setFormData({ ...formData, status: e.target?.value })
              }
            >
              <option value="ACTIVE">Active</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
            </Select>
            <p className="text-xs text-gray-500">
              {formData.status?.toUpperCase() === "ACTIVE"
                ? "Product is visible to customers."
                : "Product is hidden from store."}
            </p>
          </div>

          {/* Image Upload */}
          <div className="bg-white  p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-900">Product Images</h2>
            <div className="space-y-4">
              {formData?.images?.map((imageUrl: any, index: number) => (
                <div
                  key={index}
                  className="relative border rounded-lg p-4 flex items-center gap-3 bg-white/40"
                >
                  <div className="h-16 w-16 bg-white rounded-md border flex items-center justify-center overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={`Product image ${index + 1}`}
                      className="h-full w-full object-cover rounded-md"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-green-600 hover:underline">
                      <a href={imageUrl} target="_blank" rel="noopener noreferrer">
                        Image {index + 1}
                      </a>
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        images: prev.images?.filter((_: any, i: number) => i !== index),
                      }));
                    }}
                    className="h-8 w-8 text-gray-500 hover:text-red-500"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <FileUpload
                value=""
                onChange={(url: string) => {
                  setFormData(prev => ({
                    ...prev,
                    images: [...prev.images, url],
                  }));
                }}
                accept="image/jpeg,image/png,image/webp,image/gif"
                label="Upload Product Image"
                maxSizeMB={10}
                purpose="PRODUCT_IMAGE"
                entityId={id}
              />
            </div>
          </div>

          {/* Delivery Settings */}
          <ProductDeliverySection productId={id} />
        </div>
      </div>
      </PageWithInsights>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${product?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
