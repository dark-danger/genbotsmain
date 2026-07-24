import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Buy IoT & Robotics Kits Online | GenBots Store India",
  description: "Shop GenBots' premium IoT starter kits, robotics components, Arduino, ESP32, and AI development boards. Free shipping across India. Official distributor.",
};

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
