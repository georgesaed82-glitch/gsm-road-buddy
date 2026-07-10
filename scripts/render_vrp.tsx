import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { DriverView, TopView, CombinedView } from "/dev-server/src/components/vehicle-ref/ParkingNextToVehicles";
import * as fs from "node:fs";
const wrap = (el:any, w:number, h:number) => {
  const html = renderToStaticMarkup(el);
  return html.replace(/^<svg /, `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" `).replace(/class="[^"]*"/,'');
};
fs.writeFileSync("/tmp/browser/vrp/driver.svg", wrap(createElement(DriverView,{showRef:true}), 1600, 900));
fs.writeFileSync("/tmp/browser/vrp/top.svg", wrap(createElement(TopView,{showRef:true}), 1600, 900));
fs.writeFileSync("/tmp/browser/vrp/combined.svg", wrap(createElement(CombinedView as any,{}), 1600, 1800));
console.log("wrote 3 SVGs");
