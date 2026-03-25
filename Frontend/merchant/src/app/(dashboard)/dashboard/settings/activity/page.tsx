import { requireAuth } from "@/lib/session.server";
import { ActivityLogTable } from "@/components/settings/ActivityLogTable";
import { cookies } from "next/headers";
import { PageHeader } from "@/components/layout/PageHeader";

interface ActivityLog {
  id: string;
  createdAt: string;
  actorUserId: string;
  action: string;
  targetType: string;
  targetId: string;
  reason: string | null;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
}

async function getCookieHeader(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
}

export const dynamic = "force-dynamic";

export default async function ActivityPage() {
  const user = await requireAuth();

  const cookieHeader = await getCookieHeader();
  const backendResponse = await fetch(
    `${process?.env?.BACKEND_API_URL}/api/dashboard/activity`,
    {
      headers: {
        cookie: cookieHeader,
      },
      cache: "no-store",
    }
  );

  let logs: ActivityLog[] = [];
  if (backendResponse.ok) {
    const data = await backendResponse.json();
    logs = Array.isArray(data) ? data : data.items || [];
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Activity Logs"
        subtitle="Audit trail of staff actions and changes."
      />

      <ActivityLogTable logs={logs} />
    </div>
  );
}
