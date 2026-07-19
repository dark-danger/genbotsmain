"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import {
  CreditCard, Truck, ShieldCheck, ArrowLeft, CheckCircle, AlertCircle, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/store/auth";
import { useCartStore } from "@/store/cart";
import { cartApi, ordersApi } from "@/lib/api";
import Link from "next/link";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const { user, token } = useAuthStore();
  const { items, subtotal, taxAmount, total, setCart, clearLocal } = useCartStore();
  const [step, setStep] = useState<"shipping" | "processing" | "success" | "error">("shipping");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);

  // Form state
  const [form, setForm] = useState({
    shipping_name: "",
    shipping_phone: "",
    shipping_address_line1: "",
    shipping_address_line2: "",
    shipping_city: "",
    shipping_state: "",
    shipping_postal_code: "",
    shipping_country: "India",
    customer_note: "",
    payment_method: "razorpay",
  });

  // Fetch cart on mount
  const { isLoading: cartLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const res = await cartApi.get();
      setCart(res.data);
      return res.data;
    },
    enabled: !!token,
    staleTime: 0,
  });

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setStep("processing");

    try {
      // Create order via backend
      const res = await ordersApi.createOrder(form);
      const orderData = res.data;

      if (form.payment_method === "cod") {
        // COD - order is confirmed immediately
        setConfirmedOrder(orderData);
        clearLocal();
        setStep("success");
        return;
      }

      // Razorpay flow
      if (!window.Razorpay) {
        throw new Error("Razorpay SDK not loaded. Please refresh the page.");
      }

      const options = {
        key: orderData.razorpay_key_id,
        amount: Math.round(orderData.total_amount * 100),
        currency: orderData.currency || "INR",
        name: "GenBots",
        description: `Order ${orderData.order_number}`,
        order_id: orderData.razorpay_order_id,
        handler: async (response: any) => {
          try {
            // Verify payment
            const verifyRes = await ordersApi.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_id: orderData.order_id,
            });
            setConfirmedOrder({
              ...orderData,
              ...verifyRes.data,
            });
            clearLocal();
            setStep("success");
          } catch (err: any) {
            setErrorMsg(err.response?.data?.detail || "Payment verification failed");
            setStep("error");
          }
        },
        prefill: {
          name: form.shipping_name,
          email: user?.email || "",
          contact: form.shipping_phone,
        },
        theme: {
          color: "#7c3aed",
        },
        modal: {
          ondismiss: () => {
            setStep("shipping");
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Failed to create order");
      setStep("error");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <>
        <Navbar />
        <main className="pt-24 pb-16 min-h-screen flex items-center justify-center">
          <div className="text-center glass-card p-12 max-w-md">
            <CreditCard className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Checkout</h1>
            <p className="text-muted-foreground mb-6">Please log in to checkout.</p>
            <Link href="/auth/login">
              <Button className="gradient-bg text-white rounded-xl">Log In</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Success state
  if (step === "success") {
    return (
      <>
        <Navbar />
        <main className="pt-24 pb-16 min-h-screen flex items-center justify-center bg-background">
          <div className="text-center glass-card p-12 max-w-lg">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Order Confirmed! 🎉</h1>
            <p className="text-muted-foreground mb-4">
              Thank you for your purchase. Your order has been placed successfully.
            </p>
            {confirmedOrder && (
              <div className="bg-muted/50 rounded-xl p-4 mb-6 text-left space-y-2">
                <p className="text-sm">
                  <span className="text-muted-foreground">Order Number:</span>{" "}
                  <span className="font-bold">{confirmedOrder.order_number}</span>
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Total:</span>{" "}
                  <span className="font-bold">
                    ₹{parseFloat(confirmedOrder.total_amount).toLocaleString("en-IN")}
                  </span>
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Payment:</span>{" "}
                  <span className="font-bold capitalize">
                    {confirmedOrder.payment_method === "cod"
                      ? "Cash on Delivery"
                      : "Paid via Razorpay"}
                  </span>
                </p>
              </div>
            )}
            <div className="flex gap-3 justify-center">
              <Link href="/dashboard">
                <Button className="gradient-bg text-white rounded-xl">
                  View Orders
                </Button>
              </Link>
              <Link href="/store">
                <Button variant="outline" className="rounded-xl">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Error state
  if (step === "error") {
    return (
      <>
        <Navbar />
        <main className="pt-24 pb-16 min-h-screen flex items-center justify-center bg-background">
          <div className="text-center glass-card p-12 max-w-md">
            <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
            <p className="text-muted-foreground mb-6">{errorMsg}</p>
            <Button
              className="gradient-bg text-white rounded-xl"
              onClick={() => {
                setStep("shipping");
                setErrorMsg("");
              }}
            >
              Try Again
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Processing state
  if (step === "processing") {
    return (
      <>
        <Navbar />
        <main className="pt-24 pb-16 min-h-screen flex items-center justify-center bg-background">
          <div className="text-center glass-card p-12 max-w-md">
            <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin mb-4" />
            <h1 className="text-xl font-bold mb-2">Processing your order...</h1>
            <p className="text-muted-foreground">Please complete payment in the popup.</p>
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
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Cart
          </Link>

          <h1 className="text-3xl font-bold mb-8">
            <span className="gradient-text">Checkout</span>
          </h1>

          {cartLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 glass-card p-12">
              <h2 className="text-xl font-bold mb-2">Cart is empty</h2>
              <p className="text-muted-foreground mb-4">Add items to your cart first.</p>
              <Link href="/store">
                <Button className="gradient-bg text-white rounded-xl">Browse Products</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Shipping Form */}
                <div className="flex-1 space-y-6">
                  <div className="glass-card p-6">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <Truck className="w-5 h-5 text-primary" /> Shipping Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Full Name *</label>
                        <Input
                          name="shipping_name"
                          value={form.shipping_name}
                          onChange={handleFieldChange}
                          placeholder="Enter full name"
                          required
                          className="rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Phone *</label>
                        <Input
                          name="shipping_phone"
                          value={form.shipping_phone}
                          onChange={handleFieldChange}
                          placeholder="+91 98765 43210"
                          required
                          className="rounded-xl"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium mb-1.5 block">
                          Address Line 1 *
                        </label>
                        <Input
                          name="shipping_address_line1"
                          value={form.shipping_address_line1}
                          onChange={handleFieldChange}
                          placeholder="House / Flat no., Street"
                          required
                          className="rounded-xl"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium mb-1.5 block">
                          Address Line 2
                        </label>
                        <Input
                          name="shipping_address_line2"
                          value={form.shipping_address_line2}
                          onChange={handleFieldChange}
                          placeholder="Landmark, Area (optional)"
                          className="rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">City *</label>
                        <Input
                          name="shipping_city"
                          value={form.shipping_city}
                          onChange={handleFieldChange}
                          placeholder="City"
                          required
                          className="rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">State *</label>
                        <Input
                          name="shipping_state"
                          value={form.shipping_state}
                          onChange={handleFieldChange}
                          placeholder="State"
                          required
                          className="rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">PIN Code *</label>
                        <Input
                          name="shipping_postal_code"
                          value={form.shipping_postal_code}
                          onChange={handleFieldChange}
                          placeholder="110001"
                          required
                          className="rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Country</label>
                        <Input
                          name="shipping_country"
                          value={form.shipping_country}
                          onChange={handleFieldChange}
                          className="rounded-xl"
                          disabled
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="text-sm font-medium mb-1.5 block">
                        Order Notes (optional)
                      </label>
                      <Textarea
                        name="customer_note"
                        value={form.customer_note}
                        onChange={handleFieldChange}
                        placeholder="Any special instructions..."
                        className="rounded-xl"
                        rows={2}
                      />
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="glass-card p-6">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-primary" /> Payment Method
                    </h2>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 p-4 border rounded-xl cursor-pointer hover:border-primary transition-colors">
                        <input
                          type="radio"
                          name="payment_method"
                          value="razorpay"
                          checked={form.payment_method === "razorpay"}
                          onChange={handleFieldChange}
                          className="accent-primary"
                        />
                        <div className="flex-1">
                          <p className="font-medium">Pay Online (Razorpay)</p>
                          <p className="text-xs text-muted-foreground">
                            UPI, Cards, Net Banking, Wallets
                          </p>
                        </div>
                        <ShieldCheck className="w-5 h-5 text-green-500" />
                      </label>
                      <label className="flex items-center gap-3 p-4 border rounded-xl cursor-pointer hover:border-primary transition-colors">
                        <input
                          type="radio"
                          name="payment_method"
                          value="cod"
                          checked={form.payment_method === "cod"}
                          onChange={handleFieldChange}
                          className="accent-primary"
                        />
                        <div className="flex-1">
                          <p className="font-medium">Cash on Delivery</p>
                          <p className="text-xs text-muted-foreground">
                            Pay when you receive the order
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="lg:w-80 shrink-0">
                  <div className="glass-card p-6 sticky top-24 space-y-4">
                    <h2 className="text-lg font-bold">Order Summary</h2>

                    {/* Items list */}
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {items.map((item) => (
                        <div key={item.id} className="flex gap-3 text-sm">
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                            {item.product_image ? (
                              <img
                                src={item.product_image}
                                alt={item.product_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              "📦"
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium line-clamp-1">{item.product_name}</p>
                            <p className="text-muted-foreground">
                              Qty: {item.quantity} × ₹{item.unit_price.toLocaleString("en-IN")}
                            </p>
                          </div>
                          <p className="font-medium shrink-0">
                            ₹{item.total_price.toLocaleString("en-IN")}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>₹{subtotal.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">GST (18%)</span>
                        <span>₹{taxAmount.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Shipping</span>
                        <span className="text-green-600">Free</span>
                      </div>
                      <div className="border-t pt-3 flex justify-between text-base">
                        <span className="font-bold">Total</span>
                        <span className="font-bold gradient-text text-lg">
                          ₹{total.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full gradient-bg text-white rounded-xl h-12 text-base"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...
                        </>
                      ) : form.payment_method === "cod" ? (
                        "Place Order (COD)"
                      ) : (
                        <>
                          Pay ₹{total.toLocaleString("en-IN")}{" "}
                          <CreditCard className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      <ShieldCheck className="w-3 h-3 inline mr-1" />
                      Secure checkout powered by Razorpay
                    </p>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
