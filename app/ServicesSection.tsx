"use client";

import { motion } from "framer-motion";
import { Shield, Network, Home, Lock, Volume2 } from "lucide-react";
import serviceSecurite from "@/assets/service-securite.jpg";
import serviceReseaux from "@/assets/service-reseaux.jpg";
import serviceDomotique from "@/assets/service-domotique.jpg";
import serviceAcces from "@/assets/service-acces.jpg";
import serviceSonorisation from "@/assets/service-sonorisation.jpg";

const services = [
  {
    icon: Shield,
    title: "Sécurité & Surveillance",
    description:
      "Installation de caméras de surveillance, systèmes d'alarme et vidéosurveillance intelligente pour protéger vos locaux 24h/24.",
    image: serviceSecurite,
  },
  {
    icon: Network,
    title: "Réseaux Informatiques",
    description:
      "Conception, déploiement et maintenance de réseaux LAN/WAN, câblage structuré et solutions WiFi professionnelles.",
    image: serviceReseaux,
  },
  {
    icon: Home,
    title: "Domotique",
    description:
      "Automatisation intelligente de votre habitat ou bureau : éclairage, climatisation, volets et gestion énergétique centralisée.",
    image: serviceDomotique,
  },
  {
    icon: Lock,
    title: "Contrôle d'Accès",
    description:
      "Systèmes de badges, biométrie, interphones vidéo et gestion des accès pour sécuriser vos entrées et espaces sensibles.",
    image: serviceAcces,
  },
  {
    icon: Volume2,
    title: "Sonorisation",
    description:
      "Installation de systèmes audio professionnels pour entreprises, commerces, salles de conférence et espaces publics.",
    image: serviceSonorisation,
  },
];

const ServicesSection = () => {
  return (
    <section id="services" className="py-24 bg-background relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-primary tracking-wide uppercase">
            Nos services
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold mt-3 mb-4">
            Solutions complètes pour votre sécurité
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            De la conception à l'installation, nous vous accompagnons avec des solutions
            technologiques sur mesure adaptées à vos besoins.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 overflow-hidden"
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={service.image.src}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 w-fit mb-5 group-hover:bg-primary/20 transition-colors">
                  <service.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-heading font-semibold mb-3">{service.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {service.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
