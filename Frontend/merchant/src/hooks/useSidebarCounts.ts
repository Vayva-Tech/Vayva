"use client";
import useSWR from "swr";
import { apiJson } from "@/lib/api-client-shared";

const fetcher = <T,>(url: string) => apiJson<T>(url);

export function useSidebarCounts() {
  const { data } = useSWR<{ data: Record<string, number> }>(
    "/dashboard/sidebar-counts",
    fetcher,
    { refreshInterval: 30000, revalidateOnFocus: true }
  );
  return data?.data || {};
}
