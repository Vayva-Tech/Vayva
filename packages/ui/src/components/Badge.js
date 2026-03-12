import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from "../utils";
const variantStyles = {
    default: "bg-studio-gray text-black border-studio-border font-bold",
    success: "bg-vayva-green/10 text-vayva-green border-vayva-green/20",
    warning: "bg-amber-50 text-amber-700 border-amber-100",
    error: "bg-red-50 text-red-700 border-red-100",
    info: "bg-blue-50 text-blue-700 border-blue-100",
};
export function Badge({ variant = "default", children, className, ...props }) {
    return (_jsx("span", { className: cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", variantStyles[variant], className), ...props, children: children }));
}
