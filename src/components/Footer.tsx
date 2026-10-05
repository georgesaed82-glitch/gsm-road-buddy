import { Link } from "@tanstack/react-router";
import {
  Car,
  CreditCard,
  Star,
  MessageSquare,
  Newspaper,
  HelpCircle,
  Youtube,
  Bot,
} from "lucide-react";
import { InstagramBrandIcon } from "@/components/InstagramBrandIcon";
import { FacebookBrandIcon } from "@/components/FacebookBrandIcon";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { DVSADisclaimer } from "@/components/DVSADisclaimer";
import { useIsNativeApp } from "@/lib/isNativeApp";
import { BLOG_ENABLED } from "@/lib/featureFlags";
import { resolveYoutubeUrl } from "@/lib/youtube";

const ALL_FOOTER_LINKS = [
  { to: "/services", label: "Explore Services", icon: Car },
  { to: "/pricing", label: "Pricing", icon: CreditCard },
  { to: "/reviews", label: "Reviews", icon: Star },
  { to: "/contact", label: "Contact", icon: MessageSquare },
  { to: "/blog", label: "Blogs", icon: Newspaper },
  { to: "/faq", label: "FAQ", icon: HelpCircle },
  { to: "/connect", label: "AI Assistant", icon: Bot },
  { to: "/youtube", label: "Driving videos", icon: Youtube },
];
const FOOTER_LINKS = ALL_FOOTER_LINKS.filter((l) => BLOG_ENABLED || l.to !== "/blog");

export function Footer() {
  const { business, social: rawSocial, footer } = useSiteSettings();
  const isNative = useIsNativeApp();
  const social = { ...rawSocial, youtube: resolveYoutubeUrl(rawSocial.youtube) };

  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
        {/* Top: logo */}
        <div className="flex flex-col items-center gap-2 text-center">
          <Link to="/" aria-label="GSM Driving School — Home" className="inline-block">
            <span className="block font-display text-lg font-extrabold uppercase tracking-wide text-primary-foreground [text-shadow:0_1px_0_rgba(0,0,0,0.25),0_2px_0_rgba(0,0,0,0.2),0_4px_8px_rgba(0,0,0,0.4)]">
              GSM Driving School
            </span>
            <span className="mx-auto mt-1 block h-0.5 w-14 rounded-full bg-destructive shadow-[0_2px_0_rgba(0,0,0,0.3)]" />
            <span className="mt-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-primary-foreground [text-shadow:0_2px_0_rgba(0,0,0,0.3),0_4px_8px_rgba(0,0,0,0.35)]">
              George's School of Motoring · Established 2005
            </span>
          </Link>
          {(
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
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
                  aria-label="GSM Driving School on YouTube"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-youtube px-2.5 py-1 text-xs font-bold text-youtube-foreground shadow-[0_3px_0_0_rgba(0,0,0,0.35)] transition-transform hover:-translate-y-0.5 active:translate-y-1 active:shadow-none"
                >
                  <Youtube className="h-4 w-4" aria-hidden="true" /> YouTube
                </a>
              )}
              <a href={`tel:+${business.phone_intl}`} className="inline-flex items-center rounded-lg border border-primary/25 bg-card px-2.5 py-1 text-xs font-extrabold text-primary shadow-[0_3px_0_0_rgba(0,0,0,0.35)] active:translate-y-0.5 active:shadow-none">
                Call {business.phone}
              </a>
            </div>
          )}
        </div>


        {/* Bottom: copyright + disclaimer */}
        <p className="mt-3 text-center text-[10px] opacity-70">© {new Date().getFullYear()} George's School of Motoring · Established 2005. All rights reserved.</p>
        {/* Theory disclaimer only in the native learning app, not the public website. */}
        {isNative ? (
          <div className="mt-4 border-t border-primary-foreground/10 pt-4">
            <DVSADisclaimer variant="footer" />
          </div>
        ) : null}
      </div>
    </footer>
  );
}
