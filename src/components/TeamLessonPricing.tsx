import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { BUSINESS, TEAM_STARTING_RATE } from "@/lib/business";

export function TeamLessonPricing({ location }: { location: string }) {
  return (
    <section className="mt-8 border-y border-accent bg-secondary/40 px-4 py-6 sm:px-6">
      <h2 className="font-display text-2xl font-bold text-primary">
        Lessons with other GSM instructors — from £{TEAM_STARTING_RATE} per hour
      </h2>
      <p className="mt-3 text-base leading-relaxed text-foreground">
        Lessons with other GSM instructors start from £{TEAM_STARTING_RATE} per hour, depending on the instructor.
        Individual prices and availability are given on enquiry. Contact us to discuss your requirements
        and find out the price for your chosen instructor.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button asChild className="btn-3d min-h-11">
          <a href={`tel:+${BUSINESS.phoneIntl}`} data-track-location={location}><Phone /> Call to enquire</a>
        </Button>
        <Button asChild variant="secondary" className="btn-3d min-h-11 bg-accent text-accent-foreground">
          <a href={`https://wa.me/${BUSINESS.phoneIntl}`} target="_blank" rel="noopener noreferrer" data-track-location={location}>
            <WhatsAppIcon /> WhatsApp enquiry
          </a>
        </Button>
      </div>
    </section>
  );
}