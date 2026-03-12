"use client";
import React from "react";

import { LocaleKey, LOCALES } from "@/data/locales";
import { CreditCard, Question as HelpCircle, SquaresFour as LayoutDashboard, SignOut as LogOut, MapPin, Faders as SlidersHorizontal } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@vayva/ui";

interface AccountNavProps {
  lang: LocaleKey;
}

export function AccountNav({ lang }: AccountNavProps): React.JSX.Element {
  const t = LOCALES[lang].account.nav;
  const pathname = usePathname();

  const navItems = [
    { href: `/${lang}/account`, label: t.overview, icon: LayoutDashboard },
    { href: `/${lang}/account/addresses`, label: t.addresses, icon: MapPin },
    { href: `/${lang}/account/payments`, label: t.payments, icon: CreditCard },
    { href: `/${lang}/account/help`, label: t.help, icon: HelpCircle },
  ];

  return (
    <nav className="space-y-1">
      {navItems.map((item: any) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
              isActive
                ? "bg-black text-white shadow-lg"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Icon size={20} />
            {item.label}
          </Link>
        );
      })}

      <Button
        variant="ghost"
        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-medium mt-4 h-auto"
        aria-label="Logout"
      >
        <LogOut size={20} />
        {t.logout}
      </Button>
    </nav>
  );
}
