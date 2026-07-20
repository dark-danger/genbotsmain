"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect } from "react";
import Link from "next/link";
import { School, GraduationCap, Cpu, CircuitBoard, Brain, Factory, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const services = [
  { name: "School Lab Setup", icon: School, desc: "Complete robotics & IoT lab for K-12 schools with equipment and training.", color: "from-emerald-500 to-emerald-600" },
  { name: "University Labs", icon: GraduationCap, desc: "Innovation labs for universities with cutting-edge equipment.", color: "from-cyan-500 to-cyan-600" },
  { name: "IoT Development", icon: Cpu, desc: "End-to-end custom IoT product development.", color: "from-emerald-400 to-emerald-500" },
  { name: "PCB Design", icon: CircuitBoard, desc: "Professional PCB design and manufacturing services.", color: "from-teal-500 to-teal-600" },
  { name: "AI Projects", icon: Brain, desc: "AI and ML project development for vision & edge computing.", color: "from-cyan-400 to-cyan-500" },
  { name: "Industrial Automation", icon: Factory, desc: "Industry 4.0 smart factory solutions.", color: "from-emerald-600 to-emerald-700" },
];

export function ServicesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!gridRef.current) return;
    const cards = gridRef.current.children;
    const tween = gsap.fromTo(
      cards,
      { opacity: 0, y: 50, rotateX: 10 },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: gridRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      }
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return (
    <section ref={ref} className="py-24 relative" aria-labelledby="services-heading">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/3 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <Badge variant="outline" className="mb-4 rounded-full px-4 py-1">🛠️ What We Do</Badge>
          <h2 id="services-heading" className="text-3xl md:text-4xl font-bold mb-4">
            Our <span className="gradient-text">Services</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            End-to-end IoT, robotics, and AI solutions for education and industry.
          </p>
        </motion.div>

        <div ref={gridRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((svc) => (
            <div
              key={svc.name}
              className="glass-card p-6 group hover:glow-sm transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${svc.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg`}>
                <svc.icon className="w-7 h-7 text-white" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">{svc.name}</h3>
              <p className="text-sm text-muted-foreground mb-5">{svc.desc}</p>
              <Link href="/services" className="text-sm font-medium text-primary flex items-center group/link">
                Learn More
                <ArrowRight className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform" aria-hidden="true" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
