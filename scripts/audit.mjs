import puppeteer from "puppeteer-core";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const OUT = process.argv[2] || ".";
const URL = "http://localhost:3000/";

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox", "--disable-gpu", "--use-gl=swiftshader", "--enable-unsafe-swiftshader"],
});

const page = await browser.newPage();
await page.setViewport({ width: 1536, height: 900, deviceScaleFactor: 1 });

const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message));

await page.goto(URL, { waitUntil: "networkidle0", timeout: 60000 });
// Let the preloader + intro finish.
await new Promise((r) => setTimeout(r, 5000));

const report = await page.evaluate(() => {
  const q = (s) => document.querySelector(s);
  const box = (s) => {
    const el = q(s);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return {
      w: Math.round(r.width),
      h: Math.round(r.height),
      opacity: cs.opacity,
      visibility: cs.visibility,
      display: cs.display,
    };
  };
  return {
    scrollHeight: document.documentElement.scrollHeight,
    bodyOverflowX: document.documentElement.scrollWidth > window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    preloader: box(".preloader"),
    navbar: box(".navbar_wrap"),
    heroDisplay: box(".hero_display"),
    heroCanvas: box(".hero_canvas_wrap"),
    gapWrap: box(".gap_wrap"),
    gapCover: box(".gap_cover"),
    servicesImg: box(".services_img-wrap"),
    stackingCount: document.querySelectorAll("[data-stacking-cards-item]").length,
    splitLines: document.querySelectorAll(".split-line").length,
    splitChars: document.querySelectorAll(".gap_inner_heading div").length,
    canvasHasContext: (() => {
      const c = q("[data-hero-canvas]");
      return c ? c.width + "x" + c.height : "no canvas";
    })(),
  };
});

console.log(JSON.stringify(report, null, 2));
console.log("\n=== CONSOLE ERRORS (" + errors.length + ") ===");
errors.slice(0, 12).forEach((e) => console.log("- " + e.slice(0, 220)));

await page.screenshot({ path: `${OUT}/top.png` });
// Park mid-way through the gap section's 200vh so the scrub is part-resolved.
await page.evaluate(() => {
  const el = document.querySelector(".gap_wrap");
  const top = el.getBoundingClientRect().top + window.scrollY;
  window.scrollTo(0, top + window.innerHeight * 0.9);
});
await new Promise((r) => setTimeout(r, 2500));
await page.screenshot({ path: `${OUT}/gap.png` });


const el = await page.$('.services_wrap');
if (el) { await el.scrollIntoView(); await new Promise(r=>setTimeout(r,1200));
  await page.hover('[data-content-trigger]:nth-of-type(3)').catch(()=>{});
  await new Promise(r=>setTimeout(r,1200));
  await page.screenshot({ path: `${OUT}/services.png` }); }
console.log('servicesImg after:', await page.evaluate(()=>{const e=document.querySelector('.services_img-wrap');const c=getComputedStyle(e);return {op:c.opacity, tf:c.transform};}));
const w = await page.$('#works');
if (w) { await w.scrollIntoView(); await new Promise(r=>setTimeout(r,1500)); await page.screenshot({ path: `${OUT}/works.png` }); }
await browser.close();
