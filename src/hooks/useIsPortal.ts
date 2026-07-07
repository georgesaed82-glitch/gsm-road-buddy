import { useRouterState } from "@tanstack/react-router";

export function useIsPortal() {
  return useRouterState({
    select: (s) => {
      const result = s.matches.some(
        (m) =>
          (typeof m.routeId === "string" && m.routeId.startsWith("/_authenticated")) ||
          (typeof m.id === "string" && m.id.startsWith("/_authenticated")),
      );
      if (typeof window !== "undefined") {
        console.log("[useIsPortal] pathname:", s.location.pathname, "matches:", s.matches.map((m) => ({ id: m.id, routeId: m.routeId })), "result:", result);
      }
      return result;
    },
  });
}
