import { z } from "zod";
export declare const EnvSchema: z.ZodObject<{
    DATABASE_URL: z.ZodString;
    REDIS_URL: z.ZodString;
    PORT: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    NODE_ENV: z.ZodDefault<z.ZodEnum<["development", "production", "test"]>>;
}, "strip", z.ZodTypeAny, {
    NODE_ENV: "development" | "production" | "test";
    REDIS_URL: string;
    DATABASE_URL: string;
    PORT: string;
}, {
    REDIS_URL: string;
    DATABASE_URL: string;
    NODE_ENV?: "development" | "production" | "test" | undefined;
    PORT?: string | undefined;
}>;
export declare const PaginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
}, {
    page?: number | undefined;
    limit?: number | undefined;
}>;
export declare const TenantSchema: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    slug: string;
}, {
    name: string;
    slug: string;
}>;
//# sourceMappingURL=index.d.ts.map