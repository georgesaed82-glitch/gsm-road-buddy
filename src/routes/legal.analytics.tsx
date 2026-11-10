import { createFileRoute } from "@tanstack/react-router";

const CANONICAL = "https://www.gsmdrivingschool.com/legal/analytics";
const TITLE = "Analytics & Privacy | GSM Driving School";
const DESCRIPTION =
  "How GSM Driving School uses consented Google Analytics page views and contact-button clicks, and how to change your choice.";

export const Route = createFileRoute("/legal/analytics")({
  head: () => ({
    links: [{ rel: "canonical", href: CANONICAL }],
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: CANONICAL },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AnalyticsPrivacyPage,
});

function AnalyticsPrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16">
      <article className="rounded-2xl border border-accent/40 bg-card p-5 text-card-foreground shadow-[0_5px_0_0_var(--primary),0_16px_35px_-18px_rgba(0,0,0,0.35)] sm:p-8">
        <h1 className="font-display text-3xl font-bold md:text-4xl">Analytics &amp; privacy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated 10 November 2026</p>

        <section className="mt-8">
          <h2 className="font-display text-xl font-bold">What Analytics measures</h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            When Analytics is permitted, GSM Driving School uses Google Analytics to measure public
            website page views and clicks on telephone and WhatsApp links. Google receives page and
            interaction information together with technical browser, device and cookie information.
            We use these measurements to understand website use and improve the information we provide.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="font-display text-xl font-bold">Contact clicks are not completed enquiries</h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            A telephone or WhatsApp click records only that the link was selected. It does not mean a
            call connected or a message was sent. The availability form prepares a WhatsApp message;
            it does not confirm an enquiry, so it is counted only as a WhatsApp click.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="font-display text-xl font-bold">Information not sent to Analytics</h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            We do not intentionally send names, email addresses, telephone numbers, postcodes,
            availability details or message contents to Google Analytics. Form entries are not used
            as Analytics event parameters. If you continue to WhatsApp, your message is handled by
            WhatsApp under its own privacy terms.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="font-display text-xl font-bold">Your choices</h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            Visitors in the UK and other consent regions are asked to accept or reject Analytics
            before it starts. You can change your choice at any time using “Analytics choices” in the
            website footer. Rejecting stops future Analytics measurement. A browser Global Privacy
            Control signal also keeps Analytics off, including when a previous acceptance was saved.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="font-display text-xl font-bold">Google and advertising</h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            Google Analytics is supplied by Google. This setup does not send enhanced-conversion
            customer details and does not itself import any event into Google Ads. Any future Google
            Ads import should accurately describe the measured action rather than treating a contact
            click as a completed enquiry.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="font-display text-xl font-bold">Contact</h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            Questions about this notice can be sent to{" "}
            <a className="font-semibold text-primary underline underline-offset-2" href="mailto:gsmdrivingschool@outlook.com">
              gsmdrivingschool@outlook.com
            </a>
            .
          </p>
        </section>
      </article>
    </main>
  );
}
