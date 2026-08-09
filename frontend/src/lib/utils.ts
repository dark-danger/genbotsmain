import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const FALLBACK_IMAGES: Record<string, string> = {
  iot: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
  arduino: "https://images.unsplash.com/photo-1553406830-ef2513450d76?w=800&q=80",
  esp32: "https://images.unsplash.com/photo-1608564697071-ddf911bf41fb?w=800&q=80",
  robot: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80",
  stem: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80",
  ai: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80",
  home: "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80",
  default: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&q=80",
}

export function getProductImage(product: any): string {
  if (!product) return FALLBACK_IMAGES.default

  // Check images array
  if (Array.isArray(product.images) && product.images.length > 0) {
    const first = product.images[0]
    if (typeof first === "string" && first.trim()) return first
    if (first && typeof first === "object") {
      const url = first.url || first.image_url || first.src
      if (url && typeof url === "string" && url.trim()) return url
    }
  }

  // Check direct properties
  if (typeof product.image === "string" && product.image.trim()) return product.image
  if (typeof product.image_url === "string" && product.image_url.trim()) return product.image_url
  if (typeof product.product_image === "string" && product.product_image.trim()) return product.product_image

  // Smart fallback by category or name keyword
  const name = (product.name || product.title || product.product_name || "").toLowerCase()
  const cat = (product.category?.slug || product.category?.name || product.category || "").toLowerCase()

  if (name.includes("arduino") || cat.includes("arduino")) return FALLBACK_IMAGES.arduino
  if (name.includes("esp32") || cat.includes("esp32")) return FALLBACK_IMAGES.esp32
  if (name.includes("robot") || cat.includes("robot")) return FALLBACK_IMAGES.robot
  if (name.includes("stem") || cat.includes("stem")) return FALLBACK_IMAGES.stem
  if (name.includes("ai") || cat.includes("ai")) return FALLBACK_IMAGES.ai
  if (name.includes("home") || cat.includes("home")) return FALLBACK_IMAGES.home
  if (name.includes("iot") || cat.includes("iot")) return FALLBACK_IMAGES.iot

  return FALLBACK_IMAGES.default
}

