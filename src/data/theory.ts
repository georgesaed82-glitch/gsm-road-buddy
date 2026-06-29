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
  // Alertness
  { id: "alertness-1", category: "alertness", question: "You're approaching a junction with parked cars on both sides. What should you do?", options: ["Speed up to clear the area quickly", "Cover the brake and look for pedestrians stepping out", "Sound your horn continuously", "Move to the centre of the road and accelerate"], correctIndex: 1, explanation: "Parked cars hide pedestrians. Cover the brake and scan low between vehicles." },
  { id: "alertness-2", category: "alertness", question: "How often should you check your mirrors on a normal drive?", options: ["Only when turning", "Every 5–8 seconds and before any manoeuvre", "Once a minute", "Only when something feels wrong"], correctIndex: 1, explanation: "Scan mirrors every 5–8 seconds and always before changing speed or direction." },
  { id: "alertness-3", category: "alertness", question: "You feel tired on a long drive. What's the safest action?", options: ["Open a window and carry on", "Turn up the radio", "Stop in a safe place and take a 15-minute break", "Speed up to get there sooner"], correctIndex: 2, explanation: "Stop and rest. A short break every 2 hours keeps you sharp." },

  // Attitude
  { id: "attitude-1", category: "attitude", question: "A vehicle behind is following too closely. You should…", options: ["Brake sharply to teach them a lesson", "Speed up to get away", "Ease off the accelerator to increase your gap to the car in front", "Wave them past in a queue"], correctIndex: 2, explanation: "Build a bigger cushion in front so you can brake gently if needed." },
  { id: "attitude-2", category: "attitude", question: "An emergency vehicle with blue lights is behind you. You should…", options: ["Brake hard immediately", "Mount the kerb to let them pass", "Move left when safe and don't break the law to clear the way", "Speed up to keep ahead"], correctIndex: 2, explanation: "Move left safely. Don't run red lights or mount kerbs." },
  { id: "attitude-3", category: "attitude", question: "What is the two-second rule?", options: ["Time to indicate before turning", "Minimum following distance in good conditions", "Time you can park on yellow lines", "How long to wait at a junction"], correctIndex: 1, explanation: "Two seconds on dry roads, four when wet, ten in ice." },

  // Safety and vehicle
  { id: "safety-and-vehicle-1", category: "safety-and-vehicle", question: "What is the minimum legal tyre tread depth for a car?", options: ["1.0mm", "1.6mm", "2.0mm", "3.0mm"], correctIndex: 1, explanation: "1.6mm across the central three-quarters of the tyre." },
  { id: "safety-and-vehicle-2", category: "safety-and-vehicle", question: "Which of these saves fuel and reduces emissions?", options: ["Harsh acceleration", "Late, heavy braking", "Smooth acceleration and early gear changes", "Driving with a roof box at all times"], correctIndex: 2, explanation: "Smooth driving and early gear changes can cut fuel use by up to 15%." },
  { id: "safety-and-vehicle-3", category: "safety-and-vehicle", question: "Before driving, you should check…", options: ["Only fuel", "Tyres, lights, fluids and that you're fit to drive", "Just the mirrors", "Nothing — the MOT covers it"], correctIndex: 1, explanation: "Use POWDERY: Petrol, Oil, Water, Damage, Electrics, Rubber, Yourself." },

  // Safety margins
  { id: "safety-margins-1", category: "safety-margins", question: "In wet weather, your stopping distance is roughly…", options: ["The same as dry", "Twice the dry distance", "Five times the dry distance", "Ten times the dry distance"], correctIndex: 1, explanation: "Wet roads roughly double stopping distance. Ice multiplies it by ten." },
  { id: "safety-margins-2", category: "safety-margins", question: "Overall stopping distance at 60mph in dry conditions is about…", options: ["36 metres", "53 metres", "73 metres", "96 metres"], correctIndex: 2, explanation: "60mph ≈ 73m. 70mph ≈ 96m." },
  { id: "safety-margins-3", category: "safety-margins", question: "If your car begins to skid, you should…", options: ["Brake hard", "Ease off the accelerator and steer gently into the skid", "Pull the handbrake", "Steer sharply the other way"], correctIndex: 1, explanation: "Ease off and steer gently into the direction of the skid." },

  // Hazard awareness
  { id: "hazard-awareness-1", category: "hazard-awareness", question: "A ball rolls out from between parked cars. The most likely next hazard is…", options: ["A cat chasing it", "A child running after it", "Litter blowing across", "A cyclist swerving"], correctIndex: 1, explanation: "Treat a ball in the road as a child about to follow." },
  { id: "hazard-awareness-2", category: "hazard-awareness", question: "A developing hazard is one that…", options: ["Has already happened", "Could cause you to change speed or direction", "Is far away on another road", "Only appears at night"], correctIndex: 1, explanation: "It's the moment a static hazard becomes something you must act on." },
  { id: "hazard-awareness-3", category: "hazard-awareness", question: "You see brake lights on cars far ahead. You should…", options: ["Maintain speed and overtake", "Ease off and increase your following gap", "Brake hard immediately", "Sound your horn"], correctIndex: 1, explanation: "Anticipate — ease off early so you don't have to brake hard later." },

  // Vulnerable road users
  { id: "vulnerable-road-users-1", category: "vulnerable-road-users", question: "When passing a horse rider, you should…", options: ["Sound your horn so they know you're there", "Pass slowly and leave at least 2 metres of space", "Rev your engine to scare the horse forward", "Overtake on a blind bend if clear"], correctIndex: 1, explanation: "Slow to 10mph, leave at least 2m, never sound the horn." },
  { id: "vulnerable-road-users-2", category: "vulnerable-road-users", question: "How much space should you give a cyclist at up to 30mph?", options: ["0.5 metres", "1 metre", "At least 1.5 metres", "Half a lane"], correctIndex: 2, explanation: "At least 1.5m at up to 30mph, more at higher speeds." },
  { id: "vulnerable-road-users-3", category: "vulnerable-road-users", question: "Someone is waiting at a zebra crossing. You must…", options: ["Slow but keep moving if they haven't stepped out", "Stop and let them cross", "Sound your horn", "Wave them across only if a passenger says so"], correctIndex: 1, explanation: "Stop fully when someone is waiting at a zebra crossing." },

  // Other vehicles
  { id: "other-vehicles-1", category: "other-vehicles", question: "You're behind a long lorry approaching a junction. You should…", options: ["Overtake on the inside", "Stay back — the lorry may swing out to turn", "Flash your lights and push past", "Sound your horn"], correctIndex: 1, explanation: "Long vehicles often swing wide on turns. Hang back." },
  { id: "other-vehicles-2", category: "other-vehicles", question: "Bus lanes apply…", options: ["Only at night", "At all times unless signs say otherwise", "Only at weekends", "Only on motorways"], correctIndex: 1, explanation: "Check the sign for hours of operation — assume in force unless told otherwise." },
  { id: "other-vehicles-3", category: "other-vehicles", question: "What does it mean if you can't see an HGV driver's mirrors?", options: ["Nothing — they have cameras", "They can't see you either", "They're not paying attention", "Their mirrors are broken"], correctIndex: 1, explanation: "No mirror visible = you're in their blind spot. Move out of it." },

  // Vehicle handling
  { id: "vehicle-handling-1", category: "vehicle-handling", question: "You must use fog lights only when visibility is…", options: ["Under 200m", "Under 100m", "Raining lightly", "Dusk"], correctIndex: 1, explanation: "Fog lights legally only below 100m visibility. Switch off when it clears." },
  { id: "vehicle-handling-2", category: "vehicle-handling", question: "On a country bend you should…", options: ["Brake while turning", "Slow before the bend, accelerate gently out", "Accelerate into it", "Cross the centre line for a smoother line"], correctIndex: 1, explanation: "Slow in, smooth out — keeps the car balanced." },
  { id: "vehicle-handling-3", category: "vehicle-handling", question: "In strong side winds, you should…", options: ["Drive faster to feel it less", "Grip the wheel firmly, especially passing high-sided vehicles", "Coast in neutral", "Use cruise control"], correctIndex: 1, explanation: "Wind buffets you most when passing lorries and bridges." },

  // Motorway rules
  { id: "motorway-rules-1", category: "motorway-rules", question: "On a motorway you should normally drive in…", options: ["The middle lane", "The right-hand lane", "The left-hand lane unless overtaking", "Whichever is quietest"], correctIndex: 2, explanation: "Keep left unless overtaking. Middle-lane hogging is £100 + 3 points." },
  { id: "motorway-rules-2", category: "motorway-rules", question: "A red X above a motorway lane means…", options: ["Slow down", "Lane closed — do not drive in it", "Variable speed limit ahead", "Hard shoulder open"], correctIndex: 1, explanation: "Red X = lane closed. Move out before you reach it." },
  { id: "motorway-rules-3", category: "motorway-rules", question: "Joining a motorway from a slip road, you should…", options: ["Stop and wait for a gap", "Match the speed of motorway traffic and merge", "Drive at 40mph in lane 1", "Cross straight to lane 2"], correctIndex: 1, explanation: "Match speed, merge smoothly into lane 1 when there's a gap." },

  // Rules of the road
  { id: "rules-of-the-road-1", category: "rules-of-the-road", question: "The national speed limit on a single carriageway for a car is…", options: ["50mph", "60mph", "70mph", "80mph"], correctIndex: 1, explanation: "60mph on single carriageway, 70mph on dual & motorway." },
  { id: "rules-of-the-road-2", category: "rules-of-the-road", question: "At a roundabout you give priority to…", options: ["Traffic on your left", "Traffic coming from your right", "The largest vehicle", "Whoever arrives first"], correctIndex: 1, explanation: "Give way to the right at roundabouts unless signs say otherwise." },
  { id: "rules-of-the-road-3", category: "rules-of-the-road", question: "You must not park within how many metres of a junction?", options: ["5m", "10m", "20m", "50m"], correctIndex: 1, explanation: "Don't park within 10m of a junction unless in a marked bay." },

  // Road conditions / signs
  { id: "road-conditions-1", category: "road-conditions", question: "A red circle road sign generally means…", options: ["A warning", "Information", "A prohibition or order", "A motorway sign"], correctIndex: 2, explanation: "Circles give orders. Red circle = prohibition; blue circle = mandatory." },
  { id: "road-conditions-2", category: "road-conditions", question: "A triangular sign with a red border is…", options: ["Information", "A warning", "A prohibition", "A direction sign"], correctIndex: 1, explanation: "Triangles warn you of a hazard ahead." },
  { id: "road-conditions-3", category: "road-conditions", question: "You may enter a yellow box junction when…", options: ["Your exit is clear", "Traffic lights are green", "You're turning left only", "Any time"], correctIndex: 0, explanation: "Only enter if your exit is clear — except turning right blocked by oncoming traffic." },

  // Essential documents
  { id: "essential-documents-1", category: "essential-documents", question: "To drive on a public road you must have…", options: ["A licence only", "Licence, insurance and (if over 3 years old) MOT", "Insurance only", "Just a provisional"], correctIndex: 1, explanation: "Valid licence, insurance and MOT (cars over 3 years) are all required." },
  { id: "essential-documents-2", category: "essential-documents", question: "A new driver can lose their licence at how many penalty points in the first 2 years?", options: ["3", "6", "9", "12"], correctIndex: 1, explanation: "6 points in your first 2 years revokes your licence." },
  { id: "essential-documents-3", category: "essential-documents", question: "You change your address. You must tell DVLA within…", options: ["7 days", "1 month", "3 months", "Whenever convenient"], correctIndex: 0, explanation: "Notify DVLA within 7 days of a change of address." },

  // Incidents
  { id: "incidents-1", category: "incidents", question: "At the scene of a crash you should first…", options: ["Move all casualties off the road", "Stop, warn other traffic, then call 999", "Take photos for insurance", "Drive on if not involved"], correctIndex: 1, explanation: "Make the scene safe and call 999. Move casualties only if they're in immediate danger." },
  { id: "incidents-2", category: "incidents", question: "DR ABC stands for…", options: ["Drive, Reverse, Accelerate, Brake, Coast", "Danger, Response, Airway, Breathing, Circulation", "Doctors Respond After British Casualties", "Drink, Rest, Avoid, Brake, Continue"], correctIndex: 1, explanation: "First-aid order: Danger, Response, Airway, Breathing, Circulation." },
  { id: "incidents-3", category: "incidents", question: "If your car breaks down in a tunnel you should…", options: ["Reverse out", "Switch off the engine and use the emergency phone", "Stay in the car with the engine running", "Cross the carriageway on foot"], correctIndex: 1, explanation: "Switch off, use the emergency phone, follow tunnel instructions. Never reverse." },

  // Vehicle loading
  { id: "vehicle-loading-1", category: "vehicle-loading", question: "Children under 12 or under 135cm tall must use…", options: ["An adult seatbelt", "An appropriate child restraint", "No restraint if in the back", "A booster only on motorways"], correctIndex: 1, explanation: "Under 12 or 135cm = appropriate child seat/booster." },
  { id: "vehicle-loading-2", category: "vehicle-loading", question: "When carrying a roof load, you should…", options: ["Pile it on one side", "Distribute it evenly and check straps after a few miles", "Drive faster to stop it moving", "Skip securing it if it's light"], correctIndex: 1, explanation: "Even distribution, secure straps, recheck after first few miles." },
  { id: "vehicle-loading-3", category: "vehicle-loading", question: "Who is responsible for a passenger under 14 wearing a seatbelt?", options: ["The passenger", "The parent at home", "The driver", "No one"], correctIndex: 2, explanation: "The driver is legally responsible for under-14s being properly restrained." },
];
