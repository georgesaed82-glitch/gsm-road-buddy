import type { SignVariant } from "@/components/SignVisual";

export type SignCategory =
  | "warning"
  | "prohibitory"
  | "mandatory"
  | "speed"
  | "information"
  | "direction"
  | "signals"
  | "crossings";

export type Sign = {
  id: string;
  name: string;
  meaning: string;
  category: SignCategory;
  variant: SignVariant;
};

export const signCategories: { slug: SignCategory; title: string; blurb: string }[] = [
  { slug: "warning", title: "Warning signs (red triangle)", blurb: "Alert you to hazards ahead — bends, junctions, pedestrians, cyclists." },
  { slug: "prohibitory", title: "Prohibition signs (red circle)", blurb: "Tell you what you must not do." },
  { slug: "mandatory", title: "Mandatory signs (blue circle)", blurb: "Tell you what you must do." },
  { slug: "speed", title: "Speed limits", blurb: "Maximum speeds — red circle with a number, plus the national speed limit sign." },
  { slug: "information", title: "Information & services", blurb: "Blue rectangles giving useful info: parking, hospitals, fuel, phones." },
  { slug: "direction", title: "Direction signs", blurb: "Green = primary routes, blue = motorways, white = local roads." },
  { slug: "signals", title: "Traffic light signals", blurb: "Red, red+amber, green, amber — know exactly what each phase means." },
  { slug: "crossings", title: "Pedestrian crossings", blurb: "Zebra, pelican, puffin, toucan, equestrian — the differences matter." },
];

