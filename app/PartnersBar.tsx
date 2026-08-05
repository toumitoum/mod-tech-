"use client";
import { supabase } from "@/app/supabase";
import { useEffect,useState } from "react";

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
    <section aria-label="Nos partenaires" className="partners-section relative isolate overflow-hidden bg-[#f8fafc] py-16 sm:py-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(rgba(15,23,42,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.045) 1px, transparent 1px)",
          backgroundSize: "68px 68px",
          maskImage: "linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)",
        }}
      />
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-48 w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#14c8b8]/[0.06] blur-3xl" />

      <div className="relative z-10 mod-container">
        <div className="mb-9 flex items-center justify-center gap-4 sm:mb-11">
          <span aria-hidden="true" className="h-px w-10 bg-gradient-to-r from-transparent to-[#56ddb4]" />
          <p className="whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
            Ils nous font confiance
          </p>
          <span aria-hidden="true" className="h-px w-10 bg-gradient-to-l from-transparent to-[#56ddb4]" />
        </div>

        <div className="relative overflow-hidden py-3 sm:py-4">
          <div aria-hidden="true" className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-14 bg-gradient-to-r from-[#f8fafc] via-[#f8fafc]/92 to-transparent sm:w-24" />
          <div aria-hidden="true" className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-14 bg-gradient-to-l from-[#f8fafc] via-[#f8fafc]/92 to-transparent sm:w-24" />

          <div className="mod-partners-track flex w-max items-center gap-3 px-4 sm:gap-4 sm:px-6">
            {items.map((partner, i) => {
              const isDuplicate = i >= partners.length;
              const logo = (
                <img
                  src={partner.logo}
                  alt={isDuplicate ? "" : partner.name}
                  className="h-10 w-auto max-w-[128px] object-contain transition-transform duration-300 group-hover:scale-105 sm:h-11 sm:max-w-[150px]"
                />
              );

              return (
                <div
                  key={`${partner.id}-${i}`}
                  aria-hidden={isDuplicate}
                  className="flex h-20 min-w-[150px] shrink-0 items-center justify-center px-5 sm:min-w-[180px]"
                >
                  {partner.website ? (
                    <a
                      href={partner.website}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={isDuplicate ? undefined : `Visiter le site de ${partner.name}`}
                      className="group flex h-full w-full items-center justify-center"
                      tabIndex={isDuplicate ? -1 : undefined}
                    >
                      {logo}
                    </a>
                  ) : logo}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes partners-scroll {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(-50%, 0, 0); }
        }
        .mod-partners-track {
          animation: partners-scroll 36s linear infinite;
          will-change: transform;
        }
        .mod-partners-track:hover,
        .mod-partners-track:focus-within {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .mod-partners-track {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
