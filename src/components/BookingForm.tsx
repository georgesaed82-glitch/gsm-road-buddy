import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { trackContactClick } from "@/lib/trackContactClick";
import { trackContactLinkTap } from "@/lib/contactLinkTracking";

const TRANSMISSIONS = { automatic: "Automatic", manual: "Manual", unsure: "Not sure yet" } as const;
const EXPERIENCE = {
  none: "Complete beginner",
  some: "Some lessons or practice",
  test_ready: "Nearly test-ready / refresher",
  after_test: "Had an unsuccessful test",
} as const;
const HEARD_FROM = ["Google", "ChatGPT", "Social media", "A recommendation", "Other"] as const;
import { useSiteSettings } from "@/hooks/useSiteSettings";

export function BookingForm() {
  const { business } = useSiteSettings();
  const waNumber = business.phone_intl;
  const [form, setForm] = useState({
    area: "",
    transmission: "automatic",
    experience: "none",
    availability: "",
    heardFrom: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = () => {
    const next: Record<string, string> = {};
    const area = form.area.trim();
    if (!area || area.length > 60) next.area = "Tell us your area (e.g. Notting Hill or W11)";
    if (form.availability.trim().length > 200) next.availability = "Keep under 200 characters";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const text = [
      "Hi George, I'd like to ask about driving lessons.",
      "",
      `Area: ${form.area.trim()}`,
      `Transmission: ${TRANSMISSIONS[form.transmission as keyof typeof TRANSMISSIONS]}`,
      `Experience: ${EXPERIENCE[form.experience as keyof typeof EXPERIENCE]}`,
      `Preferred times: ${form.availability.trim() || "Flexible"}`,
      ...(form.heardFrom ? [`Heard about GSM via: ${form.heardFrom}`] : []),
    ].join("\n");
    trackContactClick("whatsapp", "Enquiry form");
    trackContactLinkTap("whatsapp", "enquiry_form");
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`, "_blank");
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="border border-border bg-background p-8 shadow-xl sm:p-12">
        <div className="mx-auto flex h-14 w-14 items-center justify-center bg-primary text-primary-foreground">
          <WhatsAppIcon className="h-7 w-7" />
        </div>
        <h2 className="mt-6 text-center font-display text-3xl font-medium text-foreground">
          Your message is ready
        </h2>
        <p className="mx-auto mt-3 max-w-md text-center text-muted-foreground">
          WhatsApp has opened with your enquiry. Please review it and press send yourself — this is
          an enquiry, not a confirmed booking. George will reply with availability.
        </p>
        <div className="mt-8 text-center">
          <Button
            asChild
            size="lg"
            className="h-12 rounded-none bg-primary px-6 text-primary-foreground hover:bg-primary/90"
          >
            <a
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Open WhatsApp again
            </a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-border bg-background p-5 shadow-xl sm:p-12 lg:p-16">
      <div className="grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className="min-w-0 text-center lg:text-left">
          <div className="flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground lg:justify-start">
            <span className="h-px w-8 bg-accent" />
            Book a driving lesson
          </div>
          <h2 className="mt-4 text-balance font-display text-[1.6rem] font-medium leading-[1.1] text-foreground sm:text-4xl lg:text-5xl">
            Check lesson <span className="italic text-accent">availability.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg lg:mx-0">
            Tell us where you are, what you prefer, and when you are free. We will reply with
            availability and the best package for you.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-[minmax(0,1fr)] gap-5 sm:grid-cols-2"
        >
          <div className="sm:col-span-2">
            <Label htmlFor="area">Your area</Label>
            <Input
              id="area"
              value={form.area}
              onChange={(e) => update("area", e.target.value)}
              placeholder="e.g. Notting Hill, Kensington or W11"
              className="mt-1.5 h-11 rounded-none border-border bg-transparent"
            />
            {errors.area && <p className="mt-1 text-xs text-destructive">{errors.area}</p>}
          </div>
          <div>
            <Label htmlFor="transmission">Transmission</Label>
            <select id="transmission" value={form.transmission} onChange={(e) => update("transmission", e.target.value)} className="mt-1.5 h-11 w-full rounded-none border border-border bg-transparent px-3 text-sm text-foreground">
              {Object.entries(TRANSMISSIONS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <Label htmlFor="experience">Experience</Label>
            <select id="experience" value={form.experience} onChange={(e) => update("experience", e.target.value)} className="mt-1.5 h-11 w-full rounded-none border border-border bg-transparent px-3 text-sm text-foreground">
              {Object.entries(EXPERIENCE).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="availability">Preferred lesson times</Label>
            <Input
              id="availability"
              value={form.availability}
              onChange={(e) => update("availability", e.target.value)}
              placeholder="e.g. Weekday mornings"
              className="mt-1.5 h-11 rounded-none border-border bg-transparent"
            />
            {errors.availability && <p className="mt-1 text-xs text-destructive">{errors.availability}</p>}
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="heardFrom">How did you hear about us? (optional)</Label>
            <select id="heardFrom" value={form.heardFrom} onChange={(e) => update("heardFrom", e.target.value)} className="mt-1.5 h-11 w-full rounded-none border border-border bg-transparent px-3 text-sm text-foreground">
              <option value="">Prefer not to say</option>
              {HEARD_FROM.map((h) => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <Button
              type="submit"
              size="lg"
              className="h-14 w-full rounded-none bg-primary px-8 text-primary-foreground hover:bg-primary/90"
            >
              <WhatsAppIcon className="mr-2 h-5 w-5" />
              Prepare WhatsApp message
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              You review and send the message yourself in WhatsApp.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
