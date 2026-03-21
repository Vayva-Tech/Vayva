export interface DashboardAlert {
  id: string;
  title: string;
  message: string;
  severity: "info" | "warning" | "error" | "success" | "critical";
  link?: string;
  href?: string;
  createdAt?: Date;
}

export interface SuggestedAction {
  id: string;
  title: string;
  description?: string;
  reason?: string;
  message?: string;
  actionType?: string;
  priority?: string;
  severity?: string;
  link?: string;
  href?: string;
  icon?: string;
}

export async function fetchSuggestedActions(storeId: string): Promise<SuggestedAction[]> {
  const res = await fetch(`/api/dashboard/actions?storeId=${storeId}`);
  return res.json();
}
