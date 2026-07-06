import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { clearAdminUnlock, isAdminUnauthorizedError } from "@/lib/admin-gate";

function handleAdminUnauthorized(err: unknown) {
  if (typeof window === "undefined") return;
  if (!window.location.pathname.startsWith("/admin")) return;
  if (!isAdminUnauthorizedError(err)) return;
  // Scrub any legacy admin-unlock state and send the user to admin sign-in.
  clearAdminUnlock();
  const target = "/auth?admin=1";
  if (window.location.pathname + window.location.search !== target) {
    window.location.replace(target);
  }
}

export const getRouter = () => {
  const queryClient = new QueryClient({
    queryCache: new QueryCache({ onError: handleAdminUnauthorized }),
    mutationCache: new MutationCache({ onError: handleAdminUnauthorized }),
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
