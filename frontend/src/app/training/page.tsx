import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Clock, Users, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ModuleGuard } from "@/components/layout/ModuleGuard";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Training", description: "Enroll in IoT, robotics, and AI courses, bootcamps, and workshops by GenBots." };

const courses = [
  { title: "Hands-on Arduino & Sensor Bootcamp", slug: "arduino-bootcamp", type: "Online Bootcamp", level: "Beginner", duration: "3 weeks", price: "₹1,999", instructor: "Yash (Founder, GenBots)", students: 78, rating: 4.9, featured: true },
  { title: "ESP32 & IoT Smart Automation", slug: "esp32-iot-automation", type: "Live Workshop", level: "Intermediate", duration: "4 weeks", price: "₹2,999", instructor: "Yash (Founder, GenBots)", students: 54, rating: 4.9 },
  { title: "School Robotics & Obstacle Avoidance", slug: "school-robotics", type: "Hands-on Lab", level: "Beginner", duration: "2 weeks", price: "₹1,499", instructor: "Yash (Founder, GenBots)", students: 46, rating: 4.8 },
  { title: "Microcontroller Circuit Building", slug: "circuit-building", type: "Practical Workshop", level: "Beginner to Intermediate", duration: "2 weeks", price: "₹1,799", instructor: "Yash (Founder, GenBots)", students: 32, rating: 4.9 },
];

export default function TrainingPage() {
  return (
    <ModuleGuard moduleKey="training" moduleName="Training & STEM Workshops">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-3 rounded-full px-4 py-1 text-xs">200+ Students Trained Online</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Hands-on Robotics <span className="gradient-text">Training</span></h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">Learn directly from Yash (Founder & Lead Engineer) with practical hardware kits, live coding, and step-by-step project builds.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-2 max-w-4xl mx-auto gap-6">
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
    </ModuleGuard>
  );
}
