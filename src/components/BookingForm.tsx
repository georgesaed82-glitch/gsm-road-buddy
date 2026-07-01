import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { trackContactClick } from "@/lib/trackContactClick";

export function BookingForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    postcode: "",
    transmission: "manual",
    availability: "",
    message: "",
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
    const name = form.name.trim();
    if (name.length < 2 || name.length > 100) next.name = "Enter your full name (2-100 characters)";
    const email = form.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) next.email = "Enter a valid email address";
    const phone = form.phone.trim();
    if (!/^[\d\s+()\-]{7,20}$/.test(phone)) next.phone = "Enter a valid phone number";
    const postcode = form.postcode.trim();
    if (!postcode || postcode.length > 20) next.postcode = "Enter your postcode (max 20 characters)";
    if (form.availability.trim().length > 200) next.availability = "Keep under 200 characters";
    if (form.message.trim().length > 500) next.message = "Keep under 500 characters";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const text = [
      "Hi GSM Driving School, I'd like to book a driving lesson.",
      "",
      `Name: ${form.name.trim()}`,
      `Email: ${form.email.trim().toLowerCase()}`,
      `Phone: ${form.phone.trim()}`,
      `Postcode: ${form.postcode.trim().toUpperCase()}`,
      `Transmission: ${form.transmission === "manual" ? "Manual" : "Automatic"}`,
      `Preferred times: ${form.availability.trim() || "Anytime"}`,
      ...(form.message.trim() ? [`Message: ${form.message.trim()}`] : []),
    ].join("\n");
    trackContactClick("whatsapp", "Book a driving lesson form");
    window.open(
      `https://wa.me/447961585231?text=${encodeURIComponent(text)}`,
      "_blank",
    );
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="border border-border bg-background p-8 shadow-xl sm:p-12">
        <div className="mx-auto flex h-14 w-14 items-center justify-center bg-primary text-primary-foreground">
          <WhatsAppIcon className="h-7 w-7" />
        </div>
        <h2 className="mt-6 text-center font-display text-3xl font-medium text-foreground">Your message is ready</h2>
        <p className="mx-auto mt-3 max-w-md text-center text-muted-foreground">
          A WhatsApp chat has opened with your details. Send the message and George will confirm your availability.
        </p>
        <div className="mt-8 text-center">
          <Button asChild size="lg" className="h-12 rounded-none bg-primary px-6 text-primary-foreground hover:bg-primary/90">
            <a href="https://wa.me/447961585231" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
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
            Get on the road <span className="italic text-accent">this week.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg lg:mx-0">
            Tell us where you are, what you prefer, and when you are free. We will reply with availability and the best package for you.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-[minmax(0,1fr)] gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Your name" className="mt-1.5 rounded-none border-border bg-transparent" />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@email.com" className="mt-1.5 rounded-none border-border bg-transparent" />
            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="07..." className="mt-1.5 rounded-none border-border bg-transparent" />
            {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
          </div>
          <div>
            <Label htmlFor="postcode">Postcode</Label>
            <Input id="postcode" value={form.postcode} onChange={(e) => update("postcode", e.target.value)} placeholder="W11 1DS" className="mt-1.5 rounded-none border-border bg-transparent" />
            {errors.postcode && <p className="mt-1 text-xs text-destructive">{errors.postcode}</p>}
          </div>
          <div>
            <Label>Transmission</Label>
            <div className="mt-1.5 flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="transmission" value="manual" checked={form.transmission === "manual"} onChange={(e) => update("transmission", e.target.value)} className="h-4 w-4 accent-primary" />
                Manual
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="transmission" value="automatic" checked={form.transmission === "automatic"} onChange={(e) => update("transmission", e.target.value)} className="h-4 w-4 accent-primary" />
                Automatic
              </label>
            </div>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="availability">Preferred days / times</Label>
            <Input id="availability" value={form.availability} onChange={(e) => update("availability", e.target.value)} placeholder="e.g. Weekday evenings or Saturday mornings" className="mt-1.5 rounded-none border-border bg-transparent" />
            {errors.availability && <p className="mt-1 text-xs text-destructive">{errors.availability}</p>}
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="message">Anything else we should know?</Label>
            <Textarea id="message" value={form.message} onChange={(e) => update("message", e.target.value)} placeholder="Previous experience, test date, or special requirements..." className="mt-1.5 min-h-[100px] rounded-none border-border bg-transparent" />
            {errors.message && <p className="mt-1 text-xs text-destructive">{errors.message}</p>}
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" size="lg" className="h-14 w-full rounded-none bg-primary px-8 text-primary-foreground hover:bg-primary/90">
              <WhatsAppIcon className="mr-2 h-5 w-5" />
              Request availability on WhatsApp
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              We will reply with available slots and pricing.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
