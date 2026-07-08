import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

/**
 * When any admin server function rejects with "Unauthorized" (missing session
 * or missing admin role), bounce the user to the admin sign-in page.
 */
function handleAdminUnauthorized(err: unknown) {
  if (typeof window === "undefined") return;
  if (!window.location.pathname.startsWith("/admin")) return;
  const msg = err instanceof Error ? err.message : String(err ?? "");
  if (!/unauthorized/i.test(msg)) return;
  // Best-effort scrub of any legacy localStorage keys from older builds.
  try {
    window.localStorage.removeItem("admin_unlocked");
    window.localStorage.removeItem("admin_password");
  } catch {
    // localStorage may be unavailable (private mode); ignore.
  }
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
