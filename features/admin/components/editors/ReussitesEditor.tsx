"use client";

import { supabase } from "@/app/supabase";
import { motion } from "framer-motion";
import {
Eye,
EyeOff,
Image as ImageIcon,
Plus,
RefreshCw,
Star,
Trash2,
X
} from "lucide-react";
import { useEffect,useRef,useState } from "react";
import { uploadSiteImage } from "../../services/storage.service";
import { ms,teal,tG } from "../../styles";

export function ReussitesEd({ dark }: { dark: boolean }) {
  const s = ms(dark);
  const [sectionVisible, setSectionVisible] = useState(true);
  type ReussiteProject = {
    id: number;
    image: string;
    title?: string;
    category?: string;
    is_active: boolean;
    sort_order: number;
  };
  const [projects, setProjects] = useState<ReussiteProject[]>([]);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState<number | null>(null);
  const [toggling, setToggling] = useState(false);
  const [newImg, setNewImg] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [uploading, setUploading] = useState(false);
  const newImgRef = useRef<HTMLInputElement>(null);

  const CATS = ["Sécurité", "Réseau", "Domotique", "Accès", "Sonorisation", "Autre"];

  const load = async () => {
    const { data } = await supabase.from("reussites").select("*").order("sort_order");
    setProjects(data ?? []);
    const { data: sc } = await supabase.from("site_content").select("content").eq("section", "reussites").single();
    if (sc?.content) setSectionVisible(sc.content.visible !== false);
  };

  useEffect(() => { void Promise.resolve().then(load); }, []);

  const uploadImg = async (file: File, path: string): Promise<string> => {
    return uploadSiteImage(file, path);
  };

  const toggleSection = async () => {
    setToggling(true);
    const newVal = !sectionVisible;
    await supabase.from("site_content").upsert(
      { section: "reussites", content: { visible: newVal }, updated_at: new Date().toISOString() },
      { onConflict: "section" }
    );
    setSectionVisible(newVal);
    setToggling(false);
  };

  const toggleProject = async (p: ReussiteProject) => {
    await supabase.from("reussites").update({ is_active: !p.is_active }).eq("id", p.id);
    load();
  };

  const deleteProject = async (id: number) => {
    if (!confirm("Supprimer cette réalisation ?")) return;
    await supabase.from("reussites").delete().eq("id", id);
    load();
  };

  const updateField = async (id: number, field: string, value: unknown) => {
    setSaving(id);
    await supabase.from("reussites").update({ [field]: value }).eq("id", id);
    setSaving(null);
    load();
  };

  const addProject = async () => {
    if (!newImg) { alert("Image obligatoire"); return; }
    setSaving(-1);
    await supabase.from("reussites").insert([{
      image: newImg,
      title: newTitle,
      category: newCategory,
      is_active: true,
      sort_order: projects.length + 1,
    }]);
    setNewImg(""); setNewTitle(""); setNewCategory("");
    setAdding(false);
    setSaving(null);
    load();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Info */}
      <div style={{
        background: dark ? "rgba(13,148,136,0.06)" : "rgba(13,148,136,0.04)",
        border: "1px solid rgba(13,148,136,0.2)",
        borderRadius: 12, padding: "12px 16px",
        fontSize: 13, color: s.sub,
        display: "flex", alignItems: "center", gap: 8
      }}>
        <Star className="w-4 h-4" style={{ color: teal }} />
        <span>
          <span style={{ color: teal, fontWeight: 700 }}>{projects.length} réalisation{projects.length !== 1 ? "s" : ""}</span>
          {" · "}
          <span style={{ color: "#10b981", fontWeight: 600 }}>{projects.filter(x => x.is_active).length} actives</span>
        </span>
      </div>

      {/* Section toggle */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
        background: sectionVisible
          ? (dark ? "rgba(13,148,136,0.08)" : "rgba(13,148,136,0.04)")
          : (dark ? "rgba(51,65,85,0.3)" : "rgba(226,232,240,0.5)"),
        border: "1px solid " + (sectionVisible ? "rgba(13,148,136,0.3)" : s.brd),
        borderRadius: 12, padding: "14px 18px",
      }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: s.tx }}>
            {sectionVisible ? "✅ Section visible sur le site" : "🙈 Section masquée"}
          </div>
          <div style={{ fontSize: 12, color: s.sub, marginTop: 3 }}>
            {sectionVisible ? "La section «Nos Réussites» est affichée" : "La section est cachée pour les visiteurs"}
          </div>
        </div>
        <button
          onClick={toggleSection}
          disabled={toggling}
          style={{
            background: sectionVisible ? tG : (dark ? "rgba(51,65,85,0.5)" : "#e2e8f0"),
            border: "none", borderRadius: 8, padding: "8px 18px",
            color: sectionVisible ? "#fff" : s.sub,
            fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" as const,
          }}
        >
          {sectionVisible ? "Masquer" : "Afficher"}
        </button>
      </div>

      {/* Projects grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
        {projects.map(p => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: s.card,
              border: "1px solid " + (p.is_active ? s.brd : "rgba(239,68,68,0.25)"),
              borderRadius: 12,
              overflow: "hidden",
              opacity: p.is_active ? 1 : 0.55,
            }}
          >
            {/* Image */}
            <div style={{ position: "relative", height: 130 }}>
              <img src={p.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent)",
              }} />
              {/* Change image btn */}
              <label
                htmlFor={`img-${p.id}`}
                style={{
                  position: "absolute", top: 6, left: 6,
                  background: "rgba(0,0,0,0.6)", border: "none", borderRadius: 6,
                  color: "#fff", fontSize: 11, padding: "3px 8px",
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                }}
              >
                <ImageIcon className="w-3 h-3" /> Changer
              </label>
              <input
                id={`img-${p.id}`} type="file" accept="image/*"
                style={{ display: "none" }}
                onChange={async e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setSaving(p.id);
                  const url = await uploadImg(file, `reussite-${p.id}`);
                  await supabase.from("reussites").update({ image: url }).eq("id", p.id);
                  setSaving(null);
                  load();
                }}
              />
            </div>

            {/* Fields */}
            <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 7 }}>
              <input
                defaultValue={p.title}
                onBlur={e => updateField(p.id, "title", e.target.value)}
                placeholder="Titre (optionnel)"
                style={{
                  background: s.ibg, border: "1px solid " + s.brd,
                  borderRadius: 7, padding: "6px 10px",
                  color: s.tx, fontSize: 13, outline: "none", width: "100%",
                }}
              />
              <select
                defaultValue={p.category}
                onBlur={e => updateField(p.id, "category", e.target.value)}
                style={{
                  background: s.ibg, border: "1px solid " + s.brd,
                  borderRadius: 7, padding: "6px 10px",
                  color: s.tx, fontSize: 12, outline: "none", width: "100%",
                }}
              >
                <option value="">Catégorie...</option>
                {CATS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <input
                  type="number"
                  defaultValue={p.sort_order}
                  onBlur={e => updateField(p.id, "sort_order", parseInt(e.target.value) || 0)}
                  style={{
                    width: 50, background: s.ibg, border: "1px solid " + s.brd,
                    borderRadius: 7, padding: "5px 7px",
                    color: teal, fontSize: 12, outline: "none", textAlign: "center" as const,
                  }}
                />
                <div style={{ flex: 1 }} />
                {saving === p.id && <RefreshCw className="w-3 h-3 animate-spin" style={{ color: teal }} />}
                <button
                  onClick={() => toggleProject(p)}
                  style={{
                    background: p.is_active ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.08)",
                    border: "1px solid " + (p.is_active ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.2)"),
                    borderRadius: 6, padding: "4px 9px",
                    color: p.is_active ? "#10b981" : "#f87171",
                    fontSize: 11, fontWeight: 700, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 3,
                  }}
                >
                  {p.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  {p.is_active ? "Actif" : "Off"}
                </button>
                <button
                  onClick={() => deleteProject(p.id)}
                  style={{
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    borderRadius: 6, padding: "4px 7px",
                    color: "#f87171", cursor: "pointer",
                    display: "flex", alignItems: "center",
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add new */}
      {adding ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: s.card,
            border: "2px dashed rgba(13,148,136,0.4)",
            borderRadius: 14, padding: 20,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: teal, marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
            <Plus className="w-4 h-4" /> Nouvelle réalisation
          </div>

          {/* Image upload */}
          <input
            ref={newImgRef} type="file" accept="image/*"
            style={{ display: "none" }}
            onChange={async e => {
              const file = e.target.files?.[0];
              if (!file) return;
              setUploading(true);
              const url = await uploadImg(file, "reussite-new");
              setNewImg(url);
              setUploading(false);
            }}
          />
          {newImg ? (
            <div style={{ position: "relative", marginBottom: 12, borderRadius: 10, overflow: "hidden" }}>
              <img src={newImg} alt="" style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }} />
              <button
                onClick={() => setNewImg("")}
                style={{
                  position: "absolute", top: 8, right: 8,
                  background: "rgba(239,68,68,0.9)", border: "none",
                  borderRadius: 6, color: "#fff", padding: "4px 8px",
                  cursor: "pointer", fontSize: 11, display: "flex", alignItems: "center", gap: 3,
                }}
              >
                <X className="w-3 h-3" /> Changer
              </button>
            </div>
          ) : (
            <div
              onClick={() => newImgRef.current?.click()}
              style={{
                border: "2px dashed rgba(13,148,136,0.3)", borderRadius: 10, height: 120,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: s.sub, fontSize: 13, cursor: "pointer",
                flexDirection: "column" as const, gap: 6, marginBottom: 12,
              }}
            >
              <ImageIcon className="w-6 h-6" />
              {uploading ? "⏳ Upload..." : "📷 Choisir une image *"}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
            <input
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="Titre (optionnel)"
              style={{
                width: "100%", background: s.ibg, border: "1px solid " + s.brd,
                borderRadius: 8, padding: "9px 12px",
                color: s.tx, fontSize: 13, outline: "none",
              }}
            />
            <select
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              style={{
                width: "100%", background: s.ibg, border: "1px solid " + s.brd,
                borderRadius: 8, padding: "9px 12px",
                color: s.tx, fontSize: 13, outline: "none",
              }}
            >
              <option value="">Catégorie...</option>
              {CATS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              onClick={addProject} disabled={saving === -1 || !newImg}
              style={{
                background: newImg ? tG : "rgba(51,65,85,0.3)",
                border: "none", borderRadius: 9, padding: "10px 20px",
                color: "#fff", fontSize: 14, fontWeight: 700,
                cursor: (saving === -1 || !newImg) ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              {saving === -1 ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {saving === -1 ? "" : "Ajouter"}
            </button>
            <button
              onClick={() => { setAdding(false); setNewImg(""); setNewTitle(""); setNewCategory(""); }}
              style={{
                background: "transparent", border: "1px solid " + s.brd,
                borderRadius: 9, padding: "10px 14px",
                color: s.sub, fontSize: 13, cursor: "pointer",
              }}
            >
              Annuler
            </button>
          </div>
        </motion.div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          style={{
            border: "2px dashed rgba(13,148,136,0.3)", background: "transparent",
            color: teal, borderRadius: 12, padding: 14, cursor: "pointer",
            fontSize: 14, fontWeight: 600,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          <Plus className="w-4 h-4" /> Ajouter une réalisation
        </button>
      )}
    </div>
  );
}
// ── ABOUT ────────────────────────────────────────────────────────────────────
