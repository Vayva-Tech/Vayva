import React from "react";
import Image from "next/image";

export default function OpsAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 flex items-center justify-center p-4 overflow-hidden">
      {/* Subtle pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.1) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      
      {/* Decorative gradient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-200/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-teal-200/15 rounded-full blur-[80px]" />
      </div>

      {/* Logo watermark */}
      <div className="pointer-events-none absolute bottom-8 left-8 flex items-center gap-2 opacity-40">
        <Image
          src="/vayva-logo-official.svg"
          alt="Vayva"
          width={24}
          height={24}
          className="opacity-50"
        />
        <span className="text-sm font-medium text-slate-400">Vayva Operations</span>
      </div>

      <div className="relative z-10 w-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
