import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AdminShell } from "@/components/AdminShell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Trash2, ShieldPlus, Lock, Unlock, KeyRound, Crown, ScrollText, History } from "lucide-react";
import {
  listRbacAdmins,
  createRbacAdmin,
  deleteRbacAdmin,
  changeRbacAdminRole,
  setRbacAdminDisabled,
  resetRbacAdminPassword,
  type AdminRoleSlug,
} from "@/lib/rbac.functions";
import { useMyProfile } from "@/hooks/useMyProfile";

export const Route = createFileRoute("/_authenticated/admin/admins")({
  component: AdminsPage,
});

const ROLE_OPTIONS: { slug: AdminRoleSlug; label: string }[] = [
  { slug: "full_admin", label: "Full Administrator" },
  { slug: "developer", label: "Developer" },
  { slug: "content_manager", label: "Content Manager" },
  { slug: "instructor_manager", label: "Instructor Manager" },
  { slug: "support", label: "Support Staff" },
  { slug: "read_only", label: "Read Only" },
];

function AdminsPage() {
  const qc = useQueryClient();
  const { data: me } = useMyProfile();
  const list = useServerFn(listRbacAdmins);
  const create = useServerFn(createRbacAdmin);
  const remove = useServerFn(deleteRbacAdmin);
  const changeRole = useServerFn(changeRbacAdminRole);
  const setDisabled = useServerFn(setRbacAdminDisabled);
  const resetPw = useServerFn(resetRbacAdminPassword);

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [roleSlug, setRoleSlug] = useState<AdminRoleSlug>("support");

  const { data: admins, isLoading } = useQuery({
    queryKey: ["rbac-admins"],
    queryFn: () => list({ data: {} as never }),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["rbac-admins"] });

  const createMut = useMutation({
    mutationFn: () =>
      create({
        data: {
          email: email.trim(),
          username: username.trim(),
          full_name: fullName.trim() || undefined,
          role_slug: roleSlug,
        },
      }),
    onSuccess: (r) => {
      toast.success(`Admin created. Temporary password: ${r.tempPassword}`);
      setEmail("");
      setUsername("");
      setFullName("");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeMut = useMutation({
    mutationFn: (user_id: string) => remove({ data: { user_id } }),
    onSuccess: () => {
      toast.success("Admin deleted");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const roleMut = useMutation({
    mutationFn: (v: { user_id: string; role_slug: AdminRoleSlug }) =>
      changeRole({ data: v }),
    onSuccess: () => {
      toast.success("Role updated");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const disableMut = useMutation({
    mutationFn: (v: { user_id: string; disabled: boolean }) =>
      setDisabled({ data: v }),
    onSuccess: (_r, v) => {
      toast.success(v.disabled ? "Account disabled" : "Account re-enabled");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const resetMut = useMutation({
    mutationFn: (user_id: string) => resetPw({ data: { user_id } }),
    onSuccess: (r) => {
      toast.success(`Password reset. Temporary password: ${r.tempPassword}`);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const isMaster = !!me?.is_master_owner;

  return (
    <AdminShell eyebrow="Access control" title="Admin accounts">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Manage administrator accounts, roles, and access. Only the Master Owner can create,
          disable, or delete admins.
        </p>
        <div className="flex gap-2">
          <Link
            to="/admin/audit"
            className="inline-flex items-center gap-1.5 rounded-md border border-border/70 px-3 py-1.5 text-xs hover:bg-accent/5"
          >
            <ScrollText className="h-3.5 w-3.5" /> Audit log
          </Link>
          <Link
            to="/admin/login-events"
            className="inline-flex items-center gap-1.5 rounded-md border border-border/70 px-3 py-1.5 text-xs hover:bg-accent/5"
          >
            <History className="h-3.5 w-3.5" /> Login history
          </Link>
        </div>
      </div>

      {isMaster && (
        <Card className="mb-8">
          <CardHeader>
            <h2 className="font-display text-lg">Create administrator</h2>
            <p className="text-xs text-muted-foreground">
              The new admin will sign in with their email and the temporary password shown after
              creation, then be forced to change it on first login.
            </p>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-3 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!email.trim() || !username.trim()) return;
                createMut.mutate();
              }}
            >
              <Input
                type="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                required
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <Input
                placeholder="Full name (optional)"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              <select
                className="h-10 rounded-md border border-border bg-background px-3 text-sm"
                value={roleSlug}
                onChange={(e) => setRoleSlug(e.target.value as AdminRoleSlug)}
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r.slug} value={r.slug}>
                    {r.label}
                  </option>
                ))}
              </select>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={createMut.isPending}>
                  <ShieldPlus className="mr-2 h-4 w-4" />
                  {createMut.isPending ? "Creating…" : "Create administrator"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <h2 className="font-display text-lg">Current administrators</h2>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : !admins || admins.length === 0 ? (
            <p className="text-sm text-muted-foreground">No admins.</p>
          ) : (
            <ul className="divide-y divide-border">
              {admins.map((a) => {
                const isMe = a.user_id === me?.user_id;
                const protectedRow = a.is_master_owner;
                return (
                  <li key={a.user_id} className="flex flex-wrap items-center gap-3 py-4 text-sm">
                    <div className="min-w-[220px] flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate font-medium">{a.email}</span>
                        {protectedRow && (
                          <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-800">
                            <Crown className="h-3 w-3" /> Master Owner
                          </span>
                        )}
                        {isMe && (
                          <span className="rounded bg-secondary px-2 py-0.5 text-[10px] uppercase tracking-wider">
                            You
                          </span>
                        )}
                        {a.disabled_at && (
                          <span className="rounded bg-destructive/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-destructive">
                            Disabled
                          </span>
                        )}
                        {a.must_change_password && (
                          <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-800">
                            Temp password
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {a.username ? `@${a.username}` : "(no username)"}
                        {a.full_name ? ` · ${a.full_name}` : ""}
                        {a.last_login_at ? ` · last login ${new Date(a.last_login_at).toLocaleString("en-GB")}` : " · never signed in"}
                      </div>
                    </div>

                    <select
                      disabled={!isMaster || protectedRow || roleMut.isPending}
                      value={a.role_slug ?? ""}
                      onChange={(e) =>
                        roleMut.mutate({
                          user_id: a.user_id,
                          role_slug: e.target.value as AdminRoleSlug,
                        })
                      }
                      className="h-9 rounded-md border border-border bg-background px-2 text-xs"
                    >
                      {protectedRow ? (
                        <option value="">Master Owner</option>
                      ) : (
                        ROLE_OPTIONS.map((r) => (
                          <option key={r.slug} value={r.slug}>
                            {r.label}
                          </option>
                        ))
                      )}
                    </select>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={!isMaster || protectedRow || isMe || disableMut.isPending}
                        onClick={() =>
                          disableMut.mutate({ user_id: a.user_id, disabled: !a.disabled_at })
                        }
                        title={a.disabled_at ? "Re-enable account" : "Disable account"}
                      >
                        {a.disabled_at ? (
                          <Unlock className="h-4 w-4" />
                        ) : (
                          <Lock className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={!isMaster || protectedRow || resetMut.isPending}
                        onClick={() => {
                          if (confirm(`Reset password for ${a.email}?`)) {
                            resetMut.mutate(a.user_id);
                          }
                        }}
                        title="Reset password to temporary"
                      >
                        <KeyRound className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={!isMaster || protectedRow || isMe || removeMut.isPending}
                        onClick={() => {
                          if (confirm(`Permanently delete ${a.email}? This cannot be undone.`)) {
                            removeMut.mutate(a.user_id);
                          }
                        }}
                        title="Delete admin"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </AdminShell>
  );
}
