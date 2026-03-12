import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
export const SectionHeaderRow = ({ title, actionHref, description, }) => {
    return (_jsxs("div", { className: "flex items-end justify-between px-4 py-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-xl font-bold text-[#0B0F19] tracking-tight", children: title }), description && (_jsx("p", { className: "text-xs text-gray-500 mt-1", children: description }))] }), actionHref && (_jsxs(Link, { href: actionHref, className: "flex items-center text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors", children: ["See All ", _jsx(ChevronRight, { size: 14 })] }))] }));
};
