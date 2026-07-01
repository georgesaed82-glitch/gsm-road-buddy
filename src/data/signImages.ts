// Mapping from local sign id → official UK Department for Transport sign file
// on Wikimedia Commons. These are Crown Copyright artwork released under the
// Open Government Licence v3.0 (OGL), which permits reuse, including
// commercial, with attribution. Attribution is shown on the road signs page.
//
// URLs use Wikimedia's Special:FilePath endpoint, which 302-redirects to the
// current canonical file location on upload.wikimedia.org.

const BASE = "https://commons.wikimedia.org/wiki/Special:FilePath/";

function url(file: string): string {
  return BASE + encodeURIComponent(file);
}

export const officialSignImages: Record<string, string> = {
  // ── Warning triangles ──────────────────────────────────
  "w-bend-right": url("UK traffic sign 512 (right).svg"),
  "w-bend-left": url("UK traffic sign 512 (left).svg"),
  "w-double-bend": url("UK traffic sign 513 (right).svg"),
  "w-roundabout": url("UK traffic sign 510.svg"),
  "w-crossroads": url("UK traffic sign 504.1 (variant 1).svg"),
  "w-staggered": url("UK traffic sign 507.1 (variant 1, left).svg"),
  "w-t-junction": url("UK traffic sign 505.1 (right).svg"),
  "w-side-road": url("UK traffic sign 506.1 (variant 1, right).svg"),
  "w-hump": url("UK traffic sign 529.svg"),
  "w-slippery": url("UK traffic sign 557.svg"),
  "w-uneven": url("UK traffic sign 557.1.svg"),
  "w-narrows": url("UK traffic sign 517 (left).svg"),
  "w-two-way": url("UK traffic sign 521.svg"),
  "w-school": url("UK traffic sign 545.svg"),
  "w-pedestrians": url("UK traffic sign 544.1.svg"),
  "w-cyclists": url("UK traffic sign 950.svg"),
  "w-horse": url("UK traffic sign 550.1.svg"),
  "w-wild": url("UK traffic sign 551.svg"),
  "w-cattle": url("UK traffic sign 548.svg"),
  "w-elderly": url("UK traffic sign 544.svg"),
  "w-roadworks": url("UK traffic sign 7001.svg"),
  "w-signals": url("UK traffic sign 543.svg"),
  "w-level": url("UK traffic sign 771 (variant 1).svg"),
  "w-lowbridge": url("UK traffic sign 530.1.svg"),
  "w-tunnel": url("UK traffic sign 529.1.svg"),
  "w-quayside": url("UK traffic sign 555.svg"),
  "w-steep-down": url("UK traffic sign 524.1.svg"),
  "w-steep-up": url("UK traffic sign 525.svg"),
  "w-rocks": url("UK traffic sign 559 (left).svg"),
  "w-exclaim": url("UK traffic sign 562.svg"),

  // ── Give way / Stop ────────────────────────────────────
  "p-giveway": url("UK traffic sign 602.svg"),
  "p-stop": url("UK traffic sign 601.1.svg"),

  // ── Prohibition (red circle) ───────────────────────────
  "p-no-entry": url("UK traffic sign 616.svg"),
  "p-no-vehicles": url("UK traffic sign 619.svg"),
  "p-no-hgv": url("UK traffic sign 622.1A.svg"),
  "p-no-bikes": url("UK traffic sign 951.svg"),
  "p-no-peds": url("UK traffic sign 625.1.svg"),
  "p-no-left": url("UK traffic sign 613.svg"),
  "p-no-right": url("UK traffic sign 612.svg"),
  "p-no-uturn": url("UK traffic sign 614.svg"),
  "p-no-overtake": url("UK traffic sign 632.svg"),
  "p-end-overtake": url("UK traffic sign 633.svg"),

  // ── Speed limits ───────────────────────────────────────
  "s-20": url("UK traffic sign 670V20.svg"),
  "s-30": url("UK traffic sign 670V30.svg"),
  "s-40": url("UK traffic sign 670V40.svg"),
  "s-50": url("UK traffic sign 670V50.svg"),
  "s-60": url("UK traffic sign 670V60.svg"),
  "s-70": url("UK traffic sign 670V70.svg"),
  "s-national": url("UK traffic sign 671.svg"),

  // ── Mandatory (blue circle) ────────────────────────────
  "m-ahead": url("UK traffic sign 606 (ahead).svg"),
  "m-turn-left": url("UK traffic sign 609 (left).svg"),
  "m-turn-right": url("UK traffic sign 609 (right).svg"),
  "m-keep-left": url("UK traffic sign 610 (left).svg"),
  "m-keep-right": url("UK traffic sign 610 (right).svg"),
  "m-mini-r": url("UK traffic sign 611.1.svg"),
  "m-bus": url("UK traffic sign 953.svg"),
  "m-cycle": url("UK traffic sign 955.svg"),

  // ── Information (blue rectangle) ───────────────────────
  "i-parking": url("UK traffic sign 801.svg"),
  "i-hospital": url("UK traffic sign 827.2–V1.svg"),

  // ── Pedestrian crossings ───────────────────────────────
  // Warning-triangle style plates used to depict each crossing type.
  "c-zebra": url("UK traffic sign 544.1.svg"),
  "c-crossing-ahead": url("UK traffic sign 544.1.svg"),
  "c-pelican": url("UK traffic sign 544.1.svg"),
  "c-puffin": url("UK traffic sign 544.1.svg"),
  "c-toucan": url("UK traffic sign 544.2.svg"),
  "c-pegasus": url("UK traffic sign 550.1.svg"),
  // ── Traffic light states ───────────────────────────────
  "t-red": url("Traffic_lights_red.svg"),
  "t-red-amber": url("Traffic_lights_red-yellow.svg"),
  "t-amber": url("Traffic_lights_yellow.svg"),
  "t-green": url("Traffic_lights_green.svg"),

  // ── Information (services) ─────────────────────────────
  "i-phone": url("UK traffic sign 2306.svg"),
};

export function officialSignImageFor(id: string): string | undefined {
  return officialSignImages[id];
}