import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { PackageOpen } from "lucide-react";
export function EmptyState({ title, description, action, icon: Icon = PackageOpen, variant = "default" }) {
    const isCompact = variant === "compact";
    return (_jsxs("div", { className: `flex flex-col items-center justify-center ${isCompact ? "p-4" : "p-12"} text-center border border-dashed border-gray-200 rounded-2xl bg-gradient-to-b from-white to-gray-50/50 shadow-sm transition-all hover:border-gray-300`, children: [_jsx("div", { className: `${isCompact ? "w-10 h-10" : "w-16 h-16"} bg-white rounded-2xl flex items-center justify-center border border-gray-100 mb-6 shadow-md transition-transform hover:scale-110`, children: _jsx(Icon, { className: "text-gray-400", size: isCompact ? 20 : 32 }) }), _jsx("h3", { className: `${isCompact ? "text-base" : "text-xl"} font-bold text-gray-900 mb-2`, children: title }), _jsx("p", { className: `${isCompact ? "text-xs" : "text-sm"} text-gray-500 max-w-sm mb-8 leading-relaxed`, children: description }), action && (_jsx("div", { className: "animate-in fade-in slide-in-from-bottom-2 duration-500", children: action }))] }));
}
