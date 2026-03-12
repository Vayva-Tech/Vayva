import React from "react";

interface RitualStep {
  step: string;
  description: string;
}

interface RitualsSectionProps {
  rituals?: RitualStep[];
}

export const RitualsSection = ({
  rituals = [
    {
      step: "01. Light",
      description: "Create your sanctuary by lighting the wick.",
    },
    {
      step: "02. Breathe",
      description: "Inhale deeply for 4 seconds, hold for 4.",
    },
    { step: "03. Relax", description: "Let the natural aromas ground you." },
  ],
}: RitualsSectionProps) => {
  return (
    <section className="bg-[#FAF8F5] py-20 px-8 mb-20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-[#C9B7A2] uppercase tracking-[0.2em] text-xs font-bold">
            The Routine
          </span>
          <h3 className="font-serif text-3xl text-[#2E2E2E] mt-4">
            How to Use
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {rituals.map((r, i) => (
            <div key={i} className="relative">
              <div className="w-16 h-16 rounded-full border border-[#C9B7A2] flex items-center justify-center mx-auto mb-6 text-[#C9B7A2] font-serif text-xl">
                {i + 1}
              </div>
              <h4 className="font-bold text-[#2E2E2E] mb-2 font-serif">
                {r.step}
              </h4>
              <p className="text-[#8A8A8A] text-sm leading-relaxed max-w-[200px] mx-auto">
                {r.description}
              </p>

              {/* Connector Line (Desktop only) */}
              {i < rituals.length - 1 && (
                <div
                  className="hidden md:block absolute top-8 left-1/2 w-full h-[1px] bg-[#EAE0D5] -z-10"
                  style={{ left: "60%" }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
