"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Menu, 
  X, 
  Save, 
  RefreshCw, 
  LogOut,
  Sun,
  Moon,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Star,
  ShoppingBag,
  Users,
  Mail,
  CheckCircle2,
  Home,
  Layers,
  Phone,
  Award,
  Store,
  Shield, 

  Icon,
  ExternalLink
} from "lucide-react";
import { supabase } from "@/app/supabase";
import router from "next/router";

// Types
type Row = { id: number; section: string; content: any; updated_at: string };
type Slide = { id: number; title: string; description: string; image: string; sort_order: number; is_active: boolean };
type Partner = { id: number; name: string; logo: string; website: string; sort_order: number; is_active: boolean };
type Order = {
  id: number; customer_name: string; customer_phone: string;
  customer_email: string; customer_address: string;
  items: { id: number; name: string; price: number; qty: number }[];
  total: number; status: string; notes: string; created_at: string
};
type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  private_note: string;
  original_price: number;
  discount_percent: number;
  image: string;
  images: string[];
  category: string;
  is_active: boolean;
  sort_order: number;
  in_stock: boolean;
  colors: { name: string; hex: string }[];
  sizes: string[];
  specs: Record<string, string>;
  reference: string;
};
type EmailSettings = { id: number; notify_email: string; resend_key: string; updated_at: string };
type Status = "idle" | "loading" | "saving" | "error";

// Hero types
type HomeHero = {
  title: string;
  titleHighlight?: string;
  subtitle: string;
  badge: string;
  btnPrimary: string;
  btnSecondary: string;
  bgImage: string;
  logoUrl?: string;
};

type StoreHero = {
  title: string;
  subtitle: string;
  badge: string;
  bgImage: string;
  btnPrimary: string;
  btnSecondary: string;
};

const teal = "#0d9488";
const tG = "linear-gradient(135deg,#0d9488,#0f766e)";

// Modern color scheme
const colors = {
  primary: {
    light: "#0d9488",
    dark: "#14b8a6",
    gradient: "linear-gradient(135deg, #0d9488, #0f766e)"
  },
  secondary: {
    light: "#6b7280",
    dark: "#9ca3af"
  },
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  background: {
    light: "#f9fafb",
    dark: "#111827"
  },
  surface: {
    light: "#ffffff",
    dark: "#1f2937"
  },
  border: {
    light: "#e5e7eb",
    dark: "#374151"
  },
  text: {
    light: "#1f2937",
    dark: "#f3f4f6",
    muted: {
      light: "#6b7280",
      dark: "#9ca3af"
    }
  }
};

function ms(dark: boolean) {
  return {
    bg: dark ? colors.background.dark : colors.background.light,
    sb: dark ? colors.surface.dark : colors.surface.light,
    card: dark ? colors.surface.dark : colors.surface.light,
    ci: dark ? "#374151" : "#f3f4f6",
    tx: dark ? colors.text.dark : colors.text.light,
    sub: dark ? colors.text.muted.dark : colors.text.muted.light,
    brd: dark ? colors.border.dark : colors.border.light,
    ibg: dark ? "#2d3748" : "#ffffff",
    top: dark ? "rgba(31,41,55,0.95)" : "rgba(255,255,255,0.95)",
    mut: dark ? colors.text.muted.dark : colors.text.muted.light,
    sbtn: (a: boolean) => ({
      background: a ? (dark ? "rgba(13,148,136,0.15)" : "rgba(13,148,136,0.08)") : "transparent",
      border: a ? `1px solid ${dark ? "rgba(13,148,136,0.4)" : "rgba(13,148,136,0.4)"}` : "1px solid transparent",
      borderRadius: 10,
      padding: "11px 14px",
      textAlign: "left" as const,
      color: a ? teal : (dark ? colors.text.muted.dark : colors.text.muted.light),
      cursor: "pointer",
      fontSize: 13.5,
      fontWeight: a ? 700 : 500,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      transition: "all 0.15s",
      width: "100%",
    }),
  };
}

