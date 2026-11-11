import type { ReactNode } from "react";
import { TikTokEmbed } from "@/components/TikTokEmbed";
import { TikTokIcon } from "@/components/TikTokIcon";
import { Button } from "@/components/ui/button";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { resolveTiktokUrl } from "@/lib/tiktok";
import gsmLogo from "@/assets/gsm-logo.jpeg.asset.json";

type GsmTikTokShowcaseProps = {
  headingLevel?: "h1" | "h2";
  children?: ReactNode;
};

export function GsmTikTokShowcase({ headingLevel = "h2", children }: GsmTikTokShowcaseProps) {
  const { social } = useSiteSettings();
  const tiktok = resolveTiktokUrl(social.tiktok);
  const Heading = headingLevel;

  return (
    <section className="border-y border-border bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:max-w-[1180px] lg:px-8 lg:py-12">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-primary-foreground/70">
          <span className="h-px w-8 bg-accent" /> Free driving videos
        </div>
        <Heading className="mt-4 font-display text-3xl font-medium leading-tight sm:text-4xl lg:text-[34px]">
          Watch GSM on <span className="italic text-accent">TikTok</span>
        </Heading>
        <p className="mx-auto mt-3 hidden max-w-2xl text-center text-primary-foreground/80 lg:block">
          Clear, practical driving tips from George and the GSM team, with step-by-step visual explanations.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button asChild size="lg" className="h-12 rounded-2xl bg-tiktok px-6 text-base font-bold text-tiktok-foreground shadow-[-2px_0_0_0_var(--tiktok-cyan),2px_0_0_0_var(--tiktok-pink),0_5px_0_0_rgba(0,0,0,0.45)] transition-transform hover:-translate-y-0.5 hover:bg-tiktok/90 active:translate-y-0.5">
            <a href={tiktok} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
              <TikTokIcon className="h-5 w-5" /> Watch &amp; follow on TikTok
            </a>
          </Button>
          <span className="text-sm text-primary-foreground/75">@gsm.drivingschool</span>
        </div>
        <div className="mt-6 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,500px)_minmax(0,1fr)] lg:items-center lg:gap-4">
          <div className="hidden min-w-0 flex-col items-center text-center lg:flex lg:items-end" aria-hidden="true">
            <img
              src={gsmLogo.url}
              alt=""
              width={853}
              height={861}
              className="h-36 w-36 rounded-full bg-card object-contain shadow-xl ring-4 ring-accent lg:h-28 lg:w-28"
            />
            <p className="mt-5 max-w-[280px] font-display text-xl font-semibold uppercase leading-snug tracking-[0.12em] text-primary-foreground lg:mt-4 lg:max-w-[240px] lg:text-base">
              George&apos;s School<br />of Motoring
            </p>
          </div>
          <div className="mx-auto w-full max-w-[360px] rounded-2xl bg-card p-2 text-foreground box-3d lg:max-w-[500px]">
            <TikTokEmbed />
          </div>
          <div className="hidden min-w-0 flex-col items-center text-center lg:flex lg:items-start" aria-hidden="true">
            <p className="font-display text-6xl font-extrabold tracking-tight text-primary-foreground lg:text-5xl">GSM</p>
            <p className="mt-1 whitespace-nowrap font-display text-lg font-semibold uppercase tracking-[0.18em] text-primary-foreground lg:text-sm">
              Driving School
            </p>
            <span className="mt-4 h-0.5 w-full max-w-[260px] bg-accent lg:mt-3 lg:max-w-[200px]" />
            <p className="mt-4 whitespace-nowrap text-xs font-medium uppercase tracking-[0.2em] text-primary-foreground/85 lg:mt-3 lg:text-[10px]">
              West London · Est. 2005
            </p>
          </div>
        </div>
        <p className="mt-3 text-xs text-primary-foreground/70">
          If the TikTok preview doesn't load, the button above opens the profile directly.
        </p>
        {children}
        <p className="mx-auto mt-8 max-w-2xl text-center text-primary-foreground/80 lg:hidden">
          Clear, practical driving tips from George and the GSM team, with step-by-step visual explanations.
        </p>
      </div>
    </section>
  );
}
