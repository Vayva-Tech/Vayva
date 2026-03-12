import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { toast } from "sonner";

export function useOpsQuery<T>(
  queryKey: string[],
  fetcher: () => Promise<T>,
  options?: Omit<
    UseQueryOptions<T, Error, T, string[]>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey,
    queryFn: async () => {
      try {
        return await fetcher();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: unknown) {
        toast.error("Data Fetch Error", {
          description:
            error instanceof Error
              ? error.message
              : String(error) || "Something went wrong while fetching data.",
        });
        throw error;
      }
    },
    ...options,
  });
}
