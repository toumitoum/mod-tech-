"use client";
import useEmblaCarousel from "embla-carousel-react";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://djiosqlexflaqzrtuyqc.supabase.co",
  "sb_publishable_JMN6dsJOA2lUpSLYQcKD8A_3xBlz3bV"
);

type Slide = {
  id: number;
  title: string | null;
  description: string | null;
  image: string;
  sort_order: number;
  is_active: boolean;
};

export default function ImageSlider() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selected, setSelected] = useState(0);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const { data, error } = await supabase
        .from("slider_slides")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) {
        console.error("Error fetching slides:", error);
        return;
      }

      if (data && data.length > 0) {
        setSlides(data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!emblaApi || slides.length === 0) return;

    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 4000);

    emblaApi.on("select", () => {
      setSelected(emblaApi.selectedScrollSnap());
    });

    return () => clearInterval(interval);
  }, [emblaApi, slides.length]);

  // Don't render if no slides or still loading
  if (loading) {
    return (
      <div className="w-full h-[280px] md:h-[420px] lg:h-[520px] bg-gray-200 animate-pulse" />
    );
  }

  if (slides.length === 0) {
    return null; // Don't show slider if no slides
  }

  return (
    <div className="relative rounded-lg w-full overflow-hidden" ref={emblaRef}>
      <div className="flex">
        {slides.map((slide, i) => (
          <div key={slide.id} className="min-w-full relative">
            <img
              src={slide.image}
              alt={slide.title || "Slide"}
              className="w-full  transition-transform h-[380px] md:h-[480px] lg:h-[420px] object-cover  transition-transform group-hover:scale-135"

            />

            {/* overlay */}
            <div className="absolute inset-0 bg-black/40" />

            {/* text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
              {slide.title && (
                <h2 className="text-2xl md:text-4xl font-bold mb-4">
                  {slide.title}
                </h2>
              )}
              {slide.description && (
                <p className="max-w-xl text-sm md:text-lg mb-6">
                  {slide.description}
                </p>
              )}

              <a href="#contact">
                  <button className="px-10 py-4 rounded-xl font-semibold bg-teal-500 hover:bg-teal-400 text-white shadow-xl shadow-teal-500/30 hover:shadow-teal-400/50 transition-all duration-300 hover:-translate-y-1">
                  Contact Us
                </button>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Only show arrows and dots if there's more than one slide */}
      {slides.length > 1 && (
        <>
          {/* arrows */}
         <button
  onClick={() => emblaApi?.scrollPrev()}
  aria-label="Previous slide"
  className="
    absolute text-white
    left-1 top-1/2 -translate-y-1/2
    text-xl p-2
    md:left-4 md:text-3xl md:p-3
    rounded-full
    hover:bg-black/20
    transition-colors
  "
>
  ‹
</button>


         <button
  onClick={() => emblaApi?.scrollNext()}
  aria-label="Next slide"
  className="
    absolute text-white
    right-1 top-1/2 -translate-y-1/2
    text-xl p-2
    md:right-4 md:text-3xl md:p-3
    rounded-full
    hover:bg-black/20
    transition-colors
  "
>
  ›
</button>


          {/* dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => emblaApi?.scrollTo(i)}
                className={`w-3 h-3 rounded-full transition-all ${
                  selected === i ? "bg-white w-6" : "bg-white/40 hover:bg-white/60"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}