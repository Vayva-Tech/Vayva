import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "@vayva/ui";
import { ChevronDown, ChevronUp } from "lucide-react";
export const FAQAccordion = ({ faqs }) => {
    const [openIdx, setOpenIdx] = useState(0);
    return (_jsx("section", { id: "faq", className: "py-20 bg-background/70 backdrop-blur-xl", children: _jsxs("div", { className: "max-w-3xl mx-auto px-6", children: [_jsx("h2", { className: "text-3xl font-black text-center text-gray-900 mb-12", children: "Frequently Asked Questions" }), _jsx("div", { className: "space-y-4", children: faqs.map((faq, idx) => (_jsxs("div", { className: "border border-gray-200 rounded-xl overflow-hidden", children: [_jsxs(Button, { onClick: () => setOpenIdx(openIdx === idx ? null : idx), className: "w-full flex items-center justify-between p-5 text-left bg-background/70 backdrop-blur-xl hover:bg-white/60 transition-colors", children: [_jsx("span", { className: "font-bold text-gray-900", children: faq.question }), openIdx === idx ? (_jsx(ChevronUp, { size: 20, className: "text-gray-400" })) : (_jsx(ChevronDown, { size: 20, className: "text-gray-400" }))] }), openIdx === idx && (_jsx("div", { className: "p-5 pt-0 bg-background/70 backdrop-blur-xl text-gray-600 leading-relaxed border-t border-gray-50", children: faq.answer }))] }, idx))) })] }) }));
};
