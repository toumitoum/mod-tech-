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
import { useEffect,useRef,useState } from "react";

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
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const initialOverflow = document.body.style.overflow;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", h);
      document.body.style.overflow = initialOverflow;
      previouslyFocused?.focus();
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-6"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-slate-900/35 backdrop-blur-md" />

      <motion.div
        initial={{ opacity: 0, y: 56, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 56, scale: 0.98 }}
        transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="service-modal-title"
        aria-describedby="service-modal-description"
        className="relative z-10 w-full overflow-hidden rounded-t-[28px] border border-slate-200 bg-white sm:max-w-2xl sm:rounded-[28px]"
        style={{
          maxHeight: "90vh",
          boxShadow: "0 32px 90px rgba(15, 23, 42, 0.22)"
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Mobile pill */}
        <div className="sm:hidden absolute top-3 left-1/2 z-10 h-[3px] w-8 -translate-x-1/2 rounded-full bg-slate-300" />

        {/* Close */}
        <button type="button"
          ref={closeButtonRef}
          onClick={onClose}
          title="Fermer"
          aria-label="Fermer la fenêtre de service"
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/90 text-slate-800 shadow-lg backdrop-blur transition-colors hover:border-[#14c8b8]/55 hover:text-[#0f9f92]"
        >
          <X className="h-4 w-4" strokeWidth={2.5} />
        </button>

        <div className="overflow-y-auto" style={{ maxHeight: "90vh" }}>

          {/* Image */}
          <div className="relative h-64 overflow-hidden sm:h-72">
            <img src={imgSrc} alt={service.title} className="w-full h-full object-cover" />
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to top, rgba(15,23,42,0.76) 0%, rgba(15,23,42,0.28) 52%, rgba(15,23,42,0.04) 100%)" }}
            />
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-[#56ddb4]/35 bg-[#56ddb4]/10 backdrop-blur-sm">
                <Icon className="text-[#70e7c1]" style={{ width: 17, height: 17 }} />
              </div>
              <h3 id="service-modal-title" className="text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl">
                {service.title}
              </h3>
            </div>
          </div>

          {/* Body */}
          <div className="flex flex-col gap-7 px-6 py-7 sm:px-8 sm:py-8">

            {/* Full description */}
            {service.description ? (
              <p id="service-modal-description" className="text-[15px] leading-7 text-slate-600">
                {service.description}
              </p>
            ) : (
              <p id="service-modal-description" className="text-sm italic text-slate-400">Aucune description disponible.</p>
            )}

            {/* Divider */}
            <div className="h-px w-full bg-slate-200" />

            {/* Actions */}
            <div className="flex flex-col gap-3">

              {/* Devis — primary */}
              {wa ? (
                <a
                  href={`https://wa.me/${wa}?text=${waMsg}`}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex min-h-12 w-full items-center justify-between rounded-xl bg-[#56ddb4] px-5 text-[14px] font-bold text-[#061116] transition hover:bg-[#70e7c1] active:scale-[0.99]"
                  style={{
                    boxShadow: "0 16px 34px rgba(20, 200, 184, 0.18), inset 0 1px 0 rgba(255,255,255,0.24)"
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
                  className="flex min-h-12 w-full items-center justify-between rounded-xl bg-[#56ddb4] px-5 text-[14px] font-bold text-[#061116] transition hover:bg-[#70e7c1]"
                  style={{
                    boxShadow: "0 16px 34px rgba(20, 200, 184, 0.18)"
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
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {contact.phone1 && (
                    <a href={`tel:${contact.phone1}`}
                      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] font-medium text-slate-700 transition-all duration-200 hover:border-[#14c8b8]/45 hover:bg-teal-50">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#56ddb4]/10">
                        <Phone className="h-3 w-3 text-[#0f9f92]" />
                      </div>
                      <span className="font-semibold">{contact.phone1}</span>
                    </a>
                  )}
                  {contact.phone2 && (
                    <a href={`tel:${contact.phone2}`}
                      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] font-medium text-slate-700 transition-all duration-200 hover:border-[#14c8b8]/45 hover:bg-teal-50">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#56ddb4]/10">
                        <Phone className="h-3 w-3 text-[#0f9f92]" />
                      </div>
                      <span className="font-semibold">{contact.phone2}</span>
                    </a>
                  )}
                  {contact.email && (
                    <a href={`mailto:${contact.email}`}
                      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] font-medium text-slate-700 transition-all duration-200 hover:border-[#14c8b8]/45 hover:bg-teal-50 sm:col-span-2">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#56ddb4]/10">
                        <Mail className="h-3 w-3 text-[#0f9f92]" />
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
      <section id="services" aria-labelledby="services-heading" className="relative isolate overflow-hidden bg-[#060a0e] py-[clamp(88px,10vw,132px)] scroll-mt-28">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "linear-gradient(rgba(148,163,184,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.07) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
            maskImage: "linear-gradient(to bottom, transparent, black 14%, black 86%, transparent)",
          }}
        />
        <div aria-hidden="true" className="pointer-events-none absolute -left-32 top-12 h-80 w-80 rounded-full bg-[#12cbb8]/[0.08] blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute right-0 top-1/2 h-px w-[42%] bg-gradient-to-l from-[#56ddb4]/45 to-transparent" />

        <div className="relative z-10 mod-container">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-10 grid gap-8 border-b border-white/10 pb-10 sm:mb-14 sm:pb-12 lg:grid-cols-12 lg:items-end"
          >
            <div className="lg:col-span-8">
              <div className="mb-5 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[#70e7c1]">
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[#56ddb4] shadow-[0_0_16px_rgba(86,221,180,0.9)]" />
                Nos expertises
              </div>
              <h2 id="services-heading" className="max-w-4xl text-[clamp(2.3rem,5.6vw,5rem)] font-light leading-[0.98] tracking-[-0.045em] text-white">
                Solutions complètes pour{" "}
                <span className="text-[#56ddb4]">
                  votre sécurité
                </span>
              </h2>
            </div>
            <p className="max-w-sm text-[15px] leading-7 text-slate-400 sm:text-base lg:col-span-4 lg:justify-self-end lg:text-right">
              De la conception à l&apos;installation,<br className="hidden sm:block" />
              des solutions sur mesure adaptées à chaque besoin.
            </p>
          </motion.div>

          {/* ── Cards ── */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-5 lg:grid-cols-12">
            {services.map((service, i) => {
              const staticData = STATIC[i] ?? STATIC[0];
              const imgSrc = service.image ? service.image : staticData.fallback.src;
              const isFeature = i === 0;
              const isSecondary = i === 1;
              const desc = service.description || "";
              const preview = desc.length > 92 ? desc.slice(0, 92).trimEnd() + "…" : desc;

              return (
                <motion.button
                  type="button"
                  key={service.id ?? i}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => setSelected({ service, index: i })}
                  aria-label={`Découvrir ${service.title}`}
                  aria-haspopup="dialog"
                  className={`group relative flex min-h-[320px] overflow-hidden bg-[#05080b] text-left transition-transform duration-300 hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#70e7c1] sm:min-h-[340px] sm:rounded-[28px] sm:border sm:border-white/10 sm:shadow-[0_18px_45px_rgba(0,0,0,0.22)] sm:hover:border-[#56ddb4]/65 sm:hover:shadow-[0_28px_64px_rgba(0,0,0,0.38)] ${
                    isFeature
                      ? "lg:col-span-7 lg:min-h-[470px]"
                      : isSecondary
                        ? "lg:col-span-5 lg:min-h-[470px]"
                        : "lg:col-span-4"
                  }`}
                >
                  {/* Image */}
                  <img
                    src={imgSrc}
                    alt={service.title}
                    className="absolute inset-0 h-full w-full object-cover opacity-99 saturate-[0.72] transition-transform duration-700 ease-out group-hover:scale-[1.04] group-hover:opacity-80 group-hover:saturate-100 sm:opacity-10 sm:group-hover:scale-[1.06] sm:group-hover:opacity-80"
                  />
                  <div className="relative z-10 flex w-full flex-col justify-between p-4 sm:p-7">
                    <div />

                    <div className="max-w-md">
                      <h3 className={`font-medium leading-[1.08] tracking-[-0.03em] text-white ${isFeature || isSecondary ? "text-3xl sm:text-4xl" : "text-xl sm:text-2xl"}`}>
                        {service.title}
                      </h3>

                      {preview && (
                        <p className="mt-4 max-w-lg text-sm leading-6 text-white/68">
                          {preview}
                        </p>
                      )}

                    </div>
                  </div>
                </motion.button>
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
