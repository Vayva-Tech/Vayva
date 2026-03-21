"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { logger } from "@vayva/shared";
import { Button, Input, Textarea } from "@vayva/ui";
import { toast } from "sonner";
import { updateStoreSeo } from "@/app/(dashboard)/dashboard/settings/seo/actions";
import { FileUpload } from "@/components/ui/FileUpload";

const seoSchema = z.object({
  seoTitle: z
    .string()
    .max(60, "Title should be under 60 characters")
    .optional()
    .nullable(),
  seoDescription: z
    .string()
    .max(160, "Description should be under 160 characters")
    .optional()
    .nullable(),
  socialImage: z.string().optional().nullable().or(z.literal("")),
});

type SeoFormValues = z.infer<typeof seoSchema>;

interface SeoSettingsFormProps {
  initialData: {
    seoTitle?: string | null;
    seoDescription?: string | null;
    // seoKeywords?: string[];
    socialImage?: string | null;
  };
}

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-sm font-bold text-gray-500 mb-1.5">
    {children}
  </label>
);

export function SeoSettingsForm({ initialData }: SeoSettingsFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SeoFormValues>({
    resolver: zodResolver(seoSchema),
    defaultValues: {
      seoTitle: initialData.seoTitle || "",
      seoDescription: initialData.seoDescription || "",
      socialImage: initialData.socialImage || "",
    },
  });

  const onSubmit = async (data: SeoFormValues) => {
    try {
      const formattedData = {
        seoTitle: data.seoTitle?.trim() || null,
        seoDescription: data.seoDescription?.trim() || null,
        // seoKeywords: data.seoKeywords ? data.seoKeywords.split(",").map((k) => k.trim()).filter(Boolean) : [],
        socialImage: data.socialImage?.trim() || null,
      };

      const result = await updateStoreSeo(formattedData);

      if (result.success) {
        toast.success("SEO settings updated successfully");
      } else {
        toast.error("Failed to update settings");
      }
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[SEO_SETTINGS_UPDATE_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 max-w-2xl">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900">
          Search Engine Optimization (SEO)
        </h2>
        <p className="text-sm text-gray-400">
          Control how your store appears in Google search results and on social
          media.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <Label>Meta Title</Label>
          <div className="text-xs text-gray-400 mb-2">
            The headline clickable title for search results (Max 60 chars).
          </div>
          <Input
            {...register("seoTitle")}
            placeholder="e.g. My Premium Store | Best Fashion in Lagos"
            error={!!errors.seoTitle}
            disabled={isSubmitting}
          />
          {errors.seoTitle && (
            <p className="text-red-500 text-xs mt-1">
              {errors.seoTitle.message}
            </p>
          )}
        </div>

        <div>
          <Label>Meta Description</Label>
          <div className="text-xs text-gray-400 mb-2">
            A brief summary of your page. This often appears under the title in
            search results (Max 160 chars).
          </div>
          <Textarea
            {...register("seoDescription")}
            placeholder="Shop the latest fashion trends at unbeatable prices..."
            disabled={isSubmitting}
          />
          {errors.seoDescription && (
            <p className="text-red-500 text-xs mt-1">
              {errors.seoDescription.message}
            </p>
          )}
        </div>

        <div>
          <Label>Keywords</Label>
          <div className="text-xs text-gray-400 mb-2">
            Comma-separated keywords relevant to your store.
          </div>
          {/* <Input {...register("seoKeywords")} placeholder="fashion, lagos, boutique, affordable, delivery" disabled={isSubmitting} /> */}
        </div>

        <div>
          <Label>Social Image (OG Image)</Label>
          <div className="text-xs text-gray-400 mb-2">
            The image shown when your link is shared on WhatsApp, Twitter, or
            Facebook. Recommended size: 1200x630px.
          </div>
          <Controller
            name="socialImage"
            control={control}
            render={({ field }) => (
              <FileUpload
                value={field.value || ""}
                onChange={(url: unknown) => field.onChange(url)}
                purpose="SOCIAL_IMAGE"
                accept="image/jpeg,image/png,image/webp"
                maxSizeMB={2}
                label="Upload Social Image"
              />
            )}
          />
        </div>

        <div className="pt-4 flex justify-end">
          <Button type="submit" isLoading={isSubmitting}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
