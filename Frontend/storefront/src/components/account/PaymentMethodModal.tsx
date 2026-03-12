"use client";

import { useState } from "react";
import { LocaleKey, LOCALES } from "@/data/locales";
import { X, CreditCard } from "@phosphor-icons/react/ssr";
import { Button } from "@vayva/ui";

interface PaymentMethodModalProps {
  lang: LocaleKey;
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSave: (payment: any) => void;
}

export function PaymentMethodModal({
  lang,
  isOpen,
  onClose,
  onSave,
}: PaymentMethodModalProps) {
  const t = LOCALES[lang].account.payments.form;

  const [holder, setHolder] = useState("");
  const [number, setNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Test: just take last 4 of numeric input
    const numeric = number.replace(/\D/g, "");
    const last4 = numeric.slice(-4) || "1234";

    onSave({
      holder,
      last4,
      expiry,
      isDefault: false,
    });

    // Reset
    setHolder("");
    setNumber("");
    setExpiry("");
    setCvv("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="bg-white rounded-3xl w-full max-w-lg relative z-10 shadow-2xl animate-fade-in-up">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <CreditCard size={20} />
            {t.title}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors h-auto"
            aria-label="Close payment method modal"
          >
            <X size={20} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label
              htmlFor="card-holder"
              className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2"
            >
              {t.holder}
            </label>
            <input
              id="card-holder"
              required
              type="text"
              value={holder}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onChange={(e: any) => setHolder(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl"
            />
          </div>

          <div>
            <label
              htmlFor="card-number"
              className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2"
            >
              {t.number}
            </label>
            <input
              id="card-number"
              required
              type="text"
              maxLength={19}
              placeholder="0000 0000 0000 0000"
              value={number}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onChange={(e: any) => setNumber(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="card-expiry"
                className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2"
              >
                {t.expiry}
              </label>
              <input
                id="card-expiry"
                required
                type="text"
                placeholder="MM/YY"
                maxLength={5}
                value={expiry}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onChange={(e: any) => setExpiry(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-center"
              />
            </div>
            <div>
              <label
                htmlFor="card-cvv"
                className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2"
              >
                {t.cvv}
              </label>
              <input
                id="card-cvv"
                required
                type="password"
                maxLength={3}
                placeholder="123"
                value={cvv}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onChange={(e: any) => setCvv(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-center"
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1 py-4 font-bold text-gray-500 hover:bg-gray-50 rounded-xl h-auto"
              aria-label="Cancel"
            >
              {t.cancel}
            </Button>
            <Button
              type="submit"
              className="flex-1 py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-900 transition-colors h-auto"
              aria-label="Save payment method"
            >
              {t.save}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
