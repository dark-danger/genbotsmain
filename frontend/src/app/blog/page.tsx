"use client";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Calendar, User, ArrowRight, Search, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { blogApi } from "@/lib/api";
import { useState } from "react";
import { ScrollReveal, StaggerReveal } from "@/components/animations/ScrollAnimations";

// Fallback static posts when API is unavailable
const fallbackPosts = [
  { id: "1", title: "Getting Started with ESP32: A Complete Guide", slug: "getting-started-esp32-guide", excerpt: "Learn everything about ESP32 from setup to deployment.", category: "IoT", author_name: "Admin GenBots", created_at: "2026-07-10", status: "published", view_count: 1240 },
  { id: "2", title: "Building a Smart Home with GenBots", slug: "building-smart-home-genbots", excerpt: "Transform your home with GenBots automation products.", category: "IoT", author_name: "Admin GenBots", created_at: "2026-07-08", status: "published", view_count: 890 },
  { id: "3", title: "Top 10 Robotics Projects for Students", slug: "top-10-robotics-projects", excerpt: "Inspiring robotics project ideas for students at every level.", category: "Robotics", author_name: "Admin GenBots", created_at: "2026-07-05", status: "published", view_count: 2100 },
  { id: "4", title: "Introduction to MQTT Protocol", slug: "introduction-mqtt-protocol", excerpt: "Understanding MQTT for IoT communications and device networking.", category: "Tutorials", author_name: "Admin GenBots", created_at: "2026-07-02", status: "published", view_count: 750 },
  { id: "5", title: "AI at the Edge: Running ML on ESP32", slug: "ai-edge-ml-esp32", excerpt: "Deploy machine learning models on microcontrollers for edge computing.", category: "AI", author_name: "Admin GenBots", created_at: "2026-06-28", status: "published", view_count: 1580 },
  { id: "6", title: "Setting Up Your First Robotics Lab", slug: "setting-up-robotics-lab", excerpt: "A guide for schools planning their first robotics and IoT lab.", category: "Education", author_name: "Admin GenBots", created_at: "2026-06-25", status: "published", view_count: 3200 },
];

const categories = ["All", "IoT", "Robotics", "AI", "Tutorials", "Education"];

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
                Articles, tutorials, and insights on IoT, robotics, and AI.
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((post: any, i: number) => (
              <ScrollReveal key={post.id || post.slug} delay={i * 0.05}>
                <Link href={`/blog/${post.slug}`}>
                  <div className="glass-card overflow-hidden group hover:glow-sm hover:-translate-y-1 transition-all h-full flex flex-col">
                    <div className="h-48 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 flex items-center justify-center relative overflow-hidden">
                      <span className="text-5xl opacity-40 group-hover:scale-125 transition-transform duration-500" aria-hidden="true">📝</span>
                      {post.view_count && (
                        <span className="absolute bottom-3 right-3 text-[10px] text-muted-foreground bg-background/80 px-2 py-0.5 rounded-full backdrop-blur-sm">
                          👁 {post.view_count}
                        </span>
                      )}
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <Badge variant="outline" className="rounded-full mb-3 w-fit">{post.category || "General"}</Badge>
                      <h2 className="font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">{post.title}</h2>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">{post.excerpt}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-auto">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" aria-hidden="true" />{post.author_name || "GenBots"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" aria-hidden="true" />
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
