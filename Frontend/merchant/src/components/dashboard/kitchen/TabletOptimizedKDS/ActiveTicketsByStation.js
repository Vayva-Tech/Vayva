'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket } from "lucide-react";
export function ActiveTicketsByStation() {
    return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Ticket, { className: "h-5 w-5" }), "Active Tickets"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "text-center py-8", children: [_jsx(Ticket, { className: "h-12 w-12 mx-auto text-muted-foreground mb-4" }), _jsx("p", { className: "text-muted-foreground", children: "Active tickets functionality coming soon" })] }) })] }));
}
