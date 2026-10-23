import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppControls } from "@/components/AppControls";
import { SiteHeader } from "@/components/SiteHeader";
import { PageTransition } from "@/components/PageTransition";
import { PrintRequestProvider } from "@/components/PrintRequest";
import { PrintRequestDock } from "@/components/PrintRequestDock";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Amar Ramesh — I tell stories that make brands worth remembering.",
  description:
    "I work with ambitious organizations to turn ideas, people and purpose into powerful visual stories, films and experiences.",
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
        <AppControls />
      </body>
    </html>
  );
}
