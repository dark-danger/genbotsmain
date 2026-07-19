import axios from "axios";
import { useAuthStore } from "@/store/auth";
import { useAdminAuthStore } from "@/store/adminAuth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// ── CUSTOMER AXIOS INSTANCE ─────────────────────────────────────────────
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const { token } = useAuthStore.getState();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

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
          const { access_token, refresh_token: new_refresh } = res.data;
          localStorage.setItem("access_token", access_token);
          localStorage.setItem("refresh_token", new_refresh);
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


// ── ADMIN AXIOS INSTANCE ────────────────────────────────────────────────
export const adminAxios = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

adminAxios.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const { token } = useAdminAuthStore.getState();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

adminAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // We don't have a refresh token logic implemented for admin endpoint in this file yet,
    // so we just log them out directly on 401.
    if (error.response?.status === 401 && !originalRequest._retry) {
      useAdminAuthStore.getState().logout();
      if (typeof window !== "undefined") {
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  }
);


// ── CUSTOMER APIS ───────────────────────────────────────────────────────
export const authApi = {
  register: (data: Record<string, string>) => api.post("/auth/register", data),
  login: (data: { email: string; password: string }) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
  updateMe: (data: Record<string, string>) => api.patch("/auth/me", data),
  changePassword: (data: Record<string, string>) => api.post("/auth/change-password", data),
};

export const productsApi = {
  list: (params?: Record<string, string | number | boolean>) => api.get("/products", { params }),
  get: (id: string) => api.get(`/products/${id}`),
  getBySlug: (slug: string) => api.get(`/products/${slug}`),
  create: (data: Record<string, unknown>) => adminAxios.post("/products", data),
  update: (id: string, data: Record<string, unknown>) => adminAxios.patch(`/products/${id}`, data),
  delete: (id: string) => adminAxios.delete(`/products/${id}`),
  featured: (limit = 8) => api.get("/products/featured", { params: { limit } }),
};

export const blogApi = {
  list: (params?: Record<string, string | number>) => api.get("/blog", { params }),
  getBySlug: (slug: string) => api.get(`/blog/${slug}`),
  categories: () => api.get("/blog/categories"),
  create: (data: Record<string, unknown>) => adminAxios.post("/blog", data),
  update: (id: string, data: Record<string, unknown>) => adminAxios.put(`/blog/${id}`, data),
  delete: (id: string) => adminAxios.delete(`/blog/${id}`),
};

export const softwareApi = {
  list: () => api.get("/software"),
  getBySlug: (slug: string) => api.get(`/software/${slug}`),
  versions: (id: string) => api.get(`/software/${id}/versions`),
  create: (data: Record<string, unknown>) => adminAxios.post("/software", data),
  update: (id: string, data: Record<string, unknown>) => adminAxios.put(`/software/${id}`, data),
  delete: (id: string) => adminAxios.delete(`/software/${id}`),
  createVersion: (softwareId: string, data: Record<string, unknown>) => adminAxios.post(`/software/${softwareId}/versions`, data),
};

export const servicesApi = {
  list: () => api.get("/services"),
  getBySlug: (slug: string) => api.get(`/services/${slug}`),
  bookConsultation: (data: Record<string, unknown>) => api.post("/services/consultation", data),
  create: (data: Record<string, unknown>) => adminAxios.post("/services", data),
  update: (id: string, data: Record<string, unknown>) => adminAxios.put(`/services/${id}`, data),
  delete: (id: string) => adminAxios.delete(`/services/${id}`),
};

export const projectsApi = {
  list: (params?: Record<string, string>) => api.get("/projects", { params }),
  getBySlug: (slug: string) => api.get(`/projects/${slug}`),
  create: (data: Record<string, unknown>) => adminAxios.post("/projects", data),
  update: (id: string, data: Record<string, unknown>) => adminAxios.put(`/projects/${id}`, data),
  delete: (id: string) => adminAxios.delete(`/projects/${id}`),
};

export const trainingApi = {
  list: (params?: Record<string, string>) => api.get("/training", { params }),
  getBySlug: (slug: string) => api.get(`/training/${slug}`),
  enroll: (courseId: string) => api.post(`/training/${courseId}/enroll`),
  create: (data: Record<string, unknown>) => adminAxios.post("/training", data),
  update: (id: string, data: Record<string, unknown>) => adminAxios.put(`/training/${id}`, data),
  delete: (id: string) => adminAxios.delete(`/training/${id}`),
};

