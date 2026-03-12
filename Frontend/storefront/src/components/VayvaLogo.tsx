import Image from "next/image";

interface VayvaLogoProps {
  variant?: "official" | "white";
  width?: number;
  height?: number;
  className?: string;
}

export const VayvaLogo = ({
  variant = "official",
  width = 100,
  height = 32,
  className = "",
}: VayvaLogoProps) => {
  const src = "/vayva-logo-official.svg";

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <Image src={src} alt="Vayva" fill className="object-contain" priority />
    </div>
  );
};
