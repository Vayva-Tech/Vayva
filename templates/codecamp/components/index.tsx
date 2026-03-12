"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Code, Play, Terminal, BookOpen, Users, Star, ArrowRight } from "lucide-react";

interface NavbarProps {
  transparent?: boolean;
}

export function Navbar({ transparent = false }: NavbarProps) {
  const pathname = usePathname();
  
  const bgClass = transparent 
    ? "bg-transparent" 
    : "bg-dark-900 border-b border-dark-700";

  return (
    <nav className={`${bgClass} sticky top-0 z-50`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-primary-500">CodeCamp</Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/tracks" className={pathname === "/tracks" ? "text-white font-medium" : "text-gray-300 hover:text-white"}>Tracks</Link>
            <Link href="/tutorials" className={pathname === "/tutorials" ? "text-white font-medium" : "text-gray-300 hover:text-white"}>Tutorials</Link>
            <Link href="/pricing" className={pathname === "/pricing" ? "text-white font-medium" : "text-gray-300 hover:text-white"}>Pricing</Link>
            <Link href="/community" className={pathname === "/community" ? "text-white font-medium" : "text-gray-300 hover:text-white"}>Community</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-gray-300 hover:text-white">Sign In</Link>
            <Link href="/auth/signup" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500">Start Free Trial</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="bg-dark-900 border-t border-dark-700 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <Link href="/" className="text-xl font-bold text-primary-500 mb-4 block">CodeCamp</Link>
            <p className="text-gray-400 text-sm">
              Master coding with interactive courses and real-world projects.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Learn</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/tracks" className="hover:text-white">Learning Tracks</Link></li>
              <li><Link href="/tutorials" className="hover:text-white">Tutorials</Link></li>
              <li><Link href="/courses" className="hover:text-white">Courses</Link></li>
              <li><Link href="/challenges" className="hover:text-white">Challenges</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Community</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/community" className="hover:text-white">Forum</Link></li>
              <li><Link href="/mentors" className="hover:text-white">Mentors</Link></li>
              <li><Link href="/events" className="hover:text-white">Events</Link></li>
              <li><Link href="/discord" className="hover:text-white">Discord</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/about" className="hover:text-white">About</Link></li>
              <li><Link href="/careers" className="hover:text-white">Careers</Link></li>
              <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-dark-700 pt-8 text-center text-sm text-gray-400">
          © 2024 CodeCamp. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export { Code, Play, Terminal, BookOpen, Users, Star, ArrowRight };
