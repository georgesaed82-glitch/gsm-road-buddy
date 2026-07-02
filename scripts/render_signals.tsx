import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { policeSignals } from "../src/data/policeSignals";
import * as fs from "node:fs";
import * as path from "node:path";

const OUT = "/mnt/documents/gsm-hand-signals";
fs.mkdirSync(OUT, { recursive: true });

for (const s of policeSignals) {
  const html = renderToStaticMarkup(createElement(s.Visual));
  const svg = html
    .replace(/^<svg /, '<svg xmlns="http://www.w3.org/2000/svg" width="2048" height="2048" ')
    .replace(/class="[^"]*"/, "");
  const safe = s.id.replace(/[^a-z0-9-]/gi, "_");
  fs.writeFileSync(path.join(OUT, `${safe}.svg`), `<?xml version="1.0" encoding="UTF-8"?>\n${svg}\n`);
}
console.log("done");
