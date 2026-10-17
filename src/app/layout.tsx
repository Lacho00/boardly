import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { cookies } from "next/headers";
import { isDemo } from "@/lib/demo";
import { parseTheme, THEME_COOKIE } from "@/lib/theme";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono-ui",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "700"],
});

export const metadata: Metadata = {
  title: "Boardly",
  description: "Uptime, performance, SSL and SEO monitoring for your websites",
  openGraph: {
    title: "Boardly",
    description: "Uptime, performance, SSL and SEO monitoring for your websites",
    siteName: "Boardly",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0e0d0b" },
    { media: "(prefers-color-scheme: light)", color: "#f6f3ec" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = parseTheme((await cookies()).get(THEME_COOKIE)?.value);
  return (
    <html
      lang="en"
      data-theme={theme ?? undefined}
      className={`${jetbrainsMono.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {isDemo && (
          <div className="border-b border-line bg-panel px-4 py-2 text-center text-sm text-warn">
            Public demo with fictional data. Scans, edits and alerts are disabled.
          </div>
        )}
        {children}
      </body>
    </html>
  );
}
