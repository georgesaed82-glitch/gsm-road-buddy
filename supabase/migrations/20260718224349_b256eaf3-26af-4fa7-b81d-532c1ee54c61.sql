-- Replace placeholder instructors with real GSM Driving School team.
-- Clean up storage-linked images first, then reseed with real profiles.

DELETE FROM public.instructors;

INSERT INTO public.instructors
  (name, role, bio, initials, color, rating, reviews, location, badges, cta_href, order_index, enabled)
VALUES
  (
    'George',
    'ADI · Automatic Driving Instructor',
    E'Founder of GSM Driving School and long-established West London driving instructor.\n\nStandard rate: £70 per hour\n12-hour package: £65 per hour (booked in advance)',
    'G',
    'bg-primary/10 text-primary',
    NULL, NULL, NULL,
    ARRAY['ADI','Automatic']::text[],
    '/contact', 0, true
  ),
  (
    'Michael',
    'ADI · Manual Driving Instructor',
    E'35 years'' experience teaching learners across West London in a manual car.\n\nStandard rate: £60 per hour\n12-hour package: £57 per hour (booked in advance)',
    'M',
    'bg-accent/15 text-accent',
    NULL, NULL, NULL,
    ARRAY['ADI','Manual']::text[],
    '/contact', 1, true
  ),
  (
    'Rana',
    'ADI · Manual & Automatic Driving Instructor',
    E'23 years'' experience — teaches both manual and automatic learners with a calm, structured approach.\n\nStandard rate: £60 per hour\n12-hour package: £57 per hour (booked in advance)',
    'R',
    'bg-primary/10 text-primary',
    NULL, NULL, NULL,
    ARRAY['ADI','Manual','Automatic']::text[],
    '/contact', 2, true
  ),
  (
    'Ikeel',
    'ADI · Manual Driving Instructor',
    E'5 years'' experience delivering patient, confidence-building manual lessons.\n\nStandard rate: £50 per hour\n12-hour package: £48 per hour (booked in advance)',
    'I',
    'bg-accent/15 text-accent',
    NULL, NULL, NULL,
    ARRAY['ADI','Manual']::text[],
    '/contact', 3, true
  ),
  (
    'Abdul',
    'PDI · Automatic Driving Instructor',
    E'1 year''s experience as a Potential Driving Instructor (PDI), supervised to DVSA standards.\n\nStandard rate: £45 per hour\n12-hour package: £40 per hour (booked in advance)',
    'A',
    'bg-primary/10 text-primary',
    NULL, NULL, NULL,
    ARRAY['PDI','Automatic']::text[],
    '/contact', 4, true
  );
