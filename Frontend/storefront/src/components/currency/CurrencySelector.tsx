"use client";
import { Button } from "@vayva/ui";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Globe, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  isDefault?: boolean;
}

interface CurrencySelectorProps {
  currencies?: Currency[];
  selectedCurrency?: string;
  onSelect?: (currency: Currency) => void;
  className?: string;
  variant?: "default" | "compact" | "minimal";
  showLabel?: boolean;
}

const DEFAULT_CURRENCIES: Currency[] = [
  { code: "NGN", name: "Nigerian Naira", symbol: "₦", flag: "🇳🇬", isDefault: true },
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸" },
  { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧" },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺" },
  { code: "GHS", name: "Ghana Cedi", symbol: "₵", flag: "🇬🇭" },
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh", flag: "🇰🇪" },
  { code: "ZAR", name: "South African Rand", symbol: "R", flag: "🇿🇦" },
];

export function CurrencySelector({
  currencies = DEFAULT_CURRENCIES,
  selectedCurrency,
  onSelect,
  className,
  variant = "default",
  showLabel = true,
}: CurrencySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<Currency>(
    currencies.find((c) => c.code === selectedCurrency) ||
      currencies.find((c) => c.isDefault) ||
      currencies[0]
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update selected when prop changes
  useEffect(() => {
    if (selectedCurrency) {
      const currency = currencies.find((c) => c.code === selectedCurrency);
      if (currency) queueMicrotask(() => setSelected(currency));
    }
  }, [selectedCurrency, currencies]);

  const handleSelect = (currency: Currency) => {
    setSelected(currency);
    setIsOpen(false);
    onSelect?.(currency);
  };

  if (variant === "minimal") {
    return (
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-1 text-sm hover:opacity-80 transition-opacity",
          className
        )}
      >
        <span>{selected.flag}</span>
        <span className="font-medium">{selected.code}</span>
        <ChevronDown className="w-3 h-3" />
      </Button>
    );
  }

  if (variant === "compact") {
    return (
      <div ref={dropdownRef} className={cn("relative", className)}>
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 bg-white border rounded-full hover:border-gray-400 transition-colors"
        >
          <span className="text-lg">{selected.flag}</span>
          <span className="font-medium text-sm">{selected.code}</span>
          <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
        </Button>

        {isOpen && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2 z-50">
            {currencies.map((currency) => (
              <Button
                key={currency.code}
                onClick={() => handleSelect(currency)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors",
                  selected.code === currency.code && "bg-emerald-50"
                )}
              >
                <span className="text-lg">{currency.flag}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{currency.code}</p>
                  <p className="text-xs text-gray-500">{currency.name}</p>
                </div>
                {selected.code === currency.code && (
                  <Check className="w-4 h-4 text-emerald-600" />
                )}
              </Button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      {showLabel && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          <Globe className="w-4 h-4 inline mr-1.5" />
          Currency
        </label>
      )}

      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center gap-3 px-4 py-3 bg-white border rounded-lg",
          "hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20",
          "transition-all",
          isOpen && "border-emerald-500 ring-2 ring-emerald-500/20"
        )}
      >
        <span className="text-2xl">{selected.flag}</span>
        <div className="flex-1 text-left">
          <p className="font-medium">{selected.code}</p>
          <p className="text-sm text-gray-500">{selected.name}</p>
        </div>
        <ChevronDown className={cn("w-5 h-5 text-gray-400 transition-transform", isOpen && "rotate-180")} />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border py-2 z-50 max-h-72 overflow-auto">
          {currencies.map((currency) => (
            <Button
              key={currency.code}
              onClick={() => handleSelect(currency)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors",
                selected.code === currency.code && "bg-emerald-50"
              )}
            >
              <span className="text-2xl">{currency.flag}</span>
              <div className="flex-1">
                <p className="font-medium">{currency.code}</p>
                <p className="text-sm text-gray-500">{currency.name}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">{currency.symbol}</p>
              </div>
              {selected.code === currency.code && (
                <Check className="w-5 h-5 text-emerald-600" />
              )}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

// Price display component that shows converted price
interface PriceDisplayProps {
  amount: number;
  currency: string;
  convertedAmount?: number;
  convertedCurrency?: string;
  showOriginal?: boolean;
  className?: string;
}

export function PriceDisplay({
  amount,
  currency,
  convertedAmount,
  convertedCurrency,
  showOriginal = true,
  className,
}: PriceDisplayProps) {
  const formatPrice = (value: number, code: string) => {
    const symbols: Record<string, string> = {
      NGN: "₦",
      USD: "$",
      GBP: "£",
      EUR: "€",
      GHS: "₵",
      KES: "KSh",
      ZAR: "R",
    };

    const symbol = symbols[code] || code;
    const divisor = code === "XOF" ? 1 : 100;
    const formatted = (value / divisor).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return `${symbol}${formatted}`;
  };

  return (
    <div className={cn("inline-flex flex-col", className)}>
      {convertedAmount && convertedCurrency && convertedCurrency !== currency ? (
        <>
          <span className="font-semibold">
            {formatPrice(convertedAmount, convertedCurrency)}
          </span>
          {showOriginal && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(amount, currency)}
            </span>
          )}
        </>
      ) : (
        <span className="font-semibold">{formatPrice(amount, currency)}</span>
      )}
    </div>
  );
}

export default CurrencySelector;

