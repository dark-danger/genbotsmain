"use client";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const stats = [
  { value: "65+", label: "Sensors & Modules", icon: "📦" },
  { value: "5+", label: "School Labs Setup", icon: "🏫" },
  { value: "200+", label: "Students Trained Online", icon: "🎓" },
  { value: "Govt MSME", label: "Registered Enterprise", icon: "🏛️" },
  { value: "April 2026", label: "Founded by Yash", icon: "🚀" },
  { value: "100%", label: "Hands-on Practical", icon: "⚡" },
];

export function StatsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-cyan-500/5" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="glass-card p-6 text-center hover:glow-sm transition-all"
            >
              <span className="text-3xl mb-2 block">{stat.icon}</span>
              <div className="text-2xl md:text-3xl font-bold gradient-text mb-1">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
