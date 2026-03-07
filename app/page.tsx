"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";

import Navbar from "./Navbar";
import HeroSection from "./HeroSection";
import ServicesSection from "./ServicesSection";
import AboutSection from "./AboutSection";
import ReussitesSection from "./ReussitesSection";
import Footer from "./Footer";
import WhatsAppButton from "./WhatsAppButton";
import PartnersBar from "@/app/PartnersBar";

// Dynamic imports
const ImageSlider = dynamic(() => import("./ImageSlider"), { ssr: false });
const ContactSection = dynamic(() => import("./ContactSection"), { ssr: false });

export default function Home() {
  return (
    <main className="overflow-x-hidden">

      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <HeroSection />

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

      {/* Image Slider */}
      <ImageSlider />

      {/* Services */}
      <ServicesSection />

      {/* About */}
      <AboutSection />

      {/* Success / Projects */}
      <ReussitesSection />

      {/* Partners */}
      <PartnersBar />

      {/* Contact */}
      <ContactSection />

      {/* Footer */}
      <Footer />

      {/* WhatsApp floating button */}
      <WhatsAppButton />

    </main>
  );
}