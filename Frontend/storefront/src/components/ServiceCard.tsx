import React from "react";
import NextLink from "next/link";
const Link = NextLink;
import { PublicProduct } from "@/types/storefront";
import { Clock } from "@phosphor-icons/react/ssr";

interface ServiceCardProps {
  product: PublicProduct;
  storeSlug: string;
}

export function ServiceCard({
  product,
  storeSlug,
}: ServiceCardProps): React.JSX.Element {
  const metadata = product.metadata as Record<string, string>;

  return (
    <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg text-gray-900">{product.name}</h3>
          {metadata?.durationMinutes && (
            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
              <Clock className="w-4 h-4" />
              <span>{metadata.durationMinutes} mins</span>
            </div>
          )}
        </div>
        <span className="font-bold text-lg">
          ₦{(product.price || 0).toLocaleString()}
        </span>
      </div>

      <p className="text-gray-600 text-sm mb-6 line-clamp-3">
        {product.description}
      </p>

      <Link
        href={`/products/${product.id}?store=${storeSlug}`}
        className="block w-full text-center bg-gray-900 text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors"
      >
        Book Appointment
      </Link>
    </div>
  );
}
