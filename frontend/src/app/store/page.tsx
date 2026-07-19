"use client";

import { useState, useEffect, useDeferredValue } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { productsData } from "@/lib/data";
import { Search, SlidersHorizontal, ArrowUpDown, X, Star, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/animations/ScrollAnimations";
import Link from "next/link";

const categories = [
  { name: "All Categories", slug: "all", icon: "🌐" },
  { name: "IoT Sensors", slug: "iot-sensors", icon: "🔌", count: 1 },
  { name: "Arduino Products", slug: "arduino-products", icon: "🔧", count: 1 },
  { name: "ESP32 Products", slug: "esp32-products", icon: "📡", count: 1 },
  { name: "Robotics Kits", slug: "robotics-kits", icon: "🤖", count: 1 },
];

const brands = ["All", "GenBots", "Arduino", "Espressif"];

export default function StorePage() {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [maxPrice, setMaxPrice] = useState(8000);
  const [sortBy, setSortBy] = useState("featured");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Check URL params on initial load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get("category");
      if (cat) {
        setSelectedCategory(cat);
      }
    }
  }, []);

  // Filter and Sort logic
  const filteredProducts = productsData
    .filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(deferredSearch.toLowerCase()) ||
        product.description.toLowerCase().includes(deferredSearch.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || product.category === selectedCategory;
      const matchesBrand =
        selectedBrand === "All" || product.brand === selectedBrand;
      const matchesPrice = product.price <= maxPrice;

      return matchesSearch && matchesCategory && matchesBrand && matchesPrice;
    })
    .sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      return 0; // Featured/Default
    });

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("all");
    setSelectedBrand("All");
    setMaxPrice(8000);
    setSortBy("featured");
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
                    <span className="text-sm font-bold text-primary">₹{maxPrice}</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="8000"
                    step="100"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                    className="w-full accent-primary"
                    aria-label="Max price range slider"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>₹500</span>
                    <span>₹8,000</span>
                  </div>
                </div>
              </div>
            </aside>

            {/* Product Grid Area */}
            <div className="flex-1">
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredProducts.length} of {productsData.length} products
                </p>
                {selectedCategory !== "all" || selectedBrand !== "All" || search || maxPrice < 8000 ? (
                  <Badge variant="secondary" className="flex gap-1 items-center rounded-full px-3 py-1">
                    Filters Active
                    <X className="w-3 h-3 cursor-pointer ml-1 text-muted-foreground hover:text-foreground" onClick={clearFilters} />
                  </Badge>
                ) : null}
              </div>

              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <Link
                      key={product.slug}
                      href={`/store/${product.slug}`}
                      className="glass-card group hover:glow-sm transition-all duration-300 hover:-translate-y-2 overflow-hidden flex flex-col"
                    >
                      <div className="h-48 bg-muted flex items-center justify-center relative overflow-hidden">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        {product.badge && (
                          <span className="absolute top-3 left-3 text-xs font-medium px-2.5 py-1 rounded-md gradient-bg text-white shadow-lg">
                            {product.badge}
                          </span>
                        )}
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                          {product.brand}
                        </span>
                        <h3 className="font-semibold text-sm mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-1 mb-3 mt-auto">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" aria-hidden="true" />
                          <span className="text-sm font-medium">{product.rating}</span>
                          <span className="text-xs text-muted-foreground">({product.reviewsCount})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold gradient-text">
                            ₹{product.price.toLocaleString("en-IN")}
                          </span>
                          {product.originalPrice && (
                            <span className="text-xs text-muted-foreground line-through">
                              ₹{product.originalPrice.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
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
                  <span className="text-sm font-bold text-primary">₹{maxPrice}</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="8000"
                  step="100"
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
