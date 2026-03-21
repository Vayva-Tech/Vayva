import React from "react";
import { Button, Icon } from "@vayva/ui";

interface WhatsAppActionProps {
  phone: string;
  name?: string;
  message?: string;
  variant?: "primary" | "outline" | "ghost" | "icon";
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string; // Add className prop
}

export const WhatsAppAction = ({
  phone,
  name,
  message = "",
  variant = "primary",
  size = "md",
  label = "Message",
  className = "", // Deconstruct className
}: WhatsAppActionProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Clean phone number (strip spaces, ensure international format)
    // Test logic for Nigerian numbers
    let cleanPhone = phone.replace(/\s+/g, "").replace("+", "");
    if (cleanPhone.startsWith("0"))
      cleanPhone = "234" + cleanPhone.substring(1);

    const text = encodeURIComponent(
      message || `Hi ${name || "there"}, regarding your order...`,
    );
    const url = `https://wa.me/${cleanPhone}?text=${text}`;

    window.open(url, "_blank");
  };

  if (variant === "icon") {
    return (
      <Button
        variant="ghost"
        onClick={handleClick}
        className={`w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 transition-colors ${className} p-0`}
        title={`Message ${name || "Customer"}`}
      >
        <Icon name="MessageCircle" size={16} />
      </Button>
    );
  }

  return (
    <Button
      variant={
        variant === "primary"
          ? "primary"
          : variant === "outline"
            ? "outline"
            : "ghost"
      }
      size={
        size === "md" ? "default" : (size as "sm" | "icon" | "lg" | "default")
      }
      onClick={handleClick}
      className={`gap-2 ${variant === "primary" ? "bg-[#25D366] hover:bg-[#128C7E] text-white border-none" : "text-green-700 hover:text-green-800 hover:bg-green-50"} ${className}`}
    >
      <Icon name="MessageCircle" size={size === "sm" ? 14 : 16} />
      {label}
    </Button>
  );
};
