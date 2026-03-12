"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import { useIndustry } from "@/hooks/useIndustry";
import { FIELD_REGISTRY } from "@/config/fields";
type FieldType =
  | "text"
  | "number"
  | "textarea"
  | "date"
  | "select"
  | "image"
  | "file"
  | "tags"
  | "boolean";

import { validateResource } from "@/lib/validations/resource-validator";
type PrimaryObject = string;
type _FieldKey = string;
import { logger } from "@vayva/shared";
import { Button, Card, Input, Label, Textarea } from "@vayva/ui"; // Assuming Select exists or using standard
import { toast } from "sonner";
import { VariantManager } from "@/components/products/VariantManager";
import { InventoryHistory } from "@/components/products/InventoryHistory";
import { FileUpload } from "@/components/ui/FileUpload";

interface FormConfig {
  requiredFields: string[];
  optionalFields: string[];
  variantLabel?: string;
  validation?: Record<string, unknown>;
}

interface FieldDefinition {
  label: string;
  type: FieldType;
  placeholder?: string;
  helpText?: string;
  options?: { label: string; value: string }[];
}

type FieldRegistry = Record<string, FieldDefinition>;

interface ValidatedFormProps {
  primaryObject: PrimaryObject;
  mode: "create" | "edit";
  initialData?: Record<string, unknown> | null;
  resourceId?: string;
  onSuccessPath?: string;
}

import { apiJson } from "@/lib/api-client-shared";

