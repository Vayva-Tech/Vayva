"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "@vayva/ui";
import { Flag } from "lucide-react";
export function ReportProductDialog({ productId }) {
    const [isOpen, setIsOpen] = useState(false);
    const [reason, setReason] = useState("");
    const [details, setDetails] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await fetch("/api/report", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    entityType: "PRODUCT",
                    entityId: productId,
                    reason,
                    details
                })
            });
            setSubmitted(true);
            setTimeout(() => {
                setIsOpen(false);
            }, 2000);
        }
        catch {
            alert("Failed to report");
        }
        finally {
            setSubmitting(false);
        }
    };
    if (submitted) {
        if (!isOpen)
            return _jsx(ReportTrigger, { onClick: () => setIsOpen(true) });
        return (_jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50", children: _jsxs("div", { className: "bg-white p-6 rounded-lg max-w-sm w-full text-center", children: [_jsx("h3", { className: "font-bold text-lg mb-2", children: "Thank you" }), _jsx("p", { className: "text-gray-600", children: "We will review this product within 24 hours." })] }) }));
    }
    return (_jsxs(_Fragment, { children: [_jsx(ReportTrigger, { onClick: () => setIsOpen(true) }), isOpen && (_jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50", children: _jsxs("div", { className: "bg-white p-6 rounded-lg max-w-sm w-full", children: [_jsx("h3", { className: "font-bold text-lg mb-4", children: "Report this Product" }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "report-reason", className: "block text-sm font-medium mb-1", children: "Reason" }), _jsxs("select", { id: "report-reason", className: "w-full p-2 border rounded", value: reason, onChange: (e) => setReason(e.target.value), required: true, children: [_jsx("option", { value: "", children: "Select a reason" }), _jsx("option", { value: "PROHIBITED", children: "Prohibited Item (Drugs, Weapons)" }), _jsx("option", { value: "OFFENSIVE", children: "Offensive / Hateful Content" }), _jsx("option", { value: "FRAUD", children: "Fraud / Scam" }), _jsx("option", { value: "OTHER", children: "Other" })] })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "report-details", className: "block text-sm font-medium mb-1", children: "Details" }), _jsx("textarea", { id: "report-details", className: "w-full p-2 border rounded", rows: 3, value: details, onChange: (e) => setDetails(e.target.value) })] }), _jsxs("div", { className: "flex gap-2 justify-end pt-2", children: [_jsx(Button, { type: "button", variant: "outline", onClick: () => setIsOpen(false), children: "Cancel" }), _jsx(Button, { type: "submit", variant: "destructive", isLoading: submitting, disabled: !reason, children: "Report" })] })] })] }) }))] }));
}
function ReportTrigger({ onClick }) {
    return (_jsxs(Button, { variant: "ghost", onClick: onClick, className: "flex items-center gap-2 text-xs text-gray-400 hover:text-red-500 transition-colors mt-6 h-auto p-0", children: [_jsx(Flag, { size: 12 }), _jsx("span", { children: "Report this product" })] }));
}
