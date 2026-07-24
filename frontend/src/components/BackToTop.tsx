"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) return null;

  return (
    <button
      id="back-to-top"
      onClick={scrollToTop}
      aria-label="Back to top"
      className="fixed bottom-[20px] right-[20px] z-50 gradient-bg text-white px-4 py-2.5 rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-1.5 text-sm font-medium border border-white/20"
    >
      <ArrowUp className="w-4 h-4" />
    </button>
  );
}
