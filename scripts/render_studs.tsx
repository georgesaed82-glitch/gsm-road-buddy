import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { HighwayCodeEssentials } from "/dev-server/src/components/HighwayCodeEssentials";
import * as fs from "node:fs";

const html = renderToStaticMarkup(createElement(HighwayCodeEssentials));
// Extract the studs SVG (first svg containing the aria-label)
const m = html.match(/<svg[^>]*aria-label="Bird[^"]*"[^>]*>[\s\S]*?<\/svg>/);
if (!m) { console.error("not found"); process.exit(1); }
const svg = m[0].replace(/<svg /, '<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" ').replace(/class="[^"]*"/, "");
fs.writeFileSync("/tmp/studs.svg", `<?xml version="1.0"?>\n${svg}`);
console.log("ok");
