import Image from "next/image";
import Link from "next/link";

export interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  text?: string;
  href?: string;
  className?: string;
}

const sizeMap = {
  sm: { logo: "w-8", text: "text-sm" },
  md: { logo: "w-10", text: "text-xl" },
  lg: { logo: "w-14", text: "text-2xl" },
};

export function Logo({
  size = "md",
  showText = true,
  text: logoText,
  href = "/",
  className = "",
}: LogoProps) {
  const { logo, text } = sizeMap[size];

  const content = (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image
        src="/vayva-logo-official.svg"
        alt="Vayva Logo"
        width={217}
        height={150}
        className={`${logo} h-auto object-contain`}
      />
      {showText && (
        <span className={`font-bold tracking-tight text-black ${text}`}>
          {logoText || "Merchant"}
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
