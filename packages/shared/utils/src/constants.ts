export const APP_NAME = "Vayva";
export const DEFAULT_CURRENCY = "NGN";
export const DEFAULT_LOCALE = "en-NG";

/**
 * `FeatureFlag.key` (Prisma). Ops Console → Feature Flags: toggle **enabled** on this row.
 * When **on** (default if row missing): Starter “first month free” (~30 days, signup / no Paystack for monthly).
 * When **off**: 7-day trial messaging and paid Starter monthly at checkout.
 */
export const FEATURE_FLAG_STARTER_FIRST_MONTH_FREE = "STARTER_FIRST_MONTH_FREE";
