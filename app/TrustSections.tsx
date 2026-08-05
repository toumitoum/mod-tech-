"use client";

import { motion } from "framer-motion";
import {
  Building2,
  Camera,
  Factory,
  HelpCircle,
  Home,
  Hotel,
  Store,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeInOut" as const } },
};

const industries = [
  { icon: Building2, label: "Entreprises" },
  { icon: Store, label: "Commerces" },
  { icon: Factory, label: "Industrie" },
  { icon: Hotel, label: "Hôtellerie" },
  { icon: Home, label: "Résidentiel" },
  { icon: Camera, label: "Sites sensibles" },
];

const faqs = [
  {
    q: "Intervenez-vous dans toute l'Algérie ?",
    a: "Oui, les projets peuvent être étudiés et planifiés selon la localisation, le volume et les contraintes du site.",
  },
  {
    q: "Proposez-vous la maintenance ?",
    a: "Oui, MOD-TECH accompagne l'installation avec des interventions de contrôle, d'ajustement et de maintenance.",
  },
  {
    q: "Pouvez-vous conseiller le bon matériel ?",
    a: "Oui, chaque solution est recommandée selon l'usage, le niveau de sécurité attendu et l'environnement technique.",
  },
];

export default function TrustSections() {
  return (
    <>
      <section aria-labelledby="industries-heading" className="industries-section bg-[#f8fafc] py-[clamp(72px,8vw,108px)]">
        <div className="mod-container overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_26px_70px_rgba(15,23,42,0.09)] lg:grid lg:grid-cols-[0.9fr_1.1fr]">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="relative overflow-hidden bg-[#effcfb] px-7 py-10 sm:px-10 sm:py-14"
          >
            <div aria-hidden="true" className="absolute inset-0 opacity-45" style={{ backgroundImage: "linear-gradient(rgba(112,231,193,0.11) 1px, transparent 1px), linear-gradient(90deg, rgba(112,231,193,0.11) 1px, transparent 1px)", backgroundSize: "46px 46px", maskImage: "linear-gradient(to bottom, black, transparent)" }} />
            <div aria-hidden="true" className="absolute -right-20 -top-20 h-64 w-64 rounded-full border border-[#56ddb4]/35" />
            <div aria-hidden="true" className="absolute bottom-10 right-10 h-24 w-24 rounded-full bg-[#56ddb4]/15 blur-2xl" />
            <div className="relative z-10">
              <div className="mb-5 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#70e7c1]">
                <span aria-hidden="true" className="h-px w-8 bg-[#70e7c1]" />
                Industries servies
              </div>
              <h2 id="industries-heading" className="mb-6 max-w-lg text-[clamp(2rem,3.8vw,3.5rem)] font-light leading-[1.02] tracking-[-0.04em] text-slate-950">Des solutions adaptées aux sites qui exigent de la fiabilité.</h2>
              <p className="max-w-md text-base leading-7 text-slate-600 sm:text-lg">
                MOD-TECH accompagne des environnements variés avec les mêmes priorités : sécurité, clarté et continuité de service.
              </p>
            </div>
          </motion.div>

          <div className="grid gap-px bg-slate-200 sm:grid-cols-2">
            {industries.map(({ icon: Icon, label }, index) => (
              <motion.div
                key={label}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="group flex min-h-32 items-center gap-4 bg-white p-6 transition-colors duration-300 hover:bg-teal-50"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 transition-all duration-300 group-hover:bg-teal-100">
                  <Icon className="h-5 w-5 text-slate-500 transition-colors duration-300 group-hover:text-[#0f9f92]" strokeWidth={1.8} />
                </div>
                <div>
                  <span className="block text-base font-semibold tracking-[-0.02em] text-slate-900">{label}</span>
                  <span aria-hidden="true" className="mt-1 block font-mono text-[10px] tracking-[0.16em] text-slate-400">0{index + 1}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="faq-heading" className="bg-[#0b1116] py-[clamp(88px,10vw,132px)]">
        <div className="mod-container grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-16">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="mb-5 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[#70e7c1]">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[#56ddb4]" />
              FAQ
            </div>
            <h2 id="faq-heading" className="max-w-md text-[clamp(2.2rem,4.4vw,4rem)] font-light leading-[0.98] tracking-[-0.045em] text-white">Questions fréquentes.</h2>
            <p className="mt-6 max-w-sm text-[15px] leading-7 text-slate-400">Les réponses essentielles avant de démarrer votre projet avec notre équipe.</p>
          </div>
          <div className="space-y-3">
            {faqs.map((item, index) => (
              <motion.details
                key={item.q}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="group rounded-[22px] border border-white/10 bg-[#081015] px-5 py-5 transition-all duration-300 open:border-[#56ddb4]/45 open:bg-[#0d1b20] open:shadow-[0_14px_34px_rgba(0,0,0,0.22)] sm:px-7"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold tracking-[-0.02em] text-white marker:content-none">
                  {item.q}
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-[#70e7c1] transition-all duration-300 group-open:rotate-45 group-open:border-[#56ddb4]/45 group-open:bg-[#56ddb4]/10">
                    <HelpCircle className="h-4 w-4" strokeWidth={1.8} />
                  </span>
                </summary>
                <p className="mt-4 max-w-2xl pr-12 text-sm leading-7 text-slate-400">{item.a}</p>
              </motion.details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
