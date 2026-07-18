"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Star, Quote } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const testimonials = [
  { name: "Dr. Priya Mehta", role: "Principal, Delhi Public School", content: "GenBots transformed our school's robotics lab. The students are more engaged than ever. Their support team is exceptional.", rating: 5 },
  { name: "Rajesh Kumar", role: "CTO, TechVentures Inc", content: "We've been using GenBots IoT solutions for our industrial automation needs. Reliable, scalable, and great support.", rating: 5 },
  { name: "Prof. Sneha Kapoor", role: "HOD Electronics, IIT Kanpur", content: "The innovation lab setup by GenBots is world-class. It has significantly enhanced our research capabilities.", rating: 5 },
  { name: "Amit Patel", role: "Founder, SmartHome Solutions", content: "GenBots home automation products are innovative and affordable. Perfect for the Indian market.", rating: 4 },
];

export function TestimonialsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section ref={ref} className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} className="text-center mb-14">
          <Badge variant="outline" className="mb-4 rounded-full px-4 py-1">Testimonials</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our <span className="gradient-text">Clients Say</span></h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((t, i) => (
            <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.1 }}>
              <div className="glass-card p-6 h-full">
                <Quote className="w-8 h-8 text-primary/20 mb-3" />
                <p className="text-muted-foreground mb-4 italic">&ldquo;{t.content}&rdquo;</p>
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
