import { describe, expect, it } from "vitest";
import { buildContactEvent, contactMethodForHref, sanitisePath } from "./contactLinkTracking";
import { GEORGE_PRICES, LESSON_TERMS } from "./business";

describe("contact link tracking", () => {
  it("maps phone and WhatsApp links to the agreed event names", () => {
    expect(buildContactEvent(contactMethodForHref("tel:+447961585231")!, "header", "/").name).toBe("phone_click");
    expect(buildContactEvent(contactMethodForHref("https://wa.me/447961585231")!, "footer", "/").name).toBe("whatsapp_click");
    expect(contactMethodForHref("mailto:gsmdrivingschool@outlook.com")).toBeNull();
  });

  it("never sends query strings or WhatsApp message text", () => {
    const evt = buildContactEvent("whatsapp", "Enquiry form", "/contact?text=Hi%20my%20name%20is%20Sam#x");
    expect(evt.params.page_path).toBe("/contact");
    expect(JSON.stringify(evt.params)).not.toContain("Sam");
    expect(evt.params.link_location).toBe("enquiry_form");
    expect(sanitisePath("/areas/kensington?phone=07123")).toBe("/areas/kensington");
  });

  it("records the area for local pages", () => {
    expect(buildContactEvent("phone", "area_hero", "/areas/notting-hill").params.page_area).toBe("notting-hill");
  });
});

describe("George's prices and terms", () => {
  it("uses the confirmed prices", () => {
    expect(GEORGE_PRICES.map((p) => p.price)).toEqual(["£70", "£780", "£80", "£900"]);
  });
  it("requires 48 hours' notice and does not fix lessons at two hours", () => {
    expect(LESSON_TERMS.join(" ")).toContain("48 hours");
    expect(LESSON_TERMS.join(" ").toLowerCase()).not.toContain("two hours");
  });
});
