"use client";
import { supabase } from "@/app/supabase";
import serviceAcces from "@/assets/service-acces.jpg";
import serviceDomotique from "@/assets/service-domotique.jpg";
import serviceReseaux from "@/assets/service-reseaux.jpg";
import serviceSecurite from "@/assets/service-securite.jpg";
import serviceSonorisation from "@/assets/service-sonorisation.jpg";
import { AnimatePresence,motion } from "framer-motion";
import {
Home,Lock,
Mail,MessageCircle,MoveUpRight,
Network,
Phone,
Shield,
Volume2,
X
} from "lucide-react";
import { useEffect,useState } from "react";

const STATIC = [
  { icon: Shield,  fallback: serviceSecurite },
  { icon: Network, fallback: serviceReseaux },
  { icon: Home,    fallback: serviceDomotique },
  { icon: Lock,    fallback: serviceAcces },
  { icon: Volume2, fallback: serviceSonorisation },
];

const DEFAULT_SERVICES = [
  { id: 1, title: "Systèmes de Sécurité",  description: "", icon: "lock",    image: "" },
  { id: 2, title: "Réseaux Informatiques", description: "", icon: "network", image: "" },
  { id: 3, title: "Domotique",             description: "", icon: "home",    image: "" },
  { id: 4, title: "Contrôle d'Accès",      description: "", icon: "lock2",   image: "" },
  { id: 5, title: "Sonorisation",          description: "", icon: "volume",  image: "" },
];

type Service = typeof DEFAULT_SERVICES[0];
type ContactInfo = { phone1?: string; phone2?: string; email?: string; whatsapp?: string };

