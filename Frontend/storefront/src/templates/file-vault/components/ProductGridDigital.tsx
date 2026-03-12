import React from "react";
import { Button } from "@vayva/ui";
import Image from "next/image";
import { FileText, FileCode, FileImage } from "@phosphor-icons/react/ssr";
import { PublicProduct } from "@/types/storefront";

interface ProductGridDigitalProps {
  products: PublicProduct[];
  onSelect: (product: PublicProduct) => void;
}

const FileIcon = ({ type }: { type?: string }): React.JSX.Element => {
  if (type === "PDF" || type === "DOCX")
    return <FileText size={20} className="text-red-400" />;
  if (type === "FIG" || type === "ZIP")
    return <FileCode size={20} className="text-indigo-400" />;
  return <FileImage size={20} className="text-blue-400" />;
};

export const ProductGridDigital = ({
  products,
  onSelect,
}: ProductGridDigitalProps) => {
  return (
    <section className="bg-[#111827] py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-10 text-white">
          <h2 className="text-2xl font-bold">Latest Drops</h2>
          <Button className="text-sm text-indigo-400 hover:text-indigo-300">
            View All
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product: any) => (
            <div
              key={product.id}
              onClick={() => onSelect(product)}
              className="bg-[#1F2937] rounded-2xl overflow-hidden hover:-translate-y-1 transition-transform duration-300 cursor-pointer group border border-gray-800 hover:border-indigo-500/30"
            >
              {/* Thumbnail */}
              <div className="aspect-video bg-gray-900 relative">
                <div className="absolute inset-0">
                  <Image
                    src={product.images?.[0] || "/placeholder.png"}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-bold text-gray-300 border border-white/10">
                  <FileIcon type={product.fileDetails?.fileType} />
                  {product.fileDetails?.fileType}
                </div>
              </div>

              {/* Info */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-400 mb-6 line-clamp-2 leading-relaxed">
                  {product.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{product.fileDetails?.fileSize || "10 MB"}</span>
                    <span>•</span>
                    <span>v{product.fileDetails?.version || "1.0"}</span>
                  </div>
                  <span className="text-white font-bold text-lg">
                    ₦{product.price.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
