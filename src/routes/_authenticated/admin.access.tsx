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
  setMasterPassword,
  createSubscriptionCode,
  revokeAccessCode,
  deleteAccessCode,
  type AccessCodeRow,
} from "@/lib/portal-access.functions";
import { getAdminPassword, setAdminPassword as cacheAdminPassword } from "@/lib/admin-gate";
import { Copy, Trash2, Ban, Mail } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/access")({
  component: AdminAccessPage,
});

function AdminAccessPage() {
  const password = getAdminPassword();
  const qc = useQueryClient();
  const fetchList = useServerFn(listAccessCodes);
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
              Generate a time-limited code (e.g. 30 days) tied to a learner's email. They use it on the learner
              portal login page. After it expires, access automatically stops.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <IssueForm
              loading={issueSub.isPending}
              onSubmit={(v) => issueSub.mutate(v)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active subscription codes</CardTitle>
            <CardDescription>{subs.length} total</CardDescription>
          </CardHeader>
          <CardContent>
            {subs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No subscription codes yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="py-2 pr-3">Code</th>
                      <th className="py-2 pr-3">Email</th>
                      <th className="py-2 pr-3">Expires</th>
                      <th className="py-2 pr-3">Status</th>
                      <th className="py-2 pr-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subs.map((r) => (
                      <CodeRow
                        key={r.id}
                        row={r}
                        onRevoke={() => revokeMut.mutate(r.id)}
                        onDelete={() => deleteMut.mutate(r.id)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
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

function CodeRow({
  row,
  onRevoke,
  onDelete,
}: {
  row: AccessCodeRow;
  onRevoke: () => void;
  onDelete: () => void;
}) {
  const mailto =
    row.email &&
    `mailto:${row.email}?subject=${encodeURIComponent(
      "Your GSM learner portal access",
    )}&body=${encodeURIComponent(
      `Hi,\n\nYour learner portal access code is: ${row.code}\n` +
        (row.expires_at ? `Valid until: ${new Date(row.expires_at).toLocaleString()}\n` : "") +
        `\nLog in at https://gsmdrivingschool.com/auth\n\n— George School of Motoring`,
    )}`;
  return (
    <tr className="border-t border-border align-middle">
      <td className="py-2 pr-3 font-mono">{row.code}</td>
      <td className="py-2 pr-3">{row.email}</td>
      <td className="py-2 pr-3">
        {row.expires_at ? new Date(row.expires_at).toLocaleDateString() : "—"}
      </td>
      <td className="py-2 pr-3">
        <Badge
          variant={
            row.status === "active" ? "default" : row.status === "expired" ? "secondary" : "outline"
          }
        >
          {row.status}
        </Badge>
      </td>
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
          {row.status === "active" && (
            <Button variant="ghost" size="sm" onClick={onRevoke} title="Revoke">
              <Ban className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onDelete} title="Delete">
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          </Button>
        </div>
      </td>
    </tr>
  );
}