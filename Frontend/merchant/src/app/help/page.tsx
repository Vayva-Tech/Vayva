import { urls } from "@vayva/shared";
import { redirect } from "next/navigation";

/**
 * Redirect /help to marketing help center
 */
export default function HelpRedirect(): never {
  const marketingBase = urls.marketingBase();
  redirect(`${marketingBase}/help`);
}