function Field({ label, value, onChange, multi, dark, type = "text", placeholder }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multi?: boolean;
  dark: boolean;
  type?: string;
  placeholder?: string;
}) {
  const s = ms(dark);
  const base: React.CSSProperties = {
    background: s.ibg,
    border: "1px solid " + s.brd,
    borderRadius: 8,
    padding: "10px 13px",
    color: s.tx,
    fontSize: 14,
    width: "100%",
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
    transition: "all 0.2s"
  };
  
  return (
    <div style={{ display: "grid", gridTemplateColumns: "130px 1fr", gap: 12, alignItems: "start" }}>
      <label style={{
        fontSize: 11,
        fontWeight: 700,
        color: s.mut,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        paddingTop: 12,
        fontFamily: "monospace"
      }}>
        {label}
      </label>
      {multi ? (
        <textarea
          rows={3}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ ...base, resize: "vertical" }}
          onFocus={e => {
            e.currentTarget.style.borderColor = teal;
            e.currentTarget.style.boxShadow = `0 0 0 3px ${teal}20`;
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = s.brd;
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={base}
          onFocus={e => {
            e.currentTarget.style.borderColor = teal;
            e.currentTarget.style.boxShadow = `0 0 0 3px ${teal}20`;
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = s.brd;
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      )}
    </div>
  );
}

function ImgUpload({ label, cur, path, onDone, dark, height = 100 }: {
  label: string;
  cur: string;
  path: string;
  onDone: (u: string) => void;
  dark: boolean;
  height?: number;
}) {
  const s = ms(dark);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(cur);
  const ref = useRef<HTMLInputElement>(null);
  
  useEffect(() => { setPreview(cur); }, [cur]);
  
  const upload = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const fp = `${path}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("site-images").upload(fp, file, { upsert: true });
    if (error) { alert("Upload error: " + error.message); setUploading(false); return; }
    const { data } = supabase.storage.from("site-images").getPublicUrl(fp);
    setPreview(data.publicUrl); onDone(data.publicUrl); setUploading(false);
  };
  
  return (
    <div style={{ display: "grid", gridTemplateColumns: "130px 1fr", gap: 12, alignItems: "start" }}>
      <label style={{
        fontSize: 11,
        fontWeight: 700,
        color: s.mut,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        paddingTop: 12,
        fontFamily: "monospace"
      }}>
        {label}
      </label>
      <div>
        {preview ? (
          <div style={{
            marginBottom: 10,
            borderRadius: 10,
            overflow: "hidden",
            border: "1px solid " + s.brd,
            position: "relative"
          }}>
            <img src={preview} alt="" style={{ width: "100%", height, objectFit: "cover", display: "block" }} />
            <button
              onClick={() => { setPreview(""); onDone(""); }}
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
                fontWeight: 700,
                padding: "3px 8px"
              }}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div style={{
            marginBottom: 10,
            borderRadius: 10,
            border: "1px dashed " + s.brd,
            height,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: s.sub,
            fontSize: 12,
            flexDirection: "column",
            gap: 4
          }}>
            <ImageIcon className="w-6 h-6" />
            <span>Aucune image</span>
          </div>
        )}
        <input
          ref={ref}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={e => e.target.files?.[0] && upload(e.target.files[0])}
        />
        <button
          onClick={() => ref.current?.click()}
          disabled={uploading}
          style={{
            background: "rgba(13,148,136,0.1)",
            border: "1px dashed rgba(13,148,136,0.4)",
            borderRadius: 8,
            padding: "8px 16px",
            color: teal,
            fontSize: 13,
            fontWeight: 600,
            cursor: uploading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6
          }}
        >
          {uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
          {uploading ? "Upload..." : "Choisir image"}
        </button>
      </div>
    </div>
  );
}

// ── HOME HERO ─────────────────────────────────────────────────────────────────
function HomeHeroEd({ data, onChange, dark }: { data: HomeHero; onChange: (d: HomeHero) => void; dark: boolean }) {
  const f = (k: keyof HomeHero, v: string) => onChange({ ...data, [k]: v });
  
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{
        background: dark ? "rgba(13,148,136,0.06)" : "rgba(13,148,136,0.04)",
        border: "1px solid rgba(13,148,136,0.2)",
        borderRadius: 12,
        padding: "14px 18px",
        fontSize: 13,
        color: dark ? "#94a3b8" : "#64748b",
        lineHeight: 1.7,
        marginBottom: 8
      }}>
        <div style={{ color: teal, fontWeight: 700, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
          <Home className="w-4 h-4" />
          Section Hero - Page d'accueil
        </div>
        Modifiez le contenu de la section héroïque de la page d'accueil.
      </div>

      <Field
        label="Badge"
        value={data.badge ?? ""}
        onChange={v => f("badge", v)}
        dark={dark}
        placeholder="SOLUTIONS TECHNOLOGIQUES"
      />
      
      <Field
        label="Titre"
        value={data.title ?? ""}
        onChange={v => f("title", v)}
        dark={dark}
        placeholder="Sécurité & Innovation"
      />
      
      <Field
        label="Highlight"
        value={data.titleHighlight ?? ""}
        onChange={v => f("titleHighlight", v)}
        dark={dark}
        placeholder="Mot(s) en surbrillance"
      />
      
      <Field
        label="Sous-titre"
        value={data.subtitle ?? ""}
        onChange={v => f("subtitle", v)}
        multi
        dark={dark}
        placeholder="Spécialistes en systèmes de sécurité, réseaux informatiques, domotique."
      />
      
      <Field
        label="Btn Principal"
        value={data.btnPrimary ?? ""}
        onChange={v => f("btnPrimary", v)}
        dark={dark}
        placeholder="Commander maintenant"
      />
      
      <Field
        label="Btn Secondaire"
        value={data.btnSecondary ?? ""}
        onChange={v => f("btnSecondary", v)}
        dark={dark}
        placeholder="Découvrir"
      />
      
      <ImgUpload
        label="Image Hero"
        cur={data.bgImage ?? ""}
        path="home-hero-bg"
        onDone={v => f("bgImage", v)}
        dark={dark}
        height={180}
      />
      
      <ImgUpload
        label="Logo"
        cur={data.logoUrl ?? ""}
        path="home-logo"
        onDone={v => f("logoUrl", v)}
        dark={dark}
        height={80}
      />
    </div>
  );
}

// ── STORE HERO ─────────────────────────────────────────────────────────────────
function StoreHeroEd({ data, onChange, dark }: { data: StoreHero; onChange: (d: StoreHero) => void; dark: boolean }) {
  const f = (k: keyof StoreHero, v: string) => onChange({ ...data, [k]: v });
  
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{
        background: dark ? "rgba(13,148,136,0.06)" : "rgba(13,148,136,0.04)",
        border: "1px solid rgba(13,148,136,0.2)",
        borderRadius: 12,
        padding: "14px 18px",
        fontSize: 13,
        color: dark ? "#94a3b8" : "#64748b",
        lineHeight: 1.7,
        marginBottom: 8
      }}>
        <div style={{ color: teal, fontWeight: 700, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
          <Store className="w-4 h-4" />
          Section Hero - Page du Store
        </div>
        Modifiez le contenu de la section héroïque de la page du catalogue.
      </div>

      <Field
        label="Badge"
        value={data.badge ?? ""}
        onChange={v => f("badge", v)}
        dark={dark}
        placeholder="NOTRE CATALOGUE"
      />
      
      <Field
        label="Titre"
        value={data.title ?? ""}
        onChange={v => f("title", v)}
        dark={dark}
        placeholder="Équipements Professionnels"
      />
      
      <Field
        label="Sous-titre"
        value={data.subtitle ?? ""}
        onChange={v => f("subtitle", v)}
        multi
        dark={dark}
        placeholder="Sécurité · Réseau · Domotique — Livraison dans toute l'Algérie"
      />
      
      <Field
        label="Btn Principal"
        value={data.btnPrimary ?? ""}
        onChange={v => f("btnPrimary", v)}
        dark={dark}
        placeholder="Commander maintenant"
      />
      
      <Field
        label="Btn Secondaire"
        value={data.btnSecondary ?? ""}
        onChange={v => f("btnSecondary", v)}
        dark={dark}
        placeholder="Découvrir"
      />
      
      <ImgUpload
        label="Image Hero"
        cur={data.bgImage ?? ""}
        path="store-hero-bg"
        onDone={v => f("bgImage", v)}
        dark={dark}
        height={180}
      />
    </div>
  );
}

// ── SERVICES ─────────────────────────────────────────────────────────────────
function ServicesEd({ data, onChange, dark }: { data: any[]; onChange: (d: any[]) => void; dark: boolean }) {
  const s = ms(dark);
  const upd = (i: number, k: string, v: string) => onChange(data.map((x, j) => j === i ? { ...x, [k]: v } : x));
  const del = (i: number) => onChange(data.filter((_, j) => j !== i));
  const add = () => onChange([...data, { id: Date.now(), title: "Nouveau service", description: "", icon: "🛠️", image: "" }]);
  
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{
        background: dark ? "rgba(13,148,136,0.06)" : "rgba(13,148,136,0.04)",
        border: "1px solid rgba(13,148,136,0.2)",
        borderRadius: 12,
        padding: "14px 18px",
        fontSize: 13,
        color: dark ? "#94a3b8" : "#64748b",
        lineHeight: 1.7,
        marginBottom: 8,
        display: "flex",
        alignItems: "center",
        gap: 8
      }}>
        <Layers className="w-4 h-4" style={{ color: teal }} />
        <span>Gérez vos services - {data.length} service{data.length !== 1 ? 's' : ''}</span>
      </div>

      {data.map((svc, i) => (
        <motion.div
          key={svc.id ?? i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          style={{
            background: s.card,
            border: "1px solid " + s.brd,
            borderRadius: 14,
            padding: 20,
            boxShadow: dark ? "none" : "0 2px 8px rgba(0,0,0,0.02)"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 24 }}>{svc.icon}</span>
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                color: teal,
                textTransform: "uppercase",
                letterSpacing: "0.1em"
              }}>
                Service {i + 1}
              </span>
            </div>
            <button
              onClick={() => del(i)}
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.2)",
                color: "#f87171",
                borderRadius: 7,
                padding: "4px 12px",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 4
              }}
            >
              <Trash2 className="w-3 h-3" />
              Supprimer
            </button>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Field label="Icône" value={svc.icon ?? ""} onChange={v => upd(i, "icon", v)} dark={dark} />
            <Field label="Titre" value={svc.title ?? ""} onChange={v => upd(i, "title", v)} dark={dark} />
            <Field label="Description" value={svc.description ?? ""} onChange={v => upd(i, "description", v)} multi dark={dark} />
            <ImgUpload label="Photo" cur={svc.image ?? ""} path={"service-" + i} onDone={v => upd(i, "image", v)} dark={dark} height={120} />
          </div>
        </motion.div>
      ))}
      
      <button
        onClick={add}
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
        Ajouter un service
      </button>
    </div>
  );
}

// ── ABOUT ────────────────────────────────────────────────────────────────────
// ── REUSSITES ─────────────────────────────────────────────────────────────────
function ReussitesEd({ dark }: { dark: boolean }) {
  const s = ms(dark);
  const [sectionVisible, setSectionVisible] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
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

  useEffect(() => { load(); }, []);

  const uploadImg = async (file: File, path: string): Promise<string> => {
    const ext = file.name.split(".").pop();
    const fp = `${path}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("site-images").upload(fp, file, { upsert: true });
    if (error) throw error;
    return supabase.storage.from("site-images").getPublicUrl(fp).data.publicUrl;
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

  const toggleProject = async (p: any) => {
    await supabase.from("reussites").update({ is_active: !p.is_active }).eq("id", p.id);
    load();
  };

  const deleteProject = async (id: number) => {
    if (!confirm("Supprimer cette réalisation ?")) return;
    await supabase.from("reussites").delete().eq("id", id);
    load();
  };

  const updateField = async (id: number, field: string, value: any) => {
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
        display: "flex", alignItems: "center", justifyContent: "space-between",
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
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
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

              <div style={{ display: "flex", gap: 6 }}>
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

          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <input
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="Titre (optionnel)"
              style={{
                flex: 1, background: s.ibg, border: "1px solid " + s.brd,
                borderRadius: 8, padding: "9px 12px",
                color: s.tx, fontSize: 13, outline: "none",
              }}
            />
            <select
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              style={{
                background: s.ibg, border: "1px solid " + s.brd,
                borderRadius: 8, padding: "9px 12px",
                color: s.tx, fontSize: 13, outline: "none",
              }}
            >
              <option value="">Catégorie...</option>
              {CATS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
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
// Replace the existing AboutEd function in admin/page.tsx with this one
function AboutEd({ data, onChange, dark }: { data: any; onChange: (d: any) => void; dark: boolean }) {
  const s = ms(dark);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const f = (k: string, v: any) => onChange({ ...data, [k]: v });

  const uploadImage = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const fp = `about/image_${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("site-images").upload(fp, file, { upsert: true });
    if (error) { alert("Upload error: " + error.message); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("site-images").getPublicUrl(fp);
    f("image", urlData.publicUrl);
    setUploading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

      {/* Info banner */}
      <div style={{
        background: dark ? "rgba(13,148,136,0.06)" : "rgba(13,148,136,0.04)",
        border: "1px solid rgba(13,148,136,0.2)",
        borderRadius: 12,
        padding: "14px 18px",
        fontSize: 13,
        color: dark ? "#94a3b8" : "#64748b",
        lineHeight: 1.7,
        display: "flex",
        alignItems: "center",
        gap: 8
      }}>
        <Award className="w-4 h-4" style={{ color: teal }} />
        <span>Section À propos — Présentation de l'entreprise sur la page d'accueil</span>
      </div>

      {/* ── VISIBLE TOGGLE ── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: data.visible
          ? (dark ? "rgba(13,148,136,0.08)" : "rgba(13,148,136,0.04)")
          : (dark ? "rgba(51,65,85,0.3)" : "rgba(226,232,240,0.5)"),
        border: "1px solid " + (data.visible ? "rgba(13,148,136,0.3)" : s.brd),
        borderRadius: 12,
        padding: "14px 18px",
      }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: s.tx }}>
            {data.visible ? " Section visible sur le site" : " Section masquée"}
          </div>
          <div style={{ fontSize: 12, color: s.sub, marginTop: 3 }}>
            {data.visible
              ? "La section «À propos» est affichée sur la page d'accueil"
              : "La section est cachée — personne ne la voit"}
          </div>
        </div>
        <button
          onClick={() => f("visible", !data.visible)}
          style={{
            background: data.visible ? tG : (dark ? "rgba(51,65,85,0.5)" : "#e2e8f0"),
            border: "none",
            borderRadius: 8,
            padding: "8px 18px",
            color: data.visible ? "#fff" : s.sub,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            whiteSpace: "nowrap" as const,
          }}
        >
          {data.visible ? "Masquer" : "Afficher"}
        </button>
      </div>

      {/* ── TEXT FIELDS ── */}
      <Field label="Titre" value={data.title ?? ""} onChange={v => f("title", v)} dark={dark} placeholder="Votre partenaire technologique de confiance" />
      <Field label="Description" value={data.description ?? ""} onChange={v => f("description", v)} multi dark={dark} placeholder="MOD-TECHNOLOGIE est une entreprise..." />
      <Field label="Mission" value={data.mission ?? ""} onChange={v => f("mission", v)} multi dark={dark} placeholder="Notre équipe d'experts qualifiés..." />

      {/* ── STATS ── */}
      <div style={{ borderTop: "1px solid " + s.brd, paddingTop: 16 }}>
        <div style={{
          fontSize: 11,
          fontWeight: 700,
          color: s.mut,
          textTransform: "uppercase" as const,
          letterSpacing: "0.1em",
          marginBottom: 14
        }}>
          Statistiques (3 chiffres clés)
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {([
            { key: "years",    label: "Années",   placeholder: "5+" },
            { key: "clients",  label: "Clients",  placeholder: "200+" },
            { key: "projects", label: "Projets",  placeholder: "500+" },
          ] as const).map(({ key, label, placeholder }) => (
            <div key={key} style={{
              background: s.ci,
              border: "1px solid " + s.brd,
              borderRadius: 12,
              padding: 14,
              textAlign: "center" as const
            }}>
              <div style={{ fontSize: 11, color: s.sub, marginBottom: 8, fontWeight: 600 }}>{label}</div>
              <input
                value={data[key] ?? ""}
                onChange={e => f(key, e.target.value)}
                placeholder={placeholder}
                style={{
                  background: "transparent",
                  border: "none",
                  borderBottom: "1px solid " + s.brd,
                  width: "100%",
                  textAlign: "center" as const,
                  color: teal,
                  fontSize: 22,
                  fontWeight: 800,
                  outline: "none",
                  fontFamily: "inherit",
                  paddingBottom: 4,
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── IMAGE (optional) ── */}
      <div style={{ borderTop: "1px solid " + s.brd, paddingTop: 16 }}>
        <div style={{
          fontSize: 11,
          fontWeight: 700,
          color: s.mut,
          textTransform: "uppercase" as const,
          letterSpacing: "0.1em",
          marginBottom: 12,
          display: "flex",
          alignItems: "center",
          gap: 6
        }}>
          <ImageIcon className="w-4 h-4" />
          Image (optionnelle)
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={e => { if (e.target.files?.[0]) uploadImage(e.target.files[0]); }}
        />

        {data.image ? (
          <div style={{ position: "relative", display: "inline-block", width: "100%" }}>
            <img
              src={data.image}
              alt="about"
              style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 10, border: "1px solid " + s.brd, display: "block" }}
            />
            <button
              onClick={() => f("image", "")}
              style={{
                position: "absolute", top: 8, right: 8,
                background: "rgba(239,68,68,0.9)", border: "none", borderRadius: 6,
                color: "#fff", padding: "4px 10px", cursor: "pointer",
                fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 4
              }}
            >
              <X className="w-3 h-3" /> Supprimer
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              border: "2px dashed rgba(13,148,136,0.3)", borderRadius: 10, height: 100,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: s.sub, fontSize: 13, cursor: "pointer",
              flexDirection: "column" as const, gap: 6
            }}
          >
            <ImageIcon className="w-6 h-6" />
            {uploading ? " Upload en cours..." : " Cliquer pour ajouter une image"}
          </div>
        )}
      </div>
    </div>
  );
}
// ── CONTACT ───────────────────────────────────────────────────────────────────
function ContactEd({ data, onChange, dark }: { data: any; onChange: (d: any) => void; dark: boolean }) {
  const s = ms(dark);
  const f = (k: string, v: string) => onChange({ ...data, [k]: v });
  
  const socialFields = [
    { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/...", color: "#1877f2", icon: "f" },
    { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/...", color: "#e1306c", icon: "📷" },
    { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/...", color: "#0077b5", icon: "in" },
  ];
  
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{
        background: dark ? "rgba(13,148,136,0.06)" : "rgba(13,148,136,0.04)",
        border: "1px solid rgba(13,148,136,0.2)",
        borderRadius: 12,
        padding: "14px 18px",
        fontSize: 13,
        color: dark ? "#94a3b8" : "#64748b",
        lineHeight: 1.7,
        marginBottom: 8,
        display: "flex",
        alignItems: "center",
        gap: 8
      }}>
        <Phone className="w-4 h-4" style={{ color: teal }} />
        <span>Informations de contact</span>
      </div>

      <Field label="Téléphone 1" value={data.phone1 ?? ""} onChange={v => f("phone1", v)} dark={dark} />
      <Field label="Téléphone 2" value={data.phone2 ?? ""} onChange={v => f("phone2", v)} dark={dark} />
      <Field label="Email" value={data.email ?? ""} onChange={v => f("email", v)} dark={dark} />
      <Field label="Adresse" value={data.address ?? ""} onChange={v => f("address", v)} dark={dark} />
      <Field label="WhatsApp" value={data.whatsapp ?? ""} onChange={v => f("whatsapp", v)} dark={dark} />
      
      <div style={{ borderTop: "1px solid " + s.brd, paddingTop: 20 }}>
        <div style={{
          fontSize: 11,
          fontWeight: 700,
          color: s.mut,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: 16
        }}>
          Réseaux Sociaux
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {socialFields.map(({ key, label, placeholder, color, icon }) => (
            <div key={key} style={{ display: "grid", gridTemplateColumns: "130px 1fr", gap: 12, alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  color: "#fff",
                  fontWeight: 800,
                  flexShrink: 0
                }}>
                  {icon}
                </div>
                <label style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: s.mut,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontFamily: "monospace"
                }}>
                  {label}
                </label>
              </div>
              <input
                value={data[key] ?? ""}
                onChange={e => f(key, e.target.value)}
                placeholder={placeholder}
                style={{
                  background: s.ibg,
                  border: "1px solid " + s.brd,
                  borderRadius: 8,
                  padding: "10px 13px",
                  color: s.tx,
                  fontSize: 13,
                  width: "100%",
                  outline: "none",
                  fontFamily: "inherit",
                  boxSizing: "border-box"
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── SLIDER ────────────────────────────────────────────────────────────────────
function SliderEd({ slides, onReload, dark }: { slides: Slide[]; onReload: () => void; dark: boolean }) {
  const s = ms(dark);
  const [saving, setSaving] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [newSlide, setNewSlide] = useState({ title: "", description: "", image: "", sort_order: slides.length + 1 });
  
  const uploadImg = async (file: File, path: string): Promise<string> => {
    const ext = file.name.split(".").pop();
    const fp = `${path}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("site-images").upload(fp, file, { upsert: true });
    if (error) throw error;
    return supabase.storage.from("site-images").getPublicUrl(fp).data.publicUrl;
  };
  
  const updateField = async (id: number, field: string, value: any) => {
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
      } catch (e: any) {
        alert(e.message);
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
      } catch (e: any) {
        alert(e.message);
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
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
            <div style={{ display: "flex", gap: 8 }}>
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

// ── PARTNERS ─────────────────────────────────────────────────────────────────
function PartnersEd({ partners, onReload, dark }: { partners: Partner[]; onReload: () => void; dark: boolean }) {
  const s = ms(dark);
  const [saving, setSaving] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [newP, setNewP] = useState({ name: "", logo: "", website: "", sort_order: partners.length + 1 });
  
  const uploadImg = async (file: File, path: string): Promise<string> => {
    const ext = file.name.split(".").pop();
    const fp = `${path}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("site-images").upload(fp, file, { upsert: true });
    if (error) throw error;
    return supabase.storage.from("site-images").getPublicUrl(fp).data.publicUrl;
  };
  
  const updateField = async (id: number, field: string, value: any) => {
    setSaving(id);
    await supabase.from("partners").update({ [field]: value }).eq("id", id);
    setSaving(null);
    onReload();
  };
  
  const toggleActive = async (p: Partner) => {
    await supabase.from("partners").update({ is_active: !p.is_active }).eq("id", p.id);
    onReload();
  };
  
  const deleteP = async (id: number) => {
    if (!confirm("Supprimer ?")) return;
    await supabase.from("partners").delete().eq("id", id);
    onReload();
  };
  
  const addP = async () => {
    if (!newP.logo) { alert("Logo obligatoire"); return; }
    if (!newP.name) { alert("Nom obligatoire"); return; }
    setSaving(-1);
    await supabase.from("partners").insert([{ ...newP, is_active: true }]);
    setNewP({ name: "", logo: "", website: "", sort_order: partners.length + 2 });
    setAdding(false);
    setSaving(null);
    onReload();
  };
  
  function LogoImg({ cur, pid }: { cur: string; pid: number }) {
    const [prev, setPrev] = useState(cur);
    const [up, setUp] = useState(false);
    const ref = useRef<HTMLInputElement>(null);
    
    const h = async (file: File) => {
      setUp(true);
      try {
        const url = await uploadImg(file, `partner-${pid}`);
        setPrev(url);
        await supabase.from("partners").update({ logo: url }).eq("id", pid);
        onReload();
      } catch (e: any) {
        alert(e.message);
      }
      setUp(false);
    };
    
    return (
      <div
        style={{
          width: 110,
          height: 64,
          borderRadius: 10,
          overflow: "hidden",
          border: "1px solid " + s.brd,
          cursor: "pointer",
          position: "relative",
          background: dark ? "#1e2a3a" : "#f8fafc",
          flexShrink: 0
        }}
        onClick={() => ref.current?.click()}
      >
        <img src={prev} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", padding: 6 }} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0,
            transition: "opacity 0.2s"
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "0")}
        >
          <span style={{ color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 2 }}>
            {up ? <RefreshCw className="w-3 h-3 animate-spin" /> : <ImageIcon className="w-3 h-3" />}
            {up ? "⏳" : "📷"}
          </span>
        </div>
        <input ref={ref} type="file" accept="image/*" style={{ display: "none" }} onChange={e => e.target.files?.[0] && h(e.target.files[0])} />
      </div>
    );
  }
  
  function NewLogo({ onUrl }: { onUrl: (u: string) => void }) {
    const [prev, setPrev] = useState("");
    const [up, setUp] = useState(false);
    const ref = useRef<HTMLInputElement>(null);
    
    const h = async (file: File) => {
      setUp(true);
      try {
        const url = await uploadImg(file, "partner-new");
        setPrev(url);
        onUrl(url);
      } catch (e: any) {
        alert(e.message);
      }
      setUp(false);
    };
    
    return (
      <div>
        {prev ? (
          <div style={{
            borderRadius: 8,
            border: "1px solid " + s.brd,
            marginBottom: 8,
            padding: 6,
            background: dark ? "#1e2a3a" : "#f8fafc",
            height: 70,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative"
          }}>
            <img src={prev} alt="" style={{ maxHeight: 56, maxWidth: 140, objectFit: "contain" }} />
            <button
              onClick={() => { setPrev(""); onUrl(""); }}
              style={{
                position: "absolute",
                top: 4,
                right: 4,
                background: "rgba(239,68,68,0.9)",
                border: "none",
                borderRadius: 5,
                color: "#fff",
                cursor: "pointer",
                fontSize: 10,
                padding: "2px 6px"
              }}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div style={{
            borderRadius: 8,
            border: "2px dashed rgba(13,148,136,0.3)",
            height: 70,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 8,
            color: s.sub,
            fontSize: 12,
            flexDirection: "column",
            gap: 3
          }}>
            <ImageIcon className="w-5 h-5" />
            <span>Aucun logo</span>
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
            padding: "7px 14px",
            color: teal,
            fontSize: 12,
            fontWeight: 600,
            cursor: up ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6
          }}
        >
          {up ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
          {up ? "⏳" : "📁 Logo *"}
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
        <Users className="w-4 h-4" style={{ color: teal }} />
        <span>
          <span style={{ color: teal, fontWeight: 700 }}>{partners.length} partenaire{partners.length !== 1 ? "s" : ""}</span> ·
          <span style={{ color: "#10b981", fontWeight: 600 }}> {partners.filter(x => x.is_active).length} actifs</span>
        </span>
      </div>
      
      {[...partners].sort((a, b) => a.sort_order - b.sort_order).map(p => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: s.card,
            border: "1px solid " + (p.is_active ? s.brd : "rgba(239,68,68,0.25)"),
            borderRadius: 12,
            padding: 14,
            opacity: p.is_active ? 1 : 0.55
          }}
        >
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <LogoImg cur={p.logo} pid={p.id} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
              <input
                defaultValue={p.name}
                onBlur={e => updateField(p.id, "name", e.target.value)}
                style={{
                  background: s.ibg,
                  border: "1px solid " + s.brd,
                  borderRadius: 8,
                  padding: "7px 10px",
                  color: s.tx,
                  fontSize: 14,
                  outline: "none",
                  fontFamily: "inherit",
                  width: "100%",
                  boxSizing: "border-box",
                  fontWeight: 600
                }}
              />
              <input
                defaultValue={p.website}
                onBlur={e => updateField(p.id, "website", e.target.value)}
                placeholder="https://..."
                style={{
                  background: s.ibg,
                  border: "1px solid " + s.brd,
                  borderRadius: 8,
                  padding: "7px 10px",
                  color: s.sub,
                  fontSize: 12,
                  outline: "none",
                  fontFamily: "inherit",
                  width: "100%",
                  boxSizing: "border-box"
                }}
              />
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <input
                  type="number"
                  defaultValue={p.sort_order}
                  onBlur={e => updateField(p.id, "sort_order", parseInt(e.target.value) || 0)}
                  style={{
                    width: 55,
                    background: s.ibg,
                    border: "1px solid " + s.brd,
                    borderRadius: 7,
                    padding: "5px 7px",
                    color: teal,
                    fontSize: 12,
                    outline: "none",
                    textAlign: "center",
                    fontFamily: "inherit"
                  }}
                />
                <div style={{ flex: 1 }} />
                {saving === p.id && <RefreshCw className="w-3 h-3 animate-spin" style={{ color: teal }} />}
                <button
                  onClick={() => toggleActive(p)}
                  style={{
                    background: p.is_active ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.08)",
                    border: "1px solid " + (p.is_active ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.2)"),
                    borderRadius: 7,
                    padding: "4px 10px",
                    color: p.is_active ? "#10b981" : "#f87171",
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4
                  }}
                >
                  {p.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  {p.is_active ? "Actif" : "Inactif"}
                </button>
                <button
                  onClick={() => deleteP(p.id)}
                  style={{
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    borderRadius: 7,
                    padding: "4px 8px",
                    color: "#f87171",
                    fontSize: 11,
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
            Nouveau partenaire
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <NewLogo onUrl={url => setNewP(n => ({ ...n, logo: url }))} />
            <input
              placeholder="Nom *"
              value={newP.name}
              onChange={e => setNewP(n => ({ ...n, name: e.target.value }))}
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
            <input
              placeholder="Site web"
              value={newP.website}
              onChange={e => setNewP(n => ({ ...n, website: e.target.value }))}
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
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={addP}
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
                {saving === -1 ? "⏳" : "Ajouter"}
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
          Ajouter un partenaire
        </button>
      )}
    </div>
  );
}

// ── ORDERS ────────────────────────────────────────────────────────────────────
function OrdersEd({ dark }: { dark: boolean }) {
  const s = ms(dark);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<Order | null>(null);
  
  const loadOrders = async () => {
    setLoading(true);
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setOrders(data ?? []);
    setLoading(false);
  };
  
  useEffect(() => { loadOrders(); }, []);
  
  const updateStatus = async (id: number, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    loadOrders();
    if (selected?.id === id) setSelected(o => o ? { ...o, status } : null);
  };
  
  const deleteOrder = async (id: number) => {
    if (!confirm("Supprimer ?")) return;
    await supabase.from("orders").delete().eq("id", id);
    loadOrders();
    if (selected?.id === id) setSelected(null);
  };
  
  const ST: Record<string, { label: string; color: string; bg: string }> = {
    new: { label: " Nouveau", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
    confirmed: { label: " Confirmé", color: "#10b981", bg: "rgba(16,185,129,0.12)" },
    shipped: { label: " Expédié", color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
    delivered: { label: " Livré", color: "#8b5cf6", bg: "rgba(139,92,246,0.12)" },
    cancelled: { label: " Annulée", color: "#ef4444", bg: "rgba(239,68,68,0.12)" }
  };
  
  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter);
  const counts = Object.keys(ST).reduce((a, k) => ({ ...a, [k]: orders.filter(o => o.status === k).length }), {} as Record<string, number>);
  
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
        <ShoppingBag className="w-4 h-4" style={{ color: teal }} />
        <span>
          <span style={{ color: teal, fontWeight: 700 }}>{orders.length} commande{orders.length !== 1 ? "s" : ""}</span>
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(110px,1fr))", gap: 8 }}>
        {[["all", " Tous", orders.length, "#64748b"], ...Object.entries(ST).map(([k, v]) => [k, v.label, counts[k] || 0, v.color])].map(([k, l, c, col]) => (
          <button
            key={k as string}
            onClick={() => setFilter(k as string)}
            style={{
              background: filter === k ? (dark ? "rgba(13,148,136,0.15)" : "rgba(13,148,136,0.08)") : "transparent",
              border: filter === k ? "1px solid rgba(13,148,136,0.4)" : "1px solid " + s.brd,
              borderRadius: 10,
              padding: "10px 6px",
              cursor: "pointer",
              textAlign: "center"
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 800, color: col as string }}>{c as number}</div>
            <div style={{ fontSize: 10, color: s.sub, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{l as string}</div>
          </button>
        ))}
      </div>
      
      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: s.sub, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <RefreshCw className="w-4 h-4 animate-spin" />
          Chargement...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: s.sub }}>
          <ShoppingBag className="w-12 h-12 mx-auto mb-4" style={{ color: s.mut }} />
          <p>Aucune commande</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(order => {
            const st = ST[order.status] || ST.new;
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: s.card,
                  border: "1px solid " + s.brd,
                  borderRadius: 14,
                  overflow: "hidden",
                  cursor: "pointer"
                }}
                onClick={() => setSelected(selected?.id === order.id ? null : order)}
              >
                <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ background: st.bg, borderRadius: 8, padding: "4px 10px", fontSize: 11, fontWeight: 700, color: st.color, whiteSpace: "nowrap" }}>
                    {st.label}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{order.customer_name}</div>
                    <div style={{ fontSize: 12, color: s.sub }}>
                      {order.customer_phone} · {new Date(order.created_at).toLocaleString("fr-DZ")}
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: teal, whiteSpace: "nowrap" }}>
                    {order.total.toLocaleString()} DA
                  </div>
                  <div style={{ color: s.sub, fontSize: 16 }}>
                    {selected?.id === order.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
                
                {selected?.id === order.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    style={{ borderTop: "1px solid " + s.brd, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 14 }}
                    onClick={e => e.stopPropagation()}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {order.items.map((item, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "6px 10px", background: s.ci, borderRadius: 8 }}>
                          <span>{item.name} × {item.qty}</span>
                          <span style={{ fontWeight: 700, color: teal }}>{(item.price * item.qty).toLocaleString()} DA</span>
                        </div>
                      ))}
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800, padding: "8px 10px", borderTop: "1px solid " + s.brd }}>
                        <span>Total</span>
                        <span style={{ color: teal }}>{order.total.toLocaleString()} DA</span>
                      </div>
                    </div>
                    
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13 }}>
                      {[
                        ["address", order.customer_address],
                        ["email", order.customer_email || "—"],
                        ["phone", order.customer_phone || "—"],
                        ["notes", order.notes || "—"]


                      ].map(([l, v]) => (
                        <div key={l as string} style={{ background: s.ci, borderRadius: 8, padding: "8px 12px" }}>
                          <div style={{ fontSize: 10, color: s.sub, marginBottom: 3, fontWeight: 600 }}>{l}</div>
                          <div style={{ color: s.tx }}>{v as string}</div>
                        </div>
                      ))}
                    </div>
                    
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {Object.entries(ST).filter(([k]) => k !== order.status).map(([k, v]) => (
                        <button
                          key={k}
                          onClick={() => updateStatus(order.id, k)}
                          style={{
                            background: v.bg,
                            borderRadius: 8,
                            border: "none",
                            padding: "6px 12px",
                            color: v.color,
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: "pointer"
                          }}
                        >
                          {v.label}
                        </button>
                      ))}
                      <div style={{ flex: 1 }} />
                      <a
                        href={`tel:${order.customer_phone}`}
                        style={{
                          background: "rgba(16,185,129,0.1)",
                          border: "1px solid rgba(16,185,129,0.3)",
                          borderRadius: 8,
                          padding: "6px 14px",
                          color: "#10b981",
                          fontSize: 12,
                          fontWeight: 700,
                          textDecoration: "none"
                        }}
                      >
                        📞 Appeler
                      </a>
                      <button
                        onClick={() => deleteOrder(order.id)}
                        style={{
                          background: "rgba(239,68,68,0.08)",
                          border: "1px solid rgba(239,68,68,0.2)",
                          borderRadius: 8,
                          padding: "6px 10px",
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
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── PRODUCTS ──────────────────────────────────────────────────────────────────
function ProductsEd({ dark }: { dark: boolean }) {
  const s = ms(dark);
  const [products, setProducts] = useState<Product[]>([]);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState<number | null>(null);
  const [editingProduct, setEditingProduct] = useState<number | null>(null);
  const [newP, setNewP] = useState({
    name: "",
    description: "",
    price: 0,
    original_price: 0,
    discount_percent: 0,
    image: "",
    images: [] as string[],
    category: "Caméras",
    sort_order: 1,
    in_stock: true,
    colors: [] as { name: string; hex: string }[],
    sizes: [] as string[],
    specs: {} as Record<string, string>,
    reference: ""
  });

  const CATS = ["Caméras", "Réseau", "Accès", "Sonorisation", "Domotique", "Autre"];

  const load = async () => {
    const { data } = await supabase.from("products").select("*").order("sort_order");
    setProducts(data ?? []);
  };

  useEffect(() => { load(); }, []);

  const uploadImg = async (file: File, path: string): Promise<string> => {
    const ext = file.name.split(".").pop();
    const fp = `${path}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("site-images").upload(fp, file, { upsert: true });
    if (error) throw error;
    return supabase.storage.from("site-images").getPublicUrl(fp).data.publicUrl;
  };

  const updateField = async (id: number, field: string, value: any) => {
    setSaving(id);
    await supabase.from("products").update({ [field]: value }).eq("id", id);
    setSaving(null);
    load();
  };

  const toggleActive = async (p: Product) => {
    await supabase.from("products").update({ is_active: !p.is_active }).eq("id", p.id);
    load();
  };

  const del = async (id: number) => {
    if (!confirm("Supprimer ce produit ?")) return;
    await supabase.from("products").delete().eq("id", id);
    load();
  };

  const add = async () => {
    if (!newP.name) { alert("Nom obligatoire"); return; }
    if (!newP.price) { alert("Prix obligatoire"); return; }
    setSaving(-1);
    await supabase.from("products").insert([{ ...newP, is_active: true }]);
    setNewP({
      name: "", description: "", price: 0, original_price: 0, discount_percent: 0,
      image: "", images: [], category: "Caméras", sort_order: products.length + 2,
      in_stock: true, colors: [], sizes: [], specs: {}, reference: ""
    });
    setAdding(false);
    setSaving(null);
    load();
  };

  // Color management
  const addColor = (productId: number, color: { name: string; hex: string }) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const newColors = [...(product.colors || []), color];
    updateField(productId, 'colors', newColors);
  };

  const removeColor = (productId: number, colorName: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const newColors = (product.colors || []).filter(c => c.name !== colorName);
    updateField(productId, 'colors', newColors);
  };

  // Size management
  const addSize = (productId: number, size: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const newSizes = [...(product.sizes || []), size];
    updateField(productId, 'sizes', newSizes);
  };

  const removeSize = (productId: number, size: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const newSizes = (product.sizes || []).filter(s => s !== size);
    updateField(productId, 'sizes', newSizes);
  };

  // Specs management
  const updateSpec = (productId: number, key: string, value: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const newSpecs = { ...(product.specs || {}), [key]: value };
    updateField(productId, 'specs', newSpecs);
  };

  const removeSpec = (productId: number, key: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const newSpecs = { ...(product.specs || {}) };
    delete newSpecs[key];
    updateField(productId, 'specs', newSpecs);
  };

  // Multi-image upload
  const addImage = async (productId: number, file: File) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const url = await uploadImg(file, `product-${productId}-gallery`);
    const newImages = [...(product.images || []), url];
    await updateField(productId, 'images', newImages);
  };

  const removeImage = async (productId: number, imageUrl: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const newImages = (product.images || []).filter(img => img !== imageUrl);
    await updateField(productId, 'images', newImages);
  };

  const setMainImage = async (productId: number, imageUrl: string) => {
    await updateField(productId, 'image', imageUrl);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
        <ShoppingBag className="w-4 h-4" style={{ color: teal }} />
        <span>
          <span style={{ color: teal, fontWeight: 700 }}>{products.length} produit{products.length !== 1 ? "s" : ""}</span> ·
          <span style={{ color: "#10b981", fontWeight: 600 }}> {products.filter(x => x.is_active).length} actifs</span> ·
          <span style={{ color: "#f59e0b", fontWeight: 600 }}> {products.filter(x => x.discount_percent > 0).length} en promotion</span>
        </span>
      </div>

      {products.map(p => {
        const isEditing = editingProduct === p.id;

        return (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: s.card,
              border: "1px solid " + (p.is_active ? s.brd : "rgba(239,68,68,0.25)"),
              borderRadius: 16,
              overflow: "hidden",
              opacity: p.is_active ? 1 : 0.6
            }}
          >
            {/* Product header */}
            <div
              style={{
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: dark ? "rgba(13,148,136,0.02)" : "rgba(13,148,136,0.02)",
                borderBottom: isEditing ? "1px solid " + s.brd : "none",
                cursor: "pointer"
              }}
              onClick={() => setEditingProduct(isEditing ? null : p.id)}
            >
              {/* Thumbnail */}
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 10,
                overflow: "hidden",
                background: dark ? "#1e2a3a" : "#f1f5f9",
                flexShrink: 0
              }}>
                {p.image ? (
                  <img src={p.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>📦</div>
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{p.name}</span>
                  {p.reference && <span style={{ fontSize: 10, color: s.sub, fontFamily: "monospace" }}>#{p.reference}</span>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: s.sub, marginTop: 4, flexWrap: "wrap" }}>
                  <span style={{ color: teal, fontWeight: 700 }}>{p.price.toLocaleString()} DA</span>
                  {p.original_price > 0 && <span style={{ textDecoration: "line-through", color: "#ef4444" }}>{p.original_price.toLocaleString()}</span>}
                  {p.discount_percent > 0 && <span style={{ background: "#ef4444", color: "#fff", borderRadius: 4, padding: "2px 6px", fontSize: 10 }}>-{p.discount_percent}%</span>}
                  <span>•</span>
                  <span style={{ color: p.in_stock ? "#10b981" : "#ef4444" }}>{p.in_stock ? "En stock" : "Rupture"}</span>
                  <span>•</span>
                  <span>{p.colors?.length || 0} couleurs</span>
                  <span>•</span>
                  <span>{p.images?.length || 0} images</span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 6 }}>
                {saving === p.id && <RefreshCw className="w-4 h-4 animate-spin" style={{ color: teal }} />}
                <button
                  onClick={(e) => { e.stopPropagation(); toggleActive(p); }}
                  style={{
                    background: p.is_active ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.08)",
                    border: "1px solid " + (p.is_active ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.2)"),
                    borderRadius: 6,
                    padding: "4px 9px",
                    color: p.is_active ? "#10b981" : "#f87171",
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4
                  }}
                >
                  {p.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  {p.is_active ? "Actif" : "Off"}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); del(p.id); }}
                  style={{
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    borderRadius: 6,
                    padding: "4px 7px",
                    color: "#f87171",
                    fontSize: 11,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
                <span style={{ color: s.sub, fontSize: 14 }}>
                  {isEditing ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </span>
              </div>
            </div>

            {/* Expanded edit panel */}
            {isEditing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 20 }}
              >
                {/* Main image and gallery */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: s.mut, textTransform: "uppercase", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                    <ImageIcon className="w-4 h-4" />
                    Images
                  </div>

                  {/* Main image */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, color: s.sub, marginBottom: 8 }}>Image principale</div>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <div style={{
                        width: 100,
                        height: 100,
                        borderRadius: 10,
                        overflow: "hidden",
                        background: dark ? "#1e2a3a" : "#f1f5f9",
                        border: "2px solid " + teal,
                        position: "relative"
                      }}>
                        {p.image ? (
                          <img src={p.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>📷</div>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        id={`main-img-${p.id}`}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = await uploadImg(file, `product-${p.id}-main`);
                            await updateField(p.id, 'image', url);
                          }
                        }}
                      />
                      <label
                        htmlFor={`main-img-${p.id}`}
                        style={{
                          background: "rgba(13,148,136,0.1)",
                          border: "1px dashed rgba(13,148,136,0.4)",
                          borderRadius: 8,
                          padding: "8px 16px",
                          color: teal,
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 6
                        }}
                      >
                        <ImageIcon className="w-4 h-4" />
                        Changer
                      </label>
                    </div>
                  </div>

                  {/* Gallery images */}
                  <div>
                    <div style={{ fontSize: 12, color: s.sub, marginBottom: 8 }}>Images supplémentaires ({p.images?.length || 0})</div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
                      {(p.images || []).map((img, idx) => (
                        <div key={idx} style={{
                          width: 80,
                          height: 80,
                          borderRadius: 8,
                          overflow: "hidden",
                          border: "1px solid " + s.brd,
                          position: "relative"
                        }}>
                          <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          <div style={{
                            position: "absolute",
                            top: 4,
                            right: 4,
                            display: "flex",
                            gap: 4
                          }}>
                            <button
                              onClick={() => setMainImage(p.id, img)}
                              style={{
                                background: "rgba(13,148,136,0.9)",
                                border: "none",
                                borderRadius: 4,
                                color: "#fff",
                                fontSize: 10,
                                padding: "2px 4px",
                                cursor: "pointer"
                              }}
                            >
                              <Star className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => removeImage(p.id, img)}
                              style={{
                                background: "rgba(239,68,68,0.9)",
                                border: "none",
                                borderRadius: 4,
                                color: "#fff",
                                fontSize: 10,
                                padding: "2px 4px",
                                cursor: "pointer"
                              }}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Add image button */}
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          id={`gallery-${p.id}`}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              await addImage(p.id, file);
                            }
                          }}
                        />
                        <label
                          htmlFor={`gallery-${p.id}`}
                          style={{
                            width: 80,
                            height: 80,
                            borderRadius: 8,
                            border: "2px dashed rgba(13,148,136,0.3)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 24,
                            color: teal,
                            cursor: "pointer"
                          }}
                        >
                          <Plus className="w-6 h-6" />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Basic info grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: s.mut, display: "block", marginBottom: 4 }}>Nom *</label>
                    <input
                      defaultValue={p.name}
                      onBlur={e => updateField(p.id, "name", e.target.value)}
                      style={{
                        width: "100%",
                        background: s.ibg,
                        border: "1px solid " + s.brd,
                        borderRadius: 8,
                        padding: "8px 10px",
                        color: s.tx,
                        fontSize: 13,
                        outline: "none"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: s.mut, display: "block", marginBottom: 4 }}>Référence</label>
                    <input
                      defaultValue={p.reference || ""}
                      onBlur={e => updateField(p.id, "reference", e.target.value)}
                      style={{
                        width: "100%",
                        background: s.ibg,
                        border: "1px solid " + s.brd,
                        borderRadius: 8,
                        padding: "8px 10px",
                        color: s.tx,
                        fontSize: 13,
                        outline: "none"
                      }}
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: s.mut, display: "block", marginBottom: 4 }}>Description</label>
                  <textarea
                    defaultValue={p.description || ""}
                    onBlur={e => updateField(p.id, "description", e.target.value)}
                    rows={2}
                    style={{
                      width: "100%",
                      background: s.ibg,
                      border: "1px solid " + s.brd,
                      borderRadius: 8,
                      padding: "8px 10px",
                      color: s.tx,
                      fontSize: 13,
                      outline: "none",
                      resize: "vertical"
                    }}
                  />
                </div>

                {/* Price and promotion */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: s.mut, display: "block", marginBottom: 4 }}>Prix actuel (DA) *</label>
                    <input
                      type="number"
                      defaultValue={p.price}
                      onBlur={e => updateField(p.id, "price", parseFloat(e.target.value) || 0)}
                      style={{
                        width: "100%",
                        background: s.ibg,
                        border: "1px solid " + s.brd,
                        borderRadius: 8,
                        padding: "8px 10px",
                        color: teal,
                        fontSize: 13,
                        outline: "none"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: s.mut, display: "block", marginBottom: 4 }}>Prix original</label>
                    <input
                      type="number"
                      defaultValue={p.original_price || 0}
                      onBlur={e => updateField(p.id, "original_price", parseFloat(e.target.value) || 0)}
                      style={{
                        width: "100%",
                        background: s.ibg,
                        border: "1px solid " + s.brd,
                        borderRadius: 8,
                        padding: "8px 10px",
                        color: "#ef4444",
                        fontSize: 13,
                        outline: "none"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: s.mut, display: "block", marginBottom: 4 }}>Promotion %</label>
                    <input
                      type="number"
                      defaultValue={p.discount_percent || 0}
                      onBlur={e => updateField(p.id, "discount_percent", parseFloat(e.target.value) || 0)}
                      style={{
                        width: "100%",
                        background: s.ibg,
                        border: "1px solid " + s.brd,
                        borderRadius: 8,
                        padding: "8px 10px",
                        color: "#f59e0b",
                        fontSize: 13,
                        outline: "none"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: s.mut, display: "block", marginBottom: 4 }}>Ordre</label>
                    <input
                      type="number"
                      defaultValue={p.sort_order}
                      onBlur={e => updateField(p.id, "sort_order", parseInt(e.target.value) || 0)}
                      style={{
                        width: "100%",
                        background: s.ibg,
                        border: "1px solid " + s.brd,
                        borderRadius: 8,
                        padding: "8px 10px",
                        color: s.tx,
                        fontSize: 13,
                        outline: "none"
                      }}
                    />
                  </div>
                </div>

                {/* Category and stock */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: s.mut, display: "block", marginBottom: 4 }}>Catégorie</label>
                    <select
                      defaultValue={p.category}
                      onBlur={e => updateField(p.id, "category", e.target.value)}
                      style={{
                        width: "100%",
                        background: s.ibg,
                        border: "1px solid " + s.brd,
                        borderRadius: 8,
                        padding: "8px 10px",
                        color: s.tx,
                        fontSize: 13,
                        outline: "none"
                      }}
                    >
                      {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: s.mut, display: "block", marginBottom: 4 }}>Stock</label>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <button
                        onClick={() => updateField(p.id, "in_stock", !p.in_stock)}
                        style={{
                          background: p.in_stock ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.08)",
                          border: "1px solid " + (p.in_stock ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.2)"),
                          borderRadius: 8,
                          padding: "6px 12px",
                          color: p.in_stock ? "#10b981" : "#f87171",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 4
                        }}
                      >
                        {p.in_stock ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {p.in_stock ? "En stock" : "Rupture"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Colors */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: s.mut, display: "flex", alignItems: "center", gap: 4 }}>
                       Couleurs disponibles
                    </label>
                    <button
                      onClick={() => {
                        const colorName = prompt("Nom de la couleur (ex: Rouge, Bleu)");
                        if (!colorName) return;
                        const hex = prompt("Code hexadécimal (ex: #ff0000)");
                        if (!hex) return;
                        addColor(p.id, { name: colorName, hex });
                      }}
                      style={{
                        background: "transparent",
                        border: "1px dashed " + teal,
                        borderRadius: 6,
                        padding: "4px 12px",
                        color: teal,
                        fontSize: 12,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 4
                      }}
                    >
                      <Plus className="w-3 h-3" />
                      Ajouter
                    </button>
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {(p.colors || []).map(c => (
                      <div key={c.name} style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        background: s.ci,
                        border: "1px solid " + s.brd,
                        borderRadius: 20,
                        padding: "4px 10px 4px 4px"
                      }}>
                        <div style={{ width: 20, height: 20, borderRadius: "50%", background: c.hex, border: "2px solid #fff" }} />
                        <span style={{ fontSize: 12 }}>{c.name}</span>
                        <button
                          onClick={() => removeColor(p.id, c.name)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#ef4444",
                            fontSize: 14,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center"
                          }}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sizes */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: s.mut, display: "flex", alignItems: "center", gap: 4 }}>
                       Tailles / Dimensions
                    </label>
                    <button
                      onClick={() => {
                        const size = prompt("Taille (ex: M, XL, 1TB, 4MP)");
                        if (size) addSize(p.id, size);
                      }}
                      style={{
                        background: "transparent",
                        border: "1px dashed " + teal,
                        borderRadius: 6,
                        padding: "4px 12px",
                        color: teal,
                        fontSize: 12,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 4
                      }}
                    >
                      <Plus className="w-3 h-3" />
                      Ajouter
                    </button>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {(p.sizes || []).map(s => (
                      <div key={s} style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,

                        borderRadius: 20,
                        padding: "4px 10px 4px 10px"
                      }}>
                        <span style={{ fontSize: 12 }}>{s}</span>
                        <button
                          onClick={() => removeSize(p.id, s)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#ef4444",
                            fontSize: 14,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center"
                          }}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Specifications */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: s.mut, display: "flex", alignItems: "center", gap: 4 }}>
                      Spécifications techniques
                    </label>
                    <button
                      onClick={() => {
                        const key = prompt("Nom de la spécification (ex: Résolution)");
                        if (!key) return;
                        const value = prompt("Valeur (ex: 4MP)");
                        if (!value) return;
                        updateSpec(p.id, key, value);
                      }}
                      style={{
                        background: "transparent",
                        border: "1px dashed " + teal,
                        borderRadius: 6,
                        padding: "4px 12px",
                        color: teal,
                        fontSize: 12,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 4
                      }}
                    >
                      <Plus className="w-3 h-3" />
                      Ajouter
                    </button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {Object.entries(p.specs || {}).map(([key, val]) => (
                      <div key={key} style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        background: s.ci,
                        border: "1px solid " + s.brd,
                        borderRadius: 8,
                        padding: "6px 12px"
                      }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: s.tx, minWidth: 100 }}>{key}</span>
                        <input
                          defaultValue={val as string}
                          onBlur={e => updateSpec(p.id, key, e.target.value)}
                          style={{
                            flex: 1,
                            background: "transparent",
                            border: "none",
                            borderBottom: "1px solid " + s.brd,
                            color: s.tx,
                            fontSize: 12,
                            padding: "4px",
                            outline: "none"
                          }}
                        />
                        <button
                          onClick={() => removeSpec(p.id, key)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#ef4444",
                            fontSize: 14,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center"
                          }}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                {/* ── Private Note ── */}
