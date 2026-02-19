"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { supabase } from "@/app/supabase";

const strengths = [
  "Expertise technique certifiée",
  "Équipements de haute qualité",
  "Support réactif 7j/7",
  "Solutions sur mesure",
  "Installation professionnelle",
  "Maintenance préventive",
];

const DEFAULT = {
  title: "Votre partenaire technologique de confiance",
  description: "MOD-TECHNOLOGIE est une entreprise spécialisée dans les solutions de sécurité et les technologies de pointe. Nous accompagnons les entreprises et les particuliers dans la mise en place de systèmes fiables et innovants.",
  mission: "Notre équipe d'experts qualifiés s'engage à fournir des installations de qualité supérieure, un service client irréprochable et un suivi technique continu pour garantir votre satisfaction.",
  years: "5+",
  clients: "200+",
  projects: "500+",
};

const AboutSection = () => {
  const [data, setData] = useState(DEFAULT);

  useEffect(() => {
    supabase
      .from("site_content")
      .select("content")
      .eq("section", "about")
      .single()
      .then(({ data: row }) => {
        if (row?.content) setData({ ...DEFAULT, ...row.content });
      });
  }, []);

  return (
    <section id="apropos" className="py-24 bg-muted/30 relative">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-sm font-medium text-primary tracking-wide uppercase">
              À propos
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold mt-3 mb-6">
              {data.title}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              {data.description}
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              {data.mission}
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {strengths.map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 gap-4"
          >
            {[
              { number: data.years,    label: "Années d'expérience" },
              { number: data.projects, label: "Projets réalisés" },
              { number: data.clients,  label: "Clients satisfaits" },
              { number: "24/7",        label: "Support technique" },
            ].map((stat) => (
              <div key={stat.label} className="p-6 rounded-xl bg-card border border-border text-center">
                <div className="text-3xl font-heading font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
