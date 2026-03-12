import { UploadPurpose } from "@vayva/db";

export interface UploadConfig {
  maxSize: number; // in bytes
  allowedMimeTypes: string[];
  pathPrefix: string; // e.g. "branding", "products", "disputes"
}

export const UPLOAD_CONFIGS: Record<UploadPurpose, UploadConfig> = {
  BRANDING_LOGO: {
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    pathPrefix: "branding",
  },
  PRODUCT_IMAGE: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    pathPrefix: "products",
  },
  DISPUTE_EVIDENCE: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ],
    pathPrefix: "disputes",
  },
  KYC_DOCUMENT: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ],
    pathPrefix: "kyc",
  },
};
