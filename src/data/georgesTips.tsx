import type { ReactNode } from "react";

export type GeorgesTipEntry = {
  title: string;
  body: ReactNode;
};

const Bullets = ({ items }: { items: string[] }) => (
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

export const georgesTips: Record<string, GeorgesTipEntry[]> = {
  alertness: [
    {
      title: "Mirrors before movement",
      body: (
        <>
          <p>Build the habit of checking your mirrors whenever you:</p>
          <Bullets
            items={[
              "Lift off the accelerator",
              "Brake",
              "Accelerate",
              "Change direction",
              "Change position",
            ]}
          />
          <p className="mt-2">
            If you can't remember your last mirror check, it's probably overdue.
          </p>
        </>
      ),
    },
  ],
  attitude: [
    {
      title: "Give yourself time — the two-second rule",
      body: (
        <>
          <p>As the vehicle ahead passes a lamp post, say:</p>
          <Q>Only a fool breaks the two-second rule.</Q>
          <p className="mt-2">
            If you reach the marker before finishing the sentence, you're too
            close. Double the gap in wet weather and increase it even more in
            snow or ice.
          </p>
        </>
      ),
    },
  ],
  "safety-and-vehicle": [
    {
      title: "POWDERY checks",
      body: (
        <>
          <p>Before long journeys, remember:</p>
          <Bullets
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
          <p className="mt-2">
            Five minutes of checks can prevent a breakdown or a failed driving
            test.
          </p>
        </>
      ),
    },
  ],
  "safety-margins": [
    {
      title: "Stopping distances feel bigger than they read",
      body: (
        <p>
          At 60 mph you'll travel the length of a football pitch before you stop
          in the dry — and nearly two in the wet. Look further ahead than you
          think you need to.
        </p>
      ),
    },
  ],
  "hazard-awareness": [
    {
      title: "Stretch your vision",
      body: (
        <>
          <p>
            Don't stare at the vehicle in front. Keep your eyes moving using the{" "}
            <strong>15–70–15 scanning method</strong>.
          </p>
          <Bullets
            items={[
              "15% looking well ahead for road signs and developing hazards",
              "70% scanning the road ahead",
              "15% checking road markings, mirrors and escape routes",
            ]}
          />
          <p className="mt-2">
            Always use funnel vision, not tunnel vision. The further ahead you
            look, the more time you have to plan, react and stay safe.
          </p>
        </>
      ),
    },
    {
      title: "See it early",
      body: (
        <>
          <p>Every hazard starts as something small. Spot it early and ask:</p>
          <Bullets
            items={["What is it?", "What could it do?", "What should I do?"]}
          />
          <p className="mt-2">
            Good drivers anticipate. They don't wait until it's an emergency.
          </p>
        </>
      ),
    },
    {
      title: "Plan to stop, look to go",
      body: (
        <p>
          Never drive so fast that you can't stop safely in the distance you can
          see to be clear. Good drivers always have a Plan B — if something
          doesn't look right, ease off early rather than braking hard at the
          last second.
        </p>
      ),
    },
  ],
  "vulnerable-road-users": [
    {
      title: "Expect the unexpected",
      body: (
        <>
          <p>Whenever you see:</p>
          <Bullets
            items={[
              "Parked cars",
              "Schools",
              "Bus stops",
              "Ice cream vans",
              "Crossings",
            ]}
          />
          <Q>Who could step out?</Q>
          <p className="mt-2">
            A child, cyclist or pedestrian can appear at any time. If you're
            already expecting them, you'll react sooner and more smoothly.
          </p>
        </>
      ),
    },
    {
      title: "Zebra crossings — plan to stop, look to go",
      body: (
        <>
          <p>As you approach a crossing:</p>
          <Bullets
            items={[
              "Scan both pavements",
              "Look for anyone walking towards the crossing",
              "Check for cyclists and mobility scooters",
              "Ease off the accelerator and cover the brake if unsure",
            ]}
          />
          <p className="mt-2">
            A pedestrian walking towards the crossing is already becoming a
            developing hazard.
          </p>
        </>
      ),
    },
    {
      title: "Cyclists — treat every cyclist like a car",
      body: (
        <>
          <p>Leave plenty of space. Cyclists may move out suddenly to avoid:</p>
          <Bullets
            items={[
              "Potholes",
              "Drain covers",
              "Parked car doors",
              "Strong winds",
            ]}
          />
          <p className="mt-2">Give them room to ride safely.</p>
        </>
      ),
    },
    {
      title: "Horses — slow, wide and quiet",
      body: (
        <>
          <Bullets
            items={[
              "Reduce your speed to around 10 mph",
              "Leave at least 2 metres",
              "Avoid revving the engine or using the horn",
            ]}
          />
          <p className="mt-2">Patience is always safer than rushing.</p>
        </>
      ),
    },
  ],
  "other-vehicles": [
    {
      title: "Think for bigger vehicles",
      body: (
        <p>
          Lorries, buses and trams all need extra room. Stay out of blind spots,
          leave space and always look for other people's mistakes before they
          happen.
        </p>
      ),
    },
  ],
  "vehicle-handling": [
    {
      title: "Smooth driving is safe driving",
      body: (
        <p>
          Brake smoothly, steer smoothly and accelerate smoothly. Stretch your
          vision through bends and let the car flow instead of fighting it.
        </p>
      ),
    },
  ],
  "motorway-rules": [
    {
      title: "Lane 1 is your driving lane",
      body: (
        <p>
          Use Lane 1 whenever it's clear. Overtake when needed, then move back
          left. Good motorway drivers keep traffic flowing safely and don't sit
          in the middle lane.
        </p>
      ),
    },
  ],
  "rules-of-the-road": [
    {
      title: "Plan to stop, look to go",
      body: (
        <p>
          Never drive right up to a hazard. Ease off early, stretch your vision
          and always be looking for a safe opportunity to keep the traffic
          moving.
        </p>
      ),
    },
    {
      title: "Junctions — look where you're turning",
      body: (
        <>
          <p>Before turning:</p>
          <Bullets
            items={[
              "Complete your MSPSL routine",
              "Scan the pavement as well as the road",
              "Expect pedestrians crossing the road you're entering",
            ]}
          />
          <p className="mt-2">
            Remember: look where you're <em>going</em> — not just where your car
            is going.
          </p>
        </>
      ),
    },
  ],
  "road-conditions": [
    {
      title: "Use your 15–70–15 vision",
      body: (
        <p>
          Stretch your vision. Look 15% up for signs, 70% ahead where you're
          driving, and 15% down for road markings. The more you scan, the more
          you see.
        </p>
      ),
    },
  ],
  "essential-documents": [
    {
      title: "Stay organised",
      body: (
        <p>
          Keep your licence, insurance and MOT up to date. Five minutes checking
          today can save hours of stress and expensive problems later.
        </p>
      ),
    },
  ],
  incidents: [
    {
      title: "Stay calm. Protect first.",
      body: (
        <p>
          Don't panic. Protect yourself first, warn other traffic, then help
          others if it's safe. A calm driver makes better decisions than a
          rushed one.
        </p>
      ),
    },
  ],
  "vehicle-loading": [
    {
      title: "Secure it before you move",
      body: (
        <p>
          Before you drive, ask yourself: “If I had to brake hard now, where
          would this end up?” Keep heavy items low and central, secure
          everything properly, and never let luggage block your view.
        </p>
      ),
    },
  ],
};