import { ProtectedRoute } from "@/components/ProtectedRoute";

export const metadata = {
  title: "User Dashboard | GenBots",
  description: "Manage your GenBots orders, support tickets, and profile.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
}
