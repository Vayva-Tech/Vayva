import { cookies } from "next/headers";

import { checkFeatureAccess } from "@/lib/billing/access";
import { generateToken } from "@/lib/session.server";

const PIN_SESSION_COOKIE = "vayva_pin_session";

export { checkFeatureAccess };

export async function createPinSession(storeId: string): Promise<void> {
  const cookieStore = await cookies();
  const token = generateToken({
    storeId,
    type: "pin_session",
  });

  cookieStore.set(PIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60,
  });
}
