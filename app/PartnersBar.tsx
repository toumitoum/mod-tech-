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

  // Duplicate for infinite scroll effect
  const items = [...partners, ...partners];

  return (
    <section className="py-12 bg-background border-t border-border">
      <div className="container mx-auto px-4 mb-8">
        <p className="text-center text-sm font-medium text-muted-foreground uppercase tracking-widest">
          Ils nous font confiance
        </p>
      </div>

      {/* Scrolling strip */}
      <div className="relative overflow-hidden">
        {/* Fade left */}
        <div className="absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-background to-transparent pointer-events-none"/>
        {/* Fade right */}
        <div className="absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-background to-transparent pointer-events-none"/>

        <div className="flex animate-scroll gap-12 items-center w-max">
          {items.map((partner, i) => (
            <div key={`${partner.id}-${i}`} className="flex-shrink-0">
              {partner.website ? (
                <a href={partner.website} target="_blank" rel="noreferrer"
                  className="block transition-opacity duration-300">
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="h-12 w-auto max-w-[140px] object-contain"
                  />
                </a>
              ) : (
                <div className="transition-opacity duration-300">
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="h-12 w-auto max-w-[140px] object-contain"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

     <style>{`
@keyframes scroll {
  from {
    transform: translate3d(0,0,0);
  }
  to {
    transform: translate3d(-50%,0,0);
  }
}

.animate-scroll {
  animation: scroll 30s linear infinite;
  will-change: transform;
}

.animate-scroll:hover {
  animation-play-state: paused;
}
`}</style>
    </section>
  );
}