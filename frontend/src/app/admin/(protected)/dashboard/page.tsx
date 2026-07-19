"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  LayoutDashboard, Users, ShoppingCart, Package, FileText, Settings, 
  LogOut, TrendingUp, DollarSign, Plus, Trash, Edit2, AlertCircle, 
  Check, RefreshCw, Mail, HelpCircle, CheckCircle, Shield, History,
  Cpu, Briefcase, BookOpen, Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/auth";
import { adminApi, productsApi, blogApi, softwareApi, servicesApi, projectsApi } from "@/lib/api";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const queryClient = useQueryClient();
  const { user, logout } = useAuthStore();

  // Auth Protection is handled by ProtectedRoute in layout.tsx
  // Form State for Adding Product
  const [newProduct, setNewProduct] = useState({
    name: "",
    sku: "",
    price: "",
    stock_quantity: "",
    description: "",
    status: "published",
  });

  // Form State for Software
  const [newSoftware, setNewSoftware] = useState({
    name: "",
    description: "",
    category: "",
    is_free: true,
    price: "",
  });

  // Form State for Services
  const [newService, setNewService] = useState({
    name: "",
    description: "",
    short_description: "",
    pricing_info: "",
  });

  // Form State for Blog CMS
  const [newBlog, setNewBlog] = useState({
    title: "",
    excerpt: "",
    content: "",
    status: "draft",
  });

  // Form State for Coupons
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    description: "",
    discount_type: "percentage",
    discount_value: "",
    min_order_amount: "",
    max_uses: "",
  });

  // Queries
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["adminStats"],
    queryFn: async () => {
      const res = await adminApi.dashboard();
      return res.data;
    },
    enabled: !!user,
  });

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["adminOrders"],
    queryFn: async () => {
      const res = await adminApi.orders();
      return res.data;
    },
    enabled: !!user,
  });

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["adminProducts"],
    queryFn: async () => {
      const res = await productsApi.list();
      return res.data;
    },
    enabled: !!user,
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: async () => {
      const res = await adminApi.users();
      return res.data;
    },
    enabled: !!user,
  });

  const { data: inquiries, isLoading: inquiriesLoading } = useQuery({
    queryKey: ["adminInquiries"],
    queryFn: async () => {
      const res = await adminApi.inquiries();
      return res.data;
    },
    enabled: !!user && activeTab === "content",
  });

  const { data: tickets, isLoading: ticketsLoading } = useQuery({
    queryKey: ["adminTickets"],
    queryFn: async () => {
      const res = await adminApi.tickets();
      return res.data;
    },
    enabled: !!user && activeTab === "content",
  });

  const { data: auditLogs, isLoading: logsLoading } = useQuery({
    queryKey: ["adminLogs"],
    queryFn: async () => {
      const res = await adminApi.logs();
      return res.data;
    },
    enabled: !!user && activeTab === "logs",
  });

  const { data: softwares, isLoading: softwaresLoading } = useQuery({
    queryKey: ["adminSoftwares"],
    queryFn: async () => {
      const res = await softwareApi.list();
      return res.data;
    },
    enabled: !!user && activeTab === "software",
  });

  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ["adminServices"],
    queryFn: async () => {
      const res = await servicesApi.list();
      return res.data;
    },
    enabled: !!user && activeTab === "services",
  });

  const { data: blogsData, isLoading: blogsLoading } = useQuery({
    queryKey: ["adminBlogs"],
    queryFn: async () => {
      const res = await blogApi.list();
      return res.data;
    },
    enabled: !!user && activeTab === "content",
  });

  const { data: coupons, isLoading: couponsLoading } = useQuery({
    queryKey: ["adminCoupons"],
    queryFn: async () => {
      const res = await adminApi.coupons();
      return res.data;
    },
    enabled: !!user && activeTab === "coupons",
  });

  // Mutations
  const createProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      const res = await productsApi.create(productData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
      alert("Product added successfully!");
      setNewProduct({
        name: "",
        sku: "",
        price: "",
        stock_quantity: "",
        description: "",
        status: "published",
      });
    },
    onError: (err: any) => {
      alert(err.response?.data?.detail || "Failed to create product");
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await productsApi.delete(id);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
      alert("Product deleted!");
    },
    onError: (err: any) => {
      alert(err.response?.data?.detail || "Failed to delete product");
    }
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const res = await adminApi.updateOrderStatus(orderId, status);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminOrders"] });
      alert("Order status updated!");
    },
    onError: (err: any) => {
      alert(err.response?.data?.detail || "Failed to update order status");
    }
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const res = await adminApi.updateUser(userId, { role });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      alert("User role updated successfully!");
    },
    onError: (err: any) => {
      alert(err.response?.data?.detail || "Failed to update user role");
    }
  });

  const createSoftwareMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await softwareApi.create(data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminSoftwares"] });
      alert("Software added successfully!");
      setNewSoftware({ name: "", description: "", category: "", is_free: true, price: "" });
    },
    onError: (err: any) => {
      alert(err.response?.data?.detail || "Failed to add software");
    }
  });

  const deleteSoftwareMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await softwareApi.delete(id);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminSoftwares"] });
      alert("Software entry deleted successfully!");
    },
    onError: (err: any) => {
      alert(err.response?.data?.detail || "Failed to delete software");
    }
  });

  const createServiceMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await servicesApi.create(data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminServices"] });
      alert("Service added successfully!");
      setNewService({ name: "", description: "", short_description: "", pricing_info: "" });
    },
    onError: (err: any) => {
      alert(err.response?.data?.detail || "Failed to add service");
    }
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await servicesApi.delete(id);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminServices"] });
      alert("Service deleted successfully!");
    },
    onError: (err: any) => {
      alert(err.response?.data?.detail || "Failed to delete service");
    }
  });

  const createBlogMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await blogApi.create(data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminBlogs"] });
      alert("Blog post created successfully!");
      setNewBlog({ title: "", excerpt: "", content: "", status: "draft" });
    },
    onError: (err: any) => {
      alert(err.response?.data?.detail || "Failed to create blog post");
    }
  });

  const deleteBlogMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await blogApi.delete(id);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminBlogs"] });
      alert("Blog post deleted successfully!");
    },
    onError: (err: any) => {
      alert(err.response?.data?.detail || "Failed to delete blog post");
    }
  });

  const createCouponMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await adminApi.createCoupon(data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCoupons"] });
      alert("Coupon created successfully!");
      setNewCoupon({ code: "", description: "", discount_type: "percentage", discount_value: "", min_order_amount: "", max_uses: "" });
    },
    onError: (err: any) => {
      alert(err.response?.data?.detail || "Failed to create coupon");
    }
  });

  const deleteCouponMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await adminApi.deleteCoupon(id);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCoupons"] });
      alert("Coupon deleted successfully!");
    },
    onError: (err: any) => {
      alert(err.response?.data?.detail || "Failed to delete coupon");
    }
  });

  if (!user) return null;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      
      {/* Sidebar */}
      <div className="w-64 border-r border-border bg-card flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-border gap-2">
          <Shield className="w-6 h-6 text-primary" />
          <span className="text-xl font-bold">Gen<span className="gradient-text">Bots</span> Admin</span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            {[
              { id: "overview", icon: LayoutDashboard, label: "Overview" },
              { id: "orders", icon: ShoppingCart, label: "Orders" },
              { id: "products", icon: Package, label: "Products" },
              { id: "users", icon: Users, label: "Users" },
              { id: "software", icon: Cpu, label: "Software Portal" },
              { id: "services", icon: Briefcase, label: "Services & Labs" },
              { id: "content", icon: BookOpen, label: "CMS & Support" },
              { id: "coupons", icon: Tag, label: "Coupons" },
              { id: "logs", icon: History, label: "Audit Logs" },
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
            onClick={() => { logout(); window.location.href = "/auth/login"; }}
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
            <span className="text-sm font-medium capitalize">{user.role}</span>
            <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white font-bold">
              {user.email?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        
        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-8">
          
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {statsLoading ? (
                <div className="flex items-center justify-center py-20"><RefreshCw className="w-8 h-8 animate-spin text-primary" /></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    { title: "Total Revenue", value: `₹${stats?.total_revenue || 0}`, icon: DollarSign },
                    { title: "Total Orders", value: stats?.total_orders || 0, icon: ShoppingCart },
                    { title: "Total Users", value: stats?.total_users || 0, icon: Users },
                    { title: "Total Products", value: stats?.total_products || 0, icon: Package },
                  ].map((stat, i) => (
                    <div key={i} className="glass-card p-6 border bg-card/50">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-muted-foreground">{stat.title}</h3>
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <stat.icon className="w-4 h-4 text-primary" />
                        </div>
                      </div>
                      <div className="text-2xl font-bold mb-1">{stat.value}</div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Recent Orders */}
              <div className="glass-card p-6 border bg-card/50">
                <h3 className="text-lg font-bold mb-4">Recent Orders</h3>
                {ordersLoading ? (
                  <div className="flex justify-center p-6"><RefreshCw className="w-6 h-6 animate-spin text-primary" /></div>
                ) : (
                  <div className="border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/50 text-muted-foreground">
                        <tr>
                          <th className="px-4 py-3 font-medium">Order ID</th>
                          <th className="px-4 py-3 font-medium">Customer</th>
                          <th className="px-4 py-3 font-medium">Status</th>
                          <th className="px-4 py-3 font-medium">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {orders?.items?.slice(0, 5).map((order: any) => (
                          <tr key={order.id} className="hover:bg-muted/30">
                            <td className="px-4 py-3 font-medium">#{order.id.slice(0, 8)}</td>
                            <td className="px-4 py-3">{order.user?.email || "Guest"}</td>
                            <td className="px-4 py-3">
                              <Badge variant={order.status === "completed" ? "default" : "secondary"}>
                                {order.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 font-medium">₹{order.total_amount}</td>
                          </tr>
                        ))}
                        {(!orders?.items || orders?.items.length === 0) && (
                          <tr><td colSpan={4} className="p-4 text-center text-muted-foreground">No recent orders</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ORDERS TAB */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="glass-card p-6 border bg-card/50">
                <h3 className="text-lg font-bold mb-4">All Orders</h3>
                {ordersLoading ? (
                  <div className="flex justify-center p-12"><RefreshCw className="w-8 h-8 animate-spin text-primary" /></div>
                ) : (
                  <div className="border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/50 text-muted-foreground">
                        <tr>
                          <th className="px-4 py-3 font-medium">Order ID</th>
                          <th className="px-4 py-3 font-medium">Customer</th>
                          <th className="px-4 py-3 font-medium">Total Amount</th>
                          <th className="px-4 py-3 font-medium">Status</th>
                          <th className="px-4 py-3 font-medium">Update Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {orders?.items?.map((order: any) => (
                          <tr key={order.id} className="hover:bg-muted/30">
                            <td className="px-4 py-3 font-medium">#{order.id.slice(0, 8)}</td>
                            <td className="px-4 py-3">{order.user?.email || "Guest"}</td>
                            <td className="px-4 py-3 font-medium">₹{order.total_amount}</td>
                            <td className="px-4 py-3">
                              <Badge className="capitalize">{order.status}</Badge>
                            </td>
                            <td className="px-4 py-3">
                              <select 
                                value={order.status}
                                onChange={(e) => updateOrderStatusMutation.mutate({ orderId: order.id, status: e.target.value })}
                                className="p-1 rounded bg-background border border-border text-xs"
                              >
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PRODUCTS TAB */}
          {activeTab === "products" && (
            <div className="space-y-8">
              {/* Add Product Form */}
              <div className="glass-card p-6 border bg-card/50">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-primary" /> Add New Product
                </h3>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    createProductMutation.mutate({
                      ...newProduct,
                      price: parseFloat(newProduct.price),
                      stock_quantity: parseInt(newProduct.stock_quantity),
                    });
                  }} 
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Product Name</label>
                      <Input 
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        placeholder="e.g. GenBot Pro Kit" required 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">SKU</label>
                      <Input 
                        value={newProduct.sku}
                        onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                        placeholder="e.g. GB-PRO-01" required 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Price (₹)</label>
                      <Input 
                        type="number"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                        placeholder="e.g. 4999" required 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Stock Quantity</label>
                      <Input 
                        type="number"
                        value={newProduct.stock_quantity}
                        onChange={(e) => setNewProduct({ ...newProduct, stock_quantity: e.target.value })}
                        placeholder="e.g. 50" required 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status</label>
                      <select 
                        value={newProduct.status}
                        onChange={(e) => setNewProduct({ ...newProduct, status: e.target.value })}
                        className="w-full h-10 p-2 rounded-md bg-background border border-border"
                      >
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea 
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      placeholder="Product details..." required 
                    />
                  </div>
                  <Button type="submit" disabled={createProductMutation.isPending}>
                    {createProductMutation.isPending ? "Adding..." : "Upload Product"}
                  </Button>
                </form>
              </div>

              {/* Products List */}
              <div className="glass-card p-6 border bg-card/50">
                <h3 className="text-lg font-bold mb-4">Existing Products</h3>
                {productsLoading ? (
                  <div className="flex justify-center p-12"><RefreshCw className="w-8 h-8 animate-spin text-primary" /></div>
                ) : (
                  <div className="border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/50 text-muted-foreground">
                        <tr>
                          <th className="px-4 py-3 font-medium">SKU</th>
                          <th className="px-4 py-3 font-medium">Product Name</th>
                          <th className="px-4 py-3 font-medium">Price</th>
                          <th className="px-4 py-3 font-medium">Stock</th>
                          <th className="px-4 py-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {productsData?.items?.map((product: any) => (
                          <tr key={product.id} className="hover:bg-muted/30">
                            <td className="px-4 py-3 font-mono">{product.sku}</td>
                            <td className="px-4 py-3 font-medium">{product.name}</td>
                            <td className="px-4 py-3">₹{product.price}</td>
                            <td className="px-4 py-3">{product.stock_quantity}</td>
                            <td className="px-4 py-3">
                              <Button 
                                variant="destructive" 
                                size="icon"
                                onClick={() => {
                                  if (confirm("Delete this product?")) {
                                    deleteProductMutation.mutate(product.id);
                                  }
                                }}
                                disabled={deleteProductMutation.isPending}
                              >
                                <Trash className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* USERS TAB */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <div className="glass-card p-6 border bg-card/50">
                <h3 className="text-lg font-bold mb-4">User Registry</h3>
                {usersLoading ? (
                  <div className="flex justify-center p-12"><RefreshCw className="w-8 h-8 animate-spin text-primary" /></div>
                ) : (
                  <div className="border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/50 text-muted-foreground">
                        <tr>
                          <th className="px-4 py-3 font-medium">Name</th>
                          <th className="px-4 py-3 font-medium">Email</th>
                          <th className="px-4 py-3 font-medium">Role</th>
                          <th className="px-4 py-3 font-medium">Change Role</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {users?.map((u: any) => (
                          <tr key={u.id} className="hover:bg-muted/30">
                            <td className="px-4 py-3 font-medium">{u.first_name} {u.last_name}</td>
                            <td className="px-4 py-3">{u.email}</td>
                            <td className="px-4 py-3 capitalize">
                              <Badge variant={u.role === "admin" || u.role === "superadmin" ? "default" : "secondary"}>
                                {u.role}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <select 
                                value={u.role}
                                onChange={(e) => updateUserRoleMutation.mutate({ userId: u.id, role: e.target.value })}
                                className="p-1 rounded bg-background border border-border text-xs"
                              >
                                <option value="customer">Customer</option>
                                <option value="staff">Staff</option>
                                <option value="admin">Admin</option>
                                <option value="superadmin">Superadmin</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CMS & INQUIRIES TAB */}
          {activeTab === "content" && (
            <div className="space-y-8">
              {/* Blog Posts Manager */}
              <div className="glass-card p-6 border bg-card/50">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-primary" /> Create New Blog Post
                </h3>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    createBlogMutation.mutate(newBlog);
                  }} 
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Post Title</label>
                      <Input 
                        value={newBlog.title}
                        onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
                        placeholder="e.g. The Future of Robotics Labs" required 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status</label>
                      <select 
                        value={newBlog.status}
                        onChange={(e) => setNewBlog({ ...newBlog, status: e.target.value })}
                        className="w-full h-10 p-2 rounded-md bg-background border border-border"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Excerpt / Summary</label>
                    <Input 
                      value={newBlog.excerpt}
                      onChange={(e) => setNewBlog({ ...newBlog, excerpt: e.target.value })}
                      placeholder="Brief summary sentence..." required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Markdown / HTML Content</label>
                    <Textarea 
                      value={newBlog.content}
                      onChange={(e) => setNewBlog({ ...newBlog, content: e.target.value })}
                      placeholder="Write your article body here..." rows={6} required 
                    />
                  </div>
                  <Button type="submit" disabled={createBlogMutation.isPending}>
                    {createBlogMutation.isPending ? "Publishing..." : "Create Post"}
                  </Button>
                </form>

                <div className="mt-8">
                  <h4 className="text-md font-bold mb-3">Published & Draft Articles</h4>
                  {blogsLoading ? (
                    <div className="flex justify-center p-6"><RefreshCw className="w-6 h-6 animate-spin text-primary" /></div>
                  ) : (
                    <div className="border border-border rounded-lg overflow-hidden">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground">
                          <tr>
                            <th className="px-4 py-3 font-medium">Title</th>
                            <th className="px-4 py-3 font-medium">Status</th>
                            <th className="px-4 py-3 font-medium">Views</th>
                            <th className="px-4 py-3 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {blogsData?.items?.map((blog: any) => (
                            <tr key={blog.id} className="hover:bg-muted/30">
                              <td className="px-4 py-3 font-medium">{blog.title}</td>
                              <td className="px-4 py-3">
                                <Badge variant={blog.status === "published" ? "default" : "secondary"} className="capitalize">
                                  {blog.status}
                                </Badge>
                              </td>
                              <td className="px-4 py-3 font-mono">{blog.view_count}</td>
                              <td className="px-4 py-3">
                                <Button 
                                  variant="destructive" 
                                  size="icon"
                                  onClick={() => {
                                    if (confirm("Delete this blog post?")) {
                                      deleteBlogMutation.mutate(blog.id);
                                    }
                                  }}
                                  disabled={deleteBlogMutation.isPending}
                                >
                                  <Trash className="w-4 h-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                          {(!blogsData?.items || blogsData?.items.length === 0) && (
                            <tr><td colSpan={4} className="p-4 text-center text-muted-foreground">No blog posts found</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Contact Inquiries */}
              <div className="glass-card p-6 border bg-card/50">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" /> Contact Inquiries
                </h3>
                {inquiriesLoading ? (
                  <div className="flex justify-center p-12"><RefreshCw className="w-6 h-6 animate-spin text-primary" /></div>
                ) : (
                  <div className="border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/50 text-muted-foreground">
                        <tr>
                          <th className="px-4 py-3 font-medium">Sender</th>
                          <th className="px-4 py-3 font-medium">Subject</th>
                          <th className="px-4 py-3 font-medium">Message</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {inquiries?.map((inq: any) => (
                          <tr key={inq.id} className="hover:bg-muted/30">
                            <td className="px-4 py-3 font-medium">{inq.name} ({inq.email})</td>
                            <td className="px-4 py-3 font-semibold">{inq.subject}</td>
                            <td className="px-4 py-3 text-muted-foreground">{inq.message}</td>
                          </tr>
                        ))}
                        {(!inquiries || inquiries.length === 0) && (
                          <tr><td colSpan={3} className="p-4 text-center text-muted-foreground">No inquiries found</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Support Tickets */}
              <div className="glass-card p-6 border bg-card/50">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-primary" /> Active Support Tickets
                </h3>
                {ticketsLoading ? (
                  <div className="flex justify-center p-12"><RefreshCw className="w-6 h-6 animate-spin text-primary" /></div>
                ) : (
                  <div className="border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/50 text-muted-foreground">
                        <tr>
                          <th className="px-4 py-3 font-medium">User</th>
                          <th className="px-4 py-3 font-medium">Subject</th>
                          <th className="px-4 py-3 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {tickets?.map((t: any) => (
                          <tr key={t.id} className="hover:bg-muted/30">
                            <td className="px-4 py-3">{t.user?.email || "Unknown"}</td>
                            <td className="px-4 py-3 font-medium">{t.subject}</td>
                            <td className="px-4 py-3">
                              <Badge className="capitalize">{t.status}</Badge>
                            </td>
                          </tr>
                        ))}
                        {(!tickets || tickets.length === 0) && (
                          <tr><td colSpan={3} className="p-4 text-center text-muted-foreground">No active support tickets</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SOFTWARE TAB */}
          {activeTab === "software" && (
            <div className="space-y-8">
              {/* Add Software Form */}
              <div className="glass-card p-6 border bg-card/50">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-primary" /> Add New Software Release
                </h3>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    createSoftwareMutation.mutate({
                      name: newSoftware.name,
                      description: newSoftware.description,
                      category: newSoftware.category,
                      is_free: newSoftware.is_free,
                      price: newSoftware.is_free ? null : parseFloat(newSoftware.price || "0"),
                    });
                  }} 
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Software Name</label>
                      <Input 
                        value={newSoftware.name}
                        onChange={(e) => setNewSoftware({ ...newSoftware, name: e.target.value })}
                        placeholder="e.g. GenOS Firmware" required 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Category</label>
                      <Input 
                        value={newSoftware.category}
                        onChange={(e) => setNewSoftware({ ...newSoftware, category: e.target.value })}
                        placeholder="e.g. Drivers" required 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Pricing Mode</label>
                      <select 
                        value={newSoftware.is_free ? "true" : "false"}
                        onChange={(e) => setNewSoftware({ ...newSoftware, is_free: e.target.value === "true" })}
                        className="w-full h-10 p-2 rounded-md bg-background border border-border"
                      >
                        <option value="true">Free Download</option>
                        <option value="false">Paid License</option>
                      </select>
                    </div>
                  </div>
                  {!newSoftware.is_free && (
                    <div className="space-y-2 max-w-xs">
                      <label className="text-sm font-medium">License Price (₹)</label>
                      <Input 
                        type="number"
                        value={newSoftware.price}
                        onChange={(e) => setNewSoftware({ ...newSoftware, price: e.target.value })}
                        placeholder="e.g. 1999" required 
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea 
                      value={newSoftware.description}
                      onChange={(e) => setNewSoftware({ ...newSoftware, description: e.target.value })}
                      placeholder="Enter software details, features, version info..." required 
                    />
                  </div>
                  <Button type="submit" disabled={createSoftwareMutation.isPending}>
                    {createSoftwareMutation.isPending ? "Adding..." : "Add Software"}
                  </Button>
                </form>
              </div>

              {/* Software List */}
              <div className="glass-card p-6 border bg-card/50">
                <h3 className="text-lg font-bold mb-4">Existing Software Releases</h3>
                {softwaresLoading ? (
                  <div className="flex justify-center p-12"><RefreshCw className="w-8 h-8 animate-spin text-primary" /></div>
                ) : (
                  <div className="border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/50 text-muted-foreground">
                        <tr>
                          <th className="px-4 py-3 font-medium">Name</th>
                          <th className="px-4 py-3 font-medium">Category</th>
                          <th className="px-4 py-3 font-medium">Type</th>
                          <th className="px-4 py-3 font-medium">Price</th>
                          <th className="px-4 py-3 font-medium">Downloads</th>
                          <th className="px-4 py-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {softwares?.map((sw: any) => (
                          <tr key={sw.id} className="hover:bg-muted/30">
                            <td className="px-4 py-3 font-medium">{sw.name}</td>
                            <td className="px-4 py-3">{sw.category || "General"}</td>
                            <td className="px-4 py-3">
                              <Badge variant={sw.is_free ? "secondary" : "default"}>
                                {sw.is_free ? "Free" : "Paid"}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">₹{sw.price || "0.00"}</td>
                            <td className="px-4 py-3 font-mono">{sw.download_count}</td>
                            <td className="px-4 py-3">
                              <Button 
                                variant="destructive" 
                                size="icon"
                                onClick={() => {
                                  if (confirm("Delete this software entry?")) {
                                    deleteSoftwareMutation.mutate(sw.id);
                                  }
                                }}
                                disabled={deleteSoftwareMutation.isPending}
                              >
                                <Trash className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                        {(!softwares || softwares.length === 0) && (
                          <tr><td colSpan={6} className="p-4 text-center text-muted-foreground">No software entries found</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SERVICES TAB */}
          {activeTab === "services" && (
            <div className="space-y-8">
              {/* Add Service Form */}
              <div className="glass-card p-6 border bg-card/50">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" /> Add New Service / Lab Setup
                </h3>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    createServiceMutation.mutate({
                      name: newService.name,
                      short_description: newService.short_description,
                      description: newService.description,
                      pricing_info: newService.pricing_info,
                    });
                  }} 
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Service / Lab Setup Name</label>
                      <Input 
                        value={newService.name}
                        onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                        placeholder="e.g. AI Innovation Lab Setup" required 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Pricing Info</label>
                      <Input 
                        value={newService.pricing_info}
                        onChange={(e) => setNewService({ ...newService, pricing_info: e.target.value })}
                        placeholder="e.g. Starting from ₹50,000" required 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Short Summary</label>
                    <Input 
                      value={newService.short_description}
                      onChange={(e) => setNewService({ ...newService, short_description: e.target.value })}
                      placeholder="Brief one-line summary of service..." required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Description</label>
                    <Textarea 
                      value={newService.description}
                      onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                      placeholder="Enter detailed list of deliverables, hardware, support, training, etc..." required 
                    />
                  </div>
                  <Button type="submit" disabled={createServiceMutation.isPending}>
                    {createServiceMutation.isPending ? "Adding..." : "Add Service"}
                  </Button>
                </form>
              </div>

              {/* Services List */}
              <div className="glass-card p-6 border bg-card/50">
                <h3 className="text-lg font-bold mb-4">Active Services & Lab Setup Projects</h3>
                {servicesLoading ? (
                  <div className="flex justify-center p-12"><RefreshCw className="w-8 h-8 animate-spin text-primary" /></div>
                ) : (
                  <div className="border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/50 text-muted-foreground">
                        <tr>
                          <th className="px-4 py-3 font-medium">Name</th>
                          <th className="px-4 py-3 font-medium">Short Description</th>
                          <th className="px-4 py-3 font-medium">Pricing</th>
                          <th className="px-4 py-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {services?.map((svc: any) => (
                          <tr key={svc.id} className="hover:bg-muted/30">
                            <td className="px-4 py-3 font-medium">{svc.name}</td>
                            <td className="px-4 py-3 text-muted-foreground">{svc.short_description}</td>
                            <td className="px-4 py-3 font-semibold">{svc.pricing_info}</td>
                            <td className="px-4 py-3">
                              <Button 
                                variant="destructive" 
                                size="icon"
                                onClick={() => {
                                  if (confirm("Delete this service?")) {
                                    deleteServiceMutation.mutate(svc.id);
                                  }
                                }}
                                disabled={deleteServiceMutation.isPending}
                              >
                                <Trash className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                        {(!services || services.length === 0) && (
                          <tr><td colSpan={4} className="p-4 text-center text-muted-foreground">No services listed yet</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* COUPONS TAB */}
          {activeTab === "coupons" && (
            <div className="space-y-8">
              {/* Add Coupon Form */}
              <div className="glass-card p-6 border bg-card/50">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-primary" /> Create New Coupon / Discount Rule
                </h3>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    createCouponMutation.mutate({
                      code: newCoupon.code,
                      description: newCoupon.description,
                      discount_type: newCoupon.discount_type,
                      discount_value: parseFloat(newCoupon.discount_value),
                      min_order_amount: newCoupon.min_order_amount ? parseFloat(newCoupon.min_order_amount) : null,
                      max_uses: newCoupon.max_uses ? parseInt(newCoupon.max_uses) : null,
                      is_active: true,
                    });
                  }} 
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Coupon Code</label>
                      <Input 
                        value={newCoupon.code}
                        onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                        placeholder="e.g. ROBOTICS20" required 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Discount Type</label>
                      <select 
                        value={newCoupon.discount_type}
                        onChange={(e) => setNewCoupon({ ...newCoupon, discount_type: e.target.value })}
                        className="w-full h-10 p-2 rounded-md bg-background border border-border"
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount (₹)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Discount Value</label>
                      <Input 
                        type="number"
                        value={newCoupon.discount_value}
                        onChange={(e) => setNewCoupon({ ...newCoupon, discount_value: e.target.value })}
                        placeholder="e.g. 20" required 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Min Order Amount (₹)</label>
                      <Input 
                        type="number"
                        value={newCoupon.min_order_amount}
                        onChange={(e) => setNewCoupon({ ...newCoupon, min_order_amount: e.target.value })}
                        placeholder="e.g. 1000"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Max Uses</label>
                      <Input 
                        type="number"
                        value={newCoupon.max_uses}
                        onChange={(e) => setNewCoupon({ ...newCoupon, max_uses: e.target.value })}
                        placeholder="e.g. 100"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Description</label>
                      <Input 
                        value={newCoupon.description}
                        onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                        placeholder="e.g. Get 20% off on all robotic kits"
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={createCouponMutation.isPending}>
                    {createCouponMutation.isPending ? "Creating..." : "Create Coupon"}
                  </Button>
                </form>
              </div>

              {/* Coupons List */}
              <div className="glass-card p-6 border bg-card/50">
                <h3 className="text-lg font-bold mb-4">Active Coupon & Discount Rules</h3>
                {couponsLoading ? (
                  <div className="flex justify-center p-12"><RefreshCw className="w-8 h-8 animate-spin text-primary" /></div>
                ) : (
                  <div className="border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/50 text-muted-foreground">
                        <tr>
                          <th className="px-4 py-3 font-medium">Code</th>
                          <th className="px-4 py-3 font-medium">Description</th>
                          <th className="px-4 py-3 font-medium">Type</th>
                          <th className="px-4 py-3 font-medium">Value</th>
                          <th className="px-4 py-3 font-medium">Min Order</th>
                          <th className="px-4 py-3 font-medium">Uses</th>
                          <th className="px-4 py-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {coupons?.map((coupon: any) => (
                          <tr key={coupon.id} className="hover:bg-muted/30">
                            <td className="px-4 py-3 font-mono font-bold text-primary">{coupon.code}</td>
                            <td className="px-4 py-3">{coupon.description || "-"}</td>
                            <td className="px-4 py-3 capitalize">{coupon.discount_type}</td>
                            <td className="px-4 py-3">
                              {coupon.discount_type === "percentage" ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`}
                            </td>
                            <td className="px-4 py-3">₹{coupon.min_order_amount || "0.00"}</td>
                            <td className="px-4 py-3 font-mono">
                              {coupon.used_count} / {coupon.max_uses || "∞"}
                            </td>
                            <td className="px-4 py-3">
                              <Button 
                                variant="destructive" 
                                size="icon"
                                onClick={() => {
                                  if (confirm("Delete this coupon?")) {
                                    deleteCouponMutation.mutate(coupon.id);
                                  }
                                }}
                                disabled={deleteCouponMutation.isPending}
                              >
                                <Trash className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                        {(!coupons || coupons.length === 0) && (
                          <tr><td colSpan={7} className="p-4 text-center text-muted-foreground">No coupons found</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === "settings" && (
            <div className="glass-card p-6 border bg-card/50 max-w-2xl">
              <h3 className="text-lg font-bold mb-6">Global Settings Configuration</h3>
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Settings saved!"); }}>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Platform / Site Name</label>
                  <Input defaultValue="GenBots Enterprise Platform" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Support Email Address</label>
                  <Input type="email" defaultValue="support@genbots.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Default Currency</label>
                  <Input defaultValue="INR (₹)" />
                </div>
                <Button type="submit">Save Configurations</Button>
              </form>
            </div>
          )}

          {/* AUDIT LOGS TAB */}
          {activeTab === "logs" && (
            <div className="space-y-6">
              <div className="glass-card p-6 border bg-card/50">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" /> System Audit Logs
                </h3>
                {logsLoading ? (
                  <div className="flex justify-center p-12"><RefreshCw className="w-8 h-8 animate-spin text-primary" /></div>
                ) : (
                  <div className="border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/50 text-muted-foreground">
                        <tr>
                          <th className="px-4 py-3 font-medium">Timestamp</th>
                          <th className="px-4 py-3 font-medium">User ID</th>
                          <th className="px-4 py-3 font-medium">Action</th>
                          <th className="px-4 py-3 font-medium">Resource Type</th>
                          <th className="px-4 py-3 font-medium">Resource ID</th>
                          <th className="px-4 py-3 font-medium">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {auditLogs?.map((log: any) => (
                          <tr key={log.id} className="hover:bg-muted/30">
                            <td className="px-4 py-3 font-mono text-xs">
                              {new Date(log.created_at).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 font-mono text-xs max-w-[150px] truncate" title={log.user_id}>
                              {log.user_id || "System"}
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant="outline" className="capitalize">
                                {log.action.replace(/_/g, " ")}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 capitalize">{log.resource_type}</td>
                            <td className="px-4 py-3 font-mono text-xs max-w-[120px] truncate" title={log.resource_id}>
                              {log.resource_id || "-"}
                            </td>
                            <td className="px-4 py-3 text-xs font-mono max-w-[200px] truncate" title={JSON.stringify(log.details)}>
                              {log.details ? JSON.stringify(log.details) : "-"}
                            </td>
                          </tr>
                        ))}
                        {(!auditLogs || auditLogs.length === 0) && (
                          <tr>
                            <td colSpan={6} className="p-4 text-center text-muted-foreground">
                              No audit logs recorded yet
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
          
        </main>
      </div>
    </div>
  );
}
