import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppControls } from "@/components/AppControls";

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
        {children}
        <AppControls />
      </body>
    </html>
  );
}
