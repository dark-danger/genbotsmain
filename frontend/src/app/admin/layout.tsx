import { ProtectedRoute } from "@/components/ProtectedRoute";

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
    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
      {children}
    </ProtectedRoute>
  );
}
