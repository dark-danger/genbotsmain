import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Briefcase, MapPin, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Careers", description: "Join GenBots and help us build the future of IoT, robotics, and AI." };

const jobs = [
  { id: "iot-engineer", title: "Senior IoT Engineer", dept: "Engineering", type: "Full-time", location: "Bangalore, India", exp: "4-6 years", desc: "Lead the development of next-generation IoT devices. Experience with ESP32, FreeRTOS, and MQTT required." },
  { id: "full-stack-dev", title: "Full Stack Developer", dept: "Software", type: "Full-time", location: "Remote", exp: "3-5 years", desc: "Build scalable web applications for device management. Next.js, FastAPI, and PostgreSQL expertise needed." },
  { id: "ai-researcher", title: "AI/ML Researcher", dept: "R&D", type: "Full-time", location: "Bangalore, India", exp: "2-5 years", desc: "Develop edge AI models for computer vision and sensor data anomaly detection." },
  { id: "sales-executive", title: "Technical Sales Executive", dept: "Sales", type: "Full-time", location: "Mumbai, India", exp: "1-3 years", desc: "Drive B2B sales for enterprise IoT solutions and lab setups across western India." },
  { id: "content-creator", title: "Technical Content Creator", dept: "Marketing", type: "Part-time", location: "Remote", exp: "0-2 years", desc: "Create tutorials, documentation, and video content for our maker community." },
];

export default function CareerPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 rounded-full px-4 py-1">Join the Team</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Build the <span className="gradient-text">Future</span> With Us</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">We are always looking for passionate individuals who want to push the boundaries of technology and education.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-10">
            {/* Why Join Us */}
            <div className="lg:col-span-1 space-y-6">
              <h2 className="text-2xl font-bold mb-4">Why GenBots?</h2>
              {[
                { title: "Innovative Culture", desc: "Work on cutting-edge technologies in IoT, AI, and robotics." },
                { title: "Impactful Work", desc: "Help democratize tech education and solve real industrial problems." },
                { title: "Continuous Learning", desc: "Generous learning budget and access to all our courses and hardware." },
                { title: "Flexible Environment", desc: "Hybrid work options and flexible hours for most roles." },
              ].map((benefit, i) => (
                <div key={i} className="glass-card p-5">
                  <h3 className="font-semibold mb-1">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                </div>
              ))}
            </div>

            {/* Open Positions */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold mb-6">Open Positions <Badge className="ml-2 gradient-bg text-white">{jobs.length}</Badge></h2>
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div key={job.id} className="glass-card p-6 flex flex-col md:flex-row gap-6 justify-between hover:glow-sm transition-all group">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{job.title}</h3>
                        <Badge variant="secondary" className="rounded-md">{job.dept}</Badge>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                        <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {job.type}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location}</span>
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {job.exp}</span>
                      </div>
                      
                      <p className="text-muted-foreground text-sm">{job.desc}</p>
                    </div>
                    <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center">
                      <Button className="gradient-bg text-white rounded-xl">Apply Now</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
