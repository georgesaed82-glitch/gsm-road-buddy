export type TheoryQ = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export const homeTheoryQuestions: TheoryQ[] = [
  {
    question: "What is the national speed limit on a single carriageway for a car?",
    options: ["50 mph", "60 mph", "70 mph"],
    correctIndex: 1,
    explanation:
      "For a car or car-derived van on a single carriageway with the national speed limit sign (white circle with a diagonal black line), the limit is 60 mph. It only becomes 70 mph on a dual carriageway or motorway.",
  },
  {
    question: "In good, dry conditions, what is the typical overall stopping distance at 30 mph?",
    options: ["Around 12 metres", "Around 23 metres", "Around 36 metres"],
    correctIndex: 1,
    explanation:
      "At 30 mph the overall stopping distance is about 23 metres — 9 m thinking + 14 m braking. Learn these: 20=12, 30=23, 40=36, 50=53, 60=73, 70=96. They come up almost every theory test.",
  },
  {
    question: "The minimum legal tread depth for a car tyre in the UK is:",
    options: ["1.0 mm", "1.6 mm", "2.5 mm"],
    correctIndex: 1,
    explanation:
      "1.6 mm across the central three-quarters of the tyre, right around the circumference. Below that it's illegal — 3 points and a fine per tyre.",
  },
  {
    question: "You're on a wet road. What should you do with your following distance?",
    options: [
      "Keep the same 2-second gap",
      "Double it to at least 4 seconds",
      "Halve it so you don't get cut up",
    ],
    correctIndex: 1,
    explanation:
      "Wet roads at least double stopping distance because the tyres have less grip. The 2-second rule becomes 4 seconds. In ice, it can be 10 times longer.",
  },
  {
    question: "When must you use dipped headlights during the day?",
    options: [
      "Only when it is raining",
      "When visibility is seriously reduced",
      "Never — daylight is enough",
    ],
    correctIndex: 1,
    explanation:
      "The Highway Code says you MUST use headlights when visibility is seriously reduced (generally under 100 m). Dipped beam — not fog lights unless it's actually foggy — so you don't dazzle other drivers.",
  },
  {
    question: "You see a flashing amber light at a Pelican crossing. You should:",
    options: [
      "Stop and wait for it to turn green",
      "Give way to pedestrians already on the crossing, then go",
      "Sound your horn and drive on",
    ],
    correctIndex: 1,
    explanation:
      "Flashing amber at a Pelican means pedestrians already on the crossing have priority. Once it's clear, you can proceed — you don't need to wait for green.",
  },
  {
    question: "What's the maximum penalty for using a hand-held phone while driving?",
    options: ["3 points and £100", "6 points and £200", "A verbal warning"],
    correctIndex: 1,
    explanation:
      "Since 2022 it's 6 penalty points and a £200 fine — even at traffic lights or in a queue. New drivers within 2 years of passing lose their licence at 6 points.",
  },
  {
    question:
      "You're approaching a zebra crossing and a pedestrian is waiting on the pavement. You should:",
    options: [
      "Carry on — they're not on it yet",
      "Slow down and be ready to stop",
      "Flash your headlights to wave them across",
    ],
    correctIndex: 1,
    explanation:
      "Slow down and be prepared to stop. Never flash or wave pedestrians across — another driver may not see them. Let them make the decision to step out.",
  },
  {
    question: "An ambulance behind you has blue flashing lights and its siren on. You should:",
    options: [
      "Brake hard immediately",
      "Stay calm, check mirrors and pull over safely when you can",
      "Mount the pavement to get out of the way",
    ],
    correctIndex: 1,
    explanation:
      "Stay calm, check your mirrors, and move left to a safe place when it's legal and safe. Don't brake sharply, don't stop on a bend, and don't break the law (like crossing a red light) to make space.",
  },
  {
    question: "You're driving in a 30 mph zone with street lights. What does that usually mean?",
    options: [
      "It's a motorway feeder road",
      "The limit is 30 mph unless signs say otherwise",
      "You can do 40 mph if traffic is light",
    ],
    correctIndex: 1,
    explanation:
      "Street lights, no repeater signs → built-up area, 30 mph. Repeater signs (e.g. 20 or 40) override that. If in doubt, assume 30.",
  },
];
