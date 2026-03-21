'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, TrendingDown, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UniversalSectionHeader } from './universal';
export function AtRiskAlert({ students, _designCategory }) {
    if (students.length === 0) {
        return null;
    }
    const getSeverity = (reasons) => {
        if (reasons.includes('Below 50% progress'))
            return 'critical';
        if (reasons.includes('Inactive >14 days'))
            return 'high';
        return 'medium';
    };
    const getIcon = (severity) => {
        switch (severity) {
            case 'critical':
                return _jsx(AlertTriangle, { className: "h-5 w-5 text-red-500" });
            case 'high':
                return _jsx(TrendingDown, { className: "h-5 w-5 text-orange-500" });
            default:
                return _jsx(Clock, { className: "h-5 w-5 text-yellow-500" });
        }
    };
    const getColor = (severity) => {
        switch (severity) {
            case 'critical':
                return 'border-red-500 bg-red-950/20';
            case 'high':
                return 'border-orange-500 bg-orange-950/20';
            default:
                return 'border-yellow-500 bg-yellow-950/20';
        }
    };
    return (_jsxs("div", { className: "space-y-4", children: [_jsx(UniversalSectionHeader, { title: "At-Risk Students", subtitle: `${students.length} students need intervention`, icon: _jsx(AlertTriangle, { className: "h-5 w-5" }) }), _jsx(Card, { className: "border-l-4 border-l-red-500 bg-gradient-to-br from-red-950/30 to-card rounded-2xl", children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground mb-1", children: "Immediate Attention Required" }), _jsxs("p", { className: "text-3xl font-bold text-red-400", children: [students.length, " students"] })] }), _jsx("div", { className: "p-3 rounded-xl bg-red-500/10", children: _jsx(AlertTriangle, { className: "h-8 w-8 text-red-500" }) })] }) }) }), _jsx("div", { className: "space-y-2", children: students.slice(0, 5).map((student) => {
                    const severity = getSeverity(student.atRiskReasons);
                    return (_jsx(Card, { className: `border-l-4 hover:border-primary/50 transition-all rounded-2xl ${getColor(severity)}`, children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [getIcon(severity), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-lg text-foreground", children: student.studentName }), _jsxs("p", { className: "text-xs text-muted-foreground", children: ["Progress: ", student.overallProgress, "%"] })] })] }), _jsx(Button, { size: "sm", variant: "outline", className: "rounded-full", children: "Intervene" })] }), _jsx("div", { className: "space-y-1", children: student.atRiskReasons.map((reason, idx) => (_jsxs("p", { className: "text-xs text-red-400 flex items-center gap-1", children: [_jsx(AlertTriangle, { className: "h-3 w-3" }), reason] }, idx))) }), student.lastActiveDate && (_jsxs("p", { className: "text-xs text-muted-foreground", children: ["Last active: ", new Date(student.lastActiveDate).toLocaleDateString()] }))] }) }) }, student.studentId));
                }) })] }));
}
