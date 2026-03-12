import React from "react";
import { User, GraduationCap } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { Button } from "@vayva/ui";

interface EduHeaderProps {
  storeName?: string;
}

export const EduHeader = ({ storeName }: EduHeaderProps): React.JSX.Element => {
  return (
    <header className="sticky top-0 z-50 bg-transparent border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl text-gray-900"
        >
          <div className="bg-blue-600 text-white p-1.5 rounded-lg">
            <GraduationCap size={20} />
          </div>
          {storeName || "EduFlow"}
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-500">
          <Link href="#" className="hover:text-blue-600 transition-colors">
            All Courses
          </Link>
          <Link href="#" className="hover:text-blue-600 transition-colors">
            Instructors
          </Link>
          <Link href="#" className="hover:text-blue-600 transition-colors">
            Success Stories
          </Link>
        </nav>

        {/* Account */}
        <div className="flex items-center gap-3">
          <Link
            href="#"
            className="hidden sm:flex text-sm text-gray-500 hover:text-gray-900 font-medium"
          >
            My Learning
          </Link>
          <Button
            className="flex items-center gap-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors h-auto"
            aria-label="Go to dashboard"
          >
            <User size={16} /> Dashboard
          </Button>
        </div>
      </div>
    </header>
  );
};
