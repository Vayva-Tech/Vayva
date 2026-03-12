import React, { useState } from "react";
import { Button } from "@vayva/ui";
import { X, Check, Lock, Download, Shield } from "lucide-react";
import { PublicProduct } from "@vayva/templates/types/storefront";

interface DownloadSuccessProps {
  product: PublicProduct;
  onClose: () => void;
}

export const DownloadSuccess = ({
  product,
  onClose,
}: DownloadSuccessProps): React.JSX.Element => {
  // Test License Key
  const licenseKey = "LICENSE-8A7B-92CD-4F1E";

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-sm p-6">
      <div className="bg-[#1F2937] border border-gray-700 rounded-2xl max-w-md w-full p-8 text-center shadow-2xl animate-in zoom-in-95 duration-300 relative">
        <Button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white"
        >
          <X size={20} />
        </Button>

        <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20">
          <Check size={40} strokeWidth={3} />
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">
          Payment Successful!
        </h2>
        <p className="text-gray-400 mb-8 text-sm">
          Your secure download link is ready.
        </p>

        {/* Secure Link Box */}
        <div className="bg-[#111827] rounded-xl p-6 mb-6 border border-gray-800">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
              <Lock size={20} className="text-gray-400" />
            </div>
            <div className="text-left overflow-hidden">
              <h4 className="text-white font-bold truncate">{product.name}</h4>
              <p className="text-xs text-gray-500">
                {product.fileDetails?.fileSize} •{" "}
                {product.fileDetails?.fileType}
              </p>
            </div>
          </div>

          <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
            <Download size={18} /> Download Now
          </Button>
          <p className="text-[10px] text-gray-600 mt-3">
            Link expires in 24 hours.
          </p>
        </div>

        {/* License Key */}
        {product.licenseType && (
          <div className="text-left bg-gray-800/50 rounded-lg p-4 mb-6 border border-gray-700/50 border-dashed">
            <label className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1 block">
              License Key
            </label>
            <div className="font-mono text-indigo-400 bg-[#111827] px-3 py-2 rounded text-sm relative">
              {licenseKey}
              <Button className="absolute right-2 top-1.5 text-xs text-gray-500 hover:text-white">
                Copy
              </Button>
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 flex items-center justify-center gap-2">
          <Shield size={12} />
          <span>Receipt sent to your email.</span>
        </div>
      </div>
    </div>
  );
};
