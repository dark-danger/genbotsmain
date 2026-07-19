import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;
  avatar_url?: string;
}

interface AdminAuthState {
  admin: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (admin: User, token: string) => void;
  logout: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      admin: null,
      token: null,
      isAuthenticated: false,
      login: (admin, token) => set({ admin, token, isAuthenticated: true }),
      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("admin_refresh_token");
        }
        set({ admin: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: "admin-auth-storage",
    }
  )
);
