import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { AIChatWidget } from "../components/AIChatWidget";


function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "GSM Driving School — Notting Hill & West London" },
      { name: "description", content: "DVSA-approved driving lessons in Notting Hill, Kensington & West London. Manual & automatic. Rated 5.0 from 143 Google reviews." },
      { name: "author", content: "GSM Driving School" },
      { property: "og:title", content: "GSM Driving School — Notting Hill & West London" },
      { property: "og:description", content: "DVSA-approved driving lessons in Notting Hill, Kensington & West London. Manual & automatic. Rated 5.0 from 143 Google reviews." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "GSM Driving School" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "GSM Driving School — Notting Hill & West London" },
      { name: "twitter:description", content: "DVSA-approved manual and automatic driving lessons across West London. Rated 5.0 from 143 five-star Google reviews." },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "DrivingSchool",
          "@id": "https://www.gsmdrivingschool.com/#school",
          name: "GSM Driving School",
          alternateName: "George's School of Motoring",
          url: "https://www.gsmdrivingschool.com",
          telephone: "+447961585231",
          email: "gsmdrivingschool@outlook.com",
          description:
            "DVSA-approved driving school in West London. Manual and automatic driving lessons in Notting Hill, Kensington, Holland Park, Bayswater, Shepherd's Bush, Chiswick and Fulham.",
          priceRange: "££",
          foundingDate: "2005",
          address: {
            "@type": "PostalAddress",
            streetAddress: "71 Sandbourne House, Dartmouth Close",
            addressLocality: "London",
            postalCode: "W11 1DS",
            addressCountry: "GB",
          },
          geo: {
            "@type": "GeoCoordinates",
            latitude: 51.5121,
            longitude: -0.2098,
          },
          areaServed: [
            "W2", "W3", "W4", "W6", "W8", "W10", "W11", "W12", "W14", "SW6",
            "Notting Hill", "Holland Park", "Kensington", "Bayswater",
            "Shepherd's Bush", "Chiswick", "Fulham",
          ].map((a) => ({ "@type": "Place", name: a })),
          openingHoursSpecification: [
            { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Friday"], opens: "07:00", closes: "20:00" },
            { "@type": "OpeningHoursSpecification", dayOfWeek: ["Tuesday", "Wednesday"], opens: "07:00", closes: "21:00" },
            { "@type": "OpeningHoursSpecification", dayOfWeek: "Thursday", opens: "07:00", closes: "20:30" },
            { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "07:00", closes: "18:00" },
          ],
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "5.0",
            reviewCount: "143",
          },
          sameAs: [
            "https://www.instagram.com/gsm_driving_school_",
            "https://www.facebook.com/share/1HySrwY5AA/?mibextid=wwXIfr",
            "https://maps.google.com/?cid=12315071950298926858",
          ],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    function handleExternalClick(e: MouseEvent) {
      if (e.defaultPrevented) return;
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const link = (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>("a[href]");
      if (!link) return;

      const href = link.getAttribute("href");
      if (!href) return;
      if (href.startsWith("mailto:") || href.startsWith("tel:")) return;

      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }

      if (url.origin === window.location.origin) return;

      e.preventDefault();

      const openedWindow = window.open(url.href, "_blank");
      if (openedWindow) {
        openedWindow.opener = null;
        openedWindow.focus();
        return;
      }

      try {
        window.top?.location.assign(url.href);
      } catch {
        window.location.assign(url.href);
      }
    }

    document.addEventListener("click", handleExternalClick, { capture: true });
    return () => document.removeEventListener("click", handleExternalClick, { capture: true });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
        <AIChatWidget />
      </div>
    </QueryClientProvider>
  );
}
