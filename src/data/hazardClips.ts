export type HazardClip = {
  slug: string;
  title: string;
  scenario: string;
  difficulty: "Easy" | "Medium" | "Hard";
  durationSeconds: number;
  developingHazard: string;
};

export const hazardClips: HazardClip[] = [
  {
    slug: "ladbroke-grove-cyclist",
    title: "Ladbroke Grove · cyclist emerging",
    scenario: "Quiet residential road, parked vans on the left.",
    difficulty: "Medium",
    durationSeconds: 38,
    developingHazard: "Cyclist appearing from between parked vans",
  },
  {
    slug: "kensington-school-run",
    title: "Kensington · school run",
    scenario: "Wet morning approach to a primary school zone.",
    difficulty: "Hard",
    durationSeconds: 42,
    developingHazard: "Child stepping out from behind a 4x4",
  },
  {
    slug: "holland-park-roundabout",
    title: "Holland Park · mini roundabout",
    scenario: "Busy weekday roundabout with a delivery cyclist.",
    difficulty: "Medium",
    durationSeconds: 35,
    developingHazard: "Cyclist crossing your exit",
  },
  {
    slug: "notting-hill-bus",
    title: "Notting Hill Gate · bus stop",
    scenario: "Approaching a stationary bus on a busy high street.",
    difficulty: "Hard",
    durationSeconds: 40,
    developingHazard: "Pedestrian crossing from front of bus",
  },
  {
    slug: "shepherds-bush-junction",
    title: "Shepherd's Bush · uncontrolled junction",
    scenario: "Side road on the left with restricted visibility.",
    difficulty: "Easy",
    durationSeconds: 33,
    developingHazard: "Vehicle pulling out of side road",
  },
  {
    slug: "westway-merge",
    title: "Westway · slip road merge",
    scenario: "Merging onto the A40 in moderate traffic.",
    difficulty: "Hard",
    durationSeconds: 45,
    developingHazard: "Vehicle braking suddenly in the live lane",
  },
];
