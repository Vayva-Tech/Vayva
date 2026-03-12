"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, Globe, Users, Calendar, ArrowRight } from "lucide-react";

interface NavbarProps {
  transparent?: boolean;
}

export function Navbar({ transparent = false }: NavbarProps) {
  const pathname = usePathname();
  
  const bgClass = transparent 
    ? "bg-transparent" 
    : "bg-white border-b";

  return (
    <nav className={`${bgClass} sticky top-0 z-50`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">HopeRise</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className={pathname === "/" ? "text-rose-600 font-medium" : "text-gray-600 hover:text-gray-900"}>Home</Link>
            <Link href="/hotels" className={pathname === "/hotels" ? "text-rose-600 font-medium" : "text-gray-600 hover:text-gray-900"}>Hotels</Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-900">About</Link>
            <Link href="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link>
          </div>
          <Link href="/donate" className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600">
            Donate Now
          </Link>
        </div>
      </div>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">HopeRise</span>
            </div>
            <p className="text-gray-400 text-sm">
              Making a difference in communities worldwide through charitable giving and volunteer work.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Programs</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/education" className="hover:text-white">Education</Link></li>
              <li><Link href="/healthcare" className="hover:text-white">Healthcare</Link></li>
              <li><Link href="/housing" className="hover:text-white">Housing</Link></li>
              <li><Link href="/food" className="hover:text-white">Food Security</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Get Involved</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/donate" className="hover:text-white">Donate</Link></li>
              <li><Link href="/volunteer" className="hover:text-white">Volunteer</Link></li>
              <li><Link href="/partner" className="hover:text-white">Partner</Link></li>
              <li><Link href="/events" className="hover:text-white">Events</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>hello@hoperise.org</li>
              <li>1-800-HOPE-01</li>
              <li>123 Charity Lane</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
          © 2024 HopeRise. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export { Heart, Home, Globe, Users, Calendar, ArrowRight };
