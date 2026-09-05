import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap", // front.md: performance - avoid FOIT
});

export const metadata: Metadata = {
  title: {
    default: "GenBots: STEM Robotics, IoT Sensors & Lab Setup | India",
    template: "%s | GenBots",
  },
  description:
    "Official website of GenBots (thegenbots.in). MSME registered Indian STEM robotics & IoT enterprise founded by Yash in April 2026. Turnkey school robotics lab setups, 65+ electronic sensors, Arduino & ESP32 kits, and hands-on online robotics training.",
  keywords: [
    "GenBots",
    "TheGenBots",
    "thegenbots.in",
    "GenBots India",
    "GenBots Yash",
    "STEM Robotics Lab Setup India",
    "School Robotics Lab Setup",
    "Turnkey IoT Lab Setup",
    "Buy Arduino Sensors India",
    "ESP32 Projects and Kits",
    "Electronics Components Online India",
    "Robotics Kits for Schools",
    "MSME Registered Robotics Enterprise",
    "Sonipat Robotics Components",
    "Online Robotics Training India",
    "Hands-on STEM Kits",
    "Microcontroller Boards India"
  ],
  authors: [{ name: "Yash (Founder, GenBots)" }],
  creator: "Yash",
  publisher: "GenBots",
  metadataBase: new URL("https://thegenbots.in"),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://thegenbots.in",
    siteName: "GenBots",
    title: "GenBots - STEM Robotics, IoT Sensors & School Lab Setup",
    description: "Official GenBots platform by Yash. Turnkey STEM robotics labs, 65+ hardware sensors, Arduino/ESP32 kits, and practical robotics education in India.",
    images: [
      {
        url: "https://thegenbots.in/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "GenBots - IoT, Robotics & AI Solutions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GenBots - STEM Robotics, IoT Sensors & School Lab Setup",
    description: "Official GenBots platform by Yash. Turnkey STEM robotics labs, 65+ hardware sensors, Arduino/ESP32 kits, and practical robotics education in India.",
    creator: "@genbots",
    images: ["https://thegenbots.in/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-site-verification-code",
  },
};

import Script from "next/script";

import { BackToTop } from "@/components/BackToTop";
import { VisitorTracker } from "@/components/analytics/VisitorTracker";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-YFGDV1JBD3";

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        {/* Google Analytics 4 Script Tag */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
          strategy="afterInteractive"
        />
        <Script
          id="google-analytics-init"
          strategy="afterInteractive"
        >
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}');
          `}
        </Script>

        {/* Accessibility: Skip to main content link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:shadow-lg"
        >
          Skip to main content
        </a>
        <Providers>
          <VisitorTracker />
          {children}
          <BackToTop />
        </Providers>
      </body>
    </html>
  );
}
