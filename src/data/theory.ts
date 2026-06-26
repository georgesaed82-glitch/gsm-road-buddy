export type TheoryCategory = {
  slug: string;
  title: string;
  description: string;
  totalQuestions: number;
  topics: string[];
};

export const theoryCategories: TheoryCategory[] = [
  {
    slug: "alertness",
    title: "Alertness",
    description: "Observation, anticipation and concentration on the road.",
    totalQuestions: 82,
    topics: ["Mirror checks", "Blind spots", "Distractions", "Tiredness"],
  },
  {
    slug: "attitude",
    title: "Attitude",
    description: "Courtesy, consideration and your responsibility to other road users.",
    totalQuestions: 71,
    topics: ["Following distance", "Priority", "Aggressive driving", "Emergency vehicles"],
  },
  {
    slug: "safety-and-vehicle",
    title: "Safety & your vehicle",
    description: "Daily checks, defects, loading and environmental driving.",
    totalQuestions: 119,
    topics: ["Tyres", "Lights", "Fluids", "Eco driving", "Security"],
  },
  {
    slug: "safety-margins",
    title: "Safety margins",
    description: "Stopping distances and how weather changes them.",
    totalQuestions: 64,
    topics: ["Wet roads", "Snow & ice", "Fog", "Skid recovery"],
  },
  {
    slug: "hazard-awareness",
    title: "Hazard awareness",
    description: "Spotting developing hazards before they become emergencies.",
    totalQuestions: 103,
    topics: ["Pedestrians", "Cyclists", "Junctions", "Parked cars"],
  },
  {
    slug: "vulnerable-road-users",
    title: "Vulnerable road users",
    description: "Children, older drivers, motorcyclists and horse riders.",
    totalQuestions: 88,
    topics: ["Crossings", "Schools", "Horses", "Mobility scooters"],
  },
  {
    slug: "other-vehicles",
    title: "Other types of vehicle",
    description: "Sharing the road with lorries, buses, trams and motorcycles.",
    totalQuestions: 42,
    topics: ["Blind spots on HGVs", "Bus lanes", "Tram tracks"],
  },
  {
    slug: "road-conditions",
    title: "Road & traffic signs",
    description: "Warning, regulatory, informational signs and road markings.",
    totalQuestions: 156,
    topics: ["Triangle signs", "Circle signs", "Markings", "Variable signs"],
  },
  {
    slug: "essential-documents",
    title: "Documents & rules",
    description: "Licences, MOT, insurance and the legal side of driving.",
    totalQuestions: 49,
    topics: ["Licence categories", "MOT", "Insurance", "VED"],
  },
  {
    slug: "incidents",
    title: "Incidents & emergencies",
    description: "First aid basics, breakdowns and what to do at the scene.",
    totalQuestions: 67,
    topics: ["First aid", "Fire", "Breakdowns", "Tunnels"],
  },
];

export type TheoryQuestion = {
  id: string;
  category: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export const sampleTheoryQuestions: TheoryQuestion[] = [
  {
    id: "q1",
    category: "alertness",
    question: "You're approaching a junction with parked cars on both sides. What should you do?",
    options: [
      "Speed up to clear the area quickly",
      "Cover the brake and look for pedestrians stepping out",
      "Sound your horn continuously",
      "Move to the centre of the road and accelerate",
    ],
    correctIndex: 1,
    explanation: "Parked cars hide pedestrians. Cover the brake and scan low between vehicles for feet and movement.",
  },
  {
    id: "q2",
    category: "safety-margins",
    question: "In wet weather, your stopping distance is roughly…",
    options: ["The same as dry", "Twice the dry distance", "Five times the dry distance", "Ten times the dry distance"],
    correctIndex: 1,
    explanation: "Wet roads roughly double stopping distance. Ice can multiply it by ten.",
  },
  {
    id: "q3",
    category: "hazard-awareness",
    question: "A ball rolls out from between parked cars. What is the most likely next hazard?",
    options: ["A cat chasing it", "A child running after it", "Litter blowing across", "A cyclist swerving"],
    correctIndex: 1,
    explanation: "Always treat a ball in the road as a child about to follow. Brake and prepare to stop.",
  },
  {
    id: "q4",
    category: "attitude",
    question: "A vehicle behind is following too closely. You should…",
    options: [
      "Brake sharply to teach them a lesson",
      "Speed up to get away",
      "Ease off the accelerator to increase your gap to the car in front",
      "Wave them past while in a queue",
    ],
    correctIndex: 2,
    explanation: "Build a bigger cushion in front so you can brake gently if you need to, giving the tailgater room to react.",
  },
  {
    id: "q5",
    category: "vulnerable-road-users",
    question: "When passing a horse rider, you should…",
    options: [
      "Sound your horn so they know you're there",
      "Pass slowly and leave at least 2 metres of space",
      "Rev your engine to scare the horse forward",
      "Overtake on a blind bend if traffic is clear",
    ],
    correctIndex: 1,
    explanation: "Highway Code rule: slow to 10mph and leave at least 2 metres. Never sound the horn.",
  },
];
