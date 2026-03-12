"use client";

import React, { useState } from "react";
import { Button } from "@vayva/ui";
import { useParams } from "next/navigation";
import { CaretDown as ChevronDown, Envelope as Mail, Phone } from "@phosphor-icons/react/ssr";
import { LocaleKey, LOCALES } from "@/data/locales";

export default function HelpPage({
  params: _params,
}: {
  params: Promise<{ lang: string }>;
}): React.JSX.Element {
  const { lang: rawLang } = useParams() as { lang: string };
  const lang = (rawLang === "tr" ? "tr" : "en") as LocaleKey;
  const t = LOCALES[lang].account.help;

  const faqs = [
    {
      q:
        lang === "tr"
          ? "Teslimat saatlerini değiştirebilir miyim?"
          : "Can I change my delivery times?",
      a:
        lang === "tr"
          ? "Evet, siparişiniz yola çıkmadan önce müşteri hizmetlerimizi arayarak değişiklik yapabilirsiniz."
          : "Yes, you can change it by calling support before your order is dispatched.",
    },
    {
      q:
        lang === "tr"
          ? "Menü içeriğini nasıl görebilirim?"
          : "How can I see the menu ingredients?",
      a:
        lang === "tr"
          ? "Haftalık menü sayfasında her yemeğin üzerine tıklayarak detaylı içerik ve alerjen bilgilerine ulaşabilirsiniz."
          : "You can click on any meal in the weekly menu page to see details and allergens.",
    },
    {
      q:
        lang === "tr"
          ? "Aboneliğimi nasıl iptal ederim?"
          : "How do I cancel my subscription?",
      a:
        lang === "tr"
          ? "Hesabım sayfasından plan detaylarına giderek aboneliğinizi dondurabilir veya iptal edebilirsiniz."
          : "You can freeze or cancel your subscription from the plan details in your account page.",
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">{t.title}</h1>
        <p className="text-gray-500">{t.subtitle}</p>
      </div>

      <div className="bg-background/70 backdrop-blur-xl rounded-2xl border border-gray-100 overflow-hidden">
        {faqs.map((faq, idx) => (
          <div key={idx} className="border-b border-gray-100 last:border-0">
            <Button
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full flex items-center justify-between p-6 text-left hover:bg-white/60 transition-colors"
            >
              <span className="font-bold">{faq.q}</span>
              <ChevronDown
                className={`transition-transform duration-300 ${openIndex === idx ? "rotate-180" : ""}`}
                size={20}
              />
            </Button>
            {openIndex === idx && (
              <div className="px-6 pb-6 text-gray-500 leading-relaxed animate-fade-in">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-black text-white rounded-2xl p-8">
        <h2 className="text-xl font-bold mb-6">{t.contact}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-background/70 backdrop-blur-xl rounded-full flex items-center justify-center">
              <Phone size={24} />
            </div>
            <div>
              <div className="opacity-60 text-sm mb-1">Phone</div>
              <div className="font-bold text-xl">{t.phone}</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-background/70 backdrop-blur-xl rounded-full flex items-center justify-center">
              <Mail size={24} />
            </div>
            <div>
              <div className="opacity-60 text-sm mb-1">Email</div>
              <div className="font-bold text-xl">{t.email}</div>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-white/10 text-sm opacity-60">
          {t.contactDesc}
        </div>
      </div>
    </div>
  );
}
