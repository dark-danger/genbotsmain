"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus, Edit2, Trash2, Copy, Archive, CheckCircle,
  Share2, Search, RefreshCw, Image as ImageIcon,
  Upload, X, Star, Layers, Check, AlertCircle, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { productsApi, mediaApi } from "@/lib/api";
import { getProductImage, resolveImageUrl } from "@/lib/utils";

interface ProductImageItem {
  id?: string;
  url: string;
  alt_text?: string;
  is_primary?: boolean;
  sort_order?: number;
}

interface ProductSpecItem {
  key: string;
  value: string;
}

interface ProductFormData {
  id?: string;
  name: string;
  slug?: string;
  sku: string;
  price: string;
  compare_at_price: string;
  cost_price?: string;
  tax_rate: string;
  stock_quantity: string;
  low_stock_threshold: string;
  weight: string;
  status: "active" | "draft" | "archived";
  is_featured: boolean;
  is_digital: boolean;
  category_id: string;
  brand_id: string;
  short_description: string;
  description: string;
  meta_title: string;
  meta_description: string;
  tags: string;
  images: ProductImageItem[];
  specifications: ProductSpecItem[];
}

const initialFormState: ProductFormData = {
  name: "",
  sku: "",
  price: "",
  compare_at_price: "",
  tax_rate: "18.00",
  stock_quantity: "50",
  low_stock_threshold: "5",
  weight: "",
  status: "active",
  is_featured: false,
  is_digital: false,
  category_id: "",
  brand_id: "",
  short_description: "",
  description: "",
  meta_title: "",
  meta_description: "",
  tags: "",
  images: [],
  specifications: [],
};

