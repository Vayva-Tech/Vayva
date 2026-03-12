import React from "react";
import { X, Check, Lock, Star, ShieldCheck } from "lucide-react";
import { Button } from "@vayva/ui";
import { PublicProduct } from "@vayva/templates/types/storefront";

interface FileDetailProps {
  product: PublicProduct;
  onClose: () => void;
  onPurchase: () => void;
}

export const FileDetail = ({
  product,
  onClose,
  onPurchase,
}: FileDetailProps) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#1F2937] w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl border border-gray-800 flex flex-col md:flex-row max-h-[90vh]">
        {/* Image Section */}
        <div className="bg-[#111827] flex-1 relative flex items-center justify-center p-8">
          <img
            src={product.images?.[0]}
            alt={product.name}
            className="max-w-full max-h-[300px] shadow-2xl rounded-lg border border-gray-700"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 left-4 md:hidden bg-black/50 p-2 rounded-full text-white h-auto"
            aria-label="Close modal"
          >
            <X size={20} />
          </Button>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-8 overflow-y-auto bg-[#1F2937]">
          <div className="flex justify-end mb-4 hidden md:flex">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-500 hover:text-white transition-colors h-auto"
              aria-label="Close modal"
            >
              <X size={24} />
            </Button>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-indigo-500/20 text-indigo-400 text-xs font-bold px-2 py-0.5 rounded uppercase">
                {product.category}
              </span>
              {product.licenseType === "extended" && (
                <span className="bg-purple-500/20 text-purple-400 text-xs font-bold px-2 py-0.5 rounded uppercase">
                  Extended License
                </span>
              )}
            </div>
            <h2 className="text-3xl font-extrabold text-white mb-2">
              {product.name}
            </h2>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <Star size={14} className="text-yellow-500" /> 4.9 (120)
              </span>
              <span>•</span>
              <span>Version {product.fileDetails?.version}</span>
            </div>
          </div>

          <p className="text-gray-400 leading-relaxed mb-8">
            {product.description}
            <br />
            <br />
            Unlock immediate access to this premium asset. Includes lifetime
            updates and support.
          </p>

          <div className="bg-[#111827] rounded-xl p-4 mb-8">
            <h4 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">
              File Specs
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-500">Format</span>
                <span className="text-white font-medium">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {product.fileDetails?.fileType}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-500">Size</span>
                <span className="text-white font-medium">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {product.fileDetails?.fileSize}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-500">License</span>
                <span className="text-white font-medium capitalize">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {product.licenseType || "Standard"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-400">Total Price</span>
              <span className="text-2xl font-bold text-white">
                ₦{product.price.toLocaleString()}
              </span>
            </div>
            <Button
              onClick={onPurchase}
              className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-500 transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-2 h-auto"
              aria-label={`Buy and download for ₦${product.price.toLocaleString()}`}
            >
              <Lock size={18} /> Buy & Download
            </Button>
            <div className="text-center text-xs text-gray-500 flex items-center justify-center gap-2">
              <ShieldCheck size={12} /> Secure 256-bit encrypted checkout
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
