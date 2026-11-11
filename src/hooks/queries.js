import { getBagById, getBags, getReservations, createBag, reserveBag } from '../services/service.js';
import { STALE_TIME } from '../lib/queryClient.js';
import { queryKeys } from './queryKeys.js';

// Query and mutation definitions. React hooks (useBags.js ...) and tests share them.
// `signal` comes from TanStack Query: when a query is cancelled or its key changes,
// the request is aborted and its result can never overwrite newer data.

export const bagListQuery = () => ({
  queryKey: queryKeys.bagList,
  queryFn: ({ signal }) => getBags({ signal }),
  staleTime: STALE_TIME.bags
});

export const bagDetailQuery = (id) => ({
  queryKey: queryKeys.bagDetail(id),
  queryFn: ({ signal }) => getBagById(id, { signal }),
  staleTime: STALE_TIME.bag
});

export const reservationsQuery = () => ({
  queryKey: queryKeys.reservations,
  queryFn: ({ signal }) => getReservations({ signal }),
  staleTime: STALE_TIME.reservations
});

// Creating a bag changes the catalog (and everything derived from it).
export const createBagMutation = (queryClient) => ({
  mutationFn: (values) => createBag(values),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.bags })
});

// Reserving changes the bag's quantity AND adds a reservation, so both caches are refreshed.
export const reserveBagMutation = (queryClient) => ({
  mutationFn: (id) => reserveBag(id),
  onSuccess: (result, id) => {
    queryClient.setQueryData(queryKeys.bagDetail(id), result.bag);
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.bags }),
      queryClient.invalidateQueries({ queryKey: queryKeys.reservations })
    ]);
  }
});
