SELECT public.enqueue_email('transactional_emails', jsonb_build_object(
  'message_id', 'deliverability-test-' || gen_random_uuid()::text,
  'to', 'gsmdrivingschool@outlook.com',
  'from', 'GSM Driving School <notify@notify.gsmdrivingschool.com>',
  'sender_domain', 'notify.gsmdrivingschool.com',
  'subject', 'Test email from GSM Driving School',
  'html', '<div style="font-family:Inter,Arial,sans-serif;padding:24px;color:#1a1a1a"><h2 style="margin:0 0 12px">It works! ✅</h2><p>This is a test email sent from <strong>notify.gsmdrivingschool.com</strong> to confirm your email infrastructure is delivering correctly.</p><p>If you received this in your inbox, deliverability is good.</p><p style="color:#666;font-size:12px;margin-top:24px">— GSM Driving School</p></div>',
  'text', 'It works! This is a test email from notify.gsmdrivingschool.com to confirm deliverability. — GSM Driving School',
  'purpose', 'transactional',
  'label', 'deliverability-test',
  'queued_at', now()
));