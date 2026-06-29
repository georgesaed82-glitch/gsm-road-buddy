export type TheoryCategory = {
  slug: string;
  title: string;
  description: string;
  totalQuestions: number;
  topics: string[];
  keyPoints: string[];
};

export const theoryCategories: TheoryCategory[] = [
  {
    slug: "alertness",
    title: "Alertness",
    description: "Observation, anticipation and concentration on the road.",
    totalQuestions: 82,
    topics: ["Mirror checks", "Blind spots", "Distractions", "Tiredness"],
    keyPoints: [
      "Mirror–Signal–Manoeuvre before every change of speed or direction.",
      "Take a 15-minute break every 2 hours on long drives.",
      "No phone in your hand — even at the lights. It's 6 points and £200.",
      "Scan far, middle, near and check mirrors every 5–8 seconds.",
    ],
  },
  {
    slug: "attitude",
    title: "Attitude",
    description: "Courtesy, consideration and your responsibility to other road users.",
    totalQuestions: 71,
    topics: ["Following distance", "Priority", "Aggressive driving", "Emergency vehicles"],
    keyPoints: [
      "Two-second rule on dry roads, four seconds when wet, ten in ice.",
      "Never use your horn aggressively or between 11:30pm and 7am in built-up areas.",
      "Move left and slow down for blue lights — don't brake hard or mount the kerb.",
      "Let buses pull out from bus stops in 20/30mph zones.",
    ],
  },
  {
    slug: "safety-and-vehicle",
    title: "Safety and your vehicle",
    description: "Daily checks, defects, loading and environmental driving.",
    totalQuestions: 119,
    topics: ["Tyres", "Lights", "Fluids", "Eco driving", "Security"],
    keyPoints: [
      "Minimum tyre tread depth is 1.6mm across the central ¾ of the tyre.",
      "POWDERY check: Petrol, Oil, Water, Damage, Electrics, Rubber, Yourself.",
      "Smooth acceleration and early gear changes cut fuel by up to 15%.",
      "Always remove the key and lock the car — even on your own drive.",
    ],
  },
  {
    slug: "safety-margins",
    title: "Safety margins",
    description: "Stopping distances and how weather changes them.",
    totalQuestions: 64,
    topics: ["Wet roads", "Snow & ice", "Fog", "Skid recovery"],
    keyPoints: [
      "Stopping distances: 20mph = 12m, 30mph = 23m, 40mph = 36m, 50mph = 53m, 60mph = 73m, 70mph = 96m.",
      "Wet roads double stopping distance. Ice multiplies it by ten.",
      "In a skid, ease off the accelerator and steer gently into the skid.",
      "Use dipped headlights in fog — fog lights only when visibility is under 100m.",
    ],
  },
  {
    slug: "hazard-awareness",
    title: "Hazard awareness",
    description: "Spotting developing hazards before they become emergencies.",
    totalQuestions: 103,
    topics: ["Pedestrians", "Cyclists", "Junctions", "Parked cars"],
    keyPoints: [
      "A static hazard becomes a developing hazard the moment it could make you change speed or direction.",
      "Treat a ball in the road as a child about to follow.",
      "Scan low between parked cars for feet and movement.",
      "Anticipate — don't react. Cover the brake when in doubt.",
    ],
  },
  {
    slug: "vulnerable-road-users",
    title: "Vulnerable road users",
    description: "Children, older drivers, motorcyclists and horse riders.",
    totalQuestions: 88,
    topics: ["Crossings", "Schools", "Horses", "Mobility scooters"],
    keyPoints: [
      "Give cyclists at least 1.5m of space at up to 30mph, more at higher speeds.",
      "Pass horses at no more than 10mph and leave at least 2m. Never sound the horn.",
      "Stop completely at zebra crossings when someone is waiting.",
      "Children, elderly and disabled pedestrians may take longer to cross — wait patiently.",
    ],
  },
  {
    slug: "other-vehicles",
    title: "Other types of vehicle",
    description: "Sharing the road with lorries, buses, trams and motorcycles.",
    totalQuestions: 42,
    topics: ["Blind spots on HGVs", "Bus lanes", "Tram tracks"],
    keyPoints: [
      "Stay out of HGV blind spots — if you can't see the driver's mirrors, they can't see you.",
      "Give long vehicles extra room when they're turning — they swing out.",
      "Don't drive in bus lanes during their hours of operation.",
      "Trams have priority and can't steer around you.",
    ],
  },
  {
    slug: "vehicle-handling",
    title: "Vehicle handling",
    description: "Driving in different weather, road and light conditions.",
    totalQuestions: 78,
    topics: ["Night driving", "Country roads", "Wet & ice", "Wind"],
    keyPoints: [
      "Use dipped headlights in poor daytime visibility.",
      "On unlit roads, use full beam but dip for oncoming traffic and when following.",
      "Slow down before a bend, accelerate gently out of it.",
      "High winds: grip the wheel firmly, especially passing high-sided vehicles.",
    ],
  },
  {
    slug: "motorway-rules",
    title: "Motorway rules",
    description: "Joining, lane discipline, smart motorways and breakdowns.",
    totalQuestions: 95,
    topics: ["Joining & leaving", "Lane discipline", "Smart motorways", "Breakdowns"],
    keyPoints: [
      "Match the speed of motorway traffic before joining from the slip road.",
      "Keep left unless overtaking. Middle-lane hogging is a £100 fine and 3 points.",
      "Red X means lane closed — do not drive in it.",
      "If you break down, get behind the barrier and call 999 if you can't reach a refuge area.",
    ],
  },
  {
    slug: "rules-of-the-road",
    title: "Rules of the road",
    description: "Speed limits, junctions, overtaking, parking and one-way streets.",
    totalQuestions: 112,
    topics: ["Speed limits", "Junctions", "Overtaking", "Parking"],
    keyPoints: [
      "Default limits: 30 in built-up, 60 single carriageway, 70 dual & motorway.",
      "Never overtake on the approach to a junction, bend, brow of a hill or zebra.",
      "Don't park within 10m of a junction or on zig-zag lines.",
      "At a roundabout, give priority to traffic coming from your right.",
    ],
  },
  {
    slug: "road-conditions",
    title: "Road and traffic signs",
    description: "Warning, regulatory, informational signs and road markings.",
    totalQuestions: 156,
    topics: ["Triangle signs", "Circle signs", "Markings", "Variable signs"],
    keyPoints: [
      "Circles give orders. Triangles warn. Rectangles inform.",
      "Red circle = prohibition. Blue circle = mandatory action.",
      "Solid white line in the middle of the road = do not cross to overtake.",
      "Yellow box junction — only enter if your exit is clear.",
    ],
  },
  {
    slug: "essential-documents",
    title: "Essential documents",
    description: "Licences, MOT, insurance and the legal side of driving.",
    totalQuestions: 49,
    topics: ["Licence categories", "MOT", "Insurance", "VED"],
    keyPoints: [
      "You must hold a valid licence, insurance and (if over 3 years) MOT to drive.",
      "Tell DVLA within 7 days if you change address or have a notifiable medical condition.",
      "New drivers can lose their licence at 6 penalty points in the first 2 years.",
      "Always carry your licence, or produce it at a station within 7 days.",
    ],
  },
  {
    slug: "incidents",
    title: "Incidents, accidents and emergencies",
    description: "First aid basics, breakdowns and what to do at the scene.",
    totalQuestions: 67,
    topics: ["First aid", "Fire", "Breakdowns", "Tunnels"],
    keyPoints: [
      "At a crash: stop, warn other traffic (hazards, triangle 45m back), call 999.",
      "DR ABC — Danger, Response, Airway, Breathing, Circulation.",
      "Don't move a casualty unless they're in immediate danger.",
      "In a tunnel breakdown: switch off engine, use emergency phone, never reverse.",
    ],
  },
  {
    slug: "vehicle-loading",
    title: "Vehicle loading",
    description: "Carrying passengers, luggage, roof loads and towing.",
    totalQuestions: 38,
    topics: ["Passengers", "Roof loads", "Towing", "Child seats"],
    keyPoints: [
      "Children under 12 or under 135cm must use an appropriate child restraint.",
      "You're responsible for any passenger under 14 wearing their seatbelt.",
      "Distribute roof loads evenly and check straps after the first few miles.",
      "Towing changes your stopping distance and the speed limits that apply to you.",
    ],
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
