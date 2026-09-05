"use client";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Calendar, User, Search, Tag, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { blogApi } from "@/lib/api";
import { useState } from "react";
import { ScrollReveal } from "@/components/animations/ScrollAnimations";
import { ModuleGuard } from "@/components/layout/ModuleGuard";

// Static published posts for GenBots blog platform
const fallbackPosts = [
  {
    id: "1",
    title: "What is a Microcontroller? Beginner's Guide 2026 (Types, Uses & Where to Buy)",
    slug: "microcontroller-beginners-guide-2026",
    excerpt: "Break down what a microcontroller is, how it works, Arduino vs ESP32 vs Pi Pico comparison, main components, real-world uses, and how to choose the right board.",
    category: "Microcontrollers",
    author_name: "GenBots Team",
    created_at: "2026-08-09",
    status: "published",
    view_count: 5240,
    cover_image: "/blog-microcontroller-guide.png",
  },
  {
    id: "2",
    title: "Ultrasonic Sensor HC-SR04: Complete Guide for Beginners",
    slug: "ultrasonic-sensor-hc-sr04-guide",
    excerpt: "Learn how the HC-SR04 ultrasonic distance sensor works, how to wire it with Arduino & ESP32, and build real-world projects like obstacle-avoiding robots and smart parking systems.",
    category: "Sensors",
    author_name: "GenBots Team",
    created_at: "2026-08-05",
    status: "published",
    view_count: 3420,
    cover_image: "/blog-ultrasonic-sensor.png",
  },
  {
    id: "3",
    title: "IR Sensor Module: Working, Wiring & Projects",
    slug: "ir-sensor-module-working-wiring-projects",
    excerpt: "Understand infrared (IR) sensor modules — how they detect obstacles, line-following applications, and step-by-step Arduino wiring guide with code examples.",
    category: "Sensors",
    author_name: "GenBots Team",
    created_at: "2026-08-02",
    status: "published",
    view_count: 2870,
    cover_image: "/blog-ir-sensor.png",
  },
  {
    id: "4",
    title: "DHT11 Temperature & Humidity Sensor: Setup & IoT Dashboard",
    slug: "dht11-temperature-humidity-sensor-setup",
    excerpt: "A complete guide to the DHT11 sensor — measure temperature & humidity, connect with Arduino/ESP32, and build a live IoT monitoring dashboard.",
    category: "Sensors",
    author_name: "GenBots Team",
    created_at: "2026-07-28",
    status: "published",
    view_count: 4150,
    cover_image: "/blog-dht11-sensor.png",
  },
];

const categories = ["All", "Microcontrollers", "Sensors", "IoT", "Robotics", "AI", "Tutorials"];

export default function BlogPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const { data: apiPosts } = useQuery({
    queryKey: ["blogPosts"],
    queryFn: async () => {
      const res = await blogApi.list();
      return res.data?.items || res.data || [];
    },
    retry: 1,
  });

  const posts = (apiPosts && apiPosts.length > 0) ? apiPosts : fallbackPosts;

  const filtered = posts.filter((post: any) => {
    const matchCategory = activeCategory === "All" || post.category === activeCategory;
    const matchSearch = post.title?.toLowerCase().includes(search.toLowerCase()) || post.excerpt?.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <>
      <Navbar />
      <ModuleGuard moduleKey="blog" moduleName="Engineering Blog & Articles">
        <main className="pt-28 pb-20 min-h-screen">
          <div className="container mx-auto px-4 max-w-6xl">
            {/* Header */}
            <ScrollReveal>
              <div className="text-center max-w-2xl mx-auto mb-12">
                <Badge variant="outline" className="mb-3">
                  Engineering Blog
                </Badge>
                <h1 className="text-3xl sm:text-4xl font-bold mb-3 tracking-tight">
                  GenBots <span className="gradient-text">Tech Blog</span>
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base">
                  In-depth guides, tutorials, and insights on sensors, IoT, robotics, and AI.
                </p>
              </div>
            </ScrollReveal>

            {/* Search + Filters */}
            <ScrollReveal delay={0.1}>
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-10">
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search articles..."
                    className="pl-9 rounded-xl"
                    aria-label="Search blog articles"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <Badge
                      key={cat}
                      variant={activeCategory === cat ? "default" : "outline"}
                      className="cursor-pointer capitalize rounded-lg px-3 py-1 text-xs transition-colors"
                      onClick={() => setActiveCategory(cat)}
                    >
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((post: any, i: number) => (
                <ScrollReveal key={post.id} delay={i * 0.05}>
                  <Link href={`/blog/${post.slug}`} className="group block h-full">
                    <div className="glass-card overflow-hidden hover:border-primary/50 transition-all duration-300 h-full flex flex-col group-hover:-translate-y-1 group-hover:shadow-lg">
                      {/* Blog Cover Image Preview */}
                      <div className="aspect-video bg-gradient-to-br from-primary/15 via-muted/40 to-background border-b flex items-center justify-center p-6 relative overflow-hidden">
                        <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                        <div className="text-center relative z-10">
                          <span className="text-4xl select-none block mb-1">
                            {post.category === "Microcontrollers" ? "🤖" :
                             post.category === "Sensors" ? "📡" :
                             post.category === "IoT" ? "🌐" :
                             post.category === "Robotics" ? "🦾" :
                             post.category === "AI" ? "🧠" : "⚡"}
                          </span>
                          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {post.category || "Tutorial"}
                          </span>
                        </div>
                        {post.view_count && (
                          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 text-[11px] text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded-full border">
                            <Eye className="w-3 h-3" />
                            {post.view_count.toLocaleString()}
                          </div>
                        )}
                      </div>

                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex items-center gap-2 mb-2.5">
                          <Badge variant="secondary" className="text-[10px] px-2 py-0.5 capitalize">
                            {post.category || "Article"}
                          </Badge>
                          {post.status === "published" && (
                            <span className="text-[10px] text-emerald-500 font-medium flex items-center gap-1">
                              ● Live Guide
                            </span>
                          )}
                        </div>

                        <h2 className="font-semibold text-base mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                          {post.title}
                        </h2>
                        <p className="text-muted-foreground text-xs line-clamp-3 mb-4 flex-1 leading-relaxed">
                          {post.excerpt}
                        </p>

                        <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3 mt-auto">
                          <span className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5" aria-hidden="true" />{post.author_name || "GenBots"}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                            {new Date(post.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-20">
                <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">No articles found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
              </div>
            )}
          </div>
        </main>
      </ModuleGuard>
      <Footer />
    </>
  );
}
