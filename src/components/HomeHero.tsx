"use client";

import { Hero } from "@/components/Hero";
import { usePageReady } from "@/components/PageTransition";

/**
 * The home hero, gated on hydration (first load) or the route curtain.
 *
 * This is the only part of the home page that needs the client, so it lives
 * on its own: the page itself stays a server component, which keeps the
 * documentary, photography and books data it reads on the server instead of
 * shipping every film, gallery frame and book to the browser.
 */
export function HomeHero() {
  const introReady = usePageReady();
  return <Hero start={introReady} />;
}
