'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users } from "lucide-react";
export function StationWorkload() {
    return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Users, { className: "h-5 w-5" }), "Station Workload"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex justify-between mb-1", children: [_jsx("span", { className: "text-sm", children: "Grill Station" }), _jsx("span", { className: "text-sm text-muted-foreground", children: "65%" })] }), _jsx(Progress, { value: 65, className: "h-2" })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex justify-between mb-1", children: [_jsx("span", { className: "text-sm", children: "Fry Station" }), _jsx("span", { className: "text-sm text-muted-foreground", children: "40%" })] }), _jsx(Progress, { value: 40, className: "h-2" })] })] }) })] }));
}
