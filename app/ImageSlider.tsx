"use client";
import useEmblaCarousel from "embla-carousel-react";
import { useEffect, useState } from "react";

const slides = [
  {
    img: "/images/1.jpg",
    title: "Smart Security Solutions",
    text: "Protect your home with modern technology",
  },
  {
    img: "/images/2.jpg",
    title: "Infrastructure réseau performante",
    text: "Des solutions réseau fiables et sécurisées pour garantir la continuité de votre activité.",
  },
  {
    img: "/images/3.jpg",
    title: "Contrôle d’accès intelligent",
    text: "Sécurisez vos locaux avec des systèmes d’accès modernes, fiables et faciles à gérer.",
  },
];

export default function ImageSlider() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;

    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 4000);

    emblaApi.on("select", () => {
      setSelected(emblaApi.selectedScrollSnap());
    });

    return () => clearInterval(interval);
  }, [emblaApi]);

  return (
    <div className="relative w-full overflow-hidden" ref={emblaRef}>
      <div className="flex">
        {slides.map((slide, i) => (
          <div key={i} className="min-w-full relative">
            <img
              src={slide.img}
              className="w-full h-[280px] md:h-[420px] lg:h-[520px] object-cover"
            />

            {/* overlay */}
            <div className="absolute inset-0 bg-black/40" />

            {/* text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
              <h2 className="text-2xl md:text-4xl font-bold mb-4">
                {slide.title}
              </h2>
              <p className="max-w-xl text-sm md:text-lg mb-6">
                {slide.text}
              </p>

             <a href="#contact">
  <button className="bg-primary text-white px-8 py-3 rounded-xl font-semibold shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
Contact Us
  </button>
</a>

            </div>
          </div>
        ))}
      </div>

      {/* arrows */}
      <button
        onClick={() => emblaApi?.scrollPrev()}
        className="absolute text-white left-4 top-1/2 -translate-y-1/2   text-3xl p-3 rounded-full "
      >
        ‹
      </button>

      <button
        onClick={() => emblaApi?.scrollNext()}
        className="absolute text-white right-4 top-1/2 -translate-y-1/2  text-3xl p-3 rounded-full "
      >
        ›
      </button>

      {/* dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full ${
              selected === i ? "bg-white" : "bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