export const cmsApi = {
  getPage: (pageKey: string) => api.get(`/cms/pages/${pageKey}`),
  getSettings: () => api.get("/cms/settings"),
};

export const publicApi = {
  testimonials: () => api.get("/testimonials"),
  faqs: (category?: string) => api.get("/faqs", { params: category ? { category } : {} }),
  newsletter: (email: string) => api.post("/newsletter", { email }),
  contact: (data: Record<string, string>) => api.post("/contact", data),
};

export const careersApi = {
  list: () => api.get("/careers"),
  getBySlug: (slug: string) => api.get(`/careers/${slug}`),
  apply: (careerId: string, data: FormData) => api.post(`/careers/${careerId}/apply`, data),
};

export const supportApi = {
  listTickets: () => api.get("/support/tickets"),
  createTicket: (data: Record<string, string>) => api.post("/support/tickets", data),
  addMessage: (ticketId: string, message: string) =>
    api.post(`/support/tickets/${ticketId}/messages`, { message }),
};

export const cartApi = {
  get: () => api.get("/cart"),
  addItem: (data: Record<string, unknown>) => api.post("/cart/items", data),
  updateItem: (itemId: string, quantity: number) => api.put(`/cart/items/${itemId}`, { quantity }),
  removeItem: (itemId: string) => api.delete(`/cart/items/${itemId}`),
  clear: () => api.delete("/cart"),
};

export const wishlistApi = {
  get: () => api.get("/wishlist"),
  toggle: (productId: string) => api.post("/wishlist", { product_id: productId }),
  remove: (productId: string) => api.delete(`/wishlist/${productId}`),
  check: (productId: string) => api.get(`/wishlist/check/${productId}`),
};

export const ordersApi = {
  myOrders: () => api.get("/orders/my-orders"),
  getOrder: (orderId: string) => api.get(`/orders/${orderId}`),
  createOrder: (data: Record<string, unknown>) => api.post("/orders", data),
  verifyPayment: (data: Record<string, unknown>) => api.post("/orders/verify-payment", data),
};


// ── ADMIN APIS (Uses adminAxios) ──────────────────────────────────────────
export const adminAuthApi = {
  login: (data: { email: string; password: string }) => adminAxios.post("/admin/login", data),
  getMe: () => adminAxios.get("/admin/me"),
};

export const adminApi = {
  dashboard: () => adminAxios.get("/admin/dashboard"),
  users: (params?: Record<string, string | number>) => adminAxios.get("/admin/users", { params }),
  updateUser: (id: string, data: Record<string, unknown>) => adminAxios.patch(`/admin/users/${id}`, data),
  orders: (params?: Record<string, string | number>) => adminAxios.get("/admin/orders", { params }),
  updateOrderStatus: (id: string, status: string) =>
    adminAxios.patch(`/admin/orders/${id}/status?status=${status}`),
  inquiries: () => adminAxios.get("/admin/inquiries"),
  tickets: (status?: string) => adminAxios.get("/admin/tickets", { params: status ? { status } : {} }),
  subscribers: () => adminAxios.get("/admin/subscribers"),
  logs: (params?: Record<string, string | number>) => adminAxios.get("/admin/logs", { params }),
  coupons: () => adminAxios.get("/admin/coupons"),
  createCoupon: (data: Record<string, unknown>) => adminAxios.post("/admin/coupons", data),
  updateCoupon: (id: string, data: Record<string, unknown>) => adminAxios.put(`/admin/coupons/${id}`, data),
  deleteCoupon: (id: string) => adminAxios.delete(`/admin/coupons/${id}`),
  listNotifications: () => adminAxios.get("/admin/notifications"),
  markNotificationRead: (id: string) => adminAxios.patch(`/admin/notifications/${id}/read`),
  markAllNotificationsRead: () => adminAxios.post("/admin/notifications/mark-all-read"),
  deleteNotification: (id: string) => adminAxios.delete(`/admin/notifications/${id}`),
  reviews: () => adminAxios.get("/admin/reviews"),
  approveReview: (id: string) => adminAxios.patch(`/admin/reviews/${id}/approve`),
  deleteReview: (id: string) => adminAxios.delete(`/admin/reviews/${id}`),
};

export const mediaApi = {
  upload: (formData: FormData) => adminAxios.post("/media/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  }),
  list: (folder?: string) => adminAxios.get("/media", { params: folder ? { folder } : {} }),
  delete: (id: string) => adminAxios.delete(`/media/${id}`),
};
