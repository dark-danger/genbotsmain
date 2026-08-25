"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Star, Quote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { publicApi } from "@/lib/api";

const DEFAULT_TESTIMONIALS = [
  { id: "1", name: "Dr. Priya Mehta", role: "Principal, Delhi Public School", content: "GenBots transformed our school's robotics lab. The students are more engaged than ever. Their support team is exceptional.", rating: 5 },
  { id: "2", name: "Rajesh Kumar", role: "CTO, TechVentures Inc", content: "We've been using GenBots IoT solutions for our industrial automation needs. Reliable, scalable, and great support.", rating: 5 },
  { id: "3", name: "Prof. Sneha Kapoor", role: "HOD Electronics, IIT Kanpur", content: "The innovation lab setup by GenBots is world-class. It has significantly enhanced our research capabilities.", rating: 5 },
  { id: "4", name: "Amit Patel", role: "Founder, SmartHome Solutions", content: "GenBots home automation products are innovative and affordable. Perfect for the Indian market.", rating: 4 },
];

export function TestimonialsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const { data: apiTestimonials } = useQuery({
    queryKey: ["homeTestimonials"],
    queryFn: async () => {
      try {
        const res = await publicApi.testimonials();
        return res.data;
      } catch {
        return [];
      }
    },
    staleTime: 60 * 1000,
  });

  const displayList = apiTestimonials && apiTestimonials.length > 0
    ? apiTestimonials.map((t: any) => ({
        id: t.id,
        name: t.name,
        role: t.designation || t.company || "Verified Customer",
        content: t.content,
        rating: t.rating || 5,
      }))
    : DEFAULT_TESTIMONIALS;

  return (
    <section ref={ref} className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} className="text-center mb-14">
          <Badge variant="outline" className="mb-4 rounded-full px-4 py-1">Customer Reviews</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our <span className="gradient-text">Clients & Learners Say</span></h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayList.map((t: any, i: number) => (
            <motion.div key={t.id || t.name} initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.1 }}>
              <div className="glass-card p-6 h-full flex flex-col justify-between">
                <div>
                  <Quote className="w-8 h-8 text-primary/20 mb-3" />
                  <p className="text-muted-foreground mb-4 italic">&ldquo;{t.content}&rdquo;</p>
                </div>
                <div>
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
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
