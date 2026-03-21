'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
export function EightySixBoard() {
    return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(AlertTriangle, { className: "h-5 w-5" }), "86 Board"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-2", children: [_jsx(Badge, { variant: "destructive", children: "Sold Out Items" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "No items currently marked as 86" })] }) })] }));
}
