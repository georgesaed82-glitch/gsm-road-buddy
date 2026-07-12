import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MapPin, Clock, Phone, Download } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { BookingForm } from "@/components/BookingForm";
import { trackContactClick } from "@/lib/trackContactClick";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { triggerPwaInstallPrompt } from "@/components/PWAInstallTracker";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us | GSM Driving School" },
      {
        name: "description",
        content: "Get in touch with GSM Driving School. Call, email, or send us a message.",
      },
      {
        property: "og:title",
        content: "Contact Us | GSM Driving School",
      },
      {
        property: "og:description",
        content: "Get in touch with GSM Driving School. Call, email, or send us a message.",
      },
    ],
  }),
  component: ContactPage,
});

const DAY_LABELS: Record<string, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

function ContactPage() {
  const { business, opening_hours, footer } = useSiteSettings();
  const hours = (["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const)
    .filter((k) => opening_hours[k])
    .map((k) => ({ day: DAY_LABELS[k], time: opening_hours[k] }));
  const waHref = `https://wa.me/${business.phone_intl}`;
  const telHref = `tel:+${business.phone_intl}`;
  const mailHref = `mailto:${business.email}`;
  const mapHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address)}`;

  type ContactCard = {
    icon: React.ReactNode;
    label: string;
    lines: React.ReactNode[];
    href?: string;
    external?: boolean;
    onClick?: () => void;
  };

  const cards: ContactCard[] = [
    {
      icon: <Phone className="h-6 w-6" />,
      label: "Telephone",
      lines: [business.phone, "Mon – Sun · 7:00 AM – 9:00 PM"],
      href: telHref,
      onClick: () => trackContactClick("phone", "Contact page – card"),
    },
    {
      icon: <Mail className="h-6 w-6" />,
      label: "Email",
      lines: [business.email, "We aim to reply within 24 hours"],
      href: mailHref,
      onClick: () => trackContactClick("email", "Contact page – card"),
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      label: "Location",
      lines: [
        <span key="area" className="font-semibold text-foreground">West London</span>,
        footer.areas_covered || business.address,
      ],
      href: mapHref,
      external: true,
    },
    {
      icon: <Clock className="h-6 w-6" />,
      label: "Opening hours",
      lines: ["Mon – Sun · 7:00 AM – 9:00 PM", "7 days a week"],
    },
    {
      icon: <WhatsAppIcon className="h-6 w-6" />,
      label: "WhatsApp",
      lines: [business.phone, "Chat with us instantly"],
      href: waHref,
      external: true,
      onClick: () => trackContactClick("whatsapp", "Contact page – card"),
    },
  ];

  return (
    <div className="flex flex-col bg-background">
      <section className="bg-secondary/40 py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Contact us
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            We're here to help. Get in touch with us any way you prefer.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((c) => {
              const inner = (
                <>
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-accent/40 bg-primary text-accent shadow-sm">
                    {c.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                      {c.label}
                    </p>
                    {c.lines.map((line, i) => (
                      <p
                        key={i}
                        className={
                          i === 0
                            ? "mt-1 truncate font-display text-lg font-semibold text-foreground"
                            : "text-sm text-muted-foreground"
                        }
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                </>
              );
              const className =
                "group flex items-start gap-4 rounded-2xl border border-border/70 bg-card p-5 shadow-[0_2px_14px_-6px_rgba(29,42,34,0.18)] transition-all hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-[0_10px_28px_-14px_rgba(29,42,34,0.35)]";
              if (c.href) {
                return (
                  <a
                    key={c.label}
                    href={c.href}
                    target={c.external ? "_blank" : undefined}
                    rel={c.external ? "noopener noreferrer" : undefined}
                    onClick={c.onClick}
                    className={className}
                  >
                    {inner}
                  </a>
                );
              }
              return (
                <div key={c.label} className={className}>
                  {inner}
                </div>
              );
            })}
          </div>

          {/* Detailed hours */}
          <Card className="mt-8 border-border bg-card">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <CardTitle className="font-display text-xl">Full opening hours</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {hours.map(({ day, time }) => (
                  <div
                    key={day}
                    className="flex items-center justify-between rounded-xl border border-border/70 bg-secondary/40 px-4 py-3"
                  >
                    <span className="font-medium text-foreground">{day}</span>
                    <span className="text-sm text-muted-foreground">{time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Instant CTAs */}
          <Card className="mt-6 border-border bg-card">
            <CardHeader className="pb-4 text-center">
              <CardTitle className="font-display text-2xl">Talk to us instantly</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              <WhatsAppButton phoneIntl={business.phone_intl} />
              <CallButton phoneIntl={business.phone_intl} />
              <DownloadAppButton />
            </CardContent>
          </Card>

          {/* Booking form */}
          <div className="mt-6">
            <BookingForm />
          </div>
        </div>
      </section>
    </div>
  );
}

function WhatsAppButton({ phoneIntl }: { phoneIntl: string }) {
  return (
    <Button
      asChild
      size="lg"
      className="h-14 w-full justify-center gap-2 rounded-xl bg-primary text-primary-foreground shadow-md transition-transform hover:bg-primary/90 hover:shadow-lg"
    >
      <a
        href={`https://wa.me/${phoneIntl}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackContactClick("whatsapp", "Contact page – instant CTA")}
      >
        <WhatsAppIcon className="h-5 w-5" />
        WhatsApp
      </a>
    </Button>
  );
}

function CallButton({ phoneIntl }: { phoneIntl: string }) {
  return (
    <Button
      asChild
      size="lg"
      variant="outline"
      className="h-14 w-full justify-center gap-2 rounded-xl border-primary bg-background text-primary shadow-md transition-transform hover:bg-secondary hover:text-primary"
    >
      <a
        href={`tel:+${phoneIntl}`}
        onClick={() => trackContactClick("phone", "Contact page – instant CTA")}
      >
        <Phone className="h-5 w-5" />
        Call
      </a>
    </Button>
  );
}

function detectPlatform() {
  if (typeof navigator === "undefined") return { ios: false, android: false, standalone: false };
  const ua = navigator.userAgent || "";
  const ios = /iPhone|iPad|iPod/i.test(ua);
  const android = /Android/i.test(ua);
  const standalone =
    (typeof window !== "undefined" && window.matchMedia?.("(display-mode: standalone)").matches) ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return { ios, android, standalone };
}

function DownloadAppButton() {
  const [platform, setPlatform] = useState({ ios: false, android: false, standalone: false });
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  const handleClick = async () => {
    if (platform.ios || platform.standalone) {
      setShowHelp(true);
      return;
    }
    const shown = await triggerPwaInstallPrompt();
    if (!shown) setShowHelp(true);
  };

  return (
    <>
      <Button
        size="lg"
        onClick={handleClick}
        className="h-14 w-full justify-center gap-2 rounded-xl bg-accent text-accent-foreground shadow-md transition-transform hover:bg-accent/90 hover:shadow-lg"
      >
        <Download className="h-5 w-5" />
        Download the App
      </Button>
      {showHelp && (
        <div className="col-span-full rounded-lg border border-border bg-muted p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Install the GSM app</p>
          {platform.ios ? (
            <p className="mt-1">
              Tap the Share button in Safari, then choose{" "}
              <strong className="text-foreground">Add to Home Screen</strong>.
            </p>
          ) : (
            <p className="mt-1">
              Open this site in Chrome, Edge or Samsung Internet, then choose{" "}
              <strong className="text-foreground">Install app</strong> or{" "}
              <strong className="text-foreground">Add to Home screen</strong> from the browser menu.
            </p>
          )}
        </div>
      )}
    </>
  );
}
