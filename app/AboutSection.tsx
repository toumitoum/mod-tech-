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
    <section id="apropos" className="relative py-24 sm:py-32 bg-white overflow-hidden">

      {/* ── Background details ── */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(20,184,166,1) 1px, transparent 1px), linear-gradient(90deg, rgba(20,184,166,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-teal-400/8 blur-[120px] pointer-events-none" />

      <div className="relative z-10 container mx-auto px-5 sm:px-8 lg:px-12 max-w-7xl">

        {/* ── Section label ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 mb-14 sm:mb-20"
        >
          <span className="h-px w-8 bg-teal-500" />
          <span className="text-xs font-semibold text-teal-600 uppercase tracking-widest">
            À propos
          </span>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">

          {/* ── LEFT: Text ── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2
              variants={fadeUp}
              className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold leading-[1.15] tracking-tight text-slate-900 mb-6"
            >
              {data.title}
            </motion.h2>

            <motion.p variants={fadeUp} className="text-slate-500 leading-relaxed mb-5 text-[15px]">
              {data.description}
            </motion.p>

            <motion.p variants={fadeUp} className="text-slate-500 leading-relaxed mb-10 text-[15px]">
              {data.mission}
            </motion.p>

            {/* Strengths grid */}
            <motion.div variants={fadeUp} className="grid sm:grid-cols-2 gap-y-3 gap-x-4">
              {strengths.map((item) => (
                <div key={item} className="flex items-center gap-2.5 group">
                  <div className="w-5 h-5 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center shrink-0 group-hover:bg-teal-500 group-hover:border-teal-500 transition-colors duration-200">
                    <CheckCircle2 className="w-3 h-3 text-teal-500 group-hover:text-white transition-colors duration-200" />
                  </div>
                  <span className="text-sm text-slate-700 font-medium">{item}</span>
                </div>
              ))}
            </motion.div>

            {/* CTA link */}
            <motion.div variants={fadeUp} className="mt-10">
              <a
                href="#contact"
                className="group inline-flex items-center gap-2 text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors duration-200"
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
            className="flex flex-col gap-6"
          >
            {/* Image */}
            {data.image && (
              <div className="relative overflow-hidden rounded-2xl shadow-xl shadow-slate-200/60">
                <img
                  src={data.image}
                  alt="À propos de MOD-TECHNOLOGIE"
                  className="w-full h-64 sm:h-72 object-cover object-center"
                />
                {/* Subtle teal tint overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-teal-900/10 to-transparent" />
              </div>
            )}

            {/* Stats cards */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="relative group p-4 sm:p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-300 text-center overflow-hidden"
                >
                  {/* Hover glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-50/0 to-teal-100/0 group-hover:from-teal-50/60 group-hover:to-teal-100/30 transition-all duration-300 rounded-2xl" />

                  <div className="relative z-10">
                    <div className="text-2xl sm:text-3xl font-extrabold text-teal-500 tabular-nums mb-1 leading-none">
                      <AnimatedCounter value={stat.number} />
                    </div>
                    <div className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider leading-tight">
                      {stat.label}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Decorative quote block */}
            <div className="relative rounded-2xl border border-teal-100 bg-teal-50/60 px-6 py-5">
              <span className="absolute -top-3 left-5 text-teal-300 text-5xl leading-none font-serif select-none">&quot;</span>
              <p className="text-sm text-teal-800 leading-relaxed pt-2 font-medium italic">
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
