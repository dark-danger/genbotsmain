"use client";

import { useState, use } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Star, Package, Truck, Shield, RotateCcw, ShoppingCart, Heart, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ProductJsonLd } from "@/components/seo/JsonLd";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ScrollReveal } from "@/components/animations/ScrollAnimations";
import { productsApi, cartApi, wishlistApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { useCartStore } from "@/store/cart";

// Lazy load 3D viewer (front.md: code-splitting for heavy 3D content)
const ProductViewer = dynamic(
  () => import("@/components/3d/ProductViewer").then((mod) => ({ default: mod.ProductViewer })),
  { ssr: false, loading: () => <div className="w-full h-full min-h-[300px] bg-muted/50 rounded-2xl animate-pulse flex items-center justify-center"><span className="text-muted-foreground">Loading 3D viewer...</span></div> }
);

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const { token } = useAuthStore();
  const { openCart } = useCartStore();

  const [activeImage, setActiveImage] = useState("");
  const [show3D, setShow3D] = useState(false);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [newReview, setNewReview] = useState("");
  const [rating, setRating] = useState(5);

  // Fetch product from API
  const { data: product, isLoading, error } = useQuery({
    queryKey: ["productDetail", slug],
    queryFn: async () => {
      const res = await productsApi.getBySlug(slug);
      const data = res.data;
      // Set active image initially
      if (data.images && data.images.length > 0) {
        setActiveImage(data.images[0].url);
      }
      return data;
    },
    staleTime: 30000,
  });

  // Check if product is in wishlist
  useQuery({
    queryKey: ["checkWishlist", product?.id],
    queryFn: async () => {
      const res = await wishlistApi.check(product.id);
      setWishlisted(res.data.wishlisted);
      return res.data;
    },
    enabled: !!token && !!product?.id,
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: (options: { quantity: number }) =>
      cartApi.addItem({ product_id: product.id, quantity: options.quantity }),
    onSuccess: () => {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
      openCart();
    },
    onError: (err: any) => {
      alert(err.response?.data?.detail || "Failed to add to cart. Please log in.");
    },
  });

  // Toggle wishlist mutation
  const toggleWishlistMutation = useMutation({
    mutationFn: () => wishlistApi.toggle(product.id),
    onSuccess: (data: any) => {
      setWishlisted(data.data.wishlisted);
    },
    onError: (err: any) => {
      alert(err.response?.data?.detail || "Failed to toggle wishlist. Please log in.");
    },
  });

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center pt-24 bg-background">
          <div className="text-center">
            <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">Loading product details...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center pt-24 bg-background">
          <div className="text-center">
            <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
            <p className="text-muted-foreground mb-6">The product you&apos;re looking for doesn&apos;t exist or has been removed.</p>
            <Link href="/store"><Button className="gradient-bg text-white rounded-xl">Return to Store</Button></Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const discount = product.compare_at_price
    ? Math.round(((parseFloat(product.compare_at_price) - parseFloat(product.price)) / parseFloat(product.compare_at_price)) * 100)
    : 0;

  const handleBuyNow = async () => {
    if (!token) {
      router.push("/auth/login");
      return;
    }
    try {
      await cartApi.addItem({ product_id: product.id, quantity: qty });
      router.push("/checkout");
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to initiate buy now");
    }
  };

  const placeholderReviews = [
    { id: 1, user: "Aarav Sharma", rating: 5, date: "2 days ago", comment: "Amazing kit! Built my first line-following robot in just 3 hours. The components are high quality." },
    { id: 2, user: "Priya Patel", rating: 4, date: "1 week ago", comment: "Good value for money. The guidebook is very helpful, but I wish it had an extra motor driver." },
    { id: 3, user: "Rahul Kumar", rating: 5, date: "2 weeks ago", comment: "Perfect for beginners. My students love this kit in our robotics club." },
  ];

  return (
    <>
      <ProductJsonLd
        name={product.name}
        description={product.description || ""}
        image={product.images?.[0]?.url || ""}
        sku={product.sku}
        price={parseFloat(product.price)}
        rating={product.avg_rating || 5}
        reviewCount={product.review_count || placeholderReviews.length}
        url={`https://genbots.in/store/${product.slug}`}
      />
      <Navbar />
      <main className="min-h-screen bg-background pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li>/</li>
              <li><Link href="/store" className="hover:text-primary transition-colors">Store</Link></li>
              <li>/</li>
              <li className="text-foreground font-medium truncate max-w-[200px]">{product.name}</li>
            </ol>
          </nav>

          {/* Product Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
            
            {/* Images / 3D Viewer */}
            <ScrollReveal direction="left">
              <div className="space-y-4">
                <div className="flex gap-2 mb-2">
                  <Button
                    variant={!show3D ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShow3D(false)}
                    className="rounded-xl text-xs"
                  >
                    📸 Photos
                  </Button>
                  <Button
                    variant={show3D ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShow3D(true)}
                    className="rounded-xl text-xs"
                  >
                    🎮 3D View
                  </Button>
                </div>

                {show3D ? (
                  <div className="aspect-square rounded-2xl overflow-hidden border bg-gradient-to-br from-background to-muted">
                    <ProductViewer />
                  </div>
                ) : (
                  <div className="aspect-square rounded-2xl overflow-hidden border bg-muted relative group">
                    {activeImage ? (
                      <img
                        src={activeImage}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="eager"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-4xl">📦</div>
                    )}
                    {product.is_featured && (
                      <Badge className="absolute top-4 left-4 gradient-bg text-white border-0 shadow-lg">
                        Featured
                      </Badge>
                    )}
                    {discount > 0 && (
                      <Badge className="absolute top-4 right-4 bg-red-500 text-white border-0">
                        -{discount}%
                      </Badge>
                    )}
                  </div>
                )}
                
                {/* Thumbnails */}
                {!show3D && product.images && product.images.length > 1 && (
                  <div className="flex gap-3">
                    {product.images.map((img: any, idx: number) => (
                      <button 
                        key={idx} 
                        onClick={() => setActiveImage(img.url)}
                        className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${activeImage === img.url ? "border-primary shadow-lg ring-2 ring-primary/20" : "border-transparent hover:border-primary/50"}`}
                        aria-label={`View image ${idx + 1}`}
                      >
                        <img src={img.url} alt={`${product.name} thumbnail ${idx + 1}`} className="w-full h-full object-cover" loading="lazy" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </ScrollReveal>

            {/* Product Details */}
            <ScrollReveal direction="right">
              <div className="flex flex-col justify-center">
                {/* Brand / Meta */}
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    {product.brand?.name || "GenBots"}
                  </span>
                  <button 
                    onClick={() => toggleWishlistMutation.mutate()}
                    className={`p-2 rounded-full border transition-colors ${wishlisted ? "bg-red-500/10 border-red-500 text-red-500" : "hover:bg-muted text-muted-foreground"}`}
                    aria-label="Toggle wishlist"
                  >
                    <Heart className={`w-4 h-4 ${wishlisted ? "fill-current" : ""}`} />
                  </button>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold mb-4">{product.name}</h1>
                
                {/* Rating */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex text-yellow-500" aria-label={`Rating: ${product.avg_rating || 5} out of 5`}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-5 h-5 ${i < Math.floor(product.avg_rating || 5) ? "fill-current" : "text-muted"}`} aria-hidden="true" />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground font-medium">
                    {product.avg_rating || "5.0"} ({product.review_count || placeholderReviews.length} reviews)
                  </span>
                </div>
                
                {/* Price */}
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-3xl font-bold gradient-text">
                    ₹{parseFloat(product.price).toLocaleString("en-IN")}
                  </span>
                  {product.compare_at_price && (
                    <>
                      <span className="text-lg text-muted-foreground line-through">
                        ₹{parseFloat(product.compare_at_price).toLocaleString("en-IN")}
                      </span>
                      <Badge variant="secondary" className="text-green-600">
                        Save ₹{(parseFloat(product.compare_at_price) - parseFloat(product.price)).toLocaleString("en-IN")}
                      </Badge>
                    </>
                  )}
                </div>
                
                <p className="text-muted-foreground mb-8 leading-relaxed">{product.description}</p>

                {/* Specifications */}
                {product.specifications && product.specifications.length > 0 && (
                  <div className="mb-8">
                    <h3 className="font-semibold text-lg mb-3">Specifications</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {product.specifications.map((spec: any, idx: number) => (
                        <div key={idx} className="border-b pb-2">
                          <span className="text-muted-foreground block text-xs">{spec.key}</span>
                          <span className="font-medium">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity + Actions */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center border rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="px-4 py-2 hover:bg-muted transition-colors text-lg font-medium"
                      aria-label="Decrease quantity"
                    >−</button>
                    <span className="px-4 py-2 font-semibold min-w-[48px] text-center">{qty}</span>
                    <button
                      onClick={() => setQty(qty + 1)}
                      className="px-4 py-2 hover:bg-muted transition-colors text-lg font-medium"
                      aria-label="Increase quantity"
                    >+</button>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {product.stock_quantity > 0 ? `${product.stock_quantity} items available` : "Out of stock"}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    className="flex-1 gradient-bg text-white rounded-xl h-11 text-sm font-medium"
                    onClick={handleBuyNow}
                    disabled={product.stock_quantity <= 0}
                  >
                    Buy Now
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 h-11 rounded-xl border-primary text-primary hover:bg-primary/10"
                    onClick={() => addToCartMutation.mutate({ quantity: qty })}
                    disabled={product.stock_quantity <= 0 || addToCartMutation.isPending}
                  >
                    {added ? (
                      <><Check className="w-4 h-4 mr-2" /> Added</>
                    ) : (
                      <><ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart</>
                    )}
                  </Button>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-2 gap-3 mt-8 pt-6 border-t border-border">
                  {[
                    { icon: Truck, label: "Free Shipping", sub: "Orders above ₹999" },
                    { icon: Shield, label: "1 Year Warranty", sub: "Quality guaranteed" },
                    { icon: RotateCcw, label: "Easy Returns", sub: "7-day return policy" },
                    { icon: Package, label: "Secure Packaging", sub: "Anti-static packing" },
                  ].map((badge) => (
                    <div key={badge.label} className="flex items-center gap-2 text-sm">
                      <badge.icon className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
                      <div>
                        <p className="font-medium text-xs">{badge.label}</p>
                        <p className="text-[10px] text-muted-foreground">{badge.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Separator */}
          <div className="h-px bg-border w-full mb-16" />

          {/* Reviews Section */}
          <ScrollReveal>
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-10 text-center">Customer <span className="gradient-text">Reviews</span></h2>
              
              {/* Review List */}
              <div className="space-y-6">
                {(product.reviews && product.reviews.length > 0 ? product.reviews : placeholderReviews).map((review: any) => (
                  <div key={review.id} className="glass-card p-6 hover:glow-sm transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 bg-primary/20 text-primary flex items-center justify-center font-bold">
                          {(review.user?.first_name || review.user || "A")[0]}
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{review.user?.first_name ? `${review.user.first_name} ${review.user.last_name || ""}` : review.user}</h4>
                          <p className="text-xs text-muted-foreground">{review.date || "Verified Purchase"}</p>
                        </div>
                      </div>
                      <div className="flex text-yellow-500" aria-label={`${review.rating} out of 5 stars`}>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < review.rating ? "fill-current" : "text-muted"}`} aria-hidden="true" />
                        ))}
                      </div>
                    </div>
                    <p className="text-muted-foreground leading-relaxed mb-4">&ldquo;{review.comment}&rdquo;</p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </main>
      <Footer />
    </>
  );
}
