import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { PageTransition } from "@/components/PageTransition";
import { PrintRequestProvider } from "@/components/PrintRequest";
import { PrintRequestDock } from "@/components/PrintRequestDock";

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
      {/* The theme is fixed at stop 16 — pure white — rather than being
          driven by the slider. The 17-stop ramp and the grid overlay live in
          AppControls (and their CSS in globals.css); both are kept but no
          longer mounted, so restoring them is re-rendering <AppControls />
          here. Stop 16 is the ramp's own white, so the palette is unchanged
          from what the slider's default produced; the difference is that the
          OS preferring dark no longer moves it to stop 00. */}
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
        </PrintRequestProvider>
      </body>
    </html>
  );
}
