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
  // ── Warning ─────────────────────────────────────────────
  { id: "w-bend-right", name: "Bend to the right", meaning: "The road bends sharply to the right ahead. Slow down and stay in your lane.", category: "warning", variant: { kind: "warning", symbol: "bend-right" } },
  { id: "w-bend-left", name: "Bend to the left", meaning: "The road bends sharply to the left ahead.", category: "warning", variant: { kind: "warning", symbol: "bend-left" } },
  { id: "w-double-bend", name: "Double bend", meaning: "A series of bends — first to the left (or right, per the sign).", category: "warning", variant: { kind: "warning", symbol: "double-bend" } },
  { id: "w-roundabout", name: "Roundabout ahead", meaning: "Give way to traffic on your right at the roundabout.", category: "warning", variant: { kind: "warning", symbol: "roundabout" } },
  { id: "w-crossroads", name: "Crossroads ahead", meaning: "Junction where roads meet from left and right.", category: "warning", variant: { kind: "warning", symbol: "crossroads" } },
  { id: "w-staggered", name: "Staggered junction", meaning: "Two side roads join at slightly different points — first from the left, then from the right (or reversed on the sign).", category: "warning", variant: { kind: "warning", symbol: "staggered-junction" } },
  { id: "w-t-junction", name: "T-junction ahead", meaning: "The road you are on ends at a junction — you must give way.", category: "warning", variant: { kind: "warning", symbol: "t-junction" } },
  { id: "w-side-road", name: "Side road ahead", meaning: "A minor road joins from the side shown.", category: "warning", variant: { kind: "warning", symbol: "side-road" } },
  { id: "w-hump", name: "Hump bridge / speed hump", meaning: "Slow down — a hump or bridge is coming up.", category: "warning", variant: { kind: "warning", symbol: "hump" } },
  { id: "w-slippery", name: "Slippery road", meaning: "Surface may be slippery — brake gently and leave more space.", category: "warning", variant: { kind: "warning", symbol: "slippery" } },
  { id: "w-uneven", name: "Uneven road", meaning: "Bumpy or uneven road surface ahead.", category: "warning", variant: { kind: "warning", symbol: "uneven" } },
  { id: "w-narrows", name: "Road narrows on both sides", meaning: "Carriageway narrows ahead — check for oncoming vehicles.", category: "warning", variant: { kind: "warning", symbol: "road-narrows" } },
  { id: "w-two-way", name: "Two-way traffic", meaning: "Two-way traffic ahead — often after a one-way section.", category: "warning", variant: { kind: "warning", symbol: "two-way" } },
  { id: "w-school", name: "School / children crossing", meaning: "Children are likely to be crossing — reduce speed and be ready to stop.", category: "warning", variant: { kind: "warning", symbol: "school-children" } },
  { id: "w-pedestrians", name: "Pedestrians in road", meaning: "Pedestrians may be walking in the road ahead.", category: "warning", variant: { kind: "warning", symbol: "pedestrians" } },
  { id: "w-cyclists", name: "Cycle route ahead / cyclists", meaning: "Watch for cyclists — give at least 1.5m when overtaking.", category: "warning", variant: { kind: "warning", symbol: "cyclists" } },
  { id: "w-horse", name: "Accompanied horses or ponies", meaning: "Pass wide and slow — no revving, no horn.", category: "warning", variant: { kind: "warning", symbol: "horse" } },
  { id: "w-wild", name: "Wild animals", meaning: "Wild animals such as deer may cross the road.", category: "warning", variant: { kind: "warning", symbol: "wild-animals" } },
  { id: "w-cattle", name: "Cattle / farm animals", meaning: "Farm animals may be on the road.", category: "warning", variant: { kind: "warning", symbol: "cattle" } },
  { id: "w-elderly", name: "Elderly / frail pedestrians", meaning: "Frail or disabled pedestrians may be crossing.", category: "warning", variant: { kind: "warning", symbol: "elderly" } },
  { id: "w-roadworks", name: "Roadworks ahead", meaning: "Roadworks — expect reduced lanes and a temporary speed limit.", category: "warning", variant: { kind: "warning", symbol: "roadworks" } },
  { id: "w-signals", name: "Traffic signals ahead", meaning: "Traffic lights ahead — be ready to stop.", category: "warning", variant: { kind: "warning", symbol: "traffic-signals" } },
  { id: "w-level", name: "Level crossing without barrier", meaning: "Railway crossing with no barrier — stop when lights show.", category: "warning", variant: { kind: "warning", symbol: "level-crossing" } },
  { id: "w-lowbridge", name: "Low bridge", meaning: "Low bridge — check your headroom before continuing.", category: "warning", variant: { kind: "warning", symbol: "low-bridge" } },
  { id: "w-tunnel", name: "Tunnel ahead", meaning: "Switch on dipped headlights and remove sunglasses.", category: "warning", variant: { kind: "warning", symbol: "tunnel" } },
  { id: "w-quayside", name: "Quayside or river bank", meaning: "Unfenced water — take extra care.", category: "warning", variant: { kind: "warning", symbol: "quayside" } },
  { id: "w-steep-down", name: "Steep hill downwards", meaning: "Steep descent — engage a lower gear before starting down.", category: "warning", variant: { kind: "warning", symbol: "steep-down" } },
  { id: "w-steep-up", name: "Steep hill upwards", meaning: "Steep incline ahead.", category: "warning", variant: { kind: "warning", symbol: "steep-up" } },
  { id: "w-rocks", name: "Falling or fallen rocks", meaning: "Watch for rocks that may have fallen onto the road.", category: "warning", variant: { kind: "warning", symbol: "falling-rocks" } },
  { id: "w-exclaim", name: "Other danger (plate explains)", meaning: "General danger sign — a plate underneath tells you what.", category: "warning", variant: { kind: "warning", symbol: "exclaim" } },

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

  // ── Signals ────────────────────────────────────────────
  { id: "t-red", name: "Red light", meaning: "You must stop at the stop line — do not go past the line.", category: "signals", variant: { kind: "traffic-light", state: "red" } },
  { id: "t-red-amber", name: "Red and amber together", meaning: "Stop. Do not pass through or start until GREEN shows.", category: "signals", variant: { kind: "traffic-light", state: "red-amber" } },
  { id: "t-green", name: "Green light", meaning: "You may go if the way is clear — give way to pedestrians still crossing.", category: "signals", variant: { kind: "traffic-light", state: "green" } },
  { id: "t-amber", name: "Amber light on its own", meaning: "Stop — unless you have already crossed the line or stopping would cause a collision.", category: "signals", variant: { kind: "traffic-light", state: "amber" } },

  // ── Crossings ──────────────────────────────────────────
  { id: "c-zebra", name: "Zebra crossing", meaning: "Black-and-white stripes with flashing yellow (Belisha) beacons on poles. Give way to anyone waiting to cross.", category: "crossings", variant: { kind: "zebra-crossing" } },
  { id: "c-crossing-ahead", name: "Pedestrian crossing ahead (warning)", meaning: "The red-triangle warning for a pedestrian crossing ahead — figure walking over stripes.", category: "crossings", variant: { kind: "warning", symbol: "pedestrian-crossing" } },
  { id: "c-red-man", name: "Red man — do not cross", meaning: "Pedestrian signal showing the red standing figure. Do not start to cross.", category: "crossings", variant: { kind: "signal-crossing", state: "red-man" } },
  { id: "c-green-man", name: "Green man — cross now", meaning: "Pedestrian signal showing the green walking figure. Safe to cross, but keep watching for traffic.", category: "crossings", variant: { kind: "signal-crossing", state: "green-man" } },
  { id: "c-pelican", name: "Pelican crossing", meaning: "Pedestrian-operated traffic lights. A flashing amber phase means give way to pedestrians still on the crossing.", category: "crossings", variant: { kind: "warning", symbol: "traffic-signals" } },
  { id: "c-puffin", name: "Puffin crossing", meaning: "Sensor-controlled crossing. No flashing amber — stays red until the sensors detect that pedestrians are clear.", category: "crossings", variant: { kind: "warning", symbol: "pedestrians" } },
  { id: "c-toucan", name: "Toucan crossing", meaning: "Shared crossing — pedestrians AND cyclists may cross together on green.", category: "crossings", variant: { kind: "warning", symbol: "cyclists" } },
  { id: "c-pegasus", name: "Pegasus (equestrian) crossing", meaning: "For horse riders — higher control button and wider crossing area.", category: "crossings", variant: { kind: "warning", symbol: "horse" } },
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