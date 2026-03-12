import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const RitualsSection = ({ rituals = [
    {
        step: "01. Light",
        description: "Create your sanctuary by lighting the wick.",
    },
    {
        step: "02. Breathe",
        description: "Inhale deeply for 4 seconds, hold for 4.",
    },
    { step: "03. Relax", description: "Let the natural aromas ground you." },
], }) => {
    return (_jsx("section", { className: "bg-[#FAF8F5] py-20 px-8 mb-20", children: _jsxs("div", { className: "max-w-4xl mx-auto", children: [_jsxs("div", { className: "text-center mb-12", children: [_jsx("span", { className: "text-[#C9B7A2] uppercase tracking-[0.2em] text-xs font-bold", children: "The Routine" }), _jsx("h3", { className: "font-serif text-3xl text-[#2E2E2E] mt-4", children: "How to Use" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-12 text-center", children: rituals.map((r, i) => (_jsxs("div", { className: "relative", children: [_jsx("div", { className: "w-16 h-16 rounded-full border border-[#C9B7A2] flex items-center justify-center mx-auto mb-6 text-[#C9B7A2] font-serif text-xl", children: i + 1 }), _jsx("h4", { className: "font-bold text-[#2E2E2E] mb-2 font-serif", children: r.step }), _jsx("p", { className: "text-[#8A8A8A] text-sm leading-relaxed max-w-[200px] mx-auto", children: r.description }), i < rituals.length - 1 && (_jsx("div", { className: "hidden md:block absolute top-8 left-1/2 w-full h-[1px] bg-[#EAE0D5] -z-10", style: { left: "60%" } }))] }, i))) })] }) }));
};
