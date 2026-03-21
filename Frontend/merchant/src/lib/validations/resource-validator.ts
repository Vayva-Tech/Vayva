import { INDUSTRY_CONFIG } from "@/config/industry";
import { z } from "zod";
import type { IndustryConfig } from "@/lib/templates/types";

interface FormConfig {
    requiredFields: string[];
    validation?: {
        minImages?: number;
        minDescriptionLength?: number;
        requiredGroups?: string[];
        requireDate?: boolean;
    };
}

export function validateResource(
  industrySlug: string,
  primaryObject: string,
  data: Record<string, unknown>,
) {
  const errors: Record<string, string> = {};
  const config = INDUSTRY_CONFIG[industrySlug as keyof typeof INDUSTRY_CONFIG] as IndustryConfig | undefined;
  
  if (!config) return { valid: false, errors: { form: "Config error" } };
  
  const formConfig = (config.forms as Record<string, FormConfig>)?.[primaryObject];
  if (!formConfig) return { valid: true, errors: {} };
  
  const { requiredFields, validation } = formConfig;
  
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
  
  if (validation) {
    const images = Array.isArray(data.images) ? data.images : [];
    if (validation.minImages && images.length < validation.minImages) {
      errors["images"] = `Min ${validation.minImages} images`;
    }
    const description =
      typeof data.description === "string" ? data.description : "";
    if (
      validation.minDescriptionLength &&
      description.length < validation.minDescriptionLength
    ) {
      errors["description"] = `Min ${validation.minDescriptionLength} chars`;
    }
    
    const groups = validation.requiredGroups || [];
    if (
      groups.includes("specs") &&
      !data.specs_map &&
      !data.sqft &&
      !data.make
    ) {
      // Loose check for any spec field based on industry
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
    
    if (validation.requireDate && !data.event_date) {
      errors["event_date"] = "Date required";
    }
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
