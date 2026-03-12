"use client";

import { useState } from "react";
import { Button, Icon } from "@vayva/ui";
import { toast } from "sonner";
import { DownloadSimple, FileCsv, Spinner } from "@phosphor-icons/react/ssr";
import { apiJson } from "@/lib/api-client-shared";

interface DataExportButtonProps {
  type: "products" | "orders";
  filters?: Record<string, string>;
  disabled?: boolean;
}

interface ExportResponse {
  success: boolean;
  csv: string;
  filename: string;
  count: number;
}

export function DataExportButton({
  type,
  filters,
  disabled = false,
}: DataExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) queryParams.set(key, value);
        });
      }

      const result = await apiJson<ExportResponse>(
        `/api/export/${type}?${queryParams.toString()}`,
        { method: "GET" }
      );

      if (result.success && result.csv) {
        // Create and download file
        const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = result.filename || `${type}-export.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success(`Exported ${result.count} ${type}`);
      } else {
        toast.error("Export failed");
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Export failed";
      toast.error(msg);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={disabled || isExporting}
      isLoading={isExporting}
    >
      <FileCsv className="w-4 h-4 mr-2" />
      Export CSV
    </Button>
  );
}

interface BulkExportToolbarProps {
  selectedIds: string[];
  type: "products" | "orders";
}

export function BulkExportToolbar({ selectedIds, type }: BulkExportToolbarProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleBulkExport = async () => {
    if (selectedIds.length === 0) return;
    setIsExporting(true);
    try {
      const result = await apiJson<ExportResponse>(`/api/export/${type}/bulk`, {
        method: "POST",
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (result.success && result.csv) {
        const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = result.filename || `${type}-export.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success(`Exported ${result.count} ${type}`);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Export failed";
      toast.error(msg);
    } finally {
      setIsExporting(false);
    }
  };

  if (selectedIds.length === 0) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleBulkExport}
      isLoading={isExporting}
    >
      <DownloadSimple className="w-4 h-4 mr-2" />
      Export Selected ({selectedIds.length})
    </Button>
  );
}
