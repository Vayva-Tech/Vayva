"use client";

import { usePathname } from "next/navigation";
import { useIndustry } from "@/hooks/useIndustry";
import { isRouteAllowedForIndustry } from "@/lib/industry/allowed-routes";
import { PageEmpty } from "./PageEmpty";
import { Lock } from "@phosphor-icons/react/ssr";

interface IndustryGuardProps {
  children: React.ReactNode;
}

/**
 * Wraps dashboard content and blocks access to industry-specific routes
 * that don't belong to the merchant's configured industry.
 *
 * Example: A "food" merchant visiting /dashboard/vehicles will see
 * a "not available" message instead of a broken/empty page.
 */
export function IndustryGuard({ children }: IndustryGuardProps) {
  const pathname = usePathname();
  const { industrySlug, displayName } = useIndustry();

  const allowed = isRouteAllowedForIndustry(pathname, industrySlug);

  if (!allowed) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <PageEmpty
          icon={Lock}
          title="Page not available"
          description={`This page isn't part of the ${displayName} dashboard. If you need access, you can change your industry in Settings.`}
          actionLabel="Go to Settings"
          actionHref="/dashboard/settings/industry"
        />
      </div>
    );
  }

  return <>{children}</>;
}
