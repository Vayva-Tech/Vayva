import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ProductCardEditorial } from "./ProductCardEditorial";
export const FeaturedCollectionEditorial = ({ title, products, storeSlug, }) => {
    return (_jsxs("section", { className: "py-20 px-6", children: [_jsx("div", { className: "text-center mb-16", children: _jsxs("h3", { className: "font-serif text-3xl text-[#2E2E2E] tracking-wide mb-4 relative inline-block", children: [title, _jsx("span", { className: "absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-[1px] bg-[#C9B7A2]" })] }) }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto", children: products.map((product) => (_jsx(ProductCardEditorial, { product: product, storeSlug: storeSlug }, product.id))) })] }));
};
