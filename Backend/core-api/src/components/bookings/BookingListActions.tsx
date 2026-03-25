"use client";

import { useState } from "react";
import { Button, Modal } from "@vayva/ui";
import {
  PencilSimple as Pencil,
  Trash as Trash2,
  Spinner as Loader2
} from "@phosphor-icons/react/ssr";
import { BookingForm } from "./BookingForm";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { logger } from "@vayva/shared";

interface Booking {
  id: string;
  serviceId: string;
  customerId: string | null;
  service: { id: string; title: string };
  customer: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
  startsAt: Date;
  endsAt: Date;
  notes?: string | null;
}

interface BookingListActionsProps {
  booking: Booking;
  services: { id: string; name: string }[];
  customers: { id: string; name: string }[];
}

import { apiJson } from "@/lib/api-client-shared";

export function BookingListActions({
  booking,
  services,
  customers,
}: BookingListActionsProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await apiJson<{ success: boolean }>(`/api/bookings/${booking.id}`, {
        method: "DELETE",
      });

      toast.success("Booking deleted");
      router.refresh();
      setIsDeleteOpen(false);
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[DELETE_BOOKING_ERROR]", {
        error: _errMsg,
        bookingId: booking.id,
        app: "merchant",
      });
      toast.error(_errMsg || "Failed to delete booking");
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
        title="Edit Booking"
        className="max-w-xl"
      >
        <BookingForm
          services={services}
          customers={customers}
          onSuccess={() => setIsEditOpen(false)}
          initialData={{
            id: booking.id,
            serviceId: booking.serviceId,
            customerId: booking.customerId || "",
            startsAt: booking.startsAt.toISOString(),
            endsAt: booking.endsAt.toISOString(),
            notes: booking.notes || undefined,
          }}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Booking"
        className="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-tertiary">
            Are you sure you want to delete this booking for{" "}
            <strong>{booking.service.title}</strong>? This action cannot be
            undone.
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
