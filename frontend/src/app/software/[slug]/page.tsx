"use client";

import { useState, use } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ArrowLeft, Download, Monitor, ExternalLink, ShieldCheck, Cpu, History, MessageSquare, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/animations/ScrollAnimations";
import { ModuleGuard } from "@/components/layout/ModuleGuard";
import Link from "next/link";

const softwareData = [
  {
    name: "GenBots Home Automation",
    slug: "genbots-home-automation",
    category: "Home Automation",
    desc: "Control your smart home devices from anywhere with scheduling, automation rules, and energy monitoring.",
    version: "2.4.1",
    downloads: "15K+",
    size: "45 MB",
    platforms: ["Windows", "macOS", "Linux"],
    features: ["Device Control", "Scheduling", "Voice Assistant", "Energy Monitor"],
    longDesc: "GenBots Home Automation suite is a comprehensive dashboard for modern smart homes. Supporting local and cloud controllers, it integrates multi-protocol bridges (MQTT, Zigbee, Z-Wave, HTTP) into a unified workspace. Gain access to intelligent automation trees, machine learning energy efficiency recommendations, and standard compatibility controls.",
    docsLink: "/docs/home-automation",
    history: [
      { ver: "2.4.1", date: "July 12, 2026", note: "Security patches for WebSocket servers, updated translation dictionaries." },
      { ver: "2.4.0", date: "June 20, 2026", note: "Added local MQTT bridge discovery and responsive widget customizing tools." },
      { ver: "2.3.5", date: "April 15, 2026", note: "Bug fix for device status updating issues under heavy database queries." },
    ],
  },
  {
    name: "GenIDE",
    slug: "genide",
    category: "Development",
    desc: "IoT-focused IDE with Arduino & ESP32 support, serial monitor, OTA updates, and board manager.",
    version: "3.1.0",
    downloads: "25K+",
    size: "120 MB",
    platforms: ["Windows", "macOS", "Linux"],
    features: ["Code Editor", "Serial Monitor", "Board Manager", "OTA Updates"],
    longDesc: "GenIDE is an integrated development workspace designed from the ground up for IoT and automation hardware. Built with Monaco Editor (powers VS Code), it offers IntelliSense code completion, direct library downloads, serial plotting tools, and over-the-air firmware flashing capabilities.",
    docsLink: "/docs/genide",
    history: [
      { ver: "3.1.0", date: "June 25, 2026", note: "Added support for ESP32-S3 AI instruction sets and local compiler caching." },
      { ver: "3.0.0", date: "May 05, 2026", note: "Complete UI rewrite utilizing custom theme engines and faster parser trees." },
    ],
  },
  {
    name: "IoT Control App",
    slug: "iot-control-app",
    category: "IoT",
    desc: "Universal IoT device controller supporting MQTT, HTTP, and WebSocket with custom dashboards.",
    version: "1.8.3",
    downloads: "8K+",
    size: "30 MB",
    platforms: ["Windows", "macOS"],
    features: ["MQTT Support", "Custom Dashboards", "Data Logging", "Alerts"],
    longDesc: "The universal console for direct sensor logging and real-time visualization. Connect to custom dashboards, stream telemetry directly, and setup warning alerts instantly using standard protocols.",
    docsLink: "/docs/iot-control",
    history: [
      { ver: "1.8.3", date: "May 10, 2026", note: "Optimized graph memory usage and enabled custom theme saving features." },
    ],
  },
  {
    name: "Firmware Tools",
    slug: "genbots-firmware-tools",
    category: "Utilities",
    desc: "Flash, update, and manage firmware on GenBots devices with batch operations.",
    version: "1.3.0",
    downloads: "5K+",
    size: "15 MB",
    platforms: ["Windows", "macOS", "Linux"],
    features: ["Flash Firmware", "Batch Ops", "Version Mgmt", "Backup"],
    longDesc: "Utility tool for serial flashing and device diagnosing. Highly recommended for bulk flashing configurations in institutional and school labs.",
    docsLink: "/docs/firmware-tools",
    history: [
      { ver: "1.3.0", date: "April 02, 2026", note: "Enabled multi-device parallel flashing pipelines." },
    ],
  },
];

