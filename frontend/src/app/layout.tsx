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
    default: "GenBots - Innovating the Future through IoT, Robotics & AI",
    template: "%s | GenBots",
  },
  description:
    "GenBots is India's leading IoT, Robotics & AI solutions company. Shop premium Arduino, ESP32, sensors, robotics kits, and STEM products. Lab setup services for schools and universities.",
  keywords: [
    "IoT", "Robotics", "AI", "Arduino", "ESP32", "Sensors",
    "STEM Kits", "Robotics Lab", "Home Automation", "GenBots",
    "IoT Sensors India", "Robotics Kits India", "Lab Setup",
  ],
  authors: [{ name: "GenBots" }],
  creator: "GenBots",
  metadataBase: new URL("https://genbots.in"),
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://genbots.in",
    siteName: "GenBots",
    title: "GenBots - IoT, Robotics & AI Solutions",
    description: "Premium IoT & Robotics products for makers, students, and enterprises.",
  },
  twitter: {
    card: "summary_large_image",
    title: "GenBots - IoT, Robotics & AI",
    description: "Premium IoT & Robotics products for makers, students, and enterprises.",
    creator: "@genbots",
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        {/* Accessibility: Skip to main content link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:shadow-lg"
        >
          Skip to main content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
