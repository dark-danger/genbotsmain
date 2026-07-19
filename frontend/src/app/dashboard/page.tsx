"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Package, Heart, CreditCard, Settings, LogOut, ShoppingBag, MapPin, Download, Ticket, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth";
import { ordersApi, wishlistApi, cartApi } from "@/lib/api";
import Link from "next/link";

export default function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState("orders");
  const { user, token, logout } = useAuthStore();

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["myOrders"],
    queryFn: async () => {
      const res = await ordersApi.myOrders();
      return res.data;
    },
    enabled: !!token && activeTab === "orders",
    retry: 1,
  });

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center pt-24">
          <div className="text-center glass-card p-12 max-w-md">
            <User className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Please Log In</h1>
            <p className="text-muted-foreground mb-6">Access your orders, downloads, and account settings.</p>
            <Link href="/auth/login">
              <Button className="gradient-bg text-white rounded-xl">Log In to Continue</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const tabs = [
    { id: "orders", icon: Package, label: "My Orders" },
    { id: "downloads", icon: Download, label: "Downloads" },
    { id: "wishlist", icon: Heart, label: "Wishlist" },
    { id: "addresses", icon: MapPin, label: "Addresses" },
    { id: "software", icon: ShoppingBag, label: "Software & Keys" },
    { id: "tickets", icon: Ticket, label: "Support Tickets" },
    { id: "settings", icon: Settings, label: "Account Settings" },
  ];

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16 min-h-screen bg-muted/10" id="main-content">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-8">
            
            {/* Sidebar */}
            <div className="w-full md:w-64 shrink-0">
              <div className="glass-card p-6 mb-6 text-center">
                <div className="w-20 h-20 rounded-full gradient-bg mx-auto flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg">
                  {(user.name || user.email)[0].toUpperCase()}
                </div>
                <h2 className="font-bold text-lg">{user.name || "Customer"}</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <Badge variant="outline" className="mt-2 capitalize">{user.role}</Badge>
              </div>

              <div className="glass-card overflow-hidden">
                <nav className="flex flex-col" aria-label="Dashboard navigation">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors ${
                        activeTab === tab.id 
                          ? "bg-primary/10 text-primary border-r-2 border-primary" 
                          : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                      aria-current={activeTab === tab.id ? "page" : undefined}
                    >
                      <tab.icon className="w-4 h-4" aria-hidden="true" /> {tab.label}
                    </button>
                  ))}
                  <button 
                    onClick={() => { logout(); window.location.href = "/"; }}
                    className="flex items-center gap-3 px-6 py-4 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors border-t border-border"
                  >
                    <LogOut className="w-4 h-4" aria-hidden="true" /> Sign Out
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <div className="glass-card p-6 md:p-8 min-h-[500px]">
                
                {/* ORDERS TAB */}
                {activeTab === "orders" && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Order History</h2>
                    {ordersLoading ? (
                      <div className="flex justify-center py-12">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : orders && orders.length > 0 ? (
                      <div className="space-y-4">
                        {orders.map((order: any) => (
                          <div key={order.id} className="border rounded-xl p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <p className="font-semibold">Order #{order.order_number}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                </p>
                              </div>
                              <div className="text-right">
                                <Badge className={`capitalize ${
                                  order.status === "delivered" ? "bg-green-500" :
                                  order.status === "shipped" ? "bg-blue-500" :
                                  order.status === "processing" ? "bg-yellow-500" : ""
                                } text-white border-0`}>
                                  {order.status}
                                </Badge>
                                <p className="text-lg font-bold mt-1">₹{parseFloat(order.total_amount).toLocaleString("en-IN")}</p>
                              </div>
                            </div>
                            {order.items?.map((item: any) => (
                              <div key={item.id} className="flex items-center gap-3 py-2 border-t border-border">
                                <div className="w-10 h-10 rounded bg-muted flex items-center justify-center text-xs">📦</div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{item.product_name}</p>
                                  <p className="text-xs text-muted-foreground">Qty: {item.quantity} × ₹{parseFloat(item.unit_price).toLocaleString("en-IN")}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
                        <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-semibold mb-1">No orders yet</h3>
                        <p className="text-sm text-muted-foreground mb-4">When you place an order, it will appear here.</p>
                        <Link href="/store">
                          <Button className="gradient-bg text-white rounded-xl">Start Shopping</Button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {/* DOWNLOADS TAB */}
                {activeTab === "downloads" && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">My Downloads</h2>
                    <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
                      <Download className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold mb-1">No downloads yet</h3>
                      <p className="text-sm text-muted-foreground mb-4">Software and documentation downloads will appear here.</p>
                      <Link href="/software"><Button variant="outline" className="rounded-xl">Browse Software</Button></Link>
                    </div>
                  </div>
                )}

                {/* SUPPORT TICKETS TAB */}
                {activeTab === "tickets" && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Support Tickets</h2>
                    <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
                      <Ticket className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold mb-1">No tickets yet</h3>
                      <p className="text-sm text-muted-foreground mb-4">Need help? Create a support ticket.</p>
                      <Link href="/contact"><Button className="gradient-bg text-white rounded-xl">Contact Support</Button></Link>
                    </div>
                  </div>
                )}
                
                {/* SETTINGS TAB */}
                {activeTab === "settings" && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
                    <div className="max-w-md space-y-6">
                      <div>
                        <label htmlFor="name" className="text-sm font-medium mb-1.5 block">Full Name</label>
                        <Input id="name" defaultValue={user.name || ""} className="rounded-xl" />
                      </div>
                      <div>
                        <label htmlFor="email" className="text-sm font-medium mb-1.5 block">Email</label>
                        <Input id="email" type="email" defaultValue={user.email} disabled className="rounded-xl bg-muted" />
                      </div>
                      <div>
                        <label htmlFor="phone" className="text-sm font-medium mb-1.5 block">Phone</label>
                        <Input id="phone" type="tel" placeholder="+91 98765 43210" className="rounded-xl" />
                      </div>
                      <Button className="gradient-bg text-white rounded-xl">Save Changes</Button>
                    </div>
                  </div>
                )}
                
                {/* WISHLIST TAB */}
                {activeTab === "wishlist" && (
                  <WishlistTab />
                )}

                {/* PLACEHOLDER TABS */}
                {["addresses", "software"].includes(activeTab) && (
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold mb-2 capitalize">{activeTab.replace("-", " ")}</h2>
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

// ── WishlistTab Component ────────────────────────────────
function WishlistTab() {
  const queryClient = useQueryClient();
  const { token } = useAuthStore();

  const { data: wishlistData, isLoading } = useQuery({
    queryKey: ["myWishlist"],
    queryFn: async () => {
      const res = await wishlistApi.get();
      return res.data;
    },
    enabled: !!token,
  });

  const removeMutation = useMutation({
    mutationFn: (productId: string) => wishlistApi.remove(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myWishlist"] });
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: (productId: string) => cartApi.addItem({ product_id: productId, quantity: 1 }),
    onSuccess: () => {
      alert("Added to cart!");
    },
    onError: (err: any) => {
      alert(err.response?.data?.detail || "Failed to add to cart");
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const items = wishlistData?.items || [];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">My Wishlist</h2>
      {items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((item: any) => (
            <div key={item.id} className="border rounded-xl p-4 flex gap-4 items-center">
              <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                {item.product_image ? (
                  <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl">📦</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/store/${item.product_slug}`} className="font-semibold text-sm hover:text-primary transition-colors line-clamp-1">
                  {item.product_name}
                </Link>
                <p className="text-lg font-bold gradient-text">₹{item.product_price?.toLocaleString("en-IN")}</p>
                {!item.in_stock && <Badge variant="destructive" className="text-xs">Out of Stock</Badge>}
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  size="sm"
                  className="gradient-bg text-white rounded-lg text-xs"
                  onClick={() => addToCartMutation.mutate(item.product_id)}
                  disabled={!item.in_stock || addToCartMutation.isPending}
                >
                  <ShoppingBag className="w-3 h-3 mr-1" /> Add to Cart
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-lg text-xs text-destructive border-destructive/30"
                  onClick={() => removeMutation.mutate(item.product_id)}
                  disabled={removeMutation.isPending}
                >
                  <Heart className="w-3 h-3 mr-1" /> Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
          <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-1">No items in wishlist</h3>
          <p className="text-sm text-muted-foreground mb-4">Browse products and heart the ones you love.</p>
          <Link href="/store">
            <Button className="gradient-bg text-white rounded-xl">Browse Store</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
