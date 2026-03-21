'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export function UniversalSectionHeader({ title, subtitle, action, className = "" }) {
    return (_jsxs("div", { className: `flex items-center justify-between ${className}`, children: [_jsxs("div", { children: [_jsx(CardTitle, { className: "text-xl", children: title }), subtitle && (_jsx("p", { className: "text-sm text-muted-foreground mt-1", children: subtitle }))] }), action && _jsx("div", { children: action })] }));
}
export function UniversalCard({ title, subtitle, children, action, className = "" }) {
    return (_jsxs(Card, { className: className, children: [_jsx(CardHeader, { children: _jsx(UniversalSectionHeader, { title: title, subtitle: subtitle, action: action }) }), _jsx(CardContent, { children: children })] }));
}
