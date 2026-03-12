import { jsx as _jsx } from "react/jsx-runtime";
import { ProductCardTech } from "./ProductCardTech";
export const HorizontalProductCarousel = ({ products, storeSlug, }) => {
    return (_jsx("div", { className: "flex overflow-x-auto gap-4 px-4 pb-6 pt-2 scrollbar-hide snap-x snap-mandatory", children: products.map((product) => (_jsx("div", { className: "snap-start", children: _jsx(ProductCardTech, { product: product, storeSlug: storeSlug, variant: "carousel" }) }, product.id))) }));
};
