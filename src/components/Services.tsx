"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, DUR } from "@/lib/gsap";
import { MEDIA } from "@/lib/media";

/**
 * Service list, a port of the reference's `services_home_content` handler
 * (`of`).
 *
 * One frame per service, stacked against the list's right edge. Hovering a
 * row makes it the active one: its frame fades in, the others fade out, every
 * other row drops to 30%, and the frame stack glides to the row's centre.
 *
 * Unlike the reference, nothing is lit until a row is hovered — every
 * heading sits at full strength with no frame showing — and leaving the
 * list returns it to that rest state. The stack drifts in, unblurring, as
 * the band scrolls up.
 */
export type ServiceItem = { label: string; href?: string; image?: string };

export function Services({ items }: { items: ServiceItem[] }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const content = root.current;
      if (!content) return;
      const wrap = content.querySelector<HTMLElement>("[data-img-wrap]");
      const triggers = gsap.utils.toArray<HTMLElement>("[data-content-trigger]", content);
      const images = gsap.utils.toArray<HTMLElement>("[data-content-image]", content);
      if (!wrap || !triggers.length) return;

      const band = content.closest("section") ?? content;
      gsap.fromTo(
        wrap,
        { yPercent: -50, opacity: 0, filter: "blur(4px)" },
        {
          yPercent: 0,
          opacity: 1,
          filter: "blur(0px)",
          ease: "none",
          scrollTrigger: { trigger: band, start: "top bottom", end: "center bottom", scrub: true },
        },
      );

      const centre = (row: HTMLElement) => {
        const box = content.getBoundingClientRect();
        const r = row.getBoundingClientRect();
        return r.top - box.top + r.height / 2;
      };

      let first = true;
      let active = -1;
      const move = (row: HTMLElement) => {
        const y = centre(row);
        if (first) {
          first = false;
          gsap.set(wrap, { y });
        } else {
          gsap.to(wrap, { y, duration: DUR.slow, ease: "ease-transition" });
        }
      };

      const activate = (i: number) => {
        active = i;
        images.forEach((img, n) => {
          img.classList.toggle("active", n === i);
          gsap.to(img, { opacity: n === i ? 1 : 0, duration: 0.2, ease: "ease-fade" });
        });
        triggers.forEach((row, n) => {
          gsap.to(row, { opacity: n === i ? 1 : 0.3, duration: 0.2, ease: "ease-fade" });
        });
      };

      // Rest: every row full strength, no frame.
      const reset = () => {
        active = -1;
        images.forEach((img) => {
          img.classList.remove("active");
          gsap.to(img, { opacity: 0, duration: 0.2, ease: "ease-fade" });
        });
        gsap.to(triggers, { opacity: 1, duration: 0.2, ease: "ease-fade" });
      };

      const list = content.querySelector<HTMLElement>("[role=list]");
      list?.addEventListener("mouseleave", reset);

      const listeners = triggers.map((row, i) => {
        const onEnter = () => {
          activate(i);
          move(row);
        };
        row.addEventListener("mouseenter", onEnter);
        return () => row.removeEventListener("mouseenter", onEnter);
      });

      // Headings rewrap as the viewport changes, which moves the rows; keep
      // the stack on the active one.
      const onResize = () => {
        if (active >= 0) gsap.set(wrap, { y: centre(triggers[active]) });
      };
      window.addEventListener("resize", onResize);

      return () => {
        listeners.forEach((off) => off());
        list?.removeEventListener("mouseleave", reset);
        window.removeEventListener("resize", onResize);
      };
    },
    { scope: root, dependencies: [items.length] },
  );

  return (
    <div ref={root} className="svc_content">
      <div className="svc_services">
        <div role="list" className="svc_list">
          {items.map(({ label, href }, i) => (
            <div key={`${label}-${i}`} role="listitem" data-content-trigger className="svc_item">
              {/* A plain anchor, so the route curtain's document-level click
                  handler picks it up like the header links. */}
              {href ? (
                <a href={href} className="block">
                  <h3 className="svc_heading">{label}</h3>
                </a>
              ) : (
                <h3 className="svc_heading">{label}</h3>
              )}
            </div>
          ))}
        </div>
      </div>

      <div data-img-wrap aria-hidden className="svc_img_wrap">
        <div className="relative">
          {items.map(({ label, image }, i) => (
            <div key={`${label}-${i}`} className="svc_img_item">
              <img
                data-content-image
                src={image ?? MEDIA.services[i % MEDIA.services.length]}
                alt=""
                loading="lazy"
                decoding="async"
                className="svc_img"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
