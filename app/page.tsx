"use client";
import Navbar from "./Navbar";
import HeroSection from "./HeroSection";
import ServicesSection from "./ServicesSection";
import AboutSection from "./AboutSection";
import ReussitesSection from "./ReussitesSection";
import Footer from "./Footer";
import WhatsAppButton from "./WhatsAppButton";
import dynamic from "next/dynamic";
import PartnersBar from "@/app/PartnersBar";

const ImageSlider = dynamic(() => import("./ImageSlider"), { ssr: false });
const ContactSection = dynamic(() => import("./ContactSection"), { ssr: false });

export default function Home() {
  return (
    <main>
      <Navbar />
      <HeroSection />
     <h2 className="text-xl md:text-3xl bg-gradient-to-r from-teal-500 to-blue-500 text-white font-bold text-center my-8 p-4 rounded-lg whitespace-nowrap">
      NOUS GAME DE PRODUITS
</h2>

      <ImageSlider />
      <ServicesSection />
      <AboutSection />
      <ReussitesSection />
      <ContactSection />      

     <PartnersBar />
      <Footer />
      <WhatsAppButton />
    </main>
  );
}