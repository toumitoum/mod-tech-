"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/app/supabase";

type Project = {
  id: number;
  image: string;
  title: string;
  category: string;
  is_active: boolean;
  sort_order: number;
};

export default function ReussitesSection() {
  const [visible, setVisible] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: section } = await supabase
        .from("site_content")
        .select("content")
        .eq("section", "reussites")
        .single();

      if (section?.content) {
        setVisible(section.content.visible !== false);
      }

      const { data } = await supabase
        .from("reussites")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");

      if (data) setProjects(data);
    };

    load();
  }, []);

  if (!visible || projects.length === 0) return null;

  return (
    <>
      <section id="reussites" className="py-24 bg-background">
        <div className="container mx-auto px-4">

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="bg-gradient-to-r from-teal-500 to-blue-500 text-white text-3xl sm:text-4xl font-bold p-4 rounded-lg">
              Nos Réussites
            </h2>
          </motion.div>

          {/* RESPONSIVE GRID */}
          <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {projects.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="cursor-zoom-in"
                onClick={() => setSelectedImage(project.image)}
              >
                <img
                  src={project.image}
                  alt=""
                  className="w-full rounded-xl shadow-md transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-[9999] cursor-zoom-out animate-fadeIn"
        >
          <img
            src={selectedImage}
            className="max-w-[95%] max-h-[95%] rounded-xl shadow-2xl animate-zoomIn"
          />
        </div>
      )}
    </>
  );
}