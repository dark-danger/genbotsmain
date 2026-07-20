"use client";
import { useState } from "react";
import Link from "next/link";
import { Bot, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/api";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const data: Record<string, string> = {
        email: fd.get("email") as string,
        password: fd.get("password") as string,
        first_name: fd.get("first_name") as string,
        last_name: fd.get("last_name") as string,
      };
      if (fd.get("phone")) data.phone = fd.get("phone") as string;
      
      await authApi.register(data);
      window.location.href = "/auth/login?registered=true";
    } catch (err: any) {
      const d = err.response?.data;
      let msg: string;
      if (!d) {
        msg = err.message || "Registration failed";
      } else if (typeof d.detail === "string") {
        msg = d.detail;
      } else if (Array.isArray(d.detail)) {
        // FastAPI 422: detail is [{loc, msg, type}, ...]
        msg = d.detail.map((e: any) => e.msg ?? JSON.stringify(e)).join("; ");
      } else if (typeof d.detail === "object" && d.detail !== null) {
        msg = JSON.stringify(d.detail);
      } else if (typeof d === "string") {
        msg = d;
      } else {
        msg = `HTTP ${err.response?.status}: ${JSON.stringify(d)}`;
      }
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 gradient-bg items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear_gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="relative z-10 text-white text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-6"><Bot className="w-10 h-10" /></div>
          <h2 className="text-3xl font-bold mb-4">Join GenBots</h2>
          <p className="text-white/70">Create your account to shop IoT products, access software, and join our maker community.</p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center"><Bot className="w-6 h-6 text-white" /></div>
            <span className="text-xl font-bold">Gen<span className="gradient-text">Bots</span></span>
          </Link>
          <h1 className="text-2xl font-bold mb-2">Create Account</h1>
          <p className="text-muted-foreground mb-8">Start your journey with GenBots</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium mb-1.5 block">First Name</label><Input name="first_name" required className="rounded-xl h-11" /></div>
              <div><label className="text-sm font-medium mb-1.5 block">Last Name</label><Input name="last_name" required className="rounded-xl h-11" /></div>
            </div>
            <div><label className="text-sm font-medium mb-1.5 block">Email</label><Input name="email" type="email" required className="rounded-xl h-11" /></div>
            <div><label className="text-sm font-medium mb-1.5 block">Phone (optional)</label><Input name="phone" type="tel" className="rounded-xl h-11" /></div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Password</label>
              <div className="relative">
                <Input name="password" type={showPassword ? "text" : "password"} required minLength={8} className="rounded-xl h-11 pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"><EyeOff className="w-4 h-4" /></button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Min 8 chars, 1 uppercase, 1 lowercase, 1 digit</p>
            </div>
            <Button type="submit" className="w-full gradient-bg text-white rounded-xl h-11" disabled={loading}>
              {loading ? "Creating..." : "Create Account"} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account? <Link href="/auth/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
