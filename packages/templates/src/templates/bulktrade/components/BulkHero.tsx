import React from "react";
import { ShieldCheck, Factory, Globe } from "lucide-react";

interface BulkHeroProps {
  storeName?: string;
}

export const BulkHero = ({ storeName }: BulkHeroProps): React.JSX.Element => {
  return (
    <section className="bg-[#0F172A] text-white py-16 md:py-24 px-6 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>

      <div className="max-w-7xl mx-auto relative z-10 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-blue-900/50 border border-blue-800 text-blue-200 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-8">
            <ShieldCheck size={14} /> Verified Supplier • Est. 1998
          </div>

          <h2 className="text-5xl md:text-6xl font-black tracking-tight leading-[1.1] mb-6">
            Source Industrial <br />
            <span className="text-blue-500">Materials at Scale.</span>
          </h2>

          <p className="text-lg text-gray-400 mb-8 max-w-lg leading-relaxed">
            Direct from manufacturer pricing. Minimum Order Quantities apply.
            Join 2,500+ businesses sourcing from {storeName}.
          </p>

          <div className="flex flex-wrap gap-8 pt-8 border-t border-gray-800">
            <div>
              <p className="text-3xl font-black text-white">50k+</p>
              <p className="text-xs text-gray-500 font-bold uppercase mt-1">
                Products Shipped
              </p>
            </div>
            <div>
              <p className="text-3xl font-black text-white">24h</p>
              <p className="text-xs text-gray-500 font-bold uppercase mt-1">
                Quote Response
              </p>
            </div>
            <div>
              <p className="text-3xl font-black text-white">0%</p>
              <p className="text-xs text-gray-500 font-bold uppercase mt-1">
                Hidden Fees
              </p>
            </div>
          </div>
        </div>

        {/* Right Visual test */}
        <div className="hidden md:grid grid-cols-2 gap-4 opacity-80">
          <div className="space-y-4 translate-y-8">
            <div className="bg-[#1E293B] p-6 rounded-xl border border-gray-700">
              <Factory className="text-blue-500 mb-4" size={32} />
              <h3 className="font-bold text-lg">Direct Sourcing</h3>
              <p className="text-sm text-gray-400 mt-2">
                No middlemen. Get factory floor pricing on all bulk orders.
              </p>
            </div>
            <div className="bg-[#1E293B] p-6 rounded-xl border border-gray-700">
              <Globe className="text-green-500 mb-4" size={32} />
              <h3 className="font-bold text-lg">Global Logistics</h3>
              <p className="text-sm text-gray-400 mt-2">
                We handle customs, freight, and last-mile delivery.
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-[#1E293B] p-6 rounded-xl border border-gray-700 h-full flex flex-col justify-center">
              <div className="text-4xl font-black text-white mb-2">B2B</div>
              <p className="text-sm text-gray-400">
                Optimized for wholesale, complete with invoicing and negotiation
                tools.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
