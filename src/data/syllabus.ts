// ─────────────────────────────────────────────────────────────
// GSM Master Curriculum — single source of truth for the syllabus.
// Every learner topic in the Student Progress Tracker maps to an
// entry here. `lessonSlug` links to a built lesson in
// src/data/drivingLessons.tsx once it ships.
// ─────────────────────────────────────────────────────────────

import { drivingLessons } from "@/data/drivingLessons";

export type SyllabusStatus = "ready" | "planned";

export type SyllabusItem = {
  key: string;           // stable id used by progress tracker
  category: string;      // grouping shown in the tracker
  title: string;         // learner-facing title
  lessonSlug?: string;   // matches drivingLessons[].slug when built
};

// Ordered top-to-bottom in learner sequence.
export const syllabus: SyllabusItem[] = [
  // Foundations
  { key: "cockpit-drill",        category: "Foundations", title: "Cockpit Drill (DSSSM)", lessonSlug: "dsssm-cockpit-drill" },
  { key: "moving-off-stopping",  category: "Foundations", title: "Moving Off & Stopping" },
  { key: "mirrors",              category: "Foundations", title: "Mirrors & Mirror Checks" },
  { key: "mspsl",                category: "Foundations", title: "MSPSL Routine" },
  { key: "steering",             category: "Foundations", title: "Steering" },
  { key: "clutch-control",       category: "Foundations", title: "Clutch Control" },
  { key: "gears",                category: "Foundations", title: "Gears" },
  { key: "hill-starts",          category: "Foundations", title: "Hill Starts" },

  // Junctions & Roundabouts
  { key: "junctions-overview",   category: "Junctions", title: "Junctions — Overview" },
  { key: "open-junctions",       category: "Junctions", title: "Open Junctions" },
  { key: "closed-junctions",     category: "Junctions", title: "Closed Junctions" },
  { key: "t-junctions",          category: "Junctions", title: "T-Junctions" },
  { key: "crossroads",           category: "Junctions", title: "Crossroads", lessonSlug: "crossroads" },
  { key: "give-way-lines",       category: "Junctions", title: "Give Way Lines", lessonSlug: "give-way-lines" },
  { key: "mini-roundabouts",     category: "Roundabouts", title: "Mini Roundabouts", lessonSlug: "mini-roundabouts" },
  { key: "normal-roundabouts",   category: "Roundabouts", title: "Normal Roundabouts" },
  { key: "spiral-roundabouts",   category: "Roundabouts", title: "Spiral Roundabouts" },
  { key: "unorthodox-roundabouts", category: "Roundabouts", title: "Unorthodox Roundabouts", lessonSlug: "unorthodox-roundabouts" },

  // Road types & positioning
  { key: "dual-carriageways",    category: "Road Types", title: "Dual Carriageways", lessonSlug: "joining-dual-carriageway" },
  { key: "motorways",            category: "Road Types", title: "Motorways" },
  { key: "lane-discipline",      category: "Road Types", title: "Lane Discipline" },
  { key: "lane-positioning",     category: "Road Types", title: "Lane Positioning" },
  { key: "road-positioning",     category: "Road Types", title: "Road Positioning" },
  { key: "meeting-traffic",      category: "Road Types", title: "Meeting Traffic" },
  { key: "meeting-small-spaces", category: "Road Types", title: "Meeting in Small Spaces", lessonSlug: "meeting-in-small-spaces" },
  { key: "passing-parked",       category: "Road Types", title: "Passing Parked Cars", lessonSlug: "passing-parked-vehicles" },
  { key: "clearance",            category: "Road Types", title: "Clearance & Safety Margins" },

  // Traffic systems
  { key: "speed-management",     category: "Traffic Systems", title: "Speed Management" },
  { key: "following-distance",   category: "Traffic Systems", title: "Following Distance" },
  { key: "overtaking",           category: "Traffic Systems", title: "Overtaking" },
  { key: "traffic-lights",       category: "Traffic Systems", title: "Traffic Lights" },
  { key: "box-junctions",        category: "Traffic Systems", title: "Yellow Box Junctions", lessonSlug: "yellow-box-junctions" },
  { key: "bus-lanes",            category: "Traffic Systems", title: "Bus Lanes", lessonSlug: "bus-awareness" },
  { key: "cycle-lanes",          category: "Traffic Systems", title: "Cycle Lanes" },
  { key: "one-way-systems",      category: "Traffic Systems", title: "One-Way Systems" },
  { key: "slip-roads",           category: "Traffic Systems", title: "Slip Roads" },
  { key: "emergency-vehicles",   category: "Traffic Systems", title: "Emergency Vehicles" },

  // Crossings
  { key: "crossings-overview",   category: "Crossings", title: "Pedestrian Crossings — Overview" },
  { key: "zebra-crossing",       category: "Crossings", title: "Zebra Crossings" },
  { key: "pelican-crossing",     category: "Crossings", title: "Pelican Crossings" },
  { key: "puffin-crossing",      category: "Crossings", title: "Puffin Crossings" },
  { key: "toucan-crossing",      category: "Crossings", title: "Toucan Crossings" },
  { key: "pegasus-crossing",     category: "Crossings", title: "Pegasus Crossings" },

  // GSM Method
  { key: "hazard-perception",    category: "GSM Method", title: "Hazard Perception" },
  { key: "observation-technique", category: "GSM Method", title: "Observation Techniques" },
  { key: "scanning-15-70-15",    category: "GSM Method", title: "15-70-15 Scanning" },
  { key: "stretch-vision",       category: "GSM Method", title: "Stretch Your Vision", lessonSlug: "stretch-your-vision" },
  { key: "plan-stop-look-go",    category: "GSM Method", title: "Plan to Stop, Look to Go", lessonSlug: "plan-to-stop-look-to-go" },
  { key: "bgo",                  category: "GSM Method", title: "BGO — Blockers, Gap, Opportunity", lessonSlug: "bgo-system" },
  { key: "defensive-driving",    category: "GSM Method", title: "Defensive Driving" },
  { key: "eco-driving",          category: "GSM Method", title: "Eco Driving" },
  { key: "pom-routine",          category: "GSM Method", title: "POM — Preparation, Observation, Manoeuvre", lessonSlug: "pom-routine" },

  // Advanced conditions
  { key: "weather-driving",      category: "Advanced Conditions", title: "Weather Driving" },
  { key: "night-driving",        category: "Advanced Conditions", title: "Night Driving" },
  { key: "independent-driving",  category: "Advanced Conditions", title: "Independent Driving" },
  { key: "sat-nav-driving",      category: "Advanced Conditions", title: "Sat-Nav Driving" },
  { key: "show-me-tell-me",      category: "Advanced Conditions", title: "Show Me / Tell Me" },

  // Manoeuvres
  { key: "bay-parking",          category: "Manoeuvres", title: "Bay Parking" },
  { key: "parallel-parking",     category: "Manoeuvres", title: "Parallel Parking", lessonSlug: "parallel-parking" },
  { key: "forward-bay-parking",  category: "Manoeuvres", title: "Forward Bay Parking" },
  { key: "reverse-bay-parking",  category: "Manoeuvres", title: "Reverse Bay Parking" },
  { key: "pull-up-right-reverse", category: "Manoeuvres", title: "Pull Up on the Right & Reverse" },
  { key: "pull-up-left",         category: "Manoeuvres", title: "Pull Up on the Left", lessonSlug: "pull-up-on-left" },
  { key: "emergency-stop",       category: "Manoeuvres", title: "Emergency Stop" },

  // Test preparation
  { key: "mock-tests",           category: "Test Prep", title: "Mock Tests" },
  { key: "test-preparation",     category: "Test Prep", title: "Test Preparation" },
  { key: "highway-code",         category: "Test Prep", title: "Highway Code" },
  { key: "road-signs",           category: "Test Prep", title: "Road Signs" },
  { key: "road-markings",        category: "Test Prep", title: "Road Markings" },
  { key: "warning-lights",       category: "Vehicle", title: "Vehicle Warning Lights" },
  { key: "tyres",                category: "Vehicle", title: "Tyres" },
  { key: "basic-maintenance",    category: "Vehicle", title: "Basic Car Maintenance" },
];

export type SyllabusItemResolved = SyllabusItem & {
  status: SyllabusStatus;
  lesson?: (typeof drivingLessons)[number];
};

export function resolveSyllabus(): SyllabusItemResolved[] {
  return syllabus.map((item) => {
    const lesson = item.lessonSlug
      ? drivingLessons.find((l) => l.slug === item.lessonSlug)
      : undefined;
    return {
      ...item,
      lesson,
      status: lesson ? "ready" : "planned",
    };
  });
}

export function syllabusCoverage() {
  const items = resolveSyllabus();
  const total = items.length;
  const ready = items.filter((i) => i.status === "ready").length;
  return { total, ready, planned: total - ready, pct: total ? Math.round((ready / total) * 100) : 0 };
}