export const DynamicResourceForm = ({
  primaryObject,
  mode,
  initialData,
  resourceId,
  onSuccessPath,
}: ValidatedFormProps) => {
  const router = useRouter();

  const { industrySlug, config: effectiveConfig } = useIndustry();
  const formConfig = (
    effectiveConfig.forms as unknown as Record<string, FormConfig>
  )[primaryObject];

  const [formData, setFormData] = useState<Record<string, unknown>>(
    initialData || {},
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  if (!formConfig) {
    return (
      <Card className="p-8 text-center">
        <h3 className="text-red-600 font-bold mb-2">Configuration Error</h3>
        <p>
          No form configuration found for <strong>{primaryObject}</strong> in{" "}
          <strong>{effectiveConfig.displayName}</strong>.
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.back()}
        >
          Go Back
        </Button>
      </Card>
    );
  }

  const { requiredFields, optionalFields, variantLabel } = formConfig;

  const handleChange = (field: string, val: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    // Clear error on type
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // 1. Validation
    const validation = validateResource(industrySlug, primaryObject, formData);
    if (!validation.valid) {
      setErrors(validation.errors);
      toast.error("Please fix the errors before saving");
      setLoading(false);
      return;
    }

    try {
      // 2. Submit to Universal API with Sanitization
      const isCreate = mode === "create";
      const endpoint = isCreate
        ? "/api/resources/create"
        : `/api/resources/${primaryObject}/${resourceId}`;

      // Basic sanitization for known numeric fields if they exist in formData
      const sanitizedData = { ...formData };
      const numericFields = [
        "price",
        "quantity",
        "stock",
        "minQty",
        "maxQty",
        "goalAmount",
        "amount",
        "rate",
        "commissionRate",
      ];

      numericFields.forEach((field) => {
        const val = sanitizedData[field];
        if (val !== undefined && val !== "") {
          sanitizedData[field] = parseFloat(String(val)) || 0;
        }
      });

      const payload = isCreate
        ? { primaryObject, data: sanitizedData }
        : sanitizedData;

      await apiJson<{ success: boolean }>(endpoint, {
        method: isCreate ? "POST" : "PATCH",
        body: JSON.stringify(payload),
      });

      toast.success(`${primaryObject} saved successfully`);

      // 3. Route Back
      if (onSuccessPath) {
        router.push(onSuccessPath);
      } else {
        const routeMap: Record<string, string> = {
          product: "products",
          service: "services",
          event: "events",
          course: "courses",
          post: "posts",
          project: "projects",
          campaign: "campaigns",
          listing: "listings",
          vehicle: "vehicles",
          stay: "stays",
          menu_item: "menu-items",
          digital_asset: "digital-assets",
        };
        const sub = routeMap[primaryObject] || "products";
        router.push(`/dashboard/${sub}`);
      }
    } catch (err: unknown) {
      const _errMsg = err instanceof Error ? err.message : String(err);
      logger.error("[DYNAMIC_RESOURCE_FORM_SAVE_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error(_errMsg || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  // --- FIELD RENDERER ---
  const renderInput = (key: string, _required: boolean) => {
    const def = (FIELD_REGISTRY as unknown as FieldRegistry)[key] || {
      label: key,
      type: "text" as const,
    };
    const err = errors[key];

    const commonProps = {
      placeholder: def.placeholder,
      value:
        typeof formData[key] === "string" || typeof formData[key] === "number"
          ? formData[key]
          : "",
      onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      ) => handleChange(key, e.target.value),
      className: err ? "border-red-500" : "",
      disabled: loading,
    };

    switch (def.type) {
      case "textarea":
        return <Textarea {...commonProps} rows={4} />;
      case "number":
        return <Input {...commonProps} type="number" step="0.01" />;
      case "date":
        return <Input {...commonProps} type="datetime-local" />; // simplified
      case "select":
        return (
          <select
            title={def.label || "Select option"}
            className={`w-full p-2 border rounded-md ${err ? "border-red-500" : "border-border"}`}
            value={
              typeof formData[key] === "string" ||
              typeof formData[key] === "number"
                ? formData[key]
                : ""
            }
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              handleChange(key, e.target.value)
            }
            disabled={loading}
          >
            <option value="">Select {def.label}</option>
            {def.options?.map((opt: { label: string; value: string }) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      case "image":
      case "file": {
        const accept =
          def.type === "image" ? "image/jpeg,image/png,image/webp" : "*/*";
        return (
          <FileUpload
            value={(formData[key] as string) || ""}
            onChange={(url: string) => handleChange(key, url)}
            label={def.label || "Upload File"}
            accept={accept}
            purpose={
              def.type === "image" ? "PRODUCT_IMAGE" : "DISPUTE_EVIDENCE"
            }
            entityId={resourceId}
            maxSizeMB={def.type === "image" ? 5 : 10}
          />
        );
      }
      case "tags":
        return <Input {...commonProps} placeholder="Comma, separated, tags" />;
      default:
        return <Input {...commonProps} />;
    }
  };

  const renderFieldBlock = (key: string, required: boolean) => {
    const def = (FIELD_REGISTRY as unknown as FieldRegistry)[key] || {
      label: key,
      type: "text" as const,
    };
    const isWide =
      def.type === "textarea" || def.type === "image" || def.type === "file";

    return (
      <div className={isWide ? "col-span-2" : "col-span-1"}>
        <Label className="mb-1 block">
          {def.label} {required && <span className="text-red-500">*</span>}
        </Label>
        {renderInput(key, required)}
        {def.helpText && (
          <p className="text-xs text-text-tertiary mt-1">{def.helpText}</p>
        )}
        {errors[key] && (
          <p className="text-xs text-red-500 mt-1">{errors[key]}</p>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold capitalize">
          {mode} {effectiveConfig.displayName}{" "}
          {primaryObject.replace(/_/g, " ")}
        </h1>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
          {/* Hardcoded Title if not in required fields - usually Title is fundamental */}
          {!requiredFields.includes("title") &&
            !requiredFields.includes("name") && (
              <div className="col-span-2">
                <Label>Name / Title *</Label>
                <Input
                  value={(formData.title as string) || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleChange("title", e.target.value)
                  }
                  placeholder="Item Name"
                  disabled={loading}
                />
              </div>
            )}

          {requiredFields.map((field: string) => (
            <React.Fragment key={field}>
              {renderFieldBlock(field, true)}
            </React.Fragment>
          ))}

          {optionalFields.length > 0 && (
            <>
              <div className="col-span-2 pt-4 pb-2 border-b border-border/40">
                <h3 className="text-sm font-bold text-text-tertiary uppercase tracking-wider">
                  Optional Details
                </h3>
              </div>
              {optionalFields.map((field: string) => (
                <React.Fragment key={field}>
                  {renderFieldBlock(field, false)}
                </React.Fragment>
              ))}
            </>
          )}

          {/* Variants Section */}
          {variantLabel && mode === "edit" && resourceId && (
            <div className="col-span-2 mt-8 pt-8 border-t border-border/40">
              <VariantManager
                productId={resourceId}
                variantLabel={variantLabel}
              />

              {/* Inventory History (Create gap) */}
              <div className="mt-8">
                <InventoryHistory productId={resourceId} />
              </div>
            </div>
          )}

          {variantLabel && mode === "create" && (
            <div className="col-span-2 mt-4 bg-white/40 p-4 rounded-xl border border-dashed border-border text-center">
              <p className="text-sm text-text-tertiary">
                You can add <strong>{variantLabel}</strong> after saving this
                item.
              </p>
            </div>
          )}

          <div className="col-span-2 pt-6 flex gap-3 justify-end border-t border-border/40 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={loading}>
              {mode === "create" ? "Create" : "Save Changes"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
