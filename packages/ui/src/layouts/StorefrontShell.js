import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "../utils";
export function StorefrontShell({ children, header, footer, className, }) {
    return (_jsxs("div", { className: "min-h-screen bg-black text-white selection:bg-primary selection:text-black", children: [_jsx("header", { className: "sticky top-0 z-50 w-full border-b border-white/10 bg-black/60 backdrop-blur-xl", children: _jsx("div", { className: "container mx-auto px-4 h-16 flex items-center", children: header }) }), _jsx("main", { className: cn("flex-1", className), children: children }), _jsx("footer", { className: "border-t border-white/10 bg-black/40", children: _jsx("div", { className: "container mx-auto py-10 px-4 text-gray-400", children: footer }) })] }));
}