export const signs: Sign[] = [
  // ── Warning (red triangle, point up) ───────────────────
  // Rule 109: warning signs are mostly triangular. They alert you to a hazard
  // ahead — they do not tell you what to do. Slow down and be ready to act.
  { id: "w-bend-right", name: "Bend to the right", meaning: "The road bends sharply to the right ahead. Reduce speed before the bend and stay on your own side of the road.", category: "warning", variant: { kind: "warning", symbol: "bend-right" } },
  { id: "w-bend-left", name: "Bend to the left", meaning: "The road bends sharply to the left ahead. Reduce speed before the bend and stay in your lane.", category: "warning", variant: { kind: "warning", symbol: "bend-left" } },
  { id: "w-double-bend", name: "Double bend", meaning: "Two bends close together. The first bend is in the direction shown by the sign (here, to the right first, then to the left).", category: "warning", variant: { kind: "warning", symbol: "double-bend" } },
  { id: "w-roundabout", name: "Roundabout ahead", meaning: "There is a roundabout ahead. Slow down; at the roundabout give way to traffic already on it, normally coming from your right (Rule 185).", category: "warning", variant: { kind: "warning", symbol: "roundabout" } },
  { id: "w-crossroads", name: "Crossroads ahead", meaning: "Junction ahead where roads cross from the left and the right. Approach with care — priority depends on the road markings and any give-way or stop signs.", category: "warning", variant: { kind: "warning", symbol: "crossroads" } },
  { id: "w-staggered", name: "Staggered junction", meaning: "Two side roads join the main road at slightly different points — the sign shows which side comes first (here, from the left, then from the right).", category: "warning", variant: { kind: "warning", symbol: "staggered-junction" } },
  { id: "w-t-junction", name: "T-junction with priority as shown", meaning: "The road you are on ends at a T-junction. The thicker bar shows the priority (major) road; you must give way to traffic on it.", category: "warning", variant: { kind: "warning", symbol: "t-junction" } },
  { id: "w-side-road", name: "Side road ahead", meaning: "A minor road joins the main road from the side shown. Watch for vehicles pulling out.", category: "warning", variant: { kind: "warning", symbol: "side-road" } },
  { id: "w-hump", name: "Hump bridge", meaning: "A hump bridge is ahead. Slow down — you may not be able to see oncoming vehicles or the road beyond the crest.", category: "warning", variant: { kind: "warning", symbol: "hump" } },
  { id: "w-road-humps", name: "Road humps ahead", meaning: "A series of traffic-calming road humps ahead. Slow down and cross them straight on.", category: "warning", variant: { kind: "warning", symbol: "hump" } },
  { id: "w-slippery", name: "Slippery road", meaning: "The road surface may be slippery, especially when wet. Brake gently, leave more space, and avoid sudden steering (Rule 227).", category: "warning", variant: { kind: "warning", symbol: "slippery" } },
  { id: "w-uneven", name: "Uneven road surface", meaning: "The road surface ahead is uneven, broken or poor quality. Reduce speed to keep control and protect your vehicle.", category: "warning", variant: { kind: "warning", symbol: "uneven" } },
  { id: "w-narrows", name: "Road narrows on both sides", meaning: "The carriageway narrows from both sides ahead. Check your position and watch for oncoming vehicles.", category: "warning", variant: { kind: "warning", symbol: "road-narrows" } },
  { id: "w-two-way", name: "Two-way traffic straight ahead", meaning: "Two-way traffic ahead — typically at the end of a one-way section or dual carriageway. Expect oncoming vehicles.", category: "warning", variant: { kind: "warning", symbol: "two-way" } },
  { id: "w-school", name: "School crossing patrol / children", meaning: "Children going to or from school are likely to be crossing. Reduce speed and be ready to stop. A school-crossing patrol (lollipop stick) may be shown ahead (Rule 210).", category: "warning", variant: { kind: "warning", symbol: "school-children" } },
  { id: "w-pedestrians", name: "Pedestrians in the road ahead", meaning: "Pedestrians may be walking in the road — for example where there is no footway. Slow down and give them plenty of room.", category: "warning", variant: { kind: "warning", symbol: "pedestrians" } },
  { id: "w-cyclists", name: "Cycle route crosses road / cyclists likely", meaning: "A cycle route crosses or joins the road ahead. Look out for cyclists, especially at junctions, and give them plenty of room when overtaking (Rule 163).", category: "warning", variant: { kind: "warning", symbol: "cyclists" } },
  { id: "w-horse", name: "Accompanied horses or ponies", meaning: "Horse riders or animals may be in the road. Pass slowly and wide — do not sound the horn or rev the engine (Rule 215).", category: "warning", variant: { kind: "warning", symbol: "horse" } },
  { id: "w-wild", name: "Wild animals", meaning: "Wild animals such as deer may cross the road, especially at dawn and dusk. Slow down and be ready to stop.", category: "warning", variant: { kind: "warning", symbol: "wild-animals" } },
  { id: "w-cattle", name: "Cattle likely in road", meaning: "Farm animals may be on or crossing the road. Be ready to stop and pass slowly if they are present.", category: "warning", variant: { kind: "warning", symbol: "cattle" } },
  { id: "w-elderly", name: "Frail (elderly or disabled) pedestrians likely to cross", meaning: "Frail, elderly or disabled pedestrians are likely to cross the road. Give them extra time and be prepared to stop.", category: "warning", variant: { kind: "warning", symbol: "elderly" } },
  { id: "w-roadworks", name: "Roadworks ahead", meaning: "Roadworks ahead — expect a temporary speed limit, narrow or reduced lanes, and workers close to traffic. Follow any temporary signs and signals (Rule 288).", category: "warning", variant: { kind: "warning", symbol: "roadworks" } },
  { id: "w-signals", name: "Traffic signals ahead", meaning: "Traffic lights are ahead — often where they might not be expected (bend, crest of a hill). Be ready to stop.", category: "warning", variant: { kind: "warning", symbol: "traffic-signals" } },
  { id: "w-level", name: "Level crossing without barrier or gate", meaning: "Railway level crossing ahead with no barrier or gate — only lights. When the red lights flash you MUST stop; do not cross until they go out (Rules 293–294).", category: "warning", variant: { kind: "warning", symbol: "level-crossing" } },
  { id: "w-lowbridge", name: "Low bridge ahead", meaning: "Low bridge — the maximum headroom is shown on the sign. Only continue if your vehicle will safely pass under.", category: "warning", variant: { kind: "warning", symbol: "low-bridge" } },
  { id: "w-tunnel", name: "Tunnel ahead", meaning: "Tunnel ahead. Switch on dipped headlights, remove sunglasses and keep a safe distance from the vehicle in front (Rules 126, 236).", category: "warning", variant: { kind: "warning", symbol: "tunnel" } },
  { id: "w-quayside", name: "Quayside or river bank", meaning: "An unfenced road runs alongside water. Take extra care — there is no barrier between the road and the drop.", category: "warning", variant: { kind: "warning", symbol: "quayside" } },
  { id: "w-steep-down", name: "Steep hill downwards", meaning: "Steep descent ahead — the gradient is shown as a percentage. Select a low gear before you start down to help control your speed with engine braking (Rule 160).", category: "warning", variant: { kind: "warning", symbol: "steep-down" } },
  { id: "w-steep-up", name: "Steep hill upwards", meaning: "Steep incline ahead — the gradient is shown as a percentage. Change down early to keep momentum.", category: "warning", variant: { kind: "warning", symbol: "steep-up" } },
  { id: "w-rocks", name: "Falling or fallen rocks", meaning: "Rocks may fall on to the road, or fallen rocks may be lying on it. Watch the road surface and look ahead.", category: "warning", variant: { kind: "warning", symbol: "falling-rocks" } },
  { id: "w-exclaim", name: "Other danger — plate below explains", meaning: "General danger warning. A separate plate underneath the triangle explains the specific hazard (e.g. flood, ice).", category: "warning", variant: { kind: "warning", symbol: "exclaim" } },

  // ── Give way / stop ────────────────────────────────────
  { id: "p-giveway", name: "Give way", meaning: "Give way to traffic on the major road. You may go on without stopping if it is clear.", category: "prohibitory", variant: { kind: "giveway" } },
  { id: "p-stop", name: "STOP", meaning: "You MUST stop completely at the line and give way — even if the road is clear.", category: "prohibitory", variant: { kind: "stop" } },

  // ── Prohibition ────────────────────────────────────────
  { id: "p-no-entry", name: "No entry for vehicular traffic", meaning: "You must not enter — one-way street the other way.", category: "prohibitory", variant: { kind: "no-entry" } },
  { id: "p-no-vehicles", name: "No motor vehicles", meaning: "No cars, motorbikes or other motor vehicles.", category: "prohibitory", variant: { kind: "prohibition", symbol: "car" } },
  { id: "p-no-hgv", name: "No goods vehicles over max weight", meaning: "Heavy goods vehicles above the shown weight prohibited.", category: "prohibitory", variant: { kind: "prohibition", symbol: "truck" } },
  { id: "p-no-bikes", name: "No cycling", meaning: "Cycling is not allowed beyond this sign.", category: "prohibitory", variant: { kind: "prohibition", symbol: "bike" } },
  { id: "p-no-peds", name: "No pedestrians", meaning: "Pedestrians must not enter.", category: "prohibitory", variant: { kind: "prohibition", symbol: "pedestrian-solo" } },
  { id: "p-no-left", name: "No left turn", meaning: "You must not turn left.", category: "prohibitory", variant: { kind: "prohibition", symbol: "turn-left", slash: true } },
  { id: "p-no-right", name: "No right turn", meaning: "You must not turn right.", category: "prohibitory", variant: { kind: "prohibition", symbol: "turn-right", slash: true } },
  { id: "p-no-uturn", name: "No U-turn", meaning: "U-turns are not permitted.", category: "prohibitory", variant: { kind: "prohibition", symbol: "u-turn", slash: true } },
  { id: "p-no-overtake", name: "No overtaking", meaning: "You must not overtake other vehicles.", category: "prohibitory", variant: { kind: "prohibition", symbol: "overtake" } },
  { id: "p-end-overtake", name: "End of no-overtaking zone", meaning: "The no-overtaking restriction ends.", category: "prohibitory", variant: { kind: "end-restriction", symbol: "overtake" } },

  // ── Speed limits ───────────────────────────────────────
  { id: "s-20", name: "20 mph maximum speed limit", meaning: "You must not exceed 20 mph.", category: "speed", variant: { kind: "speed-limit", text: "20" } },
  { id: "s-30", name: "30 mph maximum speed limit", meaning: "You must not exceed 30 mph — usually default in built-up areas.", category: "speed", variant: { kind: "speed-limit", text: "30" } },
  { id: "s-40", name: "40 mph maximum speed limit", meaning: "You must not exceed 40 mph.", category: "speed", variant: { kind: "speed-limit", text: "40" } },
  { id: "s-50", name: "50 mph maximum speed limit", meaning: "You must not exceed 50 mph.", category: "speed", variant: { kind: "speed-limit", text: "50" } },
  { id: "s-60", name: "60 mph maximum speed limit", meaning: "You must not exceed 60 mph.", category: "speed", variant: { kind: "speed-limit", text: "60" } },
  { id: "s-70", name: "70 mph maximum speed limit", meaning: "Maximum speed on motorways and dual carriageways for cars.", category: "speed", variant: { kind: "speed-limit", text: "70" } },
  { id: "s-national", name: "National speed limit applies", meaning: "60 mph on single carriageways, 70 mph on dual carriageways and motorways (for cars).", category: "speed", variant: { kind: "national-speed" } },

  // ── Mandatory (blue circle) ────────────────────────────
  { id: "m-ahead", name: "Ahead only", meaning: "You must go straight ahead.", category: "mandatory", variant: { kind: "mandatory", symbol: "arrow-up" } },
  { id: "m-turn-left", name: "Turn left ahead", meaning: "You must turn left at the junction ahead.", category: "mandatory", variant: { kind: "mandatory", symbol: "turn-left" } },
  { id: "m-turn-right", name: "Turn right ahead", meaning: "You must turn right at the junction ahead.", category: "mandatory", variant: { kind: "mandatory", symbol: "turn-right" } },
  { id: "m-keep-left", name: "Keep left", meaning: "You must pass this side of the sign.", category: "mandatory", variant: { kind: "mandatory", symbol: "keep-left" } },
  { id: "m-keep-right", name: "Keep right", meaning: "You must pass this side of the sign.", category: "mandatory", variant: { kind: "mandatory", symbol: "keep-right" } },
  { id: "m-mini-r", name: "Mini-roundabout", meaning: "Give way to traffic from the right — go clockwise around the marking.", category: "mandatory", variant: { kind: "mandatory", symbol: "mini-roundabout" } },
  { id: "m-bus", name: "Buses and cycles only", meaning: "Route restricted to buses and cycles.", category: "mandatory", variant: { kind: "mandatory", symbol: "bus" } },
  { id: "m-cycle", name: "Cycle route only", meaning: "Route for pedal cycles only.", category: "mandatory", variant: { kind: "mandatory", symbol: "bike" } },

  // ── Information (blue rectangle) ───────────────────────
  { id: "i-parking", name: "Parking place", meaning: "Public parking area.", category: "information", variant: { kind: "info-blue", symbol: "parking" } },
  { id: "i-hospital", name: "Hospital with A&E", meaning: "Hospital with an accident and emergency department.", category: "information", variant: { kind: "info-blue", symbol: "hospital" } },
  { id: "i-fuel", name: "Fuel station", meaning: "Petrol / diesel filling station.", category: "information", variant: { kind: "info-blue", symbol: "petrol" } },
  { id: "i-info", name: "Tourist information", meaning: "Tourist information point.", category: "information", variant: { kind: "info-blue", symbol: "info-i" } },
  { id: "i-phone", name: "Emergency telephone", meaning: "Emergency roadside phone available.", category: "information", variant: { kind: "info-blue", symbol: "phone" } },
  { id: "i-food", name: "Refreshments / services", meaning: "Refreshments or motorway services.", category: "information", variant: { kind: "info-blue", symbol: "food" } },

  // ── Direction ──────────────────────────────────────────
  { id: "d-primary", name: "Primary route direction sign", meaning: "Green background = primary A-road direction.", category: "direction", variant: { kind: "info-green", label: "A40  West End" } },
  { id: "d-motorway", name: "Motorway direction sign", meaning: "Blue background with white text = motorway route.", category: "direction", variant: { kind: "motorway", label: "M25  The North" } },
  { id: "d-local", name: "Non-primary / local route sign", meaning: "White with black border = local / non-primary route.", category: "direction", variant: { kind: "info-white", label: "Notting Hill" } },

  // Countdown markers before a motorway exit — Highway Code, "Motorway signals and signs"
  { id: "d-count-300", name: "Countdown marker — 300 yards to exit", meaning: "Three diagonal bars. You are 300 yards from the start of the slip road at the next exit. Get into the left-hand lane in good time.", category: "direction", variant: { kind: "countdown-marker", distance: 300, background: "motorway" } },
  { id: "d-count-200", name: "Countdown marker — 200 yards to exit", meaning: "Two diagonal bars. 200 yards from the exit slip road — check mirrors and signal.", category: "direction", variant: { kind: "countdown-marker", distance: 200, background: "motorway" } },
  { id: "d-count-100", name: "Countdown marker — 100 yards to exit", meaning: "One diagonal bar. 100 yards from the exit slip road — begin to leave the motorway.", category: "direction", variant: { kind: "countdown-marker", distance: 100, background: "motorway" } },

  // Advance direction sign at a roundabout — ring diagram with each exit labelled
  { id: "d-roundabout-ads", name: "Advance direction sign — roundabout", meaning: "Shown before a roundabout. Each stub coming off the ring is an exit — read the labels to work out which exit you need before you arrive, then position and signal in good time.", category: "direction", variant: {
    kind: "roundabout-ads",
    background: "primary",
    exits: [
      { angle: "left", label: "Ealing", route: "A4020" },
      { angle: "ahead", label: "The West", route: "M4" },
      { angle: "right", label: "Central London", route: "A40" },
    ],
  } },

  // Route confirmation / lane-allocation sign — arrows for each lane with destination + route
  { id: "d-route-lanes", name: "Signs for each lane — follow the arrow for your destination", meaning: "Overhead or advance sign showing which lane serves which destination. Get into the correct lane early — do not change lane at the last moment.", category: "direction", variant: {
    kind: "route-lanes",
    background: "motorway",
    lanes: [
      { arrow: "up-left", destination: "The North", route: "M40" },
      { arrow: "up", destination: "Central London", route: "A40" },
      { arrow: "up-right", destination: "Heathrow", route: "M4" },
    ],
  } },


  // ── Signals ────────────────────────────────────────────
  // Sequence at UK traffic signals (Highway Code Rule 176):
  //   RED  →  RED + AMBER  →  GREEN  →  AMBER  →  RED  →  …
  { id: "t-red", name: "Red", meaning: "You MUST stop behind the white stop line across your side of the road. Wait — do not enter the junction, even to turn left, until the light changes (Rule 176).", category: "signals", variant: { kind: "traffic-light", state: "red" } },
  { id: "t-red-amber", name: "Red and amber", meaning: "You MUST still stop — do not pass through or start moving until the light turns GREEN. This phase warns that green is about to appear (Rule 176).", category: "signals", variant: { kind: "traffic-light", state: "red-amber" } },
  { id: "t-green", name: "Green", meaning: "You may go if the way is clear. Give way to pedestrians already crossing, and only enter the junction if you can clear it before the lights change again (Rules 176, 178).", category: "signals", variant: { kind: "traffic-light", state: "green" } },
  { id: "t-amber", name: "Amber (steady)", meaning: "Stop at the stop line. You may only continue if the amber appears after you have already crossed the line, or if stopping would cause a collision (Rule 176).", category: "signals", variant: { kind: "traffic-light", state: "amber" } },

  // ── Crossings ──────────────────────────────────────────
  { id: "c-zebra", name: "Zebra crossing", meaning: "Black-and-white stripes with flashing yellow (Belisha) beacons on poles. Give way to anyone waiting to cross.", category: "crossings", variant: { kind: "zebra-crossing" } },
  { id: "c-crossing-ahead", name: "Pedestrian crossing ahead (warning)", meaning: "The red-triangle warning for a pedestrian crossing ahead — figure walking over stripes.", category: "crossings", variant: { kind: "warning", symbol: "pedestrian-crossing" } },
  { id: "c-red-man", name: "Red man — do not cross", meaning: "Pedestrian signal showing the red standing figure. Do not start to cross.", category: "crossings", variant: { kind: "signal-crossing", state: "red-man" } },
  { id: "c-green-man", name: "Green man — cross now", meaning: "Pedestrian signal showing the green walking figure. Safe to cross, but keep watching for traffic.", category: "crossings", variant: { kind: "signal-crossing", state: "green-man" } },
  { id: "c-pelican", name: "Pelican crossing", meaning: "Pedestrian-operated traffic lights with a flashing amber phase. When the amber light is flashing you MUST give way to pedestrians still on the crossing; if the crossing is clear you may go (Highway Code Rule 196).", category: "crossings", variant: { kind: "signal-crossing", state: "green-man", type: "pelican" } },
  { id: "c-puffin", name: "Puffin crossing", meaning: "Sensor-controlled crossing with the red/green figure on the near side of the road (not opposite). There is no flashing amber phase — sensors hold the traffic lights on red until pedestrians have finished crossing (Rule 199).", category: "crossings", variant: { kind: "signal-crossing", state: "red-man", type: "puffin" } },
  { id: "c-toucan", name: "Toucan crossing", meaning: "Shared crossing for pedestrians AND cyclists — cyclists may ride across when the green cycle/green man symbols show. No flashing amber phase (Rule 199).", category: "crossings", variant: { kind: "signal-crossing", state: "green-man", type: "toucan" } },
  { id: "c-pegasus", name: "Pegasus (equestrian) crossing", meaning: "Signal-controlled crossing for horse riders. A second push-button is fitted about 2 m above the ground and the crossing area is wider so horses can wait safely (Rule 199).", category: "crossings", variant: { kind: "signal-crossing", state: "green-man", type: "pegasus" } },
];

