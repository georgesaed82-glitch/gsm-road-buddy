import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MapPin, Clock, Phone, Youtube } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { BookingForm } from "@/components/BookingForm";
import { trackContactClick } from "@/lib/trackContactClick";
import { useSiteSettings } from "@/hooks/useSiteSettings";

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
      lines: [business.phone, "Messages any time · replies during lesson hours"],
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
      label: "Lesson hours",
      lines: [
        "Mon & Fri · 7am – 8pm",
        "Tue & Wed · 7am – 9pm",
        "Thu · 7am – 8:30pm",
        "Sat · 7am – 6pm · Sun closed",
      ],
    },
    {
      icon: <WhatsAppIcon className="h-6 w-6" />,
      label: "WhatsApp",
      lines: [business.phone, "Send us a message"],
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
          <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((c) => {
              const inner = (
                <>
                  <span className="grid h-10 w-10 shrink-0 place-items-center self-center rounded-2xl border border-accent/40 bg-primary text-accent shadow-sm sm:h-11 sm:w-11">
                    {c.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                      {c.label}
                    </p>
                    {c.lines.map((line, i) => (
                      <p
                        key={i}
                        className={
                          i === 0
                            ? "mt-1 break-words font-display text-base font-semibold text-foreground sm:text-lg"
                            : "text-sm text-muted-foreground break-words"
                        }
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                </>
              );
              const className =
                "group flex items-center gap-4 rounded-2xl bg-card p-4 sm:p-5 box-3d min-w-0";
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
          <Card className="mt-8 bg-card box-3d">
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
                    className="flex items-center justify-between rounded-xl border /70 bg-secondary/40 px-4 py-3 box-3d"
                  >
                    <span className="font-medium text-foreground">{day}</span>
                    <span className="text-sm text-muted-foreground">{time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Instant CTAs */}
          <Card className="mt-6 bg-card box-3d">
            <CardHeader className="pb-4 text-center">
              <CardTitle className="font-display text-2xl">Send us a message</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              <WhatsAppButton phoneIntl={business.phone_intl} />
              <CallButton phoneIntl={business.phone_intl} />
              <Button asChild size="lg" className="h-10 w-full justify-center gap-2 rounded-xl bg-youtube text-youtube-foreground btn-3d hover:bg-youtube/90">
                <Link to="/youtube">
                  <Youtube className="h-5 w-5" /> Driving videos
                </Link>
              </Button>
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
      className="h-10 w-full justify-center gap-2 rounded-xl bg-primary text-primary-foreground btn-3d transition-transform hover:bg-primary/90 hover:shadow-lg"
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
      className="h-10 w-full justify-center gap-2 rounded-xl border-primary bg-background text-primary btn-3d transition-transform hover:bg-secondary hover:text-primary box-3d"
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
