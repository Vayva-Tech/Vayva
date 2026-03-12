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
  sm: { width: 32, height: 32, text: "text-sm" },
  md: { width: 48, height: 48, text: "text-lg" },
  lg: { width: 64, height: 64, text: "text-2xl" },
};

export function Logo({
  size = "md",
  showText = true,
  text: logoText,
  href = "/",
  className = "",
}: LogoProps) {
  const { width, height, text } = sizeMap[size];

  const content = (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image
        src="/vayva-logo-official.svg"
        alt="Vayva Logo"
        width={width}
        height={height}
        className="object-contain"
      />
      {showText && (
        <span className={`font-bold tracking-tight text-black ${text}`}>
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
