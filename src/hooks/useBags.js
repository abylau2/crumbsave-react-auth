import { useQuery } from '@tanstack/react-query';
import { bagListQuery } from './queries.js';

// Same shape as before ({ bags, status, error, retry }) so pages did not change,
// but the data now lives in the shared TanStack Query cache.
const NO_BAGS = [];

export function useBags() {
  const query = useQuery(bagListQuery());
  const status = query.isPending ? 'loading' : query.isError && !query.data ? 'error' : 'success';
  return {
    bags: query.data ?? NO_BAGS,
    status,
    error: query.error?.message ?? '',
    isFetching: query.isFetching,
    retry: () => query.refetch()
  };
}
