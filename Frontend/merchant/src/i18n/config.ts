import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";

// Supported locales for Nigerian market
export const locales = ["en", "ha", "yo", "ig"] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ locale }: { locale: string }) => {
  // Validate that the incoming locale is valid
  if (!locales.includes(locale as Locale)) notFound();

  // Load messages for the locale
  return {
    messages: (await import(`./messages/${locale}.json`)).default,
    timeZone: "Africa/Lagos",
    now: new Date(),
  };
});
