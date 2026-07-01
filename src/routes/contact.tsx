import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MapPin, Clock, Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { InstagramBrandIcon } from "@/components/InstagramBrandIcon";
import { FacebookBrandIcon } from "@/components/FacebookBrandIcon";
import { BookingForm } from "@/components/BookingForm";
import { trackContactClick } from "@/lib/trackContactClick";

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

const hours = [
  { day: "Monday", time: "7:00 – 20:00" },
  { day: "Tuesday", time: "7:00 – 21:00" },
  { day: "Wednesday", time: "7:00 – 21:00" },
  { day: "Thursday", time: "7:00 – 20:30" },
  { day: "Friday", time: "7:00 – 20:00" },
  { day: "Saturday", time: "7:00 – 18:00" },
  { day: "Sunday", time: "Closed" },
];

function ContactPage() {
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
            {/* Booking form */}
            <div className="lg:col-span-2">
              <BookingForm />
            </div>

            {/* Visit us */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-4 text-center sm:text-left">
                <CardTitle className="font-display text-xl">Visit us</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Address</p>
                    <p className="text-sm text-muted-foreground">
                      71 Sandbourne House, Dartmouth Close, London W11 1DS
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Areas covered</p>
                    <p className="text-sm text-muted-foreground">
                      Notting Hill Gate · Holland Park · High Street Kensington · Bayswater
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Email</p>
                    <a
                      href="mailto:gsmdrivingschool@outlook.com"
                      onClick={() => trackContactClick("email", "Contact page – details")}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      gsmdrivingschool@outlook.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <WhatsAppIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#25D366]" />
                  <div>
                    <p className="font-medium text-foreground">WhatsApp</p>
                    <a
                      href="https://wa.me/447961585231"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackContactClick("whatsapp", "Contact page – details")}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      07961 585231
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick actions */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-4 text-center sm:text-left">
                <CardTitle className="font-display text-xl">Talk to us instantly</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <Button asChild size="lg" className="h-12 w-full justify-center gap-2 rounded-none bg-[#25D366] text-white hover:bg-[#1ebe57]">
                  <a
                    href="https://wa.me/447961585231"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackContactClick("whatsapp", "Contact page – instant CTA")}
                  >
                    <WhatsAppIcon className="h-4 w-4" />
                    WhatsApp 07961 585231
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 w-full justify-center gap-2 rounded-none">
                  <a
                    href="tel:+447961585231"
                    onClick={() => trackContactClick("phone", "Contact page – instant CTA")}
                  >
                    <Phone className="h-4 w-4" />
                    Call 07961 585231
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 w-full justify-center gap-2 rounded-none">
                  <a
                    href="mailto:gsmdrivingschool@outlook.com"
                    onClick={() => trackContactClick("email", "Contact page – instant CTA")}
                  >
                    <Mail className="h-4 w-4" />
                    gsmdrivingschool@outlook.com
                  </a>
                </Button>
                <Button asChild size="lg" className="h-12 w-full justify-center gap-2 rounded-none bg-gradient-to-r from-[#fccc63] via-[#e1306c] to-[#833ab4] text-white hover:opacity-90">
                  <a
                    href="https://www.instagram.com/gsm_driving_school_"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <InstagramBrandIcon className="h-5 w-5" />
                    Follow us on Instagram
                  </a>
                </Button>
                <Button asChild size="lg" className="h-12 w-full justify-center gap-2 rounded-none bg-[#1877F2] text-white hover:bg-[#166fe5]">
                  <a
                    href="https://www.facebook.com/share/1HySrwY5AA/?mibextid=wwXIfr"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FacebookBrandIcon className="h-5 w-5" />
                    Follow us on Facebook
                  </a>
                </Button>
              </CardContent>
            </Card>

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
          </div>
        </div>
      </section>
    </div>
  );
}
