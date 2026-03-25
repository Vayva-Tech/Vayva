import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function hasAnySessionCookie(): Promise<boolean> {
  const store = await cookies();
  const cookieNames = [
    "vayva_session",
    "session",
    "__Secure-vayva-merchant-session",
    "next-auth.merchant-session",
    "__Secure-next-auth.session-token",
    "next-auth.session-token",
  ];
  return cookieNames.some((name) => !!store.get(name)?.value);
}

export default async function RootPage() {
  // Server-side redirect avoids "infinite spinner" when auth bootstrap hangs.
  if (!(await hasAnySessionCookie())) {
    redirect("/signin");
  }

  // If a session cookie exists, let protected routes/server layout validate it.
  redirect("/dashboard");
}
