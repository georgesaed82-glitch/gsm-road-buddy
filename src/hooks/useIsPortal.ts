import { useRouterState } from "@tanstack/react-router";

export function useIsPortal() {
  return useRouterState({
    select: (s) =>
      s.matches.some(
        (m) =>
          (typeof m.routeId === "string" && m.routeId.startsWith("/_authenticated")) ||
          (typeof m.id === "string" && m.id.startsWith("/_authenticated")),
      ),
  });
}
