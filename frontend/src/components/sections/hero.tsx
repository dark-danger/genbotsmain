"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight, ShoppingCart, Cpu, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { gsap } from "gsap";

// Lazy-load 3D scene to keep initial bundle small (front.md: code-splitting)
const HeroScene = dynamic(
  () => import("@/components/3d/HeroScene").then((mod) => ({ default: mod.HeroScene })),
  { ssr: false }
);

const words = ["IoT", "Robotics", "AI", "Automation", "Innovation"];

export function HeroSection() {
  const [wordIndex, setWordIndex] = useState(0);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // GSAP entrance animation for stats cards
  useEffect(() => {
    if (!statsRef.current) return;
    const cards = statsRef.current.children;
    gsap.fromTo(
      cards,
      { opacity: 0, y: 50, scale: 0.9 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger: 0.12,
        ease: "back.out(1.7)",
        delay: 0.8,
      }
    );
  }, []);

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
      aria-label="Hero section"
    >
      {/* 3D Animated Background (Three.js via R3F) */}
      <HeroScene />

      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 -z-5">
        <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/70 to-emerald-950/30 dark:from-background/95 dark:via-background/80 dark:to-emerald-950/50" />
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm font-medium mb-8"
            role="status"
          >
            <Sparkles className="w-4 h-4 text-emerald-500" aria-hidden="true" />
            <span className="gradient-text">India&apos;s Leading IoT &amp; Robotics Company</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight mb-6"
          >
            Innovating the Future
            <br />
            through{" "}
            <span className="relative inline-flex flex-col overflow-visible h-[1.2em] justify-end align-bottom">
              <AnimatePresence mode="wait">
                <motion.span
                  key={wordIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="gradient-text inline-block"
                >
                  {words[wordIndex]}
                </motion.span>
              </AnimatePresence>
              <motion.span
                className="absolute -bottom-1 left-0 right-0 h-1 gradient-bg rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                key={`line-${wordIndex}`}
                transition={{ duration: 0.5 }}
              />
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            Premium IoT &amp; Robotics products for makers, students, and enterprises.
            Build. Learn. Innovate — with GenBots by your side.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/store">
              <Button size="lg" className="gradient-bg text-white rounded-xl px-8 h-12 text-base shadow-lg hover:shadow-xl glow transition-all group">
                <ShoppingCart className="w-5 h-5 mr-2" aria-hidden="true" />
                Explore Products
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </Button>
            </Link>
            <Link href="/services">
              <Button size="lg" variant="outline" className="rounded-xl px-8 h-12 text-base hover:bg-primary/10 transition-all">
                <Cpu className="w-5 h-5 mr-2" aria-hidden="true" />
                Our Services
              </Button>
            </Link>
          </motion.div>

          {/* Floating Stats Cards with GSAP stagger */}
          <div
            ref={statsRef}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
          >
            {[
              { icon: "🔌", label: "500+ Products", color: "from-emerald-500/20 to-emerald-600/10" },
              { icon: "🏫", label: "200+ Schools", color: "from-cyan-500/20 to-cyan-600/10" },
              { icon: "🤖", label: "50+ Lab Setups", color: "from-emerald-400/20 to-emerald-500/10" },
              { icon: "⭐", label: "10K+ Customers", color: "from-cyan-400/20 to-cyan-500/10" },
            ].map((item) => (
              <motion.div
                key={item.label}
                whileHover={{ y: -5, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                className={`glass-card p-4 text-center cursor-default bg-gradient-to-br ${item.color}`}
              >
                <span className="text-2xl mb-1 block" aria-hidden="true">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center pt-2"
          aria-hidden="true"
        >
          <div className="w-1 h-2 rounded-full bg-primary" />
        </motion.div>
      </motion.div>
    </section>
  );
}
