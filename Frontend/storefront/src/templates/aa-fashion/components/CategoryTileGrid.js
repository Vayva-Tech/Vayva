import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Link from "next/link";
import Image from "next/image";
export const CategoryTileGrid = ({ categories }) => {
    return (_jsx("div", { className: "grid grid-cols-2 gap-3 px-4", children: categories.map((cat) => (_jsxs(Link, { href: `/collections/${cat.slug}`, className: "group block relative overflow-hidden rounded-xl aspect-square bg-background/40 backdrop-blur-sm", children: [_jsx(Image, { src: cat.imageUrl, alt: cat.name, fill: true, className: "object-cover group-hover:scale-105 transition-transform duration-500" }), _jsx("div", { className: "absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" }), _jsx("div", { className: "absolute bottom-3 left-3", children: _jsx("span", { className: "text-white text-sm font-bold drop-shadow-md", children: cat.name }) })] }, cat.id))) }));
};
