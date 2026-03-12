import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from "@vayva/ui";
import Image from "next/image";
import { FileText, FileCode, FileImage } from "lucide-react";
const FileIcon = ({ type }) => {
    if (type === "PDF" || type === "DOCX")
        return _jsx(FileText, { size: 20, className: "text-red-400" });
    if (type === "FIG" || type === "ZIP")
        return _jsx(FileCode, { size: 20, className: "text-indigo-400" });
    return _jsx(FileImage, { size: 20, className: "text-blue-400" });
};
export const ProductGridDigital = ({ products, onSelect, }) => {
    return (_jsx("section", { className: "bg-[#111827] py-20 px-6", children: _jsxs("div", { className: "max-w-6xl mx-auto", children: [_jsxs("div", { className: "flex items-center justify-between mb-10 text-white", children: [_jsx("h2", { className: "text-2xl font-bold", children: "Latest Drops" }), _jsx(Button, { className: "text-sm text-indigo-400 hover:text-indigo-300", children: "View All" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8", children: products.map((product) => (_jsxs("div", { onClick: () => onSelect(product), className: "bg-[#1F2937] rounded-2xl overflow-hidden hover:-translate-y-1 transition-transform duration-300 cursor-pointer group border border-gray-800 hover:border-indigo-500/30", children: [_jsxs("div", { className: "aspect-video bg-gray-900 relative", children: [_jsx("div", { className: "absolute inset-0", children: _jsx(Image, { src: product.images?.[0] || "/placeholder.png", alt: product.name, fill: true, className: "object-cover transition-transform duration-500 group-hover:scale-105" }) }), _jsxs("div", { className: "absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-bold text-gray-300 border border-white/10", children: [_jsx(FileIcon, { type: product.fileDetails?.fileType }), product.fileDetails?.fileType] })] }), _jsxs("div", { className: "p-6", children: [_jsx("h3", { className: "text-lg font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors", children: product.name }), _jsx("p", { className: "text-sm text-gray-400 mb-6 line-clamp-2 leading-relaxed", children: product.description }), _jsxs("div", { className: "flex items-center justify-between pt-4 border-t border-gray-800", children: [_jsxs("div", { className: "flex items-center gap-3 text-xs text-gray-500", children: [_jsx("span", { children: product.fileDetails?.fileSize || "10 MB" }), _jsx("span", { children: "\u2022" }), _jsxs("span", { children: ["v", product.fileDetails?.version || "1.0"] })] }), _jsxs("span", { className: "text-white font-bold text-lg", children: ["\u20A6", product.price.toLocaleString()] })] })] })] }, product.id))) })] }) }));
};
