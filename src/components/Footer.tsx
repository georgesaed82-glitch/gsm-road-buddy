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
import { BrandBanner } from "@/components/Header";

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
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Top: logo */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-full max-w-[400px] lg:max-w-[520px]">
            <BrandBanner />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-90">
            George's School of Motoring · Established 2005
          </p>
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
                  aria-label="GSM Driving School on YouTube"
                  className="inline-flex items-center gap-1.5 text-sm opacity-80 hover:opacity-100"
                >
                  <Youtube className="h-5 w-5" aria-hidden="true" /> YouTube
                </a>
              )}
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-sm">
          <a href={`tel:+${business.phone_intl}`} className="font-semibold hover:text-accent">
            Call {business.phone}
          </a>
        </p>

        {/* Bottom: copyright + disclaimer */}
        <p className="mt-8 text-center text-xs opacity-70">{footer.copy}</p>
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
