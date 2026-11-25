import { createFileRoute } from "@tanstack/react-router";
import { BUSINESS, BUSINESS_ADDRESS, LESSON_HOURS_TEXT, PRICE_SUMMARY, GEORGE_AVAILABILITY } from "@/lib/business";
import { publicAreas } from "@/data/areas";

export const Route = createFileRoute("/llms.txt")({
  server: {
    handlers: {
      GET: async () => {
        const u = BUSINESS.url;
        const body = `# ${BUSINESS.name}

> ${BUSINESS.legalName} (GSM) — manual and automatic driving lessons in West London since ${BUSINESS.foundingYear} (over 20 years). Based in Notting Hill, W11.

Phone / WhatsApp: ${BUSINESS.phone} (+${BUSINESS.phoneIntl})
Email: ${BUSINESS.email}
Address: ${BUSINESS_ADDRESS}
Lesson hours: ${LESSON_HOURS_TEXT}. Messages welcome any time.
Profiles: ${BUSINESS.sameAs.join(", ")}

Automatic lessons with George; manual lessons with the GSM team. Beginners, nervous drivers, refresher lessons and test preparation. Learners in neighbouring areas (e.g. South Kensington) can be picked up from an agreed meeting point. ${PRICE_SUMMARY} Lessons are paid before they take place, lesson length is agreed when booking, and 48 hours' notice is needed to cancel or reschedule. ${GEORGE_AVAILABILITY} George's teaching is patient and structured, including support after an unsuccessful test. Reviews: see the Google listing; we do not quote a review total.

## Pages

- [Home](${u}/)
- [About](${u}/about)
- [Driving lessons](${u}/services)
- [Prices](${u}/pricing)
- [How George teaches](${u}/how-i-teach)
- [Instructors](${u}/instructors)
- [Reviews](${u}/reviews)
- [Driving videos](${u}/youtube)
- [Areas we cover](${u}/areas)
- [Contact](${u}/contact)

## Areas we cover

${publicAreas.map((a) => `- [${a.area} (${a.postcode})](${u}/areas/${a.slug})`).join("\n")}
`;
        return new Response(body, {
          headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
