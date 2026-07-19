"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { ShieldAlert } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("customer" | "admin" | "superadmin" | "staff")[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, token } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // 1. Check if user is logged in
    if (!token || !user) {
      setIsAuthorized(false);
      router.push(`/auth/login?redirect=${pathname}`);
      return;
    }

    // 2. Customers only
    if (user.role !== "customer") {
      setIsAuthorized(false);
      router.push("/unauthorized"); // or redirect to /admin/dashboard if they are admin
      return;
    }

    // Authorized
    setIsAuthorized(true);
  }, [mounted, user, token, router, pathname]);

  // Show nothing or a loader while checking
  if (isAuthorized === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Not authorized (will be redirected)
  if (isAuthorized === false) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-center p-4">
        <div className="max-w-md space-y-4">
          <ShieldAlert className="w-16 h-16 mx-auto text-destructive" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  // Authorized!
  return <>{children}</>;
}
