"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FaqJsonLd } from "@/components/seo/JsonLd";

const faqs = [
  { q: "What payment methods do you accept?", a: "We accept Razorpay (UPI, cards, net banking), Stripe, and Cash on Delivery for orders across India." },
  { q: "Do you offer bulk/wholesale pricing?", a: "Yes! We offer special pricing for bulk orders, educational institutions, and enterprises. Contact our sales team for a custom quote." },
  { q: "What is your return policy?", a: "We offer a 7-day return policy for unused products in original packaging. Defective products can be returned within 30 days for a full refund or replacement." },
  { q: "Do you provide lab setup services?", a: "Yes, we provide end-to-end lab setup services for schools and universities, including equipment, furniture, curriculum development, and teacher training." },
  { q: "Are your products compatible with Arduino IDE?", a: "Most of our development boards and kits are compatible with Arduino IDE. Check product specifications for detailed compatibility information." },
  { q: "Do you ship internationally?", a: "Currently, we ship across India with free shipping on orders above ₹999. International shipping is available for bulk orders — contact us for details." },
];

export function FaqSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section ref={ref} id="faq" className="py-24" aria-labelledby="faq-heading">
      {/* SEO: FAQ Schema.org JSON-LD */}
      <FaqJsonLd faqs={faqs.map(f => ({ question: f.q, answer: f.a }))} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} className="text-center mb-14">
          <Badge variant="outline" className="mb-4 rounded-full px-4 py-1">FAQ</Badge>
          <h2 id="faq-heading" className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked <span className="gradient-text">Questions</span></h2>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.2 }}>
          <Accordion className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="glass-card px-6 border-0">
                <AccordionTrigger className="text-left font-medium hover:no-underline">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
