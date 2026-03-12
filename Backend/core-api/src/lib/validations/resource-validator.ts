import { INDUSTRY_CONFIG } from "@/config/industry";
import type { IndustryConfig } from "@/lib/templates/types";

export function validateResource(
  industrySlug: string,
  primaryObject: string,
  data: Record<string, unknown>,
) {
  const errors: Record<string, string> = {};
  const config = (INDUSTRY_CONFIG as Record<string, IndustryConfig>)[
    industrySlug
  ];
  if (!config) return { valid: false, errors: { form: "Config error" } };
  const formConfig = (config.forms as Record<string, unknown>)?.[
    primaryObject
  ] as
    | { requiredFields?: string[]; validation?: Record<string, unknown> }
    | undefined;
  if (!formConfig) return { valid: true, errors: {} }; // Flexible fallback
  const { requiredFields = [], validation } = formConfig;
  // 1. Check Required Fields
  requiredFields.forEach((field: string) => {
    const val = data[field];
    if (
      val === undefined ||
      val === null ||
      val === "" ||
      (Array.isArray(val) && val.length === 0)
    ) {
      errors[field] = "Required";
    }
  });
  interface ValidationRules {
    minImages?: number;
    minDescriptionLength?: number;
    requiredGroups?: string[];
    requireDate?: boolean;
  }

  // 2. Groups & Rules
  if (validation) {
    const rules = validation as ValidationRules;
    const images = Array.isArray(data.images) ? data.images : [];
    if (rules.minImages && images.length < rules.minImages) {
      errors["images"] = `Min ${rules.minImages} images`;
    }
    const description =
      typeof data.description === "string" ? data.description : "";
    if (
      rules.minDescriptionLength &&
      description.length < rules.minDescriptionLength
    ) {
      errors["description"] = `Min ${rules.minDescriptionLength} chars`;
    }
    // Group Logic
    const groups = rules.requiredGroups || [];
    if (
      groups.includes("specs") &&
      !data.specs_map &&
      !data.sqft &&
      !data.make
    ) {
      // Loose check for any spec field based on industry?
      // Keeping it simple: check generic spec field or specific ones if known
      // For now, if 'specs' required, we assume 'specs_map' or specialized fields
    }
    if (groups.includes("location") && !data.location && !data.venue) {
      errors["location"] = "Location required";
    }
    if (groups.includes("schedule") && !data.event_date && !data.dates) {
      errors["event_date"] = "Date/Schedule required";
    }
    if (groups.includes("files") && !data.file_upload) {
      errors["file_upload"] = "File required";
    }
    // Legacy flag support (mapped to groups logic implicitly or explicit check)
    if (rules.requireDate && !data.event_date) {
      errors["event_date"] = "Date required";
    }
  }
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
