"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, Star, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const products = [
  { name: "GenBots IoT Starter Kit", price: "₹2,499", originalPrice: "₹3,499", rating: 4.8, reviews: 124, badge: "Bestseller", category: "IoT Sensors", slug: "genbots-iot-starter-kit", gradient: "from-emerald-500/20 to-cyan-500/10" },
  { name: "Arduino Uno R4 WiFi", price: "₹1,899", originalPrice: "₹2,199", rating: 4.9, reviews: 89, badge: "New", category: "Arduino", slug: "arduino-uno-r4-wifi", gradient: "from-cyan-500/20 to-emerald-500/10" },
  { name: "ESP32-S3 DevKit", price: "₹799", rating: 4.7, reviews: 203, category: "ESP32", slug: "esp32-s3-devkit", gradient: "from-emerald-400/20 to-emerald-600/10" },
  { name: "Robotics Pro Kit", price: "₹4,999", originalPrice: "₹6,999", rating: 4.9, reviews: 56, badge: "Hot", category: "Robotics", slug: "genbots-robotics-pro-kit", gradient: "from-cyan-400/20 to-emerald-400/10" },
  { name: "STEM Explorer Kit", price: "₹1,999", rating: 4.6, reviews: 167, category: "STEM", slug: "stem-explorer-kit", gradient: "from-emerald-500/20 to-cyan-400/10" },
  { name: "AI Vision Module", price: "₹3,499", rating: 4.8, reviews: 42, badge: "New", category: "AI", slug: "ai-vision-module", gradient: "from-cyan-500/20 to-cyan-600/10" },
  { name: "Smart Home Hub", price: "₹5,999", originalPrice: "₹7,499", rating: 4.7, reviews: 78, badge: "Sale", category: "Automation", slug: "smart-home-hub", gradient: "from-emerald-600/20 to-cyan-500/10" },
  { name: "Sensor Mega Pack", price: "₹3,999", rating: 4.5, reviews: 134, category: "Components", slug: "sensor-mega-pack", gradient: "from-cyan-400/20 to-emerald-500/10" },
];

export function ProductsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section ref={ref} className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} className="text-center mb-14">
          <Badge variant="outline" className="mb-4 rounded-full px-4 py-1">Our Products</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured <span className="gradient-text">Products</span></h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Discover our premium IoT, robotics, and AI products designed for makers, students, and enterprises.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, i) => (
            <motion.div
              key={product.slug}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.05, duration: 0.4 }}
            >
              <Link href={`/store/${product.slug}`}>
                <div className={`glass-card group cursor-pointer hover:glow-sm transition-all duration-300 hover:-translate-y-1 overflow-hidden`}>
                  <div className={`h-48 bg-gradient-to-br ${product.gradient} flex items-center justify-center relative`}>
                    <div className="text-6xl opacity-60 group-hover:scale-110 transition-transform">🔌</div>
                    {product.badge && (
                      <Badge className="absolute top-3 left-3 gradient-bg text-white border-0 text-xs">{product.badge}</Badge>
                    )}
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
                    <h3 className="font-semibold text-sm mb-2 group-hover:text-primary transition-colors line-clamp-2">{product.name}</h3>
                    <div className="flex items-center gap-1 mb-3">
                      <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                      <span className="text-sm font-medium">{product.rating}</span>
                      <span className="text-xs text-muted-foreground">({product.reviews})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold gradient-text">{product.price}</span>
                        {product.originalPrice && (
                          <span className="text-xs text-muted-foreground line-through">{product.originalPrice}</span>
                        )}
                      </div>
                      <Button size="icon" variant="ghost" className="w-8 h-8 rounded-lg hover:bg-primary/10 hover:text-primary">
                        <ShoppingCart className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/store">
            <Button variant="outline" size="lg" className="rounded-xl px-8">
              View All Products <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
