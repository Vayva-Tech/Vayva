import React from "react";
import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  text?: string;
  href?: string;
  className?: string;
}

const sizeMap = {
  sm: { logo: "w-9", text: "text-base" },
  md: { logo: "w-10", text: "text-xl" },
  lg: { logo: "w-14", text: "text-2xl" },
};

export function Logo({
  size = "md",
  showText = true,
  text: logoText,
  href = "/",
  className = "",
}: LogoProps): React.JSX.Element {
  const { logo, text } = sizeMap[size];

  const content = (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image
        src="/vayva-logo-official.svg"
        alt="Vayva - E-commerce Platform for Modern Businesses"
        width={217}
        height={150}
        className={`${logo} h-auto object-contain`}
        priority
      />
      {showText && (
        <span className={`font-bold tracking-tight text-[#0B0B0B] ${text}`}>
          {logoText || "Vayva"}
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="flex items-center">
        {content}
      </Link>
    );
  }

  return content;
}
