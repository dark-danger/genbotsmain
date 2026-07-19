"use client";

import { useState } from "react";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import { ordersApi } from "@/lib/api";

interface CheckoutButtonProps {
  amount: number; // in paise
  receipt?: string;
  currency?: string;
}

export function CheckoutButton({ amount, receipt = "receipt_1", currency = "INR" }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      // 1. Create Order on Backend
      const res = await ordersApi.createOrder({ amount, currency, receipt });
      const order = res.data;

      // 2. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount: order.amount, 
        currency: order.currency,
        name: "GenBots",
        description: "Test Transaction",
        order_id: order.id, 
        handler: async function (response: any) {
          // 3. Verify Signature on Backend
          try {
            const verifyRes = await ordersApi.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            alert("Payment Successful!");
          } catch (err: any) {
            alert(err.response?.data?.detail || "Payment Verification Failed");
          }
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp1 = new (window as any).Razorpay(options);
      rzp1.on("payment.failed", function (response: any) {
        alert(response.error.description);
      });
      rzp1.open();
    } catch (err: any) {
      alert("Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <Button onClick={handlePayment} disabled={loading} className="w-full">
        {loading ? "Processing..." : `Pay ₹${amount / 100}`}
      </Button>
    </>
  );
}
