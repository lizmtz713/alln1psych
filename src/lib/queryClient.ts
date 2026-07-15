import { QueryClient } from '@tanstack/react-query';

/** Shared app-wide QueryClient — used by providers and non-React invalidation helpers. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});
