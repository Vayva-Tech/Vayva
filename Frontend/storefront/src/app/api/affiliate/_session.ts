import crypto from "crypto";
import { NextRequest } from "next/server";

function verifySig(body: string, sig: string): boolean {
  const secret =
    process.env.AFFILIATE_SESSION_SECRET || process.env.NEXTAUTH_SECRET || "dev";
  const expected = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
  } catch {
    return false;
  }
}

export function getAffiliateSession(req: NextRequest): { affiliateId: string; storeId: string } | null {
  const raw = req.cookies.get("vayva_affiliate")?.value || "";
  const [body, sig] = raw.split(".");
  if (!body || !sig) return null;
  if (!verifySig(body, sig)) return null;
  try {
    const json = Buffer.from(body.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
    const payload = JSON.parse(json) as Record<string, unknown>;
    const affiliateId = typeof payload.affiliateId === "string" ? payload.affiliateId : "";
    const storeId = typeof payload.storeId === "string" ? payload.storeId : "";
    if (!affiliateId || !storeId) return null;
    return { affiliateId, storeId };
  } catch {
    return null;
  }
}

