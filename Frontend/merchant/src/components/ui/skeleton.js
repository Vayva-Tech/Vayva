import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "@vayva/ui";
export function Skeleton({ className, variant = "rectangular", width, height, count = 1, }) {
    const baseClasses = "animate-pulse bg-border dark:bg-text-secondary";
    const variantClasses = {
        text: "h-4 rounded",
        circular: "rounded-full",
        rectangular: "rounded-md",
    };
    if (count > 1) {
        return (_jsx("div", { className: "space-y-2", children: Array.from({ length: count }).map((_, i) => (_jsx("div", { className: cn(baseClasses, variantClasses[variant], width &&
                    `w-[${typeof width === "number" ? `${width}px` : width}]`, height &&
                    `h-[${typeof height === "number" ? `${height}px` : height}]`, className) }, i))) }));
    }
    return (_jsx("div", { className: cn(baseClasses, variantClasses[variant], width && `w-[${typeof width === "number" ? `${width}px` : width}]`, height && `h-[${typeof height === "number" ? `${height}px` : height}]`, className) }));
}
// Preset Skeletons for common use cases
export function ProductCardSkeleton() {
    return (_jsxs("div", { className: "border rounded-lg p-4 space-y-3", children: [_jsx(Skeleton, { variant: "rectangular", height: 200, className: "w-full" }), _jsx(Skeleton, { variant: "text", className: "w-3/4" }), _jsx(Skeleton, { variant: "text", className: "w-1/2" }), _jsxs("div", { className: "flex justify-between items-center pt-2", children: [_jsx(Skeleton, { variant: "text", width: 80 }), _jsx(Skeleton, { variant: "rectangular", width: 100, height: 36 })] })] }));
}
export function OrderRowSkeleton() {
    return (_jsxs("div", { className: "border-b py-4 flex items-center gap-4", children: [_jsx(Skeleton, { variant: "circular", width: 40, height: 40 }), _jsxs("div", { className: "flex-1 space-y-2", children: [_jsx(Skeleton, { variant: "text", className: "w-1/4" }), _jsx(Skeleton, { variant: "text", className: "w-1/3" })] }), _jsx(Skeleton, { variant: "rectangular", width: 80, height: 24 }), _jsx(Skeleton, { variant: "rectangular", width: 100, height: 32 })] }));
}
export function DashboardCardSkeleton() {
    return (_jsxs("div", { className: "border rounded-lg p-6 space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(Skeleton, { variant: "text", width: 120 }), _jsx(Skeleton, { variant: "circular", width: 32, height: 32 })] }), _jsx(Skeleton, { variant: "text", width: 100, height: 32 }), _jsx(Skeleton, { variant: "text", width: 80, className: "mt-2" })] }));
}
export function TableSkeleton({ rows = 5 }) {
    return (_jsx("div", { className: "space-y-2", children: Array.from({ length: rows }).map((_, i) => (_jsx(OrderRowSkeleton, {}, i))) }));
}
