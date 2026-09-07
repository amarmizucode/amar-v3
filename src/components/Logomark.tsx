/**
 * Client logomark, inlined so it can follow the theme.
 *
 * The original SVG asset carried the brand blues (#007AFF / #312ECB) baked
 * into its paths, and loading it through `next/image` renders it as an
 * external image — CSS cannot reach inside, so it stayed a fixed blue at
 * every theme stop. The file has been removed now that the paths live here.
 *
 * Inlined here with `currentColor`, it inherits the surrounding text colour
 * and so inverts with the ramp. The two paths carry different opacities to
 * preserve the original's mark/shadow relationship in a single hue.
 */
export function Logomark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 72.6132 51.4365"
      fill="none"
      className={className}
      aria-hidden
      focusable="false"
    >
      <path
        d="M23.4475 6.26002e-06H55.3402L31.8927 34.7539H0L23.4475 6.26002e-06Z"
        fill="currentColor"
      />
      {/* The original's darker "shadow" plane, kept distinct by opacity. */}
      <path
        d="M24.842 37.9752L15.7602 51.4363H49.1657L72.6132 16.6824H47.9579L33.5921 37.9752H24.842Z"
        fill="currentColor"
        opacity="0.55"
      />
    </svg>
  );
}
