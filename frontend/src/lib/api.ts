import axios from "axios";
import { useAuthStore } from "@/store/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// Request interceptor - attach JWT
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const { token } = useAuthStore.getState();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (refreshToken) {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });
          const { access_token, refresh_token } = res.data;
          localStorage.setItem("access_token", access_token);
          localStorage.setItem("refresh_token", refresh_token);
          useAuthStore.setState({ token: access_token });
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch {
        useAuthStore.getState().logout();
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: (data: Record<string, string>) => api.post("/auth/register", data),
  login: (data: { email: string; password: string }) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
  updateMe: (data: Record<string, string>) => api.patch("/auth/me", data),
  changePassword: (data: { current_password: string; new_password: string }) =>
    api.post("/auth/change-password", data),
};

// Products API
export const productsApi = {
  list: (params?: Record<string, string | number | boolean>) =>
    api.get("/products", { params }),
  featured: (limit = 8) => api.get("/products/featured", { params: { limit } }),
  getBySlug: (slug: string) => api.get(`/products/${slug}`),
  create: (data: Record<string, unknown>) => api.post("/products", data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
};

// Blog API
export const blogApi = {
  list: (params?: Record<string, string | number>) => api.get("/blog", { params }),
  getBySlug: (slug: string) => api.get(`/blog/${slug}`),
  categories: () => api.get("/blog/categories"),
  create: (data: Record<string, unknown>) => api.post("/blog", data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/blog/${id}`, data),
  delete: (id: string) => api.delete(`/blog/${id}`),
};

// Software API
export const softwareApi = {
  list: () => api.get("/software"),
  getBySlug: (slug: string) => api.get(`/software/${slug}`),
  versions: (id: string) => api.get(`/software/${id}/versions`),
  create: (data: Record<string, unknown>) => api.post("/software", data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/software/${id}`, data),
  delete: (id: string) => api.delete(`/software/${id}`),
};

// Services API
export const servicesApi = {
  list: () => api.get("/services"),
  getBySlug: (slug: string) => api.get(`/services/${slug}`),
  bookConsultation: (data: Record<string, unknown>) => api.post("/services/consultation", data),
  create: (data: Record<string, unknown>) => api.post("/services", data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/services/${id}`, data),
  delete: (id: string) => api.delete(`/services/${id}`),
};

// Projects API
export const projectsApi = {
  list: (params?: Record<string, string>) => api.get("/projects", { params }),
  getBySlug: (slug: string) => api.get(`/projects/${slug}`),
  create: (data: Record<string, unknown>) => api.post("/projects", data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
};

// Training API
export const trainingApi = {
  list: (params?: Record<string, string>) => api.get("/training", { params }),
  getBySlug: (slug: string) => api.get(`/training/${slug}`),
  enroll: (courseId: string) => api.post(`/training/${courseId}/enroll`),
};

// CMS API
export const cmsApi = {
  getPage: (pageKey: string) => api.get(`/cms/pages/${pageKey}`),
  getSettings: () => api.get("/cms/settings"),
};

// Public API
export const publicApi = {
  testimonials: () => api.get("/testimonials"),
  faqs: (category?: string) => api.get("/faqs", { params: category ? { category } : {} }),
  newsletter: (email: string) => api.post("/newsletter", { email }),
  contact: (data: Record<string, string>) => api.post("/contact", data),
};

// Careers API
export const careersApi = {
  list: () => api.get("/careers"),
  getBySlug: (slug: string) => api.get(`/careers/${slug}`),
  apply: (careerId: string, data: FormData) => api.post(`/careers/${careerId}/apply`, data),
};

// Support API
export const supportApi = {
  listTickets: () => api.get("/support/tickets"),
  createTicket: (data: Record<string, string>) => api.post("/support/tickets", data),
  addMessage: (ticketId: string, message: string) =>
    api.post(`/support/tickets/${ticketId}/messages`, { message }),
};

// Admin API
export const adminApi = {
  dashboard: () => api.get("/admin/dashboard"),
  users: (params?: Record<string, string | number>) => api.get("/admin/users", { params }),
  updateUser: (id: string, data: Record<string, unknown>) => api.patch(`/admin/users/${id}`, data),
  orders: (params?: Record<string, string | number>) => api.get("/admin/orders", { params }),
  updateOrderStatus: (id: string, status: string) =>
    api.patch(`/admin/orders/${id}/status?status=${status}`),
  inquiries: () => api.get("/admin/inquiries"),
  tickets: (status?: string) => api.get("/admin/tickets", { params: status ? { status } : {} }),
  subscribers: () => api.get("/admin/subscribers"),
  logs: (params?: Record<string, string | number>) => api.get("/admin/logs", { params }),
  coupons: () => api.get("/admin/coupons"),
  createCoupon: (data: Record<string, unknown>) => api.post("/admin/coupons", data),
  updateCoupon: (id: string, data: Record<string, unknown>) => api.put(`/admin/coupons/${id}`, data),
  deleteCoupon: (id: string) => api.delete(`/admin/coupons/${id}`),
};

// Cart API
export const cartApi = {
  get: () => api.get("/cart"),
  addItem: (data: { product_id: string; quantity?: number; variant_id?: string }) =>
    api.post("/cart/items", data),
  updateItem: (itemId: string, quantity: number) =>
    api.put(`/cart/items/${itemId}`, { quantity }),
  removeItem: (itemId: string) => api.delete(`/cart/items/${itemId}`),
  clear: () => api.delete("/cart"),
};

// Wishlist API
export const wishlistApi = {
  get: () => api.get("/wishlist"),
  toggle: (productId: string) => api.post("/wishlist", { product_id: productId }),
  remove: (productId: string) => api.delete(`/wishlist/${productId}`),
  check: (productId: string) => api.get(`/wishlist/check/${productId}`),
};

// Orders API
export const ordersApi = {
  myOrders: () => api.get("/orders/my-orders"),
  getOrder: (orderId: string) => api.get(`/orders/${orderId}`),
  createOrder: (data: {
    shipping_name: string;
    shipping_phone: string;
    shipping_address_line1: string;
    shipping_address_line2?: string;
    shipping_city: string;
    shipping_state: string;
    shipping_postal_code: string;
    shipping_country?: string;
    customer_note?: string;
    coupon_code?: string;
    payment_method?: string;
  }) => api.post("/orders", data),
  verifyPayment: (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    order_id: string;
  }) => api.post("/orders/verify-payment", data),
};
