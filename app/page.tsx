

import PartnersBar from "@/app/PartnersBar";
import AboutSection from "./AboutSection";
import ContactSection from "./ContactSection";
import Footer from "./Footer";
import HeroSection from "./HeroSection";
import ImageSlider from "./ImageSlider";
import Navbar from "./Navbar";
import ReussitesSection from "./ReussitesSection";
import ServicesSection from "./ServicesSection";
import WhatsAppButton from "./WhatsAppButton";
import TrustSections from "./TrustSections";


export default function Home() {
  return (
    <main className="mod-dark-page overflow-x-hidden">
      <a
        href="#accueil"
        className="sr-only fixed left-4 top-4 z-[100] rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-950 focus:not-sr-only"
      >
        Aller au contenu
      </a>

      <Navbar />
      <HeroSection />

      <ImageSlider />
      <ServicesSection />
      <AboutSection />
      <TrustSections />
      <ReussitesSection />
      <PartnersBar />
      <ContactSection />
      <Footer />
      <WhatsAppButton />
    </main>
  );
}
