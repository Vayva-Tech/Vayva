import { jsx as _jsx } from "react/jsx-runtime";
import { StatusChip } from "@vayva/ui";
import { cn } from "@/lib/utils";
export const Badge = ({ children, variant = "default", className, }) => {
    // Map variants to StatusChip type
    let type = "neutral";
    if (variant === "default")
        type = "success";
    if (variant === "destructive")
        type = "error";
    if (variant === "secondary")
        type = "info";
    // StatusChip expects 'status' string as content and 'type' as style
    return (_jsx("div", { className: cn("inline-flex", className), children: _jsx(StatusChip, { status: String(children), type: type }) }));
};
