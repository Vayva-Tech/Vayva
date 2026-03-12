import React from "react";
import Image from "next/image";

export default function Loading(): React.JSX.Element {
  return (
    <div className="fixed inset-0 bg-background z-[9999] flex flex-col items-center justify-center gap-8">
      {/* Pulsing logo */}
      <div className="relative">
        <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping"></div>
        <Image
          src="/vayva-logo-official.svg"
          alt="Vayva"
          width={217}
          height={150}
          className="w-16 h-auto relative animate-pulse"
          priority
        />
      </div>
      {/* Bouncing dots */}
      <div className="flex gap-2">
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
      </div>
    </div>
  );
}
