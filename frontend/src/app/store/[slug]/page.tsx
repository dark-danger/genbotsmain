"use client";

import { useState, use } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Star, ArrowLeft, Send, ThumbsUp, ShoppingCart, Package, Truck, Shield, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckoutButton } from "@/components/CheckoutButton";
import { productsData } from "@/lib/data";
import { ProductJsonLd } from "@/components/seo/JsonLd";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ScrollReveal } from "@/components/animations/ScrollAnimations";

// Lazy load 3D viewer (front.md: code-splitting for heavy 3D content)
const ProductViewer = dynamic(
  () => import("@/components/3d/ProductViewer").then((mod) => ({ default: mod.ProductViewer })),
  { ssr: false, loading: () => <div className="w-full h-full min-h-[300px] bg-muted/50 rounded-2xl animate-pulse flex items-center justify-center"><span className="text-muted-foreground">Loading 3D viewer...</span></div> }
);

const initialReviews = [
  { id: 1, user: "Aarav Sharma", rating: 5, date: "2 days ago", comment: "Amazing kit! Built my first line-following robot in just 3 hours. The components are high quality." },
  { id: 2, user: "Priya Patel", rating: 4, date: "1 week ago", comment: "Good value for money. The guidebook is very helpful, but I wish it had an extra motor driver." },
  { id: 3, user: "Rahul Kumar", rating: 5, date: "2 weeks ago", comment: "Perfect for beginners. My students love this kit in our robotics club." },
];

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const product = productsData.find(p => p.slug === slug);
  
  const [activeImage, setActiveImage] = useState(product?.images[0] || "");
  const [show3D, setShow3D] = useState(false);
  const [reviews, setReviews] = useState(initialReviews);
  const [newReview, setNewReview] = useState("");
  const [rating, setRating] = useState(5);
  const [qty, setQty] = useState(1);

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center pt-24">
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

  const submitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.trim()) return;
    const review = { id: Date.now(), user: "Current User", rating, date: "Just now", comment: newReview };
    setReviews([review, ...reviews]);
    setNewReview("");
    setRating(5);
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <>
      {/* SEO: Schema.org Product JSON-LD */}
      <ProductJsonLd
        name={product.name}
        description={product.description}
        image={product.images[0]}
        sku={product.slug}
        price={product.price}
        rating={product.rating}
        reviewCount={product.reviewsCount}
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
                {/* Toggle: 2D Image / 3D View */}
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
                    <img
                      src={activeImage}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="eager"
                      width={800}
                      height={800}
                    />
                    {product.badge && (
                      <Badge className="absolute top-4 left-4 gradient-bg text-white border-0 shadow-lg">
                        {product.badge}
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
                {!show3D && (
                  <div className="flex gap-3">
                    {product.images.map((img, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => setActiveImage(img)}
                        className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${activeImage === img ? "border-primary shadow-lg ring-2 ring-primary/20" : "border-transparent hover:border-primary/50"}`}
                        aria-label={`View image ${idx + 1}`}
                      >
                        <img src={img} alt={`${product.name} thumbnail ${idx + 1}`} className="w-full h-full object-cover" loading="lazy" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </ScrollReveal>

            {/* Product Details */}
            <ScrollReveal direction="right">
              <div className="flex flex-col justify-center">
                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex text-yellow-500" aria-label={`Rating: ${product.rating} out of 5`}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-5 h-5 ${i < Math.floor(product.rating) ? "fill-current" : "text-muted"}`} aria-hidden="true" />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground font-medium">
                    {product.rating} ({product.reviewsCount} reviews)
                  </span>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold mb-4">{product.name}</h1>
                
                {/* Price */}
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-3xl font-bold gradient-text">₹{product.price.toLocaleString("en-IN")}</span>
                  {product.originalPrice && (
                    <>
                      <span className="text-lg text-muted-foreground line-through">₹{product.originalPrice.toLocaleString("en-IN")}</span>
                      <Badge variant="secondary" className="text-green-600">Save ₹{(product.originalPrice - product.price).toLocaleString("en-IN")}</Badge>
                    </>
                  )}
                </div>
                
                <p className="text-muted-foreground mb-8 leading-relaxed">{product.description}</p>

                {/* Features */}
                <h3 className="font-semibold text-lg mb-3">Key Features</h3>
                <ul className="space-y-2.5 mb-8" role="list">
                  {product.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center text-muted-foreground">
                      <div className="w-2 h-2 rounded-full gradient-bg mr-3 shrink-0" aria-hidden="true" />
                      {feat}
                    </li>
                  ))}
                </ul>

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
                  <span className="text-sm text-muted-foreground">In Stock</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <CheckoutButton amount={product.price * qty * 100} receipt={product.slug} />
                  </div>
                  <Button variant="outline" className="flex-1 h-10 rounded-xl border-primary text-primary hover:bg-primary/10">
                    <ShoppingCart className="w-4 h-4 mr-2" aria-hidden="true" /> Add to Cart
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
              
              {/* Write a review */}
              <div className="glass-card p-6 sm:p-8 mb-12">
                <h3 className="text-xl font-semibold mb-4">Write a Review</h3>
                <form onSubmit={submitReview}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm font-medium mr-2">Your Rating:</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button type="button" key={star} onClick={() => setRating(star)} aria-label={`Rate ${star} stars`}>
                        <Star className={`w-6 h-6 transition-colors ${star <= rating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}`} />
                      </button>
                    ))}
                  </div>
                  <Textarea 
                    placeholder="Share your experience with this product..." 
                    className="min-h-[120px] rounded-xl mb-4"
                    value={newReview}
                    onChange={(e) => setNewReview(e.target.value)}
                    aria-label="Review text"
                  />
                  <div className="flex justify-end">
                    <Button type="submit" className="rounded-xl gradient-bg text-white">
                      <Send className="w-4 h-4 mr-2" aria-hidden="true" /> Submit Review
                    </Button>
                  </div>
                </form>
              </div>

              {/* Review List */}
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="glass-card p-6 hover:glow-sm transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 bg-primary/20 text-primary flex items-center justify-center font-bold">
                          {review.user.charAt(0)}
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{review.user}</h4>
                          <p className="text-xs text-muted-foreground">{review.date}</p>
                        </div>
                      </div>
                      <div className="flex text-yellow-500" aria-label={`${review.rating} out of 5 stars`}>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < review.rating ? "fill-current" : "text-muted"}`} aria-hidden="true" />
                        ))}
                      </div>
                    </div>
                    <p className="text-muted-foreground leading-relaxed mb-4">&ldquo;{review.comment}&rdquo;</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <button className="flex items-center gap-1.5 hover:text-primary transition-colors">
                        <ThumbsUp className="w-4 h-4" aria-hidden="true" /> Helpful
                      </button>
                    </div>
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
