import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  listAccessCodes,
  listAccessUses,
  setMasterPassword,
  createSubscriptionCode,
  revokeAccessCode,
  deleteAccessCode,
  type AccessCodeRow,
} from "@/lib/portal-access.functions";
import { getAdminPassword, setAdminPassword as cacheAdminPassword } from "@/lib/admin-gate";
import { Copy, Trash2, Ban, Mail, History, ChevronDown, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/access")({
  component: AdminAccessPage,
});

function AdminAccessPage() {
  const password = getAdminPassword();
  const qc = useQueryClient();
  const fetchList = useServerFn(listAccessCodes);
  const fetchUses = useServerFn(listAccessUses);
  const setMaster = useServerFn(setMasterPassword);
  const createSub = useServerFn(createSubscriptionCode);
  const revoke = useServerFn(revokeAccessCode);
  const del = useServerFn(deleteAccessCode);

  const codes = useQuery({
    queryKey: ["access-codes"],
    queryFn: () => fetchList({ data: { password } }),
    enabled: !!password,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["access-codes"] });

  const changeMaster = useMutation({
    mutationFn: (vars: { kind: "admin" | "learner"; newCode: string }) =>
      setMaster({ data: { password, ...vars } }),
    onSuccess: (res, vars) => {
      toast.success(`${vars.kind === "admin" ? "Admin" : "Learner"} password updated.`);
      if (vars.kind === "admin" && res?.newCode) cacheAdminPassword(res.newCode);
      invalidate();
    },
    onError: (e: any) => toast.error(e?.message || "Could not update password."),
  });

  const issueSub = useMutation({
    mutationFn: (vars: { email: string; days: number; label?: string; code?: string }) =>
      createSub({ data: { password, ...vars } }),
    onSuccess: (row: any) => {
      toast.success(`Code ${row.code} issued for ${row.email}.`);
      invalidate();
    },
    onError: (e: any) => toast.error(e?.message || "Could not issue code."),
  });

  const revokeMut = useMutation({
    mutationFn: (id: string) => revoke({ data: { password, id } }),
    onSuccess: () => {
      toast.success("Code revoked.");
      invalidate();
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => del({ data: { password, id } }),
    onSuccess: () => {
      toast.success("Code deleted.");
      invalidate();
    },
  });

  const rows = codes.data ?? [];
  const admins = rows.filter((r) => r.kind === "admin");
  const learners = rows.filter((r) => r.kind === "learner");
  const subs = rows.filter((r) => r.kind === "subscription");

  return (
    <AdminShell title="Access codes" eyebrow="Portal security">
      <div className="space-y-8">
        <MasterCard
          title="Admin portal password"
          description="Used to log in to /admin. Replacing the password immediately revokes the previous one."
          current={admins.find((r) => !r.revoked)?.code}
          onSave={(newCode) => changeMaster.mutate({ kind: "admin", newCode })}
          loading={changeMaster.isPending}
        />
        <MasterCard
          title="Learner portal master password"
          description="Used by your regular students at /auth. Subscription codes below also unlock the learner portal."
          current={learners.find((r) => !r.revoked)?.code}
          onSave={(newCode) => changeMaster.mutate({ kind: "learner", newCode })}
          loading={changeMaster.isPending}
        />

        <Card>
          <CardHeader>
            <CardTitle>Issue a subscription code</CardTitle>
            <CardDescription>
              Generate a time-limited code (e.g. 30 days) tied to a learner's email. They use it on the
              learner portal login page. After it expires, access automatically stops.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <IssueForm loading={issueSub.isPending} onSubmit={(v) => issueSub.mutate(v)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription codes</CardTitle>
            <CardDescription>
              {subs.length} total · {subs.reduce((n, r) => n + (r.use_count || 0), 0)} total logins
            </CardDescription>
          </CardHeader>
          <CardContent>
            {subs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No subscription codes yet.</p>
            ) : (
              <CodesTable
                rows={subs}
                password={password}
                fetchUses={fetchUses}
                onRevoke={(id) => revokeMut.mutate(id)}
                onDelete={(id) => deleteMut.mutate(id)}
              />
            )}
          </CardContent>
        </Card>

        {(admins.length > 0 || learners.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle>Master password usage</CardTitle>
              <CardDescription>Login history for admin and learner master codes.</CardDescription>
            </CardHeader>
            <CardContent>
              <CodesTable
                rows={[...admins, ...learners]}
                password={password}
                fetchUses={fetchUses}
                masterView
              />
            </CardContent>
          </Card>
        )}
      </div>
    </AdminShell>
  );
}

function MasterCard({
  title,
  description,
  current,
  onSave,
  loading,
}: {
  title: string;
  description: string;
  current?: string;
  onSave: (v: string) => void;
  loading: boolean;
}) {
  const [value, setValue] = useState("");
  const [show, setShow] = useState(false);
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Current:</span>
          <code className="rounded bg-muted px-2 py-1 font-mono">
            {current ? (show ? current : "•".repeat(Math.max(4, current.length))) : "(default 7777 — not yet set)"}
          </code>
          {current && (
            <>
              <Button type="button" variant="ghost" size="sm" onClick={() => setShow((s) => !s)}>
                {show ? "Hide" : "Show"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(current);
                  toast.success("Copied");
                }}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>
        <form
          className="flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            if (!value.trim()) return;
            onSave(value.trim());
            setValue("");
          }}
        >
          <Input
            placeholder="New password (4-64 characters)"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            minLength={4}
            maxLength={64}
          />
          <Button type="submit" disabled={loading || value.trim().length < 4}>
            {loading ? "Saving…" : "Update password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function IssueForm({
  loading,
  onSubmit,
}: {
  loading: boolean;
  onSubmit: (v: { email: string; days: number; label?: string; code?: string }) => void;
}) {
  const [email, setEmail] = useState("");
  const [days, setDays] = useState(30);
  const [label, setLabel] = useState("");
  const [code, setCode] = useState("");
  return (
    <form
      className="grid gap-3 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          email,
          days,
          label: label || undefined,
          code: code.trim() || undefined,
        });
        setEmail("");
        setLabel("");
        setCode("");
      }}
    >
      <div>
        <Label>Learner email</Label>
        <Input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="student@example.com"
        />
      </div>
      <div>
        <Label>Duration (days)</Label>
        <Input
          type="number"
          min={1}
          max={365}
          required
          value={days}
          onChange={(e) => setDays(Number(e.target.value) || 30)}
        />
      </div>
      <div>
        <Label>Label (optional)</Label>
        <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Bronze package" />
      </div>
      <div>
        <Label>Custom code (optional)</Label>
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Leave blank to auto-generate"
        />
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Issuing…" : "Issue access code"}
        </Button>
      </div>
    </form>
  );
}

