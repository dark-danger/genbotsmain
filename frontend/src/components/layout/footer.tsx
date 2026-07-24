"use client";

import Link from "next/link";
import { Bot, Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const footerLinks = {
  Products: [
    { label: "IoT Sensors", href: "/store?category=iot-sensors" },
    { label: "Arduino Products", href: "/store?category=arduino-products" },
    { label: "ESP32 Products", href: "/store?category=esp32-products" },
    { label: "Robotics Kits", href: "/store?category=robotics-kits" },
    { label: "STEM Kits", href: "/store?category=stem-kits" },
    { label: "Home Automation", href: "/store?category=home-automation" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Our Services", href: "/services" },
    { label: "Projects", href: "/projects" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/career" },
    { label: "Contact", href: "/contact" },
  ],
  Resources: [
    { label: "Software", href: "/software" },
    { label: "Training", href: "/training" },
    { label: "Lab Setup", href: "/lab-setup" },
    { label: "Documentation", href: "/docs" },
    { label: "Support", href: "/support" },
    { label: "FAQ", href: "/#faq" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      {/* Newsletter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="glass-card p-8 md:p-12 text-center mb-16">
          <h3 className="text-2xl md:text-3xl font-bold mb-2">
            Stay Updated with <span className="gradient-text">GenBots</span>
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Get the latest product updates, tutorials, and exclusive offers delivered to your inbox.
          </p>
          <form className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="newsletter-email" className="sr-only">
              Email Address
            </label>
            <Input
              id="newsletter-email"
              type="email"
              placeholder="Enter your email address"
              className="rounded-xl bg-background/50 flex-1"
              required
            />
            <Button type="submit" className="gradient-bg text-white rounded-xl px-6 shrink-0">
              Subscribe <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>
        </div>

        {/* Footer Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">
                Gen<span className="gradient-text">Bots</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Innovating the Future through IoT, Robotics & AI. Building the next generation of connected technology.
            </p>
            <div className="space-y-2">
              <a href="mailto:contact@genbots.in" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Mail className="w-4 h-4" /> contact@genbots.in
              </a>
              <a href="tel:+919876543210" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Phone className="w-4 h-4" /> +91 98765 43210
              </a>
              <p className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" /> Bangalore, Karnataka, India
              </p>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-sm mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} GenBots. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Terms of Service
          </Link>
          <Link href="/refund" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Refund Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
