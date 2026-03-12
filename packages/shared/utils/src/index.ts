export * from "./zod";
export * from "./env";
export * from "./constants";
export * from "./types";
export * from "./api/types";
export * from "./api/response";
export * from "./api/error-handling";
export * from "./queues";
// Redis moved to @vayva/redis package (server-only)
export { NOTIFICATION_REGISTRY } from "./notifications/registry";
export type {
  NotificationMetadata,
  NotificationType,
} from "./notifications/registry";
export * from "./logger";
export * from "./api/errors";
// NotificationManager removed - it uses Prisma and must be imported directly in server-side code only
// Import from "@vayva/shared/notifications/manager" in API routes if needed
export * from "./brand";
export * from "./extensions/types";
export * from "./extensions/manifest-fetcher";

export * from "./urls";
export * from "./utils/payment-state";
export * from "./utils/format";
export * from "./kyc-state-machine";
export * from "./templates/registry";
export * from "./templates/starter-kit";
export * from "./commerce-blocks/registry";
export type RetailMetadata = any;

// SERVER-ONLY MODULES - Import directly in API routes
// rateLimit uses ioredis (Node-only) and cannot be bundled for the browser
// Import from "@vayva/shared/rateLimit" in server-side code only

// SERVER-ONLY SERVICES - Import directly in API routes
// These services use Prisma and cannot be used in client components
// Import from "@vayva/shared/wallet-service" etc. in server-side code only
// export * from "./wallet-service";
// export * from "./order-core-service";
// export * from "./cart-service";
// export * from "./china-sync-service";
