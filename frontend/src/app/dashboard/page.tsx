"use client";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Package, Heart, CreditCard, Settings, LogOut, ShoppingBag, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState("orders");
  const [user, setUser] = useState<{ first_name: string; email: string } | null>(null);

  useEffect(() => {
    // In a real app, this would fetch from /api/v1/auth/me
    const token = localStorage.getItem("access_token");
    if (!token) {
      window.location.href = "/auth/login";
      return;
    }
    setUser({ first_name: "Customer", email: "customer@genbots.in" });
  }, []);

  if (!user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16 min-h-screen bg-muted/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-8">
            
            {/* Sidebar */}
            <div className="w-full md:w-64 shrink-0">
              <div className="glass-card p-6 mb-6 text-center">
                <div className="w-20 h-20 rounded-full gradient-bg mx-auto flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg">
                  {user.first_name[0]}
                </div>
                <h2 className="font-bold text-lg">{user.first_name}</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>

              <div className="glass-card overflow-hidden">
                <nav className="flex flex-col">
                  {[
                    { id: "orders", icon: Package, label: "My Orders" },
                    { id: "wishlist", icon: Heart, label: "Wishlist" },
                    { id: "addresses", icon: MapPin, label: "Addresses" },
                    { id: "software", icon: ShoppingBag, label: "Software & Keys" },
                    { id: "settings", icon: Settings, label: "Account Settings" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors ${
                        activeTab === tab.id 
                          ? "bg-primary/10 text-primary border-r-2 border-primary" 
                          : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <tab.icon className="w-4 h-4" /> {tab.label}
                    </button>
                  ))}
                  <button 
                    onClick={() => { localStorage.removeItem("access_token"); window.location.href="/auth/login"; }}
                    className="flex items-center gap-3 px-6 py-4 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors border-t border-border"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <div className="glass-card p-6 md:p-8 min-h-[500px]">
                {activeTab === "orders" && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Order History</h2>
                    <div className="space-y-4">
                      {/* Empty state for now */}
                      <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
                        <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-semibold mb-1">No orders yet</h3>
                        <p className="text-sm text-muted-foreground mb-4">When you place an order, it will appear here.</p>
                        <Button className="gradient-bg text-white rounded-xl">Start Shopping</Button>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === "settings" && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
                    <div className="max-w-md space-y-6">
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Full Name</label>
                        <input type="text" defaultValue={user.first_name} className="w-full flex h-10 rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Email</label>
                        <input type="email" defaultValue={user.email} disabled className="w-full flex h-10 rounded-xl border border-input bg-muted px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
                      </div>
                      <Button className="gradient-bg text-white rounded-xl">Save Changes</Button>
                    </div>
                  </div>
                )}
                
                {["wishlist", "addresses", "software"].includes(activeTab) && (
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold mb-2 capitalize">{activeTab}</h2>
                    <p className="text-muted-foreground">This section is currently empty.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
