import type { ReactElement } from "react";
import {
  StopFromFront,
  StopFromBehind,
  StopFromBoth,
  StopBothArmsOut,
  BeckonFromSide,
  BeckonFromFront,
  BeckonFromBehind,
  DriverSlowingDown,
  DriverTurningRight,
  DriverTurningLeft,
} from "@/components/PoliceSignalVisual";

export type SignalGroup = "stop" | "beckon" | "driver";

export type PoliceSignal = {
  id: string;
  name: string;
  group: SignalGroup;
  meaning: string;
  Visual: () => ReactElement;
};

export const signalGroups: { slug: SignalGroup; title: string; blurb: string }[] = [
  { slug: "stop", title: "Signals to stop traffic", blurb: "Highway Code rule 105 — signals given by police, traffic officers, VOSA, DVSA examiners, HATOs and school-crossing patrols." },
  { slug: "beckon", title: "Signals to beckon traffic on", blurb: "Highway Code rule 106 — clear arm movements telling drivers it is safe to proceed from a particular direction." },
  { slug: "driver", title: "Driver arm signals", blurb: "Highway Code rule 103 — arm signals you give from your own vehicle to reinforce your indicators, especially in bright sunlight or when your indicators are not working." },
];

export const policeSignals: PoliceSignal[] = [
  {
    id: "ps-stop-front",
    name: "Stop — traffic approaching from the front",
    group: "stop",
    meaning:
      "The officer faces the traffic they want to stop and raises one arm vertically above the head, palm facing the driver. Drivers approaching from the front MUST stop at the officer.",
    Visual: StopFromFront,
  },
  {
    id: "ps-stop-behind",
    name: "Stop — traffic approaching from behind",
    group: "stop",
    meaning:
      "The officer keeps their back to the traffic they want to stop, arm raised vertically behind them. Traffic coming from behind the officer MUST stop.",
    Visual: StopFromBehind,
  },
  {
    id: "ps-stop-both",
    name: "Stop — traffic from front AND behind",
    group: "stop",
    meaning:
      "The officer stands sideways to the traffic with both arms raised. Traffic approaching from both the front and behind the officer MUST stop.",
    Visual: StopFromBoth,
  },
  {
    id: "ps-stop-side",
    name: "Stop — traffic from the side",
    group: "stop",
    meaning:
      "The officer holds their arms straight out to each side, palms facing outward. This holds traffic coming from either side of the officer.",
    Visual: StopBothArmsOut,
  },
  {
    id: "ps-beckon-side",
    name: "Beckoning traffic on from the side",
    group: "beckon",
    meaning:
      "The officer faces forward and sweeps one arm from a vertical position out towards the direction they want traffic to move from. Only proceed when the officer is clearly signalling you.",
    Visual: BeckonFromSide,
  },
  {
    id: "ps-beckon-front",
    name: "Beckoning traffic on from the front",
    group: "beckon",
    meaning:
      "The officer beckons across their body towards themselves, palm facing the driver, to bring traffic on from directly in front.",
    Visual: BeckonFromFront,
  },
  {
    id: "ps-beckon-behind",
    name: "Beckoning traffic on from behind",
    group: "beckon",
    meaning:
      "The officer, keeping their back to the traffic they are directing, sweeps one arm to invite drivers behind them to move forward past.",
    Visual: BeckonFromBehind,
  },
  {
    id: "ds-slow",
    name: "I intend to slow down or stop",
    group: "driver",
    meaning:
      "Right arm extended horizontally through the driver's window with the palm facing downwards, moved slowly up and down. Use this when your brake lights alone might not be seen — bright sun, faded bulbs, or a stationary queue ahead.",
    Visual: DriverSlowingDown,
  },
  {
    id: "ds-right",
    name: "I intend to turn right",
    group: "driver",
    meaning:
      "Right arm extended straight out horizontally through the window, palm facing forwards. Reinforces a right-turn indicator — useful at junctions where drivers behind might miss your signal.",
    Visual: DriverTurningRight,
  },
  {
    id: "ds-left",
    name: "I intend to turn left",
    group: "driver",
    meaning:
      "Right arm extended and rotated anti-clockwise (or bent up at the elbow with the hand pointing left). Reinforces a left-turn indicator — required if your left indicator fails.",
    Visual: DriverTurningLeft,
  },
];