"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Shield, ArrowRight } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section
      id="accueil"
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg.src})` }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40" />

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
              Solutions technologiques
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-white">
            Sécurité & Innovation{" "}
            <span className="text-teal-400">Technologique</span>
          </h1>

          <p className="text-lg text-white/80 max-w-xl mb-10 leading-relaxed">
            Spécialistes en systèmes de sécurité, réseaux informatiques,
            domotique, contrôle d&apos;accès et sonorisation. Nous protégeons
            et connectons votre environnement.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="#contact"
              className="inline-flex items-center justify-center px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              Demander un devis
              <ArrowRight className="ml-2 w-4 h-4" />
            </a>
            <a
              href="#services"
              className="inline-flex items-center justify-center px-8 py-3 border border-white/40 hover:border-white text-white font-semibold rounded-xl transition-all duration-300 hover:bg-white/10"
            >
              Découvrir nos services
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;