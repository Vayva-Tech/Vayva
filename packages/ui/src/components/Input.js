import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { cn } from "../utils";
export const Input = React.forwardRef(({ className, error, label, helperText, ...props }, ref) => {
    return (_jsxs("div", { className: "w-full", children: [label && (_jsx("label", { className: "block text-sm font-medium text-text-primary mb-1.5", children: label })), _jsx("input", { ref: ref, className: cn("flex h-11 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary transition-all", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:border-primary", "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-white/40", "file:border-0 file:bg-transparent file:text-sm file:font-medium", error && "border-status-danger focus-visible:ring-status-danger", className), ...props }), helperText && (_jsx("p", { className: cn("mt-1.5 text-xs", error ? "text-status-danger" : "text-text-secondary"), children: helperText }))] }));
});
Input.displayName = "Input";
