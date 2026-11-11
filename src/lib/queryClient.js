import { QueryClient } from '@tanstack/react-query';

// Cache timings (milliseconds)
export const STALE_TIME = {
  bags: 60_000,         // catalog: fresh for 1 minute
  bag: 60_000,          // single bag: fresh for 1 minute
  reservations: 30_000  // reservations: fresh for 30 seconds
};
export const GC_TIME = 5 * 60_000; // unused entries are removed after 5 minutes

export function createQueryClient({ gcTime = GC_TIME } = {}) {
  return new QueryClient({
    defaultOptions: {
      queries: {
        gcTime,
        staleTime: STALE_TIME.bags,
        // Failed requests show the error state with a "Try again" button
        // instead of retrying silently in the background.
        retry: false,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true
      }
    }
  });
}

export const queryClient = createQueryClient();
