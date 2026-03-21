"use client";

import { useState, useCallback } from "react";
import { Button } from "@vayva/ui";
import { toast } from "sonner";
import { UploadSimple, File, X, Check, FilePdf, FileImage } from "@phosphor-icons/react/ssr";
import { apiJson } from "@/lib/api-client-shared";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface KYCFileUploadProps {
  documentType: "identity" | "address" | "business" | "bank";
  acceptedTypes: string[];
  maxSizeMB: number;
  onUploadComplete?: (fileUrl: string) => void;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  status: "uploading" | "processing" | "verified" | "rejected" | "pending";
  progress: number;
  rejectionReason?: string;
}

const STATUS_COLORS = {
  uploading: "text-blue-600 bg-blue-50",
  processing: "text-yellow-600 bg-yellow-50",
  verified: "text-green-600 bg-green-50",
  rejected: "text-red-600 bg-red-50",
  pending: "text-gray-600 bg-gray-50",
};

const STATUS_ICONS = {
  uploading: UploadSimple,
  processing: UploadSimple,
  verified: Check,
  rejected: X,
  pending: File,
};

export function KYCFileUpload({
  documentType,
  acceptedTypes,
  maxSizeMB,
  onUploadComplete,
}: KYCFileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showRejection, setShowRejection] = useState<UploadedFile | null>(null);

  const validateFile = (file: File): string | null => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File too large. Max size: ${maxSizeMB}MB`;
    }
    
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    const acceptedExtensions = acceptedTypes.map((t) => 
      t.replace(".", "").toLowerCase()
    );
    
    if (!fileExtension || !acceptedExtensions.includes(fileExtension)) {
      return `Invalid file type. Accepted: ${acceptedTypes.join(", ")}`;
    }
    
    return null;
  };

  const uploadFile = async (file: File) => {
    const fileId = `file_${crypto.randomUUID()}`;
    
    // Add file to state
    setFiles((prev) => [
      ...prev,
      {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        status: "uploading",
        progress: 0,
      },
    ]);

    try {
      // Get signed upload URL from backend
      const { uploadUrl, fileUrl } = await apiJson<{
        uploadUrl: string;
        fileUrl: string;
      }>("/api/kyc/upload-url", {
        method: "POST",
        body: JSON.stringify({
          documentType,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        }),
      });

      // Upload to signed URL (MinIO/S3)
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileId ? { ...f, progress } : f
            )
          );
        }
      });

      await new Promise((resolve, reject) => {
        xhr.addEventListener("load", resolve);
        xhr.addEventListener("error", reject);
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });

      // Update status to processing
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? { ...f, status: "processing", progress: 100, url: fileUrl }
            : f
        )
      );

      // Notify backend of upload completion
      await apiJson("/api/kyc/verify", {
        method: "POST",
        body: JSON.stringify({
          fileId,
          documentType,
          fileUrl,
        }),
      });

      // Poll for verification status
      pollVerificationStatus(fileId);

      if (onUploadComplete) {
        onUploadComplete(fileUrl);
      }

      toast.success(`${file.name} uploaded successfully`);
    } catch (error) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? { ...f, status: "rejected", rejectionReason: "Upload failed" }
            : f
        )
      );
      toast.error(`Failed to upload ${file.name}`);
    }
  };

  const pollVerificationStatus = async (fileId: string) => {
    const checkStatus = async () => {
      try {
        const { status, rejectionReason } = await apiJson<{
          status: UploadedFile["status"];
          rejectionReason?: string;
        }>(`/api/kyc/verify-status?fileId=${fileId}`, { method: "GET" });

        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? { ...f, status, rejectionReason }
              : f
          )
        );

        if (status === "processing") {
          setTimeout(checkStatus, 5000); // Poll every 5 seconds
        } else if (status === "verified") {
          toast.success("Document verified!");
        } else if (status === "rejected" && rejectionReason) {
          toast.error(`Document rejected: ${rejectionReason}`);
        }
      } catch {
        // Continue polling on error
        setTimeout(checkStatus, 5000);
      }
    };

    checkStatus();
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const droppedFiles = Array.from(e.dataTransfer.files);
      droppedFiles.forEach((file) => {
        const error = validateFile(file);
        if (error) {
          toast.error(error);
        } else {
          uploadFile(file);
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [documentType, maxSizeMB, acceptedTypes]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    selectedFiles.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        toast.error(error);
      } else {
        uploadFile(file);
      }
    });
  };

  const removeFile = async (fileId: string) => {
    try {
      await apiJson("/api/kyc/remove-file", {
        method: "POST",
        body: JSON.stringify({ fileId }),
      });

      setFiles((prev) => prev.filter((f) => f.id !== fileId));
      toast.success("File removed");
    } catch {
      toast.error("Failed to remove file");
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return FilePdf;
    if (type.includes("image")) return FileImage;
    return File;
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? "border-green-500 bg-green-500/5"
            : "border-muted-foreground/25 hover:border-green-500/50"
        }`}
      >
        <UploadSimple className="w-10 h-10 text-gray-500 mx-auto mb-3" />
        <p className="text-sm font-medium mb-1">
          Drag and drop files here, or click to browse
        </p>
        <p className="text-xs text-gray-500 mb-4">
          Max {maxSizeMB}MB • {acceptedTypes.join(", ")}
        </p>
        <input
          type="file"
          accept={acceptedTypes.join(",")}
          onChange={handleFileSelect}
          className="hidden"
          id={`file-upload-${documentType}`}
          multiple
        />
        <label htmlFor={`file-upload-${documentType}`}>
          <Button variant="outline" size="sm" asChild>
            <span>Select Files</span>
          </Button>
        </label>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => {
            const Icon = getFileIcon(file.type);
            const StatusIcon = STATUS_ICONS[file.status];
            
            return (
              <div
                key={file.id}
                className={`flex items-center gap-3 p-3 rounded-lg ${STATUS_COLORS[file.status]}`}
              >
                <Icon className="w-8 h-8 shrink-0" />
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{file.name}</p>
                  <p className="text-xs">
                    {(file.size / 1024 / 1024).toFixed(2)} MB •
                    <span className="capitalize ml-1">{file.status}</span>
                  </p>
                  {file.status === "uploading" && (
                    <div className="mt-2">
                      <div className="h-1 bg-white/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-current transition-all"
                          style={{ width: `${file.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <StatusIcon className="w-5 h-5" />
                  
                  {file.status === "rejected" && file.rejectionReason && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowRejection(file)}
                    >
                      View Reason
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    disabled={file.status === "uploading"}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rejection Reason Dialog */}
      <ConfirmDialog
        open={!!showRejection}
        title="Document Rejected"
        description={showRejection?.rejectionReason || "This document could not be verified."}
        confirmLabel="Upload New"
        cancelLabel="Close"
        onConfirm={() => {
          setShowRejection(null);
          // Trigger file input
          document.getElementById(`file-upload-${documentType}`)?.click();
        }}
        onCancel={() => setShowRejection(null)}
      />
    </div>
  );
}
