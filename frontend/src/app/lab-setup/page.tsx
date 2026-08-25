"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CheckCircle2, ArrowRight, X, Send, User, Mail, Phone, MapPin, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cmsApi } from "@/lib/api";

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
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    personName: "",
    schoolName: "",
    email: "",
    phone: "",
    address: "",
    message: "",
  });

  const handleOpenModal = (pkgName?: string) => {
    if (pkgName) setSelectedPackage(pkgName);
    else setSelectedPackage("Custom Consultation");
    setIsModalOpen(true);
    setSubmitted(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Format details cleanly for backend contact inquiries table
      const formattedMessage = `[LAB SETUP QUOTE REQUEST]
--------------------------------
School/Institution: ${formData.schoolName}
Contact Person: ${formData.personName}
Email: ${formData.email}
Phone: ${formData.phone}
Address: ${formData.address}
Selected Package: ${selectedPackage || "General Inquiry"}
--------------------------------
Additional Notes/Requirements:
${formData.message || "No additional comments provided."}`;

      await cmsApi.contact({
        name: formData.personName,
        email: formData.email,
        phone: formData.phone,
        subject: `Lab Quote: ${formData.schoolName} (${selectedPackage})`,
        message: formattedMessage,
      });

      setSubmitted(true);
      setFormData({
        personName: "",
        schoolName: "",
        email: "",
        phone: "",
        address: "",
        message: "",
      });
    } catch {
      alert("Failed to submit request. Please try again or contact us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 rounded-full px-4 py-1">Complete Infrastructure</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Robotics & IoT <span className="gradient-text">Lab Setup</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Transform your school or college with turnkey robotics, AI, and IoT labs. We supply hardware, curriculum, trainer support, and annual maintenance.
            </p>
          </div>

          {/* Package Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {packages.map((pkg) => (
              <div key={pkg.name} className="glass-card p-8 rounded-2xl flex flex-col justify-between hover:glow-sm transition-all duration-300">
                <div>
                  <Badge variant="secondary" className="mb-4">{pkg.target}</Badge>
                  <h2 className="text-2xl font-bold mb-2">{pkg.name}</h2>
                  <p className="text-muted-foreground text-sm mb-6">{pkg.desc}</p>
                  <ul className="space-y-3 mb-8">
                    {pkg.features.map((feat) => (
                      <li key={feat} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Button
                  onClick={() => {
                    setSelectedPackage(pkg.name);
                    setIsModalOpen(true);
                  }}
                  className="w-full gradient-bg text-white rounded-xl"
                >
                  Request Quote <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            ))}
          </div>

          {/* Process Section */}
          <div className="glass-card p-8 md:p-12 rounded-3xl mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">How We Set Up Your Lab</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { step: "01", title: "Requirement Analysis", desc: "We understand your space, student strength, and educational objectives." },
                { step: "02", title: "Custom Lab Proposal", desc: "Detailed bill of materials, equipment plan, and customized curriculum." },
                { step: "03", title: "Installation & Setup", desc: "Complete delivery, bench setup, wiring, safety protocols, and testing." },
                { step: "04", title: "Teacher Training & Handover", desc: "Comprehensive faculty enablement workshops and ongoing support." },
              ].map((s) => (
                <div key={s.step} className="space-y-2">
                  <span className="text-3xl font-black gradient-text">{s.step}</span>
                  <h3 className="font-bold text-lg">{s.title}</h3>
                  <p className="text-muted-foreground text-sm">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Quote Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="glass-card w-full max-w-lg p-6 md:p-8 rounded-3xl border border-border shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {submitted ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold">Quote Request Submitted!</h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  Thank you! Our lab setup team will review your institution&apos;s requirements and get in touch with you shortly.
                </p>
                <Button onClick={() => setIsModalOpen(false)} className="gradient-bg text-white mt-4 rounded-xl px-6">
                  Close Window
                </Button>
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <Badge variant="outline" className="mb-2">{selectedPackage}</Badge>
                  <h3 className="text-2xl font-bold">Request a Custom Lab Quote</h3>
                  <p className="text-sm text-muted-foreground mt-1">Fill in details for your institution to receive pricing & custom lab proposal.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium block mb-1">Contact Person Name *</label>
                      <div className="relative">
                        <User className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                        <Input
                          placeholder="e.g. Dr. Rajesh Sharma"
                          className="pl-9"
                          value={formData.personName}
                          onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium block mb-1">School / Institution Name *</label>
                      <div className="relative">
                        <Building className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                        <Input
                          placeholder="e.g. Delhi Public School / IIT"
                          className="pl-9"
                          value={formData.schoolName}
                          onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium block mb-1">Official Email Address *</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                        <Input
                          type="email"
                          placeholder="e.g. principal@dps.edu.in"
                          className="pl-9"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium block mb-1">Phone / Mobile Number *</label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                        <Input
                          type="tel"
                          placeholder="e.g. +91 98765 43210"
                          className="pl-9"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium block mb-1">Full Institution Address & City *</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                      <Input
                        placeholder="e.g. Sector 14, Sonipat, Haryana 131001"
                        className="pl-9"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium block mb-1">Lab Requirements / Additional Notes</label>
                    <Textarea
                      placeholder="Specify student capacity, preferred timeline, budget constraints or questions..."
                      rows={3}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>

                  <Button type="submit" disabled={isSubmitting} className="w-full gradient-bg text-white rounded-xl h-11 text-base font-semibold mt-2">
                    {isSubmitting ? "Submitting Request..." : "Submit Quote Request"} <Send className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

