import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Clock, Users, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Training", description: "Enroll in IoT, robotics, and AI courses, bootcamps, and workshops by GenBots." };

const courses = [
  { title: "IoT Fundamentals Bootcamp", slug: "iot-fundamentals", type: "Bootcamp", level: "Beginner", duration: "4 weeks", price: "₹4,999", instructor: "Dr. Rahul Sharma", students: 156, rating: 4.8, featured: true },
  { title: "Advanced Robotics Workshop", slug: "advanced-robotics", type: "Workshop", level: "Advanced", duration: "2 days", price: "₹2,999", instructor: "Prof. Anita Desai", students: 89, rating: 4.9 },
  { title: "AI & ML Certification", slug: "ai-ml-certification", type: "Certification", level: "Intermediate", duration: "8 weeks", price: "₹9,999", instructor: "Dr. Vikram Singh", students: 234, rating: 4.7 },
  { title: "Arduino Programming 101", slug: "arduino-programming", type: "Online", level: "Beginner", duration: "3 weeks", price: "₹1,999", instructor: "Priya Mehta", students: 412, rating: 4.6 },
  { title: "ESP32 & MQTT Masterclass", slug: "esp32-mqtt-masterclass", type: "Online", level: "Intermediate", duration: "5 weeks", price: "₹3,999", instructor: "Amit Kumar", students: 178, rating: 4.8 },
  { title: "PCB Design Workshop", slug: "pcb-design-workshop", type: "Workshop", level: "Intermediate", duration: "3 days", price: "₹4,499", instructor: "Sneha Kapoor", students: 67, rating: 4.9 },
];

export default function TrainingPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Training <span className="gradient-text">Programs</span></h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">Learn from industry experts with hands-on courses in IoT, robotics, and AI.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course.slug} className="glass-card overflow-hidden hover:glow-sm hover:-translate-y-1 transition-all">
                <div className="h-44 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 flex items-center justify-center relative">
                  <span className="text-5xl opacity-50">🎓</span>
                  <Badge className="absolute top-3 left-3 gradient-bg text-white border-0">{course.type}</Badge>
                </div>
                <div className="p-6">
                  <h3 className="font-bold mb-2">{course.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">By {course.instructor}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-xs px-2 py-1 rounded-full bg-muted">{course.level}</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-muted flex items-center gap-1"><Clock className="w-3 h-3" />{course.duration}</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-muted flex items-center gap-1"><Users className="w-3 h-3" />{course.students}</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-muted flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500" />{course.rating}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold gradient-text">{course.price}</span>
                    <Button size="sm" className="gradient-bg text-white rounded-xl">Enroll Now</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
