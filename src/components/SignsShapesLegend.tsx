import { Triangle, Circle, Square, Octagon } from "lucide-react";

// Highway Code sign shapes & colours primer. Sources: The Highway Code
// "Signs" section and DVSA's *Know Your Traffic Signs*.
export function SignsShapesLegend() {
  return (
    <section
      aria-labelledby="signs-legend-heading"
      className="mb-8 rounded-sm border border-border bg-card p-5 sm:p-6"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="signs-legend-heading" className="font-display text-xl sm:text-2xl">
          How UK traffic signs work
        </h2>
        <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Highway Code
        </span>
      </div>
      <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
        The shape and colour of a traffic sign tells you what kind of message it
        is giving — even before you read the words or symbol. Learn these first
        and every sign in the Highway Code becomes easier to understand.
      </p>

      {/* Shapes */}
      <div className="mt-5">
        <p className="font-display text-sm">Sign shapes — what they mean</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ShapeCard
            icon={<Circle className="h-8 w-8" strokeWidth={2.5} />}
            title="Circles give orders"
            body="A red ring means you must NOT do something (e.g. no entry, no U-turn). A blue circle gives a positive instruction you MUST follow (e.g. turn left, mini-roundabout, minimum speed)."
          />
          <ShapeCard
            icon={<Triangle className="h-8 w-8" strokeWidth={2.5} />}
            title="Triangles warn"
            body="A red triangle pointing upwards is a warning — telling you about a hazard ahead such as a bend, junction, school or roundabout."
          />
          <ShapeCard
            icon={<Square className="h-8 w-8" strokeWidth={2.5} />}
            title="Rectangles inform"
            body="Rectangles give information (blue on motorways, green on primary routes, white on local roads, brown for tourist information)."
          />
          <ShapeCard
            icon={<Octagon className="h-8 w-8" strokeWidth={2.5} />}
            title="Special shapes"
            body="The octagon is used only for STOP — you must stop at the line. The inverted triangle (point down) means GIVE WAY to traffic on the major road."
          />
        </div>
      </div>

      {/* Colours */}
      <div className="mt-6">
        <p className="font-display text-sm">Sign background colours</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <ColourRow swatch="#0033a0" fg="#fff" label="Blue rectangle">
            Direction signs on <strong>motorways</strong>. Also used on smaller
            blue circles to give a positive order (mandatory turn, keep left,
            mini-roundabout).
          </ColourRow>
          <ColourRow swatch="#0e7c3a" fg="#fff" label="Green rectangle">
            Direction signs on <strong>primary routes</strong> (major A-roads).
            Route numbers for motorways appear inside a blue patch.
          </ColourRow>
          <ColourRow swatch="#ffffff" fg="#000" label="White rectangle">
            Direction signs on <strong>local, non-primary roads</strong>. Route
            numbers keep the colour of the road they lead to.
          </ColourRow>
          <ColourRow swatch="#7a4a1e" fg="#fff" label="Brown rectangle">
            <strong>Tourist information</strong> and attractions — museums,
            castles, gardens, viewpoints and picnic areas.
          </ColourRow>
          <ColourRow swatch="#ffcc00" fg="#000" label="Yellow rectangle">
            <strong>Diversion</strong> routes and temporary traffic-management
            information (roadworks, incidents).
          </ColourRow>
          <ColourRow swatch="#e60012" fg="#fff" label="Red border / red ring">
            <strong>Warning</strong> (red-bordered triangle) and{" "}
            <strong>prohibition</strong> (red ring — you must not do this).
          </ColourRow>
        </div>
      </div>

      {/* Quick reference */}
      <div className="mt-6 rounded-sm border border-primary/40 bg-primary/5 p-4">
        <p className="font-display text-sm text-primary">Quick rule to remember</p>
        <ul className="mt-2 grid gap-1 text-sm text-foreground sm:grid-cols-2">
          <li>• <strong>Triangle</strong> = warning</li>
          <li>• <strong>Circle with red ring</strong> = do NOT</li>
          <li>• <strong>Blue circle</strong> = you MUST</li>
          <li>• <strong>Rectangle</strong> = information / direction</li>
          <li>• <strong>Octagon</strong> = STOP</li>
          <li>• <strong>Downward triangle</strong> = GIVE WAY</li>
          <li>• <strong>Blue</strong> background = motorway</li>
          <li>• <strong>Green</strong> background = primary route (A-road)</li>
          <li>• <strong>White</strong> background = local road</li>
          <li>• <strong>Brown</strong> background = tourist attraction</li>
        </ul>
      </div>
    </section>
  );
}

function ShapeCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex gap-3 rounded-sm border border-border bg-background p-3">
      <div className="text-primary" aria-hidden="true">
        {icon}
      </div>
      <div>
        <p className="font-display text-sm">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}

function ColourRow({
  swatch,
  fg,
  label,
  children,
}: {
  swatch: string;
  fg: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-sm border border-border bg-background p-3">
      <div
        className="mt-0.5 flex h-10 w-14 shrink-0 items-center justify-center rounded-sm border border-border text-[10px] font-bold uppercase"
        style={{ background: swatch, color: fg }}
        aria-hidden="true"
      >
        {label.split(" ")[0]}
      </div>
      <p className="text-xs text-foreground">
        <span className="font-semibold">{label}.</span> {children}
      </p>
    </div>
  );
}