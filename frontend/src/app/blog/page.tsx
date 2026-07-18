import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Calendar, User, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Blog", description: "Read articles on IoT, robotics, AI, tutorials, and technology insights from GenBots." };

const posts = [
  { title: "Getting Started with ESP32: A Complete Guide", slug: "getting-started-esp32-guide", excerpt: "Learn everything about ESP32 from setup to deployment.", category: "IoT", author: "Admin GenBots", date: "Jul 10, 2026", tags: ["ESP32", "IoT", "Tutorial"], featured: true },
  { title: "Building a Smart Home with GenBots", slug: "building-smart-home-genbots", excerpt: "Transform your home with GenBots automation products.", category: "IoT", author: "Admin GenBots", date: "Jul 8, 2026", tags: ["Smart Home", "Automation"] },
  { title: "Top 10 Robotics Projects for Students", slug: "top-10-robotics-projects", excerpt: "Inspiring robotics project ideas for students.", category: "Robotics", author: "Admin GenBots", date: "Jul 5, 2026", tags: ["Robotics", "Projects"] },
  { title: "Introduction to MQTT Protocol", slug: "introduction-mqtt-protocol", excerpt: "Understanding MQTT for IoT communications.", category: "Tutorials", author: "Admin GenBots", date: "Jul 2, 2026", tags: ["MQTT", "IoT"] },
  { title: "AI at the Edge: Running ML on ESP32", slug: "ai-edge-ml-esp32", excerpt: "Deploy machine learning models on microcontrollers.", category: "AI", author: "Admin GenBots", date: "Jun 28, 2026", tags: ["AI", "ESP32", "Edge"] },
  { title: "Setting Up Your First Robotics Lab", slug: "setting-up-robotics-lab", excerpt: "A guide for schools planning their first robotics lab.", category: "Education", author: "Admin GenBots", date: "Jun 25, 2026", tags: ["Lab Setup", "Education"] },
];

export default function BlogPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our <span className="gradient-text">Blog</span></h1>
            <p className="text-muted-foreground">Articles, tutorials, and insights on IoT, robotics, and AI.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}>
                <div className="glass-card overflow-hidden group hover:glow-sm hover:-translate-y-1 transition-all h-full">
                  <div className="h-48 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 flex items-center justify-center">
                    <span className="text-5xl opacity-50">📝</span>
                  </div>
                  <div className="p-6">
                    <Badge variant="outline" className="rounded-full mb-3">{post.category}</Badge>
                    <h2 className="font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">{post.title}</h2>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" />{post.author}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{post.date}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
