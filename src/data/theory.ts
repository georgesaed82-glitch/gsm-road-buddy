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
      "Mirror–Signal–Manoeuvre (MSM) before every change of speed or direction (Rule 159).",
      "Take a 15-minute break every 2 hours on long drives (Rule 91).",
      "No hand-held phone — even at the lights. 6 points and £200 fine (Rule 149).",
      "Scan far, middle, near and check mirrors every 5–8 seconds (Rules 161, 202).",
    ],
  },
  {
    slug: "attitude",
    title: "Attitude",
    description: "Courtesy, consideration and your responsibility to other road users.",
    totalQuestions: 71,
    topics: ["Following distance", "Priority", "Aggressive driving", "Emergency vehicles"],
    keyPoints: [
      "Two-second rule on dry roads, four seconds when wet, ten in ice (Rule 126).",
      "Never use your horn aggressively or between 11:30pm and 7am in built-up areas (Rule 112).",
      "Move left and slow down for blue lights — do not brake hard or mount the kerb (Rule 219).",
      "You should let buses pull out from bus stops in 20/30mph zones (Rule 223).",
    ],
  },
  {
    slug: "safety-and-vehicle",
    title: "Safety and your vehicle",
    description: "Daily checks, defects, loading and environmental driving.",
    totalQuestions: 119,
    topics: ["Tyres", "Lights", "Fluids", "Eco driving", "Security"],
    keyPoints: [
      "Minimum tyre tread depth is 1.6mm across the central ¾ of the tyre (Rule 97, Reg. 27).",
      "POWDERY check before every drive: Petrol, Oil, Water, Damage, Electrics, Rubber, Yourself.",
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
      "Stopping distances (Rule 126): 20mph = 12m, 30mph = 23m, 40mph = 36m, 50mph = 53m, 60mph = 73m, 70mph = 96m.",
      "Wet roads double stopping distance; ice multiplies it by up to ten (Rule 227).",
      "In a skid, ease off the accelerator and steer gently into the skid (Rule 119).",
      "Use dipped headlights in poor visibility — fog lights only when visibility is under 100m (Rules 114, 226).",
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
      "Give cyclists at least 1.5m at up to 30mph, more at higher speeds (Rule 163).",
      "Pass horses at no more than 10mph and leave at least 2m. Never sound the horn (Rule 215).",
      "Approach zebra crossings prepared to stop and normally give way to pedestrians waiting to cross (Rules H2, 195).",
      "Children, older and disabled pedestrians may take longer to cross — wait patiently (Rules 205, 207).",
    ],
  },
  {
    slug: "other-vehicles",
    title: "Other types of vehicle",
    description: "Sharing the road with lorries, buses, trams and motorcycles.",
    totalQuestions: 42,
    topics: ["Blind spots on HGVs", "Bus lanes", "Tram tracks"],
    keyPoints: [
      "Stay out of HGV blind spots — if you can't see the driver's mirrors, they can't see you (Rule 221).",
      "Give long vehicles extra room when they're turning — they swing out (Rule 221).",
      "Do not drive in bus lanes during their hours of operation (Rule 141).",
      "Trams have priority and can't steer around you (Rules 300–307).",
    ],
  },
  {
    slug: "vehicle-handling",
    title: "Vehicle handling",
    description: "Driving in different weather, road and light conditions.",
    totalQuestions: 78,
    topics: ["Night driving", "Country roads", "Wet & ice", "Wind"],
    keyPoints: [
      "Use dipped headlights in poor daytime visibility (Rule 226).",
      "On unlit roads, use full beam but dip for oncoming traffic and when following (Rule 115).",
      "Slow down before a bend, accelerate gently out of it (Rule 125).",
      "High winds: grip the wheel firmly, especially passing high-sided vehicles (Rule 232).",
    ],
  },
  {
    slug: "motorway-rules",
    title: "Motorway rules",
    description: "Joining, lane discipline, smart motorways and breakdowns.",
    totalQuestions: 95,
    topics: ["Joining & leaving", "Lane discipline", "Smart motorways", "Breakdowns"],
    keyPoints: [
      "Match the speed of main-carriageway traffic before joining from the slip road (Rule 259).",
      "Keep to the left-hand lane (lane 1) unless overtaking. Middle-lane hogging is a £100 fine and 3 points (Rule 264).",
      "Red X means lane closed — you must not drive in it (Rule 258).",
      "If you break down on a smart motorway, exit to an emergency refuge area if possible; otherwise get behind the barrier on the left and call 999 (Rules 274–278).",
    ],
  },
  {
    slug: "rules-of-the-road",
    title: "Rules of the road",
    description: "Speed limits, junctions, overtaking, parking and one-way streets.",
    totalQuestions: 112,
    topics: ["Speed limits", "Junctions", "Overtaking", "Parking"],
    keyPoints: [
      "Default limits: 30mph in built-up, 60mph single carriageway, 70mph dual carriageway & motorway (Rule 124).",
      "Do not overtake on the approach to a junction, bend, brow of a hill or crossing (Rule 167).",
      "Do not park within 10m of a junction or on zig-zag lines (Rules 243, 240).",
      "At a roundabout, give way to traffic coming from your immediate right unless signs or markings say otherwise (Rule 185).",
    ],
  },
  {
    slug: "road-conditions",
    title: "Road and traffic signs",
    description: "Warning, regulatory, informational signs and road markings.",
    totalQuestions: 156,
    topics: ["Triangle signs", "Circle signs", "Markings", "Variable signs"],
    keyPoints: [
      "Circles give orders. Triangles warn. Rectangles inform. Octagon = STOP. Downward triangle = GIVE WAY.",
      "Red circle / red ring = prohibition. Blue circle = mandatory action.",
      "Solid white line in the middle of the road: you must not cross or straddle it except to turn, pass a stationary vehicle or overtake a cyclist/horse/road-works vehicle under 10mph (Rule 129).",
      "Yellow box junction — you must not enter unless your exit is clear (Rule 174).",
    ],
  },
  {
    slug: "essential-documents",
    title: "Essential documents",
    description: "Licences, MOT, insurance and the legal side of driving.",
    totalQuestions: 49,
    topics: ["Licence categories", "MOT", "Insurance", "VED"],
    keyPoints: [
      "You must hold a valid licence, insurance and (if the vehicle is over 3 years old) an MOT to drive.",
      "Tell DVLA if you change address or develop a notifiable medical condition — some notifications are legal requirements.",
      "Under the New Drivers Act, your licence is revoked at 6 penalty points in the first 2 years after passing.",
      "If a police officer asks and you don't have your licence with you, you have 7 days to produce it at a station.",
    ],
  },
  {
    slug: "incidents",
    title: "Incidents, accidents and emergencies",
    description: "First aid basics, breakdowns and what to do at the scene.",
    totalQuestions: 67,
    topics: ["First aid", "Fire", "Breakdowns", "Tunnels"],
    keyPoints: [
      "At a crash: stop, warn other traffic (hazards, warning triangle at least 45m back — never on a motorway), call 999 (Rule 283).",
      "DR ABC — Danger, Response, Airway, Breathing, Circulation.",
      "Do not move a casualty unless they are in immediate danger (Rule 283).",
      "In a tunnel breakdown: switch off the engine, switch on hazard lights, use the emergency phone, never reverse (Highway Code — Tunnels).",
    ],
  },
  {
    slug: "vehicle-loading",
    title: "Vehicle loading",
    description: "Carrying passengers, luggage, roof loads and towing.",
    totalQuestions: 38,
    topics: ["Passengers", "Roof loads", "Towing", "Child seats"],
    keyPoints: [
      "Children under 12 years or under 135cm must use an appropriate child restraint (Rule 100).",
      "You are responsible for any passenger under 14 wearing their seatbelt (Rule 99).",
      "Distribute roof loads evenly and check straps after the first few miles.",
      "Towing changes your stopping distance and the speed limits that apply to you (Rule 98).",
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
  optionExplanations: string[];
};

export const sampleTheoryQuestions: TheoryQuestion[] = [
  // Alertness
  { id: "alertness-1", category: "alertness", question: "You're approaching a junction with parked cars on both sides. What should you do?", options: ["Speed up to clear the area quickly", "Cover the brake and look for pedestrians stepping out", "Sound your horn continuously", "Move to the centre of the road and accelerate"], correctIndex: 1, explanation: "Parked cars hide pedestrians. Cover the brake and scan low between vehicles.", optionExplanations: ["Speeding past hidden hazards gives you no time to react if someone steps out.", "Right — cover the brake so you can stop instantly if a pedestrian appears.", "The horn is a warning, not a substitute for slowing down.", "Crossing into oncoming traffic creates a bigger hazard than the one you're avoiding."] },
  { id: "alertness-2", category: "alertness", question: "How often should you check your mirrors on a normal drive?", options: ["Only when turning", "Every 5–8 seconds and before any manoeuvre", "Once a minute", "Only when something feels wrong"], correctIndex: 1, explanation: "Scan mirrors every 5–8 seconds and always before changing speed or direction.", optionExplanations: ["Far too infrequent — situations behind you change every few seconds.", "Right — regular scans keep you aware of traffic building up behind.", "A minute is long enough for a vehicle to be right on your bumper unnoticed.", "Mirror checks should be routine, not a reaction to a feeling."] },
  { id: "alertness-3", category: "alertness", question: "You feel tired on a long drive. What's the safest action?", options: ["Open a window and carry on", "Turn up the radio", "Stop in a safe place and take a 15-minute break", "Speed up to get there sooner"], correctIndex: 2, explanation: "Stop and rest. A short break every 2 hours keeps you sharp.", optionExplanations: ["Fresh air briefly masks tiredness but doesn't reverse it.", "Loud music is a distraction, not a cure for fatigue.", "Right — a 15-minute rest (and a coffee) genuinely restores alertness.", "Tired driving at higher speed multiplies your stopping distance and risk."] },

  // Attitude
  { id: "attitude-1", category: "attitude", question: "A vehicle behind is following too closely. You should…", options: ["Brake sharply to teach them a lesson", "Speed up to get away", "Ease off the accelerator to increase your gap to the car in front", "Wave them past in a queue"], correctIndex: 2, explanation: "Build a bigger cushion in front so you can brake gently if needed.", optionExplanations: ["Brake-checking is dangerous and may be illegal.", "Speeding up still leaves them behind you — and you may break the limit.", "Right — a bigger gap ahead lets you brake gently, protecting both of you.", "Waving others past takes responsibility for their decision — never do it."] },
  { id: "attitude-2", category: "attitude", question: "An emergency vehicle with blue lights is behind you. You should…", options: ["Brake hard immediately", "Mount the kerb to let them pass", "Move left when safe and don't break the law to clear the way", "Speed up to keep ahead"], correctIndex: 2, explanation: "Move left safely. Don't run red lights or mount kerbs.", optionExplanations: ["Sudden braking can cause a collision behind you.", "Mounting the kerb risks pedestrians and damages your tyres.", "Right — pull left when safe; never cross red lights or break other laws.", "Outrunning emergency vehicles is dangerous and illegal."] },
  { id: "attitude-3", category: "attitude", question: "What is the two-second rule?", options: ["Time to indicate before turning", "Minimum following distance in good conditions", "Time you can park on yellow lines", "How long to wait at a junction"], correctIndex: 1, explanation: "Two seconds on dry roads, four when wet, ten in ice.", optionExplanations: ["Indicators have no fixed time rule — use them in good time before manoeuvring.", "Right — keep two seconds gap on dry roads, double it in wet, ten times in ice.", "Yellow lines restrict parking; the rule is unrelated.", "Junction timing depends on signs and traffic, not a fixed rule."] },

  // Safety and vehicle
  { id: "safety-and-vehicle-1", category: "safety-and-vehicle", question: "What is the minimum legal tyre tread depth for a car?", options: ["1.0mm", "1.6mm", "2.0mm", "3.0mm"], correctIndex: 1, explanation: "1.6mm across the central three-quarters of the tyre.", optionExplanations: ["Below the legal limit — £2,500 fine and 3 points per tyre.", "Right — 1.6mm across the central ¾ and around the full circumference.", "Above the legal minimum but not the legal figure.", "Recommended for safety, but not the legal minimum."] },
  { id: "safety-and-vehicle-2", category: "safety-and-vehicle", question: "Which of these saves fuel and reduces emissions?", options: ["Harsh acceleration", "Late, heavy braking", "Smooth acceleration and early gear changes", "Driving with a roof box at all times"], correctIndex: 2, explanation: "Smooth driving and early gear changes can cut fuel use by up to 15%.", optionExplanations: ["Burns far more fuel and wears the engine.", "Wastes the energy you've just built up and increases brake wear.", "Right — smooth inputs and early upshifts cut fuel use by up to 15%.", "Roof boxes add drag — remove them when not in use."] },
  { id: "safety-and-vehicle-3", category: "safety-and-vehicle", question: "Before driving, you should check…", options: ["Only fuel", "Tyres, lights, fluids and that you're fit to drive", "Just the mirrors", "Nothing — the MOT covers it"], correctIndex: 1, explanation: "Use POWDERY: Petrol, Oil, Water, Damage, Electrics, Rubber, Yourself.", optionExplanations: ["Fuel alone won't keep you legal or safe.", "Right — POWDERY covers everything that could fail or get you stopped.", "Mirrors matter, but they're only one of many checks.", "MOT is annual; daily defects (lights, tyres) are still your responsibility."] },

  // Safety margins
  { id: "safety-margins-1", category: "safety-margins", question: "In wet weather, your stopping distance is roughly…", options: ["The same as dry", "Twice the dry distance", "Five times the dry distance", "Ten times the dry distance"], correctIndex: 1, explanation: "Wet roads roughly double stopping distance. Ice multiplies it by ten.", optionExplanations: ["Wet tarmac reduces grip — distances grow significantly.", "Right — wet doubles it. Plan a four-second gap.", "Too high for plain wet — that's closer to snow.", "Ten times applies to ice, not wet roads."] },
  { id: "safety-margins-2", category: "safety-margins", question: "Overall stopping distance at 60mph in dry conditions is about…", options: ["36 metres", "53 metres", "73 metres", "96 metres"], correctIndex: 2, explanation: "60mph ≈ 73m. 70mph ≈ 96m.", optionExplanations: ["That's roughly the 40mph figure.", "That's the 50mph figure.", "Right — 60mph ≈ 73 metres total.", "That's the 70mph figure."] },
  { id: "safety-margins-3", category: "safety-margins", question: "If your car begins to skid, you should…", options: ["Brake hard", "Ease off the accelerator and steer gently into the skid", "Pull the handbrake", "Steer sharply the other way"], correctIndex: 1, explanation: "Ease off and steer gently into the direction of the skid.", optionExplanations: ["Hard braking locks the wheels and makes the skid worse.", "Right — easing off restores grip; steering into the skid recovers control.", "The handbrake locks the rear wheels and spins the car.", "Counter-steering sharply causes the car to over-rotate."] },

  // Hazard awareness
  { id: "hazard-awareness-1", category: "hazard-awareness", question: "A ball rolls out from between parked cars. The most likely next hazard is…", options: ["A cat chasing it", "A child running after it", "Litter blowing across", "A cyclist swerving"], correctIndex: 1, explanation: "Treat a ball in the road as a child about to follow.", optionExplanations: ["Possible but not the safest assumption.", "Right — always assume a child is about to follow a ball.", "Wind could move litter but doesn't justify ignoring the ball.", "Cyclists don't usually chase balls into the road."] },
  { id: "hazard-awareness-2", category: "hazard-awareness", question: "A developing hazard is one that…", options: ["Has already happened", "Could cause you to change speed or direction", "Is far away on another road", "Only appears at night"], correctIndex: 1, explanation: "It's the moment a static hazard becomes something you must act on.", optionExplanations: ["That's a past event, not a developing hazard.", "Right — any hazard that forces you to act becomes a developing one.", "Distant hazards on other roads don't affect you yet.", "Developing hazards happen at any time of day."] },
  { id: "hazard-awareness-3", category: "hazard-awareness", question: "You see brake lights on cars far ahead. You should…", options: ["Maintain speed and overtake", "Ease off and increase your following gap", "Brake hard immediately", "Sound your horn"], correctIndex: 1, explanation: "Anticipate — ease off early so you don't have to brake hard later.", optionExplanations: ["Overtaking into a slowing queue creates a worse hazard.", "Right — early easing off avoids the need to brake hard.", "Hard braking without need risks the driver behind.", "The horn changes nothing about the traffic ahead."] },

  // Vulnerable road users
  { id: "vulnerable-road-users-1", category: "vulnerable-road-users", question: "When passing a horse rider, you should…", options: ["Sound your horn so they know you're there", "Pass slowly and leave at least 2 metres of space", "Rev your engine to scare the horse forward", "Overtake on a blind bend if clear"], correctIndex: 1, explanation: "Slow to 10mph, leave at least 2m, never sound the horn.", optionExplanations: ["Sudden noises can spook a horse — never sound the horn.", "Right — under 10mph, at least 2 metres, and patient.", "Revving frightens horses and is illegal under the Highway Code.", "Bends mean limited visibility — never overtake there."] },
  { id: "vulnerable-road-users-2", category: "vulnerable-road-users", question: "How much space should you give a cyclist at up to 30mph?", options: ["0.5 metres", "1 metre", "At least 1.5 metres", "Half a lane"], correctIndex: 2, explanation: "At least 1.5m at up to 30mph, more at higher speeds.", optionExplanations: ["Far too close — a wobble would mean a collision.", "Still inside the Highway Code minimum.", "Right — the Highway Code requires at least 1.5m at up to 30mph.", "Not a defined unit — the rule is in metres."] },
  { id: "vulnerable-road-users-3", category: "vulnerable-road-users", question: "Someone is waiting at a zebra crossing. You must…", options: ["Slow but keep moving if they haven't stepped out", "Stop and let them cross", "Sound your horn", "Wave them across only if a passenger says so"], correctIndex: 1, explanation: "Stop fully when someone is waiting at a zebra crossing.", optionExplanations: ["You must stop — not roll on hoping they wait.", "Right — once someone is waiting, you must stop.", "Using the horn at a pedestrian is intimidation.", "Waving people across passes responsibility to them — never do it."] },

  // Other vehicles
  { id: "other-vehicles-1", category: "other-vehicles", question: "You're behind a long lorry approaching a junction. You should…", options: ["Overtake on the inside", "Stay back — the lorry may swing out to turn", "Flash your lights and push past", "Sound your horn"], correctIndex: 1, explanation: "Long vehicles often swing wide on turns. Hang back.", optionExplanations: ["The inside is exactly where a turning lorry will sweep across.", "Right — hold back so the lorry can swing wide safely.", "Flashing won't change physics — the lorry still needs the space.", "The horn doesn't shrink the lorry's turning circle."] },
  { id: "other-vehicles-2", category: "other-vehicles", question: "Bus lanes apply…", options: ["Only at night", "At all times unless signs say otherwise", "Only at weekends", "Only on motorways"], correctIndex: 1, explanation: "Check the sign for hours of operation — assume in force unless told otherwise.", optionExplanations: ["The opposite — most operate during the day.", "Right — read the sign; assume in operation if no times are shown.", "Most operate weekdays at peak times.", "Bus lanes are an urban feature, not a motorway one."] },
  { id: "other-vehicles-3", category: "other-vehicles", question: "What does it mean if you can't see an HGV driver's mirrors?", options: ["Nothing — they have cameras", "They can't see you either", "They're not paying attention", "Their mirrors are broken"], correctIndex: 1, explanation: "No mirror visible = you're in their blind spot. Move out of it.", optionExplanations: ["Cameras help but don't replace mirrors — assume you're invisible.", "Right — if you can't see their mirror, they can't see you.", "Has nothing to do with their attention.", "Not a safe assumption — assume blind spot instead."] },

  // Vehicle handling
  { id: "vehicle-handling-1", category: "vehicle-handling", question: "You must use fog lights only when visibility is…", options: ["Under 200m", "Under 100m", "Raining lightly", "Dusk"], correctIndex: 1, explanation: "Fog lights legally only below 100m visibility. Switch off when it clears.", optionExplanations: ["Above the legal threshold — fog lights would dazzle others.", "Right — under 100m is the legal threshold.", "Use dipped headlights in rain, not fog lights.", "Use sidelights and dipped beam at dusk, not fog lights."] },
  { id: "vehicle-handling-2", category: "vehicle-handling", question: "On a country bend you should…", options: ["Brake while turning", "Slow before the bend, accelerate gently out", "Accelerate into it", "Cross the centre line for a smoother line"], correctIndex: 1, explanation: "Slow in, smooth out — keeps the car balanced.", optionExplanations: ["Braking mid-bend unbalances the car and can cause a skid.", "Right — slow in, smooth out keeps the car planted.", "Adds speed when you have least grip.", "Crossing the centre line risks a head-on with hidden oncoming traffic."] },
  { id: "vehicle-handling-3", category: "vehicle-handling", question: "In strong side winds, you should…", options: ["Drive faster to feel it less", "Grip the wheel firmly, especially passing high-sided vehicles", "Coast in neutral", "Use cruise control"], correctIndex: 1, explanation: "Wind buffets you most when passing lorries and bridges.", optionExplanations: ["Higher speed makes gusts harder to correct.", "Right — firm grip, expect buffeting near lorries and bridges.", "Coasting removes engine control over the car.", "Cruise control hides changing conditions — turn it off in wind."] },

  // Motorway rules
  { id: "motorway-rules-1", category: "motorway-rules", question: "On a motorway you should normally drive in…", options: ["The middle lane", "The right-hand lane", "The left-hand lane unless overtaking", "Whichever is quietest"], correctIndex: 2, explanation: "Keep left unless overtaking. Middle-lane hogging is £100 + 3 points.", optionExplanations: ["Middle-lane hogging is a £100 fine and 3 points.", "Right lane is for overtaking only.", "Right — keep left unless actively overtaking.", "Lane choice is by rule, not by preference."] },
  { id: "motorway-rules-2", category: "motorway-rules", question: "A red X above a motorway lane means…", options: ["Slow down", "Lane closed — do not drive in it", "Variable speed limit ahead", "Hard shoulder open"], correctIndex: 1, explanation: "Red X = lane closed. Move out before you reach it.", optionExplanations: ["Speed limits show as numbers in a red ring, not an X.", "Right — lane closed; move out as soon as it's safe.", "Variable limits are shown as a numbered circle, not an X.", "An X means closed, not open."] },
  { id: "motorway-rules-3", category: "motorway-rules", question: "Joining a motorway from a slip road, you should…", options: ["Stop and wait for a gap", "Match the speed of motorway traffic and merge", "Drive at 40mph in lane 1", "Cross straight to lane 2"], correctIndex: 1, explanation: "Match speed, merge smoothly into lane 1 when there's a gap.", optionExplanations: ["Stopping on a slip road is dangerous and obstructs joining traffic.", "Right — build to motorway speed and merge into a gap.", "Joining well below traffic speed forces others to brake.", "Cut straight across lanes is illegal and unsafe — merge into lane 1 first."] },

  // Rules of the road
  { id: "rules-of-the-road-1", category: "rules-of-the-road", question: "You are driving a car on a single carriageway with only the national speed limit sign in place. What is the maximum speed you may drive at?", options: ["50 mph", "60 mph", "70 mph", "80 mph"], correctIndex: 1, explanation: "For cars and car-derived vans the national speed limit on a single carriageway is 60 mph. It becomes 70 mph only on dual carriageways and motorways (Rule 124).", optionExplanations: ["50 mph is the national limit for goods vehicles up to 7.5 tonnes on a single carriageway, not for cars.", "Right — 60 mph is the national single-carriageway limit for cars.", "70 mph is the national limit for cars on dual carriageways and motorways, not single carriageways.", "80 mph has never been a UK national speed limit."] },
  { id: "rules-of-the-road-2", category: "rules-of-the-road", question: "At a roundabout you give priority to…", options: ["Traffic on your left", "Traffic coming from your right", "The largest vehicle", "Whoever arrives first"], correctIndex: 1, explanation: "Give way to the right at roundabouts unless signs say otherwise.", optionExplanations: ["Wrong direction — traffic from the left is already past you.", "Right — give way to traffic from the right.", "Size doesn't grant priority on a roundabout.", "Arrival order doesn't apply at roundabouts."] },
  { id: "rules-of-the-road-3", category: "rules-of-the-road", question: "You must not park within how many metres of a junction?", options: ["5m", "10m", "20m", "50m"], correctIndex: 1, explanation: "Don't park within 10m of a junction unless in a marked bay.", optionExplanations: ["Too close — visibility for turning drivers would be blocked.", "Right — keep at least 10m clear of a junction.", "Further than required, but not the rule.", "Far beyond the legal requirement."] },

  // Road conditions / signs
  { id: "road-conditions-1", category: "road-conditions", question: "You see a round sign with a red ring around it. What is this type of sign telling you?", options: ["It is warning you about a hazard ahead", "It is giving you information about a service", "It is telling you what you MUST NOT do", "It is a motorway route sign"], correctIndex: 2, explanation: "Circular signs give orders. A red ring (or red-filled circle) means a prohibition — something you must not do; a blue circle means a positive instruction you must follow.", optionExplanations: ["Hazard warnings use red-bordered triangles, not circles.", "Service information is shown on blue rectangles, not red-ringed circles.", "Right — a red ring on a circular sign is always a prohibition.", "Motorway signs are blue rectangles with white text and route numbers."] },
  { id: "road-conditions-2", category: "road-conditions", question: "You are driving along and see a triangular sign with a red border ahead. What does this shape of sign tell you?", options: ["It is giving you information about local services", "It is warning you of a hazard on the road ahead", "It is a prohibition telling you what you must not do", "It is directing you to the nearest town"], correctIndex: 1, explanation: "Red-bordered triangles are warning signs — they alert you to a hazard ahead so you can slow down and be ready to act. They do not order you to do anything (Rule 109).", optionExplanations: ["Service information appears on blue rectangles, not red triangles.", "Right — a triangle with a red border always warns of a hazard ahead.", "Prohibitions use round signs with a red ring, not triangles.", "Direction signs are rectangles, colour-coded by the class of road."] },
  { id: "road-conditions-3", category: "road-conditions", question: "You may enter a yellow box junction when…", options: ["Your exit is clear", "Traffic lights are green", "You're turning left only", "Any time"], correctIndex: 0, explanation: "Only enter if your exit is clear — except turning right blocked by oncoming traffic.", optionExplanations: ["Right — never enter unless your exit is clear.", "Green lights don't override the box junction rule.", "Direction of turn doesn't matter — the rule is about exit.", "Entering a blocked box is an offence."] },

  // Essential documents
  { id: "essential-documents-1", category: "essential-documents", question: "To drive on a public road you must have…", options: ["A licence only", "Licence, insurance and (if over 3 years old) MOT", "Insurance only", "Just a provisional"], correctIndex: 1, explanation: "Valid licence, insurance and MOT (cars over 3 years) are all required.", optionExplanations: ["A licence alone isn't enough — insurance is also legally required.", "Right — all three together keep you legal.", "Insurance without a licence still leaves you driving illegally.", "A provisional alone doesn't allow unsupervised driving."] },
  { id: "essential-documents-2", category: "essential-documents", question: "A new driver can lose their licence at how many penalty points in the first 2 years?", options: ["3", "6", "9", "12"], correctIndex: 1, explanation: "6 points in your first 2 years revokes your licence.", optionExplanations: ["Below the new-driver threshold.", "Right — 6 points within 2 years revokes the licence.", "That's the disqualification trigger for experienced drivers.", "12 is the totting-up limit for experienced drivers."] },
  { id: "essential-documents-3", category: "essential-documents", question: "You change your address. You must tell DVLA within…", options: ["7 days", "1 month", "3 months", "Whenever convenient"], correctIndex: 0, explanation: "Notify DVLA within 7 days of a change of address.", optionExplanations: ["Right — 7 days, or risk a £1,000 fine.", "Too long — the legal window is 7 days.", "Far beyond the legal window.", "Not optional — it's a legal duty."] },

  // Incidents
  { id: "incidents-1", category: "incidents", question: "At the scene of a crash you should first…", options: ["Move all casualties off the road", "Stop, warn other traffic, then call 999", "Take photos for insurance", "Drive on if not involved"], correctIndex: 1, explanation: "Make the scene safe and call 999. Move casualties only if they're in immediate danger.", optionExplanations: ["Moving casualties can worsen spinal injuries — only if in immediate danger.", "Right — make the scene safe first, then call 999.", "Photos come later — safety and emergency services first.", "If you stopped or were near, you have a legal duty to help."] },
  { id: "incidents-2", category: "incidents", question: "DR ABC stands for…", options: ["Drive, Reverse, Accelerate, Brake, Coast", "Danger, Response, Airway, Breathing, Circulation", "Doctors Respond After British Casualties", "Drink, Rest, Avoid, Brake, Continue"], correctIndex: 1, explanation: "First-aid order: Danger, Response, Airway, Breathing, Circulation.", optionExplanations: ["Not a recognised acronym.", "Right — the universal first-aid checklist.", "Not a first-aid term.", "Not a recognised acronym."] },
  { id: "incidents-3", category: "incidents", question: "If your car breaks down in a tunnel you should…", options: ["Reverse out", "Switch off the engine and use the emergency phone", "Stay in the car with the engine running", "Cross the carriageway on foot"], correctIndex: 1, explanation: "Switch off, use the emergency phone, follow tunnel instructions. Never reverse.", optionExplanations: ["Reversing in a tunnel is extremely dangerous.", "Right — switch off, use the emergency phone, follow instructions.", "Running engine fills the tunnel with fumes.", "Crossing on foot risks being struck."] },

  // Vehicle loading
  { id: "vehicle-loading-1", category: "vehicle-loading", question: "Children under 12 or under 135cm tall must use…", options: ["An adult seatbelt", "An appropriate child restraint", "No restraint if in the back", "A booster only on motorways"], correctIndex: 1, explanation: "Under 12 or 135cm = appropriate child seat/booster.", optionExplanations: ["Adult belts sit across the neck of a small child — unsafe and illegal.", "Right — the correct child seat or booster for their size.", "Rear passengers still need restraint by law.", "The rule applies on every road, not just motorways."] },
  { id: "vehicle-loading-2", category: "vehicle-loading", question: "When carrying a roof load, you should…", options: ["Pile it on one side", "Distribute it evenly and check straps after a few miles", "Drive faster to stop it moving", "Skip securing it if it's light"], correctIndex: 1, explanation: "Even distribution, secure straps, recheck after first few miles.", optionExplanations: ["Uneven loads upset balance and can roll the car.", "Right — even loading, secure straps, recheck after settling.", "Speed doesn't secure a load — it makes it worse if it shifts.", "Even light items become projectiles at speed."] },
  { id: "vehicle-loading-3", category: "vehicle-loading", question: "Who is responsible for a passenger under 14 wearing a seatbelt?", options: ["The passenger", "The parent at home", "The driver", "No one"], correctIndex: 2, explanation: "The driver is legally responsible for under-14s being properly restrained.", optionExplanations: ["Children can't be held legally responsible.", "A parent at home isn't in the vehicle.", "Right — the driver is liable for any under-14 not properly restrained.", "Someone is always responsible by law."] },

  // Extra mixed questions to reach a full 50-question DVSA mock
  { id: "alertness-4", category: "alertness", question: "You're about to reverse into a space and can't see clearly behind. You should…", options: ["Reverse slowly and hope for the best", "Get out and check, or ask someone to guide you", "Sound the horn and continue", "Rely on the rear-view mirror only"], correctIndex: 1, explanation: "Never reverse blind — check on foot or use a helper.", optionExplanations: ["Blind reversing is the leading cause of low-speed collisions.", "Right — get out and look, or use a banksman.", "The horn doesn't help you see what's behind.", "Mirrors leave large blind spots directly behind the car."] },
  { id: "attitude-4", category: "attitude", question: "A bus is signalling to pull out from a stop. You should…", options: ["Speed up to pass first", "Give way when it's safe to do so", "Flash your headlights to make it wait", "Sound the horn"], correctIndex: 1, explanation: "Give priority to buses pulling out when safe (Highway Code Rule 223).", optionExplanations: ["Rushing past a moving bus is dangerous and inconsiderate.", "Right — help the bus rejoin traffic when safe.", "Flashing to intimidate is misuse of headlights.", "The horn is only for warning of danger."] },
  { id: "safety-and-vehicle-4", category: "safety-and-vehicle", question: "Your engine oil warning light comes on while driving. You should…", options: ["Ignore it if the car still runs", "Stop as soon as safe and check the oil level", "Add water to the engine", "Rev the engine hard to clear it"], correctIndex: 1, explanation: "Low oil pressure can destroy an engine in minutes — stop safely and check.", optionExplanations: ["Ignoring the light can ruin the engine.", "Right — pull over safely and check oil straight away.", "Water is not a substitute for oil.", "Revving damages the engine further."] },
  { id: "safety-margins-4", category: "safety-margins", question: "In fog, you should keep a following distance of at least…", options: ["The two-second rule", "Four seconds", "The distance you can see to be clear", "One car length"], correctIndex: 2, explanation: "Only drive as fast — and as close — as your visibility allows.", optionExplanations: ["Two seconds assumes clear visibility.", "Better than two but still not enough in dense fog.", "Right — never drive closer than the distance you can see to be clear.", "One car length gives no reaction time at any speed."] },
  { id: "hazard-awareness-4", category: "hazard-awareness", question: "You see a pedestrian with a white stick and red bands. This means they are…", options: ["A traffic warden", "Deafblind", "A tourist", "A cyclist off their bike"], correctIndex: 1, explanation: "White stick with two red bands = deafblind pedestrian.", optionExplanations: ["Traffic wardens wear high-vis uniforms.", "Right — treat with extra care; they may not hear traffic.", "There's no signal for tourists.", "Cyclists don't carry white sticks."] },
  { id: "vulnerable-road-users-4", category: "vulnerable-road-users", question: "When you overtake a cyclist, you should leave at least…", options: ["50cm", "1 metre", "1.5 metres at up to 30mph, more at higher speeds", "Just enough to squeeze past"], correctIndex: 2, explanation: "Highway Code Rule 163: at least 1.5m at 30mph, more when faster.", optionExplanations: ["Far too close — a small wobble becomes a crash.", "Below the recommended minimum for 30mph.", "Right — 1.5m at 30mph and more at higher speeds.", "Squeezing past cyclists is dangerous and illegal."] },
  { id: "other-vehicles-4", category: "other-vehicles", question: "A large lorry ahead of you is turning left at a tight junction. Before it turns, it may need to…", options: ["Stay tight against the kerb throughout the turn", "Swing out to the right first so it can complete the turn", "Ignore the painted lane markings", "Reverse into the side road before turning"], correctIndex: 1, explanation: "The swept path of a long vehicle is much wider than a car's. Give it room and never try to pass on its nearside as it turns (Rule 221).", optionExplanations: ["A long vehicle simply cannot follow a car's kerbside arc without hitting the kerb or nearby traffic.", "Right — hold back and expect the lorry to move right first before turning left.", "Lorries follow the same lane rules as cars; the difference is the swept path, not the markings.", "Reversing into a live junction would be dangerous and is not standard practice."] },
  { id: "motorway-rules-4", category: "motorway-rules", question: "On a three-lane motorway with the national limit in force, the right-hand (offside) lane is used for…", options: ["Goods vehicles over 7.5 tonnes", "Overtaking, after which you should return to a lane on your left", "Continuous driving at the speed limit", "Any vehicle that is towing a trailer"], correctIndex: 1, explanation: "Rule 264 — keep left unless overtaking. Goods vehicles over 7.5 tonnes and vehicles towing must not use lane three of a three-lane motorway.", optionExplanations: ["Goods vehicles over 7.5 tonnes must not use lane three of a three-lane motorway.", "Right — overtake in lane three, then move back to a clear lane on your left.", "Sitting in lane three unnecessarily is middle-lane hogging (£100 and 3 points).", "Vehicles towing a trailer are not allowed in lane three of a three-lane motorway."] },
];
