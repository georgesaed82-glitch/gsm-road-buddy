export interface AreaPage {
  slug: string;
  area: string;
  postcode: string;
  nearbyPostcodes: string[];
  intro: string;
  highlights: string[];
  routes: string;
  faqs: { q: string; a: string }[];
  /** Hidden from public listings until the owner confirms coverage. */
  pendingConfirmation?: boolean;
  /** ISO date of the last substantive content change (used for sitemap lastmod). */
  lastModified?: string;
}

export const areas: AreaPage[] = [
  {
    slug: "notting-hill",
    area: "Notting Hill",
    postcode: "W11",
    nearbyPostcodes: ["W2", "W8", "W10", "W14"],
    lastModified: "2026-10-06",
    intro:
      "Driving lessons in Notting Hill (W11) from GSM Driving School, based in W11 and teaching West London since 2005. Automatic lessons with George, manual lessons with the GSM team.",
    highlights: [
      "Notting Hill Gate is one of our usual meeting options — the exact point is agreed when you book",
      "Patient one-to-one lessons for beginners, nervous learners and test preparation",
      "Two-hour lessons, £45–£70 per hour depending on instructor and area",
    ],
    routes:
      "Each two-hour lesson follows your stage: control and confidence first, then junctions, roundabouts, busier traffic and independent driving, building towards test standard at a pace agreed with your instructor.",
    faqs: [
      {
        q: "Where do lessons start in Notting Hill?",
        a: "Notting Hill Gate is a common meeting option. Tell us your postcode and we'll agree a convenient meeting point and time that suits the instructor's availability.",
      },
      {
        q: "Which test centre will I use?",
        a: "Test centres are agreed with your instructor. George usually teaches towards Greenford, Southall and Isleworth.",
      },
      {
        q: "What are the lesson terms?",
        a: "Lessons are two hours, paid in advance when you book, and our public range is £45–£70 per hour depending on the instructor and area. We ask for at least 48 hours' notice to cancel or reschedule.",
      },
    ],
  },
  {
    slug: "kensington",
    area: "High Street Kensington",
    postcode: "W8",
    nearbyPostcodes: ["W11", "W14"],
    lastModified: "2026-10-06",
    intro:
      "Driving lessons in High Street Kensington (W8) with GSM Driving School, established 2005. Patient one-to-one tuition — automatic with George or manual with the GSM team — from an agreed High Street Kensington meeting point.",
    highlights: [
      "Meet at an agreed point in High Street Kensington — arranged when you book",
      "Calm, clear teaching for beginners and nervous learners, plus test preparation",
      "20+ years teaching across West London",
    ],
    routes:
      "Lessons are planned around your level: early sessions focus on car control and confidence, then we build up to busier junctions, roundabouts and independent driving, and finally test preparation.",
    faqs: [
      {
        q: "Where will we meet for lessons in High Street Kensington?",
        a: "We agree a meeting point in High Street Kensington when you book. GSM has no office in W8 — we simply meet you at a convenient, agreed spot.",
      },
      {
        q: "Do you teach automatic and manual?",
        a: "Yes. Automatic lessons are with George, and manual lessons are with the GSM team.",
      },
      {
        q: "How do I book?",
        a: "Call or WhatsApp 07961 585231, or send an enquiry, with your postcode and the times that suit you. We'll confirm availability and a meeting point.",
      },
      {
        q: "What are the lesson terms?",
        a: "Lessons are two hours, paid in advance when you book, and our public range is £45–£70 per hour depending on the instructor and area. We ask for at least 48 hours' notice to cancel or reschedule.",
      },
    ],
  },
  {
    slug: "holland-park",
    area: "Holland Park",
    postcode: "W14",
    nearbyPostcodes: ["W11", "W8", "W12"],
    lastModified: "2026-10-06",
    intro:
      "Driving lessons in Holland Park (W14) with GSM Driving School, right next to our W11 base. Manual and automatic lessons, one-to-one, from an agreed Holland Park meeting point.",
    highlights: [
      "Holland Park is one of our usual meeting options — agreed when you book",
      "Automatic with George, manual with the GSM team",
      "Teaching West London since 2005",
    ],
    routes:
      "We start where you are: quieter practice for first-time drivers, then progressively busier West London traffic, manoeuvres and independent driving as you approach test standard.",
    faqs: [
      {
        q: "Can we meet near Holland Park?",
        a: "Yes, Holland Park is one of our known meeting options. The exact point and time are agreed with you when you book.",
      },
      {
        q: "Is it suitable for nervous beginners?",
        a: "Yes. Lessons are patient and one-to-one, and we only move on to busier roads when you're ready.",
      },
      {
        q: "How long is each lesson?",
        a: "Every lesson is two hours, paid in advance at booking. Please give at least 48 hours' notice to cancel or reschedule.",
      },
    ],
  },
  {
    slug: "north-kensington",
    area: "North Kensington",
    postcode: "W10",
    nearbyPostcodes: ["W11", "W12", "W2"],
    lastModified: "2026-10-06",
    intro:
      "Driving lessons in North Kensington (W10) with GSM Driving School — teaching West London since 2005. Send us an enquiry and we'll agree a convenient meeting point.",
    highlights: [
      "Next door to our W11 base — enquire to agree a meeting point",
      "Automatic with George, manual with the GSM team",
      "Patient one-to-one lessons, beginners to test preparation",
    ],
    routes:
      "Two-hour lessons are tailored to your stage, from first-time control through to busier roads, independent driving and test preparation.",
    faqs: [
      {
        q: "Do you teach in North Kensington?",
        a: "Yes. Send a WhatsApp or enquiry with your postcode and we'll agree a meeting point and a time that works.",
      },
      {
        q: "Do you offer automatic lessons in W10?",
        a: "Yes — automatic lessons with George and manual lessons with the GSM team, subject to availability.",
      },
      {
        q: "What do lessons cost?",
        a: "Lessons are two hours, paid in advance when you book, and our public range is £45–£70 per hour depending on the instructor and area. We ask for at least 48 hours' notice to cancel or reschedule.",
      },
    ],
  },
  {
    slug: "bayswater",
    area: "Bayswater",
    postcode: "W2",
    nearbyPostcodes: ["W11", "W10"],
    lastModified: "2026-10-06",
    intro:
      "Driving lessons in Bayswater (W2) with GSM Driving School, established 2005. Manual and automatic lessons from an agreed Bayswater or Paddington meeting point.",
    highlights: [
      "Bayswater and Paddington are usual meeting options — agreed when you book",
      "Calm, structured lessons — ideal for first-time and nervous learners",
      "Two-hour lessons paid in advance at booking",
    ],
    routes:
      "Lessons move from the basics to confident everyday driving in central West London traffic, with test preparation once you're ready.",
    faqs: [
      {
        q: "Can we meet near Paddington?",
        a: "Yes — Bayswater and Paddington are both known meeting options. We agree the exact point when you book.",
      },
      {
        q: "How quickly can I start?",
        a: "It depends on instructor availability. Message us with your postcode and preferred times and we'll let you know the next available lessons.",
      },
      {
        q: "Which test centre will I use?",
        a: "Test centres are agreed with your instructor. George usually teaches towards Greenford, Southall and Isleworth.",
      },
    ],
  },
  {
    slug: "shepherds-bush",
    area: "Shepherd's Bush",
    postcode: "W12",
    nearbyPostcodes: ["W14", "W11", "W10"],
    lastModified: "2026-10-06",
    intro:
      "Driving lessons in Shepherd's Bush (W12) with GSM Driving School. Patient one-to-one tuition, manual and automatic, from an agreed Shepherd's Bush or Westfield meeting point.",
    highlights: [
      "Shepherd's Bush and Westfield are usual meeting options — agreed when you book",
      "Automatic with George, manual with the GSM team",
      "Teaching West London since 2005",
    ],
    routes:
      "Each lesson builds on the last — from control and observation to multi-lane traffic, roundabouts, manoeuvres and independent driving, then test preparation.",
    faqs: [
      {
        q: "Which test centre will I use?",
        a: "Test centres are agreed with your instructor. George usually teaches towards Greenford, Southall and Isleworth.",
      },
      {
        q: "Are lessons one-to-one?",
        a: "Yes, always one-to-one. Automatic lessons are with George; manual lessons are with an instructor from the GSM team.",
      },
      {
        q: "What are the lesson terms?",
        a: "Lessons are two hours, paid in advance when you book, and our public range is £45–£70 per hour depending on the instructor and area. We ask for at least 48 hours' notice to cancel or reschedule.",
      },
    ],
  },
  {
    slug: "chiswick",
    pendingConfirmation: true,
    area: "Chiswick",
    postcode: "W4",
    nearbyPostcodes: ["W3", "W6", "W12"],
    intro:
      "Driving lessons in Chiswick (W4) with GSM Driving School. Door-to-door pickup, manual and automatic, structured lesson plans.",
    highlights: [
      "Pickup across W4 — Chiswick High Road, Turnham Green, Grove Park",
      "Lessons routed through Hounslow & Isleworth test areas",
      "20+ years teaching across West London",
    ],
    routes:
      "We use Chiswick High Road for traffic flow, the Grove Park residential grid for manoeuvres, and short hops to the Hogarth Roundabout and Hammersmith one-way system.",
    faqs: [
      {
        q: "Do you teach at Hounslow test centre?",
        a: "Yes — most Chiswick learners book their test at Hounslow or Isleworth, and we drill the local routes before test day.",
      },
      {
        q: "Do you offer intensive courses?",
        a: "Yes — speak to us on WhatsApp and we'll design a plan around your timeline.",
      },
    ],
  },
  {
    slug: "fulham",
    pendingConfirmation: true,
    area: "Fulham",
    postcode: "SW6",
    nearbyPostcodes: ["SW10", "W14", "W6"],
    intro:
      "Driving lessons in Fulham (SW6) with a calm, DVSA-approved instructor. Manual and automatic, beginners welcome.",
    highlights: [
      "Pickup across SW6 — Fulham Broadway, Parsons Green, Putney Bridge",
      "Local routes practised every lesson",
      "Rated 5.0 from 147 Google reviews",
    ],
    routes:
      "We practise around Parsons Green, the New King's Road, Fulham Palace Road and the Wandsworth Bridge approach — ideal for building real-world confidence.",
    faqs: [
      {
        q: "Can you pick me up from Fulham Broadway?",
        a: "Yes — Fulham Broadway, Parsons Green and Putney Bridge are all in our SW6 pickup area.",
      },
      {
        q: "Do you teach motorway lessons?",
        a: "Yes — refresher and motorway lessons are available after your test.",
      },
    ],
  },
];

export const publicAreas = areas.filter((a) => !a.pendingConfirmation);

export function getArea(slug: string) {
  return areas.find((a) => a.slug === slug);
}
