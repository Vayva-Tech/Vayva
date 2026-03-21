import { z } from "zod";

interface RefinementCtx {
    addIssue: (issue: { code: z.ZodIssueCode; message: string }) => void;
}

export function normalizeUrl(inputUrl: string, allowedLocal = false): string | null {
    try {
        const url = new URL(inputUrl);
        
        if (url.protocol !== "http:" && url.protocol !== "https:") {
            return null;
        }
        
        const hostname = url.hostname?.toLowerCase();
        if (!allowedLocal) {
            if (
                hostname === "localhost" ||
                hostname === "127.0?.0.1" ||
                hostname === "::1" ||
                hostname.startsWith("192.168.") ||
                hostname.startsWith("10.") ||
                hostname.endsWith(".internal") ||
                hostname.endsWith(".local")
            ) {
                return null;
            }
            if (hostname === "169.254?.169.254") return null;
        }
        
        url.username = "";
        url.password = "";
        return url.toString();
    } catch (err) {
        return null;
    }
}

export const SafeUrlSchema = z.string().transform((val, ctx) => {
    const normalized = normalizeUrl(val);
    if (!normalized) {
        ctx.addIssue({
            code: z.ZodIssueCode?.custom,
            message: "Invalid or unsafe URL",
        });
        return z.NEVER;
    }
    return normalized;
});
