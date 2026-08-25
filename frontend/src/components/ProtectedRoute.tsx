"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { ShieldAlert } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("customer" | "admin" | "superadmin" | "staff")[];
}

const emptySubscribe = () => () => {};

export function ProtectedRoute({ children, allowedRoles = ["customer"] }: ProtectedRouteProps) {
  const { user, token } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  // Hydration check without cascading renders
  const isHydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const isAuthenticated = Boolean(token && user);
  const isRoleAllowed = user ? (allowedRoles as string[]).includes(user.role) : false;

  useEffect(() => {
    if (!isHydrated) return;

    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isHydrated, isAuthenticated, router, pathname]);

  if (!isHydrated) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (!isRoleAllowed) {
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

  return <>{children}</>;
}
