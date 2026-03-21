"use client";

import { useState, useRef } from "react";
import { Button, Input, Label, Select } from "@vayva/ui";
import { Download, Copy, Check, QrCode as QrCodeIcon, Table, Link as LinkIcon } from "@phosphor-icons/react/ssr";
import { toast } from "sonner";
import QRCode from "qrcode";

interface QRCodeGeneratorProps {
  storeId: string;
  tableNumber?: string;
  baseUrl?: string;
}

export function QRCodeGenerator({
  storeId,
  tableNumber,
  baseUrl = "https://vayva.ng",
}: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrType, setQrType] = useState<"menu" | "table" | "payment">("menu");
  const [selectedTable, setSelectedTable] = useState(tableNumber || "");
  const [customUrl, setCustomUrl] = useState("");
  const [generated, setGenerated] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");

  const generateQRCode = async () => {
    let url = "";

    switch (qrType) {
      case "menu":
        url = `${baseUrl}/store/${storeId}`;
        break;
      case "table":
        if (!selectedTable) {
          toast.error("Please select a table number");
          return;
        }
        url = `${baseUrl}/store/${storeId}?table=${selectedTable}`;
        break;
      case "payment":
        url = customUrl || `${baseUrl}/store/${storeId}/checkout`;
        break;
    }

    try {
      const dataUrl = await QRCode.toDataURL(url, {
        width: 400,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });

      setQrDataUrl(dataUrl);
      setGenerated(true);
      toast.success("QR Code generated!");
    } catch (err) {
      toast.error("Failed to generate QR code");
    }
  };

  const downloadQRCode = () => {
    if (!qrDataUrl) return;

    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `qrcode-${qrType}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyLink = () => {
    let url = "";
    switch (qrType) {
      case "menu":
        url = `${baseUrl}/store/${storeId}`;
        break;
      case "table":
        url = `${baseUrl}/store/${storeId}?table=${selectedTable}`;
        break;
      case "payment":
        url = customUrl || `${baseUrl}/store/${storeId}/checkout`;
        break;
    }
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <QrCodeIcon className="h-5 w-5 text-gray-500" />
        <h3 className="font-semibold text-gray-900">QR Code Generator</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Settings */}
        <div className="space-y-4">
          <div>
            <Label className="text-xs">QR Code Type</Label>
            <Select
              value={qrType}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                setQrType(e.target.value as typeof qrType);
                setGenerated(false);
              }}
              className="w-full h-10 mt-1 px-3 border border-gray-100 rounded-lg text-sm bg-white"
            >
              <option value="menu">📋 Digital Menu</option>
              <option value="table">🍽️ Table Ordering</option>
              <option value="payment">💳 Payment Link</option>
            </Select>
          </div>

          {qrType === "table" && (
            <div>
              <Label className="text-xs">Table Number</Label>
              <Input
                value={selectedTable}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedTable(e.target.value)}
                placeholder="e.g., 12, A5, VIP-1"
                className="mt-1"
              />
              <p className="text-xs text-gray-400 mt-1">
                Customers will be taken to the menu with this table pre-selected.
              </p>
            </div>
          )}

          {qrType === "payment" && (
            <div>
              <Label className="text-xs">Custom Payment URL (Optional)</Label>
              <Input
                value={customUrl}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomUrl(e.target.value)}
                placeholder={`${baseUrl}/store/${storeId}/checkout`}
                className="mt-1"
              />
            </div>
          )}

          <Button onClick={generateQRCode} className="w-full">
            Generate QR Code
          </Button>

          {generated && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={downloadQRCode} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download PNG
              </Button>
              <Button variant="outline" onClick={copyLink} className="flex-1">
                <LinkIcon className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="flex flex-col items-center justify-center p-6 bg-gray-100 rounded-lg border-2 border-dashed border-gray-100">
          {generated && qrDataUrl ? (
            <div className="text-center space-y-3">
              <img
                src={qrDataUrl}
                alt="Generated QR Code"
                className="mx-auto rounded-lg shadow-md"
                style={{ width: 200, height: 200 }}
              />
              <p className="text-sm text-gray-400">
                Scan with any QR code reader
              </p>
            </div>
          ) : (
            <div className="text-center text-gray-400">
              <QrCodeIcon className="h-16 w-16 mx-auto mb-2 opacity-50" />
              <p className="text-sm">QR code preview will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm">
        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-1">
          💡 QR Code Tips
        </h4>
        <ul className="list-disc list-inside text-blue-700 dark:text-blue-400 space-y-1 text-xs">
          <li>Print at least 2x2 inches for easy scanning</li>
          <li>Place on table tents, menu covers, or check presenters</li>
          <li>Test scan before mass printing</li>
          <li>Laminate for durability in restaurant environments</li>
        </ul>
      </div>
    </div>
  );
}
