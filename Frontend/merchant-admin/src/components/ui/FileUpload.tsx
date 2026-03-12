"use client";

import React, { useCallback, useState } from "react";
import { logger } from "@vayva/shared";
import { Button, Input } from "@vayva/ui";
import {
  CloudArrowUp as UploadCloud,
  X,
  File as FileIcon,
  Spinner as Loader2,
} from "@phosphor-icons/react/ssr";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  value?: string;
  onChange: (url: string) => void;
  accept?: string;
  label?: string;
  maxSizeMB?: number;
  purpose: "PRODUCT_IMAGE" | "BRANDING_LOGO" | "DISPUTE_EVIDENCE" | "BLOG_COVER" | "USER_AVATAR" | "SOCIAL_IMAGE" | "THEME_HERO" | "THEME_BACKGROUND" | "AGENT_AVATAR";
  entityId?: string;
  disabled?: boolean;
}

import { apiJson } from "@/lib/api-client-shared";

interface UploadIntentResponse {
  uploadUrl: string;
  key: string;
  headers?: Record<string, string>;
}

interface UploadFinalizeResponse {
  url: string;
}

export function FileUpload({
  value,
  onChange,
  accept = "*/*",
  label = "Upload File",
  maxSizeMB = 10,
  purpose,
  entityId,
  disabled = false,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const file = e.target.files?.[0];
    if (!file) return;

    // Size check here for immediate feedback
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File too large. Max ${maxSizeMB}MB.`);
      return;
    }

    setUploading(true);

    try {
      // 1. Create upload intent (signed URL / client token)
      const intent = await apiJson<UploadIntentResponse>(
        "/api/uploads/create",
        {
          method: "POST",
          body: JSON.stringify({
            purpose,
            filename: file.name,
            size: file.size,
          }),
        },
      );

      if (!intent.uploadUrl || !intent.key) {
        throw new Error("Failed to initialize upload");
      }

      // 2. Upload directly to storage using a presigned PUT URL
      const uploadRes = await fetch(intent.uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type":
            file.type ||
            intent.headers?.["Content-Type"] ||
            "application/octet-stream",
        },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error("Upload failed");
      }

      // 3. Finalize upload (server-side sniffing + entity attachment)
      const finalize = await apiJson<UploadFinalizeResponse>(
        "/api/uploads/finalize",
        {
          method: "POST",
          body: JSON.stringify({
            key: intent.key,
            purpose,
            entityId,
          }),
        },
      );

      onChange(finalize.url);
      toast.success("File uploaded and verified successfully");
    } catch (err: unknown) {
      const _errMsg = err instanceof Error ? err.message : String(err);
      logger.error("[FILE_UPLOAD_ERROR]", { error: _errMsg, app: "merchant" });
      toast.error(err instanceof Error ? _errMsg : "Upload failed");
    } finally {
      setUploading(false);
      // Reset input
      if (e.target) e.target.value = "";
    }
  };

  const handleRemove = () => {
    if (disabled) return;
    onChange("");
  };

  if (value) {
    return (
      <div className="relative border rounded-lg p-4 flex items-center gap-3 bg-surface-2/50">
        <div className="h-10 w-10 bg-background rounded-md border flex items-center justify-center">
          {value.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
            <img
              src={value}
              alt="Preview"
              className="h-full w-full object-cover rounded-md"
            />
          ) : (
            <FileIcon className="h-5 w-5 text-text-tertiary" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate text-primary hover:underline">
            <a href={value} target="_blank" rel="noopener noreferrer">
              {value.split("/").pop()}
            </a>
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRemove}
          disabled={disabled}
          className="h-8 w-8 text-text-tertiary hover:text-red-500"
        >
          <X size={16} />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <label className={cn(
        "border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center bg-surface-2/50 transition-colors gap-2 text-center relative",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-surface-2/50"
      )}>
        {uploading ? (
          <>
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <span className="text-sm text-text-tertiary">Uploading...</span>
          </>
        ) : (
          <>
            <UploadCloud className="h-8 w-8 text-text-tertiary" />
            <span className="text-sm font-medium text-text-secondary">
              {label}
            </span>
            <span className="text-xs text-text-tertiary">
              Max {maxSizeMB}MB
            </span>
            <Input type="file"
              className="hidden"
              accept={accept}
              onChange={handleFileChange}
              disabled={uploading || disabled}
            />
          </>
        )}
      </label>
    </div>
  );
}
