"use client";
import { useState, useEffect } from "react";
import { LayoutDashboard, Users, ShoppingCart, Package, FileText, Settings, LogOut, TrendingUp, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  
  useEffect(() => {
    // Basic auth check for admin would go here
    const token = localStorage.getItem("access_token");
    if (!token) {
      window.location.href = "/auth/login";
    }
  }, []);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 border-r border-border bg-card flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <span className="text-xl font-bold">Gen<span className="gradient-text">Bots</span> Admin</span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            {[
              { id: "overview", icon: LayoutDashboard, label: "Overview" },
              { id: "orders", icon: ShoppingCart, label: "Orders" },
              { id: "products", icon: Package, label: "Products" },
              { id: "users", icon: Users, label: "Users" },
              { id: "content", icon: FileText, label: "Content & CMS" },
              { id: "settings", icon: Settings, label: "Settings" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="p-4 border-t border-border">
          <button 
            onClick={() => { localStorage.removeItem("access_token"); window.location.href="/auth/login"; }}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-8 shrink-0">
          <h1 className="text-xl font-bold capitalize">{activeTab}</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Super Admin</span>
            <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white font-bold">A</div>
          </div>
        </header>
        
        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { title: "Total Revenue", value: "₹4,25,000", icon: DollarSign, trend: "+12%" },
                  { title: "Active Orders", value: "34", icon: ShoppingCart, trend: "+5%" },
                  { title: "Total Users", value: "1,245", icon: Users, trend: "+18%" },
                  { title: "Site Visits", value: "12.5K", icon: TrendingUp, trend: "+22%" },
                ].map((stat, i) => (
                  <div key={i} className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-muted-foreground">{stat.title}</h3>
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <stat.icon className="w-4 h-4 text-primary" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold mb-1">{stat.value}</div>
                    <div className="text-xs text-emerald-500 font-medium">{stat.trend} from last month</div>
                  </div>
                ))}
              </div>
              
              {/* Recent Orders Table Placeholder */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold mb-4">Recent Orders</h3>
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3 font-medium">Order ID</th>
                        <th className="px-4 py-3 font-medium">Customer</th>
                        <th className="px-4 py-3 font-medium">Date</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <tr key={i} className="hover:bg-muted/50">
                          <td className="px-4 py-3 font-medium">#ORD-2026-{8000+i}</td>
                          <td className="px-4 py-3">Customer {i}</td>
                          <td className="px-4 py-3">Today, 10:00 AM</td>
                          <td className="px-4 py-3"><span className="px-2 py-1 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Processing</span></td>
                          <td className="px-4 py-3 font-medium">₹{1200 + i * 500}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === "products" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Manage Products</h2>
              </div>
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold mb-4">Add New Product</h3>
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Product added!"); }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Product Name</label>
                      <input type="text" className="w-full p-2 rounded-md bg-background border border-border" placeholder="e.g. GenBot Pro Kit" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Price (₹)</label>
                      <input type="number" className="w-full p-2 rounded-md bg-background border border-border" placeholder="e.g. 4999" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <select className="w-full p-2 rounded-md bg-background border border-border">
                      <option>IoT Starter Kits</option>
                      <option>Robotics</option>
                      <option>Sensors & Components</option>
                      <option>School Lab Equipment</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <textarea className="w-full p-2 rounded-md bg-background border border-border h-24" placeholder="Product details and features..." required></textarea>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Product Image URL</label>
                    <input type="url" className="w-full p-2 rounded-md bg-background border border-border" placeholder="https://..." />
                  </div>
                  <Button type="submit" className="w-full md:w-auto">Upload Product</Button>
                </form>
              </div>
            </div>
          )}

          {activeTab === "content" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Content Management (CMS)</h2>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Add School Form */}
                <div className="glass-card p-6">
                  <h3 className="text-lg font-bold mb-4">Add Partner School</h3>
                  <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("School added!"); }}>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">School Name</label>
                      <input type="text" className="w-full p-2 rounded-md bg-background border border-border" placeholder="e.g. Delhi Public School" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Location</label>
                      <input type="text" className="w-full p-2 rounded-md bg-background border border-border" placeholder="e.g. New Delhi" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">School Logo URL</label>
                      <input type="url" className="w-full p-2 rounded-md bg-background border border-border" placeholder="https://..." />
                    </div>
                    <Button type="submit" variant="secondary" className="w-full">Add School</Button>
                  </form>
                </div>

                {/* Add Service/Offer Form */}
                <div className="glass-card p-6">
                  <h3 className="text-lg font-bold mb-4">Add "What We Offer"</h3>
                  <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Offering added!"); }}>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Service Title</label>
                      <input type="text" className="w-full p-2 rounded-md bg-background border border-border" placeholder="e.g. AI Tinkering Lab" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Short Description</label>
                      <textarea className="w-full p-2 rounded-md bg-background border border-border h-24" placeholder="Describe the offering..." required></textarea>
                    </div>
                    <Button type="submit" variant="secondary" className="w-full">Add Offering</Button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {activeTab !== "overview" && activeTab !== "products" && activeTab !== "content" && (
            <div className="glass-card p-8 text-center text-muted-foreground">
              <p>The {activeTab} management interface would be implemented here.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
