"use client";

import React, { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button, Card } from "@vayva/ui";
import {
  DownloadSimple as Download,
  ShareNetwork as Share2,
} from "@phosphor-icons/react/ssr";
import { toast } from "sonner";

interface QRCodeGeneratorProps {
  storeUrl: string;
  storeName: string;
}

export function QRCodeGenerator({ storeUrl, storeName }: QRCodeGeneratorProps) {
  const qrRef = useRef<SVGSVGElement>(null);

  const downloadQR = () => {
    const svg = qrRef.current;
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL("image/png");

        const downloadLink = document.createElement("a");
        downloadLink.download = `${storeName.replace(/\s+/g, "-").toLowerCase()}-qr.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
        toast.success("QR Code downloaded!");
      }
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(storeUrl);
    toast.success("Store link copied to clipboard");
  };

  // Add tracking param
  const trackingUrl = `${storeUrl}?utm_source=qr_offline&utm_medium=physical&utm_campaign=growth_loop`;

  return (
    <Card className="w-full max-w-sm mx-auto p-6">
      <div className="text-center pb-6">
        <h3 className="text-xl font-bold tracking-tight">Store QR Code</h3>
        <p className="text-sm text-gray-400 mt-1">
          Scan to shop instantly
        </p>
      </div>

      <div className="flex flex-col items-center gap-6">
        <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-100">
          <QRCodeSVG
            value={trackingUrl}
            size={200}
            level="H"
            includeMargin={true}
            ref={qrRef}
          />
        </div>

        <div className="flex gap-2 w-full">
          <Button
            onClick={downloadQR}
            className="flex-1 font-bold"
            variant="outline"
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button
            onClick={copyLink}
            className="flex-1 font-bold"
            variant="secondary"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Copy Link
          </Button>
        </div>

        <p className="text-xs text-center text-gray-400 max-w-[250px]">
          Place this on your counter, packaging, or flyers to drive offline
          traffic to your online store.
        </p>
      </div>
    </Card>
  );
}
