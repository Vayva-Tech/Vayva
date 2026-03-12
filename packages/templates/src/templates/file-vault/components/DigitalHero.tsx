import React from "react";
import { ShieldCheck, Zap } from "lucide-react";
import { Button } from "@vayva/ui";

export const DigitalHero = (): React.JSX.Element => {
  return (
    <section className="bg-[#0B0F19] pt-20 pb-24 px-6 border-b border-gray-900">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-400 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-8 border border-indigo-500/20">
          <Zap size={14} /> Instant Download
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-8">
          Premium assets for <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            modern creators.
          </span>
        </h1>

        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Stop reinventing the wheel. Get high-quality templates, UI kits, and
          documents to accelerate your workflow. Secure. Instant. Lifetime
          access.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-900/50 h-auto" aria-label="Explore products">
            Explore Products
          </Button>
          <div className="flex items-center gap-2 text-gray-500 text-sm font-medium px-6">
            <ShieldCheck size={18} className="text-green-500" />
            Secure Payment & Delivery
          </div>
        </div>
      </div>
    </section>
  );
};
