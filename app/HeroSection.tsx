"use client";

import { useEffect, useState } from "react";
import { motion, easeInOut } from "framer-motion";
import { Shield, ArrowRight, ChevronDown } from "lucide-react";
import { supabase } from "@/app/supabase";

const DEFAULT = {
  title: "Sécurité & Innovation",
  titleHighlight: "Technologique",
  subtitle:
    "Spécialistes en systèmes de sécurité, réseaux informatiques, domotique, contrôle d'accès et sonorisation.",
  badge: "Solutions technologiques",
  btnPrimary: "Demander un devis",
  btnSecondary: "Découvrir nos services",
  bgImage: "",
};

const DEFAULT_ABOUT = {
  years: "5+",
  clients: "200+",
  projects: "500+",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: easeInOut } },
};

export default function HeroSection() {
  const [data, setData] = useState(DEFAULT);
  const [about, setAbout] = useState(DEFAULT_ABOUT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchContent = async () => {
      const [heroRes, aboutRes] = await Promise.all([
        supabase.from("site_content").select("content").eq("section", "hero").single(),
        supabase.from("site_content").select("content").eq("section", "about").single(),
      ]);

      if (isMounted) {
        if (heroRes.data?.content) setData({ ...DEFAULT, ...heroRes.data.content });
        if (aboutRes.data?.content) setAbout({ ...DEFAULT_ABOUT, ...aboutRes.data.content });
        setLoading(false);
      }
    };

    fetchContent();
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <section className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </section>
    );
  }

  return (
    <div>
    <section className="relative w-full min-h-screen flex flex-col justify-center overflow-hidden bg-white">

      {/* ── Layered Background ── */}
      {data.bgImage ? (
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${data.bgImage})` }}
        >
          <div className="absolute inset-0 bg-white/70" />
        </div>
      ) : (
        <>
          {/* Subtle grid */}
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(20,184,166,1) 1px, transparent 1px), linear-gradient(90deg, rgba(20,184,166,1) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
          {/* Radial glow — top-left */}
          <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full bg-teal-400/15 blur-[120px] pointer-events-none" />
          {/* Radial glow — bottom-right */}
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-teal-300/10 blur-[100px] pointer-events-none" />
        </>
      )}

      {/* ── Decorative vertical rule ── */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-teal-400/40 to-transparent hidden lg:block" />

      {/* ── Main Content ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-10 lg:px-16 pt-24 sm:pt-28 pb-24 sm:pb-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-3xl"
        >

          {/* Badge */}
          <motion.div variants={itemVariants} className="flex items-center gap-3 mb-6 sm:mb-8">
            <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-teal-500/30 bg-teal-500/10 backdrop-blur-sm">
              <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-500 shrink-0" />
              <span className="text-[10px] sm:text-xs text-teal-600 uppercase tracking-widest font-semibold">
                {data.badge}
              </span>
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={itemVariants}
            className="text-[2rem] leading-[1.15] sm:text-5xl lg:text-[3.75rem] font-extrabold sm:leading-[1.1] tracking-tight mb-4 sm:mb-6 text-slate-900"
          >
            {data.title}{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-600">
                {data.titleHighlight}
              </span>
              {/* Underline accent */}
              <span className="absolute left-0 -bottom-1 w-full h-[3px] bg-gradient-to-r from-teal-400 to-teal-600 rounded-full" />
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-slate-500 text-sm sm:text-lg leading-relaxed max-w-xl mb-8 sm:mb-10"
          >
            {data.subtitle}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 mb-10 sm:mb-16">
            <a
              href="#contact"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:py-3 bg-teal-500 hover:bg-teal-400 text-white text-sm font-bold rounded-xl transition-all duration-200 shadow-lg shadow-teal-500/25 hover:shadow-teal-400/30 active:scale-[0.98]"
            >
              {data.btnPrimary}
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </a>

            <a
              href="#services"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:py-3 border border-slate-200 hover:border-teal-300 bg-white hover:bg-teal-50 text-slate-600 hover:text-teal-700 text-sm font-semibold rounded-xl transition-all duration-200 active:scale-[0.98]"
            >
              {data.btnSecondary}
            </a>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-3 gap-0 border border-slate-100 rounded-2xl overflow-hidden sm:flex sm:border-none sm:gap-8 sm:rounded-none"
          >
            {[
              { value: about.years,    label: "Années d'expérience" },
              { value: about.projects, label: "Projets réalisés" },
              { value: about.clients,  label: "Clients satisfaits" },
            ].map((stat, i, arr) => (
              <div
                key={i}
                className={`flex flex-col items-center sm:items-start py-4 sm:py-0 px-2 sm:px-0 bg-white sm:bg-transparent ${
                  i < arr.length - 1 ? "border-r border-slate-100 sm:border-none" : ""
                }`}
              >
                <span className="text-xl sm:text-2xl font-extrabold text-teal-500 tabular-nums">
                  {stat.value}
                </span>
                <span className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider mt-0.5 text-center sm:text-left">
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.div>

        </motion.div>
      </div>

      {/* ── Scroll indicator ── */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-slate-400 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.6 }}
      >
        <span className="text-[9px] sm:text-[10px] uppercase tracking-widest">Défiler</span>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </motion.div>

    </section>
   {/* Services Title Section */}
      <section className="px-6 lg:px-20 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 sm:mb-20"
        >
          <div className="flex items-center gap-3 mb-5">
            <span className="h-px w-8 bg-teal-500" />
            <span className="text-xs font-semibold text-teal-600 uppercase tracking-widest">
Store            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold leading-[1.15] tracking-tight text-slate-900 max-w-xl">
              Notre sélection  {" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-600">
              de produits  
              </span>
            </h2>

          </div>
        </motion.div>
      </section>
    </div>
  );
}