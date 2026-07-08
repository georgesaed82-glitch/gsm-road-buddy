// Mini-quiz questions per DVSA topic. 5 questions each. Written to teach the
// underlying rule — NOT reproduced from copyrighted DVSA question banks.
export type TopicQuizQuestion = {
  q: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export const topicQuizzes: Record<string, TopicQuizQuestion[]> = {
  alertness: [
    {
      q: "You are driving on a long motorway journey and start to feel drowsy. What should you do?",
      options: [
        "Open a window and turn up the radio",
        "Stop as soon as safely possible for a rest",
        "Speed up so the journey ends sooner",
        "Move to the left-hand lane and keep going",
      ],
      correctIndex: 1,
      explanation:
        "Fresh air and loud music do not cure tiredness. Rule 91: stop and rest in a safe place.",
    },
    {
      q: "Before you change lane on a dual carriageway you should…",
      options: [
        "Signal, then check the mirrors",
        "Check mirrors, signal, then check the blind spot before moving",
        "Move over quickly to clear the lane behind",
        "Sound the horn to warn following traffic",
      ],
      correctIndex: 1,
      explanation: "MSM plus a shoulder check for the blind spot (Rules 159, 161).",
    },
    {
      q: "Using a hand-held mobile phone while driving carries…",
      options: [
        "3 points and £100",
        "6 points and £200",
        "A verbal warning only",
        "Points only if you crash",
      ],
      correctIndex: 1,
      explanation: "Rule 149: 6 penalty points and a £200 fine — even when stopped at lights.",
    },
    {
      q: "How often should you scan your mirrors on a busy road?",
      options: [
        "Only before overtaking",
        "Every 5–8 seconds and before every manoeuvre",
        "Once a minute",
        "Only when signalling",
      ],
      correctIndex: 1,
      explanation: "Regular systematic mirror checks are the foundation of MSM (Rules 161, 202).",
    },
    {
      q: "You are approaching a junction and become distracted by the sat-nav. You should…",
      options: [
        "Glance at the screen quickly",
        "Ignore it — you know the way",
        "Pull over safely to reset it",
        "Ask a passenger to hold it up for you",
      ],
      correctIndex: 2,
      explanation:
        "Anything that takes your attention off the road is a hazard. Pull over safely (Rule 150).",
    },
  ],
  attitude: [
    {
      q: "In dry weather, what is the minimum safe following distance rule?",
      options: [
        "One second",
        "Two seconds",
        "Half a car length per 10 mph",
        "Whatever feels comfortable",
      ],
      correctIndex: 1,
      explanation: "The two-second rule — double it in the wet, ten times in ice (Rule 126).",
    },
    {
      q: "An emergency vehicle is approaching from behind with blue lights on. You should…",
      options: [
        "Brake hard immediately",
        "Mount the pavement to let it pass",
        "Look for a safe place to pull over and let it pass",
        "Speed up to clear the way",
      ],
      correctIndex: 2,
      explanation:
        "Rule 219: never break the law or endanger others to make way — find a safe spot.",
    },
    {
      q: "You want to overtake a slow-moving lorry on a single carriageway. You should overtake only when…",
      options: [
        "The lorry indicates left",
        "You can see far enough ahead to complete the manoeuvre safely",
        "There is a broken white line",
        "It is a straight road",
      ],
      correctIndex: 1,
      explanation: "The view ahead must be clear enough to overtake and return safely (Rule 162).",
    },
    {
      q: "Which of these is an example of aggressive driving?",
      options: [
        "Leaving a two-second gap",
        "Flashing headlights repeatedly to make a car in front move over",
        "Signalling in good time",
        "Giving way at a junction",
      ],
      correctIndex: 1,
      explanation:
        "Rule 110–111: headlight flashing must only be used to let others know you are there — not for aggression.",
    },
    {
      q: "A bus signals to move off from a bus stop in a 30mph limit. You should…",
      options: [
        "Speed up to pass first",
        "Slow down and give way if safe",
        "Sound your horn",
        "Flash to make the bus wait",
      ],
      correctIndex: 1,
      explanation:
        "Rule 223: give priority to buses pulling out where the speed limit is 30mph or less.",
    },
  ],
  "safety-and-vehicle": [
    {
      q: "The minimum legal tyre tread depth on a car in the UK is…",
      options: [
        "1.0mm",
        "1.6mm across the central three-quarters of the tyre",
        "2.0mm across the whole tyre",
        "3.0mm on the front tyres only",
      ],
      correctIndex: 1,
      explanation: "1.6mm across the central ¾, all the way around (Rule 97, Reg. 27).",
    },
    {
      q: "Which of these is a legal MUST?",
      options: [
        "Wearing sunglasses in bright sun",
        "Keeping windscreens and mirrors clean",
        "Fitting winter tyres in December",
        "Using cruise control on motorways",
      ],
      correctIndex: 1,
      explanation: "A clean windscreen and mirrors are a legal requirement (Rule 229).",
    },
    {
      q: "You notice steam from under the bonnet. You should…",
      options: [
        "Keep driving to the next services",
        "Pull over safely, switch off the engine and let it cool",
        "Open the radiator cap immediately",
        "Add cold water to the radiator straight away",
      ],
      correctIndex: 1,
      explanation: "Overheating engines can eject boiling coolant. Stop, cool, then investigate.",
    },
    {
      q: "Smooth driving with early gear changes and gentle acceleration can cut fuel use by up to…",
      options: ["1%", "5%", "15%", "50%"],
      correctIndex: 2,
      explanation:
        "Around 15% — one of the biggest single things you can do for economy and emissions.",
    },
    {
      q: "When you park on the road at night, you must…",
      options: [
        "Leave sidelights on unless in a 30mph limit or lower speed limit facing the direction of travel",
        "Turn on hazard warning lights",
        "Leave the engine running",
        "Leave the handbrake off",
      ],
      correctIndex: 0,
      explanation:
        "Rule 248 — park facing the direction of travel; sidelights required unless the road has a 30mph or lower limit and you're facing the traffic flow.",
    },
  ],
  "safety-margins": [
    {
      q: "At 60mph, the typical overall stopping distance on a dry road is about…",
      options: ["23 metres", "36 metres", "53 metres", "73 metres"],
      correctIndex: 3,
      explanation: "60mph = 73m (Rule 126). Double it in the wet.",
    },
    {
      q: "On an icy road you should allow a stopping distance of up to…",
      options: [
        "The same as dry",
        "Double the dry distance",
        "Ten times the dry distance",
        "Half the dry distance",
      ],
      correctIndex: 2,
      explanation: "Ice can multiply stopping distance by up to ten (Rule 227).",
    },
    {
      q: "You start to skid because you have braked too hard. What should you do?",
      options: [
        "Brake harder",
        "Ease off the brake and steer gently in the direction of the skid",
        "Steer sharply the opposite way",
        "Pull the handbrake on",
      ],
      correctIndex: 1,
      explanation: "Release the brake, steer into the skid, avoid sudden inputs (Rule 119).",
    },
    {
      q: "You should only use rear fog lights when…",
      options: [
        "It is raining lightly",
        "Visibility is seriously reduced (generally under 100m)",
        "Driving on a motorway at night",
        "You are being tailgated",
      ],
      correctIndex: 1,
      explanation: "Rule 226 — switch them off when visibility improves; otherwise they dazzle.",
    },
    {
      q: "Aquaplaning is when…",
      options: [
        "Your steering fails at high speed",
        "A layer of water lifts the tyres off the road surface",
        "The brakes overheat",
        "The engine cuts out in the wet",
      ],
      correctIndex: 1,
      explanation: "Ease off the accelerator, hold the wheel straight, don't brake sharply.",
    },
  ],
  "hazard-awareness": [
    {
      q: "A ball rolls into the road ahead of you. You should…",
      options: [
        "Steer around it",
        "Slow down and be ready to stop — a child may follow",
        "Sound the horn",
        "Speed up to get past",
      ],
      correctIndex: 1,
      explanation: "Treat the ball as a child about to run out.",
    },
    {
      q: "A 'developing hazard' is one that…",
      options: [
        "Never changes",
        "Might make you change speed or direction",
        "Is behind you",
        "Is on the pavement only",
      ],
      correctIndex: 1,
      explanation:
        "The hazard perception test scores you on spotting hazards that develop into something requiring a response.",
    },
    {
      q: "You are following a bus that stops at a bus stop. You should…",
      options: [
        "Overtake immediately",
        "Be ready for pedestrians stepping out around the front of the bus",
        "Sound your horn",
        "Follow closely",
      ],
      correctIndex: 1,
      explanation: "Passengers can step into the road without looking — anticipate it.",
    },
    {
      q: "When driving through a school zone at pick-up time, you should…",
      options: [
        "Keep to the speed limit — that is enough",
        "Slow down further and cover the brake",
        "Sound the horn to warn children",
        "Use full beam",
      ],
      correctIndex: 1,
      explanation:
        "Children can be unpredictable near schools; drive well below the limit if needed (Rule 209).",
    },
    {
      q: "A cyclist ahead is looking over their right shoulder. You should expect them to…",
      options: ["Turn left", "Move out to the right or turn right", "Stop suddenly", "Speed up"],
      correctIndex: 1,
      explanation: "A shoulder check usually precedes a lane change or right turn.",
    },
  ],
  "vulnerable-road-users": [
    {
      q: "When overtaking a cyclist at up to 30mph, you should leave at least…",
      options: ["0.5m", "1m", "1.5m", "Just enough room to squeeze past"],
      correctIndex: 2,
      explanation: "Rule 163: 1.5m at up to 30mph, more at higher speeds.",
    },
    {
      q: "When passing horses on a country road, you should…",
      options: [
        "Pass quickly to get it over with",
        "Sound the horn to alert the rider",
        "Slow to no more than 10mph and leave at least 2m",
        "Flash your headlights",
      ],
      correctIndex: 2,
      explanation: "Rule 215 — slow, wide, quiet.",
    },
    {
      q: "A pedestrian is waiting at a zebra crossing. You should…",
      options: [
        "Wait for them to step off before slowing",
        "Approach prepared to stop and normally give way",
        "Only stop if they step onto the crossing",
        "Wave them across",
      ],
      correctIndex: 1,
      explanation: "Rules H2 and 195 — updated 2022 Highway Code.",
    },
    {
      q: "An older person is crossing the road slowly. You should…",
      options: [
        "Sound the horn to hurry them",
        "Wait patiently until they have finished crossing",
        "Drive around them",
        "Rev the engine",
      ],
      correctIndex: 1,
      explanation: "Rules 205, 207 — older and disabled pedestrians take longer; wait patiently.",
    },
    {
      q: "You are turning left into a side road. A cyclist is going straight on in the same direction just to your left. You should…",
      options: [
        "Turn across them — you have priority",
        "Wait behind the cyclist until they have passed the junction",
        "Sound your horn",
        "Overtake before turning",
      ],
      correctIndex: 1,
      explanation: "Rule H3 — do not cut across cyclists going ahead.",
    },
  ],
  "other-vehicles": [
    {
      q: "You are stopped behind a long lorry at a junction. The driver cannot see you in the mirrors if you are…",
      options: [
        "Directly behind, close to the tailgate",
        "Two car-lengths behind",
        "In lane 2",
        "In front of them",
      ],
      correctIndex: 0,
      explanation:
        "Rule 221 — sit back far enough to see the mirrors, or the driver cannot see you.",
    },
    {
      q: "Bus lane signs typically show…",
      options: [
        "A red circle only",
        "The times when the lane is in operation",
        "The bus company's name",
        "The next bus stop",
      ],
      correctIndex: 1,
      explanation:
        "Check the sign — outside the marked hours, other vehicles may use the lane (Rule 141).",
    },
    {
      q: "A tram is approaching. You should…",
      options: [
        "Pull out in front — trams stop quickly",
        "Give way — trams cannot steer around you",
        "Sound the horn",
        "Overtake it on the right",
      ],
      correctIndex: 1,
      explanation: "Rules 300–307 — trams have priority; keep clear of tracks.",
    },
    {
      q: "A motorcyclist may weave slightly within their lane because…",
      options: [
        "They are showing off",
        "They are avoiding drain covers, potholes and standing water",
        "Their bike is faulty",
        "They want to overtake",
      ],
      correctIndex: 1,
      explanation: "Give them space — surface hazards are far more dangerous to a bike (Rule 213).",
    },
    {
      q: "A long articulated lorry is turning left at a mini-roundabout ahead. It may need to…",
      options: [
        "Stay tight to the kerb",
        "Swing out to the right first before turning left",
        "Reverse into the junction",
        "Signal right",
      ],
      correctIndex: 1,
      explanation:
        "Long vehicles need extra swept path — do not overtake on the left as they turn.",
    },
  ],
  "vehicle-handling": [
    {
      q: "You are driving on a narrow country road at night. You should use…",
      options: [
        "Full beam at all times",
        "Full beam, dipping for oncoming traffic and when following others",
        "Sidelights only",
        "Fog lights instead of headlights",
      ],
      correctIndex: 1,
      explanation: "Rule 115 — dip early enough to avoid dazzling other drivers.",
    },
    {
      q: "You are driving in strong crosswinds and pass a high-sided lorry. You should expect…",
      options: [
        "No effect on your car",
        "A sudden gust as you pass out of the lorry's shelter",
        "The lorry to brake hard",
        "The wind to drop",
      ],
      correctIndex: 1,
      explanation:
        "Rule 232 — grip the wheel firmly, especially on exposed bridges and open stretches.",
    },
    {
      q: "On a wet road, you should…",
      options: [
        "Drive faster to reduce time spent in the rain",
        "Increase your following distance to at least four seconds",
        "Turn on hazard warning lights",
        "Use the handbrake to slow down",
      ],
      correctIndex: 1,
      explanation: "Wet roads double stopping distance (Rules 126, 227).",
    },
    {
      q: "You are driving downhill and want to control your speed. Best practice is to…",
      options: [
        "Ride the brakes continuously",
        "Select a lower gear before the descent so engine braking helps",
        "Slip the clutch",
        "Coast in neutral",
      ],
      correctIndex: 1,
      explanation: "Rule 122 — lower gear = engine braking = less brake fade.",
    },
    {
      q: "You've just driven through a deep puddle. You should…",
      options: [
        "Speed up to dry the brakes",
        "Test the brakes gently as soon as it is safe",
        "Ignore it — brakes always work",
        "Pull the handbrake on",
      ],
      correctIndex: 1,
      explanation: "Wet brakes can pull to one side; test gently in a safe place (Rule 121).",
    },
  ],
  "motorway-rules": [
    {
      q: "When joining a motorway from the slip road you should…",
      options: [
        "Stop at the end of the slip road and wait for a gap",
        "Match the speed of traffic in the left-hand lane and merge safely",
        "Cross straight into lane 2",
        "Sound your horn",
      ],
      correctIndex: 1,
      explanation:
        "Rule 259 — build up speed on the slip road, then merge into the left-hand lane (lane 1).",
    },
    {
      q: "You should normally drive in which lane on a motorway?",
      options: [
        "Any lane you like",
        "The left-hand lane (lane 1) unless overtaking",
        "The middle lane",
        "The right-hand lane",
      ],
      correctIndex: 1,
      explanation:
        "Rule 264 — keep left unless overtaking. Middle-lane hogging is £100 and 3 points.",
    },
    {
      q: "A red X is shown above a lane on a smart motorway. You…",
      options: [
        "May drive in it if you are slow",
        "Must not drive in the lane",
        "Can use it only for emergency vehicles",
        "Can drive in it if the road is empty",
      ],
      correctIndex: 1,
      explanation: "Rule 258 — Red X means the lane is closed. Do not drive in it.",
    },
    {
      q: "You break down on an all-lane-running smart motorway. You should try to…",
      options: [
        "Stay in the running lane",
        "Reach the next emergency refuge area if possible, otherwise get behind the barrier and call 999",
        "Reverse to the previous exit",
        "Attempt repairs in the lane",
      ],
      correctIndex: 1,
      explanation:
        "Rules 274–278 — refuge area first; if not possible, get to the left and behind the barrier.",
    },
    {
      q: "Motorway hard shoulders on a conventional motorway should only be used…",
      options: [
        "When traffic is slow",
        "In an emergency, or when signs open it to traffic",
        "When your sat-nav says so",
        "For overtaking",
      ],
      correctIndex: 1,
      explanation: "Rule 275 — emergency use only unless signs specifically open it.",
    },
  ],
  "rules-of-the-road": [
    {
      q: "The national speed limit for a car on a single carriageway is…",
      options: ["50 mph", "60 mph", "70 mph", "40 mph"],
      correctIndex: 1,
      explanation: "60mph unless a lower limit is signed (Rule 124).",
    },
    {
      q: "You are approaching a roundabout. You should give priority to…",
      options: [
        "Anyone signalling",
        "Traffic coming from your immediate right, unless signs or markings say otherwise",
        "The largest vehicle",
        "Traffic coming from your left",
      ],
      correctIndex: 1,
      explanation: "Rule 185 — give way to the right unless signed otherwise.",
    },
    {
      q: "A solid white line in the middle of the road means…",
      options: [
        "You may cross to overtake",
        "You must not cross or straddle it except in specific circumstances (turning, stationary vehicle, cyclist under 10mph)",
        "It is a temporary line",
        "Only lorries must not cross",
      ],
      correctIndex: 1,
      explanation: "Rule 129.",
    },
    {
      q: "You must not park within how many metres of a junction?",
      options: ["3 metres", "5 metres", "10 metres", "20 metres"],
      correctIndex: 2,
      explanation: "Rule 243 — 10 metres, except in an authorised parking place.",
    },
    {
      q: "You may enter a yellow box junction only when…",
      options: [
        "Your exit is clear",
        "The lights are green",
        "There is no one behind you",
        "You are turning left",
      ],
      correctIndex: 0,
      explanation: "Rule 174 — exception: turning right, blocked only by oncoming traffic.",
    },
  ],
  "road-conditions": [
    {
      q: "A red triangle sign with a picture inside is warning you of…",
      options: [
        "A prohibition",
        "A hazard ahead",
        "The end of a restriction",
        "A direction to follow",
      ],
      correctIndex: 1,
      explanation: "Triangles warn — always slow, look, and be ready to react.",
    },
    {
      q: "A blue circle sign gives…",
      options: [
        "A prohibition",
        "A positive instruction you MUST follow",
        "Tourist information",
        "A warning",
      ],
      correctIndex: 1,
      explanation: "Blue circles are mandatory — e.g. turn left, mini-roundabout, cycle route.",
    },
    {
      q: "A red ring with no diagonal line typically means…",
      options: [
        "End of restriction",
        "No entry for the vehicle or action shown",
        "Warning of hazard",
        "Advisory only",
      ],
      correctIndex: 1,
      explanation: "Red-ringed circles are prohibitions.",
    },
    {
      q: "Zig-zag lines on the road at a crossing mean…",
      options: [
        "Extra parking",
        "No overtaking and no parking in the controlled area",
        "Turning point",
        "End of speed limit",
      ],
      correctIndex: 1,
      explanation: "Zig-zags mark the controlled area on either side of a pedestrian crossing.",
    },
    {
      q: "A yellow-backed sign at the roadside indicates…",
      options: [
        "A permanent hazard",
        "A temporary sign, usually roadworks or diversion",
        "A tourist attraction",
        "A minimum speed",
      ],
      correctIndex: 1,
      explanation:
        "Yellow-backed = temporary — priority over permanent signs in the same location.",
    },
  ],
  "essential-documents": [
    {
      q: "To drive a car on a public road you must have…",
      options: [
        "A licence only",
        "A licence, valid insurance, and (if the vehicle is over 3 years old) a valid MOT",
        "A licence and MOT only",
        "Just insurance",
      ],
      correctIndex: 1,
      explanation: "All three, plus vehicle tax (VED).",
    },
    {
      q: "When must you tell DVLA about a change of address?",
      options: ["Only if you move abroad", "As soon as possible", "Only at renewal", "Never"],
      correctIndex: 1,
      explanation: "You must tell DVLA promptly — failure can lead to a fine.",
    },
    {
      q: "New drivers can have their licence revoked if they get how many penalty points within 2 years of passing?",
      options: ["3", "6", "9", "12"],
      correctIndex: 1,
      explanation: "6 points — New Drivers Act 1995.",
    },
    {
      q: "If a police officer asks for your driving documents and you do not have them with you, you can produce them at a police station within…",
      options: ["24 hours", "3 days", "7 days", "30 days"],
      correctIndex: 2,
      explanation: "7 days at a station of your choice.",
    },
    {
      q: "Third-party insurance covers…",
      options: [
        "Damage to your own car only",
        "Injury or damage caused to other people or their property",
        "Only the driver",
        "Only the passengers",
      ],
      correctIndex: 1,
      explanation: "Third-party is the legal minimum — it does not repair your own car.",
    },
  ],
  incidents: [
    {
      q: "You are first at the scene of a crash. What is your first action?",
      options: [
        "Move the casualties",
        "Warn other traffic (hazards, warning triangle 45m back — not on a motorway), then call 999",
        "Take photos",
        "Move the vehicles off the road",
      ],
      correctIndex: 1,
      explanation: "Make the scene safe first, then call for help (Rule 283).",
    },
    {
      q: "DR ABC stands for…",
      options: [
        "Drive, React, Airway, Brake, Call",
        "Danger, Response, Airway, Breathing, Circulation",
        "Direct, Report, Airway, Brake, Care",
        "Danger, Reverse, Assess, Brake, Contact",
      ],
      correctIndex: 1,
      explanation: "DR ABC is the standard first-aid sequence.",
    },
    {
      q: "You should not move a casualty unless…",
      options: [
        "They ask you to",
        "They are in immediate danger (e.g. fire, further collision)",
        "You have a first-aid kit",
        "The police tell you to",
      ],
      correctIndex: 1,
      explanation: "Moving a casualty risks worsening spinal injury unless it is unavoidable.",
    },
    {
      q: "You break down in a tunnel. You should…",
      options: [
        "Reverse to the entrance",
        "Switch off engine, switch on hazards, use the emergency phone",
        "Leave the vehicle and walk out immediately",
        "Attempt to restart repeatedly",
      ],
      correctIndex: 1,
      explanation:
        "Highway Code — Tunnels: switch off, hazards on, use the emergency phone and follow tunnel instructions.",
    },
    {
      q: "You witness a crash on the motorway. Where should you never place a warning triangle?",
      options: [
        "On a country road",
        "On a dual carriageway",
        "On a motorway (it is not safe to place one)",
        "In a car park",
      ],
      correctIndex: 2,
      explanation:
        "Warning triangles should not be placed on motorways — the risk to you is too high.",
    },
  ],
  "vehicle-loading": [
    {
      q: "Children under 12 or under 135cm tall must use…",
      options: [
        "An adult seatbelt",
        "An appropriate child restraint (booster / car seat)",
        "No restraint if in the back",
        "Whatever the parent chooses",
      ],
      correctIndex: 1,
      explanation: "Rule 100 — a child restraint is a legal MUST for under-12s / under 135cm.",
    },
    {
      q: "You are responsible for making sure passengers under 14 wear a seatbelt. This is…",
      options: [
        "Advisory guidance",
        "A legal requirement",
        "Only true for your own children",
        "Only true on motorways",
      ],
      correctIndex: 1,
      explanation: "Rule 99 — the driver is legally responsible for under-14s.",
    },
    {
      q: "Before setting off with a roof load you should…",
      options: [
        "Distribute the load evenly and secure it",
        "Overload the front to stop it lifting",
        "Rely on the roof bars alone",
        "Drive slowly and it will be fine",
      ],
      correctIndex: 0,
      explanation:
        "Uneven / insecure loads affect handling and can come off — check straps after the first few miles.",
    },
    {
      q: "When towing a trailer on a dual carriageway, the maximum speed limit for a car towing a trailer is…",
      options: ["70 mph", "60 mph", "50 mph", "40 mph"],
      correctIndex: 1,
      explanation:
        "Rule 124 — cars towing: 60 dual carriageway/motorway, 50 single carriageway, 30 built-up.",
    },
    {
      q: "Overloading a vehicle can…",
      options: [
        "Improve fuel economy",
        "Reduce stopping distance",
        "Affect handling, tyre wear and stopping distance — and is illegal",
        "Have no effect at all",
      ],
      correctIndex: 2,
      explanation: "It is an offence — and the driver is responsible, not just the owner.",
    },
  ],
};
