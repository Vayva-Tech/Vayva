import React, { useState } from "react";
import { PublicStore, PublicProduct } from "@/types/storefront";
import { DigitalHeader } from "./components/DigitalHeader";
import { DigitalHero } from "./components/DigitalHero";
import { ProductGridDigital } from "./components/ProductGridDigital";
import { FileDetail } from "./components/FileDetail";
import { DownloadSuccess } from "./components/DownloadSuccess";

interface FileVaultLayoutProps {
  store: PublicStore;
  products: PublicProduct[];
}

export const FileVaultLayout = ({
  store,
  products,
}: FileVaultLayoutProps): React.JSX.Element => {
  // const { addToCart } = useStore();
  const [selectedProduct, setSelectedProduct] = useState<PublicProduct | null>(
    null,
  );
  const [purchaseSuccess, setPurchaseSuccess] = useState<PublicProduct | null>(
    null,
  );

  // Test "Instant Buy" - in real app this goes to checkout
  const handlePurchase = () => {
    if (!selectedProduct) return;
    // Simulate processing
    setTimeout(() => {
      setPurchaseSuccess(selectedProduct);
      setSelectedProduct(null);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] font-sans text-gray-100">
      <DigitalHeader storeName={store.name} />

      <main>
        <DigitalHero />
        <ProductGridDigital products={products} onSelect={setSelectedProduct} />
      </main>

      {/* Footer */}
      <footer className="bg-[#0B0F19] border-t border-gray-900 py-12 text-center text-gray-600 text-sm">
        <p>
          &copy; {new Date().getFullYear()} {store.name}. All rights reserved.
        </p>
        <div className="flex justify-center gap-4 mt-4">
          <span className="hover:text-gray-400 cursor-pointer">Terms</span>
          <span className="hover:text-gray-400 cursor-pointer">Privacy</span>
          <span className="hover:text-gray-400 cursor-pointer">Licenses</span>
        </div>
      </footer>

      {/* Modals */}
      {selectedProduct && (
        <FileDetail
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onPurchase={handlePurchase}
        />
      )}

      {purchaseSuccess && (
        <DownloadSuccess
          product={purchaseSuccess}
          onClose={() => setPurchaseSuccess(null)}
        />
      )}
    </div>
  );
};
