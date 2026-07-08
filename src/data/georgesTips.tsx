import type { ReactNode } from "react";

export type GeorgesTipEntry = {
  title: string;
  body: ReactNode;
};

const B = ({ items }: { items: string[] }) => (
  <ul className="mt-2 space-y-1">
    {items.map((i) => (
      <li key={i} className="flex gap-2">
        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
        <span>{i}</span>
      </li>
    ))}
  </ul>
);

const Q = ({ children }: { children: ReactNode }) => (
  <p className="mt-2 italic text-foreground">“{children}”</p>
);

const P = ({ children }: { children: ReactNode }) => <p>{children}</p>;

export const georgesTips: Record<string, GeorgesTipEntry[]> = {
  // ─────────────────────────── ALERTNESS ───────────────────────────
  alertness: [
    {
      title: "Mirrors before movement",
      body: (
        <>
          <P>Check your mirrors whenever you:</P>
          <B
            items={[
              "Lift off the accelerator",
              "Brake",
              "Accelerate",
              "Change direction",
              "Change position",
            ]}
          />
          <P>If you can't remember your last mirror check, it's probably overdue.</P>
        </>
      ),
    },
    {
      title: "The 5-second scan",
      body: (
        <P>
          Sweep your mirrors every five to eight seconds. It becomes a rhythm — and rhythm beats
          memory when you're tired.
        </P>
      ),
    },
    {
      title: "Wake your eyes up first",
      body: (
        <P>
          Before you turn the key, take three deep breaths and look far up the road. You drive with
          your eyes, not the steering wheel.
        </P>
      ),
    },
    {
      title: "Phone in the boot",
      body: (
        <P>
          Out of sight, out of temptation. A notification you can't see is a notification that can't
          kill you.
        </P>
      ),
    },
    {
      title: "Break every two hours",
      body: (
        <P>
          Even 15 minutes off the wheel resets your concentration. Fatigue makes the same mistakes
          as alcohol — just slower.
        </P>
      ),
    },
    {
      title: "One song, one check",
      body: (
        <P>
          Every time a new song starts, do a full mirror sweep. Little anchors keep you scanning
          without thinking.
        </P>
      ),
    },
    {
      title: "Blind spot means blind spot",
      body: (
        <P>
          A mirror check is not a shoulder check. Turn your head before you move off, change lane or
          leave a parked position.
        </P>
      ),
    },
    {
      title: "Talk yourself through it",
      body: (
        <P>
          “Mirror… signal… manoeuvre.” Saying it out loud on lessons builds a routine that survives
          test-day nerves.
        </P>
      ),
    },
    {
      title: "Eyes up, not down",
      body: (
        <P>
          Speedo checks should be a glance, not a stare. If you're looking down for more than a
          second, you've stopped driving the road.
        </P>
      ),
    },
  ],

  // ─────────────────────────── ATTITUDE ───────────────────────────
  attitude: [
    {
      title: "Give yourself time — the two-second rule",
      body: (
        <>
          <P>As the vehicle ahead passes a lamp post, say:</P>
          <Q>Only a fool breaks the two-second rule.</Q>
          <P>
            If you reach the marker before finishing the sentence, you're too close. Double it in
            the wet, ten times it in ice.
          </P>
        </>
      ),
    },
    {
      title: "Let it go",
      body: (
        <P>
          Someone cut you up? Wave, breathe, move on. Anger is fuel — don't burn yours on strangers.
        </P>
      ),
    },
    {
      title: "Kindness is contagious",
      body: (
        <P>
          Let one car out of a side road on every journey. You'll arrive in a better mood — and so
          will they.
        </P>
      ),
    },
    {
      title: "Never race an ego",
      body: (
        <P>
          If a driver is trying to prove something, let them. The road isn't a competition and you
          don't have to enter.
        </P>
      ),
    },
    {
      title: "Horn = warn, not scold",
      body: (
        <P>
          Use the horn to say “I'm here,” not “How dare you.” It's a safety tool, not a punishment.
        </P>
      ),
    },
    {
      title: "Blue lights — left and slow",
      body: (
        <P>
          Ease left, slow down, don't mount the kerb, don't run a red. Make room, then get out of
          their way calmly.
        </P>
      ),
    },
    {
      title: "Assume they didn't mean it",
      body: (
        <P>
          Most bad driving is a mistake, not a personal attack. Assume incompetence before malice —
          you'll drive better.
        </P>
      ),
    },
    {
      title: "Bus pulling out",
      body: (
        <P>
          In a 30 or below, let them go. It's the law, and you'd want the same courtesy on a wet
          Tuesday morning.
        </P>
      ),
    },
  ],

  // ────────────────────── SAFETY AND VEHICLE ──────────────────────
  "safety-and-vehicle": [
    {
      title: "POWDERY checks",
      body: (
        <>
          <P>Before long journeys, remember:</P>
          <B
            items={[
              "P — Petrol",
              "O — Oil",
              "W — Water",
              "D — Damage",
              "E — Electrics",
              "R — Rubber",
              "Y — Yourself",
            ]}
          />
          <P>Five minutes of checks can prevent a breakdown or a failed driving test.</P>
        </>
      ),
    },
    {
      title: "Tread the 20p test",
      body: (
        <P>
          Slot a 20p coin into your tyre tread. If the outer band shows, you're too close to the 1.6
          mm legal limit.
        </P>
      ),
    },
    {
      title: "Walk round, every time",
      body: (
        <P>
          Thirty seconds around the car spots the flat tyre, the child's toy under the wheel and the
          neighbour's cat asleep on the roof.
        </P>
      ),
    },
    {
      title: "Lights on, walk out",
      body: (
        <P>
          Turn every light on, walk around, turn them off. One bulb costs £3. A pull-over costs
          points.
        </P>
      ),
    },
    {
      title: "Cold engine, gentle throttle",
      body: (
        <P>
          Give the oil 30 seconds to get everywhere before you ask for revs. Your engine will last
          twice as long.
        </P>
      ),
    },
    {
      title: "Handbrake before neutral",
      body: (
        <P>
          Park brake first, then gears. Never rely on the gearbox alone to hold the car on a slope.
        </P>
      ),
    },
    {
      title: "Wipers — clear, then set off",
      body: (
        <P>
          Frosty morning? Scrape it all — not a letterbox slot. Ten seconds saves a fine and a fail.
        </P>
      ),
    },
    {
      title: "Fuel light means find one",
      body: (
        <P>
          Once the light comes on, don't gamble. You've got roughly 30–40 miles — plan the next
          petrol station, don't hope for one.
        </P>
      ),
    },
    {
      title: "Lock it, even on the drive",
      body: (
        <P>
          Most car thefts happen at home. Keys off the hallway table, doors locked, windows up.
          Every time.
        </P>
      ),
    },
    {
      title: "Smooth = economical",
      body: (
        <P>
          Ease on the throttle, look ahead, coast to lights in gear. You'll save 10–15% fuel and
          wear.
        </P>
      ),
    },
  ],

  // ───────────────────────── SAFETY MARGINS ─────────────────────────
  "safety-margins": [
    {
      title: "Stopping distances feel bigger than they read",
      body: (
        <P>
          At 60 mph you'll travel a full football pitch before you stop in the dry — nearly two in
          the wet. Look further ahead than you think you need to.
        </P>
      ),
    },
    {
      title: "The mph-minus-20 trick",
      body: (
        <>
          <P>From 40 mph up, double the mph and take 20 — that's your stopping distance in feet.</P>
          <B items={["40 mph → 120 ft", "50 mph → 175 ft", "60 mph → 240 ft", "70 mph → 315 ft"]} />
        </>
      ),
    },
    {
      title: "Wet doubles it. Ice tens it.",
      body: (
        <P>
          A shiny surface is a warning. On ice you'll need up to ten times the dry distance — drive
          like the tyres aren't yours.
        </P>
      ),
    },
    {
      title: "Fog: use the two-second gap on lights",
      body: (
        <P>
          You can't see the car in front, but you can count between their lights fading and yours
          reaching them. Two seconds minimum.
        </P>
      ),
    },
    {
      title: "The bigger you are, the more space you need",
      body: (
        <P>
          Loaded up, towing, or on a slope — every kilo adds stopping distance. Feel the weight in
          your feet.
        </P>
      ),
    },
    {
      title: "Downhill = more braking, sooner",
      body: (
        <P>Gravity is already accelerating you. Brake earlier and lighter, not later and harder.</P>
      ),
    },
    {
      title: "Cover the brake in villages",
      body: (
        <P>
          Foot resting near the pedal in built-up areas buys you half a second. Half a second is a
          child's life.
        </P>
      ),
    },
    {
      title: "Give lorries their space",
      body: (
        <P>
          They can't stop like you. Leave a four-second gap behind an HGV and never sit inches from
          their bumper — they can't see you and they can't stop for you.
        </P>
      ),
    },
  ],

  // ───────────────────────── HAZARD AWARENESS ─────────────────────────
  "hazard-awareness": [
    {
      title: "Stretch your vision",
      body: (
        <>
          <P>
            Don't stare at the car in front. Keep your eyes moving using the{" "}
            <strong>15–70–15 scanning method</strong>.
          </P>
          <B
            items={[
              "15% looking well ahead for signs and developing hazards",
              "70% scanning the road ahead",
              "15% checking road markings, mirrors and escape routes",
            ]}
          />
          <P>Funnel vision, never tunnel vision.</P>
        </>
      ),
    },
    {
      title: "See it early",
      body: (
        <>
          <P>Every hazard starts as something small. Spot it early and ask:</P>
          <B items={["What is it?", "What could it do?", "What should I do?"]} />
          <P>Good drivers anticipate. They don't wait until it's an emergency.</P>
        </>
      ),
    },
    {
      title: "Plan to stop, look to go",
      body: (
        <P>
          Never drive so fast that you can't stop in the distance you can see to be clear. Ease off
          early rather than braking hard at the last second.
        </P>
      ),
    },
    {
      title: "Watch shoulders, not feet",
      body: (
        <P>
          Shoulders turn before feet move. You'll see a pedestrian decide to cross a full second
          before they actually step.
        </P>
      ),
    },
    {
      title: "Read the parked cars",
      body: (
        <P>
          Brake lights? Wheels turned? Exhaust smoke? Someone's about to move. Assume they will and
          cover your brake.
        </P>
      ),
    },
    {
      title: "Ball in the road",
      body: (
        <P>
          Where there's a ball, there's a child. Slow down and be ready — they never look before
          they run.
        </P>
      ),
    },
    {
      title: "Sun in your eyes = trouble",
      body: (
        <P>
          If you're squinting, so is the driver coming the other way. Visor down, glasses on, speed
          down.
        </P>
      ),
    },
    {
      title: "Ice cream van — cover the brake",
      body: (
        <P>Musical van + parked = children about to run out. Assume the worst and pass slowly.</P>
      ),
    },
    {
      title: "The lorry that suddenly indicates",
      body: (
        <P>
          Give big vehicles room to change lanes; they've seen something you haven't. Don't fight
          for the gap — drop back.
        </P>
      ),
    },
    {
      title: "Empty road, still scan",
      body: (
        <P>
          Quiet stretches are where complacency kills. Keep your eyes moving even when there's
          nothing to see.
        </P>
      ),
    },
    {
      title: "Wet leaves = black ice for tyres",
      body: (
        <P>
          Autumn leaves on the road are as slippery as ice, especially over drain covers. Ease off,
          don't brake mid-corner.
        </P>
      ),
    },
  ],

  // ──────────────────── VULNERABLE ROAD USERS ────────────────────
  "vulnerable-road-users": [
    {
      title: "Expect the unexpected",
      body: (
        <>
          <P>Whenever you see:</P>
          <B items={["Parked cars", "Schools", "Bus stops", "Ice cream vans", "Crossings"]} />
          <Q>Who could step out?</Q>
          <P>
            A child, cyclist or pedestrian can appear at any time. If you're already expecting them,
            you'll react sooner and more smoothly.
          </P>
        </>
      ),
    },
    {
      title: "Zebra crossings — plan to stop, look to go",
      body: (
        <>
          <P>As you approach a crossing:</P>
          <B
            items={[
              "Scan both pavements",
              "Look for anyone walking towards the crossing",
              "Check for cyclists and mobility scooters",
              "Ease off and cover the brake if unsure",
            ]}
          />
          <P>A pedestrian walking towards the crossing is already a developing hazard.</P>
        </>
      ),
    },
    {
      title: "Cyclists — treat every cyclist like a car",
      body: (
        <>
          <P>Leave plenty of space. Cyclists may move out suddenly to avoid:</P>
          <B items={["Potholes", "Drain covers", "Parked car doors", "Strong winds"]} />
          <P>Give them room to ride safely.</P>
        </>
      ),
    },
    {
      title: "Horses — slow, wide and quiet",
      body: (
        <>
          <B
            items={[
              "Reduce your speed to around 10 mph",
              "Leave at least 2 metres",
              "Avoid revving the engine or using the horn",
            ]}
          />
          <P>Patience is always safer than rushing.</P>
        </>
      ),
    },
    {
      title: "The Dutch reach",
      body: (
        <P>
          Open your door with your <em>left</em> hand. It turns your body and forces you to look
          over your shoulder — that's how you spot the cyclist you'd otherwise floor.
        </P>
      ),
    },
    {
      title: "School run = 20 mph in your head",
      body: (
        <P>
          The limit says 30 but the children don't. Drop your speed near schools whether the
          flashing lights are on or not.
        </P>
      ),
    },
    {
      title: "Older pedestrians — give them time",
      body: (
        <P>Don't creep forward while they cross. Stop fully, make eye contact, let them finish.</P>
      ),
    },
    {
      title: "Wheelchairs and prams — a full car length",
      body: (
        <P>
          Give them at least the space you'd give a cyclist. A wobble at pace can knock them over.
        </P>
      ),
    },
    {
      title: "Motorbikes hide behind mirrors",
      body: (
        <P>Look twice at junctions. A bike can vanish inside your A-pillar until it's too late.</P>
      ),
    },
    {
      title: "Kids on scooters",
      body: (
        <P>Scooters travel faster than kids can react. Extra space, extra caution, extra slow.</P>
      ),
    },
    {
      title: "Dog on a lead",
      body: (
        <P>
          The lead can stretch across the pavement. Slow down — dogs and children both change
          direction without warning.
        </P>
      ),
    },
  ],

  // ─────────────────────── OTHER VEHICLES ───────────────────────
  "other-vehicles": [
    {
      title: "Think for bigger vehicles",
      body: (
        <P>
          Lorries, buses and trams need extra room. Stay out of blind spots, leave space and look
          for their mistakes before they make them.
        </P>
      ),
    },
    {
      title: "If you can't see their mirrors…",
      body: (
        <P>
          …they can't see you. Get past cleanly or drop right back — never linger alongside an HGV,
          especially on roundabouts.
        </P>
      ),
    },
    {
      title: "Trams don't steer",
      body: (
        <P>
          They can't swerve for you. Keep off the rails and give them absolute priority — you're the
          one with the steering wheel.
        </P>
      ),
    },
    {
      title: "Buses swing wide",
      body: (
        <P>
          A bus turning left often swings right first. Give it room and don't try to fill the gap.
        </P>
      ),
    },
    {
      title: "Motorbikes weave",
      body: (
        <P>
          Filtering is legal. Check your mirrors before changing lane or opening a door in queuing
          traffic.
        </P>
      ),
    },
    {
      title: "Farm traffic — patient not pushy",
      body: (
        <P>
          Tractors, trailers, mud. Follow at a safe distance and only overtake where you can see a
          long, clear straight.
        </P>
      ),
    },
    {
      title: "Emergency vehicles at junctions",
      body: (
        <P>
          Don't panic-brake in the middle of a junction. Clear it, then find a safe place to pull
          left.
        </P>
      ),
    },
    {
      title: "Learners deserve grace",
      body: (
        <P>They're doing what you did last year. Ease off, no horn, give them space to think.</P>
      ),
    },
  ],

  // ─────────────────────── VEHICLE HANDLING ───────────────────────
  "vehicle-handling": [
    {
      title: "Smooth is safe",
      body: (
        <P>
          Brake smoothly, steer smoothly, accelerate smoothly. Let the car flow instead of fighting
          it.
        </P>
      ),
    },
    {
      title: "Gears to go, brakes to slow",
      body: (
        <P>
          Brake first, change gear once. Coasting to a junction in neutral gives you no drive and no
          control if you need it.
        </P>
      ),
    },
    {
      title: "Look through the bend",
      body: (
        <P>
          Your hands follow your eyes. Look at the exit, not the kerb, and the car will settle into
          the line.
        </P>
      ),
    },
    {
      title: "Slow in, fast out",
      body: (
        <P>
          Do your braking before the corner, not during it. Steady throttle through, then power out.
        </P>
      ),
    },
    {
      title: "Skid — steer into it, off everything",
      body: (
        <P>
          Rear sliding right? Steer gently right. Feet off brake and throttle. Panic makes it worse;
          calm resets the tyres.
        </P>
      ),
    },
    {
      title: "Aquaplaning — don't fight it",
      body: (
        <P>
          If the steering goes light, ease off the throttle, keep the wheel straight, ride it out.
          Braking makes you spin.
        </P>
      ),
    },
    {
      title: "Snow — pull away in second",
      body: <P>Less torque, less wheelspin. Gentle everything: throttle, brake, steering.</P>,
    },
    {
      title: "Bright day, dark tunnel",
      body: (
        <P>
          Sunglasses off before you enter, dipped beam on. Your eyes need seconds to adjust — plan
          for it.
        </P>
      ),
    },
    {
      title: "Handbrake turns are for films",
      body: (
        <P>On the road, gentle inputs win. If a manoeuvre needs a stunt, you're doing it wrong.</P>
      ),
    },
    {
      title: "Downhill — engine brake",
      body: (
        <P>
          Drop a gear on long descents so the engine slows you. Riding the brake makes it fade when
          you need it most.
        </P>
      ),
    },
  ],

  // ──────────────────────── MOTORWAY RULES ────────────────────────
  "motorway-rules": [
    {
      title: "Lane 1 is your driving lane",
      body: (
        <P>
          Use it whenever it's clear. Overtake in 2 or 3, then move back left. Middle-lane hogging
          is a £100 fine and 3 points.
        </P>
      ),
    },
    {
      title: "Match speed on the slip",
      body: (
        <P>
          Build to motorway speed on the slip road so you can slot in without forcing anyone to
          brake. Merge like a zip, not a battering ram.
        </P>
      ),
    },
    {
      title: "Two-second gap doubles at 70",
      body: (
        <P>
          Same rule, but the distance is much bigger than it feels. Pick a bridge or sign and count
          it out.
        </P>
      ),
    },
    {
      title: "Read the gantry",
      body: (
        <P>
          Red X = lane closed, do not enter. Variable limits are enforced by camera and are there
          for the queue ahead you can't see yet.
        </P>
      ),
    },
    {
      title: "Hard shoulder is not lane 1",
      body: (
        <P>
          Only in a real emergency, or when a gantry opens it. Otherwise it's for breakdowns and
          emergency services.
        </P>
      ),
    },
    {
      title: "Broken down? Left, out, back, call",
      body: (
        <P>
          Left onto the verge, out the passenger side, back behind the barrier, call for help. Never
          stand between the car and traffic.
        </P>
      ),
    },
    {
      title: "Fog on motorways — fog lights on, then off",
      body: (
        <P>
          Rear fog lights when visibility drops below 100 m. Turn them off the moment it clears —
          they dazzle drivers behind.
        </P>
      ),
    },
    {
      title: "Overtaking — MSM, then commit",
      body: (
        <P>
          Mirror, signal, mirror, move. Once you're out, get on with it — don't hover alongside.
        </P>
      ),
    },
    {
      title: "Leaving the motorway",
      body: (
        <P>
          Signal a full 300 yards before the exit (the countdown markers). Slow down on the slip,
          not on the carriageway.
        </P>
      ),
    },
    {
      title: "Tired? Next services, no debate",
      body: (
        <P>
          Micro-sleeps at 70 mph cover the length of a football pitch. If you're yawning, you're
          already too tired — pull off at the next stop.
        </P>
      ),
    },
  ],

  // ─────────────────────── RULES OF THE ROAD ───────────────────────
  "rules-of-the-road": [
    {
      title: "Plan to stop, look to go",
      body: (
        <P>
          Never drive right up to a hazard. Ease off early, stretch your vision and always be
          looking for a safe opportunity to keep the traffic moving.
        </P>
      ),
    },
    {
      title: "Junctions — look where you're turning",
      body: (
        <>
          <P>Before turning:</P>
          <B
            items={[
              "Complete your MSPSL routine",
              "Scan the pavement as well as the road",
              "Expect pedestrians crossing the road you're entering",
            ]}
          />
          <P>Look where you're going — not just where your car is going.</P>
        </>
      ),
    },
    {
      title: "Give way = keep moving if it's clear",
      body: (
        <P>
          You don't have to stop — you have to be able to. If the road is empty, go. Hesitation is a
          fault too.
        </P>
      ),
    },
    {
      title: "Roundabouts — feed off the traffic",
      body: (
        <P>
          Match the flow. Long stops at empty roundabouts fail more tests than anything else on the
          sheet.
        </P>
      ),
    },
    {
      title: "Priority is given, not taken",
      body: (
        <P>
          If you're not sure who has right of way, offer it. A wave and a lost second beats a bump
          and a claim.
        </P>
      ),
    },
    {
      title: "Box junctions — only enter if you can exit",
      body: (
        <P>
          Yellow criss-cross means you must not stop in the box. Wait behind the line until the exit
          is clear.
        </P>
      ),
    },
    {
      title: "One-way streets — either lane, watch signs",
      body: <P>Position for where you're turning next. Right lane for right, left for left.</P>,
    },
    {
      title: "STOP means stop",
      body: (
        <P>
          Wheels stationary, behind the line, every time. Even if the road is clearly empty. A
          rolling stop is a fail and a fine.
        </P>
      ),
    },
    {
      title: "Speed limits are limits, not targets",
      body: <P>30 in a 30 might still be too fast. Read the road, not the sign.</P>,
    },
    {
      title: "White painted triangle = give way",
      body: <P>You'll see it before the sign. Start easing off the moment it appears.</P>,
    },
  ],

  // ─────────────────────── ROAD CONDITIONS ───────────────────────
  "road-conditions": [
    {
      title: "Use your 15–70–15 vision",
      body: (
        <P>
          15% up for signs, 70% ahead for the road, 15% down for markings. The more you scan, the
          more you see.
        </P>
      ),
    },
    {
      title: "Shape tells you the message",
      body: (
        <P>
          Circles order, triangles warn, rectangles inform. You can read the type of message through
          spray before you can read the words.
        </P>
      ),
    },
    {
      title: "Colour tells you the road",
      body: (
        <P>
          Blue = motorway, Green = primary A-road, White = local. You know the type of road before
          you can read the destination.
        </P>
      ),
    },
    {
      title: "Road studs — colour + place",
      body: (
        <>
          <B
            items={[
              "Red = left edge",
              "Amber = right edge (central reservation)",
              "White = between lanes",
              "Green = slip road joining",
            ]}
          />
          <P>Green + yellow = temporary works.</P>
        </>
      ),
    },
    {
      title: "Wet road, matte surface",
      body: (
        <P>
          If the road looks dull instead of shiny, you might be on ice, not water. Ease off — don't
          test it.
        </P>
      ),
    },
    {
      title: "Standing water = aquaplane risk",
      body: (
        <P>
          Puddles wider than your tyre are enough. Ease off before you hit them, keep the wheel
          straight.
        </P>
      ),
    },
    {
      title: "Night — dipped, not full, in traffic",
      body: (
        <P>
          Full beam blinds oncoming drivers and drivers in front. Drop to dipped as soon as you see
          anyone.
        </P>
      ),
    },
    {
      title: "Country lanes at dusk",
      body: (
        <P>
          Deer, cyclists in dark clothes, potholes. Slow enough that the puddle of your headlights
          is your stopping distance.
        </P>
      ),
    },
  ],

  // ─────────────────────── ESSENTIAL DOCUMENTS ───────────────────────
  "essential-documents": [
    {
      title: "Stay organised",
      body: (
        <P>
          Keep your licence, insurance and MOT up to date. Five minutes today saves hours of stress
          and money later.
        </P>
      ),
    },
    {
      title: "Photos on your phone",
      body: (
        <P>
          Snap your licence, insurance certificate and MOT. If you're pulled over, showing willing
          on the roadside is worth a lot.
        </P>
      ),
    },
    {
      title: "MOT — one month early",
      body: (
        <P>
          You can renew up to a month before the expiry and keep the same date. Book it in — don't
          drive on a lapsed MOT.
        </P>
      ),
    },
    {
      title: "Insurance — check every renewal",
      body: <P>Auto-renewals get lazy. A ten-minute compare could save you £200 a year.</P>,
    },
    {
      title: "Change of address",
      body: (
        <P>Update your licence and V5 within 14 days of moving. Fines are £1,000 if you don't.</P>
      ),
    },
    {
      title: "Producer — seven days",
      body: (
        <P>
          If police ask, you have seven days to bring your documents to a station. Don't argue at
          the roadside.
        </P>
      ),
    },
  ],

  // ─────────────────────── INCIDENTS ───────────────────────
  incidents: [
    {
      title: "Stay calm. Protect first.",
      body: (
        <P>
          Don't panic. Protect yourself first, warn traffic, then help others if it's safe. A calm
          driver makes better decisions than a rushed one.
        </P>
      ),
    },
    {
      title: "DR ABC at a scene",
      body: (
        <>
          <B
            items={[
              "D — Danger (check the scene is safe)",
              "R — Response (is the casualty conscious?)",
              "A — Airway",
              "B — Breathing",
              "C — Circulation",
            ]}
          />
          <P>Never approach until the scene is safe. A second crash turns a bump into a tragedy.</P>
        </>
      ),
    },
    {
      title: "Hazards on, engine off",
      body: (
        <P>
          The moment you stop, flick the hazards on and kill the engine. Two seconds that keep
          everyone else out of the wreckage.
        </P>
      ),
    },
    {
      title: "Warning triangle — 45 metres back",
      body: (
        <P>
          Not on the motorway (unsafe). Anywhere else, put it well behind the car so drivers have
          time to react.
        </P>
      ),
    },
    {
      title: "Numbers you must swap",
      body: (
        <P>
          Name, address, insurance details, registration. No admissions of blame — let the insurers
          work it out.
        </P>
      ),
    },
    {
      title: "Photograph everything",
      body: (
        <P>
          All angles, both cars, the road, the skid marks, the sky. Two minutes of photos beats two
          months of arguing.
        </P>
      ),
    },
  ],

  // ─────────────────────── VEHICLE LOADING ───────────────────────
  "vehicle-loading": [
    {
      title: "Secure it before you move",
      body: (
        <P>
          Ask yourself: “If I had to brake hard now, where would this end up?” Heavy items low and
          central, secured, never blocking the view.
        </P>
      ),
    },
    {
      title: "Roof-box — check every stop",
      body: (
        <P>Straps loosen with vibration. A five-second tug at every services stop is worth it.</P>
      ),
    },
    {
      title: "Dog in the boot, not the seat",
      body: (
        <P>
          Loose pets become missiles in a stop. A harness or dog guard is a legal requirement, not a
          nice-to-have.
        </P>
      ),
    },
    {
      title: "Trailer — nose weight matters",
      body: (
        <P>
          Too light and it snakes. Too heavy and the car unsettles. Check the towbar limit and load
          accordingly.
        </P>
      ),
    },
    {
      title: "Passengers — belts before you move",
      body: <P>You're legally responsible for under-14s. No belt, no move.</P>,
    },
    {
      title: "Child seats — read the manual",
      body: (
        <P>Wrong fit is worse than no seat. Take the time to install it right the first time.</P>
      ),
    },
  ],
};
