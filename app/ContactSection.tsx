"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Send, MessageCircle } from "lucide-react";
import { supabase } from "@/app/supabase";

const DEFAULT = {
  phone1: "06 57 84 14 23",
  phone2: "06 69 21 19 51",
  email: "modtech.srv@gmail.com",
  address: "Algérie",
  whatsapp: "213556074480",
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65 } },
};

const ContactSection = () => {
  const [info, setInfo] = useState(DEFAULT);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    supabase
      .from("site_content")
      .select("content")
      .eq("section", "contact")
      .single()
      .then(({ data }) => {
        if (data?.content) setInfo({ ...DEFAULT, ...data.content });
      });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const message =
      `name: ${formData.name}\n` +
      `email: ${formData.email}\n` +
      `phone: ${formData.phone}\n` +
      `message: ${formData.message}`;
    const cleanPhone = info.whatsapp.replace(/\D/g, "");
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, "_blank");
    setFormData({ name: "", email: "", phone: "", message: "" });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const contactItems = [
    {
      icon: Phone,
      label: "Téléphone",
      value: `${info.phone1} / ${info.phone2}`,
      href: `tel:${info.phone1.replace(/\s/g, "")}`,
    },
    {
      icon: Mail,
      label: "Email",
      value: info.email,
      href: `mailto:${info.email}`,
    },
    {
      icon: MapPin,
      label: "Adresse",
      value: info.address,
      href: null,
    },
    {
      icon: MessageCircle,
      label: "WhatsApp",
      value: "Discuter sur WhatsApp",
      href: `https://wa.me/${info.whatsapp.replace(/\D/g, "")}`,
    },
  ];

  return (
    <section id="contact" className="relative py-24 sm:py-32 bg-white overflow-hidden">

      {/* ── Background ── */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(20,184,166,1) 1px, transparent 1px), linear-gradient(90deg, rgba(20,184,166,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-teal-400/8 blur-[120px] pointer-events-none" />

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
              Contact
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold leading-[1.15] tracking-tight text-slate-900 mb-4">
            Parlons de votre projet
          </h2>
         
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-10 lg:gap-16 items-start">

          {/* ── LEFT: Contact info ── */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-2 flex flex-col gap-4"
          >
            {contactItems.map((item, i) => {
              const inner = (
                <div className="flex items-start gap-4 p-4 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-300 group">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0 group-hover:bg-teal-500 group-hover:border-teal-500 transition-colors duration-300">
                    <item.icon className="w-4 h-4 text-teal-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-0.5">{item.label}</p>
                    <p className="text-sm font-semibold text-slate-800 truncate">{item.value}</p>
                  </div>
                </div>
              );

              return (
                <motion.div
                  key={item.label}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  {item.href ? (
                    <a href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                      {inner}
                    </a>
                  ) : inner}
                </motion.div>
              );
            })}

            {/* Availability badge */}
            <div className="mt-2 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-teal-50 border border-teal-100">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500" />
              </span>
              <span className="text-xs text-teal-700 font-medium">Disponible du Samedi au Jeudi · 8h–18h</span>
            </div>
          </motion.div>

          {/* ── RIGHT: Form ── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-3"
          >
            <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6 sm:p-8">
              <h3 className="text-lg font-bold text-slate-900 mb-1">Envoyez-nous un message</h3>
              <p className="text-sm text-slate-400 mb-7">Remplissez le formulaire — on vous répond rapidement.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Nom complet</label>
                    <input
                      placeholder="Votre nom complet"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="bg-slate-50 border border-slate-200 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none w-full transition-all duration-200 placeholder:text-slate-400"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</label>
                    <input
                      type="email"
                      placeholder="@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="bg-slate-50 border border-slate-200 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none w-full transition-all duration-200 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Téléphone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-slate-50 border border-slate-200 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none w-full transition-all duration-200 placeholder:text-slate-400"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Message</label>
                  <textarea
                    placeholder="Décrivez votre projet ou votre besoin..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={5}
                    className="bg-slate-50 border border-slate-200 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none w-full resize-none transition-all duration-200 placeholder:text-slate-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitted}
                  className={`group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 font-bold text-sm rounded-xl transition-all duration-200 shadow-md active:scale-[0.98] ${
                    submitted
                      ? "bg-teal-100 text-teal-600 cursor-default shadow-none"
                      : "bg-teal-500 hover:bg-teal-400 text-white shadow-teal-500/25 hover:shadow-teal-400/30"
                  }`}
                >
                  {submitted ? (
                    <>
                      <span className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                      Message envoyé !
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      Envoyer via WhatsApp
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default ContactSection;