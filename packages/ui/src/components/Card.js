import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from "../utils";
export function Card({ children, className, ...props }) {
    return (_jsx("div", { className: cn("rounded-lg border border-gray-200 bg-white shadow-sm", className), ...props, children: children }));
}
