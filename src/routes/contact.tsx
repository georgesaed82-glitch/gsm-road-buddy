import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, MapPin, Clock, Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

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
          <div className="grid gap-10 lg:grid-cols-2">
            <Card className="border-border bg-card">
              <CardContent className="p-6 sm:p-8">
                <h2 className="font-display text-2xl font-semibold">Send a message</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Fill out the form and we'll get back to you within one business day.
                </p>
                <form className="mt-6 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First name</Label>
                      <Input id="firstName" placeholder="Jane" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last name</Label>
                      <Input id="lastName" placeholder="Doe" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="jane@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" type="tel" placeholder="(123) 456-7890" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" placeholder="How can we help?" rows={4} />
                  </div>
                  <Button type="submit" className="w-full">
                    Send message
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    Prefer to message directly?{" "}
                    <a
                      href="https://wa.me/447961585231"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-foreground"
                    >
                      WhatsApp 07961 585231
                    </a>{" "}
                    or{" "}
                    <a href="mailto:gsmdrivingschool@outlook.com" className="hover:text-foreground">
                      email gsmdrivingschool@outlook.com
                    </a>
                  </p>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border-border bg-card">
                <CardContent className="p-6">
                  <h2 className="font-display text-xl font-semibold">Talk to us instantly</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Tap below to call or email — we're here to help you book.
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <Button asChild className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                      <a href="tel:+447961585231" aria-label="Call 07961 585231">
                        <Phone className="h-4 w-4" />
                        Call 07961 585231
                      </a>
                    </Button>
                    <Button asChild variant="outline" className="w-full gap-2">
                      <a href="mailto:gsmdrivingschool@outlook.com" aria-label="Email gsmdrivingschool@outlook.com">
                        <Mail className="h-4 w-4" />
                        Email us
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
                        <a href="mailto:gsmdrivingschool@outlook.com" className="hover:text-foreground">
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

              <Card className="border-border bg-card overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-video w-full sm:aspect-[4/3]">
                    <iframe
                      title="GSM Driving School location"
                      className="h-full w-full border-0"
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY}&q=place_id:ChIJS9BLMgMQdkgRCs_x1LDs56o`}
                    />
                  </div>
                  <div className="p-6">
                    <h2 className="font-display text-xl font-semibold">Find us</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      71 Sandbourne House, Dartmouth Close, London W11 1DS
                    </p>
                    <a
                      href="https://maps.google.com/?cid=12315071950298926858"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center text-sm font-medium text-primary hover:underline"
                    >
                      Open in Google Maps
                    </a>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardContent className="p-6">
                  <h2 className="font-display text-xl font-semibold">Prefer to book online?</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    You can choose your package, instructor, and time slot directly through our booking page.
                  </p>
                  <Button asChild className="mt-4 w-full">
                    <a href="/booking">Book a lesson</a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
