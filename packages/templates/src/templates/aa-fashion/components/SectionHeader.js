import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
export const SectionHeader = ({ title, actionHref }) => {
    return (_jsxs("div", { className: "flex items-center justify-between px-4 py-4 mt-4", children: [_jsx("h3", { className: "text-lg font-bold text-[#111111] capitalize", children: title }), actionHref && (_jsxs(Link, { href: actionHref, className: "flex items-center text-xs font-medium text-gray-500 hover:text-black transition-colors", children: ["View All ", _jsx(ChevronRight, { size: 14 })] }))] }));
};
