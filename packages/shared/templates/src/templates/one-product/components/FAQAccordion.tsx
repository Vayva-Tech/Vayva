import React, { useState } from "react";
import { Button } from "@vayva/ui";
import { Plus, Minus, ChevronDown, ChevronUp } from "lucide-react";

interface FAQAccordionProps {
  faqs: { question: string; answer: string }[];
}

export const FAQAccordion = ({
  faqs,
}: FAQAccordionProps): React.JSX.Element => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 bg-transparent">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-3xl font-black text-center text-gray-900 mb-12">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border border-gray-200 rounded-xl overflow-hidden"
            >
              <Button
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full flex items-center justify-between p-5 text-left bg-transparent hover:bg-white/60 transition-colors"
              >
                <span className="font-bold text-gray-900">{faq.question}</span>
                {openIdx === idx ? (
                  <ChevronUp size={20} className="text-gray-400" />
                ) : (
                  <ChevronDown size={20} className="text-gray-400" />
                )}
              </Button>
              {openIdx === idx && (
                <div className="p-5 pt-0 bg-transparent text-gray-600 leading-relaxed border-t border-gray-50">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
