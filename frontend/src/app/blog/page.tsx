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
      <main className="pt-24 pb-16" id="main-content">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-10">
              <Badge variant="outline" className="mb-4 rounded-full px-4 py-1">📝 Blog</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Our <span className="gradient-text">Blog</span></h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
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
                    className={`cursor-pointer transition-all ${activeCategory === cat ? "gradient-bg text-white border-0" : "hover:bg-primary/10"}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Blog Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((post: any, i: number) => (
              <ScrollReveal key={post.id || post.slug} delay={i * 0.08}>
                <Link href={`/blog/${post.slug}`}>
                  <div className="glass-card overflow-hidden group hover:glow-sm hover:-translate-y-2 transition-all duration-300 h-full flex flex-col">
                    {/* Cover Image */}
                    <div className="h-52 relative overflow-hidden bg-gradient-to-br from-emerald-500/5 to-cyan-500/5">
                      {post.cover_image ? (
                        <img
                          src={post.cover_image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-5xl opacity-30 group-hover:scale-125 transition-transform duration-500" aria-hidden="true">📝</span>
                        </div>
                      )}
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      {/* View count badge */}
                      {post.view_count && (
                        <span className="absolute top-3 right-3 text-[11px] font-medium text-white/90 bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-md flex items-center gap-1">
                          <Eye className="w-3 h-3" /> {post.view_count.toLocaleString()}
                        </span>
                      )}
                      {/* Category badge on image */}
                      <Badge className="absolute bottom-3 left-3 rounded-full gradient-bg text-white border-0 text-[10px] shadow-lg">
                        {post.category || "General"}
                      </Badge>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex-1 flex flex-col">
                      <h2 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-snug">{post.title}</h2>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">{post.excerpt}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-4 border-t border-border/50">
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
      <Footer />
    </>
  );
}
