import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Mail, Phone, MapPin, Clock, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contact Us", description: "Get in touch with GenBots for IoT products, lab setup, custom development, and more." };

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact <span className="gradient-text">Us</span></h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">Have a question or want to work with us? We&apos;d love to hear from you.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="space-y-6">
              {[
                { icon: Mail, label: "Email", value: "contact@genbots.in", href: "mailto:contact@genbots.in" },
                { icon: Phone, label: "Phone", value: "+91 98765 43210", href: "tel:+919876543210" },
                { icon: MessageCircle, label: "WhatsApp", value: "+91 98765 43210", href: "https://wa.me/919876543210" },
                { icon: MapPin, label: "Office", value: "GenBots Technology Park, Bangalore, Karnataka 560001, India" },
                { icon: Clock, label: "Hours", value: "Mon-Sat: 9:00 AM - 6:00 PM IST" },
              ].map((item) => (
                <div key={item.label} className="glass-card p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg gradient-bg flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-0.5">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">{item.value}</a>
                    ) : (
                      <p className="text-sm text-muted-foreground">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="glass-card p-8">
                <h2 className="text-xl font-bold mb-6">Send us a Message</h2>
                <form className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div><label className="text-sm font-medium mb-1.5 block">Name</label><Input className="rounded-xl h-11" required /></div>
                    <div><label className="text-sm font-medium mb-1.5 block">Email</label><Input type="email" className="rounded-xl h-11" required /></div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div><label className="text-sm font-medium mb-1.5 block">Phone</label><Input type="tel" className="rounded-xl h-11" /></div>
                    <div><label className="text-sm font-medium mb-1.5 block">Subject</label><Input className="rounded-xl h-11" /></div>
                  </div>
                  <div><label className="text-sm font-medium mb-1.5 block">Message</label><Textarea rows={5} className="rounded-xl" required /></div>
                  <Button type="submit" className="gradient-bg text-white rounded-xl px-8 h-11">Send Message</Button>
                </form>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="mt-12 glass-card overflow-hidden rounded-2xl h-[400px]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d248849.886539092!2d77.49085452891498!3d12.954517016586892!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c9b44e6d%3A0xf8dfc3e8517e4fe0!2sBengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1"
              width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"
              referrerPolicy="no-referrer-when-downgrade" title="GenBots Location"
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
