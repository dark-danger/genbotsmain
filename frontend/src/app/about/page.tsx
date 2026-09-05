import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Award, Target, Eye, Heart, Users, Building, Lightbulb, ShieldCheck, UserCheck, Calendar, BookOpen, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | GenBots India - Founded by Yash",
  description: "Learn about GenBots' journey, founded by Yash in April 2026. Discover our MSME registered robotics enterprise, 5+ school lab setups, and 200+ trained students.",
};

const values = [
  { icon: Lightbulb, title: "Hands-on Innovation", desc: "Building real hardware circuits and robots from scratch" },
  { icon: ShieldCheck, title: "Tested Quality", desc: "Every sensor, microcontroller, and kit is individually verified" },
  { icon: Heart, title: "Practical STEM Education", desc: "Empowering school students with real-world electronics skills" },
  { icon: Users, title: "Student Mentorship", desc: "Direct guidance and personalized online robotics training" },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          
          {/* Hero */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <Badge variant="outline" className="rounded-full px-4 py-1 text-xs border-primary/30">
              Govt. MSME Registered • Founded April 2026
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              About <span className="gradient-text">GenBots</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We build practical, high-quality robotics hardware, provide turnkey STEM innovation lab setups for schools, and deliver hands-on electronics training for the next generation of Indian engineers.
            </p>
          </div>

          {/* Founder Section */}
          <div className="glass-card p-8 md:p-12 rounded-3xl border border-primary/30 relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="grid md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-4 flex flex-col items-center text-center">
                <div className="w-32 h-32 md:w-36 md:h-36 rounded-3xl gradient-bg flex items-center justify-center text-white text-5xl font-black shadow-xl mb-4">
                  Y
                </div>
                <h3 className="text-2xl font-bold text-foreground">Yash</h3>
                <p className="text-sm text-primary font-semibold">Founder &amp; Lead Robotics Engineer</p>
                <Badge variant="secondary" className="mt-2 text-xs">Solo Founder</Badge>
              </div>

              <div className="md:col-span-8 space-y-4 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/60 border text-xs text-muted-foreground font-mono">
                  <Calendar className="w-3.5 h-3.5 text-primary" /> Started April 2026
                </div>
                <h2 className="text-2xl md:text-3xl font-bold">The Vision Behind GenBots</h2>
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                  GenBots was founded by <strong>Yash in April 2026</strong> with a focused mission: to make hands-on robotics, IoT components, and development boards genuinely accessible and easy to learn for school students, makers, and hobbyists across India.
                </p>
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                  From testing every sensor and designing complete school lab curricula to conducting online training bootcamps, GenBots is driven by a passionate builder mindset dedicated to making India a global robotics hub.
                </p>
              </div>
            </div>
          </div>

          {/* Real Milestone Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card p-6 text-center rounded-2xl border">
              <Building className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-3xl md:text-4xl font-black gradient-text">5+</p>
              <p className="text-xs md:text-sm font-semibold text-foreground mt-1">School Labs Set Up</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Turnkey robotics infrastructure installed</p>
            </div>

            <div className="glass-card p-6 text-center rounded-2xl border">
              <BookOpen className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-3xl md:text-4xl font-black gradient-text">200+</p>
              <p className="text-xs md:text-sm font-semibold text-foreground mt-1">Students Trained Online</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Hands-on Arduino &amp; IoT workshops</p>
            </div>

            <div className="glass-card p-6 text-center rounded-2xl border">
              <Wrench className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-3xl md:text-4xl font-black gradient-text">65+</p>
              <p className="text-xs md:text-sm font-semibold text-foreground mt-1">Hardware &amp; Kit Items</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Sensors, microcontrollers, and DIY kits</p>
            </div>

            <div className="glass-card p-6 text-center rounded-2xl border">
              <ShieldCheck className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="text-3xl md:text-4xl font-black gradient-text">MSME</p>
              <p className="text-xs md:text-sm font-semibold text-foreground mt-1">Registered Enterprise</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Govt. of India Udyam recognized</p>
            </div>
          </div>

          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="glass-card p-8 rounded-3xl space-y-3">
              <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center text-white mb-2">
                <Target className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold">Our Mission</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                To simplify robotics education by supplying high-reliability hardware, transparent pricing, curriculum kits, and interactive online training for school students and makers across India.
              </p>
            </div>

            <div className="glass-card p-8 rounded-3xl space-y-3">
              <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center text-white mb-2">
                <Eye className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold">Our Vision</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                To establish state-of-the-art innovation labs in schools, nurture 10,000+ young robotics creators, and deliver precision electronics designed and assembled in India.
              </p>
            </div>
          </div>

          {/* Core Values */}
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold">Core <span className="gradient-text">Values</span></h2>
              <p className="text-sm text-muted-foreground mt-1">What guides every component we curate and every lab we set up.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((v) => (
                <div key={v.title} className="glass-card p-6 text-center rounded-2xl hover:scale-105 transition-transform">
                  <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mx-auto mb-4 text-white">
                    <v.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-base mb-1">{v.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Real Achievements & Registration */}
          <div className="glass-card p-8 md:p-12 text-center rounded-3xl border border-primary/20 space-y-6">
            <Award className="w-12 h-12 mx-auto text-primary" />
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Official Registration &amp; Accreditation</h2>
              <p className="text-xs md:text-sm text-muted-foreground max-w-xl mx-auto mt-1">
                GenBots operates as a compliant, recognized technology enterprise under the Ministry of Micro, Small and Medium Enterprises (MSME).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto pt-4">
              <div className="p-4 bg-muted/40 rounded-2xl border">
                <p className="text-xl font-bold text-foreground">MSME Udyam</p>
                <p className="text-xs text-emerald-500 font-semibold mt-0.5">Govt. of India Registered</p>
              </div>
              <div className="p-4 bg-muted/40 rounded-2xl border">
                <p className="text-xl font-bold text-foreground">5+ School Labs</p>
                <p className="text-xs text-primary font-semibold mt-0.5">Turnkey Installed</p>
              </div>
              <div className="p-4 bg-muted/40 rounded-2xl border">
                <p className="text-xl font-bold text-foreground">200+ Learners</p>
                <p className="text-xs text-blue-500 font-semibold mt-0.5">Online Trained</p>
              </div>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
