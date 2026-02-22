"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shield, ArrowRight } from "lucide-react";
import { supabase } from "@/app/supabase";

const DEFAULT = {
  title: "Sécurité & Innovation",
  titleHighlight: "Technologique",
  subtitle: "Spécialistes en systèmes de sécurité, réseaux informatiques, domotique, contrôle d'accès et sonorisation. Nous protégeons et connectons votre environnement.",
  badge: "Solutions technologiques",
  btnPrimary: "Demander un devis",
  btnSecondary: "Découvrir nos services",
  bgImage: "",
};

const HeroSection = () => {
  const [data, setData] = useState(DEFAULT);

  useEffect(() => {
    supabase
      .from("site_content")
      .select("content")
      .eq("section", "hero")
      .single()
      .then(({ data: row }) => {
        if (row?.content) setData({ ...DEFAULT, ...row.content });
      });
  }, []);

  // If admin uploaded an image via dashboard → use it
  // Otherwise fall back to the local file in /public/assets/
  const bgStyle = data.bgImage
    ? { backgroundImage: `url(${data.bgImage})` }
    : { backgroundImage: `url(/assets/hero-bg.jpg)` };

  return (
    <section id="accueil" className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={bgStyle} />
      <div className="absolute inset-0 " />
      <div className="container mx-auto px-4 relative z-10 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-white/10 border border-white/20">
              <Shield className="w-5 h-5 text-teal-400" />
            </div>
            <span className="text-sm font-medium text-teal-400 tracking-wide uppercase">
              {data.badge}
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-gray-600">
            {data.title}{" "}
            <span className="text-teal-400">{data.titleHighlight}</span>
          </h1>

          <p className="text-lg text-gray-500 max-w-xl mb-10 leading-relaxed">
            {data.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="#contact"
              className="inline-flex items-center justify-center px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              {data.btnPrimary}
              <ArrowRight className="ml-2 w-4 h-4" />
            </a>
            <a
              href="#services"
              className="inline-flex items-center justify-center px-8 py-3 border border-gray-500 hover:border-gray-300 text-gray-500 font-semibold rounded-xl transition-all duration-300 hover:bg-gray-200"
            >
              {data.btnSecondary}
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;