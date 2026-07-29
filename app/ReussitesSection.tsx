"use client";

import { supabase } from "@/app/supabase";
import { AnimatePresence,motion } from "framer-motion";
import { ChevronLeft,ChevronRight,X,ZoomIn } from "lucide-react";
import { useEffect,useRef,useState } from "react";

type Project = {
  id: number;
  image: string;
  title: string;
  category: string;
  is_active: boolean;
  sort_order: number;
};

export default function ReussitesSection() {
  const [visible, setVisible]           = useState(true);
  const [projects, setProjects]         = useState<Project[]>([]);
  const [selectedIdx, setSelectedIdx]   = useState<number | null>(null);
  const activeTriggerRef                 = useRef<HTMLButtonElement | null>(null);
  const closeButtonRef                   = useRef<HTMLButtonElement | null>(null);
  const selectedProject = selectedIdx === null ? null : projects[selectedIdx] ?? null;
  const selectedImage = selectedProject?.image ?? null;
  const isLightboxOpen = selectedIdx !== null;

  useEffect(() => {
    const load = async () => {
      const [sectionRes, projectsRes] = await Promise.all([
        supabase.from("site_content").select("content").eq("section", "reussites").single(),
        supabase.from("reussites").select("*").eq("is_active", true).order("sort_order"),
      ]);
      if (sectionRes.data?.content) setVisible(sectionRes.data.content.visible !== false);
      if (projectsRes.data) setProjects(projectsRes.data);
    };
    load();
  }, []);

  // Close lightbox on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedIdx(null);
      if (selectedIdx === null || projects.length === 0) return;
      if (e.key === "ArrowRight") setSelectedIdx((selectedIdx + 1) % projects.length);
      if (e.key === "ArrowLeft")  setSelectedIdx((selectedIdx - 1 + projects.length) % projects.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [projects.length, selectedIdx]);

  useEffect(() => {
    if (!isLightboxOpen) return;
    const initialOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = initialOverflow;
      activeTriggerRef.current?.focus();
    };
  }, [isLightboxOpen]);

  const openLightbox = (idx: number, trigger: HTMLButtonElement) => {
    activeTriggerRef.current = trigger;
    setSelectedIdx(idx);
  };

  if (!visible || projects.length === 0) return null;

  return (
    <>
      <section id="reussites" aria-labelledby="projects-heading" className="relative isolate overflow-hidden bg-[#060a0e] py-[clamp(88px,10vw,132px)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-55"
          style={{
            backgroundImage: "linear-gradient(rgba(148,163,184,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.05) 1px, transparent 1px)",
            backgroundSize: "76px 76px",
            maskImage: "linear-gradient(to bottom, transparent, black 18%, black 82%, transparent)",
          }}
        />
        <div aria-hidden="true" className="pointer-events-none absolute right-0 top-24 h-px w-1/2 bg-gradient-to-l from-[#56ddb4]/45 to-transparent" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 bottom-12 h-72 w-72 rounded-full bg-[#14c8b8]/[0.07] blur-3xl" />
        <div className="relative z-10 mod-container">

          {/* ── Header ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-10 grid gap-8 border-b border-white/10 pb-10 sm:mb-14 sm:pb-12 lg:grid-cols-12 lg:items-end"
          >
            <div className="lg:col-span-9">
              <div className="mb-5 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[#70e7c1]">
                <span aria-hidden="true" className="h-px w-9 bg-[#56ddb4]" />
                Réalisations
              </div>
              <h2 id="projects-heading" className="text-[clamp(2.4rem,5.5vw,5rem)] font-light leading-[0.98] tracking-[-0.05em] text-white">
                Nos{" "}
                <span className="text-[#56ddb4]">
                  Réussites
                </span>
              </h2>
            </div>
            <div className="flex items-center gap-3 lg:col-span-3 lg:justify-self-end">
              <span aria-hidden="true" className="h-px w-8 bg-[#56ddb4]" />
              <span className="font-mono text-[11px] tracking-[0.2em] text-white/45">{String(projects.length).padStart(2, "0")} PROJETS</span>
            </div>
          </motion.div>

          {/* ── Grid ── */}
          <div className="grid auto-rows-[9rem] grid-cols-2 gap-3 sm:auto-rows-[11rem] sm:gap-4 md:grid-cols-4 lg:auto-rows-[12rem]">
            {projects.map((project, i) => {
              const isFeature = i % 6 === 0;
              const isWide = i % 6 === 3;
              const isTall = i % 6 === 5;

              return (
              <motion.button
                type="button"
                key={project.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                onClick={(event) => openLightbox(i, event.currentTarget)}
                aria-label={`Agrandir ${project.title || project.category || "ce projet"}`}
                className={`group relative overflow-hidden rounded-[22px] border border-white/10 bg-[#0b1318] text-left shadow-[0_12px_28px_rgba(0,0,0,0.22)] transition-all duration-300 hover:z-10 hover:-translate-y-1 hover:border-[#56ddb4]/60 hover:shadow-[0_22px_46px_rgba(0,0,0,0.38)] focus-visible:z-10 focus-visible:border-[#70e7c1] ${
                  isFeature ? "col-span-2 row-span-2" : isWide ? "col-span-2" : isTall ? "row-span-2" : ""
                }`}
              >
                <img
                  src={project.image}
                  alt={project.title || "Projet MOD-TECH"}
                  className="h-full w-full object-cover saturate-[0.82] transition-transform duration-700 group-hover:scale-[1.06] group-hover:saturate-100"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#05090d]/95 via-[#05090d]/15 to-[#05090d]/5" />

                <div className="absolute left-4 top-4 flex items-center gap-2">
                  {project.category && (
                    <span className="rounded-full border border-white/25 bg-[#071015]/60 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white/90 backdrop-blur-sm">
                      {project.category}
                    </span>
                  )}
                </div>

                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-5">
                  {project.title ? (
                    <span className={`font-medium leading-snug tracking-[-0.02em] text-white ${isFeature ? "max-w-[80%] text-lg sm:text-xl" : "text-sm"}`}>
                      {project.title}
                    </span>
                  ) : <span />}
                  <span className="flex h-9 w-9 shrink-0 translate-y-1 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                    <ZoomIn className="h-4 w-4" strokeWidth={1.8} />
                  </span>
                </div>
              </motion.button>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSelectedIdx(null)}
            role="dialog"
            aria-modal="true"
            aria-label={`Aperçu de ${selectedProject?.title || "réalisation"}`}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#020609]/95 p-4 backdrop-blur-md sm:p-8"
          >
            {/* Close */}
            <button type="button"
              ref={closeButtonRef}
              onClick={() => setSelectedIdx(null)}
              title="Fermer"
              aria-label="Fermer l’aperçu du projet"
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-[#071015]/85 text-white transition-colors hover:border-[#56ddb4]/55 hover:bg-[#0f1b20] sm:right-7 sm:top-7"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Prev */}
            {projects.length > 1 && (
              <button type="button"
                onClick={e => { e.stopPropagation(); setSelectedIdx(i => (((i ?? 0) - 1 + projects.length) % projects.length)); }}
                title="Image précédente"
                aria-label="Image précédente"
                className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-[#071015]/85 text-white transition-colors hover:border-[#56ddb4]/55 hover:bg-[#0f1b20] sm:left-7"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}

            {/* Image */}
            <motion.img
              key={selectedImage}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              src={selectedImage}
              alt={selectedProject?.title || "Projet MOD-TECH"}
              onClick={e => e.stopPropagation()}
              className="max-h-[82vh] max-w-full cursor-default rounded-[26px] border border-white/15 object-contain shadow-[0_32px_90px_rgba(0,0,0,0.55)]"
            />

            {/* Next */}
            {projects.length > 1 && (
              <button type="button"
                onClick={e => { e.stopPropagation(); setSelectedIdx(i => ((i ?? 0) + 1) % projects.length); }}
                title="Image suivante"
                aria-label="Image suivante"
                className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-[#071015]/85 text-white transition-colors hover:border-[#56ddb4]/55 hover:bg-[#0f1b20] sm:right-7"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}

            {/* Counter */}
            <div aria-live="polite" className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/10 bg-[#071015]/75 px-4 py-2 text-xs font-medium text-white/70 backdrop-blur-sm">
              {(selectedIdx ?? 0) + 1} / {projects.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
