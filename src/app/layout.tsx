import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { PageTransition } from "@/components/PageTransition";
import { PrintRequestProvider } from "@/components/PrintRequest";
import { PrintRequestDock } from "@/components/PrintRequestDock";
import { AppControls } from "@/components/AppControls";
import { CursorBubble } from "@/components/CursorBubble";
import { GALLERY_THEME_SCRIPT } from "@/lib/theme";

// KH Teka ships as static instances, not a variable font, so each weight is
// its own file. There is no semibold: the family steps Medium (500) straight
// to Bold (700), and `font-semibold` is declared at 500 so Tailwind's 600
// utilities land on Medium instead of letting the browser synthesize a face.
// Bold is loaded for the reference-matched type (`about_statement`,
// `works_title`, `works_all_text`), which is set at 700.
const khTeka = localFont({
  src: [
    { path: "./fonts/KHTekaTRIAL-Light.woff2", weight: "300", style: "normal" },
    { path: "./fonts/KHTekaTRIAL-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/KHTekaTRIAL-Medium.woff2", weight: "500 600", style: "normal" },
    { path: "./fonts/KHTekaTRIAL-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-kh-teka",
  display: "swap",
});

// The hero statement's face: KH Teka Bold again, with its vertical metrics
// overridden to tile the statement's 0.78 leading. The font's own ascent +
// descent is 1.20em (0.953 + 0.250), and Chrome paints each line's selection
// highlight and its text together, line by line — so at 0.78 every line's
// highlight reached 0.42em up and painted over the line above. 60% + 18%
// sums to exactly 0.78: the highlights tile edge to edge, never overlap, and
// 18% still clears the lowest descender ink. A separate face so the override
// touches nothing but the statement (`.display-statement` in globals.css).
const khTekaStatement = localFont({
  src: "./fonts/KHTekaTRIAL-Bold.woff2",
  weight: "700",
  style: "normal",
  variable: "--font-kh-teka-statement",
  display: "swap",
  declarations: [
    { prop: "ascent-override", value: "60%" },
    { prop: "descent-override", value: "18%" },
    { prop: "line-gap-override", value: "0%" },
  ],
});

export const metadata: Metadata = {
  title: "Amar Ramesh — Camera was only the beginning of everything",
  description:
    "Photographer, filmmaker, author and mentor. What started with photography has taken me into the fascinating worlds of art, architecture, culture, films and books.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // The inline script below adds `preloaded` to <html> before hydration, so
    // React must accept the class the DOM has rather than the one it rendered.
    <html
      lang="en"
      className={`${khTeka.variable} ${khTekaStatement.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Runs before paint: once the preloader has played this visit, hide
            its server-rendered cover so a reload never flashes it before
            hydration gets to skip it. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              'try{if(sessionStorage.getItem("amar:preloaded")==="1")document.documentElement.classList.add("preloaded")}catch(e){}',
          }}
        />
      </head>
      {/* data-theme is the server's starting stop only. AppControls owns the
          attribute from mount on, so 16 — the ramp's white, its own
          DEFAULT_STOP — is what the first paint shows before the slider or
          prefers-color-scheme moves it. The exception is a gallery page: the
          script below puts it on black before the first paint, so the body
          must accept the attributes the DOM has rather than the ones rendered
          here, as <html> does for `preloaded`. */}
      <body
        className="min-h-full flex flex-col font-sans"
        data-theme="16"
        data-theme-nav="light"
        suppressHydrationWarning
      >
        {/* First in the body, so it runs as soon as <body> exists: a gallery
            otherwise painted white and faded to black once AppControls
            hydrated. */}
        <script dangerouslySetInnerHTML={{ __html: GALLERY_THEME_SCRIPT }} />
        {/* Header and curtain live here so they persist across routes; the
            preloader inside PageTransition plays once per visit. The print
            request selection wraps both so a pick made inside a gallery is
            still on the pill anywhere else on the site. */}
        <PrintRequestProvider>
          <PageTransition>
            <SiteHeader />
            {children}
          </PageTransition>
          <PrintRequestDock />
          {/* Last in the body: it hit-tests `elementFromPoint`, so it has to
              sit above the content it reads — and being outside the header
              lets any `[data-cursor-hover]` on the page raise it. */}
          <CursorBubble />
          {/* The theme ramp and grid overlay, fixed to the viewport. */}
          <AppControls />
        </PrintRequestProvider>
      </body>
    </html>
  );
}
