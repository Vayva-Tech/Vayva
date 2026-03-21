"use client";

import { useState } from "react";
import { Button } from "@vayva/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CheckSquare,
  Download,
  Printer,
  ArrowSquareOut as ExternalLink,
  CaretDown,
} from "@phosphor-icons/react/ssr";

interface BulkOrderActionsProps {
  selectedCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onExport: () => void;
  onPrint: () => void;
  onStatusChange?: (status: string) => void;
}

export function BulkOrderActions({
  selectedCount,
  onSelectAll,
  onClearSelection,
  onExport,
  onPrint,
  onStatusChange,
}: BulkOrderActionsProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport();
    } finally {
      setIsExporting(false);
    }
  };

  if (selectedCount === 0) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onSelectAll}
          className="h-9 rounded-xl"
        >
          <CheckSquare className="h-4 w-4 mr-2" />
          Select All
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-vayva-green/5 px-3 py-2 rounded-xl border border-vayva-green/20">
      <span className="text-sm font-medium text-vayva-green">
        {selectedCount} selected
      </span>
      
      <div className="h-4 w-px bg-border mx-1" />
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearSelection}
        className="h-8 text-xs rounded-lg"
      >
        Clear
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 rounded-lg"
          >
            Actions
            <CaretDown className="h-3 w-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="rounded-xl">
          <DropdownMenuItem
            onClick={handleExport}
            disabled={isExporting}
            className="rounded-lg"
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "Exporting..." : "Export CSV"}
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={onPrint} className="rounded-lg">
            <Printer className="h-4 w-4 mr-2" />
            Print Orders
          </DropdownMenuItem>
          
          {onStatusChange && (
            <>
              <div className="h-px bg-border my-1" />
              <DropdownMenuItem
                onClick={() => onStatusChange("CONFIRMED")}
                className="rounded-lg"
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                Mark as Confirmed
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onStatusChange("SHIPPED")}
                className="rounded-lg"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Mark as Shipped
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
