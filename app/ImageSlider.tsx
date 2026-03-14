"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "./supabase";
import Link from "next/link";
import { ShoppingBag, ChevronLeft, ChevronRight, ArrowRight, StoreIcon } from "lucide-react";
import { motion } from "framer-motion";

type Slide = {
  id: number;
  title: string | null;
  description: string | null;
  image: string;
  sort_order: number;
  is_active: boolean;
};

export default function ImageSlider() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    duration: 25,
  });

  const [selected, setSelected] = useState(0);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch slides
  useEffect(() => {
    const fetchSlides = async () => {
      const { data, error } = await supabase
        .from("slider_slides")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (!error && data) setSlides(data);
      setLoading(false);
    };

    fetchSlides();
  }, []);

  // Embla events + autoplay
  useEffect(() => {
    if (!emblaApi || slides.length === 0) return;

    const onSelect = () => {
      setSelected(emblaApi.selectedScrollSnap());
    };

    emblaApi.on("select", onSelect);

    const autoplay = setInterval(() => {
      emblaApi.scrollNext();
    }, 4500);

    return () => {
      emblaApi.off("select", onSelect);
      clearInterval(autoplay);
    };
  }, [emblaApi, slides]);

  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi]
  );

  if (loading) {
    return (
      <section id="slider" className="py-16">
        <div
          className="w-full rounded-2xl bg-slate-100 animate-pulse"
          style={{ height: 260 }}
        />
      </section>
    );
  }

  if (slides.length === 0) return null;

  return (
    <section id="slider" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="h-px w-8 bg-teal-500" />
            <span className="text-xs font-bold text-teal-600 uppercase tracking-[0.2em]">
              Store
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            Notre sélection{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-600">
              de produits
            </span>
          </h2>
        </motion.div>

        {/* Slider */}
        <div
          className="relative w-full rounded-2xl overflow-hidden"
          style={{ boxShadow: "0 6px 30px rgba(0,0,0,0.10)" }}
        >
          <div ref={emblaRef} className="overflow-hidden">
            <div className="flex">
              {slides.map((slide) => (
                <div key={slide.id} className="min-w-full relative">

                  <div
                    className="relative bg-white overflow-hidden"
                    style={{ height: "clamp(240px, 55vw, 420px)" }}
                  >
                    <img
                      src={slide.image}
                      alt={slide.title ?? "Slide"}
                      className="w-full h-full object-contain"
                    />

                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(4,8,20,0.72) 0%, rgba(4,8,20,0.15) 50%, transparent 100%)",
                      }}
                    />
                  </div>

                  {(slide.title || slide.description) && (
                    <div
                      className="absolute left-0 right-0 px-4 text-center"
                      style={{ bottom: "60px" }}
                    >
                      {slide.title && (
                        <p className="text-white font-bold text-lg">
                          {slide.title}
                        </p>
                      )}

                      {slide.description && (
                        <p className="text-white/70 text-sm mt-1">
                          {slide.description}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Dots */}
          {slides.length > 1 && (
            <div className="absolute bottom-4 left-4 flex gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => scrollTo(i)}
                  className="rounded-full transition-all"
                  style={{
                    width: selected === i ? 16 : 6,
                    height: 6,
                    background:
                      selected === i
                        ? "rgba(119, 126, 125, 0.35)"
                        : "rgba(77, 84, 85, 0.22)",
                  }}
                />
              ))}
            </div>
          )}

          {/* CTA */}
          <Link
            href="/store"
            className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold"
            style={{
              background: "linear-gradient(135deg, #24b1a5ba, #1ab0a3f3)",
            }}
          >
            <StoreIcon className="w-4 h-4" />
            Voir la boutique
            <ArrowRight className="w-4 h-4" />
          </Link>

          {/* Arrows */}
          {slides.length > 1 && (
            <>
              <button
                onClick={() => emblaApi?.scrollPrev()}
                className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 text-white w-9 h-9 rounded-full items-center justify-center"
              >
                <ChevronLeft size={18} />
              </button>

              <button
                onClick={() => emblaApi?.scrollNext()}
                className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 text-white w-9 h-9 rounded-full items-center justify-center"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}