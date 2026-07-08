import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const sendTestEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { to: string }) => {
    const to = (data?.to ?? "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      throw new Error("Please enter a valid email address.");
    }
    return { to };
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: isAdmin, error: roleError } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    if (roleError || !isAdmin) {
      throw new Error("Forbidden: admins only");
    }

    const idempotencyKey = `deliverability-test-${crypto.randomUUID()}`;
    const payload = {
      message_id: idempotencyKey,
      idempotency_key: idempotencyKey,
      to: data.to,
      from: "GSM Driving School <notify@notify.gsmdrivingschool.com>",
      sender_domain: "notify.gsmdrivingschool.com",
      subject: "Test email from GSM Driving School",
      html: `<div style="font-family:Arial,Helvetica,sans-serif;padding:24px;color:#1a1a1a">
        <h2 style="margin:0 0 12px">It works! ✅</h2>
        <p>This is a test email sent from <strong>notify.gsmdrivingschool.com</strong> to confirm your email infrastructure is delivering correctly.</p>
        <p>If you received this in your inbox, deliverability is good.</p>
        <p style="color:#666;font-size:12px;margin-top:24px">— GSM Driving School</p>
      </div>`,
      text: "It works! This is a test email from notify.gsmdrivingschool.com to confirm deliverability. — GSM Driving School",
      purpose: "transactional",
      label: "deliverability-test",
      queued_at: new Date().toISOString(),
    };

    const { error } = await supabase.rpc("enqueue_email", {
      queue_name: "transactional_emails",
      payload,
    });
    if (error) throw new Error(error.message);

    return { ok: true as const, to: data.to, messageId: idempotencyKey };
  });
