import React from "react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface SectionHeaderProps {
  title: string;
  actionHref?: string;
}

export const SectionHeader = ({ title, actionHref }: SectionHeaderProps): React.JSX.Element => {
  return (
    <div className="flex items-center justify-between px-4 py-4 mt-4">
      <h3 className="text-lg font-bold text-[#111111] capitalize">{title}</h3>
      {actionHref && (
        <Link
          href={actionHref}
          className="flex items-center text-xs font-medium text-gray-500 hover:text-black transition-colors"
        >
          View All <ChevronRight size={14} />
        </Link>
      )}
    </div>
  );
};
