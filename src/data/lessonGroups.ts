import { drivingLessons } from "@/data/drivingLessons";

// ─────────────────────────────────────────────────────────────
// Full GSM syllabus taxonomy for the Practical Driving Animations
// page. Existing animated lessons are mapped in by slug; planned
// lessons appear as "coming soon" entries with their Highway Code
// rule reference so learners can see the whole roadmap.
// ─────────────────────────────────────────────────────────────

export type PlannedLesson = {
  slug: string;
  title: string;
  rule?: string;
  ruleNumbers?: number[]; // for the rule filter
  status: "ready" | "coming-soon";
};

export type LessonGroup = {
  id: string;
  title: string;
  blurb: string;
  lessons: PlannedLesson[];
};

function extract(rule?: string): number[] {
  if (!rule) return [];
  return Array.from(rule.matchAll(/(\d{1,4})/g)).map((m) => Number(m[1]));
}

function existing(slug: string): PlannedLesson | null {
  const l = drivingLessons.find((x) => x.slug === slug);
  if (!l) return null;
  return {
    slug: l.slug,
    title: l.title,
    rule: l.rule,
    ruleNumbers: extract(l.rule),
    status: "ready",
  };
}

function planned(slug: string, title: string, rule?: string): PlannedLesson {
  return { slug, title, rule, ruleNumbers: extract(rule), status: "coming-soon" };
}

function compact(items: (PlannedLesson | null)[]): PlannedLesson[] {
  return items.filter((x): x is PlannedLesson => x !== null);
}

export const lessonGroups: LessonGroup[] = [
  {
    id: "gsm-method",
    title: "GSM Driving Method",
    blurb: "The core habits every GSM learner is taught first.",
    lessons: compact([
      existing("stretch-your-vision"),
      existing("plan-to-stop-look-to-go"),
    ]),
  },
  {
    id: "speed",
    title: "Speed",
    blurb: "Choosing and adjusting the right speed for the road, weather and traffic.",
    lessons: compact([
      existing("speed-adjustment"),
      existing("two-second-rule"),
      planned("following-distance", "Following distance", "Rules 126, 260"),
      existing("going-uphill"),
      existing("going-downhill"),
      planned("speed-limits", "Speed limits explained", "Rules 124–125"),
      planned("stopping-distances", "Stopping distances", "Rule 126"),
    ]),
  },
  {
    id: "meeting",
    title: "Meeting situations",
    blurb: "Sharing tight roads with oncoming traffic and obstructions.",
    lessons: compact([
      planned("passing-parked-vehicles", "Passing parked vehicles", "Rules 163, 167"),
      planned("narrow-roads", "Narrow roads", "Rules 155, 163"),
      planned("priority-meeting", "Priority — who goes first?", "Rule 155"),
      existing("meeting-traffic"),
      planned("passing-places", "Passing places", "Rule 155"),
    ]),
  },
  {
    id: "junctions",
    title: "Junctions",
    blurb: "Emerging, turning and reading priorities at every kind of junction.",
    lessons: compact([
      existing("open-junction"),
      existing("closed-junction"),
      existing("keeping-junctions-clear"),
      planned("emerging-left", "Emerging left", "Rules 170–172"),
      planned("emerging-right", "Emerging right", "Rules 170–172"),
      planned("turning-left", "Turning left", "Rules 182–183"),
      planned("turning-right", "Turning right", "Rules 179–181"),
      planned("t-junctions", "T-junctions", "Rules 170–171"),
      planned("crossroads", "Crossroads", "Rules 170–181"),
    ]),
  },
  {
    id: "roundabouts",
    title: "Roundabouts",
    blurb: "Approach, lane choice, signalling and exiting — every roundabout style.",
    lessons: compact([
      existing("roundabouts"),
      planned("mini-roundabouts", "Mini roundabouts", "Rule 188"),
      planned("normal-roundabouts", "Normal roundabouts", "Rules 184–187"),
      planned("roundabout-lane-discipline", "Roundabout lane discipline", "Rule 186"),
      planned("spiral-roundabouts", "Spiral roundabouts", "Rule 186"),
      planned("roundabout-signalling", "Signalling at roundabouts", "Rule 186"),
      planned("exiting-safely", "Exiting safely", "Rule 186"),
    ]),
  },
  {
    id: "parking",
    title: "Parking",
    blurb: "Every test manoeuvre plus the parking situations you'll meet in real driving.",
    lessons: [
      planned("parallel-parking", "Parallel parking", "Rule 239"),
      planned("reverse-bay-parking", "Reverse bay parking", "Rule 239"),
      planned("forward-bay-parking", "Forward bay parking", "Rule 239"),
      planned("pull-up-on-right", "Pull up on the right", "Rules 200, 239"),
      planned("parking-on-hills", "Parking on hills", "Rule 252"),
    ],
  },
  {
    id: "overtaking",
    title: "Overtaking",
    blurb: "Judging the gap, the speed and who you're overtaking.",
    lessons: compact([
      existing("overtaking"),
      existing("blind-spots"),
      planned("overtaking-cyclists", "Overtaking cyclists", "Rules 163, 213"),
      planned("overtaking-horses", "Overtaking horses", "Rules 163, 214–215"),
      planned("overtaking-motorcyclists", "Overtaking motorcyclists", "Rules 163, 211–213"),
      planned("overtaking-large-vehicles", "Overtaking large vehicles", "Rules 163, 164, 222"),
    ]),
  },
  {
    id: "motorways",
    title: "Motorways & dual carriageways",
    blurb: "Higher speeds, lane discipline, smart-motorway signs and safe merging.",
    lessons: compact([
      existing("lane-discipline"),
      existing("lane-merging"),
      existing("motorway-changing-lanes"),
      planned("motorway-joining", "Joining a motorway", "Rules 259–260"),
      planned("motorway-leaving", "Leaving a motorway", "Rules 272–273"),
      planned("smart-motorways", "Smart motorways", "Rules 269–271"),
      planned("motorway-overtaking", "Motorway overtaking", "Rules 267–268"),
      planned("motorway-following-distance", "Motorway following distance", "Rule 264"),
    ]),
  },
  {
    id: "hazard-awareness",
    title: "Hazard awareness",
    blurb: "Reading vulnerable road users and conditions before they become a problem.",
    lessons: compact([
      existing("zebra-crossing"),
      planned("pedestrians", "Pedestrians", "Rules 204–210"),
      planned("school-areas", "School areas", "Rules 205, 208, 209"),
      planned("cyclists-awareness", "Cyclists", "Rules 211–213"),
      planned("weather-conditions", "Weather conditions", "Rules 226–237"),
      planned("night-driving", "Night driving", "Rules 113–116"),
    ]),
  },
];

export function totalReady(): number {
  return lessonGroups.reduce(
    (sum, g) => sum + g.lessons.filter((l) => l.status === "ready").length,
    0,
  );
}

export function totalPlanned(): number {
  return lessonGroups.reduce((sum, g) => sum + g.lessons.length, 0);
}

/** Ordered list of ready lesson slugs across the whole syllabus — for prev/next navigation. */
export function orderedReadySlugs(): string[] {
  return lessonGroups.flatMap((g) => g.lessons.filter((l) => l.status === "ready").map((l) => l.slug));
}