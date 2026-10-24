"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, DUR } from "@/lib/gsap";
import { MEDIA } from "@/lib/media";
import { opticalClass } from "@/lib/optical";

/**
 * Service list, following the reference's `services_home_service_item`.
 *
 * Each row carries its own image, absolutely placed against the row's right
 * edge and hidden until that row is hovered. The heading sits above it with
 * `mix-blend-mode: difference`, so the type inverts wherever it crosses the
 * photograph — the effect that makes the pattern read.
 */
export type ServiceItem = { label: string; href?: string; image?: string };

export function Services({ items }: { items: ServiceItem[] }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;

      const rows = gsap.utils.toArray<HTMLElement>("[data-content-trigger]", root.current);
      if (!rows.length) return;

      // Hover is pointer-only: on touch there is nothing to leave, so the
      // image would stay open after a tap.
      gsap.matchMedia().add("(hover: hover) and (pointer: fine)", () => {
        const cleanups = rows.map((row) => {
          const img = row.querySelector<HTMLElement>("[data-content-image]");
          if (!img) return () => {};

          gsap.set(img, { autoAlpha: 0, scale: 1.06 });

          const enter = () => {
            gsap.to(img, {
              autoAlpha: 1,
              scale: 1,
              duration: DUR.normal,
              ease: "ease-transition",
              overwrite: true,
            });
            gsap.to(
              rows.filter((r) => r !== row),
              { opacity: 0.35, duration: DUR.normal, ease: "ease-transition", overwrite: true },
            );
          };

          const leave = () => {
            gsap.to(img, {
              autoAlpha: 0,
              scale: 1.06,
              duration: DUR.normal,
              ease: "ease-transition",
              overwrite: true,
            });
            gsap.to(rows, {
              opacity: 1,
              duration: DUR.normal,
              ease: "ease-transition",
              overwrite: true,
            });
          };

          row.addEventListener("mouseenter", enter);
          row.addEventListener("mouseleave", leave);

          return () => {
            row.removeEventListener("mouseenter", enter);
            row.removeEventListener("mouseleave", leave);
          };
        });

        return () => {
          cleanups.forEach((fn) => fn());
          gsap.set(rows, { clearProps: "opacity" });
        };
      });
    },
    { scope: root },
  );

  return (
    <div ref={root}>
      <div className="flex flex-col gap-0 md:gap-1">
        {items.map(({ label, href, image }, i) => {
          // A plain anchor, so the route curtain's document-level click
          // handler picks it up like the header links.
          const Row = href ? "a" : "div";
          return (
            <Row
              key={`${label}-${i}`}
              href={href}
              data-content-trigger
              className="services_home_service_item relative block cursor-pointer"
            >
              {/* Sits against the row's right edge, revealed on hover. */}
              <div
                data-content-image
                className="services_home_service_image pointer-events-none absolute right-0 top-1/2 z-0 hidden aspect-[4/5] w-[9rem] -translate-y-1/2 overflow-hidden md:block"
              >
                <img
                  src={image ?? MEDIA.services[i % MEDIA.services.length]}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>

              {/* Type sits above its image; the image is inset from the left
                  so the heading stays legible where they overlap. */}
              <h3
                className={`services_home_heading display relative z-[1] !normal-case ${opticalClass(
                  label,
                )}`}
              >
                {label}
              </h3>
            </Row>
          );
        })}
      </div>
    </div>
  );
}
