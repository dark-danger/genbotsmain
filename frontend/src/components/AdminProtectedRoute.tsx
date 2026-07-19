"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAdminAuthStore } from "@/store/adminAuth";
import { ShieldAlert } from "lucide-react";

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { admin, token } = useAdminAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!token || !admin) {
      setIsAuthorized(false);
      // Strictly redirect to admin login
      router.push(`/admin/login?redirect=${pathname}`);
      return;
    }

    if (!["admin", "superadmin", "staff"].includes(admin.role)) {
      setIsAuthorized(false);
      router.push("/unauthorized");
      return;
    }

    setIsAuthorized(true);
  }, [mounted, admin, token, router, pathname]);

  if (isAuthorized === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (isAuthorized === false) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 text-center p-4">
        <div className="max-w-md space-y-4">
          <ShieldAlert className="w-16 h-16 mx-auto text-red-500" />
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-500">You do not have permission to view the admin portal.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
