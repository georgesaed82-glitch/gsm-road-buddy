import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAdminPassword } from "@/lib/admin-gate";
import { AdminShell } from "@/components/AdminShell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Trash2, ShieldPlus } from "lucide-react";
import { listAdmins, addAdmin, removeAdmin } from "@/lib/admins.functions";

export const Route = createFileRoute("/_authenticated/admin/admins")({
  component: AdminsPage,
});

function AdminsPage() {
  const qc = useQueryClient();
  const list = useServerFn(listAdmins);
  const add = useServerFn(addAdmin);
  const remove = useServerFn(removeAdmin);
  const [email, setEmail] = useState("");

  const { data: admins, isLoading } = useQuery({
    queryKey: ["admins"],
    queryFn: () => list({ data: { password: getAdminPassword() } }),
  });

  const addMut = useMutation({
    mutationFn: (e: string) => add({ data: { email: e, password: getAdminPassword() } }),
    onSuccess: () => {
      toast.success("Admin added");
      setEmail("");
      qc.invalidateQueries({ queryKey: ["admins"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeMut = useMutation({
    mutationFn: (user_id: string) => remove({ data: { user_id, password: getAdminPassword() } }),
    onSuccess: () => {
      toast.success("Admin removed");
      qc.invalidateQueries({ queryKey: ["admins"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AdminShell eyebrow="Access control" title="Admin accounts">
      <p className="mb-6 text-sm text-muted-foreground">
        Anyone listed here has full access to the admin portal. The account must already have signed up.
      </p>

      <Card className="mb-8">
        <CardHeader>
          <h2 className="font-display text-lg">Add an admin</h2>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              if (!email.trim()) return;
              addMut.mutate(email.trim());
            }}
          >
            <Input
              type="email"
              required
              placeholder="person@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={addMut.isPending}>
              <ShieldPlus className="mr-2 h-4 w-4" />
              {addMut.isPending ? "Adding…" : "Grant admin"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-display text-lg">Current admins</h2>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : !admins || admins.length === 0 ? (
            <p className="text-sm text-muted-foreground">No admins.</p>
          ) : (
            <ul className="divide-y divide-border">
              {admins.map((a) => {
                const isMe = false;
                return (
                  <li key={a.user_id} className="flex items-center justify-between gap-3 py-3 text-sm">
                    <div className="min-w-0">
                      <div className="truncate font-medium">{a.email}</div>
                      {a.full_name && (
                        <div className="truncate text-xs text-muted-foreground">{a.full_name}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {isMe && (
                        <span className="rounded bg-secondary px-2 py-0.5 text-[10px] uppercase tracking-wider">
                          You
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isMe || removeMut.isPending}
                        onClick={() => {
                          if (confirm(`Remove admin access for ${a.email}?`)) {
                            removeMut.mutate(a.user_id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
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