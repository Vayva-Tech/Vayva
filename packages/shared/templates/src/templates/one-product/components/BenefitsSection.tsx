import React from "react";
import { Battery, Zap, VolumeX, CheckCircle, Shield } from "lucide-react";

interface BenefitsProps {
  benefits: { icon: string; title: string; description: string }[];
}

const IconMap: Record<string, any> = {
  battery: Battery,
  zap: Zap,
  "volume-x": VolumeX,
  shield: Shield,
  check: CheckCircle,
};

export const BenefitsSection = ({
  benefits,
}: BenefitsProps): React.JSX.Element => {
  return (
    <section id="features" className="py-20 bg-background/40 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-[#16A34A] font-bold uppercase tracking-wider text-xs mb-2 block">
            Why Choose Vayva
          </span>
          <h2 className="text-3xl font-black text-gray-900">
            Thoughtfully Designed for You
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, idx) => {
            const Icon = IconMap[benefit.icon] || CheckCircle;
            return (
              <div
                key={idx}
                className="bg-transparent p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow"
              >
                <div className="w-14 h-14 bg-background/50 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6 text-gray-900">
                  <Icon size={28} />
                </div>
                <h3 className="font-bold text-xl mb-3 text-gray-900">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
