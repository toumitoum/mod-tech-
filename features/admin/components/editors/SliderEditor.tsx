"use client";

import { supabase } from "@/app/supabase";
import { motion } from "framer-motion";
import {
Eye,
EyeOff,
Image as ImageIcon,
Plus,
RefreshCw,
Trash2,
X
} from "lucide-react";
import { useRef,useState } from "react";
import { uploadSiteImage } from "../../services/storage.service";
import { ms,teal,tG } from "../../styles";
import type { Slide } from "../../types";

export function SliderEd({ slides, onReload, dark }: { slides: Slide[]; onReload: () => void; dark: boolean }) {
  const s = ms(dark);
  const [saving, setSaving] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [newSlide, setNewSlide] = useState({ title: "", description: "", image: "", sort_order: slides.length + 1 });
  
  const uploadImg = async (file: File, path: string): Promise<string> => {
    return uploadSiteImage(file, path);
  };
  
  const updateField = async (id: number, field: string, value: unknown) => {
    setSaving(id);
    await supabase.from("slider_slides").update({ [field]: value }).eq("id", id);
    setSaving(null);
    onReload();
  };
  
  const toggleActive = async (slide: Slide) => {
    await supabase.from("slider_slides").update({ is_active: !slide.is_active }).eq("id", slide.id);
    onReload();
  };
  
  const deleteSlide = async (id: number) => {
    if (!confirm("Supprimer ?")) return;
    await supabase.from("slider_slides").delete().eq("id", id);
    onReload();
  };
  
  const addSlide = async () => {
    if (!newSlide.image) { alert("Image obligatoire"); return; }
    setSaving(-1);
    await supabase.from("slider_slides").insert([{ ...newSlide }]);
    setNewSlide({ title: "", description: "", image: "", sort_order: slides.length + 2 });
    setAdding(false);
    setSaving(null);
    onReload();
  };
  
  function SlideImg({ cur, slideId }: { cur: string; slideId: number }) {
    const [prev, setPrev] = useState(cur);
    const [up, setUp] = useState(false);
    const ref = useRef<HTMLInputElement>(null);
    
    const h = async (file: File) => {
      setUp(true);
      try {
        const url = await uploadImg(file, `slide-${slideId}`);
        setPrev(url);
        await supabase.from("slider_slides").update({ image: url }).eq("id", slideId);
        onReload();
      } catch (e: unknown) {
        alert(e instanceof Error ? e.message : String(e));
      }
      setUp(false);
    };
    
    return (
      <div
        style={{
          position: "relative",
          cursor: "pointer",
          borderRadius: "12px 12px 0 0",
          overflow: "hidden"
        }}
        onClick={() => ref.current?.click()}
      >
        <img src={prev || "/images/1.jpg"} alt="" style={{ width: "100%", height: 140, objectFit: "cover", display: "block" }} />
        <div style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <span style={{
            color: "#fff",
            fontWeight: 700,
            fontSize: 12,
            background: "rgba(13,148,136,0.85)",
            padding: "6px 14px",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            gap: 4
          }}>
            {up ? <RefreshCw className="w-3 h-3 animate-spin" /> : <ImageIcon className="w-3 h-3" />}
            {up ? "⏳" : "📷 Changer"}
          </span>
        </div>
        <input ref={ref} type="file" accept="image/*" style={{ display: "none" }} onChange={e => e.target.files?.[0] && h(e.target.files[0])} />
      </div>
    );
  }
  
  function NewImg({ onUrl }: { onUrl: (u: string) => void }) {
    const [prev, setPrev] = useState("");
    const [up, setUp] = useState(false);
    const ref = useRef<HTMLInputElement>(null);
    
    const h = async (file: File) => {
      setUp(true);
      try {
        const url = await uploadImg(file, "slide-new");
        setPrev(url);
        onUrl(url);
      } catch (e: unknown) {
        alert(e instanceof Error ? e.message : String(e));
      }
      setUp(false);
    };
    
    return (
      <div>
        {prev ? (
          <div style={{
            borderRadius: 10,
            overflow: "hidden",
            border: "1px solid " + s.brd,
            marginBottom: 10,
            position: "relative"
          }}>
            <img src={prev} alt="" style={{ width: "100%", height: 110, objectFit: "cover", display: "block" }} />
            <button
              onClick={() => { setPrev(""); onUrl(""); }}
              style={{
                position: "absolute",
                top: 6,
                right: 6,
                background: "rgba(239,68,68,0.9)",
                border: "none",
                borderRadius: 6,
                color: "#fff",
                cursor: "pointer",
                fontSize: 11,
                padding: "3px 8px"
              }}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div style={{
            borderRadius: 10,
            border: "2px dashed rgba(13,148,136,0.3)",
            height: 90,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 10,
            color: s.sub,
            fontSize: 12,
            flexDirection: "column",
            gap: 4
          }}>
            <ImageIcon className="w-6 h-6" />
            <span>Aucune image</span>
          </div>
        )}
        <input ref={ref} type="file" accept="image/*" style={{ display: "none" }} onChange={e => e.target.files?.[0] && h(e.target.files[0])} />
        <button
          onClick={() => ref.current?.click()}
          disabled={up}
          style={{
            background: "rgba(13,148,136,0.1)",
            border: "1px dashed rgba(13,148,136,0.4)",
            borderRadius: 8,
            padding: "8px 16px",
            color: teal,
            fontSize: 13,
            fontWeight: 600,
            cursor: up ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6
          }}
        >
          {up ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
          {up ? "⏳" : "📁 Choisir *"}
        </button>
      </div>
    );
  }
  
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{
        background: dark ? "rgba(13,148,136,0.06)" : "rgba(13,148,136,0.04)",
        border: "1px solid rgba(13,148,136,0.2)",
        borderRadius: 12,
        padding: "12px 16px",
        fontSize: 13,
        color: s.sub,
        display: "flex",
        alignItems: "center",
        gap: 8
      }}>
        <ImageIcon className="w-4 h-4" style={{ color: teal }} />
        <span>
          <span style={{ color: teal, fontWeight: 700 }}>{slides.length} slide{slides.length !== 1 ? "s" : ""}</span> ·
          <span style={{ color: "#10b981", fontWeight: 600 }}> {slides.filter(x => x.is_active).length} actives</span>
        </span>
      </div>
      
      {[...slides].sort((a, b) => a.sort_order - b.sort_order).map(slide => (
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: s.card,
            border: "1px solid " + (slide.is_active ? s.brd : "rgba(239,68,68,0.25)"),
            borderRadius: 14,
            overflow: "hidden",
            opacity: slide.is_active ? 1 : 0.6
          }}
        >
          <SlideImg cur={slide.image} slideId={slide.id} />
          <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
            <input
              defaultValue={slide.title}
              onBlur={e => updateField(slide.id, "title", e.target.value)}
              style={{
                background: s.ibg,
                border: "1px solid " + s.brd,
                borderRadius: 8,
                padding: "8px 12px",
                color: s.tx,
                fontSize: 14,
                outline: "none",
                fontFamily: "inherit",
                width: "100%",
                boxSizing: "border-box"
              }}
            />
            <textarea
              defaultValue={slide.description}
              onBlur={e => updateField(slide.id, "description", e.target.value)}
              rows={2}
              style={{
                background: s.ibg,
                border: "1px solid " + s.brd,
                borderRadius: 8,
                padding: "8px 12px",
                color: s.tx,
                fontSize: 13,
                outline: "none",
                fontFamily: "inherit",
                width: "100%",
                boxSizing: "border-box",
                resize: "vertical"
              }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <input
                type="number"
                defaultValue={slide.sort_order}
                onBlur={e => updateField(slide.id, "sort_order", parseInt(e.target.value) || 0)}
                style={{
                  width: 60,
                  background: s.ibg,
                  border: "1px solid " + s.brd,
                  borderRadius: 8,
                  padding: "5px 8px",
                  color: teal,
                  fontSize: 13,
                  outline: "none",
                  textAlign: "center",
                  fontFamily: "inherit"
                }}
              />
              <div style={{ flex: 1 }} />
              {saving === slide.id && <RefreshCw className="w-4 h-4 animate-spin" style={{ color: teal }} />}
              <button
                onClick={() => toggleActive(slide)}
                style={{
                  background: slide.is_active ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.08)",
                  border: "1px solid " + (slide.is_active ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.2)"),
                  borderRadius: 8,
                  padding: "5px 12px",
                  color: slide.is_active ? "#10b981" : "#f87171",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4
                }}
              >
                {slide.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                {slide.is_active ? "Actif" : "Inactif"}
              </button>
              <button
                onClick={() => deleteSlide(slide.id)}
                style={{
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  borderRadius: 8,
                  padding: "5px 10px",
                  color: "#f87171",
                  fontSize: 12,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4
                }}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        </motion.div>
      ))}
      
      {adding ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: s.card,
            border: "2px dashed rgba(13,148,136,0.4)",
            borderRadius: 14,
            padding: 20
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: teal, marginBottom: 12, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
            <Plus className="w-4 h-4" />
            Nouvelle slide
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <NewImg onUrl={url => setNewSlide(n => ({ ...n, image: url }))} />
            <input
              placeholder="Titre"
              value={newSlide.title}
              onChange={e => setNewSlide(n => ({ ...n, title: e.target.value }))}
              style={{
                background: s.ibg,
                border: "1px solid " + s.brd,
                borderRadius: 8,
                padding: "10px 12px",
                color: s.tx,
                fontSize: 14,
                outline: "none",
                fontFamily: "inherit",
                boxSizing: "border-box"
              }}
            />
            <textarea
              placeholder="Description"
              value={newSlide.description}
              onChange={e => setNewSlide(n => ({ ...n, description: e.target.value }))}
              rows={2}
              style={{
                background: s.ibg,
                border: "1px solid " + s.brd,
                borderRadius: 8,
                padding: "10px 12px",
                color: s.tx,
                fontSize: 14,
                outline: "none",
                fontFamily: "inherit",
                boxSizing: "border-box",
                resize: "vertical"
              }}
            />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                onClick={addSlide}
                disabled={saving === -1}
                style={{
                  background: tG,
                  border: "none",
                  borderRadius: 9,
                  padding: "10px 20px",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }}
              >
                {saving === -1 ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {saving === -1 ? "" : "Ajouter"}
              </button>
              <button
                onClick={() => setAdding(false)}
                style={{
                  background: "transparent",
                  border: "1px solid " + s.brd,
                  borderRadius: 9,
                  padding: "10px 14px",
                  color: s.sub,
                  fontSize: 13,
                  cursor: "pointer"
                }}
              >
                Annuler
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          style={{
            border: "2px dashed rgba(13,148,136,0.3)",
            background: "transparent",
            color: teal,
            borderRadius: 12,
            padding: 14,
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8
          }}
        >
          <Plus className="w-4 h-4" />
          Ajouter une slide
        </button>
      )}
    </div>
  );
}
