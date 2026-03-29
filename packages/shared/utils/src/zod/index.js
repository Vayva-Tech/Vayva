"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantSchema = exports.PaginationSchema = exports.EnvSchema = void 0;
const zod_1 = require("zod");
exports.EnvSchema = zod_1.z.object({
    DATABASE_URL: zod_1.z.string().url(),
    REDIS_URL: zod_1.z.string().url(),
    PORT: zod_1.z.string().optional().default("4000"),
    NODE_ENV: zod_1.z
        .enum(["development", "production", "test"])
        .default("development"),
});
exports.PaginationSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().min(1).default(1),
    limit: zod_1.z.coerce.number().min(1).max(100).default(20),
});
exports.TenantSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    slug: zod_1.z.string().min(2),
});
//# sourceMappingURL=index.js.map