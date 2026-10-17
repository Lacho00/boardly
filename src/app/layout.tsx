import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { isDemo } from "@/lib/demo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Boardly",
  description: "Uptime, performance, SSL and SEO monitoring for your websites",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {isDemo && (
          <div className="bg-amber-100 px-4 py-2 text-center text-sm text-amber-900">
            Public demo with fictional data. Scans, edits and alerts are disabled.
          </div>
        )}
        {children}
      </body>
    </html>
  );
}
