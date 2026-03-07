"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shield, Network, Home, Lock, Volume2, ArrowUpRight } from "lucide-react";
import serviceSecurite from "@/assets/service-securite.jpg";
import serviceReseaux from "@/assets/service-reseaux.jpg";
import serviceDomotique from "@/assets/service-domotique.jpg";
import serviceAcces from "@/assets/service-acces.jpg";
import serviceSonorisation from "@/assets/service-sonorisation.jpg";
import { supabase } from "@/app/supabase";

const STATIC = [
  { icon: Shield,  fallback: serviceSecurite     },
  { icon: Network, fallback: serviceReseaux      },
  { icon: Home,    fallback: serviceDomotique    },
  { icon: Lock,    fallback: serviceAcces        },
  { icon: Volume2, fallback: serviceSonorisation },
];

const DEFAULT_SERVICES = [
  { id: 1, title: "Systèmes de Sécurité",   description: "Installation de caméras de surveillance, alarmes et systèmes de détection pour protéger vos locaux 24h/24.", icon: "lock",    image: "" },
  { id: 2, title: "Réseaux Informatiques",  description: "Infrastructure réseau fiable et performante, câblage structuré, Wi-Fi professionnel et maintenance.",           icon: "network", image: "" },
  { id: 3, title: "Domotique",              description: "Maisons et bureaux connectés : éclairage, volets, climatisation et sécurité pilotés depuis votre smartphone.",  icon: "home",    image: "" },
  { id: 4, title: "Contrôle d'Accès",       description: "Systèmes modernes de badges, biométrie et interphonie pour maîtriser les accès à vos espaces.",                icon: "lock2",   image: "" },
  { id: 5, title: "Sonorisation",           description: "Solutions audio professionnelles pour entreprises, commerces et événements avec une qualité sonore optimale.",  icon: "volume",  image: "" },
];

const ServicesSection = () => {
  const [services, setServices] = useState(DEFAULT_SERVICES);

  useEffect(() => {
    supabase
      .from("site_content")
      .select("content")
      .eq("section", "services")
      .single()
      .then(({ data }) => {
        if (data?.content && Array.isArray(data.content)) {
          setServices(data.content);
        }
      });
  }, []);

  return (
    <section id="services" className="relative py-24 sm:py-32 bg-white overflow-hidden">

      {/* ── Background ── */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(20,184,166,1) 1px, transparent 1px), linear-gradient(90deg, rgba(20,184,166,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-teal-400/6 blur-[120px] pointer-events-none" />

      <div className="relative z-10 container mx-auto px-5 sm:px-8 lg:px-12 max-w-7xl">

        {/* ── Header ── */}
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
              Nos services
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold leading-[1.15] tracking-tight text-slate-900 max-w-xl">
              Solutions complètes pour{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-600">
                votre sécurité
              </span>
            </h2>
            <p className="text-slate-500 text-[15px] leading-relaxed max-w-sm sm:text-right">
              De la conception à l'installation, des solutions sur mesure adaptées à chaque besoin.
            </p>
          </div>
        </motion.div>

        {/* ── Cards grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service, i) => {
            const staticData = STATIC[i] ?? STATIC[0];
            const Icon = staticData.icon;
            const imgSrc = service.image ? service.image : staticData.fallback.src;

            // Make the first card span 2 columns on large screens for visual interest
            const isFeature = i === 0;

            return (
              <motion.div
                key={service.id ?? i}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className={`group relative rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/60 hover:border-teal-200 transition-all duration-300 overflow-hidden flex flex-col ${
                  isFeature ? "lg:col-span-2" : ""
                }`}
              >
                {/* Image */}
                <div className={`overflow-hidden shrink-0 ${isFeature ? "h-56 sm:h-64" : "h-44 sm:h-48"}`}>
                  <img
                    src={imgSrc}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Gradient overlay on image */}
                  <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 p-6">
                  {/* Icon badge */}
                  <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center mb-4 group-hover:bg-teal-500 group-hover:border-teal-500 transition-colors duration-300">
                    <Icon className="w-5 h-5 text-teal-600 group-hover:text-white transition-colors duration-300" />
                  </div>

                  <h3 className="text-base lg:text-lg font-bold text-slate-900 mb-2 leading-snug">
                    {service.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed flex-1">
                    {service.description}
                  </p>

                  {/* Learn more link */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <a
                      href="#contact"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors duration-200 group/link"
                    >
                      Demander un devis
                      <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                    </a>
                    <span className="text-[10px] text-slate-300 uppercase tracking-widest font-medium">
                      0{i + 1}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default ServicesSection;