// ─── Modal ────────────────────────────────────────────────────────────────────
function ServiceModal({ service, staticData, onClose, contact }: {
  service: Service;
  staticData: typeof STATIC[0];
  onClose: () => void;
  contact: ContactInfo;
}) {
  const imgSrc = service.image || staticData.fallback.src;
  const Icon = staticData.icon;
  const wa = (contact.whatsapp || contact.phone1 || "").replace(/\D/g, "");
  const waMsg = encodeURIComponent(`Bonjour, je souhaite un devis pour : *${service.title}*`);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-6"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-md" />

      <motion.div
        initial={{ opacity: 0, y: 56, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 56, scale: 0.98 }}
        transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full sm:max-w-xl bg-white rounded-t-[28px] sm:rounded-2xl overflow-hidden"
        style={{
          maxHeight: "90vh",
          boxShadow: "0 24px 60px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.05)"
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Mobile pill */}
        <div className="sm:hidden absolute top-3 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-full bg-slate-300 z-10" />

        {/* Close */}
        <button
          onClick={onClose}
          title="Close dialog"
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/85 backdrop-blur border border-slate-200 flex items-center justify-center hover:bg-white transition-colors shadow-sm"
        >
          <X className="w-3.5 h-3.5 text-slate-500" strokeWidth={2.5} />
        </button>

        <div className="overflow-y-auto" style={{ maxHeight: "90vh" }}>

          {/* Image */}
          <div className="relative h-56 sm:h-64 overflow-hidden">
            <img src={imgSrc} alt={service.title} className="w-full h-full object-cover" />
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to top, rgba(4,6,12,0.92) 0%, rgba(4,6,12,0.35) 50%, transparent 100%)" }}
            />
            <div className="absolute bottom-0 left-0 right-0 px-6 pb-6">
              <div className="w-8 h-8 rounded-lg bg-white/12 border border-white/20 flex items-center justify-center mb-3">
                <Icon className="text-white" style={{ width: 15, height: 15 }} />
              </div>
              <h3 className="text-2xl font-bold text-white leading-tight tracking-tight">
                {service.title}
              </h3>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-7 flex flex-col gap-6">

            {/* Full description */}
            {service.description ? (
              <p className="text-[14.5px] text-slate-600 leading-[1.8]">
                {service.description}
              </p>
            ) : (
              <p className="text-sm text-slate-400 italic">Aucune description disponible.</p>
            )}

            {/* Divider */}
            <div className="h-px w-full bg-slate-100" />

            {/* Actions */}
            <div className="flex flex-col gap-2.5">

              {/* Devis — primary */}
              {wa ? (
                <a
                  href={`https://wa.me/${wa}?text=${waMsg}`}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-between w-full px-5 py-3.5 rounded-xl font-semibold text-[14px] text-white transition-all duration-200 hover:brightness-105 active:scale-[0.99]"
                  style={{
                    background: "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)",
                    boxShadow: "0 4px 20px rgba(13,148,136,0.28), inset 0 1px 0 rgba(255,255,255,0.1)"
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <MessageCircle className="w-4 h-4" />
                    <span>Demander un devis</span>
                  </div>
                  <MoveUpRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              ) : (
                <a
                  href="#contact"
                  onClick={onClose}
                  className="flex items-center justify-between w-full px-5 py-3.5 rounded-xl font-semibold text-[14px] text-white transition-all duration-200"
                  style={{
                    background: "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)",
                    boxShadow: "0 4px 20px rgba(13,148,136,0.28)"
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <MessageCircle className="w-4 h-4" />
                    <span>Demander un devis</span>
                  </div>
                  <MoveUpRight className="w-3.5 h-3.5 opacity-60" />
                </a>
              )}

              {/* Direct contacts */}
              {(contact.phone1 || contact.phone2 || contact.email) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {contact.phone1 && (
                    <a href={`tel:${contact.phone1}`}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-medium text-slate-700 bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-white hover:shadow-sm transition-all duration-200">
                      <div className="w-6 h-6 rounded-lg bg-slate-200/70 flex items-center justify-center shrink-0">
                        <Phone className="w-3 h-3 text-slate-500" />
                      </div>
                      <span className="font-semibold">{contact.phone1}</span>
                    </a>
                  )}
                  {contact.phone2 && (
                    <a href={`tel:${contact.phone2}`}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-medium text-slate-700 bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-white hover:shadow-sm transition-all duration-200">
                      <div className="w-6 h-6 rounded-lg bg-slate-200/70 flex items-center justify-center shrink-0">
                        <Phone className="w-3 h-3 text-slate-500" />
                      </div>
                      <span className="font-semibold">{contact.phone2}</span>
                    </a>
                  )}
                  {contact.email && (
                    <a href={`mailto:${contact.email}`}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-medium text-slate-700 bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-white hover:shadow-sm transition-all duration-200 ${(contact.phone1 || contact.phone2) ? "sm:col-span-2" : "sm:col-span-2"}`}>
                      <div className="w-6 h-6 rounded-lg bg-slate-200/70 flex items-center justify-center shrink-0">
                        <Mail className="w-3 h-3 text-slate-500" />
                      </div>
                      <span>{contact.email}</span>
                    </a>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const ServicesSection = () => {
  const [services, setServices] = useState(DEFAULT_SERVICES);
  const [selected, setSelected] = useState<{ service: Service; index: number } | null>(null);
  const [contact, setContact] = useState<ContactInfo>({});

  useEffect(() => {
    supabase.from("site_content").select("content").eq("section", "services").single()
      .then(({ data }) => { if (data?.content && Array.isArray(data.content)) setServices(data.content); });
    supabase.from("site_content").select("content").eq("section", "contact").single()
      .then(({ data }) => { if (data?.content) setContact(data.content); });
  }, []);

  return (
    <>
<section id="services" className="relative py-24 sm:py-32 bg-white overflow-hidden scroll-mt-28">        {/* Background */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{
          backgroundImage: "linear-gradient(rgba(20,184,166,1) 1px, transparent 1px), linear-gradient(90deg, rgba(20,184,166,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-teal-400/5 blur-[140px] pointer-events-none" />

        <div className="relative z-10 container mx-auto px-5 sm:px-8 lg:px-12 max-w-7xl">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 sm:mb-20"
          >
            <div className="flex items-center gap-3 mb-5">
              <span className="h-px w-8 bg-teal-500" />
              <span className="text-xs font-semibold text-teal-600 uppercase tracking-widest">Nos services</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold leading-[1.15] tracking-tight text-slate-900 max-w-xl">
                Solutions complètes pour{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-teal-700">
                  votre sécurité
                </span>
              </h2>
              <p className="text-slate-500 text-[15px] leading-relaxed max-w-sm sm:text-right">
                De la conception à l&apos;installation,<br className="hidden sm:block" />
                des solutions sur mesure adaptées à chaque besoin.
              </p>
            </div>
          </motion.div>

          {/* ── Cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {services.map((service, i) => {
              const staticData = STATIC[i] ?? STATIC[0];
              const Icon = staticData.icon;
              const imgSrc = service.image ? service.image : staticData.fallback.src;
              const isFeature = i === 0;
              const desc = service.description || "";
              const preview = desc.length > 92 ? desc.slice(0, 92).trimEnd() + "…" : desc;

              return (
                <motion.article
                  key={service.id ?? i}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => setSelected({ service, index: i })}
                  className={`group relative bg-white rounded-2xl border border-slate-100 overflow-hidden flex flex-col cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/70 hover:border-slate-200 ${
                    isFeature ? "sm:col-span-2 lg:col-span-2" : ""
                  }`}
                  style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
                >
                  {/* Image */}
                  <div className={`relative overflow-hidden shrink-0 ${isFeature ? "h-60 sm:h-72" : "h-48 sm:h-52"}`}>
                    <img
                      src={imgSrc}
                      alt={service.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                    />
                    {/* Subtle bottom vignette always visible */}
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(2,4,10,0.38) 0%, transparent 55%)" }} />

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-teal-950/0 group-hover:bg-teal-950/20 transition-colors duration-400 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-y-1 group-hover:translate-y-0 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md">
                        <MoveUpRight className="w-4 h-4 text-slate-800" />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex flex-col flex-1 p-5 sm:p-6">

                    {/* Icon + title */}
                    <div className="flex items-start gap-3.5 mb-3.5">
                      <div
                        className="w-9 h-9 rounded-xl shrink-0 mt-0.5 flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                        style={{
                          background: "linear-gradient(135deg, rgba(13,148,136,0.1), rgba(13,148,136,0.18))",
                          border: "1px solid rgba(13,148,136,0.18)",
                        }}
                      >
                        <Icon style={{ width: 17, height: 17, color: "#0d9488" }} />
                      </div>
                      <h3 className="text-[15px] font-bold text-slate-900 leading-snug tracking-tight pt-1">
                        {service.title}
                      </h3>
                    </div>

                    {/* Preview */}
                    {preview && (
                      <p className="text-[13px] text-slate-500 leading-[1.75] flex-1">
                        {preview}
                      </p>
                    )}

                    {/* Footer */}
                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-teal-600 group-hover:text-teal-700 transition-colors">
Plus de détails                        <MoveUpRight className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                      <span className="text-[10px] text-slate-300 font-mono tracking-widest">
                        0{i + 1}
                      </span>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>

        </div>
      </section>

      {/* Modal */}
      <AnimatePresence>
        {selected && (
          <ServiceModal
            service={selected.service}
            staticData={STATIC[selected.index] ?? STATIC[0]}
            onClose={() => setSelected(null)}
            contact={contact}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default ServicesSection;
