"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/app/supabase";

type Partner = {
  id: number;
  name: string;
  logo: string;
  website: string | null;
  sort_order: number;
  is_active: boolean;
};

export default function PartnersBar() {
  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    supabase
      .from("partners")
      .select("*")
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data }) => {
        if (data && data.length > 0) setPartners(data);
      });
  }, []);

  if (partners.length === 0) return null;

  const items = [...partners, ...partners];

  return (
    <section className="relative py-14 bg-white border-t border-slate-100 overflow-hidden">

      {/* ── Background grid ── */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(20,184,166,1) 1px, transparent 1px), linear-gradient(90deg, rgba(20,184,166,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* ── Label ── */}
      <div className="relative z-10 flex items-center justify-center gap-4 mb-10">
        <span className="h-px w-10 bg-slate-200" />
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest whitespace-nowrap">
          Ils nous font confiance
        </p>
        <span className="h-px w-10 bg-slate-200" />
      </div>

      {/* ── Scrolling strip ── */}
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-32 z-10 bg-gradient-to-r from-white to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-32 z-10 bg-gradient-to-l from-white to-transparent pointer-events-none" />

        <div className="flex animate-partners-scroll gap-10 sm:gap-16 items-center w-max">
          {items.map((partner, i) => {
            const logo = (
              <img
                src={partner.logo}
                alt={partner.name}
                className="h-9 sm:h-11 w-auto max-w-[120px] sm:max-w-[150px] object-contain opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300"
              />
            );

            return (
              <div key={`${partner.id}-${i}`} className="flex-shrink-0">
                {partner.website ? (
                  <a href={partner.website} target="_blank" rel="noreferrer">
                    {logo}
                  </a>
                ) : logo}
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes partners-scroll {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(-50%, 0, 0); }
        }
        .animate-partners-scroll {
          animation: partners-scroll 30s linear infinite;
          will-change: transform;
        }
        .animate-partners-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}