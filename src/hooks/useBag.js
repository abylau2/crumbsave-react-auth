import { useQuery } from '@tanstack/react-query';
import { bagDetailQuery } from './queries.js';

export function useBag(id) {
  const query = useQuery(bagDetailQuery(id));
  const status = query.isPending ? 'loading' : query.isError && query.data === undefined ? 'error' : 'success';
  return { bag: query.data ?? null, status, error: query.error?.message ?? '', retry: () => query.refetch() };
}
