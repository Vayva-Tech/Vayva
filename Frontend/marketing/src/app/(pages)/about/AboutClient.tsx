"use client";

import React from "react";
import Link from "next/link";
import {
  IconWorld as Globe,
  IconShieldCheck as ShieldCheck,
  IconBolt as Zap,
  IconHeart as Heart,
} from "@tabler/icons-react";
import * as motion from "framer-motion/client";
import { PremiumButton } from "@/components/marketing/PremiumButton";
import { APP_URL } from "@/lib/constants";
import Image from "next/image";

export function AboutClient(): React.JSX.Element {
  return (
    <div className="relative overflow-hidden">
      {/* Section 1: Hero */}
      <section className="pt-16 pb-16 px-4 text-center">
        <div className="max-w-[1600px] mx-auto px-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold mb-8 tracking-tight leading-[1.1]"
          >
            Infrastructure for the
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-hover">
              Next Generation
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            We don't just build websites. We help businesses turn chaotic
            WhatsApp conversations into professional commerce engines that last.
          </motion.p>
        </div>
      </section>

      {/* Section 2: Why Vayva Exists */}
      <section className="py-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto space-y-10 leading-relaxed text-lg text-muted-foreground"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="h-0.5 w-12 bg-primary" />
            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              The Reality of African Commerce
            </h2>
          </div>
          <p>
            Commerce in Nigeria doesn't happen on static catalogs. It happens in
            conversations. It's human, fast-paced, and inherently social.
            Millions of businesses rely on WhatsApp to trade, but the platform
            wasn't built for operations.
          </p>
          <p>
            Orders get lost. Payments are risky. Logistics are a nightmare of
            manual coordination. This operational ceiling prevents local heroes
            from becoming global giants.
          </p>
          <div className="relative">
            <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-[34px] border-2 border-emerald-200/60" />
            <div className="relative p-8 surface-glass rounded-[32px] shadow-[0_20px_55px_rgba(15,23,42,0.12)] border-2 border-slate-900/10 overflow-hidden group">
              <p className="relative font-medium text-xl leading-relaxed italic text-foreground">
                "Vayva exists to remove this ceiling. We add the missing layer of
                structure, automation, and trust so you can operate professionally
                where your customers already are."
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-[1600px] mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 relative">
            <div className="absolute -inset-4 bg-gradient-to-tr from-green-100 to-blue-50 rounded-[40px] blur-2xl opacity-60"></div>
            <div className="relative rounded-[32px] overflow-hidden shadow-2xl border border-border aspect-[4/5]">
              <Image
                src="/images/nyamsi-fredrick.png"
                alt="Nyamsi Fredrick, Founder of Vayva"
                fill
                className="object-cover"
              />
            </div>
            {/* Name Badge */}
            <div className="absolute bottom-8 right-8 bg-background/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-border max-w-[200px]">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Founder
              </p>
              <p className="text-lg font-bold text-foreground">
                Nyamsi Fredrick
              </p>
            </div>
          </div>

          <div className="order-1 md:order-2 space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight leading-[1.1]">
              It started with two jobs.
            </h2>
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>
                Nyamsi Fredrick saw it everywhere. Friends, family, neighbors,
                everyone was working a standard 9 to 5 job, but it wasn't
                enough. The salary barely covered rent and feeding, let alone
                "maintenance".
              </p>
              <p>
                So, they took on side hustles. Selling clothes, electronics,
                food items on WhatsApp. But instead of freedom, they got stress.
              </p>
              <blockquote className="border-l-4 border-primary pl-6 italic text-muted-foreground font-medium my-8">
                "You close from your main job, tired. You check your phone, 50
                DMs. 'How much?' 'Send picture'. You reply everyone, manually
                send account number, wait for screenshot. It’s chaos. I built
                Vayva because I wanted to prove that African commerce doesn't
                have to be a struggle. It can be dignified."
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Mission Statement */}
      <section className="py-24 px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-sm font-black uppercase tracking-[0.3em] text-primary mb-10"
          >
            THE CORE MISSION
          </motion.h2>
          <motion.blockquote
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl font-bold leading-[1.1] tracking-tight"
          >
            Empower every business to{" "}
            <span className="text-muted-foreground">
              operate at the speed of chat
            </span>{" "}
            while maintaining the{" "}
            <span className="text-muted-foreground">rigor of a bank.</span>
          </motion.blockquote>
        </div>
      </section>

      {/* Section 4: Vision & Values */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-5 gap-12">
          <div className="lg:col-span-3">
            <h2 className="text-4xl md:text-5xl font-bold mb-8 text-foreground tracking-tight">
              Playing the Long Game.
            </h2>
            <div className="space-y-8 text-muted-foreground text-lg leading-relaxed">
              <p>
                We believe the future of commerce is conversational. The winners
                will be those who can bridge the gap between human connection
                and digital scale.
              </p>
              <p>
                Our focus is on markets where entrepreneurial energy is
                boundless but the digital rails are fragmented. We are building
                the infrastructure that thousands of businesses will rely on for
                decades.
              </p>
            </div>
          </div>

          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            {[
              {
                icon: Globe,
                label: "Pan-African",
                color: "text-green-500",
                bg: "bg-green-50",
              },
              {
                icon: Zap,
                label: "Real-Time",
                color: "text-blue-500",
                bg: "bg-blue-50",
                offset: true,
              },
              {
                icon: ShieldCheck,
                label: "Trusted",
                color: "text-purple-500",
                bg: "bg-purple-50",
              },
              {
                icon: Heart,
                label: "Human",
                color: "text-red-500",
                bg: "bg-red-50",
                offset: true,
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`relative ${item.offset ? "translate-y-8 lg:translate-y-12" : ""}`}
              >
                <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-[34px] border-2 border-emerald-200/60" />
                <div className="relative p-8 bg-white/80 backdrop-blur-sm rounded-[32px] border-2 border-slate-900/10 shadow-[0_18px_45px_rgba(15,23,42,0.12)] flex flex-col items-center justify-center text-center hover:-translate-y-1 transition-all duration-500">
                  <div
                    className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center mb-4 shadow-[0_12px_26px_rgba(15,23,42,0.12)]`}
                  >
                    <item.icon className={item.color} size={28} />
                  </div>
                  <div className="font-bold text-foreground">{item.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5: Pillars */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-foreground tracking-tight">
              Our Pillars
            </h2>
            <p className="text-muted-foreground mt-4">
              The principles that guide every line of code we ship.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Radical Simplicity",
                desc: "If it needs a manual, we've failed. We build for speed, clarity, and zero-learning curves.",
              },
              {
                title: "Ironclad Trust",
                desc: "Handling livelihoods is a privilege. Security and reliability are our foundation.",
              },
              {
                title: "Extreme Ownership",
                desc: "We don't just build tools; we solve problems. If a merchant is struggling, we own the fix.",
              },
            ].map((pillar, i) => (
              <div key={i} className="relative">
                <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-[42px] border-2 border-emerald-200/60" />
                <div className="relative p-10 rounded-[40px] bg-white/90 border-2 border-slate-900/10 shadow-[0_24px_60px_rgba(15,23,42,0.12)] hover:-translate-y-1 transition-all group">
                  <h3 className="text-xl font-bold mb-4 text-foreground group-hover:text-primary transition-colors">
                    {pillar.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6: CTA */}
      <section className="py-24 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-50/50 via-transparent to-transparent opacity-50" />
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="relative">
            <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-[46px] border-2 border-emerald-200/60" />
            <div className="relative rounded-[44px] border-2 border-slate-900/10 bg-white/85 backdrop-blur p-12 shadow-[0_30px_75px_rgba(15,23,42,0.12)]">
              <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-8 tracking-tight">
                Ready to build?
              </h2>
              <p className="text-muted-foreground mb-12 text-lg max-w-xl mx-auto">
                We're building the infrastructure that will power the next 10 years
                of commerce. Stop waiting, start shipping.
              </p>
              <Link href={`${APP_URL}/signup`}>
                <PremiumButton className="px-16 py-8 text-xl rounded-[24px]">
                  Create your free account
                </PremiumButton>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
