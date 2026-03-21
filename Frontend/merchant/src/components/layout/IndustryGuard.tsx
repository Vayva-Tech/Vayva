// @ts-nocheck
"use client";

import { usePathname } from "next/navigation";
import { useIndustry } from "@/hooks/useIndustry";
import { useStore } from "@/context/StoreContext";
import { isRouteAllowed } from "@/lib/industry/allowed-routes";
import { PageEmpty } from "./PageEmpty";
import { Lock } from "@phosphor-icons/react/ssr";

interface IndustryGuardProps {
  children: React.ReactNode;
}

/**
 * Wraps dashboard content and blocks access to routes that are not allowed
 * based on the merchant's industry and enabled tools.
 *
 * Example: A "retail" merchant visiting /dashboard/courses will see
 * a "not available" message instead of a broken/empty page.
 */
export function IndustryGuard({ children }: IndustryGuardProps) {
  const pathname = usePathname();
  const { industrySlug, displayName } = useIndustry();
  const { store } = useStore();

  // Get enabled tools from store settings
  const settings = store?.settings as Record<string, unknown> | undefined;
  const enabledTools = settings?.enabledTools as string[] | undefined;

  const allowed = isRouteAllowed(pathname, industrySlug, enabledTools);

  if (!allowed) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <PageEmpty
          icon={Lock}
          title="Page not available"
          description={`This page isn't available in your current dashboard configuration. You may need to enable this tool in Settings, or change your industry.`}
          actionLabel="Go to Tools"
          actionHref="/dashboard/settings/tools"
        />
      </div>
    );
  }

  return <>{children}</>;
}
