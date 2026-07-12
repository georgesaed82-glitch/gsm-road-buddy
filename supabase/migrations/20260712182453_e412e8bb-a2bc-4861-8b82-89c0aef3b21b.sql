SELECT public.enqueue_email(
  'transactional_emails',
  jsonb_build_object(
    'message_id', 'admin-invite-helenaanfp-' || extract(epoch from now())::bigint,
    'idempotency_key', 'admin-invite-helenaanfp-' || extract(epoch from now())::bigint,
    'to', 'helenaanfp@gmail.com',
    'from', 'GSM Driving School <notify@notify.gsmdrivingschool.com>',
    'sender_domain', 'notify.gsmdrivingschool.com',
    'subject', 'Your GSM Plus developer account – temporary password inside',
    'html', '<!doctype html><html><body style="margin:0;padding:0;background:#F7F3E8;font-family:Arial,Helvetica,sans-serif;color:#1D2A22"><div style="max-width:560px;margin:0 auto;padding:32px 24px"><div style="background:#ffffff;border:1px solid #E7E1CF;border-radius:12px;padding:28px"><h1 style="margin:0 0 8px;color:#234B36;font-size:22px">Welcome to GSM Plus</h1><p style="margin:0 0 16px;font-size:15px;line-height:1.55">Hi Helena,</p><p style="margin:0 0 20px;font-size:15px;line-height:1.55">You have been invited to the GSM Plus admin portal as a <strong>Developer</strong>. Use the temporary credentials below to sign in for the first time. You will be asked to set a new password immediately after signing in.</p><div style="background:#F7F3E8;border:1px solid #E7E1CF;border-radius:8px;padding:16px 18px;margin:0 0 20px"><p style="margin:0 0 6px;font-size:13px;color:#6A746D">Sign-in email</p><p style="margin:0 0 14px;font-size:15px;font-weight:600">helenaanfp@gmail.com</p><p style="margin:0 0 6px;font-size:13px;color:#6A746D">Username</p><p style="margin:0 0 14px;font-size:15px;font-weight:600">Helena</p><p style="margin:0 0 6px;font-size:13px;color:#6A746D">Temporary password</p><p style="margin:0;font-size:18px;font-weight:700;letter-spacing:0.5px;color:#C97845;font-family:ui-monospace,Menlo,Consolas,monospace">GSM2026</p></div><p style="margin:0 0 20px;font-size:15px;line-height:1.55"><a href="https://www.gsmdrivingschool.com/auth?admin=1" style="display:inline-block;background:#234B36;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600">Sign in to GSM Plus</a></p><p style="margin:0;font-size:13px;color:#6A746D;line-height:1.55">For security, this temporary password must be changed on first sign-in. If you were not expecting this email, please ignore it or contact GSM Driving School.</p></div><p style="text-align:center;color:#6A746D;font-size:12px;margin:16px 0 0">GSM Driving School · gsmdrivingschool.com</p></div></body></html>',
    'text', 'Welcome to GSM Plus\n\nHi Helena,\n\nYou have been invited to the GSM Plus admin portal as a Developer. Sign-in email: helenaanfp@gmail.com\nUsername: Helena\nTemporary password: GSM2026\n\nSign in: https://www.gsmdrivingschool.com/auth?admin=1\n\nYou will be asked to set a new password on first sign-in.\n\n— GSM Driving School',
    'purpose', 'transactional',
    'label', 'admin-invite',
    'queued_at', now()
  )
);