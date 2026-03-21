'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
export function KitchenStatus() {
    return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Clock, { className: "h-5 w-5" }), "Kitchen Status"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx(Badge, { variant: "secondary", children: "Online" }), _jsx(Badge, { variant: "outline", children: "All Systems Operational" })] }) })] }));
}
