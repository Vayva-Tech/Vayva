"use client";

import Link from "next/link";
import { CaretRight, House } from "@phosphor-icons/react/ssr";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  return (
    <nav className={`flex items-center gap-2 text-sm ${className}`} aria-label="Breadcrumb">
      <Link
        href="/dashboard"
        className="flex items-center gap-1 text-text-tertiary hover:text-text-primary transition-colors"
      >
        <House className="h-4 w-4" />
        <span className="sr-only">Home</span>
      </Link>
      
      {items.map((item: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <CaretRight className="h-4 w-4 text-text-tertiary" />
          {item.href ? (
            <Link
              href={item.href}
              className="text-text-tertiary hover:text-text-primary transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-text-primary font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
