"use client";

import { useState, useCallback } from "react";
import { Button, Icon } from "@vayva/ui";
import { toast } from "sonner";
import { Trash, Archive, UploadSimple } from "@phosphor-icons/react/ssr";
import { apiJson } from "@/lib/api-client-shared";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface BulkActionToolbarProps {
  selectedIds: string[];
  onClearSelection: () => void;
  onRefresh: () => void;
}

interface BulkActionResponse {
  success: boolean;
  updated?: number;
  deleted?: number;
  message?: string;
}

export function BulkActionToolbar({
  selectedIds,
  onClearSelection,
  onRefresh,
}: BulkActionToolbarProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUnpublishing, setIsUnpublishing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const selectedCount = selectedIds.length;

  const handleBulkDelete = async () => {
    if (selectedCount === 0) return;
    setIsDeleting(true);
    try {
      const result = await apiJson<BulkActionResponse>("/products/bulk-delete", {
        method: "POST",
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (result.success) {
        toast.success(`Deleted ${result.deleted || selectedCount} products`);
        onClearSelection();
        onRefresh();
      } else {
        toast.error(result.message || "Failed to delete products");
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Delete failed";
      toast.error(msg);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleBulkPublish = async (publish: boolean) => {
    if (selectedCount === 0) return;
    if (publish) setIsPublishing(true);
    else setIsUnpublishing(true);

    try {
      const result = await apiJson<BulkActionResponse>("/products/bulk-status", {
        method: "POST",
        body: JSON.stringify({ ids: selectedIds, published: publish }),
      });

      if (result.success) {
        toast.success(
          `${result.updated || selectedCount} products ${publish ? "published" : "unpublished"}`
        );
        onClearSelection();
        onRefresh();
      } else {
        toast.error(result.message || "Failed to update products");
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Update failed";
      toast.error(msg);
    } finally {
      setIsPublishing(false);
      setIsUnpublishing(false);
    }
  };

  if (selectedCount === 0) return null;

  return (
    <>
      <div className="flex items-center justify-between bg-green-500/5 p-4 rounded-xl border border-green-500/20 animate-in slide-in-from-top-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white font-semibold text-sm">
            {selectedCount}
          </div>
          <span className="font-medium text-sm">
            {selectedCount === 1 ? "product selected" : "products selected"}
          </span>
          <Button variant="ghost" size="sm" onClick={onClearSelection}>
            Clear
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleBulkPublish(true)}
            disabled={isPublishing || isUnpublishing || isDeleting}
            isLoading={isPublishing}
          >
            <UploadSimple className="w-4 h-4 mr-2" />
            Publish
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleBulkPublish(false)}
            disabled={isPublishing || isUnpublishing || isDeleting}
            isLoading={isUnpublishing}
          >
            <Archive className="w-4 h-4 mr-2" />
            Unpublish
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-500 hover:bg-red-500"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isPublishing || isUnpublishing || isDeleting}
            isLoading={isDeleting}
          >
            <Trash className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={handleBulkDelete}
        title="Delete Products?"
        description={`Are you sure you want to delete ${selectedCount} product${selectedCount === 1 ? "" : "s"}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
