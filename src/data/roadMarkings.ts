import type { ReactElement } from "react";
import {
  CentreLine,
  HazardWarningLine,
  DoubleWhiteNoCross,
  DoubleWhiteBrokenNear,
  LaneLine,
  EdgeLine,
  GiveWayTriangle,
  StopLine,
  ZigZagCrossing,
  YellowBoxJunction,
  SingleYellow,
  DoubleYellow,
  RedRoute,
  BusLane,
  RoundaboutTriangles,
  KeepClear,
} from "@/components/RoadMarkingVisual";

export type MarkingGroup = "along" | "across" | "kerb" | "words";

export type RoadMarking = {
  id: string;
  name: string;
  group: MarkingGroup;
  meaning: string;
  Visual: () => ReactElement;
};

export const markingGroups: { slug: MarkingGroup; title: string; blurb: string }[] = [
  { slug: "along", title: "Lines along the road", blurb: "Centre lines, hazard lines, double whites, lane and edge lines." },
  { slug: "across", title: "Lines across the road", blurb: "Stop lines, give-way triangles, zebra zig-zags and box junctions." },
  { slug: "kerb", title: "Kerb / waiting restrictions", blurb: "Yellow lines, red routes, bus and cycle lanes." },
  { slug: "words", title: "Words and arrows", blurb: "Roundabout give-way triangles, 'KEEP CLEAR' and lane arrows." },
];

export const roadMarkings: RoadMarking[] = [
  // ── ALONG ─────────────────────────────────────────────
  {
    id: "rm-centre",
    name: "Centre line — short broken white",
    group: "along",
    meaning:
      "Separates the two directions of traffic on a normal road. Short white dashes with long gaps — you may cross to overtake or turn when it is safe.",
    Visual: CentreLine,
  },
  {
    id: "rm-hazard",
    name: "Hazard warning line — long broken white",
    group: "along",
    meaning:
      "Longer dashes with shorter gaps warn of a hazard ahead (a bend, junction, or narrowing). Do not overtake unless you can see the road is clear well beyond the hazard.",
    Visual: HazardWarningLine,
  },
  {
    id: "rm-dwl-solid",
    name: "Double white — solid on your side",
    group: "along",
    meaning:
      "You must NOT cross or straddle the solid line to overtake. You may cross only to enter a side road or driveway, or to pass a stationary vehicle, roadworker or cyclist doing under 10 mph — and only if safe.",
    Visual: DoubleWhiteNoCross,
  },
  {
    id: "rm-dwl-broken",
    name: "Double white — broken on your side",
    group: "along",
    meaning:
      "You may cross the lines to overtake if the road ahead is clear, but you must be able to complete the manoeuvre and return to your side before the line becomes solid on your side again.",
    Visual: DoubleWhiteBrokenNear,
  },
  {
    id: "rm-lane",
    name: "Lane line — short broken white",
    group: "along",
    meaning: "Divides lanes on multi-lane roads. Change lanes only when it is safe and your mirror-signal-manoeuvre is complete.",
    Visual: LaneLine,
  },
  {
    id: "rm-edge",
    name: "Edge of carriageway line",
    group: "along",
    meaning: "A solid white line at the edge of the road. Marks the outside of the carriageway — useful in fog or at night.",
    Visual: EdgeLine,
  },

  // ── ACROSS ────────────────────────────────────────────
  {
    id: "rm-giveway",
    name: "Give way — inverted triangle",
    group: "across",
    meaning:
      "'Give Way' painted with an inverted triangle. Slow down, look, and give way to traffic on the major road — stop if necessary. You do not have to stop if the road is clear.",
    Visual: GiveWayTriangle,
  },
  {
    id: "rm-stop",
    name: "Stop line — solid line with STOP",
    group: "across",
    meaning:
      "A single solid white line at a junction with a Stop sign. You MUST stop behind the line and only move off when it is safe. Not stopping is a driving-test serious fault.",
    Visual: StopLine,
  },
  {
    id: "rm-zigzag",
    name: "Zig-zag lines at a crossing",
    group: "across",
    meaning:
      "White or yellow zig-zags mark the approach to a zebra, pelican, puffin, toucan or equestrian crossing. You must NOT park or overtake the leading vehicle within the zig-zags.",
    Visual: ZigZagCrossing,
  },
  {
    id: "rm-box",
    name: "Yellow box junction",
    group: "across",
    meaning:
      "Do NOT enter the box unless your exit is clear. You may wait in the box to turn right if oncoming traffic (or other traffic waiting to turn right) is the only thing stopping you.",
    Visual: YellowBoxJunction,
  },

  // ── KERB ──────────────────────────────────────────────
  {
    id: "rm-single-yellow",
    name: "Single yellow line",
    group: "kerb",
    meaning:
      "No waiting during the times shown on the nearby time-plate (usually daytime hours, Mon-Sat). You may load/unload unless kerb markings also apply.",
    Visual: SingleYellow,
  },
  {
    id: "rm-double-yellow",
    name: "Double yellow lines",
    group: "kerb",
    meaning:
      "No waiting at any time, on any day. You may stop briefly to pick up or set down passengers unless there are additional kerb marks banning loading.",
    Visual: DoubleYellow,
  },
  {
    id: "rm-red-route",
    name: "Red route — single or double red lines",
    group: "kerb",
    meaning:
      "London red routes. Double red = no stopping at any time. Single red = no stopping during the hours on the plate. Very short exceptions may apply at marked bays only.",
    Visual: RedRoute,
  },
  {
    id: "rm-bus",
    name: "Bus lane",
    group: "kerb",
    meaning:
      "A red painted lane with solid white boundary lines and 'BUS LANE' painted on the tarmac. The blue time-plate shows the hours the lane is in operation — commonly Monday to Saturday, 7 am to 4 pm. During those hours only the vehicles listed on the sign (usually buses, taxis and cycles) may use the lane. Outside those hours other drivers may use it normally.",
    Visual: BusLane,
  },

  // ── WORDS ─────────────────────────────────────────────
  {
    id: "rm-roundabout",
    name: "Mini-roundabout",
    group: "words",
    meaning:
      "A solid white painted disc in the middle of a small junction. Treat it as a normal roundabout — give way to traffic on your right and go clockwise around the marking. Do not drive over the disc unless the size of your vehicle makes it unavoidable.",
    Visual: RoundaboutTriangles,
  },
  {
    id: "rm-keep-clear",
    name: "'KEEP CLEAR' markings",
    group: "words",
    meaning:
      "Do not stop or park on the marked area, even briefly. Typically outside schools, at junction mouths and hospital entrances so access stays clear.",
    Visual: KeepClear,
  },
];