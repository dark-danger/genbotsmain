"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { productsApi } from "@/lib/api";
import { getProductImage, getProductFallbackImage } from "@/lib/utils";
import { INNOVATION_LAB_65_PRODUCTS } from "@/lib/data";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function ProductsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const { data: featuredProducts, isLoading } = useQuery({
    queryKey: ["homepageFeaturedProducts"],
    queryFn: async () => {
      try {
        const res = await productsApi.featured(8);
        const items = res.data;
        if (Array.isArray(items)) {
          return items.filter((p: any) => p.status === "active" || p.status === undefined);
        }
        const fallbackRes = await productsApi.list({ page_size: 8, status: "active" });
        const fallbackItems = fallbackRes.data?.items || fallbackRes.data;
        if (Array.isArray(fallbackItems)) {
          return fallbackItems.filter((p: any) => p.status === "active" || p.status === undefined);
        }
        return INNOVATION_LAB_65_PRODUCTS.filter(p => p.status === "active").slice(0, 8);
      } catch {
        return INNOVATION_LAB_65_PRODUCTS.filter(p => p.status === "active").slice(0, 8);
      }
    },
    staleTime: 5000,
  });

  // GSAP stagger animation for product cards
  useEffect(() => {
    if (!gridRef.current || !featuredProducts || featuredProducts.length === 0) return;
    const cards = gridRef.current.children;
    const tween = gsap.fromTo(
      cards,
      { opacity: 0, y: 40, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: gridRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      }
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [featuredProducts]);

  return (
    <section ref={ref} className="py-24 relative" aria-labelledby="products-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <Badge variant="outline" className="mb-4 rounded-full px-4 py-1">🔥 Trending Products</Badge>
          <h2 id="products-heading" className="text-3xl md:text-4xl font-bold mb-4">
            Featured <span className="gradient-text">Products</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Premium IoT, robotics, and AI products trusted by 10,000+ makers and educators.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-72 rounded-2xl bg-muted/40 animate-pulse" />
            ))}
          </div>
        ) : (
          <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts && featuredProducts.length > 0 ? (
              featuredProducts.map((product: Record<string, any>) => {
                const imgUrl = getProductImage(product);
                return (
                  <Link
                    key={product.id || product.slug}
                    href={`/store/${product.slug}`}
                    className="glass-card group hover:glow-sm transition-all duration-300 hover:-translate-y-2 overflow-hidden flex flex-col"
                  >
                    <div className="h-48 bg-muted flex items-center justify-center relative overflow-hidden">
                      <img
                        src={imgUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                        width={400}
                        height={300}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).onerror = null;
                          (e.currentTarget as HTMLImageElement).src = getProductFallbackImage(product);
                        }}
                      />
                      {product.is_featured && (
                        <span className="absolute top-3 left-3 text-xs font-medium px-2.5 py-1 rounded-md gradient-bg text-white shadow-lg">
                          Featured
                        </span>
                      )}
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                        <span className="text-white text-xs font-medium">View Details →</span>
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="font-semibold text-sm mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-1 mb-3 mt-auto">
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" aria-hidden="true" />
                        <span className="text-sm font-medium">{product.avg_rating || "5.0"}</span>
                        <span className="text-xs text-muted-foreground">({product.review_count || 0})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold gradient-text">₹{parseFloat(product.price || "0").toLocaleString("en-IN")}</span>
                        {product.compare_at_price && (
                          <span className="text-xs text-muted-foreground line-through">₹{parseFloat(product.compare_at_price).toLocaleString("en-IN")}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="col-span-4 text-center py-12 text-muted-foreground">
                No featured products currently available.
              </div>
            )}
          </div>
        )}

        <div className="text-center mt-10">
          <Link href="/store">
            <Button variant="outline" className="rounded-xl group">
              View All Products
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
