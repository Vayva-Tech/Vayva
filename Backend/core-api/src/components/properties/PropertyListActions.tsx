"use client";

import { logger } from "@vayva/shared";
import { useState } from "react";
import { Button, Modal } from "@vayva/ui";
import {
  PencilSimple as Pencil,
  Trash as Trash2,
  Spinner as Loader2,
} from "@phosphor-icons/react/ssr";
import { RealEstateForm } from "./RealEstateForm";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface PropertyListActionsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  property: any; // Ideally AccommodationProduct & { product: Product }
}

import { apiJson } from "@/lib/api-client-shared";

export function PropertyListActions({ property }: PropertyListActionsProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await apiJson<{ success: boolean }>(`/api/properties/${property.id}`, {
        method: "DELETE",
      });

      toast.success("Property deleted");
      router.refresh();
      setIsDeleteOpen(false);
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[DELETE_PROPERTY_ERROR]", {
        error: _errMsg,
        app: "merchant",
        propertyId: property.id,
      });
      toast.error("Failed to delete property");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditOpen(true)}
          title="Edit"
        >
          <Pencil className="h-4 w-4 text-text-tertiary" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsDeleteOpen(true)}
          title="Delete"
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Property"
        className="max-w-2xl"
      >
        <RealEstateForm
          onSuccess={() => setIsEditOpen(false)}
          initialData={property}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Property"
        className="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-tertiary">
            Are you sure you want to delete{" "}
            <strong>{property.product?.name || property.title}</strong>? This
            action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