type FetchUsesFn = (args: {
  data: { password: string; codeId: string; limit?: number };
}) => Promise<Array<{ id: string; used_at: string; mode: string; user_agent: string | null }>>;

function CodesTable({
  rows,
  password,
  fetchUses,
  onRevoke,
  onDelete,
  masterView,
}: {
  rows: AccessCodeRow[];
  password: string;
  fetchUses: FetchUsesFn;
  onRevoke?: (id: string) => void;
  onDelete?: (id: string) => void;
  masterView?: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-xs uppercase text-muted-foreground">
          <tr>
            <th className="py-2 pr-2 w-6"></th>
            {masterView ? (
              <>
                <th className="py-2 pr-3">Kind</th>
                <th className="py-2 pr-3">Code</th>
              </>
            ) : (
              <>
                <th className="py-2 pr-3">Code</th>
                <th className="py-2 pr-3">Email</th>
                <th className="py-2 pr-3">Expires</th>
              </>
            )}
            <th className="py-2 pr-3">Uses</th>
            <th className="py-2 pr-3">Last used</th>
            <th className="py-2 pr-3">Status</th>
            {!masterView && <th className="py-2 pr-3 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <CodeRow
              key={r.id}
              row={r}
              password={password}
              fetchUses={fetchUses}
              onRevoke={onRevoke ? () => onRevoke(r.id) : undefined}
              onDelete={onDelete ? () => onDelete(r.id) : undefined}
              masterView={masterView}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CodeRow({
  row,
  password,
  fetchUses,
  onRevoke,
  onDelete,
  masterView,
}: {
  row: AccessCodeRow;
  password: string;
  fetchUses: FetchUsesFn;
  onRevoke?: () => void;
  onDelete?: () => void;
  masterView?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const uses = useQuery({
    queryKey: ["access-uses", row.id],
    queryFn: () => fetchUses({ data: { password, codeId: row.id, limit: 100 } }),
    enabled: open && !!password,
  });

  const mailto =
    row.email &&
    `mailto:${row.email}?subject=${encodeURIComponent(
      "Your GSM learner portal access",
    )}&body=${encodeURIComponent(
      `Hi,\n\nYour learner portal access code is: ${row.code}\n` +
        (row.expires_at ? `Valid until: ${new Date(row.expires_at).toLocaleString()}\n` : "") +
        `\nLog in at https://gsmdrivingschool.com/auth\n\n— George School of Motoring`,
    )}`;

  const lastUsed = row.last_used_at ? new Date(row.last_used_at).toLocaleString() : "—";
  const colSpan = masterView ? 6 : 8;

  return (
    <>
      <tr className="border-t border-border align-middle">
        <td className="py-2 pr-2">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="text-muted-foreground hover:text-foreground"
            title={open ? "Hide history" : "Show login history"}
          >
            {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </td>
        {masterView ? (
          <>
            <td className="py-2 pr-3 capitalize">{row.kind}</td>
            <td className="py-2 pr-3 font-mono">{row.code}</td>
          </>
        ) : (
          <>
            <td className="py-2 pr-3 font-mono">{row.code}</td>
            <td className="py-2 pr-3">{row.email}</td>
            <td className="py-2 pr-3">
              {row.expires_at ? new Date(row.expires_at).toLocaleDateString() : "—"}
            </td>
          </>
        )}
        <td className="py-2 pr-3 tabular-nums">{row.use_count}</td>
        <td className="py-2 pr-3 text-muted-foreground">{lastUsed}</td>
        <td className="py-2 pr-3">
          <Badge
            variant={
              row.status === "active" ? "default" : row.status === "expired" ? "secondary" : "outline"
            }
          >
            {row.status}
          </Badge>
        </td>
        {!masterView && (
          <td className="py-2 pr-3">
            <div className="flex justify-end gap-1">
              {mailto && (
                <Button asChild variant="ghost" size="sm" title="Email code to learner">
                  <a href={mailto}>
                    <Mail className="h-3.5 w-3.5" />
                  </a>
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(row.code);
                  toast.success("Copied");
                }}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
              {row.status === "active" && onRevoke && (
                <Button variant="ghost" size="sm" onClick={onRevoke} title="Revoke">
                  <Ban className="h-3.5 w-3.5" />
                </Button>
              )}
              {onDelete && (
                <Button variant="ghost" size="sm" onClick={onDelete} title="Delete">
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              )}
            </div>
          </td>
        )}
      </tr>
      {open && (
        <tr className="border-t border-border bg-muted/30">
          <td colSpan={colSpan} className="px-3 py-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
              <History className="h-3.5 w-3.5" /> Login history
            </div>
            {uses.isLoading ? (
              <p className="mt-2 text-sm text-muted-foreground">Loading…</p>
            ) : uses.data && uses.data.length > 0 ? (
              <ul className="mt-2 space-y-1 text-sm">
                {uses.data.map((u) => (
                  <li key={u.id} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-mono tabular-nums">
                      {new Date(u.used_at).toLocaleString()}
                    </span>
                    <Badge variant="outline" className="capitalize">{u.mode}</Badge>
                    {u.user_agent && (
                      <span className="text-xs text-muted-foreground truncate max-w-[420px]">
                        {u.user_agent}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">No logins recorded yet.</p>
            )}
          </td>
        </tr>
      )}
    </>
  );
}