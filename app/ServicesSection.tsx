"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shield, Network, Home, Lock, Volume2 } from "lucide-react";
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
  { id:1, title:"Systemes de Securite",  description:"Installation de cameras de surveillance.", icon:"lock", image:"" },
  { id:2, title:"Reseaux Informatiques", description:"Infrastructure reseau fiable.",             icon:"network", image:"" },
  { id:3, title:"Domotique",             description:"Maisons connectees.",                       icon:"home", image:"" },
  { id:4, title:"Controle Acces",        description:"Systemes modernes.",                        icon:"lock2", image:"" },
  { id:5, title:"Sonorisation",          description:"Audio professionnel.",                      icon:"volume", image:"" },
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
            Solutions completes pour votre securite
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            De la conception a l installation, nous vous accompagnons avec des solutions
            technologiques sur mesure adaptees a vos besoins.
          </p>
        </motion.div>

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">          {services.map((service, i) => {
            const staticData = STATIC[i] ?? STATIC[0];
            const Icon = staticData.icon;
            const imgSrc = service.image ? service.image : staticData.fallback.src;

            return (
              <motion.div
                key={service.id ?? i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 overflow-hidden"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={imgSrc}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 w-fit mb-5 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-base md:text-lg font-heading font-semibold mb-3">{service.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
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