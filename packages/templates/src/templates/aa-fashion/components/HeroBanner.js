import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Image from "next/image";
export const HeroBanner = ({ imageUrl = "https://placehold.co/800x600/111111/FFFFFF?text=New+Collection", title = "NEW COLLECTION", subtitle = "Shop the latest arrivals", }) => {
    return (_jsxs("div", { className: "relative w-full aspect-[4/3] md:aspect-[21/9] bg-background/50 backdrop-blur-sm overflow-hidden", children: [_jsx(Image, { src: imageUrl, alt: "Hero", fill: true, className: "object-cover", priority: true }), _jsxs("div", { className: "absolute inset-0 bg-black/20 flex flex-col items-center justify-center text-center text-white px-4", children: [_jsx("h2", { className: "text-3xl md:text-5xl font-bold tracking-widest mb-2 drop-shadow-md", children: title }), _jsx("p", { className: "text-sm md:text-lg font-medium opacity-90 tracking-wide drop-shadow-md", children: subtitle })] })] }));
};
