"use client";
import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Star, Quote, Send, CheckCircle2, MessageSquarePlus, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import { publicApi } from "@/lib/api";

const DEFAULT_TESTIMONIALS = [
  { id: "1", name: "Mr. Arjun", role: "Maker & Robotics Enthusiast, Sonipat", content: "This is good for robotics components with affordable products illl also suggest my friends too as they usally need components", rating: 5 },
  { id: "2", name: "Mohamad Jaid", role: "ECE Student", content: "Genbots provides good quality products. I've ordered few items the experience was great and satisfying.", rating: 4 },
];

export function TestimonialsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  // Form State
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [name, setName] = useState<string>("");
  const [designation, setDesignation] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const { data: apiTestimonials, refetch } = useQuery({
    queryKey: ["homeTestimonials"],
    queryFn: async () => {
      try {
        const res = await publicApi.testimonials();
        return res.data;
      } catch {
        return [];
      }
    },
    staleTime: 30 * 1000,
  });

  const displayList = apiTestimonials && apiTestimonials.length > 0
    ? apiTestimonials.map((t: any) => ({
        id: t.id,
        name: t.name,
        role: t.designation || t.company || "Verified Customer",
        content: t.content,
        rating: t.rating || 5,
      }))
    : DEFAULT_TESTIMONIALS;

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) {
      setErrorMessage("Please enter your name and review message.");
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await publicApi.submitFeedback({
        name: name.trim(),
        designation: designation.trim() || "GenBots Customer",
        content: content.trim(),
        rating: rating,
      });

      setSubmitted(true);
      setName("");
      setDesignation("");
      setContent("");
      setRating(5);

      // Refresh list to immediately display the new review
      refetch();
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.detail || "Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section ref={ref} className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} className="text-center mb-14">
          <Badge variant="outline" className="mb-4 rounded-full px-4 py-1">Customer Reviews</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our <span className="gradient-text">Clients & Learners Say</span></h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm">
            Real feedback from students, makers, and schools building with GenBots robotics and IoT hardware.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {displayList.map((t: any, i: number) => (
            <motion.div key={t.id || `${t.name}-${i}`} initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.1 }}>
              <div className="glass-card p-6 h-full flex flex-col justify-between rounded-2xl border border-border/60 hover:glow-sm transition-all">
                <div>
                  <Quote className="w-8 h-8 text-primary/20 mb-3" />
                  <p className="text-muted-foreground mb-4 italic leading-relaxed">&ldquo;{t.content}&rdquo;</p>
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star
                        key={j}
                        className={`w-4 h-4 ${j < (t.rating || 5) ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground/30"}`}
                      />
                    ))}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Add Your Review Box */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3 }}
          className="max-w-2xl mx-auto"
        >
          <div className="glass-card p-6 md:p-8 rounded-3xl border border-primary/20 shadow-xl relative overflow-hidden bg-card/60 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white shadow-md">
                <MessageSquarePlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  Add Your Review
                  <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                </h3>
                <p className="text-xs text-muted-foreground">Share your experience with GenBots products, kits, or lab training.</p>
              </div>
            </div>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6 space-y-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 p-6"
              >
                <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-lg text-foreground">Thank You for Your Feedback!</h4>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Your review has been successfully submitted and added to our community wall.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSubmitted(false)}
                  className="rounded-xl mt-2 text-xs"
                >
                  Write Another Review
                </Button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                {errorMessage && (
                  <div className="p-3 text-xs bg-destructive/10 text-destructive rounded-xl border border-destructive/20">
                    {errorMessage}
                  </div>
                )}

                {/* Rating Selector */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                    Your Rating: <span className="font-bold text-foreground">{rating} / 5 Stars</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 rounded-lg hover:scale-110 transition-transform focus:outline-none"
                      >
                        <Star
                          className={`w-6 h-6 transition-colors ${
                            star <= (hoverRating || rating)
                              ? "fill-yellow-400 text-yellow-400 drop-shadow-sm"
                              : "text-muted-foreground/30 hover:text-yellow-200"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium block mb-1">Your Name *</label>
                    <Input
                      placeholder="e.g. Rahul Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="rounded-xl bg-background/50 text-sm h-10"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium block mb-1">Role / Institution (Optional)</label>
                    <Input
                      placeholder="e.g. Student, Maker, School Name"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="rounded-xl bg-background/50 text-sm h-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium block mb-1">Your Review / Feedback *</label>
                  <Textarea
                    placeholder="Tell us about the component quality, delivery experience, or workshop learning..."
                    rows={3}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="rounded-xl bg-background/50 text-sm resize-none"
                    required
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                  <span className="text-[11px] text-muted-foreground">
                    Reviews are public and help fellow makers.
                  </span>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto gradient-bg text-white rounded-xl px-6 h-10 font-semibold text-sm shadow-md"
                  >
                    {isSubmitting ? (
                      "Submitting..."
                    ) : (
                      <>
                        Add Review <Send className="w-3.5 h-3.5 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
