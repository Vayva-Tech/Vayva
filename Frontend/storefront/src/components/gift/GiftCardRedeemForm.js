"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { LOCALES } from "@/data/locales";
import { useUserInteractions } from "@/hooks/useUserInteractions";
import { CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@vayva/ui";
export function GiftCardRedeemForm({ lang }) {
    const t = LOCALES[lang].giftCards.redeem;
    const { redeemCode } = useUserInteractions();
    const [code, setCode] = useState("");
    const [result, setResult] = useState(null);
    const handleSubmit = (e) => {
        e.preventDefault();
        const redemption = redeemCode(code);
        if (redemption.success) {
            setResult({
                success: true,
                message: `${t.success} +${redemption.amount}₺`,
            });
            setCode("");
        }
        else {
            setResult({ success: false, message: t.error });
        }
        // Clear message after delay
        setTimeout(() => setResult(null), 3000);
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm h-full flex flex-col justify-center", children: [_jsx("h3", { className: "text-xl font-bold text-gray-900 mb-6", children: t.label }), _jsx("div", { className: "mb-6 relative", children: _jsx("input", { type: "text", value: code, onChange: (e) => setCode(e.target.value.toUpperCase()), placeholder: t.placeholder, className: "w-full text-center text-xl tracking-widest p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black/5 font-mono uppercase placeholder:tracking-normal placeholder:font-sans placeholder:text-base placeholder:text-gray-400" }) }), result && (_jsxs("div", { className: `mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-bold animate-fade-in-up ${result.success
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"}`, children: [result.success ? (_jsx(CheckCircle, { size: 18 })) : (_jsx(AlertCircle, { size: 18 })), result.message] })), _jsxs(Button, { type: "submit", variant: "outline", disabled: !code, className: "w-full bg-white border-2 border-black text-black font-bold h-14 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white h-auto", "aria-label": "Redeem gift card", children: [t.submit, _jsx(ArrowRight, { size: 20 })] })] }));
}
