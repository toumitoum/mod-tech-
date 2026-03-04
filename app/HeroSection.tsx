"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shield, ArrowRight } from "lucide-react";
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

export default function HeroSection() {
  const [data, setData] = useState(DEFAULT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchHeroContent = async () => {
      const { data: row } = await supabase
        .from("site_content")
        .select("content")
        .eq("section", "hero")
        .single();

      if (row?.content && isMounted) {
        setData({ ...DEFAULT, ...row.content });
      }

      if (isMounted) setLoading(false);
    };

    fetchHeroContent();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <section className="min-h-screen bg-gray-900" />;
  }

  return (
    <section className="relative w-full min-h-screen flex items-center overflow-hidden">
      
      {/* Background */}
      {data.bgImage && (
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${data.bgImage})` }}
        />
      )}

      {/* ❌ Overlay removed */}

      <div className="w-full px-6 sm:container sm:mx-auto relative z-10 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          {/* Badge */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
              <Shield className="w-5 h-5 text-teal-500" />
            </div>
            <span className="text-sm text-teal-500 uppercase font-medium">
              {data.badge}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-gray-600 leading-tight">
            {data.title}{" "}
            <span className="text-teal-400">
              {data.titleHighlight}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-gray-500 mb-10 drop-shadow-md">
            {data.subtitle}
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <a
              href="#contact"
              className="flex-1 sm:flex-none text-center mb-2 px-2 py-2 text-[12px] sm:text-base bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg whitespace-nowrap transition-all duration-300 inline-flex items-center justify-center"
            >
              {data.btnPrimary}
              <ArrowRight className="hidden sm:inline ml-2 w-4 h-4" />
            </a>

            <a
              href="#services"
              className="flex-1 sm:flex-none text-center mb-2 px-2 py-2 text-[12px] sm:text-base border border-gray-300 text-gray-500 font-semibold rounded-lg whitespace-nowrap hover:bg-gray-100 transition-all duration-300"
            >
              {data.btnSecondary}
            </a>
          </div>

        </motion.div>
      </div>
    </section>
  );
}