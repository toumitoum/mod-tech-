

import Navbar from "./Navbar";
import HeroSection from "./HeroSection";
import ServicesSection from "./ServicesSection";
import AboutSection from "./AboutSection";
import ReussitesSection from "./ReussitesSection";
import Footer from "./Footer";
import WhatsAppButton from "./WhatsAppButton";
import PartnersBar from "@/app/PartnersBar";
import ImageSlider from "./ImageSlider";
import ContactSection from "./ContactSection";


export default function Home() {
  return (
    <main className="overflow-x-hidden">

      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <HeroSection />

   

    
<ImageSlider />
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