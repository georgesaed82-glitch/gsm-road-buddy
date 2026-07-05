import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { InstagramBrandIcon } from "@/components/InstagramBrandIcon";
import { FacebookBrandIcon } from "@/components/FacebookBrandIcon";
import { useSiteSettings, useNavItems } from "@/hooks/useSiteSettings";

const DAY_LABELS: Record<string, string> = {
  mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun",
};

export function Footer() {
  const { business, social, opening_hours, footer } = useSiteSettings();
  const { items: primaryNav } = useNavItems("footer-primary");
  const { items: secondaryNav } = useNavItems("footer-secondary");

  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-primary-foreground/30 font-display text-lg font-semibold">
                GSM
              </div>
              <div className="leading-tight">
                <div className="font-display text-lg font-semibold">{business.name}</div>
                <div className="text-[10px] uppercase tracking-[0.18em] opacity-70">{business.tagline}</div>
              </div>
            </Link>
            {footer.disclaimer && (
              <p className="text-sm opacity-80">{footer.disclaimer}</p>
            )}
            <div className="flex items-center gap-3 pt-1">
              {social.facebook && (
                <a href={social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="opacity-80 hover:opacity-100">
                  <FacebookBrandIcon className="h-5 w-5" />
                </a>
              )}
              {social.instagram && (
                <a href={social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="opacity-80 hover:opacity-100">
                  <InstagramBrandIcon className="h-5 w-5" />
                </a>
              )}
              {social.tiktok && (
                <a href={social.tiktok} target="_blank" rel="noopener noreferrer" className="text-sm opacity-80 hover:opacity-100">TikTok</a>
              )}
              {social.youtube && (
                <a href={social.youtube} target="_blank" rel="noopener noreferrer" className="text-sm opacity-80 hover:opacity-100">YouTube</a>
              )}
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <h3 className="font-display text-base font-semibold">Contact</h3>
            {business.phone && (
              <a href={`tel:+${business.phone_intl}`} className="flex items-center gap-2 opacity-90 hover:opacity-100">
                <Phone className="h-4 w-4" /> {business.phone}
              </a>
            )}
            {business.phone_intl && (
              <a href={`https://wa.me/${business.phone_intl}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 opacity-90 hover:opacity-100">
                <WhatsAppIcon className="h-4 w-4" /> WhatsApp
              </a>
            )}
            {business.email && (
              <a href={`mailto:${business.email}`} className="flex items-center gap-2 break-all opacity-90 hover:opacity-100">
                <Mail className="h-4 w-4 shrink-0" /> {business.email}
              </a>
            )}
            {business.address && (
              <div className="flex items-start gap-2 opacity-90">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{business.address}</span>
              </div>
            )}
          </div>

          <div className="space-y-3 text-sm">
            <h3 className="flex items-center gap-2 font-display text-base font-semibold">
              <Clock className="h-4 w-4" /> Opening hours
            </h3>
            <ul className="space-y-1 opacity-90">
              {(["mon","tue","wed","thu","fri","sat","sun"] as const).map((d) => (
                opening_hours[d] ? (
                  <li key={d} className="flex justify-between gap-4">
                    <span>{DAY_LABELS[d]}</span>
                    <span>{opening_hours[d]}</span>
                  </li>
                ) : null
              ))}
            </ul>
          </div>

          <div className="space-y-3 text-sm">
            <h3 className="font-display text-base font-semibold">Explore</h3>
            <ul className="space-y-2 opacity-90">
              {(primaryNav.length > 0 ? primaryNav : [
                { id: "d1", href: "/services", label: "Services" },
                { id: "d2", href: "/pricing", label: "Pricing" },
                { id: "d3", href: "/reviews", label: "Reviews" },
                { id: "d4", href: "/contact", label: "Contact" },
              ]).map((n) => (
                <li key={n.id}>
                  <a href={n.href} className="hover:underline">{n.label}</a>
                </li>
              ))}
            </ul>
            {secondaryNav.length > 0 && (
              <ul className="space-y-2 pt-2 opacity-75">
                {secondaryNav.map((n) => (
                  <li key={n.id}>
                    <a href={n.href} className="hover:underline">{n.label}</a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <p className="mt-10 text-center text-xs opacity-70">{footer.copy}</p>
      </div>
    </footer>
  );
}
