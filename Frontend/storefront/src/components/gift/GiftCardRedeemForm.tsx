"use client";

import { useState } from "react";
import { LocaleKey, LOCALES } from "@/data/locales";
import { useUserInteractions } from "@/hooks/useUserInteractions";
import { CheckCircle, WarningCircle as AlertCircle, ArrowRight } from "@phosphor-icons/react/ssr";
import { Button } from "@vayva/ui";

interface GiftCardRedeemFormProps {
  lang: LocaleKey;
}

export function GiftCardRedeemForm({
  lang,
}: GiftCardRedeemFormProps): React.JSX.Element {
  const t = LOCALES[lang].giftCards.redeem;
  const { redeemCode } = useUserInteractions();

  const [code, setCode] = useState("");
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const redemption = redeemCode(code);

    if (redemption.success) {
      setResult({
        success: true,
        message: `${t.success} +${redemption.amount}₺`,
      });
      setCode("");
    } else {
      setResult({ success: false, message: t.error });
    }

    // Clear message after delay
    setTimeout(() => setResult(null), 3000);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm h-full flex flex-col justify-center"
    >
      <h3 className="text-xl font-bold text-gray-900 mb-6">{t.label}</h3>

      <div className="mb-6 relative">
        <input
          type="text"
          value={code}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange={(e: any) => setCode(e.target.value.toUpperCase())}
          placeholder={t.placeholder}
          className="w-full text-center text-xl tracking-widest p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black/5 font-mono uppercase placeholder:tracking-normal placeholder:font-sans placeholder:text-base placeholder:text-gray-400"
        />
      </div>

      {result && (
        <div
          className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-bold animate-fade-in-up ${
            result.success
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {result.success ? (
            <CheckCircle size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          {result.message}
        </div>
      )}

      <Button
        type="submit"
        variant="outline"
        disabled={!code}
        className="w-full bg-white border-2 border-black text-black font-bold h-14 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white h-auto"
        aria-label="Redeem gift card"
      >
        {t.submit}
        <ArrowRight size={20} />
      </Button>
    </form>
  );
}
