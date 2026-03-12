"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { cn } from "../../utils";
import { Icon } from "../Icon";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../Button";
export const LegalPageLayout = ({ children, title, summary, lastUpdated, backLink, toc = [], }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState("");
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        }, { rootMargin: "-10% 0% -80% 0%" });
        toc.forEach((item) => {
            const el = document.getElementById(item.id);
            if (el)
                observer.observe(el);
        });
        return () => observer.disconnect();
    }, [toc]);
    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = 100; // Adjustment for sticky header
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = element.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;
            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth",
            });
            setIsMobileMenuOpen(false);
        }
    };
    return (_jsxs("div", { className: "bg-white min-h-screen", children: [_jsx("div", { className: "max-w-[1280px] mx-auto px-6 pt-12 print:hidden", children: backLink && (_jsxs(Link, { href: backLink.href, className: "inline-flex items-center gap-2 text-sm text-gray-400 hover:text-black transition-colors group mb-8", children: [_jsx(Icon, { name: "ArrowLeft", size: 16, className: "group-hover:-translate-x-1 transition-transform" }), backLink.label] })) }), _jsxs("div", { className: "max-w-[1280px] mx-auto px-6 pb-24 lg:flex lg:gap-20 items-start", children: [_jsxs("aside", { className: "hidden lg:block w-[280px] sticky top-24 shrink-0 overflow-y-auto max-h-[calc(100vh-120px)] print:hidden", children: [_jsxs("div", { className: "border-l border-gray-100 pl-6 space-y-2", children: [_jsx("h4", { className: "text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-6", children: "ON THIS PAGE" }), toc.map((item) => (_jsx(Button, { onClick: () => scrollToSection(item.id), variant: "ghost", className: cn("block w-full text-left text-sm py-2 transition-all duration-300 justify-start h-auto font-normal", activeSection === item.id
                                            ? "text-black font-bold pl-1 translate-x-1"
                                            : "text-gray-400 hover:text-gray-600 pl-0"), children: item.label }, item.id)))] }), _jsxs("div", { className: "mt-12 pt-12 border-t border-gray-100 flex flex-col gap-4", children: [_jsxs(Button, { onClick: () => window.print(), variant: "ghost", className: "flex items-center gap-3 text-sm text-gray-500 hover:text-black justify-start h-auto font-normal", children: [_jsx(Icon, { name: "Printer", size: 16 }), "Print this page"] }), _jsxs(Button, { onClick: () => window.print(), variant: "ghost", className: "flex items-center gap-3 text-sm text-gray-500 hover:text-black justify-start h-auto font-normal group relative", children: [_jsx(Icon, { name: "Download", size: 16 }), _jsx("span", { children: "Download PDF" })] })] })] }), _jsxs("main", { className: "flex-1 max-w-[850px]", children: [_jsxs("header", { className: "mb-20", children: [lastUpdated && (_jsxs("div", { className: "inline-block px-3 py-1 bg-gray-50 rounded-full text-[10px] font-bold text-gray-400 mb-6 uppercase tracking-wider", children: ["Last Updated: ", lastUpdated] })), _jsx("h1", { className: "text-5xl md:text-6xl font-bold text-[#0B0B0B] mb-8 tracking-tight font-space-grotesk", children: title }), summary && (_jsx("p", { className: "text-xl text-gray-500 leading-relaxed font-medium", children: summary }))] }), _jsxs("div", { className: "lg:hidden mb-12 print:hidden", children: [_jsxs(Button, { onClick: () => setIsMobileMenuOpen(!isMobileMenuOpen), variant: "ghost", className: "w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 h-auto font-bold", children: [_jsx("span", { className: "text-sm font-bold", children: "Table of Contents" }), _jsx(Icon, { name: isMobileMenuOpen ? "ChevronUp" : "ChevronDown", size: 18 })] }), _jsx(AnimatePresence, { children: isMobileMenuOpen && (_jsx(motion.div, { initial: { height: 0, opacity: 0 }, animate: { height: "auto", opacity: 1 }, exit: { height: 0, opacity: 0 }, className: "overflow-hidden bg-gray-50 border-x border-b border-gray-100 rounded-b-xl", children: _jsx("div", { className: "p-4 flex flex-col gap-3", children: toc.map((item) => (_jsx(Button, { onClick: () => scrollToSection(item.id), variant: "ghost", className: cn("text-left text-sm py-1 transition-colors justify-start h-auto font-normal", activeSection === item.id
                                                        ? "text-black font-bold"
                                                        : "text-gray-500"), children: item.label }, item.id))) }) })) })] }), _jsx("div", { className: "legal-content-body print:text-black print:p-0", children: children }), _jsx("footer", { className: "mt-32 pt-12 border-t border-gray-100 print:hidden text-center md:text-left", children: _jsxs("p", { className: "text-sm text-gray-400", children: ["Looking for something else? Visit our", _jsx(Link, { href: "/legal", className: "text-black font-bold underline", children: "Legal Hub" }), "."] }) })] })] }), _jsx("style", { dangerouslySetInnerHTML: {
                    __html: `
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          body {
            background: white !important;
            font-size: 12pt !important;
          }
          main {
            max-width: 100% !important;
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
            max-width: none !important;
          }
          .legal-content-body h2 {
            page-break-after: avoid;
          }
          .legal-content-body p,
          .legal-content-body li {
            page-break-inside: avoid;
          }
        }
      `
                } })] }));
};
