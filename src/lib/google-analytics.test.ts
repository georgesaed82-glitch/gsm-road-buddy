import { describe, expect, it } from "vitest";
import {
  contactAnalyticsEvent,
  isConsentRegion,
  isPublicAnalyticsPath,
  parseCloudflareTrace,
  resolveAnalyticsPermission,
} from "./google-analytics";

describe("Google Analytics consent", () => {
  it("requires acceptance in the UK", () => {
    expect(resolveAnalyticsPermission(null, "GB", false)).toBe(false);
    expect(resolveAnalyticsPermission({ choice: "accepted" }, "GB", false)).toBe(true);
  });

  it("allows ordinary tracking outside consent regions unless rejected", () => {
    expect(resolveAnalyticsPermission(null, "US", false)).toBe(true);
    expect(resolveAnalyticsPermission({ choice: "rejected" }, "US", false)).toBe(false);
  });

  it("fails closed when the region is unknown", () => {
    expect(isConsentRegion("UNKNOWN")).toBe(true);
    expect(resolveAnalyticsPermission(null, "UNKNOWN", false)).toBe(false);
  });

  it("Global Privacy Control overrides saved acceptance", () => {
    expect(resolveAnalyticsPermission({ choice: "accepted" }, "US", true)).toBe(false);
  });

  it("rejects a missing, invalid or mismatched trace", () => {
    expect(parseCloudflareTrace("h=www.gsmdrivingschool.com\nloc=GB", "www.gsmdrivingschool.com")).toBe("GB");
    expect(parseCloudflareTrace("h=other.example\nloc=US", "www.gsmdrivingschool.com")).toBeNull();
    expect(parseCloudflareTrace("h=www.gsmdrivingschool.com\nloc=XX", "www.gsmdrivingschool.com")).toBeNull();
  });
});

describe("Google Analytics public website boundaries", () => {
  it.each(["/", "/contact", "/pricing", "/areas/kensington", "/legal/analytics"])(
    "tracks public page %s",
    (path) => expect(isPublicAnalyticsPath(path)).toBe(true),
  );

  it.each(["/auth", "/admin", "/admin/bookings", "/payments", "/dashboard", "/gsm-plus", "/theory"])(
    "does not track private or native-learning page %s",
    (path) => expect(isPublicAnalyticsPath(path)).toBe(false),
  );
});

describe("Google Analytics contact events", () => {
  it("keeps WhatsApp and telephone clicks separate", () => {
    expect(contactAnalyticsEvent("whatsapp")).toBe("whatsapp_click");
    expect(contactAnalyticsEvent("phone")).toBe("phone_click");
  });

  it("does not turn email clicks or portal views into contact events", () => {
    expect(contactAnalyticsEvent("email")).toBeNull();
    expect(contactAnalyticsEvent("portal_view")).toBeNull();
  });
});
