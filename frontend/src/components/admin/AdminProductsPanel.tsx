"use client";

import { useState, useMemo, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus, Edit2, Trash2, Copy, Archive, CheckCircle,
  Share2, Search, RefreshCw, Image as ImageIcon,
  Upload, X, Star, Layers, Check, AlertCircle, Eye,
  TrendingUp, DollarSign, Percent, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { productsApi, mediaApi } from "@/lib/api";
import { getProductImage, resolveImageUrl, getProductFallbackImage, compressImageToDataUrl } from "@/lib/utils";

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
  cost_price: "",
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

export function classifyProduct(name: string, categoryName: string = ""): { prefix: string; typeCode: number; categoryLabel: string; suggestedSku: string } {
  const n = (name || "").toLowerCase().trim();
  const c = (categoryName || "").toLowerCase().trim();

  let prefix = "GEN";
  let typeCode = 1;
  let categoryLabel = "Robotics Hardware";

  // 1. ESP Family
  if (n.includes("esp32-cam") || (n.includes("esp") && n.includes("cam"))) {
    prefix = "ESP";
    typeCode = 2;
    categoryLabel = "ESP32 Camera Module";
  } else if (["esp32", "esp8266", "nodemcu", "esp-12"].some(k => n.includes(k) || c.includes(k))) {
    prefix = "ESP";
    typeCode = 1;
    categoryLabel = "ESP Development Board";
  } else if (n.includes("esp") && (n.includes("shield") || n.includes("relay") || n.includes("adapter"))) {
    prefix = "ESP";
    typeCode = 3;
    categoryLabel = "ESP Expansion & Shield";
  }
  // 2. Arduino Family
  else if (["arduino", "uno r3", "mega 2560", "nano v3", "pro mini"].some(k => n.includes(k) || c.includes(k))) {
    prefix = "ARD";
    typeCode = n.includes("shield") || n.includes("expansion") ? 2 : 1;
    categoryLabel = typeCode === 2 ? "Arduino Shield" : "Arduino Board";
  }
  // 3. Official GenBots Projects & DIY STEM Kits
  else if (["spider robot", "otto bot", "robotic arm", "chassis", "smart car", "quadruped", "robot kit", "stem kit", "biped"].some(k => n.includes(k) || c.includes(k))) {
    prefix = "OFF";
    typeCode = n.includes("arm") ? 2 : 1;
    categoryLabel = "Official GenBots Project / Kit";
  } else if (n.includes("3d printer")) {
    prefix = "OFF";
    typeCode = 3;
    categoryLabel = "Lab 3D Printer";
  }
  // 4. Motors & Actuators
  else if (["servo", "sg90", "mg995", "mg90s", "stepper", "bo motor", "gear motor", "motor driver", "l298n", "l293d"].some(k => n.includes(k) || c.includes(k))) {
    prefix = "MOT";
    typeCode = n.includes("driver") || n.includes("controller") ? 2 : 1;
    categoryLabel = typeCode === 2 ? "Motor Driver" : "Robotic Motor & Servo";
  }
  // 5. Displays
  else if (["oled", "lcd", "display", "screen", "tft", "i2c oled"].some(k => n.includes(k) || c.includes(k))) {
    prefix = "DIS";
    typeCode = 1;
    categoryLabel = "Display Module";
  }
  // 6. Wireless Communication & Audio
  else if (["bluetooth", "hc-05", "hc-06", "rfid", "rc522", "nrf24", "amplifier", "pam8403", "audio", "lora"].some(k => n.includes(k) || c.includes(k))) {
    prefix = "COM";
    typeCode = 1;
    categoryLabel = "Communication & Audio";
  }
  // 7. Sensors
  else if (["sensor", "ultrasonic", "flex", "ir obstacle", "hc-sr04", "bracket", "dht11", "dht22", "bmp180", "soil moisture", "flame", "gas", "smoke", "mq-", "sound", "vibration", "tilt", "line tracking", "touch", "water level", "reed", "hall effect", "light sensor", "ldr", "lm35", "radar"].some(k => n.includes(k) || c.includes(k))) {
    prefix = "SEN";
    typeCode = (n.includes("bracket") || n.includes("mount")) ? 3 : (["ultrasonic", "hc-sr04", "ir obstacle", "proximity", "line tracking", "radar", "rcwl"].some(k => n.includes(k)) ? 1 : 2);
    categoryLabel = "Sensor Module";
  }
  // 8. Power & Batteries
  else if (["lipo", "battery", "charger", "b3 pro", "18650", "power", "bms", "cell", "holder"].some(k => n.includes(k) || c.includes(k))) {
    prefix = "PWR";
    typeCode = n.includes("charger") || n.includes("b3") || n.includes("bms") ? 2 : 1;
    categoryLabel = "Battery & Power";
  }
  // 9. Tools & Lab Equipment
  else if (["soldering", "multimeter", "wire stripper", "screwdriver", "plier", "glue gun", "glue stick", "dt-830d"].some(k => n.includes(k) || c.includes(k))) {
    prefix = "TOL";
    typeCode = 1;
    categoryLabel = "Lab & Assembly Tool";
  }
  // 10. Prototyping Parts & Components
  else if (["jumper wire", "led", "resistor", "enclosure", "tape", "zip tie", "cable", "extension", "breadboard", "relay", "potentiometer", "switch", "pcb", "i-blink"].some(k => n.includes(k) || c.includes(k))) {
    prefix = "PRT";
    typeCode = 1;
    categoryLabel = "Prototyping Component";
  }

  // Generate suggested sequence or base SKU
  const suggestedSku = `GEN-${prefix}-${typeCode}-1`;

  return { prefix, typeCode, categoryLabel, suggestedSku };
}

export function generateSeoContent(name: string, categoryName: string = "", shortDesc: string = ""): {
  meta_title: string;
  meta_description: string;
  short_description: string;
  tags: string;
} {
  const cleanName = (name || "").trim();
  const { prefix, categoryLabel } = classifyProduct(cleanName, categoryName);

  // 1. Meta Title (50-65 chars for Google CTR)
  let meta_title = `Buy ${cleanName} | Best Price in India - GenBots`;
  if (meta_title.length > 65) {
    meta_title = `${cleanName} | Buy Online India - GenBots`;
  }
  if (meta_title.length > 65) {
    meta_title = `${cleanName.slice(0, 48)}... | GenBots`;
  }

  // 2. Meta Description (145-160 chars high-intent)
  let meta_description = `Buy original ${cleanName} (${categoryLabel}) at lowest price in India on GenBots.in. Genuine tested quality, fast nationwide delivery, pinouts & tutorials.`;
  if (meta_description.length > 160) {
    meta_description = `Buy original ${cleanName} online in India at GenBots.in. Genuine tested quality, fast shipping & developer project guides for IoT & robotics.`;
  }
  if (meta_description.length > 160) {
    meta_description = meta_description.slice(0, 157) + "...";
  }

  // 3. Short Description
  const short_description = shortDesc || `Original ${cleanName} with premium build quality, tested pinout compatibility, and fast nationwide dispatch from GenBots India.`;

  // 4. Tags
  const baseTags = ["robotics", "iot", "diy", "genbots", "india", "stem-education", prefix.toLowerCase()];
  const cleanWords = cleanName.toLowerCase().replace(/[^a-z0-9 ]/g, "").split(" ").filter(w => w.length > 2);
  const tags = Array.from(new Set([...cleanWords, ...baseTags])).slice(0, 10).join(", ");

  return { meta_title, meta_description, short_description, tags };
}

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
  const [isDragging, setIsDragging] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [marginPercentInput, setMarginPercentInput] = useState<string>("30");

  const showFeedback = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  // Real-time Margin & Cost Calculations
  const handleCostPriceChange = (costVal: string) => {
    const cost = parseFloat(costVal) || 0;
    const margin = parseFloat(marginPercentInput) || 0;
    const computedPrice = cost > 0 ? (cost * (1 + margin / 100)).toFixed(2) : formData.price;
    setFormData((prev) => ({
      ...prev,
      cost_price: costVal,
      price: computedPrice,
    }));
  };

  const handleMarginChange = (marginVal: string) => {
    setMarginPercentInput(marginVal);
    const cost = parseFloat(formData.cost_price || "0") || 0;
    const margin = parseFloat(marginVal) || 0;
    if (cost > 0) {
      const computedPrice = (cost * (1 + margin / 100)).toFixed(2);
      setFormData((prev) => ({
        ...prev,
        price: computedPrice,
      }));
    }
  };

  const handleSellingPriceChange = (priceVal: string) => {
    const price = parseFloat(priceVal) || 0;
    const cost = parseFloat(formData.cost_price || "0") || 0;
    if (cost > 0 && price >= cost) {
      const computedMargin = (((price - cost) / cost) * 100).toFixed(1);
      setMarginPercentInput(computedMargin);
    }
    setFormData((prev) => ({
      ...prev,
      price: priceVal,
    }));
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

    const initialCost = product.cost_price ? product.cost_price.toString() : "";
    const numPrice = parseFloat(product.price?.toString() || "0");
    const numCost = parseFloat(initialCost || "0");
    if (numCost > 0 && numPrice >= numCost) {
      setMarginPercentInput((((numPrice - numCost) / numCost) * 100).toFixed(1));
    } else {
      setMarginPercentInput("30");
    }

    setFormData({
      id: product.id,
      name: product.name || "",
      slug: product.slug || "",
      sku: product.sku || "",
      price: product.price?.toString() || "0",
      compare_at_price: product.compare_at_price ? product.compare_at_price.toString() : "",
      cost_price: initialCost,
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

    // Ensure product always has at least one valid image
    let finalImages = formData.images
      .filter((img) => Boolean(img.url && img.url.trim()))
      .map((img, idx) => ({
        url: img.url.trim(),
        alt_text: img.alt_text || formData.name,
        is_primary: img.is_primary || idx === 0,
        sort_order: idx,
      }));

    if (finalImages.length === 0) {
      const fallbackPhoto = getProductFallbackImage(formData.name.trim());
      finalImages = [
        {
          url: fallbackPhoto,
          alt_text: formData.name.trim(),
          is_primary: true,
          sort_order: 0,
        },
      ];
    }

    const payload: Record<string, any> = {
      name: formData.name.trim(),
      sku: formData.sku.trim(),
      price: parseFloat(formData.price) || 0,
      compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
      cost_price: formData.cost_price ? parseFloat(formData.cost_price) : null,
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
      images: finalImages,
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

  // Helper to process uploaded files
  const processFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setUploadingImage(true);
    let successCount = 0;
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith("image/")) {
          alert(`File "${file.name}" is not an image.`);
          continue;
        }

        // 1. Generate optimized client-side Data URL (100% reliable, permanent in PostgreSQL across all hostings)
        let finalImageUrl = "";
        try {
          finalImageUrl = await compressImageToDataUrl(file, 800, 800, 0.85);
        } catch {
          // fallback to reading directly
          finalImageUrl = await new Promise((res) => {
            const r = new FileReader();
            r.onload = () => res(r.result as string);
            r.onerror = () => res("");
            r.readAsDataURL(file);
          });
        }

        // 2. Background sync with mediaApi for CMS audit records (non-blocking)
        try {
          const uploadFormData = new FormData();
          uploadFormData.append("file", file);
          uploadFormData.append("folder", "products");
          uploadFormData.append("alt_text", formData.name || file.name);
          await mediaApi.upload(uploadFormData);
        } catch {
          // Ignore server disk errors - client persistent Data URL guarantees zero data loss
        }

        if (finalImageUrl) {
          successCount++;
          setFormData((prev) => ({
            ...prev,
            images: [
              ...prev.images,
              {
                url: finalImageUrl,
                alt_text: file.name,
                is_primary: prev.images.length === 0,
                sort_order: prev.images.length,
              },
            ],
          }));
        }
      }
      if (successCount > 0) {
        showFeedback(`🖼️ ${successCount} image(s) processed and attached successfully!`);
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      const errMsg = err.response?.data?.detail || err.message || "Failed to upload image.";
      alert(`Upload error: ${errMsg}`);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };
  const handleAutoGenerateSku = () => {
    if (!formData.name.trim()) {
      showFeedback("⚠️ Please enter a Product Title first.");
      return;
    }
    const catObj = categories.find((c: any) => c.id === formData.category_id);
    const { prefix, typeCode, categoryLabel } = classifyProduct(formData.name, catObj?.name || "");

    // Count how many products already have this prefix-type in existing list
    const existingWithPrefix = allProducts.filter((p: any) =>
      p.sku?.startsWith(`GEN-${prefix}-${typeCode}-`) && p.id !== formData.id
    );
    const nextSeq = existingWithPrefix.length + 1;
    const generatedSku = `GEN-${prefix}-${typeCode}-${nextSeq}`;

    setFormData((prev) => ({
      ...prev,
      sku: generatedSku,
    }));
    showFeedback(`⚡ Auto-Generated SKU: ${generatedSku} (${categoryLabel})`);
  };

  const handleAutoGenerateSeo = () => {
    if (!formData.name.trim()) {
      showFeedback("⚠️ Please enter a Product Title first.");
      return;
    }
    const catObj = categories.find((c: any) => c.id === formData.category_id);
    const seo = generateSeoContent(formData.name, catObj?.name || "", formData.short_description);

    setFormData((prev) => ({
      ...prev,
      meta_title: seo.meta_title,
      meta_description: seo.meta_description,
      short_description: prev.short_description || seo.short_description,
      tags: prev.tags || seo.tags,
    }));
    showFeedback("✨ Generated High-Ranking SEO Metadata & Tags!");
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
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold">Product Title *</label>
                        <button
                          type="button"
                          onClick={handleAutoGenerateSeo}
                          className="text-[11px] text-primary hover:underline flex items-center gap-1 font-semibold"
                          title="Generate SEO Title, Meta Description & Keywords"
                        >
                          ✨ Auto-Fill AI SEO
                        </button>
                      </div>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. ESP32-WROOM-32 Wi-Fi & Bluetooth Board"
                        required
                        className="text-sm rounded-xl"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold">SKU (Unique Code) *</label>
                        <button
                          type="button"
                          onClick={handleAutoGenerateSku}
                          className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                          title="Generate category-based SKU e.g. GEN-ESP-1-1"
                        >
                          ⚡ Auto-Generate SKU
                        </button>
                      </div>
                      <div className="relative">
                        <Input
                          value={formData.sku}
                          onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                          placeholder="e.g. GEN-ESP-1-1"
                          required
                          className="text-sm font-mono rounded-xl pr-20"
                        />
                        <button
                          type="button"
                          onClick={handleAutoGenerateSku}
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2 py-1 bg-muted hover:bg-muted/80 text-[10px] font-mono font-semibold rounded-md border text-muted-foreground"
                          title="Format and auto-assign SKU"
                        >
                          GEN-AUTO
                        </button>
                      </div>
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
                <div className="space-y-5">
                  {/* Smart Cost & Profit Margin Calculator Card */}
                  <div className="p-4 bg-gradient-to-br from-emerald-500/10 via-background to-blue-500/10 border border-emerald-500/20 rounded-2xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-3">
                      <div>
                        <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          <span>💰</span> Product Investment &amp; Profit Margin Calculator
                        </h4>
                        <p className="text-[11px] text-muted-foreground">
                          Enter actual product cost and desired profit percentage to calculate selling price automatically.
                        </p>
                      </div>
                      <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/30">
                        Live 2-Way Calculator
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* 1. Actual Cost Price (Investment) */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-semibold">Actual Purchase / Cost Price (₹) *</label>
                          <span className="text-[10px] text-muted-foreground font-medium">Investment</span>
                        </div>
                        <Input
                          type="number"
                          step="0.01"
                          value={formData.cost_price}
                          onChange={(e) => handleCostPriceChange(e.target.value)}
                          placeholder="e.g. 100.00"
                          className="text-sm font-semibold rounded-xl bg-background"
                        />
                      </div>

                      {/* 2. Margin Percentage */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-semibold">Target Profit Margin (%)</label>
                          <span className="text-[10px] font-bold text-emerald-500">+{marginPercentInput}%</span>
                        </div>
                        <div className="relative">
                          <Input
                            type="number"
                            step="0.1"
                            value={marginPercentInput}
                            onChange={(e) => handleMarginChange(e.target.value)}
                            placeholder="e.g. 30"
                            className="text-sm font-semibold rounded-xl bg-background pr-8"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-bold">%</span>
                        </div>
                      </div>

                      {/* 3. Final Selling Price */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-semibold">Customer Selling Price (₹) *</label>
                          <span className="text-[10px] text-primary font-bold">Store Price</span>
                        </div>
                        <Input
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => handleSellingPriceChange(e.target.value)}
                          placeholder="e.g. 130.00"
                          required
                          className="text-sm font-bold rounded-xl bg-background text-primary"
                        />
                      </div>
                    </div>

                    {/* Quick Margin Preset Chips */}
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      <span className="text-[11px] font-medium text-muted-foreground">Quick Margin Presets:</span>
                      {["15", "25", "35", "50", "75", "100"].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => handleMarginChange(preset)}
                          className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold transition-all border ${
                            marginPercentInput === preset
                              ? "gradient-bg text-white border-transparent shadow-sm"
                              : "bg-background text-muted-foreground hover:text-foreground hover:border-primary/50"
                          }`}
                        >
                          +{preset}%
                        </button>
                      ))}
                    </div>

                    {/* Profit Breakdown Metric Strip */}
                    {parseFloat(formData.cost_price || "0") > 0 && parseFloat(formData.price || "0") >= parseFloat(formData.cost_price || "0") && (
                      <div className="p-3 bg-background/80 rounded-xl border grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                          <span className="text-muted-foreground text-[10px] block">Unit Investment:</span>
                          <strong className="text-foreground text-sm">₹{parseFloat(formData.cost_price || "0").toFixed(2)}</strong>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-[10px] block">Unit Profit:</span>
                          <strong className="text-emerald-500 text-sm">+₹{(parseFloat(formData.price || "0") - parseFloat(formData.cost_price || "0")).toFixed(2)}</strong>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-[10px] block">Margin Return:</span>
                          <strong className="text-blue-500 text-sm">
                            {(((parseFloat(formData.price || "0") - parseFloat(formData.cost_price || "0")) / parseFloat(formData.cost_price || "1")) * 100).toFixed(1)}%
                          </strong>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-[10px] block">Batch ({formData.stock_quantity || 0} units) Profit:</span>
                          <strong className="text-emerald-600 dark:text-emerald-400 text-sm font-extrabold">
                            +₹{((parseFloat(formData.price || "0") - parseFloat(formData.cost_price || "0")) * (parseInt(formData.stock_quantity) || 0)).toLocaleString("en-IN")}
                          </strong>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* MRP & Stock Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-semibold block mb-1">Compare-at (Original MRP ₹)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.compare_at_price}
                        onChange={(e) => setFormData({ ...formData, compare_at_price: e.target.value })}
                        placeholder="e.g. 199.00 (optional discount)"
                        className="text-sm rounded-xl"
                      />
                    </div>

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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                    <div>
                      <label className="text-xs font-semibold block mb-1">Product Weight (kg)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.weight}
                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                        placeholder="0.25"
                        className="text-sm rounded-xl"
                      />
                    </div>
                  </div>

                  {parseFloat(formData.compare_at_price) > parseFloat(formData.price) && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 shrink-0" />
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
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`p-6 border-2 border-dashed rounded-2xl transition-all text-center flex flex-col items-center justify-center gap-3 ${
                      isDragging
                        ? "border-primary bg-primary/10 scale-[1.01]"
                        : "border-border bg-card/40 hover:bg-card/70"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {uploadingImage ? (
                        <RefreshCw className="w-6 h-6 animate-spin" />
                      ) : (
                        <Upload className="w-6 h-6" />
                      )}
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-foreground mb-0.5">
                        {uploadingImage ? "Uploading & Optimizing Images..." : "Upload High-Resolution Photos"}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Drag &amp; drop images here, or click the button below to browse from your device.
                      </p>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      disabled={uploadingImage}
                      onClick={() => fileInputRef.current?.click()}
                      className="gradient-bg text-white rounded-xl text-xs flex items-center gap-2 shadow-md hover:shadow-lg px-5 py-2"
                    >
                      <Upload className="w-4 h-4" />
                      {uploadingImage ? "Uploading..." : "Browse & Upload Images"}
                    </Button>
                  </div>

                  {/* Add via direct URL or public path */}
                  {/* Smart Suggested Image based on Product Name */}
                  {formData.name.trim() && (
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-background border shrink-0">
                          <img
                            src={getProductFallbackImage(formData.name)}
                            alt="Smart suggestion"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-foreground">Smart Auto-Matched Photo</span>
                            <Badge variant="outline" className="text-[10px] text-primary border-primary/30">Recommended</Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            Matching photo identified based on &quot;{formData.name}&quot;.
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          const suggestedUrl = getProductFallbackImage(formData.name);
                          if (!formData.images.some(img => img.url === suggestedUrl)) {
                            setFormData(prev => ({
                              ...prev,
                              images: [
                                {
                                  url: suggestedUrl,
                                  alt_text: prev.name,
                                  is_primary: prev.images.length === 0,
                                  sort_order: prev.images.length,
                                },
                                ...prev.images,
                              ],
                            }));
                            showFeedback("✨ Attached smart matching photo!");
                          } else {
                            showFeedback("ℹ️ Photo already attached.");
                          }
                        }}
                        className="gradient-bg text-white rounded-xl text-xs shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" /> Use Suggested Photo
                      </Button>
                    </div>
                  )}

                  {/* Add via direct URL or public path */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold block">Or Add Image URL / Relative Path</label>
                    <div className="flex gap-2">
                      <Input
                        value={imageUrlInput}
                        onChange={(e) => setImageUrlInput(e.target.value)}
                        placeholder="e.g. /products/battery-holder-18650.jpg, /products/rechargeable-18650-battery.jpg, or https://..."
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

                  {/* Quick Component Photo Library Picker */}
                  <div className="p-4 bg-muted/20 border rounded-2xl space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold text-xs flex items-center gap-1.5">
                        <span>⚡</span> Pick from Standard Component Library
                      </h4>
                      <span className="text-[10px] text-muted-foreground">Click any photo to attach</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5 max-h-56 overflow-y-auto pr-1">
                      {[
                        { name: "2200mAh 3S LiPo", url: "/products/lipo-battery-2200mah-3s.jpg" },
                        { name: "B3 LiPo Charger", url: "/products/lipo-battery-b3-charger.jpg" },
                        { name: "Auto Wire Stripper", url: "/products/automatic-wire-stripper.jpg" },
                        { name: "DT830D Multimeter", url: "/products/dt830d-digital-multimeter.jpg" },
                        { name: "18650 Battery", url: "/products/rechargeable-18650-battery.jpg" },
                        { name: "Battery Holder", url: "/products/battery-holder-18650.jpg" },
                        { name: "7.4V LiPo Battery", url: "/products/lithium-battery-74v.jpg" },
                        { name: "Pink Lithium Cell", url: "/products/pink-18650-lithium-cells.jpg" },
                        { name: "10K Resistors", url: "/products/10k-ohm-resistors.jpg" },
                        { name: "220R Resistors", url: "/products/220-ohm-resistors.jpg" },
                        { name: "Resistor Kit", url: "/products/resistor-kit-pack.jpg" },
                        { name: "SG90 Servo Motor", url: "/products/sg90-servo-motor.jpg" },
                        { name: "BO Gear Motor", url: "/products/dc-gear-bo-motor-wheel.jpg" },
                        { name: "5V Relay Module", url: "/products/relay-module-5v.jpg" },
                        { name: "HC-SR04 Sonar", url: "/products/hc-sr04-ultrasonic.jpg" },
                        { name: "DHT11 Temp/Hum", url: "/products/dht11-sensor.jpg" },
                        { name: "LM35 Temp Sensor", url: "/products/lm35-temperature-sensor.jpg" },
                        { name: "MQ-2 Gas Sensor", url: "/products/mq2-gas-sensor.jpg" },
                        { name: "PIR Motion Sensor", url: "/products/pir-motion-sensor.jpg" },
                        { name: "LDR Light Sensor", url: "/products/ldr-light-sensor.jpg" },
                        { name: "Soil Moisture", url: "/products/soil-moisture-sensor.jpg" },
                        { name: "Raindrops Sensor", url: "/products/rain-sensor-module.jpg" },
                        { name: "Flame Detector", url: "/products/flame-detection-sensor.jpg" },
                        { name: "HC-05 Bluetooth", url: "/products/hc05-bluetooth-module.jpg" },
                        { name: "RC522 RFID Kit", url: "/products/rfid-rc522-kit.jpg" },
                        { name: "Sound Sensor", url: "/products/sound-detection-sensor.jpg" },
                        { name: "MB-102 Breadboard", url: "/products/mb102-breadboard.jpg" },
                        { name: "Jumper Wires M-M", url: "/products/jumper-wire-male-male.jpg" },
                        { name: "Jumper Wires M-F", url: "/products/jumper-wire-male-to-female.jpg" },
                        { name: "USB Cable", url: "/products/usb-programming-cable.jpg" },
                        { name: "OLED Display 0.96", url: "/products/oled-display-096.jpg" },
                        { name: "Push Button", url: "/products/push-button-module.jpg" },
                        { name: "RGB LED 5mm", url: "/products/rgb-led-5mm.jpg" },
                        { name: "Dot Matrix PCB", url: "/products/dot-matrix-pcb.jpg" },
                        { name: "Audio Amplifier", url: "/products/pam8403-amplifier.jpg" },
                        { name: "Multimeter", url: "/products/digital-multimeter.jpg" },
                        { name: "Soldering Kit", url: "/products/soldering-iron-kit.jpg" },
                        { name: "Hot Glue Gun", url: "/products/hot-glue-gun.jpg" },
                        { name: "Long Nose Plier", url: "/products/long-nose-plier.jpg" },
                        { name: "Wire Stripper", url: "/products/wire-stripper-tool.jpg" },
                        { name: "Precision Kit", url: "/products/precision-screwdriver-kit.jpg" },
                        { name: "Project Box", url: "/products/plastic-project-box.jpg" },
                        { name: "Insulation Tape", url: "/products/insulation-tape.jpg" },
                        { name: "Zip Ties 100P", url: "/products/cable-zip-ties.jpg" },
                        { name: "ESP32 Board", url: "/products/esp32-development-board.jpg" },
                        { name: "Arduino UNO R3", url: "/products/arduino-uno-r3.jpg" },
                        { name: "Robotic Arm", url: "/products/robotic-arm-kit.jpg" },
                        { name: "Spider Robot", url: "/products/spider-robot-kit.jpg" },
                        { name: "OTTO Robot", url: "/products/otto-bot-kit.jpg" },
                        { name: "6WD Robot Chassis", url: "/products/6wheel-robot-kit.jpg" },
                        { name: "3D Printer STEM", url: "/products/3d-printer-stem.jpg" },
                      ].map((item) => (
                        <button
                          key={item.url}
                          type="button"
                          onClick={() => {
                            if (!formData.images.some(img => img.url === item.url)) {
                              setFormData(prev => ({
                                ...prev,
                                images: [
                                  ...prev.images,
                                  {
                                    url: item.url,
                                    alt_text: prev.name || item.name,
                                    is_primary: prev.images.length === 0,
                                    sort_order: prev.images.length,
                                  },
                                ],
                              }));
                              showFeedback(`✅ Attached ${item.name}!`);
                            } else {
                              showFeedback("ℹ️ Image already added.");
                            }
                          }}
                          className="p-1.5 bg-background hover:bg-primary/10 border hover:border-primary/50 rounded-xl flex flex-col items-center gap-1 transition-all text-center group"
                        >
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                            <img src={item.url} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                          </div>
                          <span className="text-[10px] text-foreground line-clamp-1 font-medium">{item.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Image Grid / Gallery */}
                  <div>
                    <h4 className="font-semibold text-xs mb-2">Attached Images ({formData.images.length})</h4>
                    {formData.images.length === 0 ? (
                      <div className="text-center py-8 border border-dashed rounded-xl text-muted-foreground text-xs">
                        <ImageIcon className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
                        No custom images attached yet. The product will automatically use the smart component photo.
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
                                  (e.currentTarget as HTMLImageElement).src = getProductFallbackImage(formData.name);
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
                <div className="space-y-5">
                  {/* AI SEO Generator Banner Card */}
                  <div className="p-4 bg-gradient-to-r from-primary/10 via-background to-secondary/10 border border-primary/20 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base">🚀</span>
                        <h4 className="text-xs font-bold text-foreground">Intelligent Search Engine Optimization</h4>
                        <Badge variant="outline" className="text-[10px] text-primary border-primary/30">Google Rank Boost</Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Automatically generate meta tags, high-converting descriptions, and search keywords for top rankings.
                      </p>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAutoGenerateSeo}
                      className="gradient-bg text-white rounded-xl text-xs flex items-center gap-1.5 shadow-sm hover:shadow shrink-0"
                    >
                      <span>✨</span> Generate AI SEO Metadata
                    </Button>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold">SEO Meta Title</label>
                      <span className={`text-[10px] font-mono ${formData.meta_title.length > 65 ? "text-amber-500 font-bold" : "text-muted-foreground"}`}>
                        {formData.meta_title.length} / 65 chars (Optimal: 50-60)
                      </span>
                    </div>
                    <Input
                      value={formData.meta_title}
                      onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                      placeholder="e.g. Buy ESP32 Development Board | Best Price in India - GenBots"
                      className="text-sm rounded-xl"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold">SEO Meta Description</label>
                      <span className={`text-[10px] font-mono ${formData.meta_description.length > 160 ? "text-amber-500 font-bold" : "text-muted-foreground"}`}>
                        {formData.meta_description.length} / 160 chars (Optimal: 140-155)
                      </span>
                    </div>
                    <Textarea
                      value={formData.meta_description}
                      onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                      rows={3}
                      placeholder="Buy original ESP32 board online in India at GenBots.in. Genuine tested quality, fast shipping & developer guides for IoT & robotics..."
                      className="text-sm rounded-xl resize-y"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold block mb-1">Search Keywords &amp; Tags (Comma separated)</label>
                    <Input
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="esp32, wifi, bluetooth, iot, robotics, arduino, stem-education, india"
                      className="text-sm rounded-xl"
                    />
                  </div>

                  {/* Google Search Live Preview Card */}
                  <div className="p-4 bg-muted/20 border rounded-2xl space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <span>🔍</span> Live Google Search SERP Preview
                    </span>
                    <div className="bg-background p-3.5 rounded-xl border space-y-1">
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono truncate">
                        https://genbots.in/store/{formData.slug || (formData.name ? formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") : "product-slug")}
                      </div>
                      <div className="text-sm font-semibold text-blue-600 dark:text-blue-400 line-clamp-1 hover:underline cursor-pointer">
                        {formData.meta_title || `${formData.name || "Product Name"} | Buy Online India - GenBots`}
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {formData.meta_description || "Buy original robotics, IoT & STEM hardware online at best prices with fast delivery across India on GenBots.in."}
                      </div>
                    </div>
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
                  <th className="py-3 px-4">Cost (Invest)</th>
                  <th className="py-3 px-4">Selling Price</th>
                  <th className="py-3 px-4">Margin %</th>
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

                  const sellingPrice = parseFloat(product.price?.toString() || "0");
                  const costPrice = parseFloat(
                    product.cost_price != null
                      ? product.cost_price.toString()
                      : (sellingPrice * 0.70).toFixed(2)
                  );
                  const profitPerUnit = Math.max(0, sellingPrice - costPrice);
                  const marginPct = costPrice > 0 ? Math.round(((sellingPrice - costPrice) / costPrice) * 100) : 0;

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
                                (e.currentTarget as HTMLImageElement).src = getProductFallbackImage(product);
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

                      {/* Cost / Invest Price */}
                      <td className="py-3 px-4">
                        <span className="font-medium text-muted-foreground">
                          ₹{costPrice.toLocaleString("en-IN")}
                        </span>
                      </td>

                      {/* Selling Price */}
                      <td className="py-3 px-4 font-bold text-foreground">
                        ₹{sellingPrice.toLocaleString("en-IN")}
                        {product.compare_at_price && (
                          <span className="block text-[10px] text-muted-foreground line-through font-normal">
                            ₹{parseFloat(product.compare_at_price).toLocaleString("en-IN")}
                          </span>
                        )}
                      </td>

                      {/* Margin % & Profit */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-0.5">
                          <Badge variant="outline" className={`text-[10px] w-fit font-bold ${
                            marginPct >= 30 
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" 
                              : marginPct > 0 
                              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30" 
                              : "bg-muted text-muted-foreground"
                          }`}>
                            +{marginPct}%
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            +₹{profitPerUnit.toLocaleString("en-IN")} profit
                          </span>
                        </div>
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
