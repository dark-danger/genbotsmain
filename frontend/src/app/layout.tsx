import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
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
  ],
  authors: [{ name: "GenBots" }],
  creator: "GenBots",
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
