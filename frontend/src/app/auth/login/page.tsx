"use client";
import { useState } from "react";
import Link from "next/link";
import { Bot, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const loginStore = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const rawEmail = (formData.get("email") as string) || "";
    const email = rawEmail.toLowerCase().trim();
    const password = formData.get("password") as string;

    try {
      // 1. Get tokens
      const res = await authApi.login({ email, password });
      const { access_token, refresh_token } = res.data;

      // Store in localStorage for api.ts to use if needed (or zustand will handle access_token)
      localStorage.setItem("refresh_token", refresh_token);

      // We must set the token in the store right away so that getMe() can use it via interceptor
      loginStore({ id: "", email, role: "customer" } as any, access_token);

      // 2. Fetch user profile
      const userRes = await authApi.getMe();

      // 3. Save proper user state
      loginStore(userRes.data, access_token);

      window.location.href = "/dashboard";
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { detail?: unknown } | string }; message?: string };
      const d = axiosErr.response?.data;
      let msg: string;
      if (!d) {
        msg = axiosErr.message || "Login failed";
      } else if (typeof d === "object" && typeof d.detail === "string") {
        msg = d.detail;
      } else if (typeof d === "object" && Array.isArray(d.detail)) {
        msg = d.detail.map((e: { msg?: string }) => e.msg ?? JSON.stringify(e)).join("; ");
      } else if (typeof d === "object" && d.detail !== null) {
        msg = JSON.stringify(d.detail);
      } else if (typeof d === "string") {
        msg = d;
      } else {
        msg = `HTTP ${axiosErr.response?.status}: ${JSON.stringify(d)}`;
      }
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-bg items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="relative z-10 text-white text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm p-1.5 flex items-center justify-center mx-auto mb-6 shadow-xl border border-white/20">
            <img src="/logo.png" alt="GenBots Logo" className="w-full h-full object-contain rounded-xl" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Welcome to GenBots</h2>
          <p className="text-white/70">Access your dashboard, manage orders, track shipments, and explore our ecosystem.</p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden shadow-md">
              <img src="/logo.png" alt="GenBots Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-bold">Gen<span className="gradient-text">Bots</span></span>
          </Link>

          <h1 className="text-2xl font-bold mb-2">Sign In</h1>
          <p className="text-muted-foreground mb-8">Enter your credentials to access your account</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email</label>
              <Input name="email" type="email" placeholder="you@example.com" required className="rounded-xl h-11" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Password</label>
              <div className="relative">
                <Input name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" required className="rounded-xl h-11 pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="rounded" /> Remember me</label>
              <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">Forgot password?</Link>
            </div>
            <Button type="submit" className="w-full gradient-bg text-white rounded-xl h-11" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don&apos;t have an account? <Link href="/auth/register" className="text-primary font-medium hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