export default function SoftwareDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const sw = softwareData.find((item) => item.slug === slug);
  const [activeTab, setActiveTab] = useState("overview");
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = (platform: string) => {
    setDownloading(platform);
    setTimeout(() => {
      setDownloading(null);
      alert(`Download started for ${sw?.name} (${platform}). Build artifact ready.`);
    }, 1200);
  };

  if (!sw) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center pt-24">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Software Not Found</h1>
            <Link href="/software">
              <Button className="gradient-bg text-white rounded-xl">Back to Software Portal</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <ModuleGuard moduleKey="software" moduleName="Software Solutions">
      <Navbar />
      <main className="pt-24 pb-16 min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <Link href="/software" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Software Directory
          </Link>

          {/* Hero Section */}
          <ScrollReveal direction="up">
            <div className="glass-card p-6 md:p-8 mb-8 border">
              <div className="flex flex-col lg:flex-row gap-6 items-start">
                <div className="w-24 h-24 rounded-3xl gradient-bg flex items-center justify-center shrink-0 shadow-lg">
                  <Monitor className="w-12 h-12 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold">{sw.name}</h1>
                    <Badge variant="outline">{sw.category}</Badge>
                    <Badge className="gradient-bg text-white border-0">v{sw.version}</Badge>
                  </div>
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{sw.desc}</p>
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span>📦 Size: {sw.size}</span>
                    <span>📥 {sw.downloads} Downloads</span>
                    <span>💻 Platforms: {sw.platforms.join(", ")}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 w-full lg:w-auto shrink-0">
                  <Button onClick={() => setActiveTab("downloads")} className="gradient-bg text-white rounded-xl">
                    <Download className="w-4 h-4 mr-2" /> Download v{sw.version}
                  </Button>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Sub Navigation */}
          <div className="flex border-b border-border mb-8 overflow-x-auto gap-2">
            {[
              { id: "overview", label: "Overview" },
              { id: "downloads", label: "Downloads & Builds" },
              { id: "history", label: "Changelog" },
              { id: "docs", label: "Documentation" },
              { id: "support", label: "Technical Support" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-4 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <ScrollReveal direction="up">
            <div className="glass-card p-6 md:p-8 border min-h-[300px]">
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold mb-2">Description &amp; Architecture</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">{sw.longDesc}</p>
                  <div>
                    <h3 className="text-sm font-bold mb-3">Key Features &amp; Modules</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {sw.features.map((f) => (
                        <div key={f} className="p-3 bg-muted/40 rounded-xl border flex items-center gap-2.5 text-xs font-medium">
                          <Cpu className="w-4 h-4 text-primary shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "downloads" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold mb-4">Select Your Operating System Platform</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {sw.platforms.map((plat) => (
                      <div key={plat} className="p-5 border rounded-2xl bg-card/40 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-base mb-1">{plat}</h3>
                          <p className="text-xs text-muted-foreground mb-4">Official stable production build for {plat} 64-bit architecture.</p>
                        </div>
                        <Button
                          onClick={() => handleDownload(plat)}
                          disabled={downloading === plat}
                          className="gradient-bg text-white rounded-xl text-xs flex items-center justify-center gap-2"
                        >
                          <Download className="w-3.5 h-3.5" />
                          {downloading === plat ? "Downloading..." : `Download for ${plat}`}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "history" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold mb-4">Release Log</h2>
                  <div className="space-y-6">
                    {sw.history.map((log, index) => (
                      <div key={log.ver} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold shrink-0">{log.ver}</div>
                          {index < sw.history.length - 1 && <div className="w-0.5 flex-1 bg-border my-2" />}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-baseline gap-2 mb-1">
                            <h3 className="font-bold text-sm">Version {log.ver}</h3>
                            <span className="text-xs text-muted-foreground">({log.date})</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{log.note}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "docs" && (
                <div className="space-y-6 text-center py-10">
                  <BookOpen className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h2 className="text-xl font-bold mb-2">Guides &amp; API Documentation</h2>
                  <p className="text-muted-foreground max-w-md mx-auto mb-6">Access setup walkthroughs, driver installs, API specifications, and code snippet guides for {sw.name}.</p>
                  <Button variant="outline" className="rounded-xl flex gap-2 mx-auto"><ExternalLink className="w-4 h-4" /> Go to Documentation</Button>
                </div>
              )}

              {activeTab === "support" && (
                <div className="space-y-6 text-center py-10">
                  <MessageSquare className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h2 className="text-xl font-bold mb-2">Need Technical Support?</h2>
                  <p className="text-muted-foreground max-w-md mx-auto mb-6">Have issues compiling or configuring the system? Raise a direct enquiry or start a ticket with our engineer group.</p>
                  <Link href="/contact"><Button className="gradient-bg text-white rounded-xl">Contact Technical Support</Button></Link>
                </div>
              )}
            </div>
          </ScrollReveal>
        </div>
      </main>
      <Footer />
    </ModuleGuard>
  );
}
