"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Shield, Truck, HeadphonesIcon, Award, Zap, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const features = [
  { icon: Shield, title: "Quality Tested", desc: "Every microcontroller and sensor is individually bench-tested" },
  { icon: Truck, title: "Fast Shipping", desc: "Reliable delivery across India with careful packaging" },
  { icon: HeadphonesIcon, title: "Maker Support", desc: "Direct guidance and technical support from our lead engineer" },
  { icon: Award, title: "MSME Registered", desc: "Recognized micro-enterprise under Govt. of India" },
  { icon: Zap, title: "Innovation First", desc: "Curated kits designed for real-world school & IoT projects" },
  { icon: Users, title: "200+ Learners", desc: "Empowering 200+ students through hands-on online workshops" },
];

export function WhyChooseSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section ref={ref} className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} className="text-center mb-14">
          <Badge variant="outline" className="mb-4 rounded-full px-4 py-1">Why GenBots</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose <span className="gradient-text">GenBots</span></h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">We&apos;re committed to delivering excellence in every product and service.</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.08 }} className="flex gap-4 group">
              <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <f.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
