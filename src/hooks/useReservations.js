import { useQuery } from '@tanstack/react-query';
import { reservationsQuery } from './queries.js';

const NO_ITEMS = [];

export function useReservations() {
  const query = useQuery(reservationsQuery());
  const status = query.isPending ? 'loading' : query.isError && !query.data ? 'error' : 'success';
  return { items: query.data ?? NO_ITEMS, status, error: query.error?.message ?? '', retry: () => query.refetch() };
}
