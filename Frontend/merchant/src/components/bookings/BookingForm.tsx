"use client";

import { useForm } from "react-hook-form";
import { logger } from "@vayva/shared";
import { Button, Input, Label, Select, Textarea } from "@vayva/ui";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { Spinner as Loader2 } from "@phosphor-icons/react/ssr";

interface BookingFormProps {
  onSuccess: () => void;
  services: { id: string; name: string }[];
  customers: { id: string; name: string }[];
  initialData?: {
    id: string;
    serviceId: string;
    customerId: string;
    startsAt: string;
    endsAt: string;
    notes?: string;
  };
}

interface BookingFormValues {
  serviceId: string;
  customerId: string;
  startsAt: string; // datetime-local
  endsAt: string; // datetime-local
  notes?: string;
}

import { apiJson } from "@/lib/api-client-shared";

export function BookingForm({
  services,
  customers,
  onSuccess,
  initialData,
}: BookingFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BookingFormValues>({
    defaultValues: initialData
      ? {
          serviceId: initialData.serviceId,
          customerId: initialData.customerId,
          startsAt: format(
            new Date(initialData.startsAt),
            "yyyy-MM-dd'T'HH:mm",
          ),
          endsAt: format(new Date(initialData.endsAt), "yyyy-MM-dd'T'HH:mm"),
          notes: initialData.notes || "",
        }
      : undefined,
  });

  const isExistingCustomer = !!watch("customerId");

  const onSubmit = async (data: BookingFormValues) => {
    setIsLoading(true);
    try {
      const url = initialData
        ? `/api/bookings/${initialData.id}`
        : "/api/bookings";
      const method = initialData ? "PUT" : "POST";

      const payload = {
        serviceId: data.serviceId,
        customerId: data.customerId,
        startsAt: new Date(data.startsAt).toISOString(),
        endsAt: new Date(data.endsAt).toISOString(),
        notes: data.notes?.trim() || "",
      };

      await apiJson<{ success: boolean }>(url, {
        method,
        body: JSON.stringify(payload),
      });

      toast.success(
        initialData ? "Booking updated" : "Booking created successfully",
      );
      router.refresh();
      onSuccess();
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[BOOKING_FORM_SUBMIT_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error(_errMsg || "Failed to save booking");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="serviceId">Service</Label>
          <Select
            id="serviceId"
            {...register("serviceId", { required: true })}
            defaultValue=""
            disabled={isLoading}
            className="flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
          >
            <option value="" disabled>
              Select service
            </option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerId">Customer</Label>
          <Select
            id="customerId"
            {...register("customerId", { required: true })}
            defaultValue=""
            disabled={isLoading}
            className="flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
          >
            <option value="" disabled>
              Select customer
            </option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="startsAt">Start Time</Label>
          <Input
            id="startsAt"
            type="datetime-local"
            {...register("startsAt", { required: true })}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endsAt">End Time</Label>
          <Input
            id="endsAt"
            type="datetime-local"
            {...register("endsAt", { required: true })}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Any special requests or details..."
          {...register("notes")}
          disabled={isLoading}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onSuccess}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="w-full"
          isLoading={isLoading}
          disabled={isLoading}
        >
          {initialData ? "Update Booking" : "Create Booking"}
        </Button>
      </div>
    </form>
  );
}
