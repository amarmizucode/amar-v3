import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { PageTransition } from "@/components/PageTransition";
import { PrintRequestProvider } from "@/components/PrintRequest";
import { PrintRequestDock } from "@/components/PrintRequestDock";
import { AppControls } from "@/components/AppControls";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
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
      className={`${inter.variable} h-full antialiased`}
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
      <body className="min-h-full flex flex-col font-sans" data-theme="16">
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
