"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NOTIFICATION_REGISTRY = void 0;
__exportStar(require("./zod"), exports);
__exportStar(require("./env"), exports);
__exportStar(require("./constants"), exports);
__exportStar(require("./types"), exports);
__exportStar(require("./api/types"), exports);
__exportStar(require("./api/response"), exports);
__exportStar(require("./api/error-handling"), exports);
__exportStar(require("./queues"), exports);
// Redis moved to @vayva/redis package (server-only)
var registry_1 = require("./notifications/registry");
Object.defineProperty(exports, "NOTIFICATION_REGISTRY", { enumerable: true, get: function () { return registry_1.NOTIFICATION_REGISTRY; } });
__exportStar(require("./logger"), exports);
__exportStar(require("./api/errors"), exports);
// NotificationManager removed - it uses Prisma and must be imported directly in server-side code only
// Import from "@vayva/shared/notifications/manager" in API routes if needed
__exportStar(require("./brand"), exports);
__exportStar(require("./extensions/types"), exports);
__exportStar(require("./extensions/manifest-fetcher"), exports);
__exportStar(require("./urls"), exports);
__exportStar(require("./utils/payment-state"), exports);
__exportStar(require("./utils/format"), exports);
__exportStar(require("./kyc-state-machine"), exports);
__exportStar(require("./templates/registry"), exports);
__exportStar(require("./templates/starter-kit"), exports);
__exportStar(require("./commerce-blocks/registry"), exports);
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
//# sourceMappingURL=index.js.map