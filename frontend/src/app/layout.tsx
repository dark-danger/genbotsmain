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
    default: "GenBots: IoT, Robotics & AI Solutions Provider | India",
    template: "%s | GenBots",
  },
  description:
    "GenBots delivers cutting-edge IoT, robotics, and AI solutions for industries, education, and innovation. Shop products, explore services, and join training programs.",
  keywords: [
    "IoT", "Robotics", "AI", "Arduino", "ESP32", "Sensors",
    "STEM Kits", "Robotics Lab", "Home Automation", "GenBots",
    "IoT Sensors India", "Robotics Kits India", "Lab Setup",
  ],
  authors: [{ name: "GenBots" }],
  creator: "GenBots",
  metadataBase: new URL("https://thegenbots.in"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://thegenbots.in",
    siteName: "GenBots",
    title: "GenBots - IoT, Robotics & AI Solutions Provider",
    description: "Premium IoT & Robotics products for makers, students, and enterprises.",
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
    title: "GenBots - IoT, Robotics & AI Solutions Provider",
    description: "Premium IoT & Robotics products for makers, students, and enterprises.",
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
          {children}
          <BackToTop />
        </Providers>
      </body>
    </html>
  );
}
