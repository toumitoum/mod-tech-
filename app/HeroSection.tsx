"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, easeInOut } from "framer-motion";
import { ArrowRight, ChevronDown, Sparkles } from "lucide-react";
import { supabase } from "@/app/supabase";
import Image from "next/image";

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
  subtitle:
    "Spécialistes en systèmes de sécurité, réseaux informatiques, domotique, contrôle d'accès et sonorisation.",
  badge: "Solutions technologiques",
  btnPrimary: "Demander un devis",
  btnSecondary: "Découvrir nos services",
  bgImage: "",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1, ease: easeInOut },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: easeInOut },
  },
};

const HeroSkeleton = () => (
  <section className="min-h-screen bg-white flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-sm text-slate-400 animate-pulse">Chargement...</span>
    </div>
  </section>
);

function Background({ bgImage }: { bgImage?: string }) {
  if (bgImage) {
    return (
     <div className="absolute inset-0">
  <img
    src={bgImage}
    alt=""
    className="w-full h-full object-cover"
  />

  {/* Bottom blur */}
  <div className="absolute bottom-0 left-0 right-0 h-10 -md bg-gradient-to-t from-teal-100/90 to-transparent" />
</div>
    );
  }

  return (
    <>
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(hsla(173, 80%, 40%, 0.50) 1px, transparent 1px), linear-gradient(90deg, rgba(20,184,166,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <div className="absolute -top-20 -left-20 w-[70vw] h-[70vw] bg-teal-400/15 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 right-0 w-[60vw] h-[60vw] bg-teal-300/10 rounded-full blur-[80px]" />
    </>
  );
}

function ScrollIndicator() {
  return (
    <motion.div
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center text-slate-400 cursor-pointer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.2 }}
      onClick={() =>
        document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })
      }
    >
      <span className="text-xs tracking-[0.2em] uppercase">Défiler</span>

      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ repeat: Infinity, duration: 1.8 }}
      >
        <ChevronDown className="w-6 h-6" />
      </motion.div>
    </motion.div>
  );
}

export default function HeroSection() {
  const [data, setData] = useState<HeroData>(DEFAULT_HERO);
  const [loading, setLoading] = useState(true);

  const fetchContent = useCallback(async () => {
    try {
      const heroRes = await supabase
        .from("site_content")
        .select("content")
        .eq("section", "hero")
        .single();

      if (heroRes.data?.content) {
        setData((prev) => ({ ...prev, ...heroRes.data.content }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  if (loading) return <HeroSkeleton />;

  return (
    <section className="relative min-h-[100dvh] flex items-center bg-white overflow-hidden">
      <Background bgImage={data.bgImage} />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-24">      
<motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-none lg:max-w-4xl"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="mb-6">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-50 border border-teal-100 text-teal-700 text-sm font-semibold rounded-full">
              <Sparkles className="w-4 h-4" />
              {data.badge}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={itemVariants}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-slate-900 mb-5"
          >
            {data.title}{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-600">
              {data.titleHighlight}
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-slate-600 text-base sm:text-lg lg:text-xl max-w-xl mb-10"
          >
            {data.subtitle}
          </motion.p>

          {/* Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
            <a
              href="#contact"
              className="flex items-center justify-center gap-2 px-8 py-4 bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-xl transition"
            >
              {data.btnPrimary}
              <ArrowRight className="w-5 h-5" />
            </a>

            <a
              href="#services"
              className="flex items-center justify-center px-8 py-4 border-2 border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-semibold"
            >
              {data.btnSecondary}
            </a>
          </motion.div>
        </motion.div>
      </div>

      <ScrollIndicator />
    </section>
  );
}