"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, Server, Globe, Shield, Clock, Users, ArrowRight, CheckCircle, Award, TrendingUp } from "lucide-react";

interface NavbarProps {
  transparent?: boolean;
}

export function Navbar({ transparent = false }: NavbarProps) {
  const pathname = usePathname();
  
  const bgClass = transparent 
    ? "bg-transparent" 
    : "bg-white border-b";
  
  const textClass = transparent
    ? "text-white"
    : "text-gray-600 hover:text-gray-900";

  return (
    <nav className={`${bgClass} sticky top-0 z-50`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">CloudHost</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/products" className={textClass}>Products</Link>
            <Link href="/pricing" className={pathname === "/pricing" ? "text-blue-600 font-medium" : textClass}>Pricing</Link>
            <Link href="/about" className={pathname === "/about" ? "text-blue-600 font-medium" : textClass}>About</Link>
            <Link href="/docs" className={textClass}>Docs</Link>
          </div>
          <Link href="/signup" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Get Started
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
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">CloudHost</span>
            </div>
            <p className="text-gray-400 text-sm">
              Cloud infrastructure that just works. Deploy in seconds, scale to millions.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/compute" className="hover:text-white">Compute</Link></li>
              <li><Link href="/storage" className="hover:text-white">Storage</Link></li>
              <li><Link href="/networking" className="hover:text-white">Networking</Link></li>
              <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/docs" className="hover:text-white">Documentation</Link></li>
              <li><Link href="/api" className="hover:text-white">API Reference</Link></li>
              <li><Link href="/status" className="hover:text-white">Status</Link></li>
              <li><Link href="/support" className="hover:text-white">Support</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/about" className="hover:text-white">About</Link></li>
              <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
              <li><Link href="/careers" className="hover:text-white">Careers</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
          © 2024 CloudHost. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export { Zap, Server, Globe, Shield, Clock, Users, ArrowRight, CheckCircle, Award, TrendingUp };
