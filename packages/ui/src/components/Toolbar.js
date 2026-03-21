import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "../utils";
export function Toolbar({ left, right, className, }) {
    return (_jsxs("div", { className: cn("flex flex-col gap-3 md:flex-row md:items-center md:justify-between", className), children: [_jsx("div", { className: "flex items-center gap-2 flex-wrap", children: left }), _jsx("div", { className: "flex items-center gap-2 flex-wrap justify-start md:justify-end", children: right })] }));
}
