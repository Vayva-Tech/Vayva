import { useQuery } from '@tanstack/react-query';

interface QueryOptions<T> {
  queryKey: string[];
  queryFn: () => Promise<T>;
  enabled?: boolean;
}

export function useOpsQuery<T>({ queryKey, queryFn, enabled = true }: QueryOptions<T>) {
  return useQuery({
    queryKey,
    queryFn,
    enabled,
  });
}

export default useOpsQuery;
