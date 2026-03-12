import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { DigitalHeader } from "./components/DigitalHeader";
import { DigitalHero } from "./components/DigitalHero";
import { ProductGridDigital } from "./components/ProductGridDigital";
import { FileDetail } from "./components/FileDetail";
import { DownloadSuccess } from "./components/DownloadSuccess";
import { useStore } from "@/context/StoreContext";
export const FileVaultLayout = ({ store, products }) => {
    const { addToCart } = useStore();
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [purchaseSuccess, setPurchaseSuccess] = useState(null);
    // Test "Instant Buy" - in real app this goes to checkout
    const handlePurchase = () => {
        if (!selectedProduct)
            return;
        // Simulate processing
        setTimeout(() => {
            setPurchaseSuccess(selectedProduct);
            setSelectedProduct(null);
        }, 1000);
    };
    return (_jsxs("div", { className: "min-h-screen bg-[#0B0F19] font-sans text-gray-100", children: [_jsx(DigitalHeader, { storeName: store.name }), _jsxs("main", { children: [_jsx(DigitalHero, {}), _jsx(ProductGridDigital, { products: products, onSelect: setSelectedProduct })] }), _jsxs("footer", { className: "bg-[#0B0F19] border-t border-gray-900 py-12 text-center text-gray-600 text-sm", children: [_jsxs("p", { children: ["\u00A9 ", new Date().getFullYear(), " ", store.name, ". All rights reserved."] }), _jsxs("div", { className: "flex justify-center gap-4 mt-4", children: [_jsx("span", { className: "hover:text-gray-400 cursor-pointer", children: "Terms" }), _jsx("span", { className: "hover:text-gray-400 cursor-pointer", children: "Privacy" }), _jsx("span", { className: "hover:text-gray-400 cursor-pointer", children: "Licenses" })] })] }), selectedProduct && (_jsx(FileDetail, { product: selectedProduct, onClose: () => setSelectedProduct(null), onPurchase: handlePurchase })), purchaseSuccess && (_jsx(DownloadSuccess, { product: purchaseSuccess, onClose: () => setPurchaseSuccess(null) }))] }));
};
