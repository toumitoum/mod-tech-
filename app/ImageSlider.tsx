"use client";

import useEmblaCarousel from "embla-carousel-react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  StoreIcon,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";

type Slide = {
  id: number;
  title: string | null;
  description: string | null;
  image: string;
  sort_order: number;
  is_active: boolean;
};

const carouselEase = [0.22, 1, 0.36, 1] as const;

export default function ImageSlider() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 25 });
  const [selected, setSelected] = useState(0);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    supabase
      .from("slider_slides")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) setSlides(data);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!emblaApi || slides.length === 0) return;

    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, slides.length]);

  useEffect(() => {
    if (!emblaApi || slides.length < 2 || isPaused) return;

    const autoplay = window.setInterval(() => emblaApi.scrollNext(), 4500);
    return () => window.clearInterval(autoplay);
  }, [emblaApi, isPaused, slides.length]);

  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);
  const scrollPrevious = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (loading) {
    return (
      <section id="slider" aria-label="Sélection de produits" className="relative overflow-hidden bg-[#05080b] py-[clamp(5rem,9vw,8rem)]">
        <div aria-hidden="true" className="absolute inset-0 opacity-40" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
        <div className="relative mod-container">
          <div className="mb-8 h-3 w-24 animate-pulse rounded-full bg-[#14C8B8]/30" />
          <div className="h-[clamp(20rem,48vw,38rem)] w-full animate-pulse rounded-[28px] border border-white/10 bg-[#0d1318]" />
        </div>
      </section>
    );
  }

  if (slides.length === 0) return null;

  return (
    <section id="slider" className="relative isolate overflow-hidden bg-[#05080b] py-[clamp(5rem,9vw,8rem)] text-white">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-45"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "linear-gradient(to bottom, transparent, #000 15%, #000 85%, transparent)",
        }}
      />
      <div aria-hidden="true" className="absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-[#14C8B8]/10 blur-[110px]" />
      <div aria-hidden="true" className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-[#0d8fca]/10 blur-[140px]" />

      <div className="relative mod-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.65, ease: carouselEase }}
          className="mb-10 grid gap-6 border-b border-white/10 pb-9 sm:mb-12 sm:pb-11 lg:grid-cols-12 lg:items-end"
        >
          <div className="lg:col-span-8">
            <div className="mb-5 inline-flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#59dfaa]">
              <span className="h-2 w-2 rounded-full bg-[#14C8B8] shadow-[0_0_0_6px_rgba(20,200,184,0.1)]" />
              Store MOD-TECH
            </div>
            <h2 className="max-w-4xl text-[clamp(2.25rem,5.2vw,4.7rem)] font-light uppercase leading-[0.98] tracking-[0.035em] text-white">
              Notre sélection <span className="text-[#14C8B8]">de produits</span>
            </h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-white/55 sm:text-base lg:col-span-4 lg:justify-self-end lg:text-right">
            Une sélection d&apos;équipements fiables, pensée pour les installations professionnelles.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.75, ease: carouselEase, delay: 0.08 }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocusCapture={() => setIsPaused(true)}
          onBlurCapture={() => setIsPaused(false)}
          className="group/carousel relative overflow-hidden rounded-[28px] border border-white/15 bg-[#0b1015] shadow-[0_34px_100px_rgba(0,0,0,0.38)] sm:rounded-[32px]"
        >
          <div aria-hidden="true" className="absolute inset-0 z-[1] bg-[linear-gradient(115deg,rgba(20,200,184,0.09),transparent_35%,transparent_68%,rgba(13,143,202,0.1))]" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />

          <div
            ref={emblaRef}
            className="overflow-hidden"
            role="region"
            aria-roledescription="carousel"
            aria-label="Produits en vedette"
          >
            <div className="flex">
              {slides.map((slide, index) => (
                <article
                  key={slide.id}
                  className="relative min-w-0 flex-[0_0_100%]"
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${index + 1} sur ${slides.length}`}
                >
                  <Link href="/store" className="group/slide block focus-visible:outline-none">
                    <div className="relative h-[clamp(20rem,48vw,38rem)] overflow-hidden bg-[#0d1318]">
                      <img
                        src={slide.image}
                        alt={slide.title ?? "Produit MOD-TECHNOLOGIE"}
                        className="h-full w-full object-contain p-5 transition-transform duration-700 ease-out group-hover/slide:scale-[1.025] sm:p-8"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,10,0.88)_0%,rgba(2,6,10,0.34)_42%,rgba(2,6,10,0.12)_72%,rgba(2,6,10,0.42)_100%)]" />
                      <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(2,6,10,0.78)_0%,transparent_38%)]" />

                      <div className="absolute left-5 top-5 flex items-center gap-3 sm:left-7 sm:top-7">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-[#060a0db3] font-mono text-[11px] tracking-[0.08em] text-white backdrop-blur-sm">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="hidden text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 sm:inline">Collection professionnelle</span>
                      </div>

                      <div className="absolute inset-x-5 bottom-20 max-w-2xl sm:inset-x-8 sm:bottom-24 lg:inset-x-10">
                        {slide.title && (
                          <h3 className="max-w-2xl text-2xl font-semibold leading-tight tracking-tight text-white drop-shadow-sm sm:text-4xl">
                            {slide.title}
                          </h3>
                        )}
                        {slide.description && (
                          <p className="mt-3 max-w-xl text-sm leading-6 text-white/70 sm:text-base sm:leading-7">
                            {slide.description}
                          </p>
                        )}
                      </div>

                      <span className="absolute right-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#060a0db3] px-3 py-2 text-[11px] font-semibold text-white opacity-0 backdrop-blur-sm transition-all duration-300 group-hover/slide:opacity-100 group-focus-visible/slide:opacity-100 sm:right-7 sm:top-7">
                        Découvrir
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </div>

          <div className="absolute inset-x-5 bottom-5 z-30 flex items-center justify-between gap-3 sm:inset-x-7 sm:bottom-7">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#060a0dcc] px-3 py-2 backdrop-blur-md">
              {slides.length > 1 && slides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => scrollTo(index)}
                  aria-label={`Afficher le produit ${index + 1}`}
                  aria-current={selected === index ? "true" : undefined}
                  className={`rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#59dfaa] focus-visible:ring-offset-2 focus-visible:ring-offset-[#060a0d] ${
                    selected === index ? "h-1.5 w-8 bg-[#59dfaa]" : "h-1.5 w-1.5 bg-white/35 hover:bg-white/70"
                  }`}
                />
              ))}
              {slides.length > 1 && (
                <button
                  type="button"
                  onClick={() => setIsPaused((paused) => !paused)}
                  aria-label={isPaused ? "Reprendre le défilement automatique" : "Mettre le défilement automatique en pause"}
                  title={isPaused ? "Reprendre le défilement" : "Mettre le défilement en pause"}
                  className="ml-1 flex h-6 w-6 items-center justify-center rounded-full text-white/60 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#59dfaa]"
                >
                  {isPaused ? <Play className="h-3 w-3" fill="currentColor" /> : <Pause className="h-3 w-3" fill="currentColor" />}
                </button>
              )}
            </div>

            <Link
              href="/store"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#59dfaa] px-4 text-xs font-bold text-[#06150f] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#79ecc1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#59dfaa] focus-visible:ring-offset-2 focus-visible:ring-offset-[#060a0d] sm:px-5 sm:text-sm"
            >
              <StoreIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Voir la boutique</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {slides.length > 1 && (
            <>
              <button
                type="button"
                onClick={scrollPrevious}
                aria-label="Produit précédent"
                className="absolute left-5 top-1/2 z-30 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-[#060a0db3] text-white backdrop-blur-sm transition-all duration-200 hover:border-[#59dfaa]/60 hover:bg-[#0b1718] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#59dfaa] sm:flex sm:left-7 lg:opacity-0 lg:group-hover/carousel:opacity-100 lg:group-focus-within/carousel:opacity-100"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={scrollNext}
                aria-label="Produit suivant"
                className="absolute right-5 top-1/2 z-30 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-[#060a0db3] text-white backdrop-blur-sm transition-all duration-200 hover:border-[#59dfaa]/60 hover:bg-[#0b1718] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#59dfaa] sm:flex sm:right-7 lg:opacity-0 lg:group-hover/carousel:opacity-100 lg:group-focus-within/carousel:opacity-100"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
}
