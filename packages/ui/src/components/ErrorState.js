import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AlertCircle } from "lucide-react";
import { Button } from "./Button";
export function ErrorState({ title = "Something went wrong", message, onRetry, }) {
    return (_jsxs("div", { className: "p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3", children: [_jsx(AlertCircle, { className: "text-red-500 shrink-0 mt-0.5", size: 20 }), _jsxs("div", { className: "flex-1", children: [_jsx("h4", { className: "font-bold text-red-900 text-sm mb-1", children: title }), _jsx("p", { className: "text-sm text-red-700", children: message }), onRetry && (_jsx(Button, { onClick: onRetry, variant: "link", size: "sm", className: "mt-3 text-xs font-bold text-red-600 hover:text-red-800 underline p-0 h-auto", children: "Try Again" }))] })] }));
}
