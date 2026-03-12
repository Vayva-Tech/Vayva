"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Layers,
  BookOpen,
  Heart,
  Calendar,
  MessageSquare,
  Users,
  Award,
  Briefcase,
  FileText,
  Download,
  ShoppingBag,
  Hexagon,
} from "lucide-react";

const mainNavItems = [
  { name: "Browse", href: "/browse", icon: Compass },
  { name: "Programs", href: "/programs", icon: Layers },
  { name: "Courses", href: "/courses", icon: BookOpen },
  { name: "My Favorites", href: "/favorites", icon: Heart },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Forum", href: "/forum", icon: MessageSquare },
  { name: "Mentors", href: "/mentors", icon: Users },
  { name: "Students", href: "/students", icon: Users },
  { name: "Challenges", href: "/challenges", icon: Award },
  { name: "Workshops", href: "/workshops", icon: Briefcase },
];

const resourceNavItems = [
  { name: "Materials", href: "/materials", icon: FileText },
  { name: "Assets library", href: "/assets", icon: Layers },
  { name: "Downloads", href: "/downloads", icon: Download },
  { name: "Store", href: "/store", icon: ShoppingBag },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[240px] bg-white border-r border-gray-200 overflow-y-auto z-40">
      {/* Logo */}
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <Hexagon className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900">Onetica</span>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="px-3 pb-4">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={isActive ? "sidebar-link-active" : "sidebar-link"}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-4 my-2 h-px bg-gray-200" />

      {/* Resources Navigation */}
      <nav className="px-3 py-2">
        {resourceNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={isActive ? "sidebar-link-active" : "sidebar-link"}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