<div>
  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
    <div style={{
      fontSize: 11, fontWeight: 700, color: "#f59e0b",
      textTransform: "uppercase" as const, letterSpacing: "0.1em",
      display: "flex", alignItems: "center", gap: 6
    }}>
      Note privée (visible uniquement par l'admin)
    </div>
  </div>
  <textarea
    key={`note-${p.id}`}
    defaultValue={p.private_note || ""}
    onBlur={e => {
      updateField(p.id, "private_note", e.target.value);
      e.currentTarget.style.borderColor = "#f59e0b";
      e.currentTarget.style.boxShadow = "none";
    }}
    rows={3}
    placeholder="Note interne sur ce produit — prix fournisseur, remarques, stock réel..."
    style={{
      width: "100%",
      background: dark ? "#1a1a2e" : "#fffbeb",
      border: "1.5px dashed #f59e0b",
      borderRadius: 10,
      padding: "10px 14px",
      color: dark ? "#fde68a" : "#92400e",
      fontSize: 13,
      outline: "none",
      fontFamily: "inherit",
      resize: "vertical" as const,
      boxSizing: "border-box" as const,
      lineHeight: 1.6,
    }}
    onFocus={e => { e.currentTarget.style.borderColor = "#f59e0b"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(245,158,11,0.15)"; }}
  />
  <div style={{ fontSize: 11, color: "#f59e0b", marginTop: 5, display: "flex", alignItems: "center", gap: 4 }}>
  </div>
</div>
              </motion.div>
            )}
          </motion.div>
        );
      })}

      {/* Add new product form */}
      {adding ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: s.card,
            border: "2px dashed rgba(13,148,136,0.4)",
            borderRadius: 16,
            padding: 24
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: teal, marginBottom: 16, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
            <Plus className="w-4 h-4" />
            Nouveau produit
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Main image */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: s.mut, marginBottom: 8 }}>Image principale *</div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                {newP.image ? (
                  <div style={{ width: 80, height: 80, borderRadius: 8, overflow: "hidden", border: "1px solid " + s.brd }}>
                    <img src={newP.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button
                      onClick={() => setNewP({ ...newP, image: "" })}
                      style={{
                        background: "rgba(239,68,68,0.9)",
                        color: "#fff",
                        border: "none",
                        borderRadius: 4,
                        fontSize: 10,
                        padding: "2px 4px",
                        marginTop: 4,
                        cursor: "pointer"
                      }}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <input
                    type="file"
                    accept="image/*"
                    id="new-main-img"
                    style={{ display: "none" }}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = await uploadImg(file, "product-new-main");
                        setNewP({ ...newP, image: url });
                      }
                    }}
                  />
                )}
                <label
                  htmlFor="new-main-img"
                  style={{
                    background: "rgba(13,148,136,0.1)",
                    border: "1px dashed rgba(13,148,136,0.4)",
                    borderRadius: 8,
                    padding: "8px 16px",
                    color: teal,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }}
                >
                  <ImageIcon className="w-4 h-4" />
                  Choisir
                </label>
              </div>
            </div>

            {/* Basic fields */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: s.mut, display: "block", marginBottom: 4 }}>Nom *</label>
                <input
                  value={newP.name}
                  onChange={e => setNewP({ ...newP, name: e.target.value })}
                  style={{
                    width: "100%",
                    background: s.ibg,
                    border: "1px solid " + s.brd,
                    borderRadius: 8,
                    padding: "8px 10px",
                    color: s.tx,
                    fontSize: 13
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: s.mut, display: "block", marginBottom: 4 }}>Référence</label>
                <input
                  value={newP.reference}
                  onChange={e => setNewP({ ...newP, reference: e.target.value })}
                  style={{
                    width: "100%",
                    background: s.ibg,
                    border: "1px solid " + s.brd,
                    borderRadius: 8,
                    padding: "8px 10px",
                    color: s.tx,
                    fontSize: 13
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: s.mut, display: "block", marginBottom: 4 }}>Description</label>
              <textarea
                value={newP.description}
                onChange={e => setNewP({ ...newP, description: e.target.value })}
                rows={2}
                style={{
                  width: "100%",
                  background: s.ibg,
                  border: "1px solid " + s.brd,
                  borderRadius: 8,
                  padding: "8px 10px",
                  color: s.tx,
                  fontSize: 13
                }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: s.mut, display: "block", marginBottom: 4 }}>Prix (DA) *</label>
                <input
                  type="number"
                  value={newP.price || ""}
                  onChange={e => setNewP({ ...newP, price: parseFloat(e.target.value) || 0 })}
                  style={{
                    width: "100%",
                    background: s.ibg,
                    border: "1px solid " + s.brd,
                    borderRadius: 8,
                    padding: "8px 10px",
                    color: teal,
                    fontSize: 13
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: s.mut, display: "block", marginBottom: 4 }}>Prix original</label>
                <input
                  type="number"
                  value={newP.original_price || ""}
                  onChange={e => setNewP({ ...newP, original_price: parseFloat(e.target.value) || 0 })}
                  style={{
                    width: "100%",
                    background: s.ibg,
                    border: "1px solid " + s.brd,
                    borderRadius: 8,
                    padding: "8px 10px",
                    color: "#ef4444",
                    fontSize: 13
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: s.mut, display: "block", marginBottom: 4 }}>Promotion %</label>
                <input
                  type="number"
                  value={newP.discount_percent || ""}
                  onChange={e => setNewP({ ...newP, discount_percent: parseFloat(e.target.value) || 0 })}
                  style={{
                    width: "100%",
                    background: s.ibg,
                    border: "1px solid " + s.brd,
                    borderRadius: 8,
                    padding: "8px 10px",
                    color: "#f59e0b",
                    fontSize: 13
                  }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: s.mut, display: "block", marginBottom: 4 }}>Catégorie</label>
                <select
                  value={newP.category}
                  onChange={e => setNewP({ ...newP, category: e.target.value })}
                  style={{
                    width: "100%",
                    background: s.ibg,
                    border: "1px solid " + s.brd,
                    borderRadius: 8,
                    padding: "8px 10px",
                    color: s.tx,
                    fontSize: 13
                  }}
                >
                  {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: s.mut, display: "block", marginBottom: 4 }}>Ordre</label>
                <input
                  type="number"
                  value={newP.sort_order}
                  onChange={e => setNewP({ ...newP, sort_order: parseInt(e.target.value) || 1 })}
                  style={{
                    width: "100%",
                    background: s.ibg,
                    border: "1px solid " + s.brd,
                    borderRadius: 8,
                    padding: "8px 10px",
                    color: s.tx,
                    fontSize: 13
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={add}
                disabled={saving === -1}
                style={{
                  background: teal,
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 20px",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: saving === -1 ? "not-allowed" : "pointer",
                  opacity: saving === -1 ? 0.7 : 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }}
              >
                {saving === -1 ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {saving === -1 ? "Création..." : "Créer le produit"}
              </button>
              <button
                onClick={() => setAdding(false)}
                style={{
                  background: "transparent",
                  border: "1px solid " + s.brd,
                  borderRadius: 8,
                  padding: "10px 16px",
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
            padding: 16,
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
          Ajouter un nouveau produit
        </button>
      )}
    </div>
  );
}

// ── EMAIL SETTINGS ────────────────────────────────────────────────────────────
function EmailEd({ dark }: { dark: boolean }) {
  const s = ms(dark);
  const [settings, setSettings] = useState<EmailSettings | null>(null);
  const [email, setEmail] = useState("modtech.srv@gmail.com");
  const [key, setKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgOk, setMsgOk] = useState(true);

  useEffect(() => {
    supabase.from("email_settings").select("*").eq("id", 1).single()
      .then(({ data }) => {
        if (data) {
          setSettings(data);
          setEmail(data.notify_email || "modtech.srv@gmail.com");
          setKey(data.resend_key || "");
        }
      });
  }, []);

  const notify = (text: string, ok = true) => { setMsg(text); setMsgOk(ok); setTimeout(() => setMsg(""), 4000); };

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("email_settings").update({ notify_email: email, resend_key: key, updated_at: new Date().toISOString() }).eq("id", 1);
    setSaving(false);
    if (error) notify("❌ " + error.message, false);
    else notify(" Sauvegardé !");
  };

  const testEmail = async () => {
    if (!key) { notify("❌ Ajoutez la clé API Resend d'abord", false); return; }
    if (!email) { notify("❌ Ajoutez l'email de notification", false); return; }
    setTesting(true);
    try {
      const res = await fetch("/api/send-order-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order: {
            customer_name: "Client test",
            customer_phone: "0661234567",
            customer_address: "Alger",
            customer_email: "",
            notes: "Email de test",
            items: [{ name: "Caméra test", price: 15000, qty: 2 }],
            total: 30000
          }
        })
      });
      const data = await res.json();
      if (data.ok) notify(" Email test envoyé à " + email);
      else notify(" Échec: " + (data.result?.message || data.error || "Erreur"), false);
    } catch (e: any) {
      notify("❌ " + e.message, false);
    }
    setTesting(false);
  };

  const inp: React.CSSProperties = {
    width: "100%",
    background: s.ibg,
    border: "1px solid " + s.brd,
    borderRadius: 10,
    padding: "11px 14px",
    color: s.tx,
    fontSize: 14,
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box"
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{
        background: dark ? "rgba(13,148,136,0.06)" : "rgba(13,148,136,0.04)",
        border: "1px solid rgba(13,148,136,0.2)",
        borderRadius: 12,
        padding: "14px 18px",
        fontSize: 13,
        color: s.sub,
        lineHeight: 1.7,
        display: "flex",
        alignItems: "center",
        gap: 8
      }}>
        <Mail className="w-4 h-4" style={{ color: teal }} />
        <span>À chaque nouvelle commande — un email est automatiquement envoyé via Resend.</span>
      </div>

      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: s.mut, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8, fontFamily: "monospace" }}>
           Email de notification
        </label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="modtech.srv@gmail.com" style={inp} />
        <div style={{ fontSize: 11, color: s.sub, marginTop: 5 }}>Email qui reçoit les notifications de commande</div>
      </div>

      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: s.mut, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8, fontFamily: "monospace" }}>
           Resend API Key
        </label>
        <div style={{ position: "relative" }}>
          <input
            type={showKey ? "text" : "password"}
            value={key}
            onChange={e => setKey(e.target.value)}
            placeholder="re_xxxxxxxxxxxx"
            style={{ ...inp, paddingLeft: 44 }}
          />
          <button
            onClick={() => setShowKey(!showKey)}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: s.sub,
              fontSize: 16,
              padding: 0
            }}
          >
            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <div style={{ fontSize: 11, color: s.sub, marginTop: 5 }}>
          Gratuit sur <a href="https://resend.com/signup" target="_blank" rel="noreferrer" style={{ color: teal, textDecoration: "none" }}>resend.com</a>
        </div>
      </div>

      {key && (
        <div style={{
          background: dark ? "rgba(16,185,129,0.06)" : "rgba(16,185,129,0.04)",
          border: "1px solid rgba(16,185,129,0.2)",
          borderRadius: 10,
          padding: "10px 16px",
          fontSize: 13,
          color: "#10b981",
          display: "flex",
          alignItems: "center",
          gap: 8
        }}>
          <CheckCircle2 className="w-4 h-4" />
          Clé API présente
        </div>
      )}

      {msg && (
        <div style={{
          background: msgOk ? "rgba(52,211,153,0.1)" : "rgba(239,68,68,0.1)",
          border: "1px solid " + (msgOk ? "rgba(52,211,153,0.25)" : "rgba(239,68,68,0.25)"),
          borderRadius: 10,
          padding: "10px 16px",
          fontSize: 13,
          fontWeight: 600,
          color: msgOk ? "#34d399" : "#f87171"
        }}>
          {msg}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          onClick={save}
          disabled={saving}
          style={{
            background: tG,
            border: "none",
            borderRadius: 10,
            padding: "11px 24px",
            color: "#fff",
            fontSize: 14,
            fontWeight: 700,
            cursor: saving ? "not-allowed" : "pointer",
            opacity: saving ? 0.7 : 1,
            display: "flex",
            alignItems: "center",
            gap: 6
          }}
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Sauvegarde..." : "Sauvegarder"}
        </button>
        <button
          onClick={testEmail}
          disabled={testing || !key}
          style={{
            background: key ? "rgba(59,130,246,0.1)" : "rgba(51,65,85,0.3)",
            border: "1px solid " + (key ? "rgba(59,130,246,0.3)" : s.brd),
            borderRadius: 10,
            padding: "11px 20px",
            color: key ? "#60a5fa" : s.sub,
            fontSize: 14,
            fontWeight: 600,
            cursor: (testing || !key) ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6
          }}
        >
          {testing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
          {testing ? "Envoi..." : "Email test"}
        </button>
      </div>

      {settings && (
        <div style={{ fontSize: 11, color: s.sub }}>
          Dernière modification: {new Date(settings.updated_at).toLocaleString("fr-DZ")}
        </div>
      )}
    </div>
  );
}
///----updat password-----
function SecurityEd({ dark }: { dark: boolean }) {
  const s = ms(dark);
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgOk, setMsgOk] = useState(true);

  const notify = (text: string, ok = true) => {
    setMsg(text); setMsgOk(ok);
    setTimeout(() => setMsg(""), 4000);
  };

  const changePassword = async () => {
    if (!newPw || !confirmPw) { notify("❌ Remplissez tous les champs", false); return; }
    if (newPw.length < 6) { notify("❌ Mot de passe trop court (min 6)", false); return; }
    if (newPw !== confirmPw) { notify("❌ Les mots de passe ne correspondent pas", false); return; }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPw });
    setSaving(false);
    if (error) { notify("❌ " + error.message, false); }
    else { notify("✅ Mot de passe modifié !"); setNewPw(""); setConfirmPw(""); }
  };

  const inp: React.CSSProperties = {
    width: "100%", background: s.ibg, border: "1px solid " + s.brd,
    borderRadius: 10, padding: "11px 14px", color: s.tx,
    fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ background: dark ? "rgba(13,148,136,0.06)" : "rgba(13,148,136,0.04)", border: "1px solid rgba(13,148,136,0.2)", borderRadius: 12, padding: "14px 18px", fontSize: 13, color: s.sub, display: "flex", alignItems: "center", gap: 8 }}>
        <Shield className="w-4 h-4" style={{ color: teal }} />
        <span>Changer le mot de passe de votre compte admin.</span>
      </div>

      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: s.mut, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8, fontFamily: "monospace" }}>Nouveau mot de passe</label>
        <div style={{ position: "relative" }}>
          <input type={show ? "text" : "password"} value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="••••••••" style={{ ...inp, paddingRight: 80 }} />
          <button onClick={() => setShow(!show)} type="button" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "transparent", border: `1px solid ${s.brd}`, cursor: "pointer", color: s.sub, fontSize: 12, padding: "3px 10px", borderRadius: 999 }}>
            {show ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          </button>
        </div>
        {newPw && <div style={{ fontSize: 11, color: s.sub, marginTop: 4 }}>{newPw.length < 6 ? "❌ Trop court" : newPw.length < 10 ? "⚠️ Moyen" : "✅ Fort"}</div>}
      </div>

      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: s.mut, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8, fontFamily: "monospace" }}>Confirmer le mot de passe</label>
        <input type={show ? "text" : "password"} value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="••••••••" style={{ ...inp, borderColor: confirmPw ? (confirmPw === newPw ? "#10b981" : "#ef4444") : s.brd }} />
        {confirmPw && <div style={{ fontSize: 11, marginTop: 4, color: confirmPw === newPw ? "#10b981" : "#ef4444" }}>{confirmPw === newPw ? "✅ Identiques" : "❌ Ne correspondent pas"}</div>}
      </div>

      {msg && <div style={{ background: msgOk ? "rgba(52,211,153,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${msgOk ? "rgba(52,211,153,0.25)" : "rgba(239,68,68,0.25)"}`, borderRadius: 10, padding: "10px 16px", fontSize: 13, fontWeight: 600, color: msgOk ? "#34d399" : "#f87171" }}>{msg}</div>}

      <button onClick={changePassword} disabled={saving || !newPw || !confirmPw || newPw !== confirmPw || newPw.length < 6}
        style={{ background: (newPw && confirmPw && newPw === confirmPw && newPw.length >= 6) ? tG : "rgba(51,65,85,0.3)", border: "none", borderRadius: 10, padding: "12px 24px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 6, opacity: saving ? 0.7 : 1 }}>
        {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {saving ? "Modification..." : "Changer le mot de passe"}
      </button>
    </div>
  );
}
// ─── ALLOWED EMAILS — same list as login page ─────────────────────────────



function UsersEd({ dark }: { dark: boolean }) {
  const s = ms(dark);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgOk, setMsgOk] = useState(true);
  const [users, setUsers] = useState<{ id: number; email: string; created_at: string }[]>([]);
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = async () => {
    const { data } = await supabase.from("admin_users").select("*").order("created_at");
    setUsers(data ?? []);
  };

  useEffect(() => { load(); }, []);

  const notify = (text: string, ok = true) => {
    setMsg(text); setMsgOk(ok);
    setTimeout(() => setMsg(""), 5000);
  };

  const createUser = async () => {
    if (!email) { notify("❌ Email obligatoire", false); return; }
    if (!pw || pw.length < 6) { notify("❌ Mot de passe min 6 caractères", false); return; }

    setSaving(true);

    // 1 — إنشاء الحساب في Supabase Auth
    const { error: authError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password: pw,
    });

    if (authError && !authError.message.includes("already registered")) {
      notify("❌ " + authError.message, false);
      setSaving(false);
      return;
    }

    // 2 — إضافة في جدول admin_users تلقائياً
    const { error: dbError } = await supabase
      .from("admin_users")
      .insert([{ email: email.trim().toLowerCase() }]);

    setSaving(false);

    if (dbError) {
      if (dbError.message.includes("duplicate")) notify("⚠️ Cet email est déjà autorisé", false);
      else notify("❌ " + dbError.message, false);
    } else {
      notify(`✅ Compte créé et autorisé : ${email}`);
      setEmail(""); setPw("");
      load(); // refresh list
    }
  };

  const deleteUser = async (id: number, userEmail: string) => {
    if (!confirm(`Supprimer l'accès de ${userEmail} ?`)) return;
    setDeleting(id);
    await supabase.from("admin_users").delete().eq("id", id);
    setDeleting(null);
    load();
  };

  const inp: React.CSSProperties = {
    width: "100%", background: s.ibg, border: "1px solid " + s.brd,
    borderRadius: 10, padding: "11px 14px", color: s.tx,
    fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Info */}
      <div style={{ background: dark ? "rgba(13,148,136,0.06)" : "rgba(13,148,136,0.04)", border: "1px solid rgba(13,148,136,0.2)", borderRadius: 12, padding: "14px 18px", fontSize: 13, color: s.sub, lineHeight: 1.7 }}>
        <div style={{ color: teal, fontWeight: 700, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
          <Users className="w-4 h-4" /> Gestion des comptes admin
        </div>
        Les comptes créés ici sont automatiquement autorisés à accéder au panneau d'administration. Aucune modification manuelle du code nécessaire.
      </div>

      {/* Existing users */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: s.mut, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10, fontFamily: "monospace" }}>
          Comptes autorisés ({users.length})
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {users.map((u) => (
            <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 10, background: s.ci, border: "1px solid " + s.brd, borderRadius: 10, padding: "10px 14px" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: tG, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                {u.email[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: s.tx, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</div>
                <div style={{ fontSize: 11, color: s.sub }}>{new Date(u.created_at).toLocaleDateString("fr-DZ")}</div>
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#10b981", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 20, padding: "2px 8px", whiteSpace: "nowrap" }}>
                Autorisé ✓
              </div>
              <button
                onClick={() => deleteUser(u.id, u.email)}
                disabled={deleting === u.id}
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 7, padding: "5px 8px", color: "#f87171", cursor: "pointer", display: "flex", alignItems: "center", flexShrink: 0 }}
              >
                {deleting === u.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ borderTop: "1px solid " + s.brd }} />

      {/* Create form */}
      <div style={{ fontSize: 13, fontWeight: 700, color: s.tx }}>➕ Créer un nouveau compte</div>

      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: s.mut, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8, fontFamily: "monospace" }}>Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="nouveau@admin.dz" style={inp} />
      </div>

      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: s.mut, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8, fontFamily: "monospace" }}>Mot de passe</label>
        <div style={{ position: "relative" }}>
          <input type={show ? "text" : "password"} value={pw} onChange={e => setPw(e.target.value)} placeholder="••••••••" style={{ ...inp, paddingRight: 80 }} />
          <button onClick={() => setShow(!show)} type="button" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "transparent", border: `1px solid ${s.brd}`, cursor: "pointer", color: s.sub, fontSize: 12, padding: "3px 10px", borderRadius: 999 }}>
            {show ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          </button>
        </div>
        {pw && <div style={{ fontSize: 11, color: s.sub, marginTop: 4 }}>{pw.length < 6 ? "❌ Trop court" : pw.length < 10 ? "⚠️ Moyen" : "✅ Fort"}</div>}
      </div>

      {msg && (
        <div style={{ background: msgOk ? "rgba(52,211,153,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${msgOk ? "rgba(52,211,153,0.25)" : "rgba(239,68,68,0.25)"}`, borderRadius: 10, padding: "10px 16px", fontSize: 13, fontWeight: 600, color: msgOk ? "#34d399" : "#f87171", lineHeight: 1.6 }}>
          {msg}
        </div>
      )}

      <button onClick={createUser} disabled={saving || !email || pw.length < 6}
        style={{ background: (email && pw.length >= 6) ? tG : "rgba(51,65,85,0.3)", border: "none", borderRadius: 10, padding: "12px 24px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: (saving || !email || pw.length < 6) ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 6, opacity: saving ? 0.7 : 1 }}>
        {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        {saving ? "Création..." : "Créer et autoriser"}
      </button>
    </div>
  );
}
// ── LINKS ED — أضف هذه الدالة في admin/page.tsx قبل const NAV ──────────────

function LinksEd({ dark }: { dark: boolean }) {
  const s = ms(dark);
  const [links, setLinks] = useState<any[]>([]);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState<number | null>(null);
  const [newLink, setNewLink] = useState({ title: "", url: "", icon: "🔗", sort_order: 1 });

  const load = async () => {
    const { data } = await supabase.from("contact_links").select("*").order("sort_order");
    setLinks(data ?? []);
  };

  useEffect(() => { load(); }, []);

  const updateField = async (id: number, field: string, value: any) => {
    setSaving(id);
    await supabase.from("contact_links").update({ [field]: value }).eq("id", id);
    setSaving(null);
    load();
  };

  const toggleActive = async (link: any) => {
    await supabase.from("contact_links").update({ is_active: !link.is_active }).eq("id", link.id);
    load();
  };

  const deleteLink = async (id: number) => {
    if (!confirm("Supprimer ce lien ?")) return;
    await supabase.from("contact_links").delete().eq("id", id);
    load();
  };

  const addLink = async () => {
    if (!newLink.title || !newLink.url) { alert("Titre et URL obligatoires"); return; }
    setSaving(-1);
    await supabase.from("contact_links").insert([{ ...newLink, is_active: true }]);
    setNewLink({ title: "", url: "", icon: "🔗", sort_order: links.length + 2 });
    setAdding(false);
    setSaving(null);
    load();
  };

  const inp: React.CSSProperties = {
    background: s.ibg, border: "1px solid " + s.brd, borderRadius: 9,
    padding: "9px 12px", color: s.tx, fontSize: 13, outline: "none",
    fontFamily: "inherit", width: "100%", boxSizing: "border-box",
  };

  const PAGE_URL = "https://mod-technologie.com/contact";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Info + QR link */}
      <div style={{
        background: dark ? "rgba(13,148,136,0.06)" : "rgba(13,148,136,0.04)",
        border: "1px solid rgba(13,148,136,0.2)",
        borderRadius: 12, padding: "14px 18px",
        fontSize: 13, color: s.sub, lineHeight: 1.7,
      }}>
        <div style={{ color: teal, fontWeight: 700, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
          🔗 Page Contact — Liens publics
        </div>
        <div>
          Page publique :{" "}
          <a href={PAGE_URL} target="_blank" rel="noreferrer"
            style={{ color: teal, textDecoration: "underline", fontWeight: 600 }}>
            {PAGE_URL}
          </a>
        </div>
        <div style={{ marginTop: 6, fontSize: 12 }}>
          👉 Mettez ce lien dans votre QR code — il pointe vers votre page de contact.
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ background: `${teal}12`, border: `1px solid ${teal}30`, borderRadius: 10, padding: "8px 16px", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: teal }}>{links.length}</span>
          <span style={{ fontSize: 12, color: s.sub }}>Total</span>
        </div>
        <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: 10, padding: "8px 16px", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: "#10b981" }}>{links.filter(x => x.is_active).length}</span>
          <span style={{ fontSize: 12, color: s.sub }}>Actifs</span>
        </div>
      </div>

      {/* Links list */}
      {links.map(link => (
        <motion.div
          key={link.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: s.card, border: "1px solid " + (link.is_active ? s.brd : "rgba(239,68,68,0.25)"),
            borderRadius: 14, padding: 16, opacity: link.is_active ? 1 : 0.55,
            boxShadow: dark ? "none" : "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {/* Icon */}
            <div style={{ width: 44, height: 44, borderRadius: 12, background: dark ? "rgba(255,255,255,0.05)" : "#f8fafc", border: "1px solid " + s.brd, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
              {link.icon}
            </div>

            {/* Fields */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
              <div style={{ display: "flex", gap: 8 }}>
                {/* Emoji */}
                <input
                  defaultValue={link.icon}
                  onBlur={e => updateField(link.id, "icon", e.target.value)}
                  style={{ ...inp, width: 60, textAlign: "center", fontSize: 18 }}
                  placeholder="🔗"
                />
                {/* Title */}
                <input
                  defaultValue={link.title}
                  onBlur={e => updateField(link.id, "title", e.target.value)}
                  style={{ ...inp, fontWeight: 600 }}
                  placeholder="Titre"
                />
              </div>
              {/* URL */}
              <input
                defaultValue={link.url}
                onBlur={e => updateField(link.id, "url", e.target.value)}
                style={{ ...inp, color: s.sub, fontSize: 12 }}
                placeholder="https://..."
              />

              {/* Controls */}
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <input
                  type="number"
                  defaultValue={link.sort_order}
                  onBlur={e => updateField(link.id, "sort_order", parseInt(e.target.value) || 0)}
                  style={{ ...inp, width: 55, textAlign: "center", color: teal, fontSize: 12 }}
                />
                <div style={{ flex: 1 }} />
                {saving === link.id && <RefreshCw className="w-3 h-3 animate-spin" style={{ color: teal }} />}
                <button
                  onClick={() => toggleActive(link)}
                  style={{
                    background: link.is_active ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.08)",
                    border: "1px solid " + (link.is_active ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.2)"),
                    borderRadius: 7, padding: "4px 10px",
                    color: link.is_active ? "#10b981" : "#f87171",
                    fontSize: 11, fontWeight: 700, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 3,
                  }}
                >
                  {link.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  {link.is_active ? "Actif" : "Inactif"}
                </button>
                <button
                  onClick={() => deleteLink(link.id)}
                  style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 7, padding: "4px 8px", color: "#f87171", cursor: "pointer", display: "flex", alignItems: "center" }}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ))}

      {/* Add form */}
      {adding ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: s.card, border: `2px dashed rgba(13,148,136,0.4)`, borderRadius: 16, padding: 20 }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: teal, marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
            <Plus className="w-4 h-4" /> Nouveau lien
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={newLink.icon}
                onChange={e => setNewLink(n => ({ ...n, icon: e.target.value }))}
                style={{ ...inp, width: 60, textAlign: "center", fontSize: 18 }}
                placeholder="🔗"
              />
              <input
                value={newLink.title}
                onChange={e => setNewLink(n => ({ ...n, title: e.target.value }))}
                placeholder="Titre *"
                style={{ ...inp, fontWeight: 600 }}
              />
            </div>
            <input
              value={newLink.url}
              onChange={e => setNewLink(n => ({ ...n, url: e.target.value }))}
              placeholder="https://... *"
              style={{ ...inp, fontSize: 12 }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={addLink}
                disabled={saving === -1}
                style={{ background: tG, border: "none", borderRadius: 10, padding: "10px 22px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
              >
                {saving === -1 ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Ajouter
              </button>
              <button
                onClick={() => setAdding(false)}
                style={{ background: "transparent", border: "1px solid " + s.brd, borderRadius: 10, padding: "10px 14px", color: s.sub, fontSize: 13, cursor: "pointer" }}
              >
                Annuler
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          style={{ border: `2px dashed rgba(13,148,136,0.3)`, background: "transparent", color: teal, borderRadius: 14, padding: 14, cursor: "pointer", fontSize: 13.5, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        >
          <Plus className="w-4 h-4" /> Ajouter un lien
        </button>
      )}
    </div>
  );
}
// ── NAV ───────────────────────────────────────────────────────────────────────
const NAV = [
{ key: "links", label: "Liens Contact", icon: <ExternalLink className="w-5 h-5" />, desc: "Page QR code" },
  { key: "users", label: "Utilisateurs", icon: <Users className="w-5 h-5" />, desc: "Comptes admin" },
  { key: "hero", label: "Hero - Accueil", icon: <Home className="w-5 h-5" />, desc: "Page d'accueil" },
  { key: "store-hero", label: "Hero - Store", icon: <Store className="w-5 h-5" />, desc: "Page du catalogue" },
  { key: "services", label: "Services", icon: <Layers className="w-5 h-5" />, desc: "Cartes + photos" },
  { key: "about", label: "À propos", icon: <Award className="w-5 h-5" />, desc: "Stats & description" },
  { key: "contact", label: "Contact", icon: <Phone className="w-5 h-5" />, desc: "Tél, email, réseaux" },
  { key: "slider", label: "Slider", icon: <ImageIcon className="w-5 h-5" />, desc: "Images du carrousel" },
  { key: "partners", label: "Partenaires", icon: <Users className="w-5 h-5" />, desc: "Logos des clients" },
  { key: "products", label: "Produits", icon: <ShoppingBag className="w-5 h-5" />, desc: "Catalogue du store" },
  { key: "reussites", label: "Nos Réussites", icon: <Star className="w-5 h-5" />, desc: "Portfolio photos" },
  { key: "orders", label: "Commandes", icon: <ShoppingBag className="w-5 h-5" />, desc: "Gestion des commandes" },
  { key: "emails", label: "Emails", icon: <Mail className="w-5 h-5" />, desc: "Notifications email" },
  { key: "security", label: "Sécurité", icon: <Shield className="w-5 h-5" />, desc: "Mot de passe" },
];

const autoSave = ["slider", "partners", "products", "orders", "emails", "security", "users","links"];

// ── MAIN ──────────────────────────────────────────────────────────────────────
// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [active, setActive] = useState("hero");
  const [drafts, setDrafts] = useState<Record<string, any>>({});
  const [status, setStatus] = useState<Status>("loading");
  const [msg, setMsg] = useState("");
  const [mok, setMok] = useState(true);
  const [dark, setDark] = useState(false);
  const [open, setOpen] = useState(true);
  const [connOk, setConnOk] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [authChecked, setAuthChecked] = useState(false);

  // ← كل useCallback هنا قبل أي return
  const loadSlides = useCallback(async () => {
    const { data } = await supabase.from("slider_slides").select("*").order("sort_order");
    setSlides(data ?? []);
  }, []);

  const loadPartners = useCallback(async () => {
    const { data } = await supabase.from("partners").select("*").order("sort_order");
    setPartners(data ?? []);
  }, []);

  const load = useCallback(async () => {
    setStatus("loading");
    const { data, error } = await supabase.from("site_content").select("*").order("id");
    if (error) { setStatus("error"); setConnOk(false); return; }
    setConnOk(true);
    setRows(data ?? []);
    const d: Record<string, any> = {};
    (data ?? []).forEach((r: Row) => { d[r.section] = JSON.parse(JSON.stringify(r.content)); });
    setDrafts(d);
    await loadSlides();
    await loadPartners();
    setStatus("idle");
  }, [loadSlides, loadPartners]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.push("/login");
      } else {
        setUserEmail(data.session.user.email ?? "");
        setAuthChecked(true);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.push("/login");
    });
    const t = localStorage.getItem("mt_theme");
    if (t) setDark(t === "dark");
    else setDark(false);
    return () => listener.subscription.unsubscribe();
  }, [router]);

  useEffect(() => { load(); }, [load]);

  // ← الآن فقط return بعد كل الـ hooks
  if (!authChecked) return (
    <div style={{
      height: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: dark ? "#0f172a" : "#f8fafc",
      flexDirection: "column", gap: 16, fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: "linear-gradient(135deg,#0d9488,#0f766e)",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22
      }}></div>
      <div style={{ color: "#0d9488", fontSize: 14, fontWeight: 600 }}>
        Vérification en cours...
      </div>
    </div>
  );

  const s = ms(dark);

  const notify = (text: string, ok = true) => { setMsg(text); setMok(ok); setTimeout(() => setMsg(""), 3500); };
  
  const save = async () => {
    setStatus("saving");
    const { error } = await supabase.from("site_content").update({ content: drafts[active], updated_at: new Date().toISOString() }).eq("section", active);
    if (error) notify("❌ " + error.message, false);
    else { notify(" Sauvegardé !"); await load(); }
    setStatus("idle");
  };
  
  const logout = async () => { await supabase.auth.signOut(); router.push("/login"); };
  const togTheme = () => { const nd = !dark; setDark(nd); localStorage.setItem("mt_theme", nd ? "dark" : "light"); };

  const isAuto = autoSave.includes(active);
  const aRow = rows.find(r => r.section === active);
  const dirty = !isAuto && JSON.stringify(drafts[active]) !== JSON.stringify(aRow?.content);
  const nDirty = NAV.filter(n => !autoSave.includes(n.key) && JSON.stringify(drafts[n.key]) !== JSON.stringify(rows.find(r => r.section === n.key)?.content)).length;
  
  const setD = (v: any) => setDrafts(d => ({ ...d, [active]: v }));
  const reset = () => setDrafts(d => ({ ...d, [active]: JSON.parse(JSON.stringify(aRow?.content)) }));
  const activeNav = NAV.find(n => n.key === active);

  return (
    <div style={{
      minHeight: "100vh",
      background: s.bg,
      color: s.tx,
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      transition: "background 0.3s, color 0.3s"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        input:focus, textarea:focus, select:focus {
          border-color: ${teal} !important;
          box-shadow: 0 0 0 3px ${teal}20 !important;
          outline: none;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        ::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        
        ::-webkit-scrollbar-track {
          background: ${dark ? '#1f2937' : '#f1f5f9'};
        }
        
        ::-webkit-scrollbar-thumb {
          background: ${dark ? '#4b5563' : '#cbd5e1'};
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: ${dark ? '#6b7280' : '#94a3b8'};
        }
      `}</style>

      {/* Topbar */}
      <div style={{
        background: s.top,
        borderBottom: "1px solid " + s.brd,
        height: 62,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        position: "sticky",
        top: 0,
        zIndex: 100,
        backdropFilter: "blur(12px)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button
            onClick={() => setOpen(!open)}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: s.sub,
              fontSize: 20,
              padding: 4,
              display: "flex",
              alignItems: "center"
            }}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            background: tG,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 17
          }}>
            
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15 }}>MOD-TECH Admin</div>
            <div style={{ fontSize: 11, color: s.sub }}>Panneau d'administration</div>
          </div>
          {nDirty > 0 && (
            <div style={{
              background: "rgba(245,158,11,0.15)",
              border: "1px solid rgba(245,158,11,0.3)",
              borderRadius: 20,
              padding: "3px 10px",
              fontSize: 12,
              color: "#f59e0b",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 4
            }}>
              <span>{nDirty} modif.</span>
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {msg && (
            <div style={{
              fontSize: 13,
              fontWeight: 600,
              padding: "7px 16px",
              borderRadius: 9,
              background: mok ? "rgba(52,211,153,0.12)" : "rgba(239,68,68,0.12)",
              color: mok ? "#34d399" : "#f87171",
              border: "1px solid " + (mok ? "rgba(52,211,153,0.25)" : "rgba(239,68,68,0.25)"),
              display: "flex",
              alignItems: "center",
              gap: 4
            }}>
              {msg}
            </div>
          )}
          
          {userEmail && (
            <div style={{
              fontSize: 12,
              color: s.sub,
              background: s.ci,
              border: "1px solid " + s.brd,
              borderRadius: 8,
              padding: "5px 12px",
              maxWidth: 180,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              gap: 6
            }}>
              <Users className="w-3 h-3" />
              {userEmail}
            </div>
          )}
          
          <button
            onClick={togTheme}
            style={{
              background: dark ? "rgba(51,65,85,0.4)" : "rgba(226,232,240,0.8)",
              border: "1px solid " + s.brd,
              borderRadius: 9,
              padding: "7px 12px",
              cursor: "pointer",
              color: s.tx,
              fontSize: 17,
              display: "flex",
              alignItems: "center"
            }}
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          
          <button
            onClick={logout}
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: 9,
              padding: "7px 14px",
              cursor: "pointer",
              color: "#f87171",
              fontSize: 13,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 6
            }}
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div style={{ display: "flex", minHeight: "calc(100vh - 62px)" }}>
        {/* Sidebar */}
        <div style={{
          width: open ? 252 : 0,
          overflow: "hidden",
          transition: "width 0.25s",
          background: s.sb,
          borderRight: "1px solid " + s.brd,
          display: "flex",
          flexDirection: "column",
          flexShrink: 0
        }}>
          <div style={{
            padding: "16px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 3,
            flex: 1,
            overflowY: "auto"
          }}>
            <div style={{
              fontSize: 10,
              fontWeight: 700,
              color: s.sub,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              marginBottom: 6,
              paddingLeft: 4
            }}>
              Sections
            </div>
            
            {NAV.map(({ key, label, icon, desc }) => {
              const row = rows.find(r => r.section === key);
              const d = !autoSave.includes(key) && JSON.stringify(drafts[key]) !== JSON.stringify(row?.content);
              return (
                <button
                  key={key}
                  onClick={() => setActive(key)}
                  style={s.sbtn(active === key)}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 17, display: "flex", alignItems: "center" }}>{icon}</span>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontWeight: active === key ? 700 : 500, whiteSpace: "nowrap" }}>{label}</div>
                      <div style={{ fontSize: 10, color: s.sub, whiteSpace: "nowrap" }}>{desc}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    {d && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#f59e0b", flexShrink: 0 }} />}
                    {key === "slider" && (
                      <span style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: teal,
                        background: "rgba(13,148,136,0.1)",
                        borderRadius: 10,
                        padding: "1px 7px"
                      }}>
                        {slides.filter(x => x.is_active).length}
                      </span>
                    )}
                    {key === "partners" && (
                      <span style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#8b5cf6",
                        background: "rgba(139,92,246,0.1)",
                        borderRadius: 10,
                        padding: "1px 7px"
                      }}>
                        {partners.filter(x => x.is_active).length}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Connection status */}
          <div style={{
            margin: "0 12px 16px",
            padding: 12,
            background: dark ? "rgba(13,148,136,0.06)" : "rgba(13,148,136,0.04)",
            border: "1px solid rgba(13,148,136,0.15)",
            borderRadius: 12
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <div style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: connOk === null ? "#f59e0b" : connOk ? "#10b981" : "#ef4444",
                boxShadow: connOk ? "0 0 6px #10b981" : "none"
              }} />
              <span style={{
                fontSize: 12,
                fontWeight: 600,
                color: connOk === null ? s.sub : connOk ? "#10b981" : "#ef4444"
              }}>
                {connOk === null ? "..." : connOk ? "Connecté ✓" : "Erreur ✗"}
              </span>
            </div>
            {connOk && (
              <button
                onClick={load}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(13,148,136,0.3)",
                  borderRadius: 6,
                  padding: "4px 10px",
                  color: teal,
                  fontSize: 11,
                  cursor: "pointer",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 4
                }}
              >
                <RefreshCw className="w-3 h-3" />
                Rafraîchir
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: 28 }}>
          {status === "loading" ? (
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 300,
              flexDirection: "column",
              gap: 16,
              color: s.sub
            }}>
              <RefreshCw className="w-8 h-8 animate-spin" style={{ color: teal }} />
              <span>Chargement...</span>
            </div>
          ) : status === "error" ? (
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 300,
              flexDirection: "column",
              gap: 16
            }}>
              <div style={{ fontSize: 48 }}>❌</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#f87171" }}>Erreur de connexion</div>
              <button
                onClick={load}
                style={{
                  background: tG,
                  border: "none",
                  borderRadius: 10,
                  padding: "10px 24px",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  marginTop: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }}
              >
                <RefreshCw className="w-4 h-4" />
                Réessayer
              </button>
            </div>
          ) : (
            <div style={{ maxWidth: 900, margin: "0 auto" }}>
              {/* Section header */}
              <div style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: 24,
                paddingBottom: 18,
                borderBottom: "1px solid " + s.brd
              }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span style={{ fontSize: 24, display: "flex", alignItems: "center" }}>{activeNav?.icon}</span>
                    <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{activeNav?.label}</h1>
                    {dirty && (
                      <span style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#f59e0b",
                        background: "rgba(245,158,11,0.12)",
                        border: "1px solid rgba(245,158,11,0.25)",
                        borderRadius: 20,
                        padding: "2px 10px"
                      }}>
                        Non sauvegardé
                      </span>
                    )}
                    {isAuto && (
                      <span style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: teal,
                        background: "rgba(13,148,136,0.1)",
                        border: "1px solid rgba(13,148,136,0.25)",
                        borderRadius: 20,
                        padding: "2px 10px",
                        display: "flex",
                        alignItems: "center",
                        gap: 4
                      }}>
                        <Save className="w-3 h-3" />
                        Auto-save
                      </span>
                    )}
                  </div>
                  {aRow && !isAuto && (
                    <div style={{ fontSize: 12, color: s.sub }}>
                      Modifié : {new Date(aRow.updated_at).toLocaleString("fr-DZ")}
                    </div>
                  )}
                </div>

                {!isAuto && (
                  <div style={{ display: "flex", gap: 8 }}>
                    {dirty && (
                      <button
                        onClick={reset}
                        style={{
                          background: "transparent",
                          border: "1px solid " + s.brd,
                          color: s.sub,
                          borderRadius: 9,
                          padding: "9px 16px",
                          cursor: "pointer",
                          fontSize: 13,
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          gap: 4
                        }}
                      >
                        <X className="w-4 h-4" />
                        Annuler
                      </button>
                    )}
                    <button
                      onClick={save}
                      disabled={!dirty || status === "saving"}
                      style={{
                        background: dirty ? tG : "rgba(51,65,85,0.3)",
                        border: "none",
                        borderRadius: 9,
                        padding: "9px 22px",
                        color: dirty ? "#fff" : s.sub,
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: dirty ? "pointer" : "not-allowed",
                        display: "flex",
                        alignItems: "center",
                        gap: 6
                      }}
                    >
                      {status === "saving" ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {status === "saving" ? "Sauvegarde..." : "Sauvegarder"}
                    </button>
                  </div>
                )}
              </div>

              {/* Section content */}
              <div style={{
                background: isAuto ? "transparent" : s.card,
                border: isAuto ? "none" : "1px solid " + s.brd,
                borderRadius: 16,
                padding: isAuto ? 0 : 26
              }}>
                {active === "users" && <UsersEd dark={dark} />}
                {active === "links" && <LinksEd dark={dark} />}
                {active === "security" && <SecurityEd dark={dark} />}
                {active === "hero" && drafts.hero && <HomeHeroEd data={drafts.hero} onChange={setD} dark={dark} />}
                {active === "store-hero" && drafts["store-hero"] && <StoreHeroEd data={drafts["store-hero"]} onChange={setD} dark={dark} />}
                {active === "services" && drafts.services && <ServicesEd data={drafts.services} onChange={setD} dark={dark} />}
                {active === "about" && drafts.about && <AboutEd data={drafts.about} onChange={setD} dark={dark} />}
                {active === "contact" && drafts.contact && <ContactEd data={drafts.contact} onChange={setD} dark={dark} />}
                {active === "slider" && <SliderEd slides={slides} onReload={loadSlides} dark={dark} />}
                {active === "partners" && <PartnersEd partners={partners} onReload={loadPartners} dark={dark} />}
                {active === "products" && <ProductsEd dark={dark} />}
                {active === "orders" && <OrdersEd dark={dark} />}
                {active === "emails" && <EmailEd dark={dark} />}
                {active === "reussites" && <ReussitesEd dark={dark} />}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function setError(arg0: string) {
  throw new Error("Function not implemented.");
}
function setLoading(arg0: boolean) {
  throw new Error("Function not implemented.");
}

