import React from "react";
import { Star } from "@phosphor-icons/react/ssr";

interface SocialProofProps {
  testimonials: { name: string; text: string; rating: number }[];
}

export const SocialProof = ({
  testimonials,
}: SocialProofProps): React.JSX.Element => {
  return (
    <section
      id="reviews"
      className="py-20 bg-transparent border-t border-gray-100"
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black text-gray-900">
            Don't just take our word for it.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-background/40 backdrop-blur-sm p-6 rounded-2xl"
            >
              <div className="flex text-yellow-400 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>
              <p className="text-gray-800 font-medium italic mb-6">
                "{t.text}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center font-bold text-gray-600">
                  {t.name.charAt(0)}
                </div>
                <span className="font-bold text-sm text-gray-900">
                  {t.name}
                </span>
                <span className="text-xs text-green-600 font-bold bg-green-100 px-2 py-0.5 rounded-full ml-auto">
                  Verified Buyer
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
