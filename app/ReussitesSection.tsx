"use client";

import { supabase } from "@/app/supabase";
import { AnimatePresence,motion } from "framer-motion";
import { X,ZoomIn } from "lucide-react";
import { useEffect,useState } from "react";

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
  const selectedImage = selectedIdx === null ? null : projects[selectedIdx]?.image ?? null;

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

  const openLightbox = (idx: number) => {
    setSelectedIdx(idx);
  };

  if (!visible || projects.length === 0) return null;

  return (
    <>
      <section id="reussites" className="relative py-24 sm:py-32 bg-white overflow-hidden">

        {/* ── Background ── */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(20,184,166,1) 1px, transparent 1px), linear-gradient(90deg, rgba(20,184,166,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative z-10 container mx-auto px-5 sm:px-8 lg:px-12 max-w-7xl">

          {/* ── Header ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-14 sm:mb-20"
          >
            <div className="flex items-center gap-3 mb-5">
              <span className="h-px w-8 bg-teal-500" />
              <span className="text-xs font-semibold text-teal-600 uppercase tracking-widest">
                Réalisations
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold leading-[1.15] tracking-tight text-slate-900">
              Nos{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-600">
                Réussites
              </span>
            </h2>
          </motion.div>

          {/* ── Grid ── */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {projects.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => openLightbox(i)}
                className="group relative overflow-hidden rounded-2xl cursor-zoom-in bg-slate-100 aspect-square border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300"
              >
                <img
                  src={project.image}
                  alt={project.title || ""}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Zoom icon + title */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center">
                    <ZoomIn className="w-4 h-4 text-white" />
                  </div>
                  {project.title && (
                    <span className="text-white text-xs font-semibold px-3 text-center leading-snug drop-shadow">
                      {project.title}
                    </span>
                  )}
                </div>

                {/* Category badge */}
                {project.category && (
                  <span className="absolute top-2 left-2 text-[10px] font-semibold text-white bg-black/30 backdrop-blur-sm border border-white/20 px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {project.category}
                  </span>
                )}
              </motion.div>
            ))}
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
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
          >
            {/* Close */}
            <button
              onClick={() => setSelectedIdx(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Prev */}
            {projects.length > 1 && (
              <button
                onClick={e => { e.stopPropagation(); setSelectedIdx(i => (((i ?? 0) - 1 + projects.length) % projects.length)); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center text-xl transition-colors z-10"
              >
                ‹
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
              alt=""
              onClick={e => e.stopPropagation()}
              className="max-w-full max-h-[88vh] rounded-2xl shadow-2xl object-contain cursor-default"
            />

            {/* Next */}
            {projects.length > 1 && (
              <button
                onClick={e => { e.stopPropagation(); setSelectedIdx(i => ((i ?? 0) + 1) % projects.length); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center text-xl transition-colors z-10"
              >
                ›
              </button>
            )}

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/60 font-medium">
              {(selectedIdx ?? 0) + 1} / {projects.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
