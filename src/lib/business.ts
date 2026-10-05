/**
 * Single source of truth for GSM's public business facts.
 * Used by the site defaults, Google structured data and the /llms.txt summary.
 * Admin-saved settings may override contact details at runtime.
 */
export const BUSINESS = {
  name: "GSM Driving School",
  legalName: "George's School of Motoring",
  foundingYear: 2005,
  tagline: "George's School of Motoring · Established 2005",
  phone: "07961 585231",
  phoneIntl: "447961585231",
  email: "gsmdrivingschool@outlook.com",
  street: "71 Sandbourne House, Dartmouth Close",
  locality: "London",
  postcode: "W11 1DS",
  url: "https://www.gsmdrivingschool.com",
  geo: { latitude: 51.5121, longitude: -0.2098 },
  /** Confirmed public profiles only. */
  sameAs: [
    "https://www.youtube.com/@GSMDrivingSchool",
    "https://www.instagram.com/gsm_driving_school_",
    "https://www.facebook.com/share/1HySrwY5AA/?mibextid=wwXIfr",
    "https://maps.google.com/?cid=12315071950298926858",
  ],
} as const;

export const BUSINESS_ADDRESS = `${BUSINESS.street}, ${BUSINESS.locality} ${BUSINESS.postcode}`;

export function yearsTeaching(now = new Date()) {
  return now.getFullYear() - BUSINESS.foundingYear;
}

/** Lesson hours (enquiries by message are welcome any time). */
export const LESSON_HOURS = [
  { days: ["Monday", "Friday"], label: "Mon & Fri", opens: "07:00", closes: "20:00" },
  { days: ["Tuesday", "Wednesday"], label: "Tue & Wed", opens: "07:00", closes: "21:00" },
  { days: ["Thursday"], label: "Thu", opens: "07:00", closes: "20:30" },
  { days: ["Saturday"], label: "Sat", opens: "07:00", closes: "18:00" },
] as const;

export const LESSON_HOURS_TEXT =
  "Mon & Fri 7am–8pm, Tue & Wed 7am–9pm, Thu 7am–8:30pm, Sat 7am–6pm, Sun closed";

export const OPENING_HOURS_BY_DAY = {
  mon: "7:00 – 20:00",
  tue: "7:00 – 21:00",
  wed: "7:00 – 21:00",
  thu: "7:00 – 20:30",
  fri: "7:00 – 20:00",
  sat: "7:00 – 18:00",
  sun: "Closed",
} as const;
