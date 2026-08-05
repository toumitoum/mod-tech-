"use client";

import { supabase } from "@/app/supabase";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface HeroData {
  title: string;
  titleHighlight: string;
  subtitle: string;
  badge: string;
  btnPrimary: string;
  btnSecondary: string;
  bgImage: string;
}

const DEFAULT_HERO: HeroData = {
  title: "Sécurité & Innovation",
  titleHighlight: "Technologique",
  subtitle: "Spécialistes en systèmes de sécurité, réseaux informatiques, domotique, contrôle d'accès et sonorisation.",
  badge: "Solutions technologiques",
  btnPrimary: "Demander un devis",
  btnSecondary: "Découvrir nos services",
  bgImage: "",
};

const ease = [0.22, 1, 0.36, 1] as const;

function HeroSkeleton() {
  return <section className="min-h-screen bg-[#05070b]" aria-busy="true" />;
}

export default function HeroSection() {
  const [data, setData] = useState<HeroData>(DEFAULT_HERO);
  const [loading, setLoading] = useState(true);

  const fetchContent = useCallback(async () => {
    try {
      const { data: hero } = await supabase.from("site_content").select("content").eq("section", "hero").single();
      if (hero?.content) setData((current) => ({ ...current, ...hero.content }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void Promise.resolve().then(fetchContent); }, [fetchContent]);
  if (loading) return <HeroSkeleton />;

  const visual = data.bgImage || "/brand-assets/modtech-hero-security-network.png";

  return (
    <section id="accueil" className="hero-shell relative isolate min-h-[100svh] overflow-hidden bg-[#f8fafc] pt-[76px] text-slate-900 lg:pt-[88px]">
      <div aria-hidden="true" className="absolute inset-0 hero-grid" />
      <div aria-hidden="true" className="absolute -left-28 top-1/3 h-80 w-80 rounded-full bg-[#14c8b8]/10 blur-[120px]" />
      <div aria-hidden="true" className="absolute right-0 top-0 h-full w-[55%] bg-[radial-gradient(ellipse_at_70%_40%,rgba(20,200,184,0.16),transparent_65%)]" />

      <div className="mod-container relative z-10 grid min-h-[calc(100svh-76px)] items-center gap-10 py-10 sm:py-20 lg:min-h-[calc(100svh-88px)] lg:grid-cols-12 lg:gap-8 lg:py-14">
        <motion.div initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }} className="max-w-2xl lg:col-span-5">
          <motion.h1 variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.7, ease }} className="max-w-xl text-[2.55rem] font-semibold leading-[0.98] tracking-[-0.06em] text-slate-950 sm:text-[clamp(3rem,5.2vw,5.2rem)] sm:tracking-[-0.065em]">
            {data.title} <span className="text-[#14c8b8]">{data.titleHighlight}</span>
          </motion.h1>
          <motion.p variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.65, ease }} className="mt-5 max-w-xl text-[15px] leading-7 text-slate-600 sm:mt-7 sm:text-lg sm:leading-8">
            {data.subtitle}
          </motion.p>
          <motion.div variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.6, ease }} className="mt-7 flex flex-wrap items-center gap-3 sm:mt-9">
            <a href="#contact" className="hero-cta-primary mod-button-primary group inline-flex items-center justify-center gap-2.5 whitespace-nowrap px-4 text-[13px] font-semibold sm:gap-3 sm:px-5">
              {data.btnPrimary}
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#062522]/10 transition-transform duration-200 group-hover:translate-x-0.5">
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </a>
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, delay: 0.18, ease }} className="relative lg:col-span-7 lg:pl-10">
          <div className="relative overflow-hidden rounded-[28px] shadow-[0_20px_50px_rgba(15,23,42,0.1)] sm:rounded-[34px]">
            <img src={visual} alt="Infrastructure et sécurité MOD-TECHNOLOGIE" className="aspect-[1.42/1] w-full object-cover" />
          </div>
        </motion.div>
      </div>

      <a href="#services" aria-label="Découvrir les services" className="absolute bottom-5 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/45 transition-colors hover:text-[#72e1d5] lg:flex">
        Défiler <ChevronDown className="h-4 w-4 animate-bounce" />
      </a>
    </section>
  );
}
