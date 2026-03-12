import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AlertCircle as AlertCircleIcon, RefreshCw as RefreshCwIcon, } from "lucide-react";
import { cn } from "../utils";
import { Button } from "../components/Button";
// Fix for LucideIcon type mismatch in this specific environment setup
const AlertCircle = AlertCircleIcon;
const RefreshCw = RefreshCwIcon;
export const ErrorState = ({ title = "Something went wrong", message = "An unexpected error occurred. Please try again.", onRetry, className, }) => {
    return (_jsxs("div", { className: cn("flex flex-col items-center justify-center p-8 text-center bg-red-50 rounded-xl border border-red-100", className), children: [_jsx("div", { className: "w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4", children: _jsx(AlertCircle, { size: 24 }) }), _jsx("h3", { className: "text-lg font-bold text-red-900 mb-2", children: title }), _jsx("p", { className: "text-red-700/80 mb-6 max-w-sm", children: message }), onRetry && (_jsxs(Button, { variant: "outline", onClick: onRetry, className: "border-red-200 text-red-700 hover:bg-red-100 hover:text-red-800", children: [_jsx(RefreshCw, { size: 16, className: "mr-2" }), "Try Again"] }))] }));
};
