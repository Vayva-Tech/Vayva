import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "../utils";
export function AppShell({ children, sidebar, header, className, }) {
    return (_jsxs("div", { className: "flex min-h-screen bg-background-dark text-white", children: [_jsx("aside", { className: "fixed inset-y-0 left-0 z-50 w-64 border-r border-white/10 bg-black/40 backdrop-blur-xl", children: sidebar }), _jsxs("main", { className: cn("flex-1 pl-64", className), children: [_jsx("header", { className: "sticky top-0 z-40 flex h-16 items-center border-b border-white/10 bg-black/40 px-6 backdrop-blur-xl", children: header }), _jsx("div", { className: "p-6", children: _jsx("div", { className: "mx-auto max-w-7xl", children: children }) })] })] }));
}
