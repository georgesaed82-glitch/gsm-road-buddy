import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/AdminShell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, MailCheck, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { sendTestEmail } from "@/lib/email-admin.functions";

export const Route = createFileRoute("/_authenticated/admin/email")({
  component: AdminEmail,
});

function AdminEmail() {
  const sendFn = useServerFn(sendTestEmail);
  const [to, setTo] = useState("gsmdrivingschool@outlook.com");
  const [sending, setSending] = useState(false);

  const { data: recent, refetch } = useQuery({
    queryKey: ["admin-email-recent"],
    queryFn: async () => {
      const { data } = await supabase
        .from("email_send_log")
        .select("message_id, template_name, recipient_email, status, error_message, created_at")
        .order("created_at", { ascending: false })
        .limit(10);
      return data ?? [];
    },
  });

  const onSend = async () => {
    setSending(true);
    try {
      const res = await sendFn({ data: { to } });
      toast.success(`Test email queued to ${res.to}. It will send within a few seconds.`);
      setTimeout(() => refetch(), 6000);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to queue test email.");
    } finally {
      setSending(false);
    }
  };

  return (
    <AdminShell eyebrow="Admin" title="Email settings">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MailCheck className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg">Sender domain</h2>
            </div>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Domain:</span>
              <span className="font-medium">notify.gsmdrivingschool.com</span>
              <Badge variant="secondary">Verified</Badge>
            </div>
            <div className="text-muted-foreground">
              From:{" "}
              <span className="font-medium text-foreground">
                notify@notify.gsmdrivingschool.com
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-display text-lg">Send test email</h2>
            <p className="text-sm text-muted-foreground">
              Sends a one-off test email through the live queue to confirm deliverability.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="text-sm font-medium">Recipient</label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                type="email"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="you@example.com"
                disabled={sending}
              />
              <Button onClick={onSend} disabled={sending}>
                <Send className="mr-2 h-4 w-4" />
                {sending ? "Sending..." : "Send test email"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Tip: check the Junk folder if it doesn't arrive in the inbox.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-display text-lg">Recent activity</h2>
            <p className="text-sm text-muted-foreground">Latest 10 email send attempts.</p>
          </CardHeader>
          <CardContent>
            {!recent?.length ? (
              <p className="text-sm text-muted-foreground">No emails sent yet.</p>
            ) : (
              <div className="divide-y divide-border">
                {recent.map((row, i) => (
                  <div
                    key={`${row.message_id}-${i}`}
                    className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-sm">
                        <StatusBadge status={row.status} />
                        <span className="truncate font-medium">{row.recipient_email}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {row.template_name} · {new Date(row.created_at).toLocaleString()}
                      </div>
                      {row.error_message && (
                        <div className="mt-1 flex items-start gap-1 text-xs text-destructive">
                          <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
                          <span className="break-words">{row.error_message}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variant: "default" | "secondary" | "destructive" | "outline" =
    status === "sent"
      ? "default"
      : status === "failed" || status === "dlq"
        ? "destructive"
        : "secondary";
  return <Badge variant={variant}>{status}</Badge>;
}
