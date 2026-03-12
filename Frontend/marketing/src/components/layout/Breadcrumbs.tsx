// Breadcrumbs component
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbsProps {
  items?: { label: string; href: string }[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const pathname = usePathname();
  
  if (items) {
    return (
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
        {items.map((item, index) => (
          <React.Fragment key={item.href}>
            {index > 0 && <ChevronRight className="h-4 w-4" />}
            <Link href={item.href} className="hover:text-foreground">
              {item.label}
            </Link>
          </React.Fragment>
        ))}
      </nav>
    );
  }

  // Auto-generate from pathname
  const segments = pathname?.split('/').filter(Boolean) || [];
  
  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
      <Link href="/" className="hover:text-foreground">
        <Home className="h-4 w-4" />
      </Link>
      {segments.map((segment, index) => {
        const href = '/' + segments.slice(0, index + 1).join('/');
        return (
          <React.Fragment key={href}>
            <ChevronRight className="h-4 w-4" />
            <Link href={href} className="hover:text-foreground capitalize">
              {segment.replace(/-/g, ' ')}
            </Link>
          </React.Fragment>
        );
      })}
    </nav>
  );
}

export default Breadcrumbs;
