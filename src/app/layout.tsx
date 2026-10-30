import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { PageTransition } from "@/components/PageTransition";
import { PrintRequestProvider } from "@/components/PrintRequest";
import { PrintRequestDock } from "@/components/PrintRequestDock";
import { AppControls } from "@/components/AppControls";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// KH Teka ships as static instances, not a variable font, so each weight is
// its own file. Light (300) is not loaded: nothing on the site sets it, and
// every face here is preloaded on every page. There is no semibold: the family steps Medium (500) straight
// to Bold (700), and `font-semibold` is declared at 500 so Tailwind's 600
// utilities land on Medium instead of letting the browser synthesize a face.
// Bold is loaded for the reference-matched type (`about_statement`,
// `works_title`, `works_all_text`), which is set at 700.
const khTeka = localFont({
  src: [
    { path: "./fonts/KHTekaTRIAL-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/KHTekaTRIAL-Medium.woff2", weight: "500 600", style: "normal" },
    { path: "./fonts/KHTekaTRIAL-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-kh-teka",
  display: "swap",
});

// The hero's display face: KH Teka Bold again, with its vertical metrics
// overridden to tile the hero's 0.87 leading. The font's own ascent + descent
// is 1.20em (0.953 + 0.250), and Chrome paints each line's selection
// highlight and its text together, line by line — so at 0.87 every line's
// highlight reached up and painted over the line above. 69% + 18% sums to
// exactly 0.87: the highlights tile edge to edge, the caps top out level with
// the line box, and 18% still clears the lowest descender ink. A separate
// face so the override touches nothing but the hero (`.hero_title` in
// globals.css).
const khTekaStatement = localFont({
  src: "./fonts/KHTekaTRIAL-Bold.woff2",
  weight: "700",
  style: "normal",
  variable: "--font-kh-teka-statement",
  display: "swap",
  declarations: [
    { prop: "ascent-override", value: "69%" },
    { prop: "descent-override", value: "18%" },
    { prop: "line-gap-override", value: "0%" },
  ],
});

const DESCRIPTION =
  "Photographer, filmmaker, author and mentor. What started with photography has taken me into the fascinating worlds of art, architecture, culture, films and books.";

/*
 * Child routes set a bare `title` ("Books") and the template adds the name.
 * Canonical links and absolute share-image URLs need the domain, so they
 * switch on once NEXT_PUBLIC_SITE_URL is set (see lib/site).
 */
export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} - Camera was only the beginning of everything`,
    template: `%s - ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_IN",
    description: DESCRIPTION,
  },
  // Without the domain, Next would resolve the share image against
  // localhost, so it is only declared once the domain is known.
  ...(SITE_URL && {
    metadataBase: new URL(SITE_URL),
    alternates: { canonical: "./" },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_IN",
      description: DESCRIPTION,
      images: [{ url: "/assets/amar-ramesh.jpg", alt: SITE_NAME }],
    },
  }),
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
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
        {/* Only script ever lifts the preloader's cover, so without it the
            page would stay blank behind it. */}
        <noscript>
          <style>{".preloader{display:none}"}</style>
        </noscript>
      </head>
      {/* data-theme is the server's starting stop only. AppControls owns the
          attribute from mount on, so 16 — the ramp's white, its own
          DEFAULT_STOP — is what the first paint shows before the slider or
          prefers-color-scheme moves it, on every route alike. */}
      <body className="min-h-full flex flex-col font-sans" data-theme="16" data-theme-nav="page">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:bg-background focus:px-4 focus:py-2 focus:text-foreground"
        >
          Skip to content
        </a>
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
          {/* The theme ramp and grid overlay, fixed to the viewport. */}
          <AppControls />
        </PrintRequestProvider>
      </body>
    </html>
  );
}
