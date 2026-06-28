import { Link } from "@tanstack/react-router";
import { MapPin, Mail, Clock, Instagram } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { trackContactClick } from "@/lib/trackContactClick";

const hours = [
  ["Mon", "7:00 – 20:00"],
  ["Tue", "7:00 – 21:00"],
  ["Wed", "7:00 – 21:00"],
  ["Thu", "7:00 – 20:30"],
  ["Fri", "7:00 – 20:00"],
  ["Sat", "7:00 – 18:00"],
  ["Sun", "Closed"],
];

const groups = [
  {
    title: "Learn",
    links: [
      { to: "/services", label: "Practical lessons" },
      { to: "/theory", label: "Theory portal" },
      { to: "/pricing", label: "Pricing & packages" },
      { to: "/instructors", label: "Reviews" },
    ],
  },
  {
    title: "School",
    links: [
      { to: "/about", label: "About GSM" },
      { to: "/contact", label: "Contact" },
      { to: "/auth", label: "Sign in" },
      { to: "/dashboard", label: "Learner portal" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr_1fr]">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-primary-foreground/30 font-display text-base font-semibold">
                GSM
              </div>
              <div className="leading-tight">
                <div className="font-display text-lg">GSM Driving School</div>
                <div className="text-[10px] uppercase tracking-[0.18em] opacity-70">Est. 2005 · West London</div>
              </div>
            </Link>
            <p className="max-w-sm text-sm leading-relaxed opacity-80">
              DVSA-approved driving instruction across Notting Hill, Holland Park, Kensington and the surrounding W-postcodes. Manual and automatic, same instructor from first lesson to test day.
            </p>
            <a
              href="https://maps.google.com/?cid=12315071950298926858"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm hover:opacity-80"
            >
              <span className="text-accent">★★★★★</span>
              <span className="ml-2 opacity-80">5.0 from 143 Google reviews</span>
            </a>
            <a
              href="https://www.instagram.com/gsm_driving_school_?igsh=Nmx3NjRyYXkwcjJz&utm_source=qr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm opacity-80 hover:opacity-100"
            >
              <Instagram className="h-4 w-4" />
              <span>Follow us on Instagram</span>
            </a>
          </div>

          {groups.map((g) => (
            <div key={g.title}>
              <h3 className="font-display text-base">{g.title}</h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                {g.links.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="opacity-75 transition-opacity hover:opacity-100">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="font-display text-base">Get in touch</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span className="opacity-80">Notting Hill Gate · Holland Park · High Street Kensington · Bayswater</span>
              </li>
              <li className="flex items-center gap-2.5">
                <WhatsAppIcon className="h-4 w-4 shrink-0 text-[#25D366]" />
                <a
                  href="https://wa.me/447961585231"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackContactClick("whatsapp", "Footer")}
                  className="opacity-80 hover:opacity-100"
                >
                  WhatsApp 07961 585231
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-accent" />
                <a
                  href="mailto:gsmdrivingschool@outlook.com"
                  onClick={() => trackContactClick("email", "Footer")}
                  className="opacity-80 hover:opacity-100"
                >
                  gsmdrivingschool@outlook.com
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-accent" />
              Opening hours
            </h3>
            <ul className="mt-4 space-y-1.5 text-sm">
              {hours.map(([d, t]) => (
                <li key={d} className="flex justify-between gap-4 opacity-80">
                  <span>{d}</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-primary-foreground/15 pt-6 text-xs opacity-70 sm:flex-row sm:items-center">
          <span>© 2005 George's School of Motoring. All rights reserved.</span>
          <span>DVSA approved · ADI registered · Fully insured</span>
        </div>
      </div>
    </footer>
  );
}
