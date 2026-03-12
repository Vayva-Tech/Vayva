import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import { cn } from "../utils";
export const Select = React.forwardRef(({ className, children, error, ...props }, ref) => {
    return (_jsx("div", { className: "relative", children: _jsx("select", { className: cn("flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", error && "border-red-500 focus:ring-red-500", className), ref: ref, ...props, children: children }) }));
});
Select.displayName = "Select";
