"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, School, GraduationCap, Cpu, CircuitBoard, Brain, Factory } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const services = [
  { name: "School Lab Setup", desc: "Complete robotics & IoT lab for K-12 schools", icon: School, color: "from-emerald-500 to-emerald-600" },
  { name: "University Lab Setup", desc: "Innovation labs for higher education", icon: GraduationCap, color: "from-cyan-500 to-cyan-600" },
  { name: "IoT Development", desc: "Custom IoT product design & development", icon: Cpu, color: "from-emerald-400 to-emerald-500" },
  { name: "PCB Designing", desc: "Professional PCB design & manufacturing", icon: CircuitBoard, color: "from-cyan-400 to-cyan-500" },
  { name: "AI Projects", desc: "Computer vision, NLP & edge AI solutions", icon: Brain, color: "from-emerald-500 to-cyan-500" },
  { name: "Industrial Automation", desc: "Industry 4.0 & smart factory solutions", icon: Factory, color: "from-cyan-500 to-emerald-500" },
];

export function ServicesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section ref={ref} className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} className="text-center mb-14">
          <Badge variant="outline" className="mb-4 rounded-full px-4 py-1">Our Services</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What We <span className="gradient-text">Offer</span></h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">End-to-end IoT, robotics, and AI solutions for education and industry.</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((svc, i) => (
            <motion.div key={svc.name} initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.08 }}>
              <div className="glass-card p-6 h-full group hover:glow-sm hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${svc.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <svc.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{svc.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{svc.desc}</p>
                <span className="text-sm text-primary font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                  Learn More <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/services">
            <Button variant="outline" size="lg" className="rounded-xl px-8">All Services <ArrowRight className="w-4 h-4 ml-2" /></Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
