import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { changeOwnPassword } from "@/lib/rbac.functions";
import { useMyProfile } from "@/hooks/useMyProfile";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function ForcePasswordChangeGate() {
  const { data } = useMyProfile();
  const qc = useQueryClient();
  const change = useServerFn(changeOwnPassword);
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  useEffect(() => {
    if (data?.must_change_password) setOpen(true);
  }, [data?.must_change_password]);

  const mut = useMutation({
    mutationFn: () => change({ data: { currentPassword: current, newPassword: next } }),
    onSuccess: () => {
      toast.success("Password updated");
      setOpen(false);
      setCurrent("");
      setNext("");
      setConfirm("");
      qc.invalidateQueries({ queryKey: ["my-profile"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!data?.must_change_password) return null;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Set a new password</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          For security, please replace the temporary password before continuing.
        </p>
        <form
          className="mt-4 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (next.length < 8) return toast.error("Password must be at least 8 characters");
            if (next !== confirm) return toast.error("Passwords do not match");
            mut.mutate();
          }}
        >
          <Input
            type="password"
            placeholder="Current password"
            autoComplete="current-password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="New password (min 8 chars)"
            autoComplete="new-password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Confirm new password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
          <Button type="submit" className="w-full" disabled={mut.isPending}>
            {mut.isPending ? "Saving…" : "Update password"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}