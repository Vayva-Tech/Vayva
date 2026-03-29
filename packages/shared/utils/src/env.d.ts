import { z } from "zod";
export declare const DomainEnvSchema: z.ZodObject<{
    MARKETING_ORIGIN: z.ZodDefault<z.ZodString>;
    MERCHANT_ORIGIN: z.ZodDefault<z.ZodString>;
    OPS_ORIGIN: z.ZodDefault<z.ZodString>;
    STOREFRONT_ROOT_DOMAIN: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    MARKETING_ORIGIN: string;
    MERCHANT_ORIGIN: string;
    OPS_ORIGIN: string;
    STOREFRONT_ROOT_DOMAIN: string;
}, {
    MARKETING_ORIGIN?: string | undefined;
    MERCHANT_ORIGIN?: string | undefined;
    OPS_ORIGIN?: string | undefined;
    STOREFRONT_ROOT_DOMAIN?: string | undefined;
}>;
export type DomainEnv = z.infer<typeof DomainEnvSchema>;
export declare function validateDomainConsistency(env: DomainEnv): void;
type RawEnv = Record<string, string | undefined>;
export declare function parseEnv<TSchema extends z.ZodTypeAny>(schema: TSchema, rawEnv?: RawEnv): z.infer<TSchema>;
export {};
//# sourceMappingURL=env.d.ts.map