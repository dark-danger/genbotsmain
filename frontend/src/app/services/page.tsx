import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { School, GraduationCap, Cpu, CircuitBoard, Brain, Factory, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Services", description: "GenBots services: lab setup, IoT development, PCB design, AI projects, and industrial automation." };

const services = [
  { name: "School Lab Setup", slug: "school-lab-setup", icon: School, desc: "Complete robotics & IoT lab for K-12 schools with equipment, curriculum, and teacher training.", features: ["Lab Design & Layout", "Equipment Supply", "Teacher Training", "Curriculum Development", "Annual Maintenance", "Student Workshops"] },
  { name: "University Lab Setup", slug: "university-lab-setup", icon: GraduationCap, desc: "Innovation and research labs for universities with cutting-edge equipment and industry partnerships.", features: ["Research Equipment", "AI/ML Lab Setup", "IoT Lab Setup", "Robotics Lab", "Industry Connect", "Research Support"] },
  { name: "IoT Development", slug: "iot-development", icon: Cpu, desc: "End-to-end custom IoT product development from concept to mass production.", features: ["Hardware Design", "Firmware Development", "Cloud Platform", "Mobile App", "Testing & QA", "Production Support"] },
  { name: "PCB Designing", slug: "pcb-designing", icon: CircuitBoard, desc: "Professional PCB design and manufacturing services for prototypes and production.", features: ["Schematic Design", "PCB Layout", "Prototype Fabrication", "Component Sourcing", "Assembly", "Testing"] },
  { name: "AI Projects", slug: "ai-projects", icon: Brain, desc: "AI and machine learning project development for computer vision, NLP, and edge computing.", features: ["Computer Vision", "NLP Solutions", "Edge AI", "Model Training", "Deployment", "Optimization"] },
  { name: "Industrial Automation", slug: "industrial-automation", icon: Factory, desc: "Industry 4.0 smart factory solutions with IoT integration and monitoring.", features: ["PLC Programming", "SCADA Systems", "IoT Integration", "Real-time Monitoring", "Predictive Maintenance", "Energy Management"] },
];

export default function ServicesPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our <span className="gradient-text">Services</span></h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">End-to-end IoT, robotics, and AI solutions for education and industry.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {services.map((svc) => (
              <div key={svc.slug} className="glass-card p-8 hover:glow-sm transition-all">
                <div className="w-14 h-14 rounded-xl gradient-bg flex items-center justify-center mb-5">
                  <svc.icon className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-xl font-bold mb-3">{svc.name}</h2>
                <p className="text-muted-foreground mb-5">{svc.desc}</p>
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {svc.features.map((f) => (
                    <span key={f} className="text-xs text-muted-foreground flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full gradient-bg" /> {f}
                    </span>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Link href="/contact"><Button variant="outline" className="rounded-xl">Get Quote</Button></Link>
                  <Link href={`/services/${svc.slug}`}><Button variant="ghost" className="rounded-xl text-primary">Learn More <ArrowRight className="w-4 h-4 ml-1" /></Button></Link>
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
