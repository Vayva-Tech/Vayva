"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { LOCALES } from "@/data/locales";
import { Check, Copy, CreditCard, Gift, Loader2 } from "lucide-react";
import { Button } from "@vayva/ui";
const AMOUNTS = [500, 1000, 1500, 2000];
export function GiftCardBuyForm({ lang }) {
    const t = LOCALES[lang].giftCards.buy;
    // Form State
    const [amount, setAmount] = useState(1000);
    const [customAmount, setCustomAmount] = useState("");
    const [recipientName, setRecipientName] = useState("");
    const [recipientEmail, setRecipientEmail] = useState("");
    const [senderEmail, setSenderEmail] = useState("");
    const [message, setMessage] = useState("");
    const [sendStrategy, setSendStrategy] = useState("now");
    // UI State
    const [loading, setLoading] = useState(false);
    const [successCode, setSuccessCode] = useState(null);
    const [copied, setCopied] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        // Test API call
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const finalAmount = amount === "custom" ? Number(customAmount) : amount;
        const code = `GIFT-${finalAmount}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        setSuccessCode(code);
        setLoading(false);
    };
    const copyToClipboard = () => {
        if (!successCode)
            return;
        navigator.clipboard.writeText(successCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    if (successCode) {
        return (_jsxs("div", { className: "bg-white rounded-2xl border border-green-100 p-8 text-center animate-fade-in-up", children: [_jsx("div", { className: "w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600", children: _jsx(Check, { size: 32 }) }), _jsx("h3", { className: "text-2xl font-bold text-gray-900 mb-2", children: t.successTitle }), _jsx("p", { className: "text-gray-500 mb-8", children: t.successDesc }), _jsxs("div", { className: "bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-between mb-8 max-w-sm mx-auto", children: [_jsx("span", { className: "font-mono text-xl font-bold tracking-wider text-gray-900", children: successCode }), _jsx(Button, { variant: "ghost", size: "icon", onClick: copyToClipboard, className: "text-gray-500 hover:text-black transition-colors h-auto", "aria-label": copied ? "Copied" : "Copy gift code", children: copied ? (_jsx(Check, { size: 20, className: "text-green-600" })) : (_jsx(Copy, { size: 20 })) })] }), _jsx(Button, { variant: "ghost", onClick: () => {
                        setSuccessCode(null);
                        setAmount(1000);
                        setRecipientName("");
                        setRecipientEmail("");
                    }, className: "text-sm font-bold text-gray-900 underline hover:text-gray-600 h-auto", "aria-label": "Buy another gift card", children: lang === "tr" ? "Yeni Bir Tane Al" : "Buy Another" })] }));
    }
    return (_jsxs("form", { onSubmit: handleSubmit, className: "bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm", children: [_jsxs("h3", { className: "text-lg font-bold text-gray-900 mb-6 flex items-center gap-2", children: [_jsx(Gift, { size: 20, className: "text-green-500" }), t.amountLabel] }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-4 mb-8", children: [AMOUNTS.map((val) => (_jsxs(Button, { type: "button", variant: "ghost", onClick: () => setAmount(val), className: `h-14 rounded-xl border-2 font-bold transition-all h-auto ${amount === val
                            ? "border-green-500 bg-green-50 text-green-700"
                            : "border-gray-100 hover:border-gray-200 text-gray-600"}`, "aria-label": `Select amount ${val}₺`, children: [val, "\u20BA"] }, val))), _jsxs("div", { className: "relative", children: [_jsx("input", { type: "number", placeholder: t.customAmount, value: customAmount, onChange: (e) => {
                                    setAmount("custom");
                                    setCustomAmount(e.target.value);
                                }, onClick: () => setAmount("custom"), className: `w-full h-14 pl-4 pr-4 rounded-xl border-2 font-bold outline-none transition-all ${amount === "custom"
                                    ? "border-green-500 bg-white ring-0"
                                    : "border-gray-100 focus:border-gray-200"}` }), amount === "custom" && (_jsx("span", { className: "absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-400", children: "\u20BA" }))] })] }), _jsxs("div", { className: "space-y-4 mb-8", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsx("input", { required: true, type: "text", placeholder: t.recipientName, value: recipientName, onChange: (e) => setRecipientName(e.target.value), className: "w-full p-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-black/5 transaction-all" }), _jsx("input", { required: true, type: "email", placeholder: t.recipientEmail, value: recipientEmail, onChange: (e) => setRecipientEmail(e.target.value), className: "w-full p-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-black/5 transaction-all" })] }), _jsx("input", { required: true, type: "email", placeholder: t.senderEmail, value: senderEmail, onChange: (e) => setSenderEmail(e.target.value), className: "w-full p-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-black/5 transaction-all" }), _jsx("textarea", { rows: 3, placeholder: t.message, value: message, onChange: (e) => setMessage(e.target.value), className: "w-full p-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-black/5 transaction-all resize-none" })] }), _jsxs("div", { className: "mb-8", children: [_jsx("label", { className: "block text-sm font-bold text-gray-700 mb-3", children: t.timing }), _jsxs("div", { className: "flex gap-4", children: [_jsx(Button, { type: "button", variant: "ghost", onClick: () => setSendStrategy("now"), className: `flex-1 py-3 px-4 rounded-xl border text-sm font-bold transition-all h-auto ${sendStrategy === "now"
                                    ? "border-black bg-black text-white"
                                    : "border-gray-200 text-gray-600 hover:border-gray-300"}`, "aria-label": "Send now", children: t.now }), _jsx(Button, { type: "button", variant: "ghost", onClick: () => setSendStrategy("date"), className: `flex-1 py-3 px-4 rounded-xl border text-sm font-bold transition-all h-auto ${sendStrategy === "date"
                                    ? "border-black bg-black text-white"
                                    : "border-gray-200 text-gray-600 hover:border-gray-300"}`, "aria-label": "Select date", children: t.date })] })] }), _jsxs(Button, { type: "submit", disabled: loading, className: "w-full bg-[#0B1220] text-white font-bold h-14 rounded-xl hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed h-auto", "aria-label": "Submit gift card purchase", children: [loading ? (_jsx(Loader2, { className: "animate-spin" })) : (_jsx(CreditCard, { size: 20 })), t.submit] })] }));
}
