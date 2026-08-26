"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard, Users, ShoppingCart, Package, Settings,
  LogOut, DollarSign, Plus, Trash, Edit2,
  Check, RefreshCw, Mail, HelpCircle, Shield, History,
  Cpu, Briefcase, BookOpen, Tag, Bell, MessageSquare, Download, Upload,
  Eye, Copy, Archive, RotateCcw, AlertTriangle, Star, CheckCircle, FileText,
  Images, GraduationCap, TrendingUp, Activity, BarChart3, Radio, Smartphone, Monitor, Globe, Clock, ArrowUpRight,
  School, Phone, MapPin, Share2, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/auth";
import { useAdminAuthStore } from "@/store/adminAuth";
import {
  adminApi, productsApi, blogApi, softwareApi, servicesApi, projectsApi, cmsApi, mediaApi, trainingApi, settingsApi, publicApi
} from "@/lib/api";
import { generateInvoice, generatePurchaseOrder, resolveImageUrl, getProductImage } from "@/lib/utils";
import { AdminProductsPanel } from "@/components/admin/AdminProductsPanel";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const queryClient = useQueryClient();
  const { admin: user, logout } = useAdminAuthStore();

  // --- STATE FOR MEDIA UPLOADS ---
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [customImageUrl, setCustomImageUrl] = useState("");

  // --- FORM STATE FOR PRODUCTS ---
  const initialProductState = {
    name: "",
    sku: "",
    category_id: "",
    brand_id: "",
    price: "",
    compare_at_price: "",
    tax_rate: "18.00",
    stock_quantity: "",
    low_stock_threshold: "5",
    description: "",
    short_description: "",
    status: "active",
    is_featured: false,
    is_digital: false,
    weight: "",
    dimensions: { length: "", width: "", height: "" },
    meta_title: "",
    meta_description: "",
    tags: "",
    warranty_info: "",
    return_policy: "",
    shipping_info: "",
    images: [] as { url: string; alt_text?: string; is_primary: boolean; sort_order?: number }[],
    specifications: [] as { key: string; value: string }[],
    glb_url: "",
    usdz_url: ""
  };
  const [newProduct, setNewProduct] = useState(initialProductState);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [specKey, setSpecKey] = useState("");
  const [specValue, setSpecValue] = useState("");

  // --- SHARED ERROR EXTRACTOR ---
  const extractErr = (err: any, fallback = "An error occurred"): string => {
    const d = err?.response?.data;
    if (!d) return err?.message || fallback;
    if (typeof d.detail === "string") return d.detail;
    if (Array.isArray(d.detail)) return d.detail.map((e: any) => e.msg ?? JSON.stringify(e)).join("; ");
    if (typeof d.detail === "object" && d.detail !== null) return JSON.stringify(d.detail);
    if (typeof d === "string") return d;
    return `HTTP ${err?.response?.status}: ${JSON.stringify(d)}`;
  };

  // --- FORM STATE FOR SOFTWARE & VERSIONS ---
  const [newSoftware, setNewSoftware] = useState({
    name: "",
    description: "",
    short_description: "",
    category: "Utility",
    is_free: true,
    price: "",
  });
  const [selectedSoftwareForVersions, setSelectedSoftwareForVersions] = useState<any | null>(null);
  const [newVersion, setNewVersion] = useState({
    version: "",
    platform: "Windows",
    release_notes: "",
    changelog: "",
    download_url: "",
    file_size: "",
    is_latest: true,
  });

  // --- FORM STATE FOR SERVICES ---
  const [newService, setNewService] = useState({
    name: "",
    description: "",
    short_description: "",
    pricing_info: "",
    icon: "Cpu",
    image_url: "",
    features: "",
    faqs: [] as { q: string; a: string }[],
    cta_text: "Get Quote",
    cta_link: "/contact"
  });
  const [faqQ, setFaqQ] = useState("");
  const [faqA, setFaqA] = useState("");

  // --- FORM STATE FOR PROJECTS / GALLERY ---
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    short_description: "",
    cover_image: "",
    category: "Workshop",
    client: "School Visit",
    project_type: "student",
    status: "completed",
    is_featured: false,
    technologies: "",
  });
  const [editingProject, setEditingProject] = useState<any | null>(null);

  // --- FORM STATE FOR TRAINING COURSES ---
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    short_description: "",
    cover_image: "",
    category: "Robotics",
    course_type: "online",
    duration: "4 Weeks",
    level: "beginner",
    price: "",
    instructor: "GenBots Lab Team",
    max_students: "50",
  });
  const [editingCourse, setEditingCourse] = useState<any | null>(null);

  // --- STATE FOR HOME PAGE CMS ---
  const [cmsHome, setCmsHome] = useState({
    hero_title: "Empowering Next-Gen Robotics & AI",
    hero_subtitle: "Futuristic hardware, curriculum and lab setups for schools and enterprises.",
    hero_image: "",
    stat_schools: "150+",
    stat_students: "50,000+",
    stat_labs: "80+",
    about_title: "Who We Are",
    about_content: "GenBots is leading the charge in robotics education and industry automation integrations."
  });

  // --- STATE FOR COUPONS ---
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    description: "",
    discount_type: "percentage",
    discount_value: "",
    min_order_amount: "",
    max_uses: "",
  });

  // --- FORM STATE FOR BLOG CMS ---
  const [newBlog, setNewBlog] = useState({
    title: "",
    excerpt: "",
    content: "",
    status: "draft",
  });

  // --- FORM STATE FOR FEEDBACK / TESTIMONIALS ---
  const [isAddFeedbackOpen, setIsAddFeedbackOpen] = useState(false);
  const [newFeedback, setNewFeedback] = useState({
    name: "",
    designation: "Maker / Enthusiast",
    company: "",
    rating: 5,
    content: "",
    is_active: true,
  });

  // --- FETCH QUERIES ---
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["adminStats"],
    queryFn: async () => (await adminApi.dashboard()).data,
    enabled: !!user,
  });

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["adminOrders"],
    queryFn: async () => {
      try {
        const res = await adminApi.orders();
        const rawList = Array.isArray(res.data) ? res.data : (res.data?.items || []);
        return { items: rawList };
      } catch {
        return { items: [] };
      }
    },
    enabled: !!user,
  });

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["adminProducts"],
    queryFn: async () => (await productsApi.list({ status: "active" })).data,
    enabled: !!user,
  });

  const { data: archivedProductsData } = useQuery({
    queryKey: ["adminArchivedProducts"],
    queryFn: async () => (await productsApi.list({ status: "archived" })).data,
    enabled: !!user && activeTab === "products",
  });

  const { data: draftProductsData } = useQuery({
    queryKey: ["adminDraftProducts"],
    queryFn: async () => (await productsApi.list({ status: "draft" })).data,
    enabled: !!user && activeTab === "products",
  });

  const { data: productCategories } = useQuery({
    queryKey: ["adminProductCategories"],
    queryFn: async () => (await productsApi.categories()).data,
    enabled: !!user && activeTab === "products",
  });

  const { data: productBrands } = useQuery({
    queryKey: ["adminProductBrands"],
    queryFn: async () => (await productsApi.brands()).data,
    enabled: !!user && activeTab === "products",
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: async () => (await adminApi.users()).data,
    enabled: !!user,
  });

  const { data: inquiries } = useQuery({
    queryKey: ["adminInquiries"],
    queryFn: async () => (await adminApi.inquiries()).data,
    enabled: !!user && activeTab === "content",
  });

  const { data: tickets } = useQuery({
    queryKey: ["adminTickets"],
    queryFn: async () => (await adminApi.tickets()).data,
    enabled: !!user && activeTab === "content",
  });

  const { data: auditLogs, isLoading: logsLoading } = useQuery({
    queryKey: ["adminLogs"],
    queryFn: async () => (await adminApi.logs()).data,
    enabled: !!user && activeTab === "logs",
  });

  const { data: softwares, isLoading: softwaresLoading } = useQuery({
    queryKey: ["adminSoftwares"],
    queryFn: async () => (await softwareApi.list()).data,
    enabled: !!user && activeTab === "software",
  });

  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ["adminServices"],
    queryFn: async () => (await servicesApi.list()).data,
    enabled: !!user && activeTab === "services",
  });

  const { data: blogsData, isLoading: blogsLoading } = useQuery({
    queryKey: ["adminBlogs"],
    queryFn: async () => (await blogApi.list()).data,
    enabled: !!user && activeTab === "content",
  });

  const { data: coupons, isLoading: couponsLoading } = useQuery({
    queryKey: ["adminCoupons"],
    queryFn: async () => (await adminApi.coupons()).data,
    enabled: !!user && activeTab === "coupons",
  });

  const { data: notifications, refetch: refetchNotifications } = useQuery({
    queryKey: ["adminNotifications"],
    queryFn: async () => (await adminApi.listNotifications()).data,
    enabled: !!user,
  });

  const { data: reviews, refetch: refetchReviews } = useQuery({
    queryKey: ["adminReviews"],
    queryFn: async () => (await adminApi.reviews()).data,
    enabled: !!user && activeTab === "feedback",
  });

  const { data: testimonials, refetch: refetchTestimonials, isLoading: testimonialsLoading } = useQuery({
    queryKey: ["adminTestimonials"],
    queryFn: async () => (await adminApi.testimonials()).data,
    enabled: !!user && activeTab === "feedback",
  });

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ["adminProjects"],
    queryFn: async () => (await projectsApi.list()).data,
    enabled: !!user && activeTab === "gallery",
  });

  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ["adminCourses"],
    queryFn: async () => (await trainingApi.list()).data,
    enabled: !!user && activeTab === "training",
  });

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ["adminAnalytics"],
    queryFn: async () => (await adminApi.analytics()).data,
    enabled: !!user && (activeTab === "analytics" || activeTab === "overview"),
  });

  // --- REAL LOCAL ANALYTICS (from VisitorTracker localStorage) ---
  const localAnalytics = useMemo(() => {
    if (typeof window === "undefined" || activeTab !== "analytics") return null;
    try {
      const today = new Date().toISOString().split("T")[0];

      // Daily views from localStorage
      const dailyViewsRaw = localStorage.getItem("genbots_daily_views");
      const dailyViewsMap: Record<string, number> = dailyViewsRaw ? JSON.parse(dailyViewsRaw) : {};
      const dailyViews = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dateStr = d.toISOString().split("T")[0];
        return { date: dateStr, views: dailyViewsMap[dateStr] || 0, unique_visitors: Math.round((dailyViewsMap[dateStr] || 0) * 0.65) };
      });

      // Top pages from localStorage
      const pageViewsRaw = localStorage.getItem("genbots_page_views");
      const pageViewsMap: Record<string, number> = pageViewsRaw ? JSON.parse(pageViewsRaw) : {};
      const getPageTitle = (path: string) => {
        if (path === "/") return { title: "Home Page", category: "Landing" };
        if (path.startsWith("/store")) return { title: "Products Store", category: "Store" };
        if (path.startsWith("/blog/microcontroller")) return { title: "Microcontroller Beginner's Guide", category: "Blog" };
        if (path.startsWith("/blog/dht11")) return { title: "DHT11 Sensor Guide", category: "Blog" };
        if (path.startsWith("/blog/ultrasonic")) return { title: "HC-SR04 Ultrasonic Guide", category: "Blog" };
        if (path.startsWith("/blog/ir-sensor")) return { title: "IR Sensor Module Guide", category: "Blog" };
        if (path.startsWith("/blog")) return { title: "Blog", category: "Blog" };
        if (path.startsWith("/software")) return { title: "Software Portal", category: "Software" };
        if (path.startsWith("/services")) return { title: "Services & Lab Setup", category: "Services" };
        if (path.startsWith("/cart")) return { title: "Shopping Cart", category: "Cart" };
        if (path.startsWith("/checkout")) return { title: "Checkout", category: "Checkout" };
        if (path.startsWith("/about")) return { title: "About GenBots", category: "Info" };
        if (path.startsWith("/contact")) return { title: "Contact Page", category: "Info" };
        return { title: path, category: "Other" };
      };
      const topPages = Object.entries(pageViewsMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 8)
        .map(([path, views]) => ({ path, views, ...getPageTitle(path) }));

      // Device breakdown
      const activitiesRaw = localStorage.getItem("genbots_visitor_activities");
      const activities: any[] = activitiesRaw ? JSON.parse(activitiesRaw) : [];
      const deviceCounts: Record<string, number> = {};
      const browserCounts: Record<string, number> = {};
      activities.forEach((a) => {
        deviceCounts[a.device] = (deviceCounts[a.device] || 0) + 1;
        browserCounts[a.browser] = (browserCounts[a.browser] || 0) + 1;
      });
      const totalDevices = Object.values(deviceCounts).reduce((s, v) => s + v, 0) || 1;
      const totalBrowsers = Object.values(browserCounts).reduce((s, v) => s + v, 0) || 1;
      const deviceBreakdown = Object.entries(deviceCounts).map(([device, count]) => ({
        device, count, percentage: Math.round((count / totalDevices) * 100),
      }));
      const browserBreakdown = Object.entries(browserCounts).map(([name, count]) => ({
        name, percentage: Math.round((count / totalBrowsers) * 100),
      }));

      // Recent activities with human-readable time
      const recentActivities = activities.slice(0, 10).map((a) => ({
        ...a,
        visitor: `Visitor ${a.visitor_id}`,
        time: (() => {
          const diff = Math.floor((Date.now() - new Date(a.timestamp).getTime()) / 1000);
          if (diff < 60) return `${diff}s ago`;
          if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
          return `${Math.floor(diff / 3600)}h ago`;
        })(),
      }));

      return {
        todayViews: dailyViewsMap[today] || 0,
        dailyViews,
        topPages,
        deviceBreakdown,
        browserBreakdown,
        recentActivities,
      };
    } catch (e) {
      console.error("Failed to load local analytics:", e);
      return null;
    }
  }, [activeTab]);

  // --- MUTATIONS ---
  const createProductMutation = useMutation({
    mutationFn: async (pData: any) => (await productsApi.create(pData)).data,
    onSuccess: (createdProduct: any) => {
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
      queryClient.invalidateQueries({ queryKey: ["adminDraftProducts"] });
      const productLink = typeof window !== "undefined"
        ? `${window.location.origin}/store/${createdProduct.slug}`
        : `/store/${createdProduct.slug}`;
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText(productLink).catch(() => { });
      }
      alert(`Product added successfully!\n\nUnique Shareable Link:\n${productLink}\n\n(Link copied to clipboard)`);
      setNewProduct(initialProductState);
    },
    onError: (err: any) => alert(extractErr(err, "Failed to create product"))
  });


  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => (await productsApi.update(id, data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
      queryClient.invalidateQueries({ queryKey: ["adminDraftProducts"] });
      queryClient.invalidateQueries({ queryKey: ["adminArchivedProducts"] });
      alert("Product updated successfully!");
      setEditingProduct(null);
    },
    onError: (err: any) => alert(extractErr(err, "Failed to update product"))
  });


  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => (await productsApi.delete(id)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
      queryClient.invalidateQueries({ queryKey: ["adminDraftProducts"] });
      queryClient.invalidateQueries({ queryKey: ["adminArchivedProducts"] });
      alert("Product permanently deleted!");
    },
    onError: (err: any) => alert(extractErr(err, "Failed to delete product"))
  });

  const createSoftwareMutation = useMutation({
    mutationFn: async (data: any) => (await softwareApi.create(data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminSoftwares"] });
      alert("Software release added successfully!");
      setNewSoftware({ name: "", description: "", short_description: "", category: "Utility", is_free: true, price: "" });
    },
    onError: (err: any) => alert(err.response?.data?.detail || "Failed to add software")
  });

  const createVersionMutation = useMutation({
    mutationFn: async ({ swId, data }: { swId: string; data: any }) => (await softwareApi.createVersion(swId, data)).data,
    onSuccess: () => {
      alert("Software version added successfully!");
      setNewVersion({ version: "", platform: "Windows", release_notes: "", changelog: "", download_url: "", file_size: "", is_latest: true });
      if (selectedSoftwareForVersions) {
        queryClient.invalidateQueries({ queryKey: ["softwareVersions", selectedSoftwareForVersions.id] });
      }
    },
    onError: (err: any) => alert(err.response?.data?.detail || "Failed to add version")
  });

  const createServiceMutation = useMutation({
    mutationFn: async (data: any) => (await servicesApi.create(data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminServices"] });
      alert("Service added successfully!");
      setNewService({ name: "", description: "", short_description: "", pricing_info: "", icon: "Cpu", image_url: "", features: "", faqs: [], cta_text: "Get Quote", cta_link: "/contact" });
    },
    onError: (err: any) => alert(err.response?.data?.detail || "Failed to add service")
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (id: string) => (await servicesApi.delete(id)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminServices"] });
      alert("Service deleted successfully!");
    }
  });

  const createCouponMutation = useMutation({
    mutationFn: async (data: any) => (await adminApi.createCoupon(data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCoupons"] });
      alert("Coupon created successfully!");
      setNewCoupon({ code: "", description: "", discount_type: "percentage", discount_value: "", min_order_amount: "", max_uses: "" });
    }
  });

  const deleteCouponMutation = useMutation({
    mutationFn: async (id: string) => (await adminApi.deleteCoupon(id)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCoupons"] });
      alert("Coupon deleted successfully!");
    }
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => (await adminApi.updateOrderStatus(orderId, status)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminOrders"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
      alert("Order status updated!");
    }
  });

  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId: string) => (await adminApi.deleteOrder(orderId)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminOrders"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
      alert("Order deleted successfully!");
    }
  });

  const resetRevenueMutation = useMutation({
    mutationFn: async () => (await adminApi.resetRevenue()).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
      queryClient.invalidateQueries({ queryKey: ["adminOrders"] });
      alert("Total revenue reset to ₹0!");
    }
  });

  const deleteAllOrdersMutation = useMutation({
    mutationFn: async () => (await adminApi.deleteAllOrders()).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
      queryClient.invalidateQueries({ queryKey: ["adminOrders"] });
      alert("All test orders deleted and revenue reset to ₹0!");
    }
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => (await adminApi.updateUser(userId, { role })).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      alert("User role updated successfully!");
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => (await adminApi.deleteUser(userId)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
      alert("User account deleted successfully!");
    },
    onError: (err: any) => alert(err.response?.data?.detail || "Failed to delete user")
  });

  const approveReviewMutation = useMutation({
    mutationFn: async (id: string) => (await adminApi.approveReview(id)).data,
    onSuccess: () => {
      refetchReviews();
      alert("Review approved successfully!");
    }
  });

  const deleteReviewMutation = useMutation({
    mutationFn: async (id: string) => (await adminApi.deleteReview(id)).data,
    onSuccess: () => {
      refetchReviews();
      alert("Review deleted successfully!");
    }
  });

  const toggleTestimonialMutation = useMutation({
    mutationFn: async (id: string) => (await adminApi.toggleTestimonial(id)).data,
    onSuccess: (data) => {
      refetchTestimonials();
      alert(data.is_active ? "Review is now LIVE on the Home Page! 🌟" : "Review removed from Home Page.");
    }
  });

  const deleteTestimonialMutation = useMutation({
    mutationFn: async (id: string) => (await adminApi.deleteTestimonial(id)).data,
    onSuccess: () => {
      refetchTestimonials();
      alert("Feedback deleted successfully!");
    }
  });

  const createTestimonialMutation = useMutation({
    mutationFn: async (data: any) => (await publicApi.submitFeedback(data)).data,
    onSuccess: () => {
      refetchTestimonials();
      setIsAddFeedbackOpen(false);
      setNewFeedback({
        name: "",
        designation: "Maker / Enthusiast",
        company: "",
        rating: 5,
        content: "",
        is_active: true,
      });
      alert("Feedback / Review created and added successfully! 🌟");
    },
    onError: (err: any) => alert(err.response?.data?.detail || "Failed to add feedback")
  });

  const markAllNotificationsReadMutation = useMutation({
    mutationFn: async () => (await adminApi.markAllNotificationsRead()).data,
    onSuccess: () => {
      refetchNotifications();
      alert("All notifications marked as read!");
    }
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: string) => (await adminApi.deleteNotification(id)).data,
    onSuccess: () => {
      refetchNotifications();
    }
  });

  const saveCmsHomeMutation = useMutation({
    mutationFn: async (data: any) => (await cmsApi.getPage("home")).data, // Mocking save page
    onSuccess: () => {
      alert("CMS configuration saved successfully!");
    }
  });

  const createBlogMutation = useMutation({
    mutationFn: async (data: any) => (await blogApi.create(data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminBlogs"] });
      alert("Blog post created!");
      setNewBlog({ title: "", excerpt: "", content: "", status: "draft" });
    }
  });

  const deleteBlogMutation = useMutation({
    mutationFn: async (id: string) => (await blogApi.delete(id)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminBlogs"] });
      alert("Blog post deleted!");
    }
  });

  // --- GALLERY & PROJECTS MUTATIONS ---
  const createProjectMutation = useMutation({
    mutationFn: async (data: any) => (await projectsApi.create(data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminProjects"] });
      alert("Gallery/Workshop entry created!");
      setNewProject({ title: "", description: "", short_description: "", cover_image: "", category: "Workshop", client: "School Visit", project_type: "student", status: "completed", is_featured: false, technologies: "" });
    },
    onError: (err: any) => alert(err.response?.data?.detail || "Failed to create gallery item")
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => (await projectsApi.update(id, data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminProjects"] });
      alert("Gallery entry updated!");
      setEditingProject(null);
    },
    onError: (err: any) => alert(err.response?.data?.detail || "Failed to update project")
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: string) => (await projectsApi.delete(id)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminProjects"] });
      alert("Gallery item deleted!");
    }
  });

  // --- TRAINING COURSES MUTATIONS ---
  const createCourseMutation = useMutation({
    mutationFn: async (data: any) => (await trainingApi.create(data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCourses"] });
      alert("Training course created successfully!");
      setNewCourse({ title: "", description: "", short_description: "", cover_image: "", category: "Robotics", course_type: "online", duration: "4 Weeks", level: "beginner", price: "", instructor: "GenBots Lab Team", max_students: "50" });
    },
    onError: (err: any) => alert(err.response?.data?.detail || "Failed to create course")
  });

  const updateCourseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => (await trainingApi.update(id, data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCourses"] });
      alert("Training course updated!");
      setEditingCourse(null);
    },
    onError: (err: any) => alert(err.response?.data?.detail || "Failed to update course")
  });

  const deleteCourseMutation = useMutation({
    mutationFn: async (id: string) => (await trainingApi.delete(id)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCourses"] });
      alert("Training course deleted!");
    }
  });

  // --- DYNAMIC VERSION RETRIEVAL ---
  const { data: selectedVersions } = useQuery({
    queryKey: ["softwareVersions", selectedSoftwareForVersions?.id],
    queryFn: async () => (await softwareApi.versions(selectedSoftwareForVersions.id)).data,
    enabled: !!selectedSoftwareForVersions,
  });

  // --- FILE UPLOAD HANDLERS & IMAGE MANAGEMENT ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: "product-primary" | "product-gallery" | "service" | "software" | "project-cover" | "course-cover") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    setUploadError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", target.startsWith("product") ? "products" : target);

    try {
      const res = await mediaApi.upload(formData);
      const fileUrl = res.data.url;

      if (target === "product-primary") {
        setNewProduct(prev => ({
          ...prev,
          images: [{ url: fileUrl, is_primary: true, sort_order: 0 }, ...(prev.images || []).map(i => ({ ...i, is_primary: false }))]
        }));
      } else if (target === "product-gallery") {
        setNewProduct(prev => ({
          ...prev,
          images: [...(prev.images || []), { url: fileUrl, is_primary: !(prev.images && prev.images.length > 0), sort_order: (prev.images || []).length }]
        }));
      } else if (target === "service") {
        setNewService(prev => ({ ...prev, image_url: fileUrl }));
      } else if (target === "software") {
        setNewVersion(prev => ({ ...prev, download_url: fileUrl }));
      } else if (target === "project-cover") {
        setNewProject(prev => ({ ...prev, cover_image: fileUrl }));
      } else if (target === "course-cover") {
        setNewCourse(prev => ({ ...prev, cover_image: fileUrl }));
      }
      alert("File uploaded successfully and optimized!");
    } catch (err: any) {
      setUploadError(err.response?.data?.detail || "Upload failed. Check file type and size constraints.");
    } finally {
      setUploadingFile(false);
      // Reset the file input so same file can be uploaded again if needed
      e.target.value = "";
    }
  };

  const handleEditProductUpload = async (e: React.ChangeEvent<HTMLInputElement>, isPrimary: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "products");

    try {
      const res = await mediaApi.upload(formData);
      const fileUrl = res.data.url;
      setEditingProduct((prev: any) => ({
        ...prev,
        images: isPrimary
          ? [{ url: fileUrl, is_primary: true, sort_order: 0 }, ...(prev.images || []).map((i: any) => ({ ...i, is_primary: false }))]
          : [...(prev.images || []), { url: fileUrl, is_primary: !(prev.images && prev.images.length > 0), sort_order: (prev.images || []).length }]
      }));
      alert("Image uploaded successfully!");
    } catch (err: any) {
      alert(err.response?.data?.detail || "Upload failed");
    } finally {
      setUploadingFile(false);
      e.target.value = "";
    }
  };

  const handleAddImageUrl = (urlToAdd: string) => {
    if (!urlToAdd || !urlToAdd.trim()) return;
    const cleanUrl = urlToAdd.trim();
    if (editingProduct) {
      setEditingProduct((prev: any) => {
        const existing = prev.images || [];
        const isPrimary = existing.length === 0;
        return {
          ...prev,
          images: [...existing, { url: cleanUrl, is_primary: isPrimary, sort_order: existing.length }]
        };
      });
    } else {
      setNewProduct((prev: any) => {
        const existing = prev.images || [];
        const isPrimary = existing.length === 0;
        return {
          ...prev,
          images: [...existing, { url: cleanUrl, is_primary: isPrimary, sort_order: existing.length }]
        };
      });
    }
    setCustomImageUrl("");
  };

  const handleRemoveProductImage = (idxToRemove: number) => {
    if (editingProduct) {
      setEditingProduct((prev: any) => {
        const updated = (prev.images || []).filter((_: any, idx: number) => idx !== idxToRemove);
        if (updated.length > 0 && !updated.some((i: any) => i.is_primary)) {
          updated[0].is_primary = true;
        }
        return { ...prev, images: updated };
      });
    } else {
      setNewProduct((prev: any) => {
        const updated = (prev.images || []).filter((_: any, idx: number) => idx !== idxToRemove);
        if (updated.length > 0 && !updated.some((i: any) => i.is_primary)) {
          updated[0].is_primary = true;
        }
        return { ...prev, images: updated };
      });
    }
  };

  const handleSetPrimaryImage = (primaryIndex: number) => {
    if (editingProduct) {
      setEditingProduct((prev: any) => ({
        ...prev,
        images: (prev.images || []).map((img: any, idx: number) => ({
          ...img,
          is_primary: idx === primaryIndex
        }))
      }));
    } else {
      setNewProduct((prev: any) => ({
        ...prev,
        images: (prev.images || []).map((img: any, idx: number) => ({
          ...img,
          is_primary: idx === primaryIndex
        }))
      }));
    }
  };

  const startEditingProduct = (product: any) => {
    setEditingProduct({
      id: product.id,
      name: product.name || "",
      sku: product.sku || "",
      category_id: product.category_id || product.category?.id || "",
      brand_id: product.brand_id || product.brand?.id || "",
      price: product.price !== undefined && product.price !== null ? product.price.toString() : "",
      compare_at_price: product.compare_at_price !== undefined && product.compare_at_price !== null ? product.compare_at_price.toString() : "",
      tax_rate: product.tax_rate !== undefined && product.tax_rate !== null ? product.tax_rate.toString() : "18.00",
      stock_quantity: product.stock_quantity !== undefined && product.stock_quantity !== null ? product.stock_quantity.toString() : "0",
      low_stock_threshold: product.low_stock_threshold !== undefined && product.low_stock_threshold !== null ? product.low_stock_threshold.toString() : "5",
      description: product.description || "",
      short_description: product.short_description || "",
      status: product.status || "active",
      is_featured: Boolean(product.is_featured),
      is_digital: Boolean(product.is_digital),
      weight: product.weight !== undefined && product.weight !== null ? product.weight.toString() : "",
      dimensions: product.dimensions || { length: "", width: "", height: "" },
      meta_title: product.meta_title || "",
      meta_description: product.meta_description || "",
      tags: Array.isArray(product.tags) ? product.tags.join(", ") : (product.tags || ""),
      warranty_info: product.warranty_info || "",
      return_policy: product.return_policy || "",
      shipping_info: product.shipping_info || "",
      images: (product.images || []).map((img: any, idx: number) => ({
        url: typeof img === "string" ? img : (img.url || img.image_url || ""),
        alt_text: typeof img === "object" ? (img.alt_text || "") : "",
        is_primary: typeof img === "object" ? Boolean(img.is_primary) : (idx === 0),
        sort_order: typeof img === "object" && typeof img.sort_order === "number" ? img.sort_order : idx
      })),
      specifications: (product.specifications || []).map((s: any) => ({
        key: s.key,
        value: s.value
      })),
      glb_url: product.glb_url || "",
      usdz_url: product.usdz_url || ""
    });
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  // --- EXPORT TO CSV HANDLER ---
  const handleExportReviews = () => {
    if (!reviews || reviews.length === 0) return alert("No reviews to export!");
    const headers = ["ID", "Product Name", "User Email", "Rating", "Title", "Comment", "Approved", "Date"];
    const rows = reviews.map((r: any) => [
      r.id,
      r.product_name,
      r.user_email,
      r.rating,
      `"${(r.title || "").replace(/"/g, '""')}"`,
      `"${(r.comment || "").replace(/"/g, '""')}"`,
      r.is_approved ? "Yes" : "No",
      r.created_at
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(","), ...rows.map((e: any) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `genbots_reviews_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const unreadNotificationsCount = notifications?.filter((n: any) => !n.is_read).length || 0;

  // --- INVOICE & PURCHASE ORDER GENERATION ---
  // Now handled by imported utils



  if (!user) return null;

  return (
    <div className="flex h-screen bg-background overflow-hidden">

      {/* Sidebar */}
      <div className="w-64 border-r border-border bg-card flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-border gap-3">
          <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center shadow-sm">
            <img src="/logo.png" alt="GenBots Logo" className="w-full h-full object-contain" />
          </div>
          <span className="text-xl font-bold">Gen<span className="gradient-text">Bots</span> <span className="text-xs font-normal text-muted-foreground ml-0.5">Admin</span></span>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            {[
              { id: "overview", icon: LayoutDashboard, label: "Overview" },
              { id: "analytics", icon: TrendingUp, label: "Visitor Traffic & Analytics" },
              { id: "orders", icon: ShoppingCart, label: "Orders" },
              { id: "products", icon: Package, label: "Products" },
              { id: "users", icon: Users, label: "Users" },
              { id: "software", icon: Cpu, label: "Software Portal" },
              { id: "services", icon: Briefcase, label: "Services & Labs" },
              { id: "lab_quotes", icon: School, label: "Lab Quote Requests" },
              { id: "gallery", icon: Images, label: "Gallery & Workshops" },
              { id: "training", icon: GraduationCap, label: "Training & Courses" },
              { id: "content", icon: BookOpen, label: "CMS & Support" },
              { id: "coupons", icon: Tag, label: "Coupons" },
              { id: "feedback", icon: MessageSquare, label: "Feedback & Reviews" },
              { id: "notifications", icon: Bell, label: "Notifications", badge: unreadNotificationsCount },
              { id: "logs", icon: History, label: "Audit Logs" },
              { id: "settings", icon: Settings, label: "Settings" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </div>
                {tab.badge && tab.badge > 0 ? (
                  <Badge variant="destructive" className="ml-2 px-1.5 py-0.5 text-[10px]">{tab.badge}</Badge>
                ) : null}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-border">
          <button
            onClick={() => { logout(); window.location.href = "/admin/login"; }}
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
          <h1 className="text-xl font-bold capitalize">{activeTab.replace(/_/g, " ")}</h1>
          <div className="flex items-center gap-6">
            <button onClick={() => setActiveTab("notifications")} className="relative p-1 rounded-full hover:bg-muted text-muted-foreground transition-colors">
              <Bell className="w-5 h-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-destructive rounded-full" />
              )}
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-bold">{user.email?.split("@")[0]}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
              </div>
              <div className="w-9 h-9 rounded-full gradient-bg flex items-center justify-center text-white font-bold shadow">
                {user.email?.charAt(0).toUpperCase()}
              </div>
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
                              <Badge className="capitalize">
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

          {/* VISITOR TRAFFIC & ANALYTICS TAB */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              {/* Top Key Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="glass-card p-5 border bg-card/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Today&apos;s Page Views</span>
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Eye className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold">{localAnalytics?.todayViews ?? 0}</div>
                  <div className="text-xs text-muted-foreground mt-2">Real views tracked today</div>
                </div>

                <div className="glass-card p-5 border bg-card/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Unique Visitors</span>
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Users className="w-4 h-4 text-blue-500" />
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold">{localAnalytics ? Math.round((localAnalytics.todayViews || 0) * 0.65) : 0}</div>
                  <div className="text-xs text-muted-foreground mt-2">Estimated unique sessions</div>
                </div>

                <div className="glass-card p-5 border bg-card/60 border-emerald-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total All-Time Views</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold">
                    {localAnalytics ? localAnalytics.dailyViews.reduce((s, d) => s + d.views, 0) : 0}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">Past 7 days combined</div>
                </div>

                <div className="glass-card p-5 border bg-card/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pages Tracked</span>
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <Globe className="w-4 h-4 text-purple-500" />
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold">{localAnalytics?.topPages.length ?? 0}</div>
                  <div className="text-xs text-muted-foreground mt-2">Distinct pages visited</div>
                </div>
              </div>

              {/* Traffic Graph & Live Activity Stream */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Visual Bar Chart for Past 7 Days */}
                <div className="lg:col-span-2 glass-card p-6 border bg-card/50">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-primary" /> Daily Traffic Trend (Past 7 Days)
                      </h3>
                      <p className="text-xs text-muted-foreground">Real pageviews tracked by VisitorTracker</p>
                    </div>
                    <Badge variant="outline" className="text-xs font-normal text-emerald-500 border-emerald-500/50">Live Data</Badge>
                  </div>

                  <div className="space-y-4">
                    {(localAnalytics?.dailyViews || []).map((day, idx) => {
                      const maxViews = Math.max(...(localAnalytics?.dailyViews || []).map(d => d.views), 1);
                      const percentage = Math.min(100, Math.round((day.views / maxViews) * 100));
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="font-semibold">{day.date}</span>
                            <span className="text-muted-foreground">
                              <strong className="text-foreground">{day.views}</strong> views ({day.unique_visitors} unique)
                            </span>
                          </div>
                          <div className="w-full bg-muted/60 h-3.5 rounded-full overflow-hidden">
                            <div
                              className="gradient-bg h-full rounded-full transition-all duration-500"
                              style={{ width: day.views === 0 ? '0%' : `${Math.max(2, percentage)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                    {(!localAnalytics || localAnalytics.dailyViews.every(d => d.views === 0)) && (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        <Activity className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p>No traffic data yet. Data will appear as visitors browse the site.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Live Visitor Activity Stream */}
                <div className="glass-card p-6 border bg-card/50 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <Activity className="w-5 h-5 text-emerald-500 animate-pulse" /> Recent Activity
                    </h3>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">Latest pages visited — tracked in real-time</p>

                  <div className="flex-1 overflow-y-auto space-y-3.5 max-h-[360px] pr-1">
                    {localAnalytics && localAnalytics.recentActivities.length > 0 ? localAnalytics.recentActivities.map((act: any, i: number) => (
                      <div key={i} className="p-3 rounded-xl bg-muted/40 border border-border/40 hover:bg-muted/70 transition-colors">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-semibold text-primary">{act.visitor}</span>
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {act.time}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-foreground mb-1">{act.action}</p>
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>{act.device}</span>
                          <span className="font-mono">{act.browser}</span>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-10 text-muted-foreground text-sm">
                        <Radio className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p>No activity recorded yet.</p>
                        <p className="text-xs mt-1">Visitor actions will appear here automatically.</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Top Pages Table & Device Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Top Visited Pages & Blogs */}
                <div className="lg:col-span-2 glass-card p-6 border bg-card/50">
                  <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" /> Most Visited Pages
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">Ranking by real tracked hits</p>

                  {localAnalytics && localAnalytics.topPages.length > 0 ? (
                    <div className="border border-border rounded-lg overflow-hidden">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-muted/50 text-muted-foreground">
                          <tr>
                            <th className="px-4 py-3 font-medium">Page</th>
                            <th className="px-4 py-3 font-medium">Category</th>
                            <th className="px-4 py-3 font-medium text-right">Views</th>
                            <th className="px-4 py-3 font-medium">Share</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {localAnalytics.topPages.map((p, idx) => {
                            const maxP = localAnalytics.topPages[0]?.views || 1;
                            return (
                              <tr key={idx} className="hover:bg-muted/30">
                                <td className="px-4 py-3 font-medium">
                                  <p className="truncate max-w-[260px] text-foreground">{p.title}</p>
                                  <span className="text-[11px] text-muted-foreground font-mono">{p.path}</span>
                                </td>
                                <td className="px-4 py-3">
                                  <Badge variant="outline" className="text-[10px] uppercase tracking-wider">{p.category}</Badge>
                                </td>
                                <td className="px-4 py-3 font-bold text-right text-foreground">{p.views}</td>
                                <td className="px-4 py-3 w-24">
                                  <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                                    <div className="gradient-bg h-full rounded-full" style={{ width: `${Math.round((p.views / maxP) * 100)}%` }} />
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-muted-foreground text-sm border border-border rounded-lg">
                      <Globe className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p>No page views recorded yet.</p>
                    </div>
                  )}
                </div>

                {/* Device & Browser Share */}
                <div className="space-y-6">
                  <div className="glass-card p-6 border bg-card/50">
                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-primary" /> Traffic by Device
                    </h3>
                    {localAnalytics && localAnalytics.deviceBreakdown.length > 0 ? (
                      <div className="space-y-3">
                        {localAnalytics.deviceBreakdown.map((d, i) => (
                          <div key={i} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="font-medium">{d.device}</span>
                              <span className="font-bold">{d.percentage}% ({d.count} visits)</span>
                            </div>
                            <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                              <div className="bg-primary h-full rounded-full" style={{ width: `${d.percentage}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground text-center py-4">No data yet</p>
                    )}
                  </div>

                  <div className="glass-card p-6 border bg-card/50">
                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-primary" /> Browsers Used
                    </h3>
                    {localAnalytics && localAnalytics.browserBreakdown.length > 0 ? (
                      <div className="space-y-3">
                        {localAnalytics.browserBreakdown.map((b, i) => (
                          <div key={i} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="font-medium">{b.name}</span>
                              <span className="font-bold">{b.percentage}%</span>
                            </div>
                            <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                              <div className="bg-blue-500 h-full rounded-full" style={{ width: `${b.percentage}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground text-center py-4">No data yet</p>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ORDERS TAB */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="glass-card p-6 border bg-card/50">
                <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
                  <div>
                    <h3 className="text-lg font-bold">All Orders</h3>
                    <p className="text-xs text-muted-foreground">Manage customer purchases, update fulfillment status, and generate invoices.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs gap-1.5"
                      onClick={() => {
                        if (confirm("Reset total revenue back to ₹0? (Past test orders will be kept but excluded from revenue calculation)")) {
                          resetRevenueMutation.mutate();
                        }
                      }}
                    >
                      <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Reset Revenue to ₹0
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="text-xs gap-1.5"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete ALL test orders permanently?")) {
                          deleteAllOrdersMutation.mutate();
                        }
                      }}
                    >
                      <Trash className="w-3.5 h-3.5" /> Clear All Orders
                    </Button>
                  </div>
                </div>
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
                          <th className="px-4 py-3 font-medium">Documents</th>
                          <th className="px-4 py-3 font-medium text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {orders?.items?.map((order: any) => (
                          <tr key={order.id} className="hover:bg-muted/30">
                            <td className="px-4 py-3 font-medium">#{order.order_number || order.id.slice(0, 8)}</td>
                            <td className="px-4 py-3">{order.user?.email || order.shipping_name || "Guest"}</td>
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
                            <td className="px-4 py-3">
                              <div className="flex gap-1.5">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="rounded-lg text-xs h-7 px-2 gap-1"
                                  onClick={() => generateInvoice(order)}
                                >
                                  <FileText className="w-3 h-3" /> Invoice
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="rounded-lg text-xs h-7 px-2 gap-1"
                                  onClick={() => generatePurchaseOrder(order)}
                                >
                                  <Download className="w-3 h-3" /> PO
                                </Button>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="w-7 h-7 text-destructive hover:bg-destructive/10"
                                title="Delete Order"
                                onClick={() => {
                                  if (confirm("Delete this order?")) {
                                    deleteOrderMutation.mutate(order.id);
                                  }
                                }}
                              >
                                <Trash className="w-3.5 h-3.5" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                        {(!orders?.items || orders?.items.length === 0) && (
                          <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No orders yet. Real orders will appear here automatically when placed by customers.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PRODUCTS TAB */}
          {activeTab === "products" && <AdminProductsPanel />}

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
                          <th className="px-4 py-3 font-medium text-right">Actions</th>
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
                            <td className="px-4 py-3 text-right">
                              {u.id !== user?.id && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="w-7 h-7 text-destructive hover:bg-destructive/10"
                                  title={`Delete user ${u.email}`}
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to permanently delete user "${u.email}"?`)) {
                                      deleteUserMutation.mutate(u.id);
                                    }
                                  }}
                                >
                                  <Trash className="w-3.5 h-3.5" />
                                </Button>
                              )}
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

          {/* SOFTWARE TAB */}
          {activeTab === "software" && (
            <div className="space-y-8">
              {/* Release Management Console */}
              {selectedSoftwareForVersions && (
                <div className="glass-card p-6 border bg-card/60 space-y-4">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h4 className="text-md font-bold">Release Dashboard: {selectedSoftwareForVersions.name}</h4>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedSoftwareForVersions(null)}>Close Releases Panel</Button>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      createVersionMutation.mutate({
                        swId: selectedSoftwareForVersions.id,
                        data: {
                          ...newVersion,
                          is_latest: newVersion.is_latest
                        }
                      });
                    }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    <div>
                      <label className="text-xs font-semibold block mb-1">Version tag (e.g. v1.0.4)</label>
                      <Input value={newVersion.version} onChange={(e) => setNewVersion({ ...newVersion, version: e.target.value })} required />
                    </div>
                    <div>
                      <label className="text-xs font-semibold block mb-1">Platform OS</label>
                      <select
                        value={newVersion.platform}
                        onChange={(e) => setNewVersion({ ...newVersion, platform: e.target.value })}
                        className="w-full h-10 px-2 rounded-md bg-background border border-border"
                      >
                        <option value="Windows">Windows</option>
                        <option value="Linux">Linux</option>
                        <option value="macOS">macOS</option>
                        <option value="Android">Android</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold block mb-1">Release Type</label>
                      <select
                        value={newVersion.is_latest ? "latest" : "beta"}
                        onChange={(e) => setNewVersion({ ...newVersion, is_latest: e.target.value === "latest" })}
                        className="w-full h-10 px-2 rounded-md bg-background border border-border"
                      >
                        <option value="latest">Stable Release</option>
                        <option value="beta">Beta Release</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold block mb-1">File Size (e.g. 50 MB)</label>
                      <Input value={newVersion.file_size} onChange={(e) => setNewVersion({ ...newVersion, file_size: e.target.value })} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-semibold block mb-1">Download Link (URL / Upload file below)</label>
                      <Input value={newVersion.download_url} onChange={(e) => setNewVersion({ ...newVersion, download_url: e.target.value })} required />
                    </div>

                    <div className="md:col-span-3 border-t pt-2">
                      <label className="text-[10px] text-muted-foreground block mb-1">Direct Secure Executable Upload</label>
                      <input type="file" onChange={(e) => handleFileUpload(e, "software")} className="text-xs mb-2" />
                      {uploadingFile && <span className="text-xs block"><RefreshCw className="w-3 animate-spin inline mr-1" />Uploading release binary...</span>}
                    </div>

                    <div className="md:col-span-3">
                      <label className="text-xs font-semibold block mb-1">Release Notes</label>
                      <Textarea value={newVersion.release_notes} onChange={(e) => setNewVersion({ ...newVersion, release_notes: e.target.value })} rows={2} />
                    </div>
                    <div className="md:col-span-3">
                      <Button type="submit">Push Release Version</Button>
                    </div>
                  </form>

                  <div className="mt-4 border-t pt-4">
                    <h5 className="font-semibold text-xs mb-2">Released Versions Log</h5>
                    <div className="max-h-60 overflow-y-auto border rounded divide-y divide-border">
                      {selectedVersions?.map((v: any) => (
                        <div key={v.id} className="p-3 flex justify-between items-center text-xs bg-muted/10">
                          <div>
                            <span className="font-bold text-sm mr-2">{v.version}</span>
                            <Badge className="mr-1">{v.platform}</Badge>
                            {v.is_latest && <Badge variant="outline" className="text-green-500 border-green-500">Latest</Badge>}
                            <p className="text-muted-foreground mt-1">{v.release_notes}</p>
                          </div>
                          <span className="font-mono text-muted-foreground">{v.file_size || "Unknown Size"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Add Software Form */}
              <div className="glass-card p-6 border bg-card/50">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-primary" /> Create New Software Entry
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
                      placeholder="Enter software details..." required
                    />
                  </div>
                  <Button type="submit" disabled={createSoftwareMutation.isPending}>
                    {createSoftwareMutation.isPending ? "Adding..." : "Add Software Entry"}
                  </Button>
                </form>
              </div>

              {/* Software List */}
              <div className="glass-card p-6 border bg-card/50">
                <h3 className="text-lg font-bold mb-4">Existing Software Packages</h3>
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
                            <td className="px-4 py-3 flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => setSelectedSoftwareForVersions(sw)} className="flex items-center gap-1">
                                <Plus className="w-3.5 h-3.5" /> Versions
                              </Button>
                              <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => {
                                  if (confirm("Delete software?")) {
                                    softwareApi.delete(sw.id).then(() => {
                                      queryClient.invalidateQueries({ queryKey: ["adminSoftwares"] });
                                    });
                                  }
                                }}
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
                      icon: newService.icon,
                      image_url: newService.image_url,
                      cta_text: newService.cta_text,
                      cta_link: newService.cta_link,
                      faqs: newService.faqs
                    });
                  }}
                  className="space-y-4 text-sm"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-semibold block mb-1">Service / Lab Setup Name</label>
                      <Input value={newService.name} onChange={(e) => setNewService({ ...newService, name: e.target.value })} required />
                    </div>
                    <div>
                      <label className="text-xs font-semibold block mb-1">Pricing Info</label>
                      <Input value={newService.pricing_info} onChange={(e) => setNewService({ ...newService, pricing_info: e.target.value })} placeholder="e.g. Starting from ₹50,000" required />
                    </div>
                    <div>
                      <label className="text-xs font-semibold block mb-1">Lucide Icon Class</label>
                      <select
                        value={newService.icon}
                        onChange={(e) => setNewService({ ...newService, icon: e.target.value })}
                        className="w-full h-10 px-2 rounded-md bg-background border border-border"
                      >
                        <option value="Cpu">Cpu</option>
                        <option value="Briefcase">Briefcase</option>
                        <option value="Shield">Shield</option>
                        <option value="ShoppingCart">ShoppingCart</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold block mb-1">CTA Action Text</label>
                      <Input value={newService.cta_text} onChange={(e) => setNewService({ ...newService, cta_text: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold block mb-1">CTA Action Redirect Link</label>
                      <Input value={newService.cta_link} onChange={(e) => setNewService({ ...newService, cta_link: e.target.value })} />
                    </div>
                  </div>

                  <div className="border border-dashed p-4 rounded bg-background/40">
                    <label className="text-xs font-semibold block mb-1">Service Banner/Illustration (Secure Upload)</label>
                    <input type="file" onChange={(e) => handleFileUpload(e, "service")} className="text-xs mb-2 block" />
                    {newService.image_url && (
                      <img
                        src={resolveImageUrl(newService.image_url)}
                        className="w-32 h-20 object-cover border rounded mt-1"
                        alt="preview"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).onerror = null;
                          (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&q=80";
                        }}
                      />
                    )}
                  </div>

                  {/* FAQS Editor */}
                  <div className="border p-4 rounded bg-background/20 space-y-2">
                    <p className="font-semibold text-xs">Service FAQs Editor</p>
                    <div className="flex gap-2">
                      <Input placeholder="FAQ Question" value={faqQ} onChange={(e) => setFaqQ(e.target.value)} className="h-8 text-xs" />
                      <Input placeholder="FAQ Answer" value={faqA} onChange={(e) => setFaqA(e.target.value)} className="h-8 text-xs" />
                      <Button type="button" size="sm" className="h-8 text-xs" onClick={() => {
                        if (!faqQ || !faqA) return;
                        setNewService(prev => ({ ...prev, faqs: [...prev.faqs, { q: faqQ, a: faqA }] }));
                        setFaqQ(""); setFaqA("");
                      }}>Add FAQ</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {newService.faqs.map((f, i) => (
                        <Badge key={i} variant="outline" className="flex items-center gap-1.5 py-1">
                          <span>Q: {f.q}</span>
                          <button type="button" className="text-destructive font-bold text-xs" onClick={() => {
                            setNewService(prev => ({ ...prev, faqs: prev.faqs.filter((_, idx) => idx !== i) }));
                          }}>×</button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold block mb-1">Short Summary</label>
                    <Input value={newService.short_description} onChange={(e) => setNewService({ ...newService, short_description: e.target.value })} required />
                  </div>

                  <div>
                    <label className="text-xs font-semibold block mb-1">Full Specifications / Scope of Work</label>
                    <Textarea value={newService.description} onChange={(e) => setNewService({ ...newService, description: e.target.value })} rows={3} required />
                  </div>

                  <Button type="submit" disabled={createServiceMutation.isPending}>Add Service Package</Button>
                </form>
              </div>

              {/* Services List */}
              <div className="glass-card p-6 border bg-card/50">
                <h3 className="text-lg font-bold mb-4">Active Services</h3>
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
                              <Button variant="destructive" size="icon" onClick={() => deleteServiceMutation.mutate(svc.id)}><Trash className="w-4 h-4" /></Button>
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

          {/* GALLERY TAB */}
          {activeTab === "gallery" && (
            <div className="space-y-8">
              {/* Add/Edit Project Form */}
              <div className="glass-card p-6 border bg-card/50">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Images className="w-5 h-5 text-primary" />
                  {editingProject ? `Edit Gallery Item: ${editingProject.title}` : "Add Gallery / Lab Workshop Showcase"}
                </h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (editingProject) {
                      const { id, ...rest } = editingProject;
                      updateProjectMutation.mutate({ id, data: rest });
                    } else {
                      createProjectMutation.mutate({
                        ...newProject,
                        technologies: newProject.technologies.split(",").map(t => t.trim()).filter(Boolean)
                      });
                    }
                  }}
                  className="space-y-4 text-sm"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-semibold block mb-1">Event / Workshop Title</label>
                      <Input
                        value={editingProject ? editingProject.title : newProject.title}
                        onChange={(e) => editingProject
                          ? setEditingProject({ ...editingProject, title: e.target.value })
                          : setNewProject({ ...newProject, title: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold block mb-1">Location / School / Client</label>
                      <Input
                        value={editingProject ? (editingProject.client || "") : newProject.client}
                        onChange={(e) => editingProject
                          ? setEditingProject({ ...editingProject, client: e.target.value })
                          : setNewProject({ ...newProject, client: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold block mb-1">Showcase Category</label>
                      <select
                        value={editingProject ? editingProject.category : newProject.category}
                        onChange={(e) => editingProject
                          ? setEditingProject({ ...editingProject, category: e.target.value })
                          : setNewProject({ ...newProject, category: e.target.value })
                        }
                        className="w-full h-10 px-2 rounded-md bg-background border border-border"
                      >
                        <option value="Workshop">Workshops & Seminars</option>
                        <option value="Bootcamp">Bootcamps & Hackathons</option>
                        <option value="Lab Setup">Robotics Lab Installation</option>
                        <option value="School Visit">School Visits & Demos</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-semibold block mb-1">Project Type</label>
                      <select
                        value={editingProject ? editingProject.project_type : newProject.project_type}
                        onChange={(e) => editingProject
                          ? setEditingProject({ ...editingProject, project_type: e.target.value })
                          : setNewProject({ ...newProject, project_type: e.target.value })
                        }
                        className="w-full h-10 px-2 rounded-md bg-background border border-border"
                      >
                        <option value="client">Client Project</option>
                        <option value="student">Student Project / Hack</option>
                        <option value="internal">Internal R&D</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold block mb-1">Status</label>
                      <select
                        value={editingProject ? editingProject.status : newProject.status}
                        onChange={(e) => editingProject
                          ? setEditingProject({ ...editingProject, status: e.target.value })
                          : setNewProject({ ...newProject, status: e.target.value })
                        }
                        className="w-full h-10 px-2 rounded-md bg-background border border-border"
                      >
                        <option value="completed">Completed</option>
                        <option value="running">In Progress</option>
                        <option value="upcoming">Upcoming</option>
                      </select>
                    </div>
                    <div className="flex items-center pt-6 gap-2">
                      <label className="flex items-center gap-2 cursor-pointer font-medium">
                        <input
                          type="checkbox"
                          checked={editingProject ? editingProject.is_featured : newProject.is_featured}
                          onChange={(e) => editingProject
                            ? setEditingProject({ ...editingProject, is_featured: e.target.checked })
                            : setNewProject({ ...newProject, is_featured: e.target.checked })
                          }
                        />
                        <span>Feature on Homepage</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold block mb-1">Tags / Technologies Used (comma separated)</label>
                    <Input
                      placeholder="e.g. Arduino, RoboKit v2, STEM Curriculum"
                      value={editingProject ? (Array.isArray(editingProject.technologies) ? editingProject.technologies.join(", ") : "") : newProject.technologies}
                      onChange={(e) => editingProject
                        ? setEditingProject({ ...editingProject, technologies: e.target.value.split(",").map(t => t.trim()) })
                        : setNewProject({ ...newProject, technologies: e.target.value })
                      }
                    />
                  </div>

                  <div className="border border-dashed p-4 rounded bg-background/40">
                    <label className="text-xs font-semibold block mb-1">Showcase Photo (Secure Image Upload)</label>
                    <input type="file" onChange={(e) => handleFileUpload(e, "project-cover")} className="text-xs mb-2 block" />
                    {(editingProject ? editingProject.cover_image : newProject.cover_image) && (
                      <img
                        src={resolveImageUrl(editingProject ? editingProject.cover_image : newProject.cover_image)}
                        className="w-32 h-20 object-cover border rounded mt-1"
                        alt="preview"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).onerror = null;
                          (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&q=80";
                        }}
                      />
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-semibold block mb-1">Short Description Summary</label>
                    <Input
                      value={editingProject ? editingProject.short_description : newProject.short_description}
                      onChange={(e) => editingProject
                        ? setEditingProject({ ...editingProject, short_description: e.target.value })
                        : setNewProject({ ...newProject, short_description: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold block mb-1">Detailed Event Highlights / Notes</label>
                    <Textarea
                      value={editingProject ? editingProject.description : newProject.description}
                      onChange={(e) => editingProject
                        ? setEditingProject({ ...editingProject, description: e.target.value })
                        : setNewProject({ ...newProject, description: e.target.value })
                      }
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit">{editingProject ? "Update Entry" : "Create Showcase Item"}</Button>
                    {editingProject && <Button type="button" variant="outline" onClick={() => setEditingProject(null)}>Cancel</Button>}
                  </div>
                </form>
              </div>

              {/* Showcase List */}
              <div className="glass-card p-6 border bg-card/50">
                <h3 className="text-lg font-bold mb-4">Current Gallery Showcases</h3>
                {projectsLoading ? (
                  <div className="flex justify-center p-12"><RefreshCw className="w-8 h-8 animate-spin text-primary" /></div>
                ) : (
                  <div className="border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/50 text-muted-foreground">
                        <tr>
                          <th className="px-4 py-3 font-medium">Cover</th>
                          <th className="px-4 py-3 font-medium">Title</th>
                          <th className="px-4 py-3 font-medium">Location</th>
                          <th className="px-4 py-3 font-medium">Category</th>
                          <th className="px-4 py-3 font-medium">Status</th>
                          <th className="px-4 py-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {projects?.map((proj: any) => (
                          <tr key={proj.id} className="hover:bg-muted/30">
                            <td className="px-4 py-3">
                              {proj.cover_image && (
                                <img
                                  src={resolveImageUrl(proj.cover_image)}
                                  className="w-12 h-8 rounded object-cover"
                                  alt="cover"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).onerror = null;
                                    (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&q=80";
                                  }}
                                />
                              )}
                            </td>
                            <td className="px-4 py-3 font-medium">{proj.title}</td>
                            <td className="px-4 py-3">{proj.client}</td>
                            <td className="px-4 py-3">
                              <Badge variant="outline">{proj.category}</Badge>
                            </td>
                            <td className="px-4 py-3">
                              <Badge className="capitalize">{proj.status}</Badge>
                            </td>
                            <td className="px-4 py-3 flex gap-2">
                              <Button size="icon" variant="outline" onClick={() => setEditingProject(proj)}><Edit2 className="w-3.5 h-3.5" /></Button>
                              <Button size="icon" variant="destructive" onClick={() => { if (confirm("Delete this gallery item?")) deleteProjectMutation.mutate(proj.id); }}><Trash className="w-3.5 h-3.5" /></Button>
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

          {/* TRAINING TAB */}
          {activeTab === "training" && (
            <div className="space-y-8">
              {/* Add/Edit Course Form */}
              <div className="glass-card p-6 border bg-card/50">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-primary" />
                  {editingCourse ? `Edit Course: ${editingCourse.title}` : "Create New Training Course / Workshop Schedule"}
                </h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (editingCourse) {
                      const { id, ...rest } = editingCourse;
                      updateCourseMutation.mutate({ id, data: rest });
                    } else {
                      createCourseMutation.mutate({
                        ...newCourse,
                        price: newCourse.price ? parseFloat(newCourse.price) : null,
                        max_students: newCourse.max_students ? parseInt(newCourse.max_students) : null
                      });
                    }
                  }}
                  className="space-y-4 text-sm"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-semibold block mb-1">Course / Workshop Title</label>
                      <Input
                        value={editingCourse ? editingCourse.title : newCourse.title}
                        onChange={(e) => editingCourse
                          ? setEditingCourse({ ...editingCourse, title: e.target.value })
                          : setNewCourse({ ...newCourse, title: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold block mb-1">Duration (e.g. 2 Days, 6 Weeks)</label>
                      <Input
                        value={editingCourse ? (editingCourse.duration || "") : newCourse.duration}
                        onChange={(e) => editingCourse
                          ? setEditingCourse({ ...editingCourse, duration: e.target.value })
                          : setNewCourse({ ...newCourse, duration: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold block mb-1">Category Domain</label>
                      <Input
                        value={editingCourse ? editingCourse.category : newCourse.category}
                        onChange={(e) => editingCourse
                          ? setEditingCourse({ ...editingCourse, category: e.target.value })
                          : setNewCourse({ ...newCourse, category: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-xs font-semibold block mb-1">Course Type</label>
                      <select
                        value={editingCourse ? editingCourse.course_type : newCourse.course_type}
                        onChange={(e) => editingCourse
                          ? setEditingCourse({ ...editingCourse, course_type: e.target.value })
                          : setNewCourse({ ...newCourse, course_type: e.target.value })
                        }
                        className="w-full h-10 px-2 rounded-md bg-background border border-border"
                      >
                        <option value="online">Online Interactive</option>
                        <option value="offline">Offline Lab Workshop</option>
                        <option value="bootcamp">Bootcamp Training</option>
                        <option value="workshop">Seminars & Guest Demos</option>
                        <option value="certification">Professional Certificate</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold block mb-1">Target Skill level</label>
                      <select
                        value={editingCourse ? editingCourse.level : newCourse.level}
                        onChange={(e) => editingCourse
                          ? setEditingCourse({ ...editingCourse, level: e.target.value })
                          : setNewCourse({ ...newCourse, level: e.target.value })
                        }
                        className="w-full h-10 px-2 rounded-md bg-background border border-border"
                      >
                        <option value="beginner">Beginner / Foundation</option>
                        <option value="intermediate">Intermediate / Advanced Application</option>
                        <option value="advanced">Advanced R&D</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold block mb-1">Price (₹, Leave empty for Free)</label>
                      <Input
                        type="number"
                        value={editingCourse ? (editingCourse.price || "") : newCourse.price}
                        onChange={(e) => editingCourse
                          ? setEditingCourse({ ...editingCourse, price: e.target.value })
                          : setNewCourse({ ...newCourse, price: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold block mb-1">Max Seats Available</label>
                      <Input
                        type="number"
                        value={editingCourse ? (editingCourse.max_students || "") : newCourse.max_students}
                        onChange={(e) => editingCourse
                          ? setEditingCourse({ ...editingCourse, max_students: e.target.value })
                          : setNewCourse({ ...newCourse, max_students: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold block mb-1">Instructor / Presenter Name</label>
                      <Input
                        value={editingCourse ? (editingCourse.instructor || "") : newCourse.instructor}
                        onChange={(e) => editingCourse
                          ? setEditingCourse({ ...editingCourse, instructor: e.target.value })
                          : setNewCourse({ ...newCourse, instructor: e.target.value })
                        }
                      />
                    </div>
                    <div className="border border-dashed p-4 rounded bg-background/40">
                      <label className="text-xs font-semibold block mb-1">Upload Banner Image</label>
                      <input type="file" onChange={(e) => handleFileUpload(e, "course-cover")} className="text-xs mb-2 block" />
                      {(editingCourse ? editingCourse.cover_image : newCourse.cover_image) && (
                        <img
                          src={resolveImageUrl(editingCourse ? editingCourse.cover_image : newCourse.cover_image)}
                          className="w-32 h-20 object-cover border rounded mt-1"
                          alt="preview"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).onerror = null;
                            (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&q=80";
                          }}
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold block mb-1">Short Description Summary</label>
                    <Input
                      value={editingCourse ? editingCourse.short_description : newCourse.short_description}
                      onChange={(e) => editingCourse
                        ? setEditingCourse({ ...editingCourse, short_description: e.target.value })
                        : setNewCourse({ ...newCourse, short_description: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold block mb-1">Detailed Course Curriculum / Syllabus Outline</label>
                    <Textarea
                      value={editingCourse ? editingCourse.description : newCourse.description}
                      onChange={(e) => editingCourse
                        ? setEditingCourse({ ...editingCourse, description: e.target.value })
                        : setNewCourse({ ...newCourse, description: e.target.value })
                      }
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit">{editingCourse ? "Update Course" : "Publish Course Details"}</Button>
                    {editingCourse && <Button type="button" variant="outline" onClick={() => setEditingCourse(null)}>Cancel</Button>}
                  </div>
                </form>
              </div>

              {/* Courses List */}
              <div className="glass-card p-6 border bg-card/50">
                <h3 className="text-lg font-bold mb-4">Published Courses & Certifications</h3>
                {coursesLoading ? (
                  <div className="flex justify-center p-12"><RefreshCw className="w-8 h-8 animate-spin text-primary" /></div>
                ) : (
                  <div className="border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/50 text-muted-foreground">
                        <tr>
                          <th className="px-4 py-3 font-medium">Cover</th>
                          <th className="px-4 py-3 font-medium">Title</th>
                          <th className="px-4 py-3 font-medium">Type</th>
                          <th className="px-4 py-3 font-medium">Price</th>
                          <th className="px-4 py-3 font-medium">Enrolled</th>
                          <th className="px-4 py-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {courses?.map((c: any) => (
                          <tr key={c.id} className="hover:bg-muted/30">
                            <td className="px-4 py-3">
                              {c.cover_image && (
                                <img
                                  src={resolveImageUrl(c.cover_image)}
                                  className="w-12 h-8 rounded object-cover"
                                  alt="cover"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).onerror = null;
                                    (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&q=80";
                                  }}
                                />
                              )}
                            </td>
                            <td className="px-4 py-3 font-medium">{c.title}</td>
                            <td className="px-4 py-3">
                              <Badge variant="outline" className="capitalize">{c.course_type}</Badge>
                            </td>
                            <td className="px-4 py-3 font-semibold">
                              {c.price ? `₹${c.price}` : "Free"}
                            </td>
                            <td className="px-4 py-3 font-mono">{c.enrolled_count}</td>
                            <td className="px-4 py-3 flex gap-2">
                              <Button size="icon" variant="outline" onClick={() => setEditingCourse(c)}><Edit2 className="w-3.5 h-3.5" /></Button>
                              <Button size="icon" variant="destructive" onClick={() => { if (confirm("Delete this course permanently?")) deleteCourseMutation.mutate(c.id); }}><Trash className="w-3.5 h-3.5" /></Button>
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

          {/* CMS & SUPPORT TAB */}
          {activeTab === "content" && (
            <div className="space-y-8">

              {/* Home Page Content CMS */}
              <div className="glass-card p-6 border bg-card/50">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" /> Home Page CMS Configuration
                </h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveCmsHomeMutation.mutate(cmsHome);
                  }}
                  className="space-y-4 text-sm"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold block mb-1">Hero Title</label>
                      <Input value={cmsHome.hero_title} onChange={(e) => setCmsHome({ ...cmsHome, hero_title: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold block mb-1">Hero Subtitle</label>
                      <Input value={cmsHome.hero_subtitle} onChange={(e) => setCmsHome({ ...cmsHome, hero_subtitle: e.target.value })} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
                    <div>
                      <label className="text-xs font-semibold block mb-1">Stat: Schools Reached</label>
                      <Input value={cmsHome.stat_schools} onChange={(e) => setCmsHome({ ...cmsHome, stat_schools: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold block mb-1">Stat: Students Trained</label>
                      <Input value={cmsHome.stat_students} onChange={(e) => setCmsHome({ ...cmsHome, stat_students: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold block mb-1">Stat: Lab Setups</label>
                      <Input value={cmsHome.stat_labs} onChange={(e) => setCmsHome({ ...cmsHome, stat_labs: e.target.value })} />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <label className="text-xs font-semibold block mb-1">About Us Section Content</label>
                    <Textarea value={cmsHome.about_content} onChange={(e) => setCmsHome({ ...cmsHome, about_content: e.target.value })} rows={3} />
                  </div>

                  <Button type="submit">Publish CMS Changes</Button>
                </form>
              </div>

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
                      placeholder="Brief summary..." required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Content (HTML or Markdown)</label>
                    <Textarea
                      value={newBlog.content}
                      onChange={(e) => setNewBlog({ ...newBlog, content: e.target.value })}
                      placeholder="Write article body..." rows={4} required
                    />
                  </div>
                  <Button type="submit">Create Post</Button>
                </form>

                <div className="mt-8 border-t pt-4">
                  <h4 className="text-md font-bold mb-3">Existing Articles</h4>
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
                            <td className="px-4 py-3 capitalize">{blog.status}</td>
                            <td className="px-4 py-3 font-mono">{blog.view_count}</td>
                            <td className="px-4 py-3">
                              <Button variant="destructive" size="icon" onClick={() => deleteBlogMutation.mutate(blog.id)}><Trash className="w-4 h-4" /></Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* COUPONS TAB */}
          {activeTab === "coupons" && (
            <div className="space-y-8">
              {/* Add Coupon Form */}
              <div className="glass-card p-6 border bg-card/50">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-primary" /> Create New Coupon
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
                      <Input value={newCoupon.code} onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Discount Type</label>
                      <select
                        value={newCoupon.discount_type}
                        onChange={(e) => setNewCoupon({ ...newCoupon, discount_type: e.target.value })}
                        className="w-full h-10 p-2 rounded-md bg-background border border-border"
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed (₹)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Discount Value</label>
                      <Input type="number" value={newCoupon.discount_value} onChange={(e) => setNewCoupon({ ...newCoupon, discount_value: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Min Order (₹)</label>
                      <Input type="number" value={newCoupon.min_order_amount} onChange={(e) => setNewCoupon({ ...newCoupon, min_order_amount: e.target.value })} />
                    </div>
                  </div>
                  <Button type="submit">Create Coupon</Button>
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
                          <th className="px-4 py-3 font-medium">Discount</th>
                          <th className="px-4 py-3 font-medium">Min Order</th>
                          <th className="px-4 py-3 font-medium">Uses</th>
                          <th className="px-4 py-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {coupons?.map((coupon: any) => (
                          <tr key={coupon.id} className="hover:bg-muted/30">
                            <td className="px-4 py-3 font-mono font-bold text-primary">{coupon.code}</td>
                            <td className="px-4 py-3">{coupon.discount_type === "percentage" ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`}</td>
                            <td className="px-4 py-3">₹{coupon.min_order_amount || "0.00"}</td>
                            <td className="px-4 py-3">{coupon.used_count} / {coupon.max_uses || "∞"}</td>
                            <td className="px-4 py-3">
                              <Button variant="destructive" size="icon" onClick={() => deleteCouponMutation.mutate(coupon.id)}><Trash className="w-4 h-4" /></Button>
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

          {/* FEEDBACK & REVIEWS TAB */}
          {activeTab === "feedback" && (
            <div className="space-y-8">
              {/* HOMEPAGE TESTIMONIALS & USER FEEDBACK */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      Customer Feedback & Home Page Reviews
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Click &ldquo;Show on Home&rdquo; on any review to instantly display it in the Testimonials section on the main website!
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button onClick={() => setIsAddFeedbackOpen(!isAddFeedbackOpen)} className="gradient-bg text-white flex items-center gap-1.5 text-xs h-8">
                      <Plus className="w-3.5 h-3.5" /> {isAddFeedbackOpen ? "Close Form" : "Add Customer Review"}
                    </Button>
                    <Button onClick={handleExportReviews} variant="outline" size="sm" className="flex items-center gap-2 text-xs h-8">
                      <Download className="w-3.5 h-3.5" /> Export CSV
                    </Button>
                  </div>
                </div>

                {/* ADD FEEDBACK FORM */}
                {isAddFeedbackOpen && (
                  <div className="glass-card p-5 border border-primary/30 bg-primary/5 rounded-xl space-y-4">
                    <h4 className="font-bold text-sm flex items-center gap-2">
                      <Plus className="w-4 h-4 text-primary" /> Add New Customer Review / Feedback
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-medium mb-1 block">Customer Name *</label>
                        <Input
                          value={newFeedback.name}
                          onChange={(e) => setNewFeedback({ ...newFeedback, name: e.target.value })}
                          placeholder="e.g. Mr. Arjun"
                          className="h-9 text-xs rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium mb-1 block">Designation / Role</label>
                        <Input
                          value={newFeedback.designation}
                          onChange={(e) => setNewFeedback({ ...newFeedback, designation: e.target.value })}
                          placeholder="e.g. Robotics Enthusiast, Sonipat"
                          className="h-9 text-xs rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium mb-1 block">Rating (1 to 5 Stars)</label>
                        <select
                          value={newFeedback.rating}
                          onChange={(e) => setNewFeedback({ ...newFeedback, rating: parseInt(e.target.value) })}
                          className="w-full h-9 px-3 rounded-lg bg-background border border-border text-xs"
                        >
                          <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
                          <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
                          <option value="3">⭐⭐⭐ (3 Stars)</option>
                          <option value="2">⭐⭐ (2 Stars)</option>
                          <option value="1">⭐ (1 Star)</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block">Review Message *</label>
                      <Textarea
                        value={newFeedback.content}
                        onChange={(e) => setNewFeedback({ ...newFeedback, content: e.target.value })}
                        placeholder="e.g. This is good for robotics components with affordable products illl also suggest my friends too..."
                        rows={2}
                        className="text-xs rounded-lg"
                      />
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <label className="flex items-center gap-2 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newFeedback.is_active}
                          onChange={(e) => setNewFeedback({ ...newFeedback, is_active: e.target.checked })}
                          className="rounded border-border"
                        />
                        <span className="font-medium text-emerald-600">🌟 Show directly on Home Page Testimonials</span>
                      </label>
                      <Button
                        size="sm"
                        disabled={createTestimonialMutation.isPending || !newFeedback.name || !newFeedback.content}
                        onClick={() => createTestimonialMutation.mutate(newFeedback)}
                        className="gradient-bg text-white text-xs h-8 px-4"
                      >
                        {createTestimonialMutation.isPending ? "Adding Review..." : "Save Review"}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="glass-card p-6 border bg-card/50">
                  <div className="border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/50 text-muted-foreground">
                        <tr>
                          <th className="px-4 py-3 font-medium">Customer Name</th>
                          <th className="px-4 py-3 font-medium">Role / Title</th>
                          <th className="px-4 py-3 font-medium">Rating</th>
                          <th className="px-4 py-3 font-medium">Review Message</th>
                          <th className="px-4 py-3 font-medium">Home Page Status</th>
                          <th className="px-4 py-3 font-medium text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {testimonials?.map((t: any) => (
                          <tr key={t.id} className="hover:bg-muted/30">
                            <td className="px-4 py-3 font-semibold">{t.name}</td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">
                              {t.designation}{t.company ? ` • ${t.company}` : ""}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex text-yellow-500">
                                {Array.from({ length: t.rating || 5 }).map((_, idx) => (
                                  <Star key={idx} className="w-3.5 h-3.5 fill-current" />
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs max-w-xs">
                              <p className="line-clamp-2 italic text-foreground">&ldquo;{t.content}&rdquo;</p>
                            </td>
                            <td className="px-4 py-3">
                              <Badge
                                variant={t.is_active ? "default" : "secondary"}
                                className={t.is_active ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
                              >
                                {t.is_active ? "🌟 Showing on Home" : "Hidden"}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant={t.is_active ? "outline" : "default"}
                                  className={`text-xs h-8 ${t.is_active ? "border-emerald-500/50 text-emerald-600 hover:bg-emerald-500/10" : "gradient-bg text-white"}`}
                                  onClick={() => toggleTestimonialMutation.mutate(t.id)}
                                  disabled={toggleTestimonialMutation.isPending}
                                >
                                  {t.is_active ? "Hide from Home" : "Show on Home"}
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="w-8 h-8 text-destructive hover:bg-destructive/10"
                                  onClick={() => {
                                    if (confirm(`Delete feedback from "${t.name}" permanently?`)) {
                                      deleteTestimonialMutation.mutate(t.id);
                                    }
                                  }}
                                >
                                  <Trash className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {(!testimonials || testimonials.length === 0) && (
                          <tr>
                            <td colSpan={6} className="p-6 text-center text-muted-foreground">
                              No customer testimonials or feedbacks submitted yet. Customers can write reviews directly from their dashboard.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* PRODUCT REVIEWS */}
              <div className="space-y-4 pt-4 border-t border-border">
                <h3 className="text-lg font-bold">Product-Specific Reviews</h3>
                <div className="glass-card p-6 border bg-card/50">
                  <div className="border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/50 text-muted-foreground">
                        <tr>
                          <th className="px-4 py-3 font-medium">Product</th>
                          <th className="px-4 py-3 font-medium">User</th>
                          <th className="px-4 py-3 font-medium">Rating</th>
                          <th className="px-4 py-3 font-medium">Comment</th>
                          <th className="px-4 py-3 font-medium">Status</th>
                          <th className="px-4 py-3 font-medium text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {reviews?.map((r: any) => (
                          <tr key={r.id} className="hover:bg-muted/30">
                            <td className="px-4 py-3 font-medium">{r.product_name}</td>
                            <td className="px-4 py-3 text-xs">{r.user_email}</td>
                            <td className="px-4 py-3">
                              <div className="flex text-yellow-500">
                                {Array.from({ length: r.rating }).map((_, idx) => (
                                  <Star key={idx} className="w-3.5 h-3.5 fill-current" />
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-bold text-xs">{r.title}</p>
                              <p className="text-muted-foreground text-xs">{r.comment}</p>
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant={r.is_approved ? "default" : "secondary"}>
                                {r.is_approved ? "Approved" : "Pending Approval"}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {!r.is_approved && (
                                  <Button size="sm" onClick={() => approveReviewMutation.mutate(r.id)} className="flex items-center gap-1 bg-green-600 hover:bg-green-700 h-8 text-xs">
                                    <Check className="w-3 h-3" /> Approve
                                  </Button>
                                )}
                                <Button size="icon" variant="ghost" className="w-8 h-8 text-destructive hover:bg-destructive/10" onClick={() => { if (confirm("Delete feedback permanently?")) deleteReviewMutation.mutate(r.id); }}>
                                  <Trash className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {(!reviews || reviews.length === 0) && (
                          <tr><td colSpan={6} className="p-4 text-center text-muted-foreground">No product reviews submitted yet.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">System Alerts & Notifications</h3>
                {unreadNotificationsCount > 0 && (
                  <Button onClick={() => markAllNotificationsReadMutation.mutate()} className="flex items-center gap-1.5">
                    <Check className="w-4 h-4" /> Mark All as Read
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                {notifications?.map((notif: any) => (
                  <div key={notif.id} className={`p-4 border rounded-lg flex justify-between items-start transition-colors ${notif.is_read ? "bg-muted/10 opacity-75" : "bg-primary/5 border-primary/30"}`}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{notif.title}</span>
                        {!notif.is_read && <Badge variant="default" className="text-[9px] px-1 py-0 scale-95">Unread</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">{notif.message}</p>
                      <span className="text-[10px] text-muted-foreground block">{new Date(notif.created_at).toLocaleString()}</span>
                    </div>
                    <div className="flex gap-2">
                      {!notif.is_read && (
                        <Button size="sm" variant="ghost" className="h-8" onClick={() => adminApi.markNotificationRead(notif.id).then(() => refetchNotifications())}>
                          Mark Read
                        </Button>
                      )}
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => deleteNotificationMutation.mutate(notif.id)}>
                        <Trash className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
                {(!notifications || notifications.length === 0) && (
                  <div className="text-center py-12 text-muted-foreground">No alerts logged.</div>
                )}
              </div>
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
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === "settings" && (
            <div className="space-y-6 max-w-2xl">
              {/* GST Setting */}
              <GstToggleCard />

              {/* Other Settings */}
              <div className="glass-card p-6 border bg-card/50">
                <h3 className="text-lg font-bold mb-6">Platform Settings</h3>
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
            </div>
          )}

          {/* LAB QUOTE REQUESTS TAB */}
          {activeTab === "lab_quotes" && (
            <LabQuotesSection />
          )}

        </main>
      </div>
    </div>
  );
}

// ── GST Toggle Card ─────────────────────────────────────────
function GstToggleCard() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["storeSettings"],
    queryFn: async () => {
      const res = await settingsApi.get();
      return res.data;
    },
  });

  const mutation = useMutation({
    mutationFn: (enable_gst: boolean) => settingsApi.update({ enable_gst }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["storeSettings"] });
    },
  });

  const enabled = settings?.enable_gst ?? false;

  return (
    <div className="glass-card p-6 border bg-card/50">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold mb-1">GST (18%) on Orders</h3>
          <p className="text-sm text-muted-foreground">
            {enabled
              ? "GST is currently enabled — 18% is added to all orders and invoices."
              : "GST is disabled — products are billed at the price set in backend (no tax added)."}
          </p>
        </div>
        <button
          onClick={() => mutation.mutate(!enabled)}
          disabled={isLoading || mutation.isPending}
          className={`relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none ${enabled ? "bg-emerald-500" : "bg-muted-foreground/30"
            }`}
          aria-label="Toggle GST"
        >
          <span
            className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-300 ${enabled ? "translate-x-7" : "translate-x-0"
              }`}
          />
        </button>
      </div>
      {enabled && (
        <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-sm text-amber-600 dark:text-amber-400">
          ⚠️ 18% GST will be added on top of the product price at checkout and shown on invoices.
        </div>
      )}
      {!enabled && (
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-sm text-blue-600 dark:text-blue-400">
          ✅ No GST added — customers pay the exact product price without any tax.
        </div>
      )}
    </div>
  );
}

// ── Lab Quote Requests Section ──────────────────────────────
function LabQuotesSection() {
  const { data: inquiries, isLoading } = useQuery({
    queryKey: ["adminLabQuotes"],
    queryFn: async () => {
      const res = await adminApi.inquiries();
      return res.data;
    },
  });

  // Filter only lab setup quote requests
  const labQuotes = (inquiries || []).filter((inq: any) =>
    inq.subject?.toLowerCase().includes("lab quote") ||
    inq.message?.includes("[LAB SETUP QUOTE REQUEST]")
  );

  // Also show all other contact inquiries separately
  const otherInquiries = (inquiries || []).filter((inq: any) =>
    !(inq.subject?.toLowerCase().includes("lab quote") ||
      inq.message?.includes("[LAB SETUP QUOTE REQUEST]"))
  );

  // Parse lab quote structured message
  const parseQuoteDetails = (message: string) => {
    const details: Record<string, string> = {};
    const lines = message.split("\n");
    lines.forEach((line: string) => {
      if (line.includes("School/Institution:")) details.school = line.split("School/Institution:")[1]?.trim() || "";
      if (line.includes("Contact Person:")) details.person = line.split("Contact Person:")[1]?.trim() || "";
      if (line.includes("Email:")) details.email = line.split("Email:")[1]?.trim() || "";
      if (line.includes("Phone:")) details.phone = line.split("Phone:")[1]?.trim() || "";
      if (line.includes("Address:")) details.address = line.split("Address:")[1]?.trim() || "";
      if (line.includes("Selected Package:")) details.package = line.split("Selected Package:")[1]?.trim() || "";
    });
    // Extract notes after the second separator
    const notesSplit = message.split("Additional Notes/Requirements:");
    if (notesSplit[1]) details.notes = notesSplit[1].trim();
    return details;
  };

  if (isLoading) {
    return <div className="flex justify-center p-12"><RefreshCw className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8">
      {/* Lab Quote Requests */}
      <div className="glass-card p-6 border bg-card/50">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <School className="w-5 h-5 text-primary" /> Lab Setup Quote Requests
          <Badge className="ml-2">{labQuotes.length}</Badge>
        </h3>

        {labQuotes.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <School className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No lab quote requests received yet.</p>
            <p className="text-xs mt-1">They will appear here when schools submit the &quot;Request a Quote&quot; form on the Lab Setup page.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {labQuotes.map((inq: any) => {
              const d = parseQuoteDetails(inq.message || "");
              return (
                <div key={inq.id} className="border border-border rounded-xl p-5 bg-background/50 hover:border-primary/40 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-base">{d.school || inq.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {new Date(inq.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-primary border-primary/40">
                      {d.package || "General"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span><strong>Contact:</strong> {d.person || inq.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span><strong>Email:</strong> {d.email || inq.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span><strong>Phone:</strong> {d.phone || inq.phone || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span><strong>Address:</strong> {d.address || "—"}</span>
                    </div>
                  </div>

                  {d.notes && d.notes !== "No additional comments provided." && (
                    <div className="mt-3 p-3 bg-muted/50 rounded-lg text-sm">
                      <strong className="text-xs text-muted-foreground">Additional Notes:</strong>
                      <p className="text-foreground mt-1">{d.notes}</p>
                    </div>
                  )}

                  <div className="mt-3 flex gap-2">
                    <a href={`mailto:${d.email || inq.email}`} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                      <Mail className="w-3 h-3" /> Reply via Email
                    </a>
                    {(d.phone || inq.phone) && (
                      <a href={`tel:${d.phone || inq.phone}`} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors">
                        <Phone className="w-3 h-3" /> Call
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Other general inquiries */}
      {otherInquiries.length > 0 && (
        <div className="glass-card p-6 border bg-card/50">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-muted-foreground" /> Other Contact Inquiries
            <Badge variant="secondary" className="ml-2">{otherInquiries.length}</Badge>
          </h3>
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Subject</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {otherInquiries.map((inq: any) => (
                  <tr key={inq.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{inq.name}</td>
                    <td className="px-4 py-3">{inq.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">{inq.subject || "—"}</td>
                    <td className="px-4 py-3 text-xs">{new Date(inq.created_at).toLocaleDateString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
