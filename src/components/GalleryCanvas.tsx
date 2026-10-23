"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { RightArrow } from "@/components/Arrows";
import { gsap, CustomEase } from "@/lib/gsap";
import { usePageReady } from "@/components/PageTransition";
import { usePrintRequest } from "@/components/PrintRequest";
import type { Frame, Gallery } from "@/lib/photography";

/**
 * Gallery canvas — a port of gunespeksen.com's index, method for method.
 *
 * The frames are laid on a grid of `cols × rows` cells (each frame sized on a
 * base edge by its aspect ratio and centred in its cell), and that tile is
 * repeated 3×3 on one canvas. The canvas is translated by drag or wheel and,
 * whenever it leaves the middle tile, shifted by one tile width — which makes
 * the field endless. Motion is a target/render pair: the target takes the
 * pointer (or the fling velocity, damped 0.96/frame), the render eases toward
 * it by 0.13/frame.
 *
 * A click (without a drag) puts the viewport in `.expanding` — every other
 * tile collapses — and flies a hero copy of the frame from its tile to the
 * centre, where the viewer's card takes over. The viewer is a card stack:
 * wheel, keys or a swipe move to the next/previous frame; closing flies the
 * hero back to that frame's nearest tile.
 */
export function GalleryCanvas({
  gallery,
  next,
  prev,
}: {
  gallery: Gallery;
  next: Gallery;
  prev: Gallery;
}) {
  const root = useRef<HTMLDivElement>(null);
  const vp = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLDivElement>(null);
  const lg = useRef<HTMLDivElement>(null);
  const stack = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  /* The same readout as `count`, shown in the viewer's own top bar. */
  const barCount = useRef<HTMLSpanElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  /* The frame open in the viewer, mirrored out of the effect below so the
   * "Request a print" toggle can follow it. Deliberately not reset on close:
   * the bar fades out as a whole, and emptying the button mid-fade would make
   * its chrome jump. The next open overwrites it before the bar returns. */
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const prints = usePrintRequest();

  // The entrance waits for the page to be on show (preloader / route curtain).
  const ready = usePageReady();
  const readyRef = useRef(ready);
  const start = useRef<(() => void) | null>(null);
  useEffect(() => {
    readyRef.current = ready;
    if (ready) start.current?.();
  }, [ready]);

  useEffect(() => {
    const rootEl = root.current;
    const vpEl = vp.current;
    const cvEl = cv.current;
    const lgEl = lg.current;
    const stackEl = stack.current;
    const countEl = count.current;
    const barCountEl = barCount.current;
    const closeEl = closeBtn.current;
    if (!rootEl || !vpEl || !cvEl || !lgEl || !stackEl || !countEl) return;

    if (!CustomEase.get("heroEase")) CustomEase.create("heroEase", "0.86,0,0.07,1");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const P = gallery.frames;
    const n = P.length;
    const mob = () => window.innerWidth <= 768;
    const pad = (v: number) => String(v).padStart(3, "0");

    /* The scroll hint, using the site's own arrow glyph (`RightArrow` from
     * Arrows.tsx) rotated to point down and up, rather than the ∨ ∧ text
     * characters — those render differently on every platform. Built as markup
     * because the counter is driven by textContent/innerHTML, not React. */
    const ARROW_PATH =
      "M6.304 0L13 6.5L6.304 13L4.96 11.672L9.328 7.4552L0 7.4552L0 5.5448L9.328 5.5448L4.96 1.30466L6.304 0Z";
    const arrowSvg = (rotate: number) =>
      `<svg viewBox="0 0 13 13" width="9" height="9" fill="none" aria-hidden="true" ` +
      `style="display:inline-block;vertical-align:middle;transform:rotate(${rotate}deg)">` +
      `<path d="${ARROW_PATH}" fill="currentColor"/></svg>`;
    const SCROLL_HINT =
      `<span style="display:inline-flex;align-items:center;gap:0.35em">` +
      `Scroll ${arrowSvg(90)}${arrowSvg(-90)}</span>`;

    // The page never scrolls; the canvas is the only thing that moves.
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    /* ── Grid ─────────────────────────────────────────────────────── */
    const getCfg = () => {
      const w = window.innerWidth;
      // `gap` is the air between frames, and it scales with the breakpoint so
      // the field reads equally open at every width. The tile repeats 3x3, so
      // the gap also sets the rhythm across the seam between repeats.
      const c =
        w <= 480
          ? { base: 138, gap: 28, cols: 4, rows: 12 }
          : w <= 768
            ? { base: 177, gap: 40, cols: 4, rows: 10 }
            : w <= 1024
              ? { base: 195, gap: 58, cols: 5, rows: 8 }
              : { base: 235, gap: 80, cols: 6, rows: 6 };
      // Cap rows so no frame appears twice within one tile.
      c.rows = Math.min(c.rows, Math.ceil(n / c.cols));
      return c;
    };
    // Frame box on a base edge: portrait keeps `base` wide, landscape `base` tall.
    const dm = (f: Frame, b: number): [number, number] => {
      const ar = gsap.utils.clamp(9 / 16, 16 / 9, f.width / f.height);
      return ar >= 1 ? [Math.round(b * ar), b] : [b, Math.round(b / ar)];
    };

    let TW = 0;
    let TH = 0;
    let items: HTMLElement[] = [];
    let offX = 0;
    let offY = 0;
    let renX = 0;
    let renY = 0;
    let velX = 0;
    let velY = 0;
    let mode: "loading" | "gallery" | "large" = "loading";
    let rafId = 0;

    const build = () => {
      cvEl.innerHTML = "";
      items = [];
      const { base, gap, cols, rows } = getCfg();
      const cells: { r: number; c: number; pi: number; w: number; h: number }[] = [];
      let pi = 0;
      for (let r = 0; r < rows; r++)
        for (let cl = 0; cl < cols; cl++) {
          const idx = pi % n;
          const [w, h] = dm(P[idx], base);
          cells.push({ r, c: cl, pi: idx, w, h });
          pi++;
        }
      const cw = Array(cols).fill(0) as number[];
      const rh = Array(rows).fill(0) as number[];
      cells.forEach((e) => {
        cw[e.c] = Math.max(cw[e.c], e.w);
        rh[e.r] = Math.max(rh[e.r], e.h);
      });
      const cx = [0];
      for (let i = 1; i < cols; i++) cx[i] = cx[i - 1] + cw[i - 1] + gap;
      const ry = [0];
      for (let i = 1; i < rows; i++) ry[i] = ry[i - 1] + rh[i - 1] + gap;
      TW = cx[cols - 1] + cw[cols - 1] + gap;
      TH = ry[rows - 1] + rh[rows - 1] + gap;
      cvEl.style.width = `${TW * 3}px`;
      cvEl.style.height = `${TH * 3}px`;

      for (let tr = 0; tr < 3; tr++)
        for (let tc = 0; tc < 3; tc++)
          cells.forEach((ce) => {
            const f = P[ce.pi];
            const x = tc * TW + cx[ce.c] + (cw[ce.c] - ce.w) / 2;
            const y = tr * TH + ry[ce.r] + (rh[ce.r] - ce.h) / 2;
            const el = document.createElement("div");
            el.className = "pg-it";
            el.style.cssText = `left:${x}px;top:${y}px;width:${ce.w}px;height:${ce.h}px`;
            const img = new Image();
            img.loading = tr === 1 && tc === 1 ? "eager" : "lazy";
            img.decoding = "async";
            img.src = f.thumb;
            img.alt = "";
            el.appendChild(img);
            el.dataset.pi = String(ce.pi);
            cvEl.appendChild(el);
            items.push(el);
          });

      // Open on the first frame, centred, in the middle tile. The entrance
      // drifts 16px/frame at 0.96 damping = 400px per axis, so start that far
      // back and let the drift land it on centre.
      const cc = 0;
      const cr = 0;
      let sx = window.innerWidth / 2 - TW - cx[cc] - cw[cc] / 2 - 400;
      let sy = window.innerHeight / 2 - TH - ry[cr] - rh[cr] / 2 - 400;
      while (sx < -2 * TW) sx += TW;
      while (sx > 0) sx -= TW;
      while (sy < -2 * TH) sy += TH;
      while (sy > 0) sy -= TH;
      offX = renX = sx;
      offY = renY = sy;
      cvEl.style.transform = `translate3d(${renX | 0}px,${renY | 0}px,0)`;
    };

    /* ── Render loop ──────────────────────────────────────────────── */
    let isDrag = false;
    let snpX = 0;
    let snpY = 0;
    const loop = () => {
      if (mode === "gallery") {
        if (!isDrag) {
          offX += velX;
          offY += velY;
          velX *= 0.96;
          velY *= 0.96;
          if (Math.abs(velX) < 0.05) velX = 0;
          if (Math.abs(velY) < 0.05) velY = 0;
        }
        renX += (offX - renX) * 0.13;
        renY += (offY - renY) * 0.13;
        // Keep the render inside the middle tile; every tile is identical.
        if (offX > 0) { offX -= TW; renX -= TW; if (isDrag) snpX -= TW; }
        if (offX < -2 * TW) { offX += TW; renX += TW; if (isDrag) snpX += TW; }
        if (offY > 0) { offY -= TH; renY -= TH; if (isDrag) snpY -= TH; }
        if (offY < -2 * TH) { offY += TH; renY += TH; if (isDrag) snpY += TH; }
        cvEl.style.transform = `translate3d(${renX | 0}px,${renY | 0}px,0)`;
      }
      rafId = requestAnimationFrame(loop);
    };

    /* ── Drag ─────────────────────────────────────────────────────── */
    let hasMoved = false;
    let ancX = 0;
    let ancY = 0;
    let pressTimer = 0;
    const vBuf: { x: number; y: number; t: number }[] = [];

    const onDown = (e: PointerEvent) => {
      if (mode !== "gallery") return;
      if ((e.target as Element).closest(".pg-lg,.pg-nav,.pg-sides,.pg-hud,header")) return;
      isDrag = true;
      hasMoved = false;
      ancX = e.clientX;
      ancY = e.clientY;
      snpX = offX;
      snpY = offY;
      velX = velY = 0;
      vBuf.length = 0;
      pressTimer = window.setTimeout(() => {
        if (!mob()) vpEl.classList.add("is-pressed");
      }, 150);
      items.forEach((el) => el.classList.remove("hov"));
      document.body.classList.add("pg-dragging");
    };
    const onMove = (e: PointerEvent) => {
      if (!isDrag) return;
      if (Math.abs(e.clientX - ancX) > 3 || Math.abs(e.clientY - ancY) > 3) hasMoved = true;
      offX = snpX + (e.clientX - ancX);
      offY = snpY + (e.clientY - ancY);
      const now = performance.now();
      vBuf.push({ x: e.clientX, y: e.clientY, t: now });
      while (vBuf.length > 1 && now - vBuf[0].t > 80) vBuf.shift();
    };
    const onUp = () => {
      if (!isDrag) return;
      isDrag = false;
      window.clearTimeout(pressTimer);
      vpEl.classList.remove("is-pressed");
      document.body.classList.remove("pg-dragging");
      if (vBuf.length >= 2) {
        const a = vBuf[0];
        const b = vBuf[vBuf.length - 1];
        const dt = b.t - a.t;
        if (dt > 5 && dt < 150) {
          velX = gsap.utils.clamp(-12, 12, ((b.x - a.x) / dt) * 8);
          velY = gsap.utils.clamp(-12, 12, ((b.y - a.y) / dt) * 8);
        }
      }
      vBuf.length = 0;
      window.setTimeout(() => {
        if (!isDrag && mode === "gallery") items.forEach((el) => el.classList.add("hov"));
      }, 60);
    };
    const onWheel = (e: WheelEvent) => {
      if (mode !== "gallery") return;
      e.preventDefault();
      offX -= e.deltaX * 0.6;
      offY -= e.deltaY * 0.6;
    };

    /* ── Viewer ───────────────────────────────────────────────────── */
    let lgIdx = 0;
    let lgBusy = false;
    let heroEl: HTMLElement | null = null;
    let hintTimer = 0;
    let closing = false;

    const cardDims = (idx: number) => {
      const ar = P[idx].width / P[idx].height;
      const maxW = mob() ? window.innerWidth * 0.88 : Math.min(window.innerWidth * 0.48, 820);
      const maxH = window.innerHeight * 0.78;
      let w: number;
      let h: number;
      if (ar >= 1) { w = Math.min(maxW, maxH * ar); h = w / ar; }
      else { h = Math.min(maxH, maxW / ar); w = h * ar; }
      if (w > maxW) { h *= maxW / w; w = maxW; }
      if (h > maxH) { w *= maxH / h; h = maxH; }
      return { w: Math.round(w), h: Math.round(h) };
    };

    const makeCard = (idx: number, cls: string) => {
      const f = P[idx];
      const d = cardDims(idx);
      const el = document.createElement("div");
      el.className = `pg-lg-card ${cls}`;
      el.style.width = `${d.w}px`;
      el.style.height = `${d.h}px`;
      // The tile's thumbnail shows underneath until the large copy has loaded.
      el.style.backgroundImage = `url('${f.thumb}')`;
      const img = new Image();
      img.src = f.src;
      img.srcset = `${f.src} 1200w, ${f.full} 2400w`;
      /*
       * `sizes` is the width the image will *occupy*, and the browser picks
       * from the srcset against it. At rest that is the card's own width, but
       * zooming magnifies the same element — so this is re-stated at the zoomed
       * width in `applyZoomRes` below, which is what promotes the 2400w copy.
       */
      img.dataset.baseWidth = String(d.w);
      img.sizes = `${d.w}px`;
      img.alt = "";
      img.style.opacity = "0";
      img.style.transition = "opacity .4s ease";
      const show = () => requestAnimationFrame(() => (img.style.opacity = "1"));
      if (img.complete) show();
      else img.addEventListener("load", show, { once: true });
      el.appendChild(img);
      return el;
    };

    const setCount = (animate: boolean, dir: number) => {
      const text = `${pad(lgIdx + 1)} / ${pad(n)}`;
      if (!animate || reduced) {
        gsap.killTweensOf(countEl);
        gsap.set(countEl, { clearProps: "all" });
        countEl.textContent = text;
        if (barCountEl) barCountEl.textContent = text;
        return;
      }
      gsap.to(countEl, {
        yPercent: dir > 0 ? -110 : 110,
        opacity: 0,
        duration: 0.28,
        ease: "power2.in",
        overwrite: true,
        onComplete: () => {
          countEl.textContent = text;
          if (barCountEl) barCountEl.textContent = text;
          gsap.fromTo(
            countEl,
            { yPercent: dir > 0 ? 110 : -110, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 0.3, ease: "power2.out" },
          );
        },
      });
    };

    const openLarge = (idx: number, clicked: HTMLElement) => {
      mode = "large";
      lgIdx = idx;
      setOpenIdx(idx);
      stackEl.innerHTML = "";
      rootEl.dataset.mode = "large";
      // The header sits in the root layout, outside .pg-root, so the open
      // viewer signals itself on the body for the CSS there to react to.
      document.body.classList.add("pg-viewing");
      setCount(false, 0);
      // After the hero lands, swap the count for a scroll hint for a moment.
      window.clearTimeout(hintTimer);
      hintTimer = window.setTimeout(() => {
        if (mode !== "large" || reduced) return;
        const back = `${pad(lgIdx + 1)} / ${pad(n)}`;
        gsap.to(countEl, {
          yPercent: -110, opacity: 0, duration: 0.28, ease: "power2.in",
          onComplete: () => {
            countEl.innerHTML = SCROLL_HINT;
            gsap.fromTo(countEl, { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.3, ease: "power2.out" });
            hintTimer = window.setTimeout(() => {
              if (mode !== "large") return;
              gsap.to(countEl, {
                yPercent: -110, opacity: 0, duration: 0.28, ease: "power2.in",
                onComplete: () => {
                  countEl.textContent = back;
                  gsap.fromTo(countEl, { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.3, ease: "power2.out" });
                },
              });
            }, 2500);
          },
        });
      }, 2800);

      lgEl.classList.add("on");
      const d = cardDims(idx);
      const rect = clicked.getBoundingClientRect();
      const tL = (window.innerWidth - d.w) / 2;
      const tT = (window.innerHeight - d.h) / 2;
      // Hero sits at the card's final place, transformed to look like the tile.
      const scX = rect.width / d.w;
      const scY = rect.height / d.h;
      const tx = rect.left + rect.width / 2 - (tL + d.w / 2);
      const ty = rect.top + rect.height / 2 - (tT + d.h / 2);
      heroEl = document.createElement("div");
      heroEl.className = "pg-hero";
      heroEl.style.cssText = `left:${tL}px;top:${tT}px;width:${d.w}px;height:${d.h}px;transform:translate(${tx}px,${ty}px) scale(${scX},${scY})`;
      const img = new Image();
      img.src = P[idx].thumb;
      img.alt = "";
      heroEl.appendChild(img);
      document.body.appendChild(heroEl);

      const card = makeCard(idx, "cur");
      card.style.opacity = "0";
      stackEl.appendChild(card);
      const hero = heroEl;
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          gsap.to(hero, {
            x: 0, y: 0, scaleX: 1, scaleY: 1,
            duration: reduced ? 0 : 0.62,
            ease: "heroEase",
            onComplete: () => {
              card.style.transition = "none";
              card.style.opacity = "1";
              requestAnimationFrame(() => {
                hero.style.transition = "opacity .2s linear";
                hero.style.opacity = "0";
                window.setTimeout(() => {
                  if (heroEl === hero) heroEl = null;
                  hero.remove();
                  card.style.opacity = "";
                  card.style.transition = "";
                }, 210);
              });
            },
          });
        }),
      );
    };

    /* ── Zoom ─────────────────────────────────────────────────────
     * The open frame can be magnified: pinch on touch, ctrl/⌘ + wheel (which
     * is also what a trackpad pinch sends) on the desktop, and a double
     * click/tap either way. While zoomed, a drag pans instead of navigating,
     * and the card's own transition is suspended so the gesture tracks the
     * finger rather than easing behind it.
     */
    const ZOOM_MIN = 1;
    const ZOOM_MAX = 4;
    /* How long after a tap a second one still counts as a double. */
    const TAP_GAP = 300;
    let zoom = 1;
    let panX = 0;
    let panY = 0;
    /* Timestamp of the last touch tap, for the double-tap pairing below. */
    let lastTap = 0;

    const zoomed = () => zoom > 1.01;

    /* The pan is clamped so the frame can never be dragged off its own edges. */
    const clampPan = () => {
      const card = stackEl.querySelector<HTMLElement>(".pg-lg-card.cur");
      if (!card) return;
      const maxX = (card.offsetWidth * (zoom - 1)) / 2;
      const maxY = (card.offsetHeight * (zoom - 1)) / 2;
      panX = gsap.utils.clamp(-maxX, maxX, panX);
      panY = gsap.utils.clamp(-maxY, maxY, panY);
    };

    /*
     * Ask for a sharper source as the frame grows.
     *
     * The card's `sizes` is its layout width, so at rest a phone asks for a
     * few hundred CSS pixels and the browser is right to hand back the 1200w
     * copy. Zoomed, the same element is magnified rather than resized, so that
     * hint is now wrong and the picture is simply scaled up — soft. Re-stating
     * `sizes` at the zoomed width makes the browser re-run its selection and
     * fetch the 2400w copy; it keeps showing the one it has until the larger
     * arrives, so there is no flash.
     *
     * Only ever raised, never lowered: dropping back on zoom-out would discard
     * a file already in cache and re-fetch it on the next zoom.
     */
    let resAt = 1;
    const applyZoomRes = () => {
      if (zoom <= resAt) return;
      resAt = zoom;
      const img = stackEl.querySelector<HTMLImageElement>(".pg-lg-card.cur img");
      const base = Number(img?.dataset.baseWidth || 0);
      if (!img || !base) return;
      img.sizes = `${Math.round(base * zoom)}px`;
    };

    const drawZoom = (animate = false) => {
      const card = stackEl.querySelector<HTMLElement>(".pg-lg-card.cur");
      if (!card) return;
      clampPan();
      rootEl.classList.toggle("is-zoomed", zoomed());
      const to = {
        x: panX,
        y: panY,
        scale: zoom,
        xPercent: -50,
        yPercent: -50,
        overwrite: true as const,
      };
      if (animate && !reduced) gsap.to(card, { ...to, duration: 0.35, ease: "power2.out" });
      else gsap.set(card, to);
    };

    /* Back to 1x — on close, on navigating to another frame, and on a second
     * double-tap. Clears the inline transform so the CSS classes drive the
     * card again. */
    const resetZoom = (animate = false) => {
      const card = stackEl.querySelector<HTMLElement>(".pg-lg-card.cur");
      zoom = 1;
      panX = panY = 0;
      resAt = 1;
      // Drop any half-finished double tap, so a tap after a swipe or a close
      // never pairs with one from before.
      lastTap = 0;
      rootEl.classList.remove("is-zoomed");
      if (!card) return;
      if (animate && !reduced) {
        gsap.to(card, {
          x: 0, y: 0, scale: 1, xPercent: -50, yPercent: -50,
          duration: 0.35, ease: "power2.out",
          onComplete: () => gsap.set(card, { clearProps: "transform" }),
        });
      } else {
        gsap.set(card, { clearProps: "transform" });
      }
    };

    /* Zoom about a point, so the pixel under the cursor or the pinch centre
     * stays put rather than the image growing from its middle. */
    const zoomAt = (next: number, cx: number, cy: number, animate = false) => {
      const card = stackEl.querySelector<HTMLElement>(".pg-lg-card.cur");
      if (!card) return;
      const prev = zoom;
      zoom = gsap.utils.clamp(ZOOM_MIN, ZOOM_MAX, next);
      if (Math.abs(zoom - prev) < 0.0001) return;
      const r = card.getBoundingClientRect();
      // Offset of the anchor point from the card's centre, in unscaled units.
      const ox = cx - (r.left + r.width / 2);
      const oy = cy - (r.top + r.height / 2);
      const k = zoom / prev;
      panX = panX * k - ox * (k - 1);
      panY = panY * k - oy * (k - 1);
      if (zoom <= ZOOM_MIN + 0.01) resetZoom(animate);
      else {
        applyZoomRes();
        drawZoom(animate);
      }
    };

    const navLg = (dir: number) => {
      if (lgBusy || mode !== "large") return;
      // The next card arrives at 1x; leaving the old one scaled would carry
      // the transform over to it.
      resetZoom();
      lgBusy = true;
      window.clearTimeout(hintTimer);
      const cur = stackEl.querySelector<HTMLElement>(".pg-lg-card.cur");
      let nc: HTMLElement;
      if (dir > 0) {
        cur?.classList.replace("cur", "prev");
        lgIdx = (lgIdx + 1) % n;
        nc = makeCard(lgIdx, "entering");
        stackEl.appendChild(nc);
        requestAnimationFrame(() => requestAnimationFrame(() => nc.classList.replace("entering", "cur")));
      } else {
        const pi = (lgIdx - 1 + n) % n;
        cur?.classList.replace("cur", "entering");
        nc = makeCard(pi, "prev");
        stackEl.appendChild(nc);
        requestAnimationFrame(() => requestAnimationFrame(() => nc.classList.replace("prev", "cur")));
        lgIdx = pi;
      }
      setOpenIdx(lgIdx);
      setCount(true, dir);
      window.setTimeout(() => {
        stackEl.querySelectorAll(".pg-lg-card.prev,.pg-lg-card.entering").forEach((c) => {
          if (!c.classList.contains("cur")) c.remove();
        });
        lgBusy = false;
      }, 660);
    };

    const closeLarge = () => {
      if (closing || mode !== "large") return;
      closing = true;
      // The card flies back to its tile from 1x; a live zoom transform would
      // fight the flight.
      resetZoom();
      window.clearTimeout(hintTimer);
      if (heroEl) { gsap.killTweensOf(heroEl); heroEl.remove(); heroEl = null; }
      gsap.killTweensOf(countEl);
      gsap.set(countEl, { clearProps: "all" });

      // Fly the hero back to this frame's tile nearest the centre.
      const target = items
        .filter((el) => Number(el.dataset.pi) === lgIdx)
        .map((el) => {
          const r = el.getBoundingClientRect();
          const dist = Math.hypot(r.left + r.width / 2 - window.innerWidth / 2, r.top + r.height / 2 - window.innerHeight / 2);
          return { el, dist };
        })
        .sort((a, b) => a.dist - b.dist)[0]?.el;

      let heroDuration = 0;
      if (target) {
        const d = cardDims(lgIdx);
        const tL = (window.innerWidth - d.w) / 2;
        const tT = (window.innerHeight - d.h) / 2;
        const tr = target.getBoundingClientRect();
        const maxDist = Math.hypot(window.innerWidth / 2, window.innerHeight / 2);
        const dist = Math.hypot(tr.left + tr.width / 2 - window.innerWidth / 2, tr.top + tr.height / 2 - window.innerHeight / 2);
        heroDuration = reduced ? 0 : Math.max(0.45, Math.min(1, 0.4 + (dist / maxDist) * 0.6));
        // The tile is measured collapsed (scale .18) unless it is the active one.
        const s = target.classList.contains("active") ? 1 : 0.18;
        const natW = tr.width / s;
        const natH = tr.height / s;
        const natL = tr.left - (tr.width * (1 - s)) / (2 * s);
        const natT = tr.top - (tr.height * (1 - s)) / (2 * s);
        target.style.setProperty("opacity", "0", "important");
        const hero = document.createElement("div");
        hero.className = "pg-hero";
        hero.style.cssText = `left:${tL}px;top:${tT}px;width:${d.w}px;height:${d.h}px`;
        const img = new Image();
        img.src = P[lgIdx].thumb;
        img.alt = "";
        hero.appendChild(img);
        document.body.appendChild(hero);
        heroEl = hero;
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            gsap.to(hero, {
              x: natL + natW / 2 - (tL + d.w / 2),
              y: natT + natH / 2 - (tT + d.h / 2),
              scaleX: natW / d.w,
              scaleY: natH / d.h,
              duration: heroDuration,
              ease: "heroEase",
              onComplete: () => {
                target.style.setProperty("transition", "none", "important");
                target.style.removeProperty("opacity");
                hero.style.transition = "opacity .3s ease";
                hero.style.opacity = "0";
                window.setTimeout(() => {
                  if (heroEl === hero) heroEl = null;
                  hero.remove();
                }, 320);
              },
            });
          }),
        );
      }

      lgEl.classList.remove("on");
      rootEl.dataset.mode = "gallery";
      document.body.classList.remove("pg-viewing");
      vpEl.classList.add("collapsing");
      const cleanup = heroDuration > 0 ? Math.max(900, Math.round(heroDuration * 1000) + 400) : 650;
      window.setTimeout(() => {
        vpEl.classList.remove("expanding", "collapsing");
        items.forEach((el) => {
          el.classList.remove("active");
          el.style.removeProperty("transition");
        });
        stackEl.innerHTML = "";
        mode = "gallery";
        closing = false;
      }, cleanup);
    };

    const onClick = (e: MouseEvent) => {
      if (hasMoved || mode !== "gallery") return;
      const it = (e.target as Element).closest<HTMLElement>(".pg-it");
      if (!it || it.dataset.pi == null) return;
      items.forEach((el) => el.classList.remove("hov"));
      it.classList.add("active");
      vpEl.classList.add("expanding");
      window.setTimeout(() => openLarge(Number(it.dataset.pi), it), 100);
    };

    let sAcc = 0;
    const onLgWheel = (e: WheelEvent) => {
      if (mode !== "large" || lgBusy) return;
      e.preventDefault();
      e.stopPropagation();
      // ctrl/⌘ + wheel is the zoom gesture, and it is also what a trackpad
      // pinch sends — so this is the desktop pinch.
      if (e.ctrlKey || e.metaKey) {
        zoomAt(zoom * Math.exp(-e.deltaY / 220), e.clientX, e.clientY);
        return;
      }
      // Zoomed in, a plain wheel pans the frame rather than changing it.
      if (zoomed()) {
        panX -= e.deltaX;
        panY -= e.deltaY;
        drawZoom();
        return;
      }
      sAcc += e.deltaY;
      if (Math.abs(sAcc) > 50) { navLg(sAcc > 0 ? 1 : -1); sAcc = 0; }
    };

    /*
     * Zoom interaction, one model for both platforms.
     *
     * A tap or click on the image toggles zoom: in at 2x about the point
     * pressed, out again on the next tap. While zoomed a drag pans, and a
     * press that moves more than a few pixels is treated as that drag rather
     * than a tap — so panning never toggles the zoom off on release.
     *
     * Pointer events cover mouse, pen and touch alike, so the tap/drag path is
     * shared. Touch adds pinch on top, which needs the raw touch events for
     * their multi-finger list.
     */
    const TAP_SLOP = 6;
    /* Declared ahead of the handlers below: the pointer path checks `pinching`
     * to stand aside during a two-finger gesture, and the touch path clears
     * `ptrDown` when one begins, so the two sets share this state. */
    let touchX = 0;
    let touchY = 0;
    let touching = false;
    let pinchDist = 0;
    let pinching = false;
    let ptrDown = false;
    let ptrMoved = false;
    let ptrId = -1;
    let lastX = 0;
    let lastY = 0;
    let downX = 0;
    let downY = 0;

    const onLgPointerDown = (e: PointerEvent) => {
      if (mode !== "large" || pinching) return;
      // Only the image itself is a zoom target; the backdrop still closes.
      if (!(e.target as Element).closest(".pg-lg-card")) return;
      ptrDown = true;
      ptrMoved = false;
      ptrId = e.pointerId;
      downX = lastX = e.clientX;
      downY = lastY = e.clientY;
    };

    const onLgPointerMove = (e: PointerEvent) => {
      if (!ptrDown || e.pointerId !== ptrId || pinching) return;
      if (Math.abs(e.clientX - downX) > TAP_SLOP || Math.abs(e.clientY - downY) > TAP_SLOP) {
        ptrMoved = true;
      }
      if (!zoomed()) return;
      e.preventDefault();
      panX += e.clientX - lastX;
      panY += e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      drawZoom();
    };

    const onLgPointerUp = (e: PointerEvent) => {
      if (!ptrDown || e.pointerId !== ptrId) return;
      ptrDown = false;
      ptrId = -1;
      if (pinching || ptrMoved) return;

      /*
       * Touch takes two taps, a mouse one.
       *
       * On a phone a single tap is how you dismiss or swipe the frame, and a
       * finger lands imprecisely — toggling zoom on every stray tap makes the
       * viewer feel twitchy, so touch uses the conventional double tap. A
       * click is deliberate, so the desktop keeps its single click.
       */
      if (e.pointerType === "touch") {
        const now = performance.now();
        if (now - lastTap < TAP_GAP) {
          lastTap = 0;
          if (zoomed()) resetZoom(true);
          else zoomAt(2, e.clientX, e.clientY, true);
        } else {
          lastTap = now;
        }
        return;
      }

      if (zoomed()) resetZoom(true);
      else zoomAt(2, e.clientX, e.clientY, true);
    };

    const spanOf = (t: TouchList) => {
      const dx = t[0].clientX - t[1].clientX;
      const dy = t[0].clientY - t[1].clientY;
      return Math.hypot(dx, dy);
    };
    const midOf = (t: TouchList) => ({
      x: (t[0].clientX + t[1].clientX) / 2,
      y: (t[0].clientY + t[1].clientY) / 2,
    });

    const onTouchStart = (e: TouchEvent) => {
      if (mode !== "large") return;
      if (e.touches.length === 2) {
        pinching = true;
        touching = false;
        ptrDown = false;
        pinchDist = spanOf(e.touches);
        return;
      }
      touchX = e.touches[0].clientX;
      touchY = e.touches[0].clientY;
      touching = true;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (mode !== "large") return;
      if (pinching && e.touches.length === 2) {
        e.preventDefault();
        const span = spanOf(e.touches);
        if (pinchDist > 0) {
          const m = midOf(e.touches);
          zoomAt(zoom * (span / pinchDist), m.x, m.y);
        }
        pinchDist = span;
        return;
      }
      // Zoomed, the pan is driven by the pointer handler; just keep the
      // browser from scrolling underneath it.
      if (zoomed()) {
        e.preventDefault();
        return;
      }
      if (touching) e.preventDefault();
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (pinching) {
        // Wait for both fingers to lift before a swipe counts again.
        if (e.touches.length === 0) {
          pinching = false;
          pinchDist = 0;
        }
        return;
      }
      if (!touching) return;
      touching = false;
      // A swipe changes frame only at fit; zoomed in it was a pan.
      if (zoomed()) return;
      /*
       * Either axis moves to the next frame: up or left goes forward, down or
       * right goes back — whichever axis the finger actually travelled
       * furthest on, so a slightly diagonal swipe still resolves to one
       * intent rather than doing nothing.
       */
      const dx = e.changedTouches[0].clientX - touchX;
      const dy = e.changedTouches[0].clientY - touchY;
      const d = Math.abs(dx) > Math.abs(dy) ? dx : dy;
      if (Math.abs(d) > 40) navLg(d < 0 ? 1 : -1);
    };

    const onStackClick = (e: MouseEvent) => { if (e.target === stackEl) closeLarge(); };
    const onKey = (e: KeyboardEvent) => {
      if (mode !== "large") return;
      if (e.key === "Escape") closeLarge();
      if (e.key === "ArrowDown" || e.key === "ArrowRight") navLg(1);
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") navLg(-1);
    };
    const onClose = () => closeLarge();

    let rT = 0;
    const onResize = () => {
      window.clearTimeout(rT);
      rT = window.setTimeout(() => {
        if (mode === "large") closeLarge();
        build();
        items.forEach((el) => el.classList.add("hov"));
      }, 250);
    };

    /* ── Entrance ─────────────────────────────────────────────────── */
    build();
    const enter = () => {
      mode = "gallery";
      velX = velY = 16;
      const sorted = [...items].sort((a, b) => {
        const ar = a.getBoundingClientRect();
        const br = b.getBoundingClientRect();
        return ar.left + ar.top - (br.left + br.top);
      });
      if (reduced) {
        vpEl.classList.add("is-vis");
        items.forEach((el) => el.classList.add("hov"));
        return;
      }
      gsap.set(sorted, { x: -50, y: -50, scale: 0.93, opacity: 0, force3D: true });
      vpEl.classList.add("is-vis");
      sorted.forEach((el, i) => {
        gsap.to(el, {
          x: 0, y: 0, scale: 1, opacity: 1,
          duration: 0.7,
          ease: "power3.out",
          delay: i * 0.014 - 36 * 0.014,
          force3D: true,
          onComplete: () => gsap.set(el, { clearProps: "x,y,scale,opacity,transform,willChange" }),
        });
      });
      window.setTimeout(() => items.forEach((el) => el.classList.add("hov")), sorted.length * 14 + 350);
    };
    let enterTimer = 0;
    let started = false;
    start.current = () => {
      if (started) return;
      started = true;
      enterTimer = window.setTimeout(enter, 350);
    };
    if (readyRef.current) start.current();
    rafId = requestAnimationFrame(loop);

    vpEl.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    vpEl.addEventListener("wheel", onWheel, { passive: false });
    cvEl.addEventListener("click", onClick);
    lgEl.addEventListener("wheel", onLgWheel, { passive: false });
    lgEl.addEventListener("touchstart", onTouchStart, { passive: true });
    lgEl.addEventListener("touchmove", onTouchMove, { passive: false });
    lgEl.addEventListener("touchend", onTouchEnd);
    lgEl.addEventListener("pointerdown", onLgPointerDown);
    lgEl.addEventListener("pointermove", onLgPointerMove, { passive: false });
    lgEl.addEventListener("pointerup", onLgPointerUp);
    lgEl.addEventListener("pointercancel", onLgPointerUp);
    stackEl.addEventListener("click", onStackClick);
    closeEl?.addEventListener("click", onClose);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    const noDrag = (e: Event) => e.preventDefault();
    document.addEventListener("dragstart", noDrag);

    return () => {
      start.current = null;
      cancelAnimationFrame(rafId);
      window.clearTimeout(enterTimer);
      window.clearTimeout(hintTimer);
      window.clearTimeout(rT);
      window.clearTimeout(pressTimer);
      vpEl.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      vpEl.removeEventListener("wheel", onWheel);
      cvEl.removeEventListener("click", onClick);
      lgEl.removeEventListener("wheel", onLgWheel);
      lgEl.removeEventListener("touchstart", onTouchStart);
      lgEl.removeEventListener("touchmove", onTouchMove);
      lgEl.removeEventListener("touchend", onTouchEnd);
      lgEl.removeEventListener("pointerdown", onLgPointerDown);
      lgEl.removeEventListener("pointermove", onLgPointerMove);
      lgEl.removeEventListener("pointerup", onLgPointerUp);
      lgEl.removeEventListener("pointercancel", onLgPointerUp);
      stackEl.removeEventListener("click", onStackClick);
      closeEl?.removeEventListener("click", onClose);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("dragstart", noDrag);
      heroEl?.remove();
      gsap.killTweensOf(items);
      document.body.classList.remove("pg-dragging");
      document.body.classList.remove("pg-viewing");
      document.documentElement.style.overflow = prevOverflow;
    };
  }, [gallery]);

  /* The viewer's print-request toggle. The id is the frame's position in the
   * gallery — the same `slug#index` the drawer and the email key off. */
  const openFrame = openIdx === null ? null : gallery.frames[openIdx];
  const inRequests = openIdx !== null && prints.has(`${gallery.slug}#${openIdx}`);
  const toggleOpenFrame = () => {
    if (openIdx === null || !openFrame) return;
    prints.toggle({
      id: `${gallery.slug}#${openIdx}`,
      gallery: gallery.title,
      index: gallery.index,
      slug: gallery.slug,
      frame: openIdx + 1,
      file: openFrame.file,
      thumb: openFrame.thumb,
      ref: openFrame.src,
    });
  };

  return (
    <div ref={root} className="pg-root" data-mode="gallery">
      {/* Behind the frames: the gallery name alone, centred on both axes. */}
      <div className="pg-stage" aria-hidden>
        <span className="pg-title-text">{gallery.title}</span>
      </div>

      <div ref={vp} className="pg-vp">
        <div ref={cv} className="pg-cv" />
      </div>
      <div className="pg-vig" aria-hidden />

      {/* Sibling galleries, one to each side: previous on the left, next on
          the right. Each is built like the CTA pill — the label slides up to a
          duplicate drawn by its own text-shadow, and the arrow pair travels
          diagonally — so the interaction matches the buttons everywhere else
          on the site. On a phone the label is hidden and these become icon
          buttons, which is why each carries an explicit aria-label: it is the
          only accessible name once the visible text is gone. */}
      <nav className="pg-sides">
        <Link
          href={`/photography/${next.slug}`}
          className="pg-side pg-side-next"
          aria-label={`Next gallery: ${next.title}`}
        >
          <span className="pg-side_text_contain">
            <span className="pg-side_text">
              [{next.index}] {next.title}
            </span>
          </span>
          <span className="pg-side_aside">
            <span className="pg-side_aside_bg" />
            <RightArrow className="pg-side_icon" />
            <RightArrow className="pg-side_icon is-absolute" />
          </span>
        </Link>

        <Link
          href={`/photography/${prev.slug}`}
          className="pg-side pg-side-prev"
          aria-label={`Previous gallery: ${prev.title}`}
        >
          <span className="pg-side_aside">
            <span className="pg-side_aside_bg" />
            <RightArrow className="pg-side_icon" back />
            <RightArrow className="pg-side_icon is-absolute" back />
          </span>
          <span className="pg-side_text_contain">
            <span className="pg-side_text">
              [{prev.index}] {prev.title}
            </span>
          </span>
        </Link>
      </nav>

      {/* The page's heading and its state line. The counter is also the
          viewer's frame readout, so it stays in the DOM in both modes. */}
      {/* Heading and the way back out, centred along the bottom edge as plain
          type — the filled cards are the edge-pinned next/previous buttons,
          and repeating that treatment here would crowd the frames. */}
      <div className="pg-hud">
        <h1 className="pg-hud-title">
          [{gallery.index}] {gallery.title}
        </h1>

        <nav className="pg-nav grid text-[13px] font-medium uppercase leading-[1.3] tracking-[0.04em]">
          <div className="pg-nav-links col-start-1 row-start-1 flex items-center justify-center gap-x-5">
            <Link href="/photography" className="link-wipe text-muted transition-colors hover:text-foreground">
              All photography
            </Link>
          </div>

          {/* Kept mounted but empty in gallery mode: the canvas effect returns
              early without this element, and it is the viewer's frame counter
              (see .pg-bar, which is where it actually shows). */}
          <div className="pg-nav-viewer col-start-1 row-start-1 flex items-center justify-center gap-x-5">
            <span className="pg-count text-muted">
              <span ref={count} className="inline-block" />
            </span>
          </div>
        </nav>
      </div>

      {/*
        The viewer's own top bar, which stands in for the site header while a
        frame is open. It reuses the header's shell + 12-column grid and its
        type sizes, so "[01] Weddings" lands exactly where "Amar Ramesh" sits
        and Close lands on the menu button: the gallery name at columns 1-5,
        the frame counter centred, Close at the right edge.
      */}
      <div className="pg-bar" aria-hidden={false}>
        <div className="pg-bar_contain shell grid-12 items-center">
          <p className="pg-bar_title col-span-8 flex min-w-0 items-center justify-start text-[15px] font-semibold uppercase tracking-[-0.01em] md:col-span-5">
            [{gallery.index}] {gallery.title}
          </p>

          <div className="pg-bar_close col-start-9 col-span-4 flex items-center justify-end md:col-start-11 md:col-span-2">
            <button
              ref={closeBtn}
              type="button"
              aria-label="Close image"
              className="pg-bar_close_btn relative -mr-[var(--nav-space-1)] flex min-h-[44px] items-center justify-center text-[15px] font-medium tracking-[-0.03em]"
              style={{ padding: "0.25rem var(--nav-space-1)" }}
            >
              Close
            </button>
          </div>
        </div>

        {/* The frame counter with the print-request toggle beneath it, centred
            along the bottom edge on every width — clear of the photograph
            rather than sitting in the bar with the title and Close. */}
        <div className="pg-bar_foot">
          <p className="pg-bar_count text-[15px] font-medium tracking-[-0.03em]">
            <span ref={barCount} className="inline-block" />
          </p>
          {openFrame && (
            <button
              type="button"
              className="pg-bar_print text-[13px] font-medium uppercase tracking-[0.04em]"
              aria-pressed={inRequests}
              title={inRequests ? "Remove from print requests" : "Add to print requests"}
              onClick={toggleOpenFrame}
            >
              {inRequests ? "✓ Saved for print" : "Request a print"}
            </button>
          )}
        </div>
      </div>

      {/* Viewer. */}
      <div ref={lg} className="pg-lg">
        <div ref={stack} className="pg-lg-stack" />
      </div>
    </div>
  );
}
