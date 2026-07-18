import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Lab Setup", description: "Complete IoT and robotics lab setup solutions for schools and universities by GenBots." };

const packages = [
  { 
    name: "Starter Lab", 
    target: "Primary & Middle Schools", 
    desc: "Introduce young minds to the basics of electronics, coding, and robotics.",
    features: [
      "10x STEM Explorer Kits",
      "5x Basic Arduino Kits",
      "Basic Tools & Components",
      "Printable Curriculum Material",
      "1 Day Teacher Training"
    ]
  },
  { 
    name: "Advanced Lab", 
    target: "High Schools & Colleges", 
    desc: "Comprehensive lab for advanced robotics, IoT, and embedded systems.",
    features: [
      "20x GenBots IoT Starter Kits",
      "10x Robotics Pro Kits",
      "3D Printer & Basic Tools",
      "Complete Digital Curriculum",
      "3 Days Teacher Training",
      "1 Year Technical Support"
    ],
    popular: true
  },
  { 
    name: "Innovation Hub", 
    target: "Universities & Research", 
    desc: "State-of-the-art facility for AI, advanced robotics, and industrial IoT.",
    features: [
      "AI Vision Modules & Edge Devices",
      "Industrial Automation Trainers",
      "Custom PCB Fabrication Setup",
      "High-end 3D Printers & CNC",
      "Industry Partnership Program",
      "Dedicated Support Engineer"
    ]
  }
];

export default function LabSetupPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 rounded-full px-4 py-1">Educational Solutions</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Next-Gen <span className="gradient-text">Innovation Labs</span></h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">We provide turnkey solutions to establish state-of-the-art IoT and Robotics laboratories for educational institutions.</p>
          </div>

          {/* Packages */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {packages.map((pkg) => (
              <div key={pkg.name} className={`glass-card p-8 flex flex-col relative ${pkg.popular ? 'border-primary ring-1 ring-primary' : ''}`}>
                {pkg.popular && (
                  <Badge className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 gradient-bg text-white border-0">Most Popular</Badge>
                )}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-1">{pkg.name}</h3>
                  <p className="text-primary font-medium text-sm mb-3">{pkg.target}</p>
                  <p className="text-muted-foreground text-sm">{pkg.desc}</p>
                </div>
                <div className="flex-1 space-y-4 mb-8">
                  {pkg.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                <Button className={pkg.popular ? "gradient-bg text-white w-full rounded-xl" : "w-full rounded-xl"} variant={pkg.popular ? "default" : "outline"}>
                  Request Quote
                </Button>
              </div>
            ))}
          </div>

          {/* Process Section */}
          <div className="glass-card p-10 md:p-14 text-center">
            <h2 className="text-3xl font-bold mb-10">Our Setup <span className="gradient-text">Process</span></h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { step: "01", title: "Consultation", desc: "Understanding requirements and space assessment" },
                { step: "02", title: "Design", desc: "Lab layout, equipment selection, and curriculum mapping" },
                { step: "03", title: "Deployment", desc: "Delivery, installation, and setup of all equipment" },
                { step: "04", title: "Training", desc: "Comprehensive training for teachers and staff" },
              ].map((process) => (
                <div key={process.step} className="relative">
                  <div className="w-16 h-16 rounded-full gradient-bg mx-auto flex items-center justify-center text-white font-bold text-xl mb-4 relative z-10">
                    {process.step}
                  </div>
                  <h3 className="font-semibold mb-2">{process.title}</h3>
                  <p className="text-sm text-muted-foreground">{process.desc}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-12 pt-12 border-t border-border">
              <h3 className="text-2xl font-bold mb-4">Ready to transform your campus?</h3>
              <Button size="lg" className="gradient-bg text-white rounded-xl px-8 h-12">
                Schedule a Free Consultation <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
