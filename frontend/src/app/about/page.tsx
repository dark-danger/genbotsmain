import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Award, Target, Eye, Heart, Users, Building, Lightbulb, Shield } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "About Us", description: "Learn about GenBots - India's leading IoT, Robotics & AI company." };

const values = [
  { icon: Lightbulb, title: "Innovation", desc: "Pushing boundaries in IoT and robotics" },
  { icon: Shield, title: "Quality", desc: "ISO certified products and processes" },
  { icon: Heart, title: "Education", desc: "Empowering the next generation of innovators" },
  { icon: Users, title: "Community", desc: "Building India's largest maker ecosystem" },
];

const timeline = [
  { year: "2018", title: "Founded", desc: "GenBots was founded with a vision to democratize IoT education in India" },
  { year: "2019", title: "First Lab Setup", desc: "Completed our first school robotics lab in Bangalore" },
  { year: "2020", title: "Product Launch", desc: "Launched our proprietary IoT Starter Kit and GenIDE software" },
  { year: "2021", title: "100+ Schools", desc: "Crossed 100 school partnerships across Karnataka and Tamil Nadu" },
  { year: "2022", title: "University Labs", desc: "Expanded to university innovation labs and research partnerships" },
  { year: "2023", title: "AI & Automation", desc: "Launched AI Vision Module and industrial automation services" },
  { year: "2024", title: "10K Customers", desc: "Reached 10,000+ happy customers and 200+ institutional partners" },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <div className="text-center mb-20">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">About <span className="gradient-text">GenBots</span></h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">We&apos;re on a mission to democratize technology education and provide world-class IoT, Robotics & AI solutions accessible to everyone in India and beyond.</p>
          </div>

          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-8 mb-20">
            <div className="glass-card p-8">
              <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mb-4"><Target className="w-6 h-6 text-white" /></div>
              <h2 className="text-2xl font-bold mb-3">Our Mission</h2>
              <p className="text-muted-foreground">To democratize technology education and provide world-class IoT & robotics solutions accessible to every student, maker, and enterprise in India.</p>
            </div>
            <div className="glass-card p-8">
              <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mb-4"><Eye className="w-6 h-6 text-white" /></div>
              <h2 className="text-2xl font-bold mb-3">Our Vision</h2>
              <p className="text-muted-foreground">To become India&apos;s most trusted and innovative brand for IoT, Robotics & AI products, services, and educational solutions by 2030.</p>
            </div>
          </div>

          {/* Core Values */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-10">Core <span className="gradient-text">Values</span></h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((v) => (
                <div key={v.title} className="glass-card p-6 text-center">
                  <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mx-auto mb-4"><v.icon className="w-6 h-6 text-white" /></div>
                  <h3 className="font-semibold mb-1">{v.title}</h3>
                  <p className="text-sm text-muted-foreground">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-10">Our <span className="gradient-text">Journey</span></h2>
            <div className="max-w-3xl mx-auto space-y-6">
              {timeline.map((item, i) => (
                <div key={item.year} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center text-white font-bold text-sm shrink-0">{item.year}</div>
                    {i < timeline.length - 1 && <div className="w-0.5 flex-1 bg-primary/20 mt-2" />}
                  </div>
                  <div className="glass-card p-5 flex-1 mb-2">
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div className="glass-card p-8 md:p-12 text-center">
            <Award className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-4">Achievements & Certifications</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
              <div><p className="text-3xl font-bold gradient-text">ISO 9001</p><p className="text-sm text-muted-foreground">Quality Certified</p></div>
              <div><p className="text-3xl font-bold gradient-text">MSME</p><p className="text-sm text-muted-foreground">Registered</p></div>
              <div><p className="text-3xl font-bold gradient-text">Startup India</p><p className="text-sm text-muted-foreground">Recognized</p></div>
              <div><p className="text-3xl font-bold gradient-text">Make in India</p><p className="text-sm text-muted-foreground">Certified</p></div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
