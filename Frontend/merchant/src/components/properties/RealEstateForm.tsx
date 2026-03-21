"use client";

import { useForm } from "react-hook-form";
import { Button, Input, Label, Textarea, Select } from "@vayva/ui";
import { logger } from "@vayva/shared";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Spinner as Loader2 } from "@phosphor-icons/react/ssr";

interface RealEstateFormProps {
  onSuccess: () => void;
}

interface RealEstateData {
  id?: string;
  product?: {
    name?: string;
    description?: string;
    price?: number;
  };
  title?: string;
  description?: string;
  price?: number;
  type?: string;
  maxGuests?: number;
  bedCount?: number;
  bathrooms?: number;
  totalUnits?: number;
  amenities?: string[] | string;
}

interface RealEstateFormValues {
  title: string;
  description: string;
  price: number;
  type: string;
  maxGuests: number;
  bedCount: number;
  bathrooms: number;
  totalUnits: number;
  amenities: string; // Comma separated for MVP
}

import { apiJson } from "@/lib/api-client-shared";

export function RealEstateForm({
  onSuccess,
  initialData,
}: RealEstateFormProps & { initialData?: RealEstateData }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RealEstateFormValues>({
    defaultValues: initialData
      ? {
          title: initialData.product?.name || initialData.title,
          description:
            initialData.product?.description || initialData.description,
          price: Number(initialData.product?.price || initialData.price),
          type: initialData.type,
          maxGuests: initialData.maxGuests,
          bedCount: initialData.bedCount,
          bathrooms: initialData.bathrooms,
          totalUnits: initialData.totalUnits,
          amenities: Array.isArray(initialData.amenities)
            ? initialData.amenities.join(", ")
            : initialData.amenities || "",
        }
      : {
          type: "ROOM",
          maxGuests: 2,
          bedCount: 1,
          bathrooms: 1,
          totalUnits: 1,
        },
  });

  const onSubmit = async (data: RealEstateFormValues) => {
    setIsSubmitting(true);
    try {
      const url = initialData
        ? `/api/properties/${initialData.id}`
        : "/api/properties";
      const method = initialData ? "PUT" : "POST";

      const payload = {
        ...data,
        title: data.title?.trim() || "",
        description: data.description?.trim() || "",
        price: parseFloat(data.price?.toString()) || 0,
        maxGuests: parseInt(data.maxGuests?.toString()) || 1,
        bedCount: parseInt(data.bedCount?.toString()) || 1,
        bathrooms: parseInt(data.bathrooms?.toString()) || 1,
        totalUnits: parseInt(data.totalUnits?.toString()) || 1,
        // Parse amenities string to array
        amenities: data.amenities
          ? data.amenities
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
      };

      await apiJson<{ success: boolean }>(url, {
        method,
        body: JSON.stringify(payload),
      });

      toast.success(
        initialData ? "Property updated" : "Property listed successfully",
      );
      router.refresh();
      onSuccess();
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[REAL_ESTATE_FORM_SAVE_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error("Failed to save property");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Same fields... */}
      <div className="space-y-2">
        <Label htmlFor="title">Property Title</Label>
        <Input
          id="title"
          placeholder="e.g. Ocean View Villa"
          {...register("title", { required: true })}
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Markdown supported)</Label>
        <Textarea
          id="description"
          placeholder="Describe your property..."
          {...register("description")}
          disabled={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price per Night (₦)</Label>
          <Input
            id="price"
            type="number"
            {...register("price", { required: true, min: 0 })}
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Property Type</Label>
          <Select {...register("type")} disabled={isSubmitting}>
            <option value="ROOM">Room</option>
            <option value="SUITE">Suite</option>
            <option value="VILLA">Villa</option>
            <option value="APARTMENT">Apartment</option>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="maxGuests">Guests</Label>
          <Input
            id="maxGuests"
            type="number"
            {...register("maxGuests", { min: 1 })}
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bedCount">Beds</Label>
          <Input
            id="bedCount"
            type="number"
            {...register("bedCount", { min: 1 })}
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bathrooms">Baths</Label>
          <Input
            id="bathrooms"
            type="number"
            {...register("bathrooms", { min: 1 })}
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="totalUnits">Quantity</Label>
          <Input
            id="totalUnits"
            type="number"
            {...register("totalUnits", { min: 1 })}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amenities">Amenities (Comma separated)</Label>
        <Input
          id="amenities"
          placeholder="WiFi, Pool, Gym, Parking"
          {...register("amenities")}
          disabled={isSubmitting}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? "Update Property" : "List Property"}
        </Button>
      </div>
    </form>
  );
}
