import { Link } from "@tanstack/react-router";
import {
  Car,
  CreditCard,
  Star,
  MessageSquare,
  Newspaper,
  HelpCircle,
  Download,
} from "lucide-react";
import { InstagramBrandIcon } from "@/components/InstagramBrandIcon";
import { FacebookBrandIcon } from "@/components/FacebookBrandIcon";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { DVSADisclaimer } from "@/components/DVSADisclaimer";

const FOOTER_LINKS = [
  { to: "/services", label: "Explore Services", icon: Car },
  { to: "/pricing", label: "Pricing", icon: CreditCard },
  { to: "/reviews", label: "Reviews", icon: Star },
  { to: "/contact", label: "Contact", icon: MessageSquare },
  { to: "/blog", label: "Blogs", icon: Newspaper },
  { to: "/faq", label: "FAQ", icon: HelpCircle },
  { to: "/#download-app", label: "Download", icon: Download },
];

export function Footer() {
  const { business, social, footer } = useSiteSettings();

  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Top: logo */}
        <div className="flex flex-col items-center gap-3 text-center">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-primary-foreground/30 font-display text-lg font-semibold">
              GSM
            </div>
            <div className="leading-tight text-left">
              <div className="font-display text-lg font-semibold">{business.name}</div>
              <div className="text-[10px] uppercase tracking-[0.18em] opacity-70">
                {business.tagline}
              </div>
            </div>
          </Link>
          {(social.facebook || social.instagram || social.tiktok || social.youtube) && (
            <div className="flex items-center gap-4 pt-1">
              {social.facebook && (
                <a
                  href={social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="opacity-80 hover:opacity-100"
                >
                  <FacebookBrandIcon className="h-5 w-5" />
                </a>
              )}
              {social.instagram && (
                <a
                  href={social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="opacity-80 hover:opacity-100"
                >
                  <InstagramBrandIcon className="h-5 w-5" />
                </a>
              )}
              {social.tiktok && (
                <a
                  href={social.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm opacity-80 hover:opacity-100"
                >
                  TikTok
                </a>
              )}
              {social.youtube && (
                <a
                  href={social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm opacity-80 hover:opacity-100"
                >
                  YouTube
                </a>
              )}
            </div>
          )}
        </div>

        {/* Boxed nav grid */}
        <nav className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-7">
          {FOOTER_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                className="flex flex-col items-center justify-center gap-1.5 rounded-lg border border-primary-foreground/20 bg-primary-foreground/5 px-3 py-3 text-center font-display text-xs font-medium transition-colors hover:border-accent/60 hover:bg-primary-foreground/10 hover:text-accent"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom: copyright + disclaimer */}
        <p className="mt-8 text-center text-xs opacity-70">{footer.copy}</p>
        <div className="mt-4 border-t border-primary-foreground/10 pt-4">
          <DVSADisclaimer variant="footer" />
        </div>
      </div>
    </footer>
  );
}
