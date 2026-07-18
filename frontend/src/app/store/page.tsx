import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Store",
  description: "Shop premium IoT sensors, Arduino, ESP32, robotics kits, STEM products and more at GenBots.",
};

const categories = [
  { name: "IoT Sensors", slug: "iot-sensors", icon: "🔌", count: 45 },
  { name: "Arduino Products", slug: "arduino-products", icon: "🔧", count: 32 },
  { name: "ESP32 Products", slug: "esp32-products", icon: "📡", count: 28 },
  { name: "Robotics Kits", slug: "robotics-kits", icon: "🤖", count: 18 },
  { name: "STEM Kits", slug: "stem-kits", icon: "🧪", count: 24 },
  { name: "AI Learning Kits", slug: "ai-learning-kits", icon: "🧠", count: 12 },
  { name: "Electronics", slug: "electronics-components", icon: "⚡", count: 120 },
  { name: "Home Automation", slug: "home-automation", icon: "🏠", count: 15 },
];

const products = [
  { name: "GenBots IoT Starter Kit", price: "₹2,499", original: "₹3,499", rating: 4.8, reviews: 124, badge: "Bestseller", slug: "genbots-iot-starter-kit" },
  { name: "Arduino Uno R4 WiFi", price: "₹1,899", original: "₹2,199", rating: 4.9, reviews: 89, badge: "New", slug: "arduino-uno-r4-wifi" },
  { name: "ESP32-S3 DevKit", price: "₹799", rating: 4.7, reviews: 203, slug: "esp32-s3-devkit" },
  { name: "Robotics Pro Kit", price: "₹4,999", original: "₹6,999", rating: 4.9, reviews: 56, badge: "Hot", slug: "genbots-robotics-pro-kit" },
  { name: "STEM Explorer Kit", price: "₹1,999", rating: 4.6, reviews: 167, slug: "stem-explorer-kit" },
  { name: "AI Vision Module", price: "₹3,499", rating: 4.8, reviews: 42, badge: "New", slug: "ai-vision-module" },
  { name: "Smart Home Hub", price: "₹5,999", original: "₹7,499", rating: 4.7, reviews: 78, badge: "Sale", slug: "smart-home-hub" },
  { name: "Sensor Mega Pack", price: "₹3,999", rating: 4.5, reviews: 134, slug: "sensor-mega-pack" },
];

export default function StorePage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Our <span className="gradient-text">Store</span></h1>
            <p className="text-muted-foreground">Premium IoT, Robotics & AI products for every maker</p>
          </div>

          {/* Categories */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-12">
            {categories.map((cat) => (
              <a key={cat.slug} href={`/store?category=${cat.slug}`} className="glass-card p-4 text-center hover:glow-sm transition-all hover:-translate-y-0.5 cursor-pointer group">
                <span className="text-2xl block mb-1">{cat.icon}</span>
                <span className="text-xs font-medium group-hover:text-primary transition-colors">{cat.name}</span>
                <span className="text-[10px] text-muted-foreground block">{cat.count} items</span>
              </a>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <a key={product.slug} href={`/store/${product.slug}`} className="glass-card group hover:glow-sm transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 flex items-center justify-center relative">
                  <div className="text-6xl opacity-60 group-hover:scale-110 transition-transform">🔌</div>
                  {product.badge && (
                    <span className="absolute top-3 left-3 text-xs font-medium px-2 py-1 rounded-md gradient-bg text-white">{product.badge}</span>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-sm mb-2 group-hover:text-primary transition-colors">{product.name}</h3>
                  <div className="flex items-center gap-1 mb-3">
                    <span className="text-yellow-500">★</span>
                    <span className="text-sm font-medium">{product.rating}</span>
                    <span className="text-xs text-muted-foreground">({product.reviews})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold gradient-text">{product.price}</span>
                    {product.original && <span className="text-xs text-muted-foreground line-through">{product.original}</span>}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
