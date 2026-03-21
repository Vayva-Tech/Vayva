import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "../utils";
import { Card } from "./Card";
export function SectionCard({ title, description, headerRight, children, className, ...props }) {
    return (_jsxs(Card, { className: cn("p-5 sm:p-6", className), ...props, children: [(title || description || headerRight) && (_jsxs("div", { className: "flex items-start justify-between gap-4 mb-4", children: [_jsxs("div", { className: "min-w-0", children: [title && (_jsx("h2", { className: "text-base font-semibold text-text-primary", children: title })), description && (_jsx("p", { className: "mt-1 text-sm text-text-secondary", children: description }))] }), headerRight && _jsx("div", { className: "shrink-0", children: headerRight })] })), children] }));
}
