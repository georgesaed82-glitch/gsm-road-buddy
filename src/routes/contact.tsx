import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, MapPin, Clock, Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { InstagramBrandIcon } from "@/components/InstagramBrandIcon";
import { FacebookBrandIcon } from "@/components/FacebookBrandIcon";
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
          <div className="grid gap-10 lg:grid-cols-1">
            <div className="space-y-6">
              <Card className="border-border bg-card">
                <CardContent className="p-6">
                  <h2 className="font-display text-xl font-semibold">Talk to us instantly</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Tap below to message, call, email or follow us — we're here to help you book.
                  </p>
                  <div className="mt-4 grid gap-3">
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
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardContent className="p-6">
                  <h2 className="font-display text-xl font-semibold">Contact details</h2>
                  <ul className="mt-4 space-y-4">
                    <li className="flex items-start gap-3 text-sm text-muted-foreground">
                      <WhatsAppIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#25D366]" />
                      <div>
                        <p className="font-medium text-foreground">WhatsApp</p>
                        <a
                          href="https://wa.me/447961585231"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => trackContactClick("whatsapp", "Contact page – details")}
                          className="hover:text-foreground"
                        >
                          07961 585231
                        </a>
                      </div>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-muted-foreground">
                      <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">Email</p>
                        <a
                          href="mailto:gsmdrivingschool@outlook.com"
                          onClick={() => trackContactClick("email", "Contact page – details")}
                          className="hover:text-foreground"
                        >
                          gsmdrivingschool@outlook.com
                        </a>
                      </div>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-muted-foreground">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">Address</p>
                        <p>71 Sandbourne House, Dartmouth Close, London W11 1DS</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-muted-foreground">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">Areas covered</p>
                        <p>Notting Hill Gate · Holland Park · High Street Kensington · Bayswater</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-muted-foreground">
                      <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">Office hours</p>
                        <p>Mon–Fri: 8am–6pm</p>
                        <p>Sat: 9am–2pm</p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
