import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ProductCard } from "./ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
export const ProductGrid = ({ products, storeSlug, loading }) => {
    if (loading) {
        return (_jsx("div", { className: "grid grid-cols-2 gap-x-4 gap-y-8 px-4", children: [...Array(4)].map((_, i) => (_jsxs("div", { className: "space-y-3", children: [_jsx(Skeleton, { className: "h-40 w-full rounded-xl" }), _jsx(Skeleton, { className: "h-4 w-2/3 rounded-lg" }), _jsx(Skeleton, { className: "h-4 w-1/3 rounded-lg" })] }, i))) }));
    }
    return (_jsx("div", { className: "grid grid-cols-2 gap-x-4 gap-y-8 px-4", children: products.map((product) => (_jsx(ProductCard, { product: product, storeSlug: storeSlug }, product.id))) }));
};
