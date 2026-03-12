"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "../../utils";
export const LegalContentRenderer = ({ document: doc, className, showTitle = false, }) => {
    return (_jsxs("div", { className: cn("space-y-16 max-w-none prose prose-slate", className), children: [showTitle && (_jsxs("header", { className: "mb-20", children: [_jsx("h1", { className: "text-4xl md:text-5xl font-bold text-black mb-6 tracking-tight", style: { fontFamily: "Space Grotesk, sans-serif" }, children: doc.title }), _jsx("p", { className: "text-xl text-gray-500 leading-relaxed font-medium", children: doc.summary })] })), _jsx("div", { className: "flex flex-col gap-12", children: doc.sections.map((section, idx) => (_jsx(SectionRenderer, { section: section, id: `section-${idx}` }, idx))) })] }));
};
const SectionRenderer = ({ section, id, }) => {
    const isCallout = section.type === "callout-important" || section.type === "callout-nigeria";
    const isDefinitions = section.type === "definitions";
    return (_jsxs("section", { id: id, className: cn("scroll-mt-32", isCallout ? "p-8 md:p-10 rounded-2xl border" : "", section.type === "callout-important"
            ? "bg-[#F7F7F7] border-[#E6E6E6]"
            : "", section.type === "callout-nigeria"
            ? "bg-green-50/50 border-green-100"
            : ""), children: [section.heading && (_jsxs("div", { className: "flex items-center gap-3 mb-6 group", children: [_jsx("h2", { className: "text-2xl md:text-3xl font-bold text-[#0B0B0B] tracking-tight m-0", children: section.heading }), _jsx("a", { href: `#${id}`, className: "opacity-0 group-hover:opacity-100 text-gray-300 hover:text-black transition-all cursor-pointer text-xl", children: "#" })] })), _jsxs("div", { className: cn("space-y-6 text-gray-700 font-normal", isDefinitions ? "grid md:grid-cols-2 gap-8 space-y-0" : ""), children: [section.content.map((paragraph, idx) => {
                        const parsed = parseMarkdown(paragraph);
                        if (isDefinitions && paragraph.includes(":")) {
                            const [term, ...defParts] = paragraph.split(":");
                            const def = defParts.join(":");
                            return (_jsxs("div", { className: "p-5 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all", children: [_jsx("strong", { className: "block text-black text-sm uppercase tracking-wider mb-2", dangerouslySetInnerHTML: { __html: parseMarkdown(term) } }), _jsx("p", { className: "text-sm leading-relaxed text-gray-500 m-0", dangerouslySetInnerHTML: { __html: parseMarkdown(def) } })] }, idx));
                        }
                        return (_jsx("p", { className: "text-[17px] md:text-[18px] leading-[1.8] m-0", dangerouslySetInnerHTML: { __html: parsed } }, idx));
                    }), isDefinitions &&
                        section.list &&
                        section.list.map((item, idx) => {
                            if (item.includes(":")) {
                                const [term, ...defParts] = item.split(":");
                                const def = defParts.join(":");
                                return (_jsxs("div", { className: "p-5 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all", children: [_jsx("strong", { className: "block text-black text-sm uppercase tracking-wider mb-2", dangerouslySetInnerHTML: { __html: parseMarkdown(term) } }), _jsx("p", { className: "text-sm leading-relaxed text-gray-500 m-0", dangerouslySetInnerHTML: { __html: parseMarkdown(def) } })] }, `list-def-${idx}`));
                            }
                            return null;
                        })] }), section.list && !isDefinitions && (_jsx("ul", { className: "mt-8 space-y-4 list-none p-0", children: section.list.map((item, idx) => (_jsxs("li", { className: "flex gap-4 text-[17px] md:text-[18px] leading-[1.8] text-gray-700", children: [_jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-black mt-3 shrink-0" }), _jsx("span", { dangerouslySetInnerHTML: { __html: parseMarkdown(item) } })] }, idx))) }))] }));
};
const parseMarkdown = (text) => {
    let p = text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-black font-bold">$1</strong>');
    p = p.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" class="text-[#0D1D1E] font-medium underline hover:text-black">$1</a>');
    return p;
};
