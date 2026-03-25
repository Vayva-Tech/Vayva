"use client";

import { useState, useCallback } from "react";
import { Button, Icon } from "@vayva/ui";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";

interface CSVRow {
  name?: string;
  price?: string;
  stock?: string;
  sku?: string;
  description?: string;
  category?: string;
  [key: string]: string | undefined;
}

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: Record<string, string>[]) => void;
}

export function CSVImportModal({ isOpen, onClose, onImport }: CSVImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CSVRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [step, setStep] = useState<"upload" | "preview" | "mapping">("upload");
  const [isParsing, setIsParsing] = useState(false);

  const parseFile = (file: File) => {
    setIsParsing(true);
    setErrors([]);

    Papa.parse<CSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      preview: 10, // Only preview first 10 rows
      complete: (results) => {
        setHeaders(results.meta.fields || []);
        setPreview(results.data);
        setStep("preview");
        setIsParsing(false);

        // Validate headers
        const requiredHeaders = ["name", "price"];
        const missingHeaders = requiredHeaders.filter(
          (h) => !results.meta.fields?.includes(h)
        );
        if (missingHeaders.length > 0) {
          setErrors([
            `Missing recommended headers: ${missingHeaders.join(", ")}`,
          ]);
        }
      },
      error: (error) => {
        setErrors([`Parse error: ${error.message}`]);
        setIsParsing(false);
      },
    });
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const droppedFile = acceptedFiles[0];
    if (droppedFile) {
      setFile(droppedFile);
      parseFile(droppedFile);
    }
  }, [parseFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
    },
    maxFiles: 1,
    multiple: false,
  });

  const handleImport = () => {
    if (!file) return;

    Papa.parse<CSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        // Cast to Record<string, string>[] since we know the data structure
        onImport(results.data as unknown as Record<string, string>[]);
        onClose();
        resetState();
      },
    });
  };

  const resetState = () => {
    setFile(null);
    setPreview([]);
    setHeaders([]);
    setErrors([]);
    setStep("upload");
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50  p-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Import Products from CSV
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Upload a CSV file with your product data
            </p>
          </div>
          <Button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-900 transition-colors"
          >
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === "upload" && (
            <div className="space-y-4">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? "border-green-500 bg-green-50/50"
                    : "border-gray-100 hover:border-text-tertiary"
                }`}
              >
                <input {...getInputProps()} />
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon
                    name={isDragActive ? "Upload" : "FileCsv"}
                    size={32}
                    className="text-gray-400"
                  />
                </div>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  {isDragActive
                    ? "Drop the CSV file here"
                    : "Drag & drop a CSV file here"}
                </p>
                <p className="text-sm text-gray-400 mb-4">
                  or click to select a file
                </p>
                <p className="text-xs text-gray-400">
                  Supported format: .csv (max 10MB)
                </p>
              </div>

              {isParsing && (
                <div className="flex items-center justify-center gap-2 text-gray-400">
                  <Icon name="Loader2" size={20} className="animate-spin" />
                  <span>Parsing file...</span>
                </div>
              )}

              {errors.length > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center gap-2 text-red-600 mb-2">
                    <Icon name="AlertCircle" size={18} />
                    <span className="font-medium">Warning</span>
                  </div>
                  <ul className="text-sm text-red-600 space-y-1">
                    {errors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Template download */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-sm font-medium text-gray-900 mb-2">
                  Need a template?
                </p>
                <p className="text-xs text-gray-400 mb-3">
                  Download a sample CSV file with the correct format
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadTemplate}
                  className="text-xs"
                >
                  <Icon name="Download" size={14} className="mr-2" />
                  Download Template
                </Button>
              </div>
            </div>
          )}

          {step === "preview" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Preview: {file?.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    Showing first {preview.length} rows
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={resetState}>
                  <Icon name="Upload" size={14} className="mr-2" />
                  Upload Different File
                </Button>
              </div>

              {/* Preview Table */}
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        {headers.map((header) => (
                          <th
                            key={header}
                            className="px-4 py-3 text-left font-medium text-gray-400"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {preview.map((row, i) => (
                        <tr key={i} className="hover:bg-white">
                          {headers.map((header) => (
                            <td
                              key={header}
                              className="px-4 py-3 text-gray-900"
                            >
                              {row[header] || "-"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Field mapping info */}
              <div className="bg-orange-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Icon
                    name="Info"
                    size={18}
                    className="text-orange-600 mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-medium text-amber-800">
                      Field Mapping
                    </p>
                    <p className="text-xs text-orange-700 mt-1">
                      The following fields will be imported:
                    </p>
                    <ul className="text-xs text-orange-700 mt-2 space-y-1">
                      <li>
                        <strong>name</strong> (required) - Product name
                      </li>
                      <li>
                        <strong>price</strong> (required) - Price in Naira
                      </li>
                      <li>
                        <strong>stock</strong> (optional) - Inventory quantity
                      </li>
                      <li>
                        <strong>sku</strong> (optional) - Stock keeping unit
                      </li>
                      <li>
                        <strong>description</strong> (optional) - Product
                        description
                      </li>
                      <li>
                        <strong>category</strong> (optional) - Product category
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-100">
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          {step === "preview" && (
            <Button onClick={handleImport} className="gap-2">
              <Icon name="Import" size={16} />
              Import {preview.length}+ Products
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function downloadTemplate() {
  const headers = ["name", "price", "stock", "sku", "description", "category"];
  const sampleData = [
    ["Premium Hoodie", "25000", "10", "HOOD-001", "High-quality cotton hoodie", "Apparel"],
    ["Running Shoes", "45000", "5", "SHOE-002", "Lightweight running shoes", "Footwear"],
    ["Wireless Earbuds", "35000", "20", "AUDIO-003", "Bluetooth 5.0 earbuds", "Electronics"],
  ];

  const csv = Papa.unparse({
    fields: headers,
    data: sampleData,
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "product-import-template.csv";
  a.click();
  URL.revokeObjectURL(url);
}
