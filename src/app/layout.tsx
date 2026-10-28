import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { PageTransition } from "@/components/PageTransition";
import { PrintRequestProvider } from "@/components/PrintRequest";
import { PrintRequestDock } from "@/components/PrintRequestDock";
import { AppControls } from "@/components/AppControls";
import { CursorBubble } from "@/components/CursorBubble";

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

export const metadata: Metadata = {
  title: "Amar Ramesh — The camera was just the beginning",
  description:
    "Photographer, filmmaker, author and mentor. What started with photography has taken me into the fascinating worlds of art, architecture, culture, films and books.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // The inline script below adds `preloaded` to <html> before hydration, so
    // React must accept the class the DOM has rather than the one it rendered.
    <html
      lang="en"
      className={`${khTeka.variable} h-full antialiased`}
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
          prefers-color-scheme moves it. */}
      <body className="min-h-full flex flex-col font-sans" data-theme="16" data-theme-nav="light">
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
