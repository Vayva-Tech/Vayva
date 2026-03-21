/* eslint-disable no-console */
import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" || process.env.NEXT_RUNTIME === "edge") {
    // Initialize Sentry for server-side and edge runtime
    Sentry.init({
      dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 1.0,
      debug: false,
    });

    /* console.log("🚀 Starting Vayva Platform (Merchant Admin)..."); */
    // 1. Force Env Validation
    // We import it dynamically to ensure it runs during registration
    await import("./env");
    const { FEATURES } = await import("@/lib/config/features");
    /* console.log("✅ Environment Validated") */;
    // 2. Log Critical Features
    const critical = [
      { name: "Payments", status: FEATURES.PAYMENTS_ENABLED },
      { name: "Email", status: FEATURES.EMAIL_ENABLED },
      { name: "Storage", status: FEATURES.STORAGE_ENABLED },
    ];
    /* console.log("📊 Feature Status:") */;
    critical.forEach((f) => {
      /* console.log(`  - ${f.name}: ${f.status ? "✅" : "❌"}`); */
    });
    // 3. Production warnings (do not hard-crash)
    if (
      process.env.NODE_ENV === "production" &&
      process.env.VAYVA_E2E_MODE !== "true"
    ) {
      if (!FEATURES.PAYMENTS_ENABLED || !FEATURES.EMAIL_ENABLED) {
        /* console.warn(
          "⚠️  Payments or Email is disabled in production. Related UI/features should be hidden/guarded.",
        ) */;
      }
    }
  }
}
