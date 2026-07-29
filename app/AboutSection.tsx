"use client";
import { supabase } from "@/app/supabase";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import { motion } from "framer-motion";
import { ArrowUpRight,CheckCircle2 } from "lucide-react";
import { useEffect,useState } from "react";

const strengths = [
  "Expertise technique certifiée",
  "Équipements de haute qualité",
  "Solutions sur mesure",
  "Installation professionnelle",
  "Maintenance préventive",
  "Support réactif 7j/7",
];

const DEFAULT = {
  visible: true,
  title: "Votre partenaire technologique de confiance",
  description:
    "MOD-TECHNOLOGIE est une entreprise spécialisée dans les solutions de sécurité et les technologies de pointe.",
  mission:
    "Notre équipe d'experts qualifiés s'engage à fournir des installations de qualité supérieure, adaptées à chaque besoin.",
  years: "5+",
  clients: "200+",
  projects: "500+",
  image: "",
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: "easeInOut" as const } },
};

const AboutSection = () => {
  const [data, setData] = useState(DEFAULT);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    supabase
      .from("site_content")
      .select("content")
      .eq("section", "about")
      .single()
      .then(({ data: row }) => {
        if (row?.content) setData({ ...DEFAULT, ...row.content });
        setLoaded(true);
      });
  }, []);

  if (!loaded) return null;
  if (data.visible === false) return null;

  const stats = [
    { number: data.years,    label: "Années d'expérience", suffix: "" },
    { number: data.projects, label: "Projets réalisés",    suffix: "" },
    { number: data.clients,  label: "Clients satisfaits",  suffix: "" },
  ];

  return (
    <section id="apropos" className="relative overflow-hidden bg-[#030608] py-[clamp(88px,10vw,132px)] text-white">

      {/* ── Background details ── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-45"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)",
        }}
      />
      <div className="pointer-events-none absolute -bottom-60 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-[#0a62a5]/20 blur-[160px]" />

      <div className="relative z-10 mod-container">

        {/* ── Section label ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-7 flex items-center gap-3"
        >
          <span className="h-px w-8 bg-[#14c8b8]" />
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#70e7c1]">
            À propos
          </span>
        </motion.div>

        <div className="grid gap-12 lg:grid-cols-[1.05fr_.95fr] lg:gap-16">

          {/* ── LEFT: Text ── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2
              variants={fadeUp}
              className="max-w-3xl text-[clamp(2.5rem,5.2vw,5rem)] font-light leading-[0.98] tracking-[-0.055em] text-white"
            >
              {data.title}
            </motion.h2>

            <motion.p variants={fadeUp} className="mt-7 max-w-2xl text-[15px] leading-7 text-white/65 sm:text-base">
              {data.description}
            </motion.p>

            <motion.p variants={fadeUp} className="mt-4 max-w-2xl text-[15px] leading-7 text-white/65 sm:text-base">
              {data.mission}
            </motion.p>

            {/* Strengths grid */}
            <motion.div variants={fadeUp} className="mt-10 grid grid-cols-2 gap-px overflow-hidden bg-white/10 sm:grid-cols-3">
              {strengths.map((item) => (
                <div key={item} className="group min-h-28 bg-[#060b0e] p-4 transition-colors hover:bg-[#0a1519] sm:p-5">
                  <div className="mb-5 flex h-7 w-7 items-center justify-center rounded-full border border-[#14c8b8]/35 bg-[#14c8b8]/10">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#70e7c1]" />
                  </div>
                  <span className="text-xs font-medium leading-5 text-white/85 sm:text-sm">{item}</span>
                </div>
              ))}
            </motion.div>

            {/* CTA link */}
            <motion.div variants={fadeUp} className="mt-8">
              <a
                href="#contact"
                className="group inline-flex items-center gap-2 text-sm font-semibold text-[#70e7c1] transition-colors duration-200 hover:text-white"
              >
                Nous contacter
                <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </motion.div>
          </motion.div>

          {/* ── RIGHT: Image + Stats ── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-5"
          >
            {/* Image */}
            {data.image && (
              <div className="relative overflow-hidden rounded-[24px] border border-white/10">
                <img
                  src={data.image}
                  alt="À propos de MOD-TECHNOLOGIE"
                  className="w-full h-64 sm:h-72 object-cover object-center"
                />
                {/* Subtle teal tint overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#020608]/45 to-transparent" />
              </div>
            )}

            {/* Stats cards */}
            <div className="grid grid-cols-3 gap-px bg-white/10">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="relative bg-[#060b0e] p-4 text-center transition-colors duration-300 hover:bg-[#0a1519] sm:p-6"
                >
                  {/* Hover glow */}
                  <div className="relative z-10">
                    <div className="mb-2 text-3xl font-light leading-none tabular-nums text-white sm:text-4xl">
                      <AnimatedCounter value={stat.number} />
                    </div>
                    <div className="text-[9px] font-semibold uppercase leading-tight tracking-[0.12em] text-white/45 sm:text-[10px]">
                      {stat.label}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Decorative quote block */}
            <div className="relative border-l-2 border-[#14c8b8] bg-[#071216] px-6 py-5">
              <p className="text-sm font-medium italic leading-7 text-white/75">
                La sécurité n&apos;est pas un luxe — c&apos;est une nécessité que nous rendons accessible à tous.
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default AboutSection;
