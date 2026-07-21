import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Local typed wrapper for the beta `supabase.auth.oauth` namespace so
// TypeScript can see the three methods we call.
type OAuthAuthorizationDetails = {
  client?: { name?: string; redirect_uri?: string; scope?: string } | null;
  redirect_url?: string;
  redirect_to?: string;
  scope?: string;
};
type OAuthResult<T> = { data: T | null; error: { message: string } | null };
type SupabaseAuthOAuth = {
  getAuthorizationDetails(id: string): Promise<OAuthResult<OAuthAuthorizationDetails>>;
  approveAuthorization(id: string): Promise<OAuthResult<OAuthAuthorizationDetails>>;
  denyAuthorization(id: string): Promise<OAuthResult<OAuthAuthorizationDetails>>;
};
function oauthClient(): SupabaseAuthOAuth {
  return (supabase.auth as unknown as { oauth: SupabaseAuthOAuth }).oauth;
}

export const Route = createFileRoute("/.lovable/oauth/consent")({
  // Browser-only: the Supabase session lives in localStorage and is absent
  // during SSR, which would bounce every signed-in user to /auth.
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      const next = location.pathname + location.searchStr;
      throw redirect({ to: "/auth", search: { next } });
    }
  },
  loader: async ({ location }) => {
    const authorizationId =
      new URLSearchParams(location.search).get("authorization_id") ?? "";
    const { data, error } = await oauthClient().getAuthorizationDetails(authorizationId);
    if (error) throw new Error(error.message);
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data;
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <main className="mx-auto max-w-lg space-y-3 p-6">
      <h1 className="text-lg font-semibold">Could not load this authorization request</h1>
      <p className="text-sm text-muted-foreground">
        {String((error as Error)?.message ?? error)}
      </p>
    </main>
  ),
});

function Consent() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const { data, error } = approve
      ? await oauthClient().approveAuthorization(authorization_id)
      : await oauthClient().denyAuthorization(authorization_id);
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  }

  const clientName = details?.client?.name ?? "an app";
  const redirectUri = details?.client?.redirect_uri ?? null;
  const scope = details?.client?.scope ?? details?.scope ?? "";

  return (
    <main className="mx-auto max-w-lg p-6">
      <Card>
        <CardHeader>
          <CardTitle>Connect {clientName} to GSM Driving School</CardTitle>
          <CardDescription>
            This lets {clientName} use GSM Driving School's tools while you are signed in.
            It does not bypass this app's permissions or backend policies.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {redirectUri && (
            <p className="text-xs text-muted-foreground break-all">
              Redirect: <span className="font-mono">{redirectUri}</span>
            </p>
          )}
          {scope && (
            <p className="text-xs text-muted-foreground">
              Requested access: <span className="font-mono">{scope}</span>
            </p>
          )}
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="flex gap-3">
            <Button disabled={busy} onClick={() => decide(true)} className="flex-1">
              Approve
            </Button>
            <Button
              disabled={busy}
              variant="outline"
              onClick={() => decide(false)}
              className="flex-1"
            >
              Deny
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}