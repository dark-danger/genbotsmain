"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CheckCircle2, ArrowRight, X, Send, School, User, Mail, Phone, MapPin, Building } from "lucide-react";
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
    } catch (err: any) {
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
                <Button
                  onClick={() => handleOpenModal(pkg.name)}
                  className={pkg.popular ? "gradient-bg text-white w-full rounded-xl" : "w-full rounded-xl"}
                  variant={pkg.popular ? "default" : "outline"}
                >
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
              <Button size="lg" onClick={() => handleOpenModal("Free Consultation")} className="gradient-bg text-white rounded-xl px-8 h-12">
                Schedule a Free Consultation <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* REQUEST QUOTE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card bg-background border border-border w-full max-w-xl p-6 md:p-8 rounded-2xl relative shadow-2xl overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-2 rounded-full hover:bg-muted"
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
                  Thank you! Our lab setup team will review your institution's requirements and get in touch with you shortly.
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

