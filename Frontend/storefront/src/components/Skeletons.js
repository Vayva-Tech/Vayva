import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Skeleton } from "@/components/ui/skeleton";
export function ProductGridSkeleton() {
    return (_jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10", children: [1, 2, 3, 4, 5, 6, 7, 8].map((i) => (_jsxs("div", { className: "space-y-4", children: [_jsx(Skeleton, { className: "aspect-[4/5] w-full rounded-2xl" }), _jsxs("div", { className: "space-y-2", children: [_jsx(Skeleton, { className: "h-4 w-2/3" }), _jsx(Skeleton, { className: "h-4 w-1/3" })] })] }, i))) }));
}
export function PDPSkeleton() {
    return (_jsxs("div", { className: "max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-12", children: [_jsx(Skeleton, { className: "aspect-[4/5] w-full rounded-3xl" }), _jsxs("div", { className: "space-y-8 py-4", children: [_jsxs("div", { className: "space-y-4", children: [_jsx(Skeleton, { className: "h-4 w-24" }), _jsx(Skeleton, { className: "h-12 w-3/4" }), _jsx(Skeleton, { className: "h-8 w-32" })] }), _jsxs("div", { className: "space-y-3", children: [_jsx(Skeleton, { className: "h-4 w-full" }), _jsx(Skeleton, { className: "h-4 w-full" }), _jsx(Skeleton, { className: "h-4 w-2/3" })] }), _jsxs("div", { className: "space-y-4 pt-4", children: [_jsx(Skeleton, { className: "h-6 w-32" }), _jsx("div", { className: "flex gap-2", children: [1, 2, 3, 4].map((i) => (_jsx(Skeleton, { className: "h-10 w-16" }, i))) })] }), _jsx(Skeleton, { className: "h-16 w-full rounded-full mt-10" })] })] }));
}