export function AdminProductsPanel() {
  const queryClient = useQueryClient();

  const [activeStatusTab, setActiveStatusTab] = useState<"all" | "active" | "draft" | "archived">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>(initialFormState);
  const [activeFormTab, setActiveFormTab] = useState<"basic" | "pricing" | "media" | "specs" | "seo">("basic");
  
  // Quick sub-inputs
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [specKeyInput, setSpecKeyInput] = useState("");
  const [specValInput, setSpecValInput] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  // Queries
  const { data: productsData, isLoading: isLoadingProducts, refetch: refetchProducts } = useQuery({
    queryKey: ["adminProductsList"],
    queryFn: async () => {
      const res = await productsApi.list({ page_size: 100, status: "" });
      return res.data?.items || res.data || [];
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["adminCategories"],
    queryFn: async () => {
      const res = await productsApi.categories();
      return res.data || [];
    },
  });

  const { data: brands = [] } = useQuery({
    queryKey: ["adminBrands"],
    queryFn: async () => {
      const res = await productsApi.brands();
      return res.data || [];
    },
  });

  // Mutations
  const createProductMutation = useMutation({
    mutationFn: (payload: any) => productsApi.create(payload),
    onSuccess: (createdRes: any) => {
      queryClient.invalidateQueries({ queryKey: ["adminProductsList"] });
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
      queryClient.invalidateQueries({ queryKey: ["adminDraftProducts"] });
      queryClient.invalidateQueries({ queryKey: ["adminArchivedProducts"] });
      queryClient.invalidateQueries({ queryKey: ["storeProducts"] });
      queryClient.invalidateQueries({ queryKey: ["homepageFeaturedProducts"] });
      setIsEditorOpen(false);
      setFormData(initialFormState);
      const slug = createdRes.data?.slug || "";
      showFeedback(`✅ Product created successfully! Link: /store/${slug}`);
    },
    onError: (err: any) => {
      alert(err.response?.data?.detail || "Failed to create product");
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => productsApi.update(id, data),
    onSuccess: (updatedRes: any) => {
      queryClient.invalidateQueries({ queryKey: ["adminProductsList"] });
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
      queryClient.invalidateQueries({ queryKey: ["adminDraftProducts"] });
      queryClient.invalidateQueries({ queryKey: ["adminArchivedProducts"] });
      queryClient.invalidateQueries({ queryKey: ["storeProducts"] });
      queryClient.invalidateQueries({ queryKey: ["homepageFeaturedProducts"] });
      if (updatedRes.data?.slug) {
        queryClient.invalidateQueries({ queryKey: ["productDetail", updatedRes.data.slug] });
      }
      setIsEditorOpen(false);
      setFormData(initialFormState);
      showFeedback("✅ Product updated successfully!");
    },
    onError: (err: any) => {
      alert(err.response?.data?.detail || "Failed to update product");
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminProductsList"] });
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
      queryClient.invalidateQueries({ queryKey: ["storeProducts"] });
      showFeedback("🗑️ Product deleted permanently.");
    },
    onError: (err: any) => {
      alert(err.response?.data?.detail || "Failed to delete product");
    },
  });

  const syncLabMutation = useMutation({
    mutationFn: () => productsApi.syncSchoolLab(),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["adminProductsList"] });
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
      queryClient.invalidateQueries({ queryKey: ["storeProducts"] });
      showFeedback(res.data?.message || "✨ School Lab catalog synced successfully!");
    },
    onError: (err: any) => {
      alert(err.response?.data?.detail || "Failed to sync School Lab catalog.");
    },
  });

  // Filtered Products
  const allProducts: any[] = productsData || [];

  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      const matchesStatus =
        activeStatusTab === "all" || product.status === activeStatusTab;
      const matchesSearch =
        !searchTerm.trim() ||
        (product.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.sku || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat =
        selectedCategoryFilter === "all" ||
        product.category?.slug === selectedCategoryFilter ||
        product.category_id === selectedCategoryFilter;
      return matchesStatus && matchesSearch && matchesCat;
    });
  }, [allProducts, activeStatusTab, searchTerm, selectedCategoryFilter]);

  // Counts
  const counts = useMemo(() => {
    return {
      all: allProducts.length,
      active: allProducts.filter((p) => p.status === "active").length,
      draft: allProducts.filter((p) => p.status === "draft").length,
      archived: allProducts.filter((p) => p.status === "archived").length,
    };
  }, [allProducts]);

  // Handle Edit Action
  const handleStartEdit = (product: any) => {
    const formattedImages: ProductImageItem[] = (product.images || []).map((img: any, idx: number) => ({
      id: img.id,
      url: typeof img === "string" ? img : (img.url || img.image_url || ""),
      alt_text: img.alt_text || product.name,
      is_primary: img.is_primary ?? idx === 0,
      sort_order: img.sort_order ?? idx,
    })).filter((i: ProductImageItem) => Boolean(i.url));

    const formattedSpecs: ProductSpecItem[] = (product.specifications || []).map((s: any) => ({
      key: s.key,
      value: s.value,
    }));

    setFormData({
      id: product.id,
      name: product.name || "",
      slug: product.slug || "",
      sku: product.sku || "",
      price: product.price?.toString() || "0",
      compare_at_price: product.compare_at_price ? product.compare_at_price.toString() : "",
      tax_rate: product.tax_rate?.toString() || "18.00",
      stock_quantity: product.stock_quantity?.toString() || "0",
      low_stock_threshold: product.low_stock_threshold?.toString() || "5",
      weight: product.weight?.toString() || "",
      status: product.status || "active",
      is_featured: Boolean(product.is_featured),
      is_digital: Boolean(product.is_digital),
      category_id: product.category_id || "",
      brand_id: product.brand_id || "",
      short_description: product.short_description || "",
      description: product.description || "",
      meta_title: product.meta_title || "",
      meta_description: product.meta_description || "",
      tags: Array.isArray(product.tags) ? product.tags.join(", ") : (product.tags || ""),
      images: formattedImages,
      specifications: formattedSpecs,
    });

    setActiveFormTab("basic");
    setIsEditorOpen(true);
  };

  // Handle Duplicate Action
  const handleDuplicate = (product: any) => {
    const uniqueSuffix = Math.floor(100 + Math.random() * 900);
    handleStartEdit({
      ...product,
      id: undefined,
      name: `${product.name} (Copy)`,
      sku: `${product.sku}-CP${uniqueSuffix}`,
      status: "draft",
    });
    showFeedback("📋 Duplicated into editor as draft.");
  };

  // Handle Form Submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.sku.trim() || !formData.price.trim()) {
      alert("Please fill in Product Name, SKU, and Price.");
      return;
    }

    const tagsArray = formData.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload: Record<string, any> = {
      name: formData.name.trim(),
      sku: formData.sku.trim(),
      price: parseFloat(formData.price) || 0,
      compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
      tax_rate: parseFloat(formData.tax_rate) || 18.00,
      stock_quantity: parseInt(formData.stock_quantity) || 0,
      low_stock_threshold: parseInt(formData.low_stock_threshold) || 5,
      weight: formData.weight ? parseFloat(formData.weight) : null,
      status: formData.status,
      is_featured: formData.is_featured,
      is_digital: formData.is_digital,
      category_id: formData.category_id || null,
      brand_id: formData.brand_id || null,
      short_description: formData.short_description.trim() || null,
      description: formData.description.trim() || null,
      meta_title: formData.meta_title.trim() || null,
      meta_description: formData.meta_description.trim() || null,
      tags: tagsArray.length ? tagsArray : null,
      images: formData.images.map((img, idx) => ({
        url: img.url.trim(),
        alt_text: img.alt_text || formData.name,
        is_primary: img.is_primary || idx === 0,
        sort_order: idx,
      })),
      specifications: formData.specifications
        .filter((s) => s.key.trim() && s.value.trim())
        .map((s, idx) => ({
          key: s.key.trim(),
          value: s.value.trim(),
          sort_order: idx,
        })),
    };

    if (formData.id) {
      updateProductMutation.mutate({ id: formData.id, data: payload });
    } else {
      createProductMutation.mutate(payload);
    }
  };

  // Image Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingImage(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uploadFormData = new FormData();
        uploadFormData.append("file", file);
        uploadFormData.append("folder", "products");
        uploadFormData.append("alt_text", formData.name || file.name);

        const res = await mediaApi.upload(uploadFormData);
        const uploadedUrl = res.data?.url || res.data?.file_url;
        if (uploadedUrl) {
          setFormData((prev) => ({
            ...prev,
            images: [
              ...prev.images,
              {
                url: uploadedUrl,
                alt_text: file.name,
                is_primary: prev.images.length === 0,
                sort_order: prev.images.length,
              },
            ],
          }));
        }
      }
      showFeedback("🖼️ Image(s) uploaded successfully!");
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to upload image.");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Banner */}
      {actionFeedback && (
        <div className="p-3.5 bg-primary/10 border border-primary/30 rounded-xl text-primary font-medium text-sm flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <span>{actionFeedback}</span>
          <Button variant="ghost" size="sm" onClick={() => setActionFeedback(null)} className="h-6 w-6 p-0">
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}

      {/* Top Header & Quick Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-card border rounded-2xl p-5 shadow-sm">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" /> Product Catalog &amp; Inventory
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your hardware, IoT boards, robotics kits, sensors, pricing, stock, and media gallery.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => syncLabMutation.mutate()}
            disabled={syncLabMutation.isPending}
            className="rounded-xl text-xs flex items-center gap-1.5 border-primary/30 hover:bg-primary/5"
            title="Auto-sync official School Lab and STEM inventory items"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncLabMutation.isPending ? "animate-spin" : "text-primary"}`} />
            Sync School Lab Catalog
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setFormData(initialFormState);
              setActiveFormTab("basic");
              setIsEditorOpen(true);
            }}
            className="gradient-bg text-white rounded-xl text-xs flex items-center gap-1.5 shadow-md hover:shadow-lg"
          >
            <Plus className="w-4 h-4" /> Add New Product
          </Button>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Status Tabs */}
        <div className="md:col-span-6 flex gap-1.5 bg-muted/40 p-1 rounded-xl border">
          {(["all", "active", "draft", "archived"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveStatusTab(tab)}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold capitalize transition-all ${
                activeStatusTab === tab
                  ? "bg-background text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab} ({counts[tab]})
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="md:col-span-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or SKU..."
            className="pl-9 h-9 text-xs rounded-xl"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className="md:col-span-2">
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="w-full h-9 bg-background border rounded-xl px-2.5 text-xs outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Categories</option>
            {categories.map((c: any) => (
              <option key={c.id || c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* PRODUCT EDITOR MODAL / DRAWER */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-background border border-border rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-5 border-b flex justify-between items-center bg-card/50">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  {formData.id ? (
                    <><Edit2 className="w-5 h-5 text-primary" /> Edit Product: {formData.name}</>
                  ) : (
                    <><Plus className="w-5 h-5 text-primary" /> Create New Product</>
                  )}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Configure hardware details, pinout specs, pricing, and high-definition product photography.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditorOpen(false)}
                className="rounded-full w-8 h-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Form Navigation Tabs */}
            <div className="flex border-b px-5 bg-muted/20 gap-2 overflow-x-auto text-xs">
              {[
                { id: "basic", label: "1. Basic Info & Category" },
                { id: "pricing", label: "2. Pricing & Stock" },
                { id: "media", label: "3. Photos & Media" },
                { id: "specs", label: "4. Specifications" },
                { id: "seo", label: "5. SEO & Tags" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFormTab(tab.id as any)}
                  className={`py-3 px-3 border-b-2 font-semibold transition-colors whitespace-nowrap ${
                    activeFormTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Form Content */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* TAB 1: BASIC INFO */}
              {activeFormTab === "basic" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold block mb-1">Product Title *</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. ESP32-WROOM-32 Wi-Fi & Bluetooth Board"
                        required
                        className="text-sm rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold block mb-1">SKU (Unique Code) *</label>
                      <Input
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        placeholder="e.g. GEN-ESP32-DEV"
                        required
                        className="text-sm font-mono rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-semibold block mb-1">Category</label>
                      <select
                        value={formData.category_id}
                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                        className="w-full h-10 bg-background border rounded-xl px-3 text-sm"
                      >
                        <option value="">Select Category...</option>
                        {categories.map((c: any) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold block mb-1">Brand</label>
                      <select
                        value={formData.brand_id}
                        onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                        className="w-full h-10 bg-background border rounded-xl px-3 text-sm"
                      >
                        <option value="">Select Brand...</option>
                        {brands.map((b: any) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold block mb-1">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        className="w-full h-10 bg-background border rounded-xl px-3 text-sm"
                      >
                        <option value="active">Active (Published)</option>
                        <option value="draft">Draft (Hidden)</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold block mb-1">Short Tagline / Excerpt</label>
                    <Input
                      value={formData.short_description}
                      onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                      placeholder="Brief 1-sentence product summary..."
                      className="text-sm rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold block mb-1">Full Technical Description</label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={5}
                      placeholder="Detailed product overview, pinout details, getting started steps, package inclusions..."
                      className="text-sm rounded-xl resize-y"
                    />
                  </div>

                  <div className="flex items-center gap-6 pt-2">
                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_featured}
                        onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                        className="w-4 h-4 accent-primary rounded"
                      />
                      <span>Featured on Homepage (🔥 Trending Products)</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_digital}
                        onChange={(e) => setFormData({ ...formData, is_digital: e.target.checked })}
                        className="w-4 h-4 accent-primary rounded"
                      />
                      <span>Digital Product (Download / License)</span>
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 2: PRICING & INVENTORY */}
              {activeFormTab === "pricing" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-semibold block mb-1">Selling Price (₹ INR) *</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="e.g. 199.00"
                        required
                        className="text-sm font-semibold rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold block mb-1">Compare-at (Original MRP ₹)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.compare_at_price}
                        onChange={(e) => setFormData({ ...formData, compare_at_price: e.target.value })}
                        placeholder="e.g. 299.00 (optional discount)"
                        className="text-sm rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold block mb-1">GST / Tax Rate (%)</label>
                      <Input
                        type="number"
                        value={formData.tax_rate}
                        onChange={(e) => setFormData({ ...formData, tax_rate: e.target.value })}
                        placeholder="18.00"
                        className="text-sm rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-semibold block mb-1">Available Stock Units *</label>
                      <Input
                        type="number"
                        value={formData.stock_quantity}
                        onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                        placeholder="50"
                        required
                        className="text-sm rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold block mb-1">Low Stock Warning Limit</label>
                      <Input
                        type="number"
                        value={formData.low_stock_threshold}
                        onChange={(e) => setFormData({ ...formData, low_stock_threshold: e.target.value })}
                        placeholder="5"
                        className="text-sm rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold block mb-1">Weight (in kg)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.weight}
                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                        placeholder="0.15"
                        className="text-sm rounded-xl"
                      />
                    </div>
                  </div>

                  {formData.compare_at_price && parseFloat(formData.compare_at_price) > parseFloat(formData.price || "0") && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 text-xs font-medium flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      <span>
                        Calculated Discount: {Math.round(((parseFloat(formData.compare_at_price) - parseFloat(formData.price)) / parseFloat(formData.compare_at_price)) * 100)}% OFF (Customer saves ₹{(parseFloat(formData.compare_at_price) - parseFloat(formData.price)).toFixed(2)})
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: MEDIA & IMAGES */}
              {activeFormTab === "media" && (
                <div className="space-y-5">
                  <div className="p-4 bg-muted/30 border border-dashed rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <h4 className="font-semibold text-xs mb-1">Upload Product Photos</h4>
                      <p className="text-[11px] text-muted-foreground">
                        Upload high-resolution PNG, JPG, or WebP images from your computer.
                      </p>
                    </div>

                    <label className="cursor-pointer">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploadingImage}
                        className="rounded-xl text-xs flex items-center gap-1.5 pointer-events-none"
                      >
                        <Upload className="w-3.5 h-3.5 text-primary" />
                        {uploadingImage ? "Uploading..." : "Browse & Upload File"}
                      </Button>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Add via direct URL or public path */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold block">Or Add Image URL / Relative Path</label>
                    <div className="flex gap-2">
                      <Input
                        value={imageUrlInput}
                        onChange={(e) => setImageUrlInput(e.target.value)}
                        placeholder="e.g. /products/arduino-uno-r3.jpg or /uploads/products/... or https://images.unsplash.com/..."
                        className="text-xs rounded-xl"
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          if (!imageUrlInput.trim()) return;
                          setFormData((prev) => ({
                            ...prev,
                            images: [
                              ...prev.images,
                              {
                                url: imageUrlInput.trim(),
                                alt_text: prev.name,
                                is_primary: prev.images.length === 0,
                                sort_order: prev.images.length,
                              },
                            ],
                          }));
                          setImageUrlInput("");
                        }}
                        className="rounded-xl text-xs shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" /> Add Image
                      </Button>
                    </div>
                  </div>

                  {/* Image Grid / Gallery */}
                  <div>
                    <h4 className="font-semibold text-xs mb-2">Image Gallery ({formData.images.length})</h4>
                    {formData.images.length === 0 ? (
                      <div className="text-center py-10 border border-dashed rounded-xl text-muted-foreground text-xs">
                        <ImageIcon className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
                        No images added yet. Upload files or enter image URLs above.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {formData.images.map((img, idx) => (
                          <div
                            key={idx}
                            className={`group relative rounded-xl overflow-hidden border-2 bg-card transition-all ${
                              img.is_primary ? "border-primary ring-2 ring-primary/20 shadow-md" : "border-border"
                            }`}
                          >
                            <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                              <img
                                src={resolveImageUrl(img.url)}
                                alt={img.alt_text || `Product image ${idx + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).onerror = null;
                                  (e.currentTarget as HTMLImageElement).src = "/products/arduino-uno-r3.jpg";
                                }}
                              />
                            </div>

                            {/* Overlay Controls */}
                            <div className="p-2 bg-background/95 flex items-center justify-between text-[10px]">
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    images: prev.images.map((im, i) => ({
                                      ...im,
                                      is_primary: i === idx,
                                    })),
                                  }));
                                }}
                                className={`flex items-center gap-1 font-semibold ${
                                  img.is_primary ? "text-primary" : "text-muted-foreground hover:text-primary"
                                }`}
                              >
                                <Star className={`w-3 h-3 ${img.is_primary ? "fill-primary" : ""}`} />
                                {img.is_primary ? "Primary" : "Set Primary"}
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    images: prev.images.filter((_, i) => i !== idx),
                                  }));
                                }}
                                className="text-destructive hover:underline font-bold"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: SPECIFICATIONS */}
              {activeFormTab === "specs" && (
                <div className="space-y-4">
                  <div className="p-4 bg-muted/20 border rounded-xl space-y-3">
                    <h4 className="font-semibold text-xs">Add Technical Specification</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                      <div className="sm:col-span-5">
                        <Input
                          value={specKeyInput}
                          onChange={(e) => setSpecKeyInput(e.target.value)}
                          placeholder="Key (e.g. Operating Voltage, Microcontroller, Flash Memory)"
                          className="text-xs rounded-xl h-9"
                        />
                      </div>
                      <div className="sm:col-span-5">
                        <Input
                          value={specValInput}
                          onChange={(e) => setSpecValInput(e.target.value)}
                          placeholder="Value (e.g. 3.3V / 5V DC, ESP32 Dual-Core 240MHz, 4MB SPI Flash)"
                          className="text-xs rounded-xl h-9"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Button
                          type="button"
                          onClick={() => {
                            if (!specKeyInput.trim() || !specValInput.trim()) return;
                            setFormData((prev) => ({
                              ...prev,
                              specifications: [
                                ...prev.specifications,
                                { key: specKeyInput.trim(), value: specValInput.trim() },
                              ],
                            }));
                            setSpecKeyInput("");
                            setSpecValInput("");
                          }}
                          className="w-full text-xs rounded-xl h-9"
                        >
                          Add Spec
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-xs mb-2">Configured Specifications ({formData.specifications.length})</h4>
                    {formData.specifications.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">No specifications added yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {formData.specifications.map((s, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2.5 bg-card border rounded-xl text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-muted-foreground w-40 truncate">{s.key}</span>
                              <span className="text-foreground">{s.value}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  specifications: prev.specifications.filter((_, i) => i !== idx),
                                }));
                              }}
                              className="text-destructive hover:bg-destructive/10 p-1 rounded-md"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: SEO & TAGS */}
              {activeFormTab === "seo" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold block mb-1">SEO Meta Title</label>
                    <Input
                      value={formData.meta_title}
                      onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                      placeholder="e.g. ESP32 NodeMCU Development Board | GenBots Official"
                      className="text-sm rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold block mb-1">SEO Meta Description</label>
                    <Textarea
                      value={formData.meta_description}
                      onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                      rows={3}
                      placeholder="Search engine optimized description under 160 characters..."
                      className="text-sm rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold block mb-1">Tags (Comma separated)</label>
                    <Input
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="arduino, esp32, wifi, bluetooth, robotics, iot, sensor"
                      className="text-sm rounded-xl"
                    />
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="pt-4 border-t flex justify-end gap-3 bg-background sticky bottom-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditorOpen(false)}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createProductMutation.isPending || updateProductMutation.isPending}
                  className="gradient-bg text-white rounded-xl text-xs px-6 shadow-md"
                >
                  {formData.id ? "Save Product Changes" : "Publish Product to Store"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRODUCTS TABLE */}
      <div className="glass-card border rounded-2xl overflow-hidden shadow-sm">
        {isLoadingProducts ? (
          <div className="p-12 text-center text-muted-foreground text-sm">
            <RefreshCw className="w-6 h-6 mx-auto animate-spin mb-2 text-primary" />
            Loading catalog products...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-16 text-center text-muted-foreground space-y-3">
            <AlertCircle className="w-10 h-10 mx-auto text-muted-foreground/50" />
            <h4 className="font-semibold text-foreground">No products found</h4>
            <p className="text-xs max-w-sm mx-auto">
              No items match your active search or filters. Create a new product or click &quot;Sync School Lab Catalog&quot;.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 text-muted-foreground font-semibold border-b">
                <tr>
                  <th className="py-3 px-4">Item</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProducts.map((product) => {
                  const imgUrl = getProductImage(product);
                  const isOutOfStock = product.stock_quantity <= 0;
                  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= (product.low_stock_threshold || 5);

                  return (
                    <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-muted border shrink-0">
                            <img
                              src={imgUrl}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).onerror = null;
                                (e.currentTarget as HTMLImageElement).src = "/products/arduino-uno-r3.jpg";
                              }}
                            />
                          </div>
                          <div>
                            <span className="font-bold text-foreground block line-clamp-1">
                              {product.name}
                            </span>
                            {product.is_featured && (
                              <Badge className="text-[9px] px-1.5 py-0 gradient-bg text-white mt-0.5">
                                Featured
                              </Badge>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-muted-foreground">
                        {product.sku}
                      </td>

                      <td className="py-3 px-4 text-muted-foreground">
                        {product.category?.name || "General"}
                      </td>

                      <td className="py-3 px-4 font-bold text-foreground">
                        ₹{parseFloat(product.price || "0").toLocaleString("en-IN")}
                        {product.compare_at_price && (
                          <span className="block text-[10px] text-muted-foreground line-through font-normal">
                            ₹{parseFloat(product.compare_at_price).toLocaleString("en-IN")}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {isOutOfStock ? (
                          <Badge variant="destructive" className="text-[10px]">Out of Stock</Badge>
                        ) : isLowStock ? (
                          <Badge variant="outline" className="text-amber-500 border-amber-500/30 text-[10px]">
                            {product.stock_quantity} left
                          </Badge>
                        ) : (
                          <span className="font-medium text-foreground">{product.stock_quantity} units</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {product.status === "active" ? (
                          <Badge className="bg-emerald-500 text-white text-[10px]">Active</Badge>
                        ) : product.status === "draft" ? (
                          <Badge variant="outline" className="text-[10px]">Draft</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">Archived</Badge>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleStartEdit(product)}
                            title="Edit Product"
                            className="h-8 w-8 rounded-lg hover:bg-muted"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-primary" />
                          </Button>

                          <a
                            href={`/store/${product.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View in Store"
                          >
                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-muted">
                              <Eye className="w-3.5 h-3.5 text-emerald-500" />
                            </Button>
                          </a>

                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              const storeUrl = `${window.location.origin}/store/${product.slug}`;
                              navigator.clipboard.writeText(storeUrl);
                              showFeedback(`🔗 Copied store link: ${storeUrl}`);
                            }}
                            title="Copy Store Link"
                            className="h-8 w-8 rounded-lg hover:bg-muted"
                          >
                            <Share2 className="w-3.5 h-3.5 text-blue-500" />
                          </Button>

                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDuplicate(product)}
                            title="Duplicate as Draft"
                            className="h-8 w-8 rounded-lg hover:bg-muted"
                          >
                            <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                          </Button>

                          {product.status === "active" ? (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => updateProductMutation.mutate({ id: product.id, data: { status: "archived" } })}
                              title="Archive Product"
                              className="h-8 w-8 rounded-lg hover:bg-muted"
                            >
                              <Archive className="w-3.5 h-3.5 text-amber-500" />
                            </Button>
                          ) : (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => updateProductMutation.mutate({ id: product.id, data: { status: "active" } })}
                              title="Activate Product"
                              className="h-8 w-8 rounded-lg hover:bg-muted"
                            >
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                            </Button>
                          )}

                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
                                deleteProductMutation.mutate(product.id);
                              }
                            }}
                            title="Delete Permanently"
                            className="h-8 w-8 rounded-lg hover:bg-destructive/10 text-destructive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
