"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { LOCALES } from "@/data/locales";
import { CreditCard, HelpCircle, LayoutDashboard, LogOut, MapPin, } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@vayva/ui";
export function AccountNav({ lang }) {
    const t = LOCALES[lang].account.nav;
    const pathname = usePathname();
    const navItems = [
        { href: `/${lang}/account`, label: t.overview, icon: LayoutDashboard },
        { href: `/${lang}/account/addresses`, label: t.addresses, icon: MapPin },
        { href: `/${lang}/account/payments`, label: t.payments, icon: CreditCard },
        { href: `/${lang}/account/help`, label: t.help, icon: HelpCircle },
    ];
    return (_jsxs("nav", { className: "space-y-1", children: [navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (_jsxs(Link, { href: item.href, className: `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive
                        ? "bg-black text-white shadow-lg"
                        : "text-gray-600 hover:bg-gray-100"}`, children: [_jsx(Icon, { size: 20 }), item.label] }, item.href));
            }), _jsxs(Button, { variant: "ghost", className: "w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-medium mt-4 h-auto", "aria-label": "Logout", children: [_jsx(LogOut, { size: 20 }), t.logout] })] }));
}