export function signsByCategory(cat: SignCategory) {
  return signs.filter((s) => s.category === cat);
}

// ── Grouping for the /road-signs learner page ──────────────────
export type SignGroup =
  | "warning"
  | "regulatory"
  | "mandatory"
  | "motorway"
  | "parking"
  | "temporary"
  | "information";

export const signGroups: { slug: SignGroup; title: string; blurb: string }[] = [
  { slug: "warning", title: "Warning signs", blurb: "Red triangles — hazards ahead." },
  { slug: "regulatory", title: "Regulatory signs", blurb: "Red circles, speed limits, stop and give way — orders you must obey." },
  { slug: "mandatory", title: "Mandatory signs", blurb: "Blue circles — what you must do." },
  { slug: "motorway", title: "Motorway signs", blurb: "Blue background — motorway direction and rules." },
  { slug: "parking", title: "Parking signs", blurb: "Where you may and may not park." },
  { slug: "temporary", title: "Temporary signs", blurb: "Roadworks and temporary controls." },
  { slug: "information", title: "Information signs", blurb: "Services, crossings, signals and direction signs." },
];

export function signGroupOf(s: Sign): SignGroup {
  if (s.id === "i-parking") return "parking";
  if (s.id === "w-roadworks") return "temporary";
  if (s.id === "d-motorway") return "motorway";
  if (s.category === "warning") return "warning";
  if (s.category === "prohibitory" || s.category === "speed") return "regulatory";
  if (s.category === "mandatory") return "mandatory";
  return "information";
}

export function signsByGroup(g: SignGroup): Sign[] {
  return signs.filter((s) => signGroupOf(s) === g);
}

export function buildSignOptions(sign: Sign, pool: Sign[] = signs): { options: string[]; correctIndex: number } {
  const distractPool = pool.filter((s) => s.id !== sign.id && s.category === sign.category);
  const global = pool.filter((s) => s.id !== sign.id);
  const source = distractPool.length >= 3 ? distractPool : global;
  const picked: string[] = [];
  const used = new Set<string>();
  while (picked.length < 3 && used.size < source.length) {
    const cand = source[Math.floor(Math.random() * source.length)];
    if (used.has(cand.id)) continue;
    used.add(cand.id);
    picked.push(cand.name);
  }
  const all = [...picked, sign.name];
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return { options: all, correctIndex: all.indexOf(sign.name) };
}