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
  const { business, opening_hours } = useSiteSettings();
  const hours = (["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const)
    .filter((k) => opening_hours[k])
    .map((k) => ({ day: DAY_LABELS[k], time: opening_hours[k] }));
  const waHref = `https://wa.me/${business.phone_intl}`;
  const telHref = `tel:+${business.phone_intl}`;
  const mailHref = `mailto:${business.email}`;
  return (
    <div className="flex flex-col">
      <section className="bg-secondary/40 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Contact us
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Have a question? We're here to help you get on the road.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Quick actions */}
            <Card className="border-border bg-card lg:col-span-2">
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
            <div className="lg:col-span-2">
              <BookingForm />
            </div>

            {/* Office hours */}
            <Card className="border-border bg-card lg:col-span-2">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-center gap-2 sm:justify-start">
                  <Clock className="h-5 w-5 text-primary" />
                  <CardTitle className="font-display text-xl">Office hours</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {hours.map(({ day, time }) => (
                    <div
                      key={day}
                      className="flex items-center justify-between rounded-md border border-border bg-secondary/40 px-4 py-3"
                    >
                      <span className="font-medium text-foreground">{day}</span>
                      <span className="text-sm text-muted-foreground">{time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Visit us */}
            <Card className="border-border bg-card lg:col-span-2">
              <CardHeader className="pb-4 text-center sm:text-left">
                <CardTitle className="font-display text-xl">Visit us</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Address</p>
                    <p className="text-sm text-muted-foreground">{business.address}</p>
                  </div>
                </div>
                <AreasCovered />
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Email</p>
                    <a
                      href={mailHref}
                      onClick={() => trackContactClick("email", "Contact page – details")}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      {business.email}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <WhatsAppIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#25D366]" />
                  <div>
                    <p className="font-medium text-foreground">WhatsApp</p>
                    <a
                      href={waHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackContactClick("whatsapp", "Contact page – details")}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      {business.phone}
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}

function AreasCovered() {
  const { footer } = useSiteSettings();
  if (!footer.areas_covered) return null;
  return (
    <div className="flex items-start gap-3">
      <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
      <div>
        <p className="font-medium text-foreground">Areas covered</p>
        <p className="text-sm text-muted-foreground">{footer.areas_covered}</p>
      </div>
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
