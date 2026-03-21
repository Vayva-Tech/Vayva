"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Link from "next/link";
import { Icon, cn } from "@vayva/ui";
function SectionShell({ title, icon, children, className, designCategory }) {
    // Get design category specific styling
    const getContainerClass = () => {
        switch (designCategory) {
            case "glass":
                return "rounded-[28px] border border-white/20 bg-white/70 backdrop-blur-xl";
            case "dark":
                return "rounded-[28px] border border-slate-700 bg-slate-900/80 backdrop-blur-xl";
            case "bold":
                return "rounded-2xl border-2 border-black bg-white";
            case "natural":
                return "rounded-2xl border border-amber-200 bg-amber-50/80 backdrop-blur-xl";
            default: // signature
                return "rounded-[28px] border border-border/60 bg-background/70 backdrop-blur-xl";
        }
    };
    const getTitleClass = () => {
        switch (designCategory) {
            case "dark":
                return "text-white";
            case "bold":
                return "text-gray-900 font-bold";
            default:
                return "text-text-primary";
        }
    };
    const _getSubtitleClass = () => {
        switch (designCategory) {
            case "dark":
                return "text-slate-300";
            case "bold":
                return "text-gray-600";
            default:
                return "text-text-secondary";
        }
    };
    return (_jsxs("div", { className: cn(getContainerClass(), className), children: [_jsxs("div", { className: "flex items-center gap-2 px-6 pt-6 pb-2", children: [icon && (_jsx(Icon, { name: icon, size: 16, className: cn(designCategory === "dark" ? "text-slate-400" :
                            designCategory === "bold" ? "text-gray-500" :
                                "text-text-tertiary") })), _jsx("h3", { className: cn("text-sm font-semibold", getTitleClass()), children: title })] }), _jsx("div", { className: "px-6 pb-6 pt-2", children: children })] }));
}
export function PrimaryObjectHealth({ label, topSelling, lowStock, deadStock, isLoading, designCategory, }) {
    if (isLoading) {
        return (_jsx(SectionShell, { title: `${label} Health`, icon: "Activity", designCategory: designCategory, children: _jsx("div", { className: "space-y-3", children: [1, 2, 3].map((i) => (_jsx("div", { className: cn("h-12 rounded-2xl animate-pulse", designCategory === "dark" ? "bg-slate-800" :
                        designCategory === "bold" ? "bg-gray-100" :
                            "bg-surface-2/50") }, i))) }) }));
    }
    const hasData = topSelling.length > 0 || lowStock.length > 0 || deadStock.length > 0;
    // Get design category specific styling
    const getItemClass = (type = 'normal') => {
        if (designCategory === "dark") {
            if (type === 'warning')
                return "border-amber-500/20 bg-amber-500/10";
            if (type === 'danger')
                return "border-rose-500/20 bg-rose-500/10";
            return "border-slate-700 bg-slate-800";
        }
        if (designCategory === "bold") {
            if (type === 'warning')
                return "border-yellow-300 bg-yellow-50";
            if (type === 'danger')
                return "border-red-300 bg-red-50";
            return "border-gray-300 bg-gray-50";
        }
        if (designCategory === "natural") {
            if (type === 'warning')
                return "border-amber-300 bg-amber-100";
            if (type === 'danger')
                return "border-rose-300 bg-rose-100";
            return "border-amber-200 bg-amber-50";
        }
        // signature/default
        if (type === 'warning')
            return "border-status-warning/20 bg-status-warning/10";
        if (type === 'danger')
            return "border-status-danger/20 bg-status-danger/10";
        return "border-border/60 bg-background/60";
    };
    const getTextClass = (type = 'primary') => {
        if (designCategory === "dark") {
            if (type === 'primary')
                return "text-white";
            if (type === 'secondary')
                return "text-slate-300";
            if (type === 'tertiary')
                return "text-slate-400";
            if (type === 'success')
                return "text-emerald-400";
            if (type === 'warning')
                return "text-amber-400";
            if (type === 'danger')
                return "text-rose-400";
        }
        if (designCategory === "bold") {
            if (type === 'primary')
                return "text-gray-900";
            if (type === 'secondary')
                return "text-gray-600";
            if (type === 'tertiary')
                return "text-gray-500";
            if (type === 'success')
                return "text-green-600";
            if (type === 'warning')
                return "text-yellow-600";
            if (type === 'danger')
                return "text-red-600";
        }
        if (designCategory === "natural") {
            if (type === 'primary')
                return "text-amber-900";
            if (type === 'secondary')
                return "text-amber-700";
            if (type === 'tertiary')
                return "text-amber-600";
            if (type === 'success')
                return "text-emerald-700";
            if (type === 'warning')
                return "text-amber-700";
            if (type === 'danger')
                return "text-rose-700";
        }
        // signature/default
        if (type === 'primary')
            return "text-text-primary";
        if (type === 'secondary')
            return "text-text-secondary";
        if (type === 'tertiary')
            return "text-text-tertiary";
        if (type === 'success')
            return "text-status-success";
        if (type === 'warning')
            return "text-status-warning";
        if (type === 'danger')
            return "text-status-danger";
    };
    return (_jsx(SectionShell, { title: `${label} Health`, icon: "Activity", designCategory: designCategory, children: !hasData ? (_jsxs("div", { className: cn("rounded-2xl p-5 text-sm", getItemClass(), getTextClass('secondary')), children: ["No ", label.toLowerCase(), " data yet. Start adding ", label.toLowerCase(), "s to see health metrics."] })) : (_jsxs("div", { className: "space-y-4", children: [topSelling.length > 0 && (_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-1.5 mb-2", children: [_jsx(Icon, { name: "TrendingUp", size: 14, className: getTextClass('success') }), _jsx("span", { className: cn("text-xs font-semibold", getTextClass('secondary')), children: "Top Selling Today" })] }), _jsx("div", { className: "space-y-1.5", children: topSelling.slice(0, 5).map((item, i) => (_jsxs("div", { className: cn("flex items-center justify-between rounded-xl px-3 py-2", getItemClass()), children: [_jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [_jsx("span", { className: cn("text-xs font-bold w-4", getTextClass('tertiary')), children: i + 1 }), _jsx("span", { className: cn("text-sm truncate", getTextClass('primary')), children: item.title })] }), _jsxs("span", { className: cn("text-xs font-semibold shrink-0", getTextClass('success')), children: [item.unitsSold, " sold"] })] }, item.id))) })] })), lowStock.length > 0 && (_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-1.5 mb-2", children: [_jsx(Icon, { name: "AlertTriangle", size: 14, className: getTextClass('warning') }), _jsx("span", { className: cn("text-xs font-semibold", getTextClass('secondary')), children: "Low Stock" })] }), _jsx("div", { className: "space-y-1.5", children: lowStock.slice(0, 5).map((item) => (_jsxs("div", { className: cn("flex items-center justify-between rounded-xl px-3 py-2", getItemClass('warning')), children: [_jsx("span", { className: cn("text-sm truncate", getTextClass('primary')), children: item.title }), _jsxs("span", { className: cn("text-xs font-bold shrink-0", getTextClass('warning')), children: [item.stock, " left"] })] }, item.id))) })] })), deadStock.length > 0 && (_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-1.5 mb-2", children: [_jsx(Icon, { name: "PackageX", size: 14, className: getTextClass('danger') }), _jsx("span", { className: cn("text-xs font-semibold", getTextClass('secondary')), children: "Not Selling (14d)" })] }), _jsx("div", { className: "space-y-1.5", children: deadStock.slice(0, 3).map((item) => (_jsxs("div", { className: cn("flex items-center justify-between rounded-xl px-3 py-2", getItemClass('danger')), children: [_jsx("span", { className: cn("text-sm truncate", getTextClass('primary')), children: item.title }), _jsxs("span", { className: cn("text-xs font-bold shrink-0", getTextClass('danger')), children: [item.stock, " in stock"] })] }, item.id))) })] }))] })) }));
}
export function LiveOperations({ title, items, isLoading, designCategory, }) {
    if (isLoading) {
        return (_jsx(SectionShell, { title: title, icon: "Radio", designCategory: designCategory, children: _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: [1, 2, 3].map((i) => (_jsx("div", { className: cn("h-20 rounded-2xl animate-pulse", designCategory === "dark" ? "bg-slate-800" :
                        designCategory === "bold" ? "bg-gray-100" :
                            "bg-surface-2/50") }, i))) }) }));
    }
    // Get design category specific styling
    const getCardClass = (isCritical) => {
        if (designCategory === "dark") {
            return isCritical
                ? "border-rose-500/20 bg-rose-500/10"
                : "border-slate-700 bg-slate-800";
        }
        if (designCategory === "bold") {
            return isCritical
                ? "border-red-300 bg-red-50 border-2"
                : "border-gray-300 bg-gray-50";
        }
        if (designCategory === "natural") {
            return isCritical
                ? "border-rose-300 bg-rose-100"
                : "border-amber-200 bg-amber-50";
        }
        // signature/default
        return isCritical
            ? "border-status-danger/20 bg-status-danger/10"
            : "border-border/60 bg-background/60";
    };
    const getValueClass = (isCritical) => {
        if (designCategory === "dark") {
            return isCritical ? "text-rose-400" : "text-white";
        }
        if (designCategory === "bold") {
            return isCritical ? "text-red-600 font-bold" : "text-gray-900";
        }
        if (designCategory === "natural") {
            return isCritical ? "text-rose-700" : "text-amber-900";
        }
        // signature/default
        return isCritical ? "text-status-danger" : "text-text-primary";
    };
    const getIconClass = (isCritical) => {
        if (designCategory === "dark") {
            return isCritical ? "text-rose-400" : "text-slate-400";
        }
        if (designCategory === "bold") {
            return isCritical ? "text-red-500" : "text-gray-500";
        }
        if (designCategory === "natural") {
            return isCritical ? "text-rose-600" : "text-amber-600";
        }
        // signature/default
        return isCritical ? "text-status-danger" : "text-text-tertiary";
    };
    const getLabelClass = () => {
        if (designCategory === "dark")
            return "text-slate-300";
        if (designCategory === "bold")
            return "text-gray-600";
        if (designCategory === "natural")
            return "text-amber-700";
        return "text-text-secondary";
    };
    return (_jsx(SectionShell, { title: title, icon: "Radio", designCategory: designCategory, children: _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: items.map((item) => {
                const numVal = typeof item.value === "number" ? item.value : 0;
                const isEmpty = item.value === null || item.value === 0 || item.value === "0";
                const isCritical = numVal > 0 &&
                    (item.key === "delayedShipments" || item.key === "kitchenBacklog");
                return (_jsxs("div", { className: cn("rounded-2xl border p-4 text-center", getCardClass(isCritical)), children: [_jsx(Icon, { name: item.icon, size: 18, className: cn("mx-auto mb-2", getIconClass(isCritical)) }), _jsx("div", { className: cn("text-2xl font-bold", getValueClass(isCritical)), children: isEmpty ? "—" : item.value }), _jsx("div", { className: cn("text-xs mt-1", getLabelClass()), children: isEmpty ? item.emptyText || item.label : item.label })] }, item.key));
            }) }) }));
}
const SEVERITY_STYLES = {
    critical: {
        border: "border-status-danger/20",
        bg: "bg-status-danger/10",
        icon: "AlertOctagon",
        iconColor: "text-status-danger",
    },
    warning: {
        border: "border-status-warning/20",
        bg: "bg-status-warning/10",
        icon: "AlertTriangle",
        iconColor: "text-status-warning",
    },
    info: {
        border: "border-status-info/20",
        bg: "bg-status-info/10",
        icon: "Info",
        iconColor: "text-status-info",
    },
};
export function AlertsList({ alerts, isLoading, designCategory }) {
    if (isLoading) {
        return (_jsx(SectionShell, { title: "Bottlenecks & Alerts", icon: "ShieldAlert", designCategory: designCategory, children: _jsx("div", { className: "space-y-2", children: [1, 2].map((i) => (_jsx("div", { className: cn("h-14 rounded-2xl animate-pulse", designCategory === "dark" ? "bg-slate-800" :
                        designCategory === "bold" ? "bg-gray-100" :
                            "bg-surface-2/50") }, i))) }) }));
    }
    if (alerts.length === 0) {
        return (_jsx(SectionShell, { title: "Bottlenecks & Alerts", icon: "ShieldAlert", designCategory: designCategory, children: _jsxs("div", { className: cn("rounded-2xl p-4 flex items-center gap-3", designCategory === "dark" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" :
                    designCategory === "bold" ? "border-green-300 bg-green-50 text-green-700" :
                        designCategory === "natural" ? "border-emerald-300 bg-emerald-100 text-emerald-700" :
                            "border-status-success/20 bg-status-success/10 text-status-success"), children: [_jsx(Icon, { name: "CheckCircle", size: 18, className: cn("shrink-0", designCategory === "dark" ? "text-emerald-400" :
                            designCategory === "bold" ? "text-green-600" :
                                designCategory === "natural" ? "text-emerald-600" :
                                    "text-status-success") }), _jsx("span", { className: cn("text-sm", designCategory === "dark" ? "text-white" :
                            designCategory === "bold" ? "text-gray-900" :
                                designCategory === "natural" ? "text-amber-900" :
                                    "text-text-primary"), children: "All clear \u2014 no bottlenecks detected." })] }) }));
    }
    // Get design category specific alert styling
    const getAlertClass = (severity) => {
        const baseStyle = SEVERITY_STYLES[severity] || SEVERITY_STYLES.info;
        if (designCategory === "dark") {
            if (severity === "critical")
                return { border: "border-rose-500/20", bg: "bg-rose-500/10", icon: "AlertOctagon", iconColor: "text-rose-400" };
            if (severity === "warning")
                return { border: "border-amber-500/20", bg: "bg-amber-500/10", icon: "AlertTriangle", iconColor: "text-amber-400" };
            return { border: "border-slate-500/20", bg: "bg-slate-500/10", icon: "Info", iconColor: "text-slate-400" };
        }
        if (designCategory === "bold") {
            if (severity === "critical")
                return { border: "border-red-300", bg: "bg-red-50", icon: "AlertOctagon", iconColor: "text-red-600" };
            if (severity === "warning")
                return { border: "border-yellow-300", bg: "bg-yellow-50", icon: "AlertTriangle", iconColor: "text-yellow-600" };
            return { border: "border-gray-300", bg: "bg-gray-50", icon: "Info", iconColor: "text-gray-600" };
        }
        if (designCategory === "natural") {
            if (severity === "critical")
                return { border: "border-rose-300", bg: "bg-rose-100", icon: "AlertOctagon", iconColor: "text-rose-700" };
            if (severity === "warning")
                return { border: "border-amber-300", bg: "bg-amber-100", icon: "AlertTriangle", iconColor: "text-amber-700" };
            return { border: "border-amber-200", bg: "bg-amber-50", icon: "Info", iconColor: "text-amber-600" };
        }
        return baseStyle;
    };
    const getTextClass = (type = 'primary') => {
        if (designCategory === "dark") {
            return type === 'primary' ? "text-white" : "text-slate-300";
        }
        if (designCategory === "bold") {
            return type === 'primary' ? "text-gray-900" : "text-gray-600";
        }
        if (designCategory === "natural") {
            return type === 'primary' ? "text-amber-900" : "text-amber-700";
        }
        return type === 'primary' ? "text-text-primary" : "text-text-secondary";
    };
    return (_jsx(SectionShell, { title: "Bottlenecks & Alerts", icon: "ShieldAlert", designCategory: designCategory, children: _jsx("div", { className: "space-y-2", children: alerts.map((alert) => {
                const style = getAlertClass(alert.severity);
                return (_jsxs("div", { className: cn("rounded-2xl border p-4 flex items-start gap-3", style.border, style.bg), children: [_jsx(Icon, { name: style.icon, size: 18, className: cn("shrink-0 mt-0.5", style.iconColor) }), _jsxs("div", { className: "min-w-0", children: [_jsx("div", { className: cn("text-sm font-semibold", getTextClass('primary')), children: alert.title }), _jsx("div", { className: cn("text-xs mt-0.5", getTextClass('secondary')), children: alert.message })] })] }, alert.id));
            }) }) }));
}
const ACTION_SEVERITY_STYLES = {
    critical: {
        border: "border-status-danger/20",
        bg: "bg-status-danger/5",
        hoverBg: "hover:bg-status-danger/10",
    },
    warning: {
        border: "border-status-warning/20",
        bg: "bg-status-warning/5",
        hoverBg: "hover:bg-status-warning/10",
    },
    info: {
        border: "border-border/60",
        bg: "bg-background/60",
        hoverBg: "hover:bg-surface-2/50",
    },
};
export function SuggestedActionsList({ actions, isLoading, designCategory, }) {
    if (isLoading) {
        return (_jsx(SectionShell, { title: "Suggested Actions", icon: "Lightbulb", designCategory: designCategory, children: _jsx("div", { className: "space-y-2", children: [1, 2].map((i) => (_jsx("div", { className: cn("h-16 rounded-2xl animate-pulse", designCategory === "dark" ? "bg-slate-800" :
                        designCategory === "bold" ? "bg-gray-100" :
                            "bg-surface-2/50") }, i))) }) }));
    }
    if (actions.length === 0) {
        return (_jsx(SectionShell, { title: "Suggested Actions", icon: "Lightbulb", designCategory: designCategory, children: _jsx("div", { className: cn("rounded-2xl p-4 text-sm", designCategory === "dark" ? "border-slate-700 bg-slate-800 text-slate-300" :
                    designCategory === "bold" ? "border-gray-300 bg-gray-50 text-gray-600" :
                        designCategory === "natural" ? "border-amber-200 bg-amber-50 text-amber-700" :
                            "border-border/60 bg-background/60 text-text-secondary"), children: "No actions needed right now. You're on track." }) }));
    }
    // Get design category specific action styling
    const getActionClass = (severity) => {
        const baseStyle = ACTION_SEVERITY_STYLES[severity] || ACTION_SEVERITY_STYLES.info;
        if (designCategory === "dark") {
            if (severity === "critical")
                return { border: "border-rose-500/20", bg: "bg-rose-500/5", hoverBg: "hover:bg-rose-500/10" };
            if (severity === "warning")
                return { border: "border-amber-500/20", bg: "bg-amber-500/5", hoverBg: "hover:bg-amber-500/10" };
            return { border: "border-slate-700", bg: "bg-slate-800", hoverBg: "hover:bg-slate-700" };
        }
        if (designCategory === "bold") {
            if (severity === "critical")
                return { border: "border-red-300", bg: "bg-red-50", hoverBg: "hover:bg-red-100" };
            if (severity === "warning")
                return { border: "border-yellow-300", bg: "bg-yellow-50", hoverBg: "hover:bg-yellow-100" };
            return { border: "border-gray-300", bg: "bg-gray-50", hoverBg: "hover:bg-gray-100" };
        }
        if (designCategory === "natural") {
            if (severity === "critical")
                return { border: "border-rose-300", bg: "bg-rose-100", hoverBg: "hover:bg-rose-200" };
            if (severity === "warning")
                return { border: "border-amber-300", bg: "bg-amber-100", hoverBg: "hover:bg-amber-200" };
            return { border: "border-amber-200", bg: "bg-amber-50", hoverBg: "hover:bg-amber-100" };
        }
        return baseStyle;
    };
    const getTextClass = (type = 'primary') => {
        if (designCategory === "dark") {
            return type === 'primary' ? "text-white" : type === 'secondary' ? "text-slate-300" : "text-slate-400";
        }
        if (designCategory === "bold") {
            return type === 'primary' ? "text-gray-900" : type === 'secondary' ? "text-gray-600" : "text-gray-500";
        }
        if (designCategory === "natural") {
            return type === 'primary' ? "text-amber-900" : type === 'secondary' ? "text-amber-700" : "text-amber-600";
        }
        return type === 'primary' ? "text-text-primary" : type === 'secondary' ? "text-text-secondary" : "text-text-tertiary";
    };
    return (_jsx(SectionShell, { title: "Suggested Actions", icon: "Lightbulb", designCategory: designCategory, children: _jsx("div", { className: "space-y-2", children: actions.map((action) => {
                const style = getActionClass(action.severity || "info");
                return (_jsxs(Link, { href: action.href || "#", className: cn("rounded-2xl border p-4 flex items-center gap-3 transition-colors", style.border, style.bg, style.hoverBg), children: [_jsx("div", { className: cn("h-10 w-10 rounded-2xl flex items-center justify-center shrink-0", designCategory === "dark" ? "bg-slate-700" :
                                designCategory === "bold" ? "bg-gray-100" :
                                    designCategory === "natural" ? "bg-amber-100" :
                                        "bg-surface-2/50"), children: _jsx(Icon, { name: action.icon, size: 18, className: getTextClass('tertiary') }) }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("div", { className: cn("text-sm font-semibold", getTextClass('primary')), children: action.title }), _jsx("div", { className: cn("text-xs mt-0.5", getTextClass('secondary')), children: action.reason || action.description })] }), _jsx(Icon, { name: "ChevronRight", size: 16, className: getTextClass('tertiary') })] }, action.id));
            }) }) }));
}
