export interface AreaPage {
  slug: string;
  area: string;
  postcode: string;
  nearbyPostcodes: string[];
  intro: string;
  highlights: string[];
  routes: string;
  faqs: { q: string; a: string }[];
}

export const areas: AreaPage[] = [
  {
    slug: "notting-hill",
    area: "Notting Hill",
    postcode: "W11",
    nearbyPostcodes: ["W2", "W8", "W10", "W14"],
    intro:
      "Driving lessons in Notting Hill with a DVSA-approved local instructor. Door-to-door pickup across W11 — manual and automatic, beginners to test ready.",
    highlights: [
      "Pickup from anywhere in W11 — Portobello Road, Ladbroke Grove, Westbourne Park",
      "20+ years teaching the Notting Hill, Holland Park and Kensington streets",
      "Practical lessons routed through real DVSA test areas",
    ],
    routes:
      "We practise the residential streets off Portobello Road and Ladbroke Grove, the busier flow on Holland Park Avenue and Notting Hill Gate, then move toward the test routes used by your chosen centre.",
    faqs: [
      {
        q: "Do you cover all of W11?",
        a: "Yes — we cover every W11 street and the surrounding W2, W8, W10 and W14 postcodes. Pickup is door-to-door for every lesson.",
      },
      {
        q: "Which test centre do Notting Hill learners use?",
        a: "Most Notting Hill learners take their test at Wood Green, Greenford or Goodmayes. We tailor lessons to the routes at whichever centre suits you.",
      },
    ],
  },
  {
    slug: "kensington",
    area: "Kensington",
    postcode: "W8",
    nearbyPostcodes: ["W11", "W14", "SW7"],
    intro:
      "Driving lessons in Kensington (W8). Patient, DVSA-approved instruction with 143 five-star Google reviews — manual and automatic, from first lesson to test pass.",
    highlights: [
      "Pickup from High Street Kensington, Kensington Church Street and Earls Court Road",
      "Built for nervous learners — calm, clear, repeatable lessons",
      "20+ years of West London experience",
    ],
    routes:
      "Lessons typically start on the quieter streets behind Kensington Square before progressing to High Street Kensington, Cromwell Road and the Earls Court one-way system.",
    faqs: [
      {
        q: "How long does it take to pass in Kensington?",
        a: "Most learners pass within 30–45 hours of lessons. We agree a realistic plan after your first session.",
      },
      {
        q: "Do you teach automatic?",
        a: "Yes — manual and automatic, with the same instructor through to test day.",
      },
    ],
  },
  {
    slug: "holland-park",
    area: "Holland Park",
    postcode: "W14",
    nearbyPostcodes: ["W11", "W8", "W12"],
    intro:
      "Driving lessons in Holland Park (W14) with a local instructor who knows every junction. Manual and automatic. Pickup from your door.",
    highlights: [
      "Pickup from Holland Park Avenue, Addison Road and Holland Road",
      "5.0 average from 143 Google reviews",
      "Same instructor first lesson to test",
    ],
    routes:
      "We use the residential grid off Holland Road for control, Holland Park Roundabout for confidence, and Shepherd's Bush for multi-lane practice.",
    faqs: [
      {
        q: "Can you pick me up from Holland Park station?",
        a: "Yes, station pickup is fine — most learners prefer door pickup from home or work.",
      },
      {
        q: "Is the area too busy for beginners?",
        a: "No — we start on the calmer side streets and only progress to the main roads when you're ready.",
      },
    ],
  },
  {
    slug: "bayswater",
    area: "Bayswater",
    postcode: "W2",
    nearbyPostcodes: ["W11", "W10", "NW1"],
    intro:
      "Driving lessons in Bayswater (W2). DVSA-approved local instructor, door-to-door pickup, manual and automatic.",
    highlights: [
      "Pickup from Queensway, Westbourne Grove and Lancaster Gate",
      "Calm, structured lessons — ideal for first-time learners",
      "20+ years teaching the W2 area",
    ],
    routes:
      "Bayswater Road, the Westbourne Grove backstreets and the Paddington one-way system are our main practice grounds, plus easy access to Marble Arch when you're test-ready.",
    faqs: [
      {
        q: "Do you teach near Paddington?",
        a: "Yes — Paddington, Lancaster Gate and Queensway are all in our W2 coverage.",
      },
      {
        q: "How quickly can I start?",
        a: "Usually within a week. Send a WhatsApp and we'll book your first lesson.",
      },
    ],
  },
  {
    slug: "shepherds-bush",
    area: "Shepherd's Bush",
    postcode: "W12",
    nearbyPostcodes: ["W14", "W11", "W6"],
    intro:
      "Driving lessons in Shepherd's Bush (W12). Patient instruction tailored to West London roads. Manual and automatic.",
    highlights: [
      "Pickup across Shepherd's Bush, White City and East Acton",
      "Practice on Westway, Wood Lane and the Shepherd's Bush roundabout",
      "Five-star Google rating",
    ],
    routes:
      "We work through Wood Lane, the Shepherd's Bush green one-way system, the Westway slip roads, and the residential streets of East Acton for manoeuvres.",
    faqs: [
      {
        q: "Which test centre is closest?",
        a: "Greenford is the most common choice for W12 learners — we'll teach the local test routes there.",
      },
      {
        q: "Are lessons one-to-one?",
        a: "Yes — always one-to-one with George, your named DVSA-approved instructor.",
      },
    ],
  },
  {
    slug: "chiswick",
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
    area: "Fulham",
    postcode: "SW6",
    nearbyPostcodes: ["SW10", "W14", "W6"],
    intro:
      "Driving lessons in Fulham (SW6) with a calm, DVSA-approved instructor. Manual and automatic, beginners welcome.",
    highlights: [
      "Pickup across SW6 — Fulham Broadway, Parsons Green, Putney Bridge",
      "Local routes practised every lesson",
      "Rated 5.0 from 143 Google reviews",
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

export function getArea(slug: string) {
  return areas.find((a) => a.slug === slug);
}