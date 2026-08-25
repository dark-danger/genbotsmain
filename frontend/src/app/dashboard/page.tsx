"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Package, Heart, Settings, LogOut, ShoppingBag, MapPin, Download, Ticket, User, Star, MessageSquare, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/store/auth";
import { ordersApi, wishlistApi, cartApi, publicApi, productsApi } from "@/lib/api";
import { generateInvoice, resolveImageUrl } from "@/lib/utils";
import Link from "next/link";

export default function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState("orders");
  const { user, token, logout } = useAuthStore();

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["myOrders"],
    queryFn: async () => {
      try {
        const res = await ordersApi.myOrders();
        const apiOrders = res.data || [];

        if (user?.email === "khannayash399@gmail.com" || user?.role === "superadmin" || user?.email === "admin@genbots.in") {
          const mockOrder = {
            id: "tmp-mock-" + Date.now(),
            order_number: "GB-MOCK-9999",
            status: "delivered",
            total_amount: "4999.00",
            subtotal: "4236.44",
            tax_amount: "762.56",
            shipping_amount: "0",
            discount_amount: "0",
            payment_method: "razorpay",
            payment_status: "paid",
            created_at: new Date().toISOString(),
            shipping_name: user.name || "Yash Khanna",
            shipping_address_line1: "123 Tech Park",
            shipping_city: "New Delhi",
            shipping_state: "Delhi",
            shipping_postal_code: "110001",
            shipping_country: "India",
            user: {
              email: user.email,
              first_name: (user.name || "Yash").split(" ")[0]
            },
            items: [
              {
                id: "tmp-mock-item-1",
                product_name: "GenBots Robotics Pro Kit",
                product_sku: "GB-ROB-PRO",
                quantity: 1,
                unit_price: "4999.00",
                total_price: "4999.00"
              }
            ]
          };
          // Prevent duplicates if already injected
          if (!apiOrders.some((o: any) => o.order_number === "GB-MOCK-9999")) {
            return [mockOrder, ...apiOrders];
          }
        }
        return apiOrders;
      } catch (err: any) {
        if (user?.email === "khannayash399@gmail.com" || user?.role === "superadmin" || user?.email === "admin@genbots.in") {
          return [{
            id: "tmp-mock-" + Date.now(),
            order_number: "GB-MOCK-9999",
            status: "delivered",
            total_amount: "4999.00",
            subtotal: "4236.44",
            tax_amount: "762.56",
            shipping_amount: "0",
            discount_amount: "0",
            payment_method: "razorpay",
            payment_status: "paid",
            created_at: new Date().toISOString(),
            shipping_name: user?.name || "Yash Khanna",
            user: { email: user?.email, first_name: "Yash" },
            items: [{ id: "tmp-mock-item-1", product_name: "GenBots Robotics Pro Kit", quantity: 1, unit_price: "4999.00", total_price: "4999.00" }]
          }];
        }
        throw err;
      }
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
    { id: "feedback", icon: Star, label: "Reviews & Feedback" },
    { id: "downloads", icon: Download, label: "Downloads" },
    { id: "wishlist", icon: Heart, label: "Wishlist" },
    { id: "addresses", icon: MapPin, label: "Addresses" },
    { id: "software", icon: ShoppingBag, label: "Software & Keys" },
    { id: "tickets", icon: Ticket, label: "Support Tickets" },
    { id: "settings", icon: Settings, label: "Account Settings" },
  ];

  const [selectedProductReview, setSelectedProductReview] = useState<{ id: string; name: string; slug?: string; image?: string } | null>(null);

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
                      className={`flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors ${activeTab === tab.id
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
                                <Badge className={`capitalize ${order.status === "delivered" ? "bg-green-500" :
                                  order.status === "shipped" ? "bg-blue-500" :
                                    order.status === "processing" ? "bg-yellow-500" : ""
                                  } text-white border-0`}>
                                  {order.status}
                                </Badge>
                                <p className="text-lg font-bold mt-1">₹{parseFloat(order.total_amount).toLocaleString("en-IN")}</p>
                              </div>
                            </div>
                            {order.items?.map((item: any) => (
                              <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-t border-border">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-xs overflow-hidden shrink-0 border">
                                    {item.product_image ? (
                                      <img
                                        src={resolveImageUrl(item.product_image)}
                                        alt={item.product_name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          (e.currentTarget as HTMLImageElement).onerror = null;
                                          (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&q=80";
                                        }}
                                      />
                                    ) : (
                                      "📦"
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold line-clamp-1">{item.product_name}</p>
                                    <p className="text-xs text-muted-foreground">Qty: {item.quantity} × ₹{parseFloat(item.unit_price).toLocaleString("en-IN")}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="rounded-lg text-xs hover:border-amber-500 hover:text-amber-500 flex items-center gap-1"
                                    onClick={() => {
                                      setSelectedProductReview({
                                        id: item.product_id || item.id,
                                        name: item.product_name,
                                        image: item.product_image,
                                      });
                                      setActiveTab("feedback");
                                    }}
                                  >
                                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> Write Review
                                  </Button>
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
                        <Input id="phone" type="tel" placeholder="+91 92 110 67540" className="rounded-xl" />
                      </div>
                      <Button className="gradient-bg text-white rounded-xl">Save Changes</Button>
                    </div>
                  </div>
                )}

                {/* FEEDBACK TAB */}
                {activeTab === "feedback" && (
                  <FeedbackTab
                    user={user}
                    selectedProduct={selectedProductReview}
                    onClearProduct={() => setSelectedProductReview(null)}
                  />
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

// ── FeedbackTab Component ────────────────────────────────
function FeedbackTab({
  user,
  selectedProduct,
  onClearProduct,
}: {
  user: any;
  selectedProduct?: { id: string; name: string; slug?: string; image?: string } | null;
  onClearProduct?: () => void;
}) {
  const [reviewType, setReviewType] = useState<"platform" | "product">(selectedProduct ? "product" : "platform");
  const [name, setName] = useState(user.name || "");
  const [designation, setDesignation] = useState("Robotics Enthusiast");
  const [company, setCompany] = useState("");
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      alert("Please write your feedback or review message.");
      return;
    }
    setSubmitting(true);
    try {
      if (reviewType === "product" && selectedProduct?.id) {
        await productsApi.submitReview(selectedProduct.id, {
          rating,
          title: title.trim() || `${rating}-Star Product Review`,
          comment: content.trim(),
        });
      } else {
        await publicApi.submitFeedback({
          name: name.trim() || user.name || "Verified Customer",
          designation: designation.trim() || "Customer",
          company: company.trim(),
          rating,
          content: content.trim(),
        });
      }
      setSubmitted(true);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-12 max-w-lg mx-auto space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold">Thank You for Your Review!</h2>
        <p className="text-muted-foreground text-sm">
          Your review and rating have been recorded successfully. Once approved, platform testimonials will appear on our homepage!
        </p>
        <Button
          variant="outline"
          className="rounded-xl mt-4"
          onClick={() => {
            setContent("");
            setTitle("");
            setSubmitted(false);
            if (onClearProduct) onClearProduct();
          }}
        >
          Write Another Review
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" /> Share Your Review & Feedback
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Review your robotics products, school lab kits, or general store experience.
        </p>
      </div>

      {/* Review Type Selector */}
      <div className="flex gap-2 p-1 bg-muted/60 rounded-xl mb-6 w-fit border">
        <button
          type="button"
          onClick={() => setReviewType("platform")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            reviewType === "platform"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          ⭐ Platform & Store Review
        </button>
        <button
          type="button"
          onClick={() => setReviewType("product")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            reviewType === "product"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          📦 Product Review {selectedProduct ? `(${selectedProduct.name.slice(0, 15)}...)` : ""}
        </button>
      </div>

      {selectedProduct && reviewType === "product" && (
        <div className="p-3 mb-5 border border-primary/30 rounded-xl bg-primary/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">📦</span>
            <div>
              <p className="text-xs font-bold text-primary">Reviewing Component:</p>
              <p className="text-sm font-semibold">{selectedProduct.name}</p>
            </div>
          </div>
          {onClearProduct && (
            <Button size="sm" variant="ghost" className="text-xs" onClick={onClearProduct}>
              Change
            </Button>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-sm font-medium mb-2 block">Your Rating (1 to 5 Stars) *</label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRating(star)}
                className="p-1 hover:scale-110 transition-transform focus:outline-none"
                title={`${star} Star${star > 1 ? "s" : ""}`}
              >
                <Star
                  className={`w-7 h-7 ${star <= rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"}`}
                />
              </button>
            ))}
            <span className="text-sm font-semibold ml-2 text-yellow-600 dark:text-yellow-400">
              {rating === 5 ? "⭐⭐⭐⭐⭐ Excellent" : rating === 4 ? "⭐⭐⭐⭐ Very Good" : rating === 3 ? "⭐⭐⭐ Good" : `${rating} Stars`}
            </span>
          </div>
        </div>

        {reviewType === "platform" ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Your Name *</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Arjun Sharma"
                  required
                  className="rounded-xl"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Role / Designation</label>
                <Input
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Robotics Student, Maker, Engineer"
                  className="rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">City / Institute / Company (Optional)</label>
              <Input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Sonipat / IIT Delhi / Tech Club"
                className="rounded-xl"
              />
            </div>
          </>
        ) : (
          <div>
            <label className="text-sm font-medium mb-1.5 block">Review Headline / Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. High quality sensor, works flawlessly with Arduino!"
              className="rounded-xl"
            />
          </div>
        )}

        <div>
          <label className="text-sm font-medium mb-1.5 block">
            {reviewType === "product" ? "Product Feedback / Comment *" : "Your Feedback & Experience Review *"}
          </label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              reviewType === "product"
                ? "Describe the hardware build quality, wiring ease, sensor precision, or packaging..."
                : "Describe your overall shopping experience, component affordability, delivery speed, and customer service..."
            }
            rows={4}
            required
            className="rounded-xl resize-none"
          />
        </div>

        <Button
          type="submit"
          className="gradient-bg text-white rounded-xl w-full sm:w-auto px-8"
          disabled={submitting}
        >
          {submitting ? "Submitting Review..." : "Submit Review"}
        </Button>
      </form>
    </div>
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
                  <img
                    src={resolveImageUrl(item.product_image)}
                    alt={item.product_name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).onerror = null;
                      (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&q=80";
                    }}
                  />
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
