// Curated hazard-perception / anticipation questions.
// Each question has a detailed "why" so learners understand the reasoning,
// not just the answer.
export type HazardQuestion = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export const hazardQuestions: HazardQuestion[] = [
  {
    id: "hq-1",
    question:
      "You are driving down a narrow residential street with cars parked on both sides. What is the biggest hazard you should be scanning for?",
    options: [
      "Potholes in the road",
      "A car door opening or a pedestrian stepping out between the parked cars",
      "Other drivers overtaking you",
    ],
    correctIndex: 1,
    explanation:
      "On parked-out residential streets the main developing hazard is something coming from between the cars — a child, a cyclist, an opening door. Scan the tyres and gaps as you approach; if you can see wheels turning or feet under the car, be ready to brake.",
  },
  {
    id: "hq-2",
    question: "You see a ball roll into the road from behind parked cars. What should you assume?",
    options: [
      "The ball is on its own — carry on",
      "A child is likely to run out after it — cover the brake and slow down",
      "Sound the horn to warn people",
    ],
    correctIndex: 1,
    explanation:
      "A ball in the road is a classic hazard-perception cue. Where there is a toy, there is usually a child. Ease off, cover the brake and be prepared to stop — do not rely on the horn.",
  },
  {
    id: "hq-3",
    question:
      "The car in front has its brake lights on and is slowing for no obvious reason. Your safest response is to:",
    options: [
      "Overtake to keep making progress",
      "Ease off the accelerator, increase your following distance and look further ahead for what they can see that you can't",
      "Flash your headlights so they speed up",
    ],
    correctIndex: 1,
    explanation:
      "The driver ahead has almost certainly spotted a hazard you have not — a queue, a pedestrian, a slow-turning vehicle. Give yourself more time and space by lifting off, and look through and past their car to find the reason.",
  },
  {
    id: "hq-4",
    question:
      "You are approaching a zebra crossing. A pedestrian is waiting on the pavement but has not stepped out yet. You should:",
    options: [
      "Keep your speed — they haven't started to cross",
      "Slow down, be ready to stop and make eye contact so they know it's safe",
      "Flash your headlights to wave them across",
    ],
    correctIndex: 1,
    explanation:
      "Highway Code rule 195: give way to anyone waiting to cross at a zebra. Slow down early so they see your intent. Never flash — a pedestrian might step in front of a second vehicle you can't see.",
  },
  {
    id: "hq-5",
    question: "A cyclist is riding in the middle of the lane on a narrow road. You should:",
    options: [
      "Overtake as close as possible so you get past quickly",
      "Hold back until you have space to leave at least 1.5 metres, and only overtake when it is safe",
      "Sound the horn until they move over",
    ],
    correctIndex: 1,
    explanation:
      "Highway Code rule 163: leave at least 1.5 m at speeds up to 30 mph, more at higher speeds. Cyclists ride in 'primary position' precisely to stop drivers squeezing past. Wait for a real gap.",
  },
  {
    id: "hq-6",
    question:
      "You are following a bus that has stopped at a bus stop. What is the most likely developing hazard?",
    options: [
      "The bus reversing",
      "Pedestrians stepping into the road from in front of the bus, or the bus signalling to pull out",
      "The bus falling over",
    ],
    correctIndex: 1,
    explanation:
      "Two live hazards: passengers who just got off often step out from in front of the bus into your lane, and the bus itself will signal to pull away. Hang back, cover the brake, and give the bus priority if it indicates.",
  },
  {
    id: "hq-7",
    question:
      "You are driving on a wet road at 40 mph. Your stopping distance compared to a dry road is:",
    options: ["About the same", "Roughly double", "Only slightly longer"],
    correctIndex: 1,
    explanation:
      "Highway Code rule 126: braking distances at least double in the wet. Leave a 4-second gap in the wet (double the 2-second dry rule) and brake earlier and more gently.",
  },
  {
    id: "hq-8",
    question: "You are on a country lane and see a horse rider ahead. You should:",
    options: [
      "Pass wide and slow — no revving, no horn",
      "Sound the horn so the horse knows you're there",
      "Squeeze past at normal speed to get by quickly",
    ],
    correctIndex: 0,
    explanation:
      "Highway Code rule 215: pass horses wide (at least 2 m) and slow (max 10 mph). Loud noises spook horses — no horn, no revving. Wait for a safe, straight stretch.",
  },
  {
    id: "hq-9",
    question:
      "You are on a motorway and see a lorry pulling into the outside lane to overtake. You should:",
    options: [
      "Speed up to pass it before it moves out",
      "Ease off — a lorry takes far longer to complete an overtake than a car",
      "Flash your lights and hold your position",
    ],
    correctIndex: 1,
    explanation:
      "Lorries have very small speed differences between them, so an overtake can take a long time. Ease off, drop back and let the manoeuvre finish. Trying to race past creates a squeeze and a blind spot.",
  },
  {
    id: "hq-10",
    question:
      "It's early evening in autumn. The low sun is behind you and you notice the driver coming the other way is squinting. What should you do?",
    options: [
      "Nothing — it doesn't affect you",
      "Assume the oncoming driver can't see well — slow down and be ready for a mistake from them",
      "Flash your full-beam headlights",
    ],
    correctIndex: 1,
    explanation:
      "If they are dazzled they may drift, misjudge a gap or miss you altogether. Reduce speed, keep more space, and be ready to react. Anticipating other people's limits is the core skill the hazard test measures.",
  },
  {
    id: "hq-11",
    question:
      "A driver behind you is following very closely (tailgating). The safest response is to:",
    options: [
      "Brake sharply to warn them",
      "Gradually ease off and increase the gap to the vehicle in front, so you have room to brake gently for both of you",
      "Speed up to get away from them",
    ],
    correctIndex: 1,
    explanation:
      "You cannot control the tailgater, but you can control your gap in front. A bigger cushion means you can brake earlier and gentler, giving them time. Brake-checking or racing away both risk a rear-end shunt.",
  },
  {
    id: "hq-12",
    question:
      "You are turning right at a busy junction. The gap in oncoming traffic looks tight. What is the safest decision?",
    options: [
      "Go for it — press on before the gap closes",
      "Wait for a gap that is clearly safe, even if the driver behind sounds their horn",
      "Edge out into the oncoming lane to force a gap",
    ],
    correctIndex: 1,
    explanation:
      "The examiner is looking for judgment, not bravery. If in doubt, wait. A late right-turn under pressure is one of the most common serious-fault reasons on test — the horn behind you is not your problem, the collision would be.",
  },
];
