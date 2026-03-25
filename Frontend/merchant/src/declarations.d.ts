declare module "uuid";

declare module "@vayva/redis";

declare module "workbox-core" {
  export function precacheAndRoute(entries: unknown): void;
  export function cleanupOutdatedCaches(): void;
}

declare module "workbox-routing" {
  export function registerRoute(
    match: unknown,
    handler: unknown,
    method?: string,
  ): void;
}

declare module "workbox-strategies" {
  export class NetworkFirst {
    constructor(options?: Record<string, unknown>);
  }
  export class StaleWhileRevalidate {
    constructor(options?: Record<string, unknown>);
  }
  export class CacheFirst {
    constructor(options?: Record<string, unknown>);
  }
}

declare module "workbox-expiration" {
  export class ExpirationPlugin {
    constructor(options?: Record<string, unknown>);
  }
}

declare module "workbox-background-sync" {
  export class BackgroundSyncPlugin {
    constructor(name: string, options?: Record<string, unknown>);
  }
}
