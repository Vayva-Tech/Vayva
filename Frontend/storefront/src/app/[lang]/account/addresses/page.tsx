"use client";

import React, { useState } from "react";
import { Button } from "@vayva/ui";
import { useParams } from "next/navigation";
import { LocaleKey, LOCALES } from "@/data/locales";
import { useUserInteractions } from "@/hooks/useUserInteractions";
import { AddressModal } from "@/components/account/AddressModal";
import { MapPin, Plus, Trash as Trash2, CheckCircle } from "@phosphor-icons/react/ssr";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function AddressesPage({
  params: _params,
}: any): React.JSX.Element {
  const { lang: rawLang } = useParams() as { lang: string };
  const lang = (rawLang === "tr" ? "tr" : "en") as LocaleKey;
  const t = LOCALES[lang].account.addresses;
  const { addresses, addAddress, removeAddress, setDefaultAddress, isLoaded } =
    useUserInteractions();

  const [isNavOpen, setIsNavOpen] = useState(false); // for modal

  if (!isLoaded) return <></>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t.title}</h1>
        <Button
          onClick={() => setIsNavOpen(true)}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors"
        >
          <Plus size={16} />
          {t.add}
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="bg-background/70 backdrop-blur-xl border rounded-2xl p-12 text-center text-gray-400">
          <MapPin size={48} className="mx-auto mb-4 opacity-50" />
          <p>{t.empty}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {addresses.map((addr: any) => (
            <div
              key={addr.id}
              className={`bg-background/70 backdrop-blur-xl p-6 rounded-2xl border transition-all ${addr.isDefault ? "border-green-500 shadow-sm ring-1 ring-green-100" : "border-gray-100"}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-lg">{addr.title}</h3>
                  {addr.isDefault && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold flex items-center gap-1">
                      <CheckCircle size={10} />
                      {t.default}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {!addr.isDefault && (
                    <Button
                      onClick={() => setDefaultAddress(addr.id)}
                      className="text-xs font-bold text-gray-400 hover:text-black transition-colors"
                    >
                      {t.setDefault}
                    </Button>
                  )}
                  <Button
                    onClick={() => removeAddress(addr.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed mb-1">
                {addr.neighborhood}, {addr.address}
              </p>
              <p className="text-gray-500 text-sm">
                {addr.city} / {addr.district}
              </p>
              {addr.notes && (
                <div className="mt-4 pt-4 border-t border-gray-50 text-sm text-gray-500 italic">
                  "{addr.notes}"
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <AddressModal
        lang={lang}
        isOpen={isNavOpen}
        onClose={() => setIsNavOpen(false)}
        onSave={addAddress}
      />
    </div>
  );
}
