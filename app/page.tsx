"use client";
import Navbar from "./Navbar";
import HeroSection from "./HeroSection";
import ServicesSection from "./ServicesSection";
import AboutSection from "./AboutSection";
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
      <ImageSlider />
      <ServicesSection />
      <AboutSection />
      <ContactSection />      



     <PartnersBar />
      <Footer />
      <WhatsAppButton />
    </main>
  );
}
