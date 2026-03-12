import { getServerSession, type User } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { WalletClient } from "./WalletClient";
import { cookies } from "next/headers";

interface SessionUser extends User {
  id: string;
  storeId: string;
}

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Wallet | Vayva Dashboard",
  description: "Manage your store's wallet and payouts.",
};

async function getCookieHeader(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
}

export default async function WalletPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/signin");

  const storeId = (session.user as SessionUser).storeId;
  if (!storeId) redirect("/onboarding");

  const cookieHeader = await getCookieHeader();
  const backendResponse = await fetch(
    `${process?.env?.BACKEND_API_URL}/api/payments/wallet/summary`,
    {
      headers: {
        cookie: cookieHeader,
      },
      cache: "no-store",
    }
  );

  const summary = await backendResponse.json().catch(() => null);
  const balance = summary?.availableBalance ?? 0;
  const pending = summary?.pendingBalance ?? 0;
  const wallet = summary?.virtualAccount
    ? {
        vaStatus: "ACTIVE",
        vaAccountNumber: summary.virtualAccount?.accountNumber || "",
        vaBankName: summary.virtualAccount?.bankName || "",
        vaAccountName: summary.virtualAccount?.accountName || "",
      }
    : null;

  return <WalletClient balance={balance} pending={pending} wallet={wallet} />;
}
