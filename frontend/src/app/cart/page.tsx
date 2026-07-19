"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";
import { useCartStore } from "@/store/cart";
import { cartApi } from "@/lib/api";
import Link from "next/link";

export default function CartPage() {
  const { user, token } = useAuthStore();
  const { items, itemCount, subtotal, taxAmount, total, setCart, clearLocal } = useCartStore();
  const queryClient = useQueryClient();

  const { isLoading, refetch } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const res = await cartApi.get();
      setCart(res.data);
      return res.data;
    },
    enabled: !!token,
    staleTime: 0,
  });

  const updateMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartApi.updateItem(itemId, quantity),
    onSuccess: () => {
      refetch();
    },
  });

  const removeMutation = useMutation({
    mutationFn: (itemId: string) => cartApi.removeItem(itemId),
    onSuccess: () => {
      refetch();
    },
  });

  const clearMutation = useMutation({
    mutationFn: () => cartApi.clear(),
    onSuccess: () => {
      clearLocal();
      refetch();
    },
  });

  if (!user) {
    return (
      <>
        <Navbar />
        <main className="pt-24 pb-16 min-h-screen bg-background">
          <div className="max-w-2xl mx-auto px-4 text-center py-20">
            <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Your Cart</h1>
            <p className="text-muted-foreground mb-6">Please log in to view your cart.</p>
            <Link href="/auth/login">
              <Button className="gradient-bg text-white rounded-xl">Log In</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16 min-h-screen bg-background" id="main-content">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-8">
            Shopping <span className="gradient-text">Cart</span>
            {itemCount > 0 && (
              <span className="text-base font-normal text-muted-foreground ml-3">
                ({itemCount} {itemCount === 1 ? "item" : "items"})
              </span>
            )}
          </h1>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 glass-card p-12">
              <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-bold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">
                Looks like you haven&apos;t added anything yet.
              </p>
              <Link href="/store">
                <Button className="gradient-bg text-white rounded-xl">
                  Browse Products <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Cart Items */}
              <div className="flex-1 space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="glass-card p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center"
                  >
                    {/* Product Image */}
                    <div className="w-20 h-20 rounded-xl bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                      {item.product_image ? (
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/store/${item.product_slug}`}
                        className="font-semibold hover:text-primary transition-colors line-clamp-1"
                      >
                        {item.product_name}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        SKU: {item.product_sku}
                        {item.variant_name && ` • ${item.variant_name}`}
                      </p>
                      <p className="text-sm font-medium mt-1">
                        ₹{item.unit_price.toLocaleString("en-IN")} each
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateMutation.mutate({
                            itemId: item.id,
                            quantity: item.quantity - 1,
                          })
                        }
                        className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
                        disabled={updateMutation.isPending}
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-10 text-center font-semibold tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateMutation.mutate({
                            itemId: item.id,
                            quantity: item.quantity + 1,
                          })
                        }
                        disabled={
                          item.quantity >= item.stock_available ||
                          updateMutation.isPending
                        }
                        className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Item Total */}
                    <div className="text-right min-w-[80px]">
                      <p className="font-bold">
                        ₹{item.total_price.toLocaleString("en-IN")}
                      </p>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeMutation.mutate(item.id)}
                      className="text-destructive hover:bg-destructive/10 p-2 rounded-lg transition-colors"
                      disabled={removeMutation.isPending}
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={() => clearMutation.mutate()}
                    disabled={clearMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Clear Cart
                  </Button>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:w-80 shrink-0">
                <div className="glass-card p-6 sticky top-24 space-y-4">
                  <h2 className="text-lg font-bold">Order Summary</h2>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Subtotal ({itemCount} items)
                      </span>
                      <span className="font-medium">
                        ₹{subtotal.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax (18% GST)</span>
                      <span className="font-medium">
                        ₹{taxAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="font-medium text-green-600">Free</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between text-base">
                      <span className="font-bold">Total</span>
                      <span className="font-bold gradient-text text-lg">
                        ₹{total.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  <Link href="/checkout" className="block">
                    <Button className="w-full gradient-bg text-white rounded-xl h-12 text-base">
                      Proceed to Checkout <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>

                  <Link href="/store" className="block">
                    <Button
                      variant="outline"
                      className="w-full rounded-xl"
                    >
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
