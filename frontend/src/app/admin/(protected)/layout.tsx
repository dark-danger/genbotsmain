import { AdminProtectedRoute } from "@/components/AdminProtectedRoute";

export const metadata = {
  title: "Admin Dashboard | GenBots Enterprise",
  description: "Administrative control panel for the GenBots platform.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProtectedRoute>
      {children}
    </AdminProtectedRoute>
  );
}
