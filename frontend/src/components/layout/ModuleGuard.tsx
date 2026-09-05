"use client";

import React from "react";
import Link from "next/link";
import { useSiteSettings } from "@/store/settings";
import { Button } from "@/components/ui/button";
import { Wrench, ArrowLeft, Home, Sparkles } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

interface ModuleGuardProps {
  moduleKey: string;
  moduleName: string;
  children: React.ReactNode;
}

export function ModuleGuard({ moduleKey, moduleName, children }: ModuleGuardProps) {
  const { isModuleEnabled, isLoading } = useSiteSettings();

  // If still loading or enabled, render children
  if (isLoading || isModuleEnabled(moduleKey)) {
    return <>{children}</>;
  }

  // If disabled, show maintenance / coming soon view
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background flex items-center justify-center pt-20 pb-16 px-4">
        <div className="glass-card border border-border/80 max-w-lg w-full p-8 md:p-10 text-center rounded-3xl shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95">
          {/* Ambient Glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-accent/20 rounded-full blur-3xl pointer-events-none" />

          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto mb-6 shadow-inner">
            <Wrench className="w-8 h-8 animate-pulse" />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted border border-border text-[11px] font-medium text-muted-foreground mb-4">
            <Sparkles className="w-3.5 h-3.5 text-primary" /> Under Active Development
          </div>

          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
            {moduleName} <span className="gradient-text">Coming Soon</span>
          </h2>

          <p className="text-sm text-muted-foreground leading-relaxed mb-8">
            This module has been temporarily disabled while our engineering team builds and upgrades this section. Please explore our other active offerings or check back shortly!
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/">
              <Button className="gradient-bg text-white rounded-xl w-full sm:w-auto flex items-center justify-center gap-2 shadow-md">
                <Home className="w-4 h-4" /> Return to Homepage
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="rounded-xl w-full sm:w-auto flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
