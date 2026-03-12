"use client";

import { useState } from "react";
import useSWR from "swr";
import { logger } from "@vayva/shared";
import { Button, Input } from "@vayva/ui";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash } from "@phosphor-icons/react/ssr";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { apiJson } from "@/lib/api-client-shared";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface Variant {
  id: string;
  title: string;
  price: number;
  sku: string | null;
  inventory: number;
  options: { name: string; value: string }[];
}

interface VariantManagerProps {
  productId: string;
  variantLabel?: string;
}

const variantSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.coerce.number().min(0, "Price must be positive"),
  sku: z.string().optional(),
  stock: z.coerce.number().int().min(0, "Stock must be a positive integer"),
});

type VariantFormValues = z.infer<typeof variantSchema>;

export function VariantManager({
  productId,
  variantLabel = "Variants",
}: VariantManagerProps) {
  const {
    data: variants,
    mutate,
    error,
  } = useSWR(`/api/products/${productId}/variants`, (url: string) =>
    apiJson<Variant[]>(url),
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    id: string | null;
  }>({ open: false, id: null });
  const [deleting, setDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VariantFormValues>({
    resolver: zodResolver(variantSchema),
    defaultValues: {
      name: "",
      price: 0,
      sku: "",
      stock: 0,
    },
  });

  const handleOpen = (variant?: Variant) => {
    if (variant) {
      setEditingVariant(variant);
      reset({
        name: variant.title,
        price: variant.price || 0,
        sku: variant.sku || "",
        stock: variant.inventory || 0,
      });
    } else {
      setEditingVariant(null);
      reset({ name: "", price: 0, sku: "", stock: 0 });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: VariantFormValues) => {
    try {
      const payload = {
        title: data.name,
        options: [{ name: variantLabel, value: data.name }],
        price: data.price,
        sku: data.sku,
        stock: data.stock,
      };

      const url = editingVariant
        ? `/api/products/${productId}/variants/${editingVariant.id}`
        : `/api/products/${productId}/variants`;

      const method = editingVariant ? "PATCH" : "POST";

      await apiJson<{ success: boolean }>(url, {
        method,
        body: JSON.stringify(payload),
      });

      toast.success(editingVariant ? "Variant updated" : "Variant added");
      setIsDialogOpen(false);
      void mutate();
    } catch (err: unknown) {
      const _errMsg = err instanceof Error ? err.message : String(err);
      logger.error("[SAVE_VARIANT_ERROR]", {
        error: _errMsg,
        productId,
        variantId: editingVariant?.id,
        app: "merchant",
      });
      toast.error(_errMsg || "Error saving variant");
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await apiJson<{ success: boolean }>(
        `/api/products/${productId}/variants/${id}`,
        { method: "DELETE" },
      );
      toast.success("Variant deleted");
      void mutate();
    } catch (err: unknown) {
      const _errMsg = err instanceof Error ? err.message : String(err);
      logger.error("[DELETE_VARIANT_ERROR]", {
        error: _errMsg,
        productId,
        variantId: id,
        app: "merchant",
      });
      toast.error(_errMsg || "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  if (error) return <div className="text-red-500">Failed to load variants</div>;

  return (
    <div className="w-full">
      <ConfirmDialog
        isOpen={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null })}
        onConfirm={() => {
          if (!confirmDelete.id) return;
          const id = confirmDelete.id;
          setConfirmDelete({ open: false, id: null });
          void handleDelete(id);
        }}
        title="Delete variant?"
        message="This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={deleting}
      />
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{variantLabel}</h3>
        <Button
          size="sm"
          onClick={() => handleOpen()}
          aria-label={`Add ${variantLabel}`}
        >
          Add {variantLabel}
        </Button>
      </div>

      <div className="border rounded-md overflow-hidden bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="p-3">Name</TableHead>
              <TableHead className="p-3">Price</TableHead>
              <TableHead className="p-3">SKU</TableHead>
              <TableHead className="p-3">Stock</TableHead>
              <TableHead className="p-3 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variants?.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="p-6 text-center text-text-tertiary"
                >
                  No variants yet. Add one to get started.
                </TableCell>
              </TableRow>
            )}
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {variants?.map((v) => (
              <TableRow key={v.id} className="hover:bg-white/40">
                <TableCell className="p-3 font-medium">{v.title}</TableCell>
                <TableCell className="p-3">{v.price}</TableCell>
                <TableCell className="p-3 text-text-tertiary">
                  {v.sku || "-"}
                </TableCell>
                <TableCell className="p-3">{v.inventory}</TableCell>
                <TableCell className="p-3 text-right flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpen(v)}
                    aria-label={`Edit ${v.title}`}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500"
                    onClick={() => setConfirmDelete({ open: true, id: v.id })}
                    aria-label={`Delete ${v.title}`}
                  >
                    <Trash size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingVariant ? "Edit" : "Add"} {variantLabel}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <div>
              <Label htmlFor="name">Name / Value (e.g. Small, Red)</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="e.g. XL"
                disabled={isSubmitting}
                error={!!errors.name}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  {...register("price")}
                  disabled={isSubmitting}
                  error={!!errors.price}
                />
                {errors.price && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.price.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="sku">SKU</Label>
                <Input id="sku" {...register("sku")} disabled={isSubmitting} />
              </div>
            </div>
            <div>
              <Label htmlFor="stock">Stock On Hand</Label>
              <Input
                id="stock"
                type="number"
                {...register("stock")}
                disabled={isSubmitting}
                error={!!errors.stock}
              />
              {errors.stock && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.stock.message}
                </p>
              )}
              {editingVariant && (
                <p className="text-xs text-text-tertiary mt-1">
                  Adjusting this will create an inventory log.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
