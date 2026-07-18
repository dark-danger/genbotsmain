import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Download, ExternalLink, Monitor, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Software", description: "Download GenBots software - IDE, home automation app, IoT controllers, and firmware tools." };

const software = [
  { name: "GenBots Home Automation", slug: "genbots-home-automation", category: "Home Automation", desc: "Control your smart home devices from anywhere with scheduling, automation rules, and energy monitoring.", version: "2.4.1", downloads: "15K+", size: "45 MB", platforms: ["Windows", "macOS", "Linux"], features: ["Device Control", "Scheduling", "Voice Assistant", "Energy Monitor"] },
  { name: "GenIDE", slug: "genide", category: "Development", desc: "IoT-focused IDE with Arduino & ESP32 support, serial monitor, OTA updates, and board manager.", version: "3.1.0", downloads: "25K+", size: "120 MB", platforms: ["Windows", "macOS", "Linux"], features: ["Code Editor", "Serial Monitor", "Board Manager", "OTA Updates"] },
  { name: "IoT Control App", slug: "iot-control-app", category: "IoT", desc: "Universal IoT device controller supporting MQTT, HTTP, and WebSocket with custom dashboards.", version: "1.8.3", downloads: "8K+", size: "30 MB", platforms: ["Windows", "macOS"], features: ["MQTT Support", "Custom Dashboards", "Data Logging", "Alerts"] },
  { name: "Firmware Tools", slug: "genbots-firmware-tools", category: "Utilities", desc: "Flash, update, and manage firmware on GenBots devices with batch operations.", version: "1.3.0", downloads: "5K+", size: "15 MB", platforms: ["Windows", "macOS", "Linux"], features: ["Flash Firmware", "Batch Ops", "Version Mgmt", "Backup"] },
];

export default function SoftwarePage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our <span className="gradient-text">Software</span></h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">Download professional-grade software tools built for IoT development, home automation, and device management.</p>
          </div>

          <div className="space-y-8">
            {software.map((sw) => (
              <div key={sw.slug} className="glass-card p-6 md:p-8">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="w-20 h-20 rounded-2xl gradient-bg flex items-center justify-center shrink-0">
                    <Monitor className="w-10 h-10 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h2 className="text-xl font-bold">{sw.name}</h2>
                      <Badge variant="outline" className="rounded-full">{sw.category}</Badge>
                      <Badge className="gradient-bg text-white border-0 rounded-full">v{sw.version}</Badge>
                    </div>
                    <p className="text-muted-foreground mb-4">{sw.desc}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {sw.features.map((f) => (
                        <span key={f} className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">{f}</span>
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span>📥 {sw.downloads} downloads</span>
                      <span>💾 {sw.size}</span>
                      <span>🖥️ {sw.platforms.join(", ")}</span>
                    </div>
                    <div className="flex gap-3">
                      <Button className="gradient-bg text-white rounded-xl"><Download className="w-4 h-4 mr-2" /> Download</Button>
                      <Button variant="outline" className="rounded-xl"><ExternalLink className="w-4 h-4 mr-2" /> Documentation</Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
