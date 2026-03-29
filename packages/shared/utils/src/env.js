"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainEnvSchema = void 0;
exports.validateDomainConsistency = validateDomainConsistency;
exports.parseEnv = parseEnv;
const zod_1 = require("zod");
exports.DomainEnvSchema = zod_1.z.object({
    MARKETING_ORIGIN: zod_1.z.string().url().default("https://www.vayva.ng"),
    MERCHANT_ORIGIN: zod_1.z.string().url().default("https://merchant.vayva.ng"),
    OPS_ORIGIN: zod_1.z.string().url().default("https://ops.vayva.ng"),
    STOREFRONT_ROOT_DOMAIN: zod_1.z.string().default("vayva.ng"),
});
function stripMarketingWww(hostname) {
    return hostname.replace(/^www\./i, "");
}
function validateDomainConsistency(env) {
    // Skip domain pattern checks in development and CI (localhost doesn't match production patterns)
    if (process.env.NODE_ENV !== "production" || process.env.CI)
        return;
    const marketingHost = new URL(env.MARKETING_ORIGIN).hostname;
    const merchantHost = new URL(env.MERCHANT_ORIGIN).hostname;
    const opsHost = new URL(env.OPS_ORIGIN).hostname;
    const rootHost = stripMarketingWww(env.STOREFRONT_ROOT_DOMAIN.replace(/^https?:\/\//i, "").split("/")[0] ?? "");
    if (stripMarketingWww(marketingHost) !== rootHost) {
        throw new Error(`MARKETING_ORIGIN host (${marketingHost}) must match STOREFRONT_ROOT_DOMAIN (${env.STOREFRONT_ROOT_DOMAIN}) (www is allowed)`);
    }
    if (!merchantHost.startsWith("merchant.")) {
        throw new Error(`MERCHANT_ORIGIN host (${merchantHost}) must start with "merchant."`);
    }
    if (!opsHost.startsWith("ops.")) {
        throw new Error(`OPS_ORIGIN host (${opsHost}) must start with "ops."`);
    }
}
function parseEnv(schema, rawEnv = process.env) {
    const result = schema.safeParse(rawEnv);
    if (!result.success) {
        const details = result.error.issues
            .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
            .join(", ");
        console.error("❌ Environment validation failed:", details);
        throw new Error(`Env validation failed: ${details}`);
    }
    return result.data;
}
//# sourceMappingURL=env.js.map