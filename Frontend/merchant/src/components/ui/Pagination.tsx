/**
 * Pagination Component
 * 
 * Unified pagination with consistent design across all dashboard pages.
 * Supports both client-side and server-side pagination patterns.
 * 
 * Features:
 * - Consistent design system (rounded-xl, emerald accents)
 * - Responsive layout (mobile-friendly)
 * - Keyboard navigation support
 * - Optional scroll-to-top on page change
 * - Accessible (ARIA labels, focus states)
 */

'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@vayva/ui';
import { cn } from '@/lib/utils';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  scrollToTop?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  scrollToTop = true,
  size = 'md',
  className,
}: PaginationProps) {
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    
    onPageChange(page);
    
    if (scrollToTop) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = size === 'sm' ? 3 : size === 'md' ? 5 : 7;
    
    if (totalPages <= maxVisible) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);
      
      // Show ellipsis after first page if needed
      if (currentPage > 3) {
        pages.push('...');
      }
      
      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Show ellipsis before last page if needed
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      // Show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  const buttonSizes = {
    sm: 'h-8 px-2.5',
    md: 'h-9 px-3',
    lg: 'h-10 px-4',
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 18,
  };

  return (
    <nav 
      className={cn('flex items-center justify-center gap-1', className)}
      aria-label="Pagination"
    >
      {/* Previous button */}
      <Button
        variant="outline"
        size={size}
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={cn(
          'min-w-[44px] rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2',
          buttonSizes[size]
        )}
        aria-label={`Go to previous page, page ${currentPage - 1}`}
        aria-disabled={currentPage === 1}
      >
        <ChevronLeft size={iconSizes[size]} />
      </Button>

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {getPageNumbers().map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="flex items-center justify-center w-9 text-sm text-gray-400"
                aria-hidden="true"
              >
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isActive = pageNum === currentPage;

          return (
            <Button
              key={pageNum}
              variant={isActive ? 'default' : 'outline'}
              size={size}
              onClick={() => handlePageChange(pageNum)}
              className={cn(
                'min-w-[44px] rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2',
                buttonSizes[size],
                isActive
                  ? 'bg-green-500 hover:bg-green-600 text-white border-green-500'
                  : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
              )}
              aria-label={`Go to page ${pageNum}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {pageNum}
            </Button>
          );
        })}
      </div>

      {/* Next button */}
      <Button
        variant="outline"
        size={size}
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={cn(
          'min-w-[44px] rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2',
          buttonSizes[size]
        )}
        aria-label={`Go to next page, page ${currentPage + 1}`}
        aria-disabled={currentPage === totalPages}
      >
        <ChevronRight size={iconSizes[size]} />
      </Button>
    </nav>
  );
}

/**
 * Compact Pagination for mobile/tablet
 */
export function CompactPagination({
  currentPage,
  totalPages,
  onPageChange,
  scrollToTop = true,
}: Omit<PaginationProps, 'size' | 'className'>) {
  return (
    <div className="flex items-center justify-between gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </Button>

      <span className="text-sm text-gray-600">
        Page {currentPage} of {totalPages}
      </span>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </Button>
    </div>
  );
}
