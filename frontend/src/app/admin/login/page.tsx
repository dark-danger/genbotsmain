"use client";
import { useState } from "react";
import { Shield, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminAuthApi } from "@/lib/api";
import { useAdminAuthStore } from "@/store/adminAuth";

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const loginStore = useAdminAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    
    try {
      // 1. Get tokens
      const res = await adminAuthApi.login({ email, password });
      const { access_token, refresh_token } = res.data;
      
      // We don't store admin tokens in localStorage for security (rely entirely on memory)
      // or if we do, use a different key to avoid conflicts with customer tokens.
      localStorage.setItem("admin_refresh_token", refresh_token);
      
      // 2. Fetch admin profile
      // We must pre-load token in state so adminAuthApi can use it
      useAdminAuthStore.setState({ token: access_token });
      const userRes = await adminAuthApi.getMe();
      
      // 3. Save proper user state
      loginStore(userRes.data, access_token);
      
      window.location.href = "/admin/dashboard";
    } catch (err: any) {
      alert(err.response?.data?.detail || "Admin Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="w-16 h-16 rounded-2xl bg-blue-600/10 flex items-center justify-center mx-auto mb-6">
          <Shield className="w-10 h-10 text-blue-600" />
        </div>
        
        <h1 className="text-2xl font-bold mb-2 text-center text-gray-900">Admin Portal</h1>
        <p className="text-muted-foreground mb-8 text-center">Authorized personnel only</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-medium mb-1.5 block text-gray-700">Admin Email</label>
            <Input name="email" type="email" placeholder="admin@example.com" required className="rounded-xl h-11" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block text-gray-700">Password</label>
            <div className="relative">
              <Input name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" required className="rounded-xl h-11 pr-10" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gray-900">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 transition-colors" disabled={loading}>
            {loading ? "Authenticating..." : "Access Portal"} <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>
      </div>
    </div>
  );
}
