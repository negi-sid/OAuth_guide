import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { JetBrains_Mono } from "next/font/google";
import { BackNav } from "@/components/back-nav";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

/** Composio primary typeface — weight 400/500 only per brand hub. */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500"],
});

/** Composio mono for code / chrome labels. */
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "OAuth Readiness · Composio",
  description:
    "Decision-first OAuth setup guides for agent builders — managed OAuth app vs custom OAuth app, effort, wait, and agent vs human handoff.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="flex min-h-full flex-col font-sans antialiased">
        <SiteHeader />
        <BackNav />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
