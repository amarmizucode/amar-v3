import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppControls } from "@/components/AppControls";
import { SiteHeader } from "@/components/SiteHeader";
import { PageTransition } from "@/components/PageTransition";

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
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans" data-theme="16">
        {/* Runs before paint: once the preloader has played this visit, hide
            its server-rendered cover so a reload never flashes it before
            hydration gets to skip it. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              'try{if(sessionStorage.getItem("amar:preloaded")==="1")document.documentElement.classList.add("preloaded")}catch(e){}',
          }}
        />
        {/* Header and curtain live here so they persist across routes; the
            preloader inside PageTransition plays once per visit. */}
        <PageTransition>
          <SiteHeader />
          {children}
        </PageTransition>
        <AppControls />
      </body>
    </html>
  );
}
