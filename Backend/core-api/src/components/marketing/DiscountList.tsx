"use client";

import { logger } from "@vayva/shared";
import React, { useState } from "react";
import useSWR from "swr";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button, EmptyState } from "@vayva/ui";
import {
  Trash,
  Tag,
  Percent,
  CurrencyDollar as DollarSign,
  PencilSimple as Edit2,
} from "@phosphor-icons/react/ssr";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ConfirmDialog";

import { apiJson } from "@/lib/api-client-shared";

interface DiscountItem {
  id: string;
  name: string;
  code?: string;
  requiresCoupon: boolean;
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  valuePercent?: number;
  valueAmount?: number;
  startsAt: string;
  endsAt?: string;
}

interface DiscountListResponse {
  data?: DiscountItem[];
}

export function DiscountList() {
  const router = useRouter();
  const {
    data: discounts,
    error,
    mutate,
  } = useSWR<DiscountListResponse | DiscountItem[]>(
    "/api/marketing/discounts",
    (url: string) => apiJson<DiscountListResponse | DiscountItem[]>(url),
  );
  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    id: string | null;
  }>({ open: false, id: null });
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await apiJson<{ success: boolean }>(`/api/marketing/discounts/${id}`, {
        method: "DELETE",
      });
      toast.success("Discount deleted");
      void mutate();
    } catch (err: unknown) {
      const _errMsg = err instanceof Error ? err.message : String(err);
      logger.error("[DELETE_DISCOUNT_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error("Failed to delete discount");
    } finally {
      setDeleting(false);
    }
  };

  if (error)
    return <div className="text-red-500">Failed to load discounts</div>;
  if (!discounts)
    return <div className="p-8 text-center text-text-tertiary">Loading...</div>;

  // Ensure discounts is an array
  const discountList = Array.isArray(discounts)
    ? discounts
    : discounts?.data || [];

  if (discountList.length === 0) {
    return (
      <EmptyState
        title="No Discounts Yet"
        description="Create your first discount to drive sales."
        action={
          <Link href="/dashboard/marketing/discounts/new">
            <Button>Create Discount</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="border rounded-md bg-background overflow-hidden">
      <ConfirmDialog
        isOpen={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null })}
        onConfirm={() => {
          if (!confirmDelete.id) return;
          const id = confirmDelete.id;
          setConfirmDelete({ open: false, id: null });
          void handleDelete(id);
        }}
        title="Delete discount?"
        message="This discount will be permanently removed."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={deleting}
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Schedule</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {discountList.map((d) => {
            const status =
              !d.endsAt || new Date(d.endsAt) > new Date()
                ? "Active"
                : "Expired";
            return (
              <TableRow key={d.id}>
                <TableCell>
                  <div className="font-medium">{d.name}</div>
                  {d.code && (
                    <div className="flex items-center gap-1 text-xs text-blue-600 mt-1">
                      <Tag size={12} />
                      <span className="font-mono bg-blue-50 px-1 rounded">
                        {d.code}
                      </span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {d.requiresCoupon ? "Coupon" : "Automatic"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {d.type === "PERCENTAGE" ? (
                      <Percent size={14} />
                    ) : (
                      <DollarSign size={14} />
                    )}
                    <span>
                      {d.type === "PERCENTAGE"
                        ? `${d.valuePercent}%`
                        : `₦${d.valueAmount}`}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={status === "Active" ? "default" : "secondary"}
                  >
                    {status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-text-tertiary">
                  {format(new Date(d.startsAt), "MMM d")}
                  {d.endsAt
                    ? ` - ${format(new Date(d.endsAt), "MMM d, yyyy")}`
                    : " (No expiry)"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-text-tertiary hover:text-indigo-600"
                      onClick={() =>
                        router.push(`/dashboard/marketing/discounts/${d.id}`)
                      }
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-text-tertiary hover:text-red-500"
                      onClick={() => setConfirmDelete({ open: true, id: d.id })}
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
