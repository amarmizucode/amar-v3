import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";

/**
 * Central GSAP registration. Easing curves and duration constants are taken
 * from the reference build so motion across the site shares one vocabulary.
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText, CustomEase);

  if (!CustomEase.get("ease-primary")) {
    CustomEase.create("ease-primary", "0.55, 0, 0.7, 0");
    CustomEase.create("ease-secondary", "0.31,0.75,0.22,1");
    CustomEase.create("ease-fade", "0.76, 0, 0.24, 1");
    CustomEase.create("ease-transition", "0.22, 1, 0.36, 1");
    CustomEase.create("ease-menu", ".7,0,.22,1");
    // The counter's run to 100: slow to start, decisive through the middle.
    CustomEase.create("ease-preloader", "0.65, 0, 0.35, 1");
  }
}

export const DUR = {
  fast: 0.3,
  normal: 0.65,
  slow: 1.075,
  slower: 1.25,
  stagger: 0.05,
} as const;

export { gsap, ScrollTrigger, ScrollSmoother, SplitText, CustomEase };
