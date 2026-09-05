"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import {
  Menu, Sun, Moon, ShoppingCart, User, Search,
  ChevronDown, Cpu, Code, Wrench, GraduationCap,
  BookOpen, Briefcase, Phone, LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuthStore } from "@/store/auth";
import { useCartStore } from "@/store/cart";
import { useSiteSettings } from "@/store/settings";

const emptySubscribe = () => () => {};

const hrefToModuleKey: Record<string, string> = {
  "/store": "enable_store",
  "/software": "enable_software",
  "/services": "enable_services",
  "/lab-setup": "enable_lab_setup",
  "/projects": "enable_projects",
  "/training": "enable_training",
  "/blog": "enable_blog",
  "/career": "enable_career",
  "/contact": "enable_contact",
};

const mainNav = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Store", href: "/store", icon: ShoppingCart },
  { label: "Software", href: "/software", icon: Code },
  { label: "Services", href: "/services", icon: Wrench },
  { label: "Lab Setup", href: "/lab-setup", icon: GraduationCap },
  { label: "Projects", href: "/projects", icon: Cpu },
  { label: "Training", href: "/training", icon: BookOpen },
  { label: "Blog", href: "/blog", icon: BookOpen },
  { label: "Career", href: "/career", icon: Briefcase },
  { label: "Contact", href: "/contact", icon: Phone },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const { isAuthenticated } = useAuthStore();
  const { itemCount } = useCartStore();
  const { isModuleEnabled } = useSiteSettings();

  const visibleNav = mainNav.filter(item => {
    const key = hrefToModuleKey[item.href];
    return !key || isModuleEnabled(key);
  });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border shadow-lg"
          : "bg-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform overflow-hidden">
              <img src="/logo.jpg" alt="GenBots Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight">
                Gen<span className="gradient-text">Bots</span>
              </span>
              <span className="text-[10px] text-muted-foreground -mt-1 hidden sm:block">
                Learn . Build . Innovate
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {visibleNav.slice(0, 7).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-primary/10 ${isActive(item.href)
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {item.label}
                {isActive(item.href) && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            ))}
            {/* More dropdown for remaining visible items */}
            {visibleNav.length > 7 && (
              <div className="relative group">
                <button className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg transition-all flex items-center gap-1 hover:bg-primary/10">
                  More <ChevronDown className="w-3 h-3" />
                </button>
                <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="glass-card p-2 min-w-[180px]">
                    {visibleNav.slice(7).map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${isActive(item.href)
                            ? "text-primary bg-primary/10"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                          }`}
                      >
                        {item.icon && <item.icon className="w-4 h-4" />}
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="hidden sm:flex rounded-xl">
              <Search className="w-4 h-4" />
            </Button>

            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-xl"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
            )}

            {mounted && isAuthenticated ? (
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="hidden sm:flex gap-2 rounded-xl">
                  <User className="w-4 h-4" />
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/auth/login">
                <Button variant="ghost" size="sm" className="hidden sm:flex gap-2 rounded-xl">
                  <LogIn className="w-4 h-4" />
                  Login
                </Button>
              </Link>
            )}

            {isModuleEnabled("enable_store") && (
              <Link href="/cart" className="relative">
                <Button size="icon" variant="ghost" className="rounded-xl">
                  <ShoppingCart className="w-4 h-4" />
                  {mounted && itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full gradient-bg text-white text-[10px] font-bold flex items-center justify-center shadow-lg">
                      {itemCount > 99 ? "99+" : itemCount}
                    </span>
                  )}
                </Button>
              </Link>
            )}

            {/* Mobile Menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger className="lg:hidden">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-accent hover:text-accent-foreground">
                  <Menu className="w-5 h-5" />
                </div>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0">
                <div className="flex flex-col h-full">
                  <div className="p-6 border-b border-border">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden">
                        <img src="/logo.jpg" alt="GenBots Logo" className="w-full h-full object-contain" />
                      </div>
                      <span className="text-xl font-bold">
                        Gen<span className="gradient-text">Bots</span>
                      </span>
                    </div>
                  </div>
                  <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {visibleNav.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive(item.href)
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                      >
                        {item.icon && <item.icon className="w-5 h-5" />}
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                  <div className="p-4 border-t border-border space-y-2">
                    <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
                      <Button variant="outline" className="w-full rounded-xl">
                        <LogIn className="w-4 h-4 mr-2" /> Login
                      </Button>
                    </Link>
                    <Link href="/auth/register" onClick={() => setMobileOpen(false)}>
                      <Button className="w-full gradient-bg text-white rounded-xl">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
