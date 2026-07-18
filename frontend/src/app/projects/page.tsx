import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ExternalLink, Users, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Projects", description: "Explore GenBots portfolio of IoT, AI, and robotics projects developed for clients and students." };

const projects = [
  { title: "Smart Campus IoT System", slug: "smart-campus-iot", category: "IoT", client: "ABC University", desc: "Complete IoT infrastructure for campus monitoring, including smart lighting, energy tracking, and security access control.", tech: ["ESP32", "MQTT", "React", "PostgreSQL"], status: "Completed", type: "Client" },
  { title: "Automated Greenhouse", slug: "automated-greenhouse", category: "Agriculture", client: "GreenFarms Ltd", desc: "AI-powered greenhouse automation system with precise climate control, automated irrigation, and crop health monitoring.", tech: ["Raspberry Pi", "TensorFlow", "Python", "LoRa"], status: "Completed", type: "Client" },
  { title: "Industrial Safety Monitor", slug: "industrial-safety-monitor", category: "Industrial", client: "SafeTech Industries", desc: "Real-time worker safety monitoring system using edge AI for PPE detection and hazardous zone alerts.", tech: ["Arduino", "Computer Vision", "Node.js"], status: "Running", type: "Client" },
  { title: "Autonomous Delivery Bot", slug: "autonomous-delivery-bot", category: "Robotics", client: "Internal Research", desc: "Indoor autonomous delivery robot with SLAM navigation, obstacle avoidance, and fleet management system.", tech: ["ROS2", "LiDAR", "C++", "Vue.js"], status: "Running", type: "Internal" },
  { title: "Smart Water Management", slug: "smart-water-management", category: "Smart City", client: "Metro Municipality", desc: "City-wide water leak detection and quality monitoring network using low-power IoT sensors.", tech: ["NB-IoT", "AWS", "Grafana"], status: "Upcoming", type: "Client" },
  { title: "AI Waste Sorting System", slug: "ai-waste-sorting", category: "Environment", client: "EcoRecycle", desc: "Automated conveyor belt waste sorting system using high-speed cameras and machine learning.", tech: ["PyTorch", "OpenCV", "PLC"], status: "Completed", type: "Client" },
];

export default function ProjectsPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our <span className="gradient-text">Projects</span></h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">Discover how we are applying IoT, robotics, and AI to solve real-world problems.</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {["All", "IoT", "Robotics", "AI", "Industrial", "Agriculture"].map(filter => (
              <Badge key={filter} variant={filter === "All" ? "default" : "outline"} className={filter === "All" ? "gradient-bg text-white border-0 cursor-pointer" : "cursor-pointer"}>
                {filter}
              </Badge>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <div key={project.slug} className="glass-card overflow-hidden group hover:glow-sm hover:-translate-y-1 transition-all flex flex-col h-full">
                <div className="h-56 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center relative">
                  <span className="text-6xl opacity-40 group-hover:scale-110 transition-transform duration-500">🚀</span>
                  <Badge className={`absolute top-4 right-4 text-white border-0 ${project.status === 'Completed' ? 'bg-emerald-500' : project.status === 'Running' ? 'bg-cyan-500' : 'bg-orange-500'}`}>
                    {project.status}
                  </Badge>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <Badge variant="outline" className="w-fit mb-3">{project.category}</Badge>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{project.title}</h3>
                  <p className="text-muted-foreground mb-4 text-sm flex-1">{project.desc}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-5">
                    {project.tech.map(t => (
                      <span key={t} className="text-xs px-2 py-1 rounded bg-secondary/50 text-secondary-foreground">{t}</span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-border pt-4 mt-auto">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Users className="w-3.5 h-3.5 mr-1" /> {project.client}
                    </div>
                    <a href={`/projects/${project.slug}`} className="text-sm font-medium text-primary flex items-center hover:underline">
                      View Details <ExternalLink className="w-3.5 h-3.5 ml-1" />
                    </a>
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
