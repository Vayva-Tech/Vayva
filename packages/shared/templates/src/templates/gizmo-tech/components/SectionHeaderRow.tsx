import React from "react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface SectionHeaderRowProps {
  title: string;
  actionHref?: string;
  description?: string;
}

export const SectionHeaderRow = ({
  title,
  actionHref,
  description,
}: SectionHeaderRowProps) => {
  return (
    <div className="flex items-end justify-between px-4 py-6">
      <div>
        <h3 className="text-xl font-bold text-[#0B0F19] tracking-tight">
          {title}
        </h3>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
      {actionHref && (
        <Link
          href={actionHref}
          className="flex items-center text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
        >
          See All <ChevronRight size={14} />
        </Link>
      )}
    </div>
  );
};
