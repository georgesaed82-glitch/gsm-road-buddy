import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { roadMarkings } from "../src/data/roadMarkings";
import * as fs from "node:fs";
import * as path from "node:path";

const OUT = "/mnt/documents/gsm-road-markings";
fs.mkdirSync(OUT, { recursive: true });

const files: string[] = [];
for (const m of roadMarkings) {
  const html = renderToStaticMarkup(createElement(m.Visual));
  const svg = html
    .replace(/^<svg /, '<svg xmlns="http://www.w3.org/2000/svg" width="2048" height="2048" ')
    .replace(/class="[^"]*"/, "");
  const safe = m.id.replace(/[^a-z0-9-]/gi, "_");
  const file = path.join(
    OUT,
    `${safe}__${m.name
      .replace(/[^a-z0-9]+/gi, "-")
      .toLowerCase()
      .replace(/^-|-$/g, "")}.svg`,
  );
  fs.writeFileSync(file, `<?xml version="1.0" encoding="UTF-8"?>\n${svg}\n`);
  files.push(file);
}
console.log("Wrote", files.length, "SVGs to", OUT);
