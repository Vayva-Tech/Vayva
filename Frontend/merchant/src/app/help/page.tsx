import { redirect } from "next/navigation";
import { urls } from "@vayva/shared";

/**
 * Merchant `/help` — marketing site hosts the help center; keep a stable URL on this domain.
 */
export default function MerchantHelpPage() {
  const base = urls.marketingBase().replace(/\/$/, "");
  redirect(`${base}/help`);
}
