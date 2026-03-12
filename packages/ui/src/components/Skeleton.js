import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from "../utils";
export function Skeleton({ className, ...props }) {
    return (_jsx("div", { className: cn("animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-800", className), ...props }));
}
