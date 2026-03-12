import * as Sentry from "@sentry/nextjs";
/**
 * Capture exceptions in Sentry
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function captureException(error: any, context: Record<string, unknown> | null | undefined) {
    // Always log to console for local visibility (handled by logger, but safety net)
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
        Sentry.captureException(error, context ? { extra: context as Record<string, unknown> } : undefined);
    }
}
/**
 * Set User Context safely (Avoid PII)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function setUserContext(user: any) {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
        Sentry.setUser({
            id: user.id,
            // PII like email is deliberately excluded
        });
        if (user.storeId)
            Sentry.setTag("store_id", user.storeId);
        if (user.role)
            Sentry.setTag("user_role", user.role);
    }
}
/**
 * Clear User Context
 */
export function clearUserContext() {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
        Sentry.setUser(null);
        Sentry.setTag("store_id", undefined);
    }
}
