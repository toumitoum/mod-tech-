

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