"use client";

import { useState, useEffect, useDeferredValue } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Search, SlidersHorizontal, ArrowUpDown, X, Star, AlertCircle, ShoppingCart, Heart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/animations/ScrollAnimations";
import { productsApi, cartApi, wishlistApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { useCartStore } from "@/store/cart";
import Link from "next/link";

export default function StorePage() {
  const { token } = useAuthStore();
  const { openCart } = useCartStore();

  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [maxPrice, setMaxPrice] = useState(100000);
  const [sortBy, setSortBy] = useState("featured");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  // Check URL params on initial load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get("category");
      if (cat) setSelectedCategory(cat);
    }
  }, []);

  // Fetch products from API
  const { data: apiProducts, isLoading } = useQuery({
    queryKey: ["storeProducts"],
    queryFn: async () => {
      const res = await productsApi.list({ page_size: 100 });
      return res.data?.items || res.data || [];
    },
    staleTime: 30000,
  });

  const products: any[] = apiProducts || [];

  // Extract unique categories and brands from data
  const categories = [
    { name: "All Categories", slug: "all", icon: "🌐" },
    ...Array.from(new Set(products.map((p: any) => p.category?.slug).filter(Boolean))).map(
      (slug) => {
        const cat = products.find((p: any) => p.category?.slug === slug)?.category;
        return { name: cat?.name || slug, slug: slug as string, icon: "📦" };
      }
    ),
  ];

  const brands = ["All", ...Array.from(new Set(products.map((p: any) => p.brand?.name).filter(Boolean)))];

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: (productId: string) => cartApi.addItem({ product_id: productId, quantity: 1 }),
    onSuccess: (_, productId) => {
      setAddedIds((prev) => new Set(prev).add(productId));
      setTimeout(() => {
        setAddedIds((prev) => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
      }, 2000);
    },
    onError: (err: any) => {
      alert(err.response?.data?.detail || "Failed to add to cart. Please log in.");
    },
  });

  // Filter and Sort logic
  const filteredProducts = products
    .filter((product: any) => {
      const matchesSearch =
        product.name?.toLowerCase().includes(deferredSearch.toLowerCase()) ||
        product.description?.toLowerCase().includes(deferredSearch.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || product.category?.slug === selectedCategory;
      const matchesBrand =
        selectedBrand === "All" || product.brand?.name === selectedBrand;
      const matchesPrice = parseFloat(product.price) <= maxPrice;
      return matchesSearch && matchesCategory && matchesBrand && matchesPrice;
    })
    .sort((a: any, b: any) => {
      if (sortBy === "price-low") return parseFloat(a.price) - parseFloat(b.price);
      if (sortBy === "price-high") return parseFloat(b.price) - parseFloat(a.price);
      if (sortBy === "rating") return (b.avg_rating || 0) - (a.avg_rating || 0);
      return 0;
    });

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("all");
    setSelectedBrand("All");
    setMaxPrice(100000);
    setSortBy("featured");
  };

  const getProductImage = (product: any) => {
    if (product.images && product.images.length > 0) return product.images[0].url;
    return null;
  };

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16 min-h-screen bg-background" id="main-content">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <ScrollReveal>
            <div className="mb-10 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Our <span className="gradient-text">Store</span>
              </h1>
              <p className="text-muted-foreground">
                Premium IoT, Robotics &amp; AI products for every maker
              </p>
            </div>
          </ScrollReveal>

          {/* Top Control Bar */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8 bg-card border rounded-2xl p-4">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="pl-9 rounded-xl h-11"
                aria-label="Search products"
              />
            </div>

            <div className="flex w-full md:w-auto gap-3 items-center justify-between md:justify-end">
              <Button
                variant="outline"
                className="rounded-xl h-11 lg:hidden flex gap-2"
                onClick={() => setShowMobileFilters(true)}
              >
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </Button>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <ArrowUpDown className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-background border rounded-xl px-3 py-2 text-sm h-11 w-full md:w-48 outline-none focus:ring-2 focus:ring-primary/20"
                  aria-label="Sort products"
                >
                  <option value="featured">Sort by: Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-8">
            {/* Sidebar Filters (Desktop) */}
            <aside className="hidden lg:block w-64 shrink-0 space-y-6" aria-label="Filters">
              <div className="glass-card p-6 space-y-6 sticky top-24">
                <div className="flex justify-between items-center">
                  <h2 className="font-bold text-lg">Filters</h2>
                  <button onClick={clearFilters} className="text-xs text-primary hover:underline">
                    Reset All
                  </button>
                </div>

                {/* Categories */}
                <div>
                  <h3 className="font-semibold text-sm mb-3">Category</h3>
                  <div className="space-y-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.slug}
                        onClick={() => setSelectedCategory(cat.slug)}
                        className={`flex items-center justify-between w-full text-left text-sm py-1.5 px-2 rounded-lg transition-colors ${
                          selectedCategory === cat.slug
                            ? "bg-primary/10 text-primary font-medium"
                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span aria-hidden="true">{cat.icon}</span> {cat.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Brands */}
                <div>
                  <h3 className="font-semibold text-sm mb-3">Brand</h3>
                  <div className="space-y-2">
                    {brands.map((b) => (
                      <button
                        key={b}
                        onClick={() => setSelectedBrand(b)}
                        className={`flex items-center justify-between w-full text-left text-sm py-1.5 px-2 rounded-lg transition-colors ${
                          selectedBrand === b
                            ? "bg-primary/10 text-primary font-medium"
                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <span>{b}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-sm">Max Price</h3>
                    <span className="text-sm font-bold text-primary">₹{maxPrice.toLocaleString("en-IN")}</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="100000"
                    step="500"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                    className="w-full accent-primary"
                    aria-label="Max price range slider"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>₹500</span>
                    <span>₹1,00,000</span>
                  </div>
                </div>
              </div>
            </aside>

            {/* Product Grid Area */}
            <div className="flex-1">
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredProducts.length} of {products.length} products
                </p>
                {selectedCategory !== "all" || selectedBrand !== "All" || search || maxPrice < 100000 ? (
                  <Badge variant="secondary" className="flex gap-1 items-center rounded-full px-3 py-1">
                    Filters Active
                    <X className="w-3 h-3 cursor-pointer ml-1 text-muted-foreground hover:text-foreground" onClick={clearFilters} />
                  </Badge>
                ) : null}
              </div>

              {isLoading ? (
                <div className="flex justify-center py-20">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product: any) => (
                    <div
                      key={product.id}
                      className="glass-card group hover:glow-sm transition-all duration-300 hover:-translate-y-2 overflow-hidden flex flex-col"
                    >
                      <Link href={`/store/${product.slug}`}>
                        <div className="h-48 bg-muted flex items-center justify-center relative overflow-hidden">
                          {getProductImage(product) ? (
                            <img
                              src={getProductImage(product)}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                            />
                          ) : (
                            <span className="text-4xl">📦</span>
                          )}
                          {product.is_featured && (
                            <span className="absolute top-3 left-3 text-xs font-medium px-2.5 py-1 rounded-md gradient-bg text-white shadow-lg">
                              Featured
                            </span>
                          )}
                        </div>
                      </Link>
                      <div className="p-5 flex-1 flex flex-col">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                          {product.brand?.name || "GenBots"}
                        </span>
                        <Link href={`/store/${product.slug}`}>
                          <h3 className="font-semibold text-sm mb-2 group-hover:text-primary transition-colors line-clamp-2">
                            {product.name}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-1 mb-3 mt-auto">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" aria-hidden="true" />
                          <span className="text-sm font-medium">{product.avg_rating || "0.0"}</span>
                          <span className="text-xs text-muted-foreground">({product.review_count || 0})</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold gradient-text">
                              ₹{parseFloat(product.price).toLocaleString("en-IN")}
                            </span>
                            {product.compare_at_price && (
                              <span className="text-xs text-muted-foreground line-through">
                                ₹{parseFloat(product.compare_at_price).toLocaleString("en-IN")}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            className="flex-1 gradient-bg text-white rounded-xl text-xs h-9"
                            onClick={(e) => {
                              e.preventDefault();
                              if (!token) {
                                window.location.href = "/auth/login";
                                return;
                              }
                              addToCartMutation.mutate(product.id);
                            }}
                            disabled={addToCartMutation.isPending || product.stock_quantity <= 0}
                          >
                            {addedIds.has(product.id) ? (
                              <><Check className="w-3 h-3 mr-1" /> Added</>
                            ) : product.stock_quantity <= 0 ? (
                              "Out of Stock"
                            ) : (
                              <><ShoppingCart className="w-3 h-3 mr-1" /> Add to Cart</>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed border-border p-8">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No products found</h3>
                  <p className="text-muted-foreground mb-6">
                    We couldn&apos;t find any products matching your active filters.
                  </p>
                  <Button className="gradient-bg text-white rounded-xl" onClick={clearFilters}>
                    Clear All Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Filters Drawer / Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
          <div className="relative w-80 max-w-full bg-background h-full p-6 shadow-2xl overflow-y-auto flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-lg">Filters</h2>
              <button onClick={() => setShowMobileFilters(false)} aria-label="Close filters">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6 flex-1">
              {/* Category */}
              <div>
                <h3 className="font-semibold text-sm mb-3">Category</h3>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.slug}
                      onClick={() => {
                        setSelectedCategory(cat.slug);
                        setShowMobileFilters(false);
                      }}
                      className={`flex items-center justify-between w-full text-left text-sm py-2 px-3 rounded-lg transition-colors ${
                        selectedCategory === cat.slug
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{cat.icon}</span> {cat.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand */}
              <div>
                <h3 className="font-semibold text-sm mb-3">Brand</h3>
                <div className="space-y-2">
                  {brands.map((b) => (
                    <button
                      key={b}
                      onClick={() => {
                        setSelectedBrand(b);
                        setShowMobileFilters(false);
                      }}
                      className={`flex items-center justify-between w-full text-left text-sm py-2 px-3 rounded-lg transition-colors ${
                        selectedBrand === b
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span>{b}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-sm">Max Price</h3>
                  <span className="text-sm font-bold text-primary">₹{maxPrice.toLocaleString("en-IN")}</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="100000"
                  step="500"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                  className="w-full accent-primary"
                  aria-label="Max price range slider"
                />
              </div>
            </div>

            <div className="border-t pt-4 mt-6 flex gap-3">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={clearFilters}>
                Reset
              </Button>
              <Button className="gradient-bg text-white flex-1 rounded-xl" onClick={() => setShowMobileFilters(false)}>
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
