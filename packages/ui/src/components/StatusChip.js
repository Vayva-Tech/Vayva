import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from "../utils";
export function StatusChip({ status, type = "neutral", className, }) {
    const styles = {
        success: "bg-vayva-green/10 text-vayva-green border-vayva-green/20",
        warning: "bg-amber-50 text-amber-700 border-amber-100",
        error: "bg-red-50 text-red-700 border-red-100",
        neutral: "bg-studio-gray text-black border-studio-border font-bold",
        info: "bg-blue-50 text-blue-700 border-blue-100",
    };
    // Simple auto-detection if type is not explicit
    const detectType = (s) => {
        const sl = s.toLowerCase();
        if (["paid", "active", "delivered", "completed", "verified"].includes(sl))
            return "success";
        if (["pending", "processing", "draft"].includes(sl))
            return "warning";
        if (["failed", "cancelled", "rejected", "error"].includes(sl))
            return "error";
        return "neutral";
    };
    const finalType = type === "neutral" ? detectType(status) : type;
    return (_jsx("span", { className: cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", styles[finalType], className), children: status }));
}
