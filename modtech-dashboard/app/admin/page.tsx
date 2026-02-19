"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://djiosqlexflaqzrtuyqc.supabase.co",
  "sb_publishable_JMN6dsJOA2lUpSLYQcKD8A_3xBlz3bV"
);

type Row = { id: number; section: string; content: any; updated_at: string };
type Status = "idle" | "loading" | "saving" | "error";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("fr-DZ", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function makeStyles(dark: boolean) {
  return {
    bg: dark ? "#0a0f1a" : "#f1f5f9",
    sidebar: dark ? "rgba(15,23,42,0.95)" : "#ffffff",
    card: dark ? "rgba(15,23,42,0.8)" : "#ffffff",
    cardInner: dark ? "rgba(20,30,50,0.6)" : "#f8fafc",
    text: dark ? "#e2e8f0" : "#1e293b",
    sub: dark ? "#64748b" : "#94a3b8",
    border: dark ? "rgba(51,65,85,0.6)" : "#e2e8f0",
    inputBg: dark ? "rgba(10,15,26,0.8)" : "#ffffff",
    topbar: dark ? "rgba(15,23,42,0.98)" : "rgba(255,255,255,0.98)",
    mutedText: dark ? "#94a3b8" : "#64748b",
    sectionBtn: (active: boolean) => ({
      background: active ? (dark ? "rgba(13,148,136,0.15)" : "rgba(13,148,136,0.08)") : "transparent",
      border: active ? "1px solid rgba(13,148,136,0.4)" : "1px solid transparent",
      borderRadius: 10, padding: "11px 14px", textAlign: "left" as const,
      color: active ? "#0d9488" : (dark ? "#94a3b8" : "#64748b"),
      cursor: "pointer", fontSize: 13.5, fontWeight: active ? 700 : 500,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      transition: "all 0.15s", width: "100%",
    }),
  };
}

const teal = "#0d9488";
const tealGrad = "linear-gradient(135deg, #0d9488, #0f766e)";

function Field({ label, value, onChange, multiline, dark }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean; dark: boolean }) {
  const s = makeStyles(dark);
  const base: React.CSSProperties = { background: s.inputBg, border: "1px solid " + s.border, borderRadius: 8, padding: "10px 13px", color: s.text, fontSize: 14, width: "100%", outline: "none", fontFamily: "inherit", boxSizing: "border-box", transition: "border-color 0.2s" };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 12, alignItems: "start" }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: s.mutedText, textTransform: "uppercase", letterSpacing: "0.08em", paddingTop: 12, fontFamily: "monospace" }}>{label}</label>
      {multiline ? <textarea rows={3} value={value} onChange={e => onChange(e.target.value)} style={{ ...base, resize: "vertical" }} /> : <input value={value} onChange={e => onChange(e.target.value)} style={base} />}
    </div>
  );
}

function ImageUpload({ label, currentUrl, bucket, path, onUploaded, dark }: { label: string; currentUrl: string; bucket: string; path: string; onUploaded: (url: string) => void; dark: boolean }) {
  const s = makeStyles(dark);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentUrl);
  const ref = useRef<HTMLInputElement>(null);
  const upload = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const filePath = path + "-" + Date.now() + "." + ext;
    const { error } = await supabase.storage.from(bucket).upload(filePath, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      setPreview(data.publicUrl);
      onUploaded(data.publicUrl);
    }
    setUploading(false);
  };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 12, alignItems: "start" }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: s.mutedText, textTransform: "uppercase", letterSpacing: "0.08em", paddingTop: 12, fontFamily: "monospace" }}>{label}</label>
      <div>
        {preview && <div style={{ marginBottom: 10, borderRadius: 10, overflow: "hidden", border: "1px solid " + s.border, maxHeight: 120 }}><img src={preview} alt={label} style={{ width: "100%", height: 120, objectFit: "cover", display: "block" }} /></div>}
        <input ref={ref} type="file" accept="image/*" style={{ display: "none" }} onChange={e => e.target.files?.[0] && upload(e.target.files[0])} />
        <button onClick={() => ref.current?.click()} disabled={uploading} style={{ background: "rgba(13,148,136,0.1)", border: "1px dashed rgba(13,148,136,0.4)", borderRadius: 8, padding: "9px 18px", color: teal, fontSize: 13, fontWeight: 600, cursor: uploading ? "not-allowed" : "pointer" }}>
          {uploading ? "⏳ Upload..." : "📁 Choisir une image"}
        </button>
        {preview && <div style={{ fontSize: 11, color: s.sub, marginTop: 6, wordBreak: "break-all" }}>{preview.split("/").pop()}</div>}
      </div>
    </div>
  );
}

function HeroEditor({ data, onChange, dark }: { data: any; onChange: (d: any) => void; dark: boolean }) {
  const f = (k: string, v: string) => onChange({ ...data, [k]: v });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Field label="Titre" value={data.title ?? ""} onChange={v => f("title", v)} dark={dark} />
      <Field label="Highlight" value={data.titleHighlight ?? ""} onChange={v => f("titleHighlight", v)} dark={dark} />
      <Field label="Sous-titre" value={data.subtitle ?? ""} onChange={v => f("subtitle", v)} multiline dark={dark} />
      <Field label="Badge" value={data.badge ?? ""} onChange={v => f("badge", v)} dark={dark} />
      <Field label="Btn Principal" value={data.btnPrimary ?? ""} onChange={v => f("btnPrimary", v)} dark={dark} />
      <Field label="Btn Secondaire" value={data.btnSecondary ?? ""} onChange={v => f("btnSecondary", v)} dark={dark} />
      <ImageUpload label="Image Hero" currentUrl={data.bgImage ?? ""} bucket="site-images" path="hero-bg" onUploaded={v => f("bgImage", v)} dark={dark} />
      <ImageUpload label="Logo" currentUrl={data.logoUrl ?? ""} bucket="site-images" path="logo" onUploaded={v => f("logoUrl", v)} dark={dark} />
    </div>
  );
}

function ServicesEditor({ data, onChange, dark }: { data: any[]; onChange: (d: any[]) => void; dark: boolean }) {
  const s = makeStyles(dark);
  const update = (idx: number, field: string, val: string) => onChange(data.map((item, i) => i === idx ? { ...item, [field]: val } : item));
  const remove = (idx: number) => onChange(data.filter((_, i) => i !== idx));
  const add = () => onChange([...data, { id: Date.now(), title: "Nouveau service", description: "", icon: "⚙️" }]);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {data.map((svc, idx) => (
        <div key={svc.id} style={{ background: s.cardInner, border: "1px solid " + s.border, borderRadius: 14, padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 24 }}>{svc.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: teal, textTransform: "uppercase", letterSpacing: "0.1em" }}>Service {idx + 1}</span>
            </div>
            <button onClick={() => remove(idx)} style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", borderRadius: 7, padding: "4px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>✕ Supprimer</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Field label="Icône" value={svc.icon} onChange={v => update(idx, "icon", v)} dark={dark} />
            <Field label="Titre" value={svc.title} onChange={v => update(idx, "title", v)} dark={dark} />
            <Field label="Description" value={svc.description} onChange={v => update(idx, "description", v)} multiline dark={dark} />
          </div>
        </div>
      ))}
      <button onClick={add} style={{ border: "2px dashed rgba(13,148,136,0.3)", background: "transparent", color: teal, borderRadius: 12, padding: "14px", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>+ Ajouter un service</button>
    </div>
  );
}

function AboutEditor({ data, onChange, dark }: { data: any; onChange: (d: any) => void; dark: boolean }) {
  const s = makeStyles(dark);
  const f = (k: string, v: string) => onChange({ ...data, [k]: v });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Field label="Titre" value={data.title ?? ""} onChange={v => f("title", v)} dark={dark} />
      <Field label="Description" value={data.description ?? ""} onChange={v => f("description", v)} multiline dark={dark} />
      <Field label="Mission" value={data.mission ?? ""} onChange={v => f("mission", v)} multiline dark={dark} />
      <div style={{ borderTop: "1px solid " + s.border, paddingTop: 16, marginTop: 4 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: s.mutedText, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Statistiques</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {[["years", "Années"], ["clients", "Clients"], ["projects", "Projets"]].map(([key, lbl]) => (
            <div key={key} style={{ background: s.cardInner, border: "1px solid " + s.border, borderRadius: 12, padding: 14, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: s.sub, marginBottom: 8, fontWeight: 600 }}>{lbl}</div>
              <input value={data[key] ?? ""} onChange={e => f(key, e.target.value)} style={{ background: "transparent", border: "none", borderBottom: "1px solid " + s.border, width: "80px", textAlign: "center", color: teal, fontSize: 20, fontWeight: 800, outline: "none", fontFamily: "inherit" }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ContactEditor({ data, onChange, dark }: { data: any; onChange: (d: any) => void; dark: boolean }) {
  const f = (k: string, v: string) => onChange({ ...data, [k]: v });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Field label="Téléphone 1" value={data.phone1 ?? ""} onChange={v => f("phone1", v)} dark={dark} />
      <Field label="Téléphone 2" value={data.phone2 ?? ""} onChange={v => f("phone2", v)} dark={dark} />
      <Field label="Email" value={data.email ?? ""} onChange={v => f("email", v)} dark={dark} />
      <Field label="Adresse" value={data.address ?? ""} onChange={v => f("address", v)} dark={dark} />
      <Field label="WhatsApp" value={data.whatsapp ?? ""} onChange={v => f("whatsapp", v)} dark={dark} />
    </div>
  );
}

const NAV = [
  { key: "hero",     label: "Hero",     icon: "🏠", desc: "Titre, boutons, images" },
  { key: "services", label: "Services", icon: "🛠", desc: "Cartes de services" },
  { key: "about",    label: "À propos", icon: "ℹ️",  desc: "Stats & description" },
  { key: "contact",  label: "Contact",  icon: "📞", desc: "Téléphones & email" },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [rows, setRows]         = useState<Row[]>([]);
  const [active, setActive]     = useState("hero");
  const [drafts, setDrafts]     = useState<Record<string, any>>({});
  const [status, setStatus]     = useState<Status>("loading");
  const [msg, setMsg]           = useState("");
  const [msgType, setMsgType]   = useState<"ok"|"err">("ok");
  const [dark, setDark]         = useState(true);
  const [sideOpen, setSideOpen] = useState(true);

  useEffect(() => {
    if (localStorage.getItem("mt_auth") !== "1") router.push("/login");
    const t = localStorage.getItem("mt_theme");
    if (t) setDark(t === "dark");
  }, [router]);

  const s = makeStyles(dark);

  const loadData = useCallback(async () => {
    setStatus("loading");
    const { data, error } = await supabase.from("site_content").select("*").order("id");
    if (error) { setStatus("error"); return; }
    setRows(data ?? []);
    const d: Record<string, any> = {};
    (data ?? []).forEach((r: Row) => { d[r.section] = JSON.parse(JSON.stringify(r.content)); });
    setDrafts(d);
    setStatus("idle");
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const notify = (text: string, type: "ok"|"err" = "ok") => {
    setMsg(text); setMsgType(type);
    setTimeout(() => setMsg(""), 3500);
  };

  const save = async () => {
    setStatus("saving");
    const { error } = await supabase.from("site_content").update({ content: drafts[active], updated_at: new Date().toISOString() }).eq("section", active);
    if (error) notify("❌ " + error.message, "err");
    else { notify("✅ Sauvegardé !"); await loadData(); }
    setStatus("idle");
  };

  const logout = () => { localStorage.removeItem("mt_auth"); router.push("/login"); };
  const toggleTheme = () => { const nd = !dark; setDark(nd); localStorage.setItem("mt_theme", nd ? "dark" : "light"); };

  const activeRow  = rows.find(r => r.section === active);
  const isDirty    = JSON.stringify(drafts[active]) !== JSON.stringify(activeRow?.content);
  const totalDirty = NAV.filter(n => JSON.stringify(drafts[n.key]) !== JSON.stringify(rows.find(r => r.section === n.key)?.content)).length;
  const setDraft   = (v: any) => setDrafts(d => ({ ...d, [active]: v }));
  const resetDraft = () => setDrafts(d => ({ ...d, [active]: JSON.parse(JSON.stringify(activeRow?.content)) }));

  return (
    <div style={{ minHeight: "100vh", background: s.bg, color: s.text, fontFamily: "'Segoe UI', system-ui, sans-serif", transition: "background 0.3s" }}>
      <div style={{ background: s.topbar, borderBottom: "1px solid " + s.border, height: 62, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(12px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={() => setSideOpen(!sideOpen)} style={{ background: "transparent", border: "none", cursor: "pointer", color: s.sub, fontSize: 20, padding: 4 }}>☰</button>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: tealGrad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>⚙️</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15 }}>MOD-TECH Dashboard</div>
            <div style={{ fontSize: 11, color: s.sub }}>Panneau d'administration</div>
          </div>
          {totalDirty > 0 && <div style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 20, padding: "3px 10px", fontSize: 12, color: "#f59e0b", fontWeight: 700 }}>{totalDirty} section{totalDirty > 1 ? "s" : ""} modifiée{totalDirty > 1 ? "s" : ""}</div>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {msg && <div style={{ fontSize: 13, fontWeight: 600, padding: "7px 16px", borderRadius: 9, background: msgType === "err" ? "rgba(239,68,68,0.12)" : "rgba(52,211,153,0.12)", color: msgType === "err" ? "#f87171" : "#34d399", border: "1px solid " + (msgType === "err" ? "rgba(239,68,68,0.25)" : "rgba(52,211,153,0.25)") }}>{msg}</div>}
          <button onClick={toggleTheme} style={{ background: dark ? "rgba(51,65,85,0.4)" : "rgba(226,232,240,0.8)", border: "1px solid " + s.border, borderRadius: 9, padding: "7px 12px", cursor: "pointer", color: s.text, fontSize: 17 }}>{dark ? "☀️" : "🌙"}</button>
          <button onClick={logout} style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 9, padding: "7px 14px", cursor: "pointer", color: "#f87171", fontSize: 13, fontWeight: 600 }}>🚪 Déconnexion</button>
        </div>
      </div>
      <div style={{ display: "flex", minHeight: "calc(100vh - 62px)" }}>
        <div style={{ width: sideOpen ? 240 : 0, overflow: "hidden", transition: "width 0.25s ease", background: s.sidebar, borderRight: "1px solid " + s.border, display: "flex", flexDirection: "column", flexShrink: 0 }}>
          <div style={{ padding: "20px 14px", display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: s.sub, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8, paddingLeft: 4 }}>Sections</div>
            {NAV.map(({ key, label, icon, desc }) => {
              const row = rows.find(r => r.section === key);
              const dirty = JSON.stringify(drafts[key]) !== JSON.stringify(row?.content);
              return (
                <button key={key} onClick={() => setActive(key)} style={s.sectionBtn(active === key)}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 18 }}>{icon}</span>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontWeight: active === key ? 700 : 500 }}>{label}</div>
                      <div style={{ fontSize: 10, color: s.sub }}>{desc}</div>
                    </div>
                  </div>
                  {dirty && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#f59e0b", flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>
          <div style={{ margin: "0 14px 20px", padding: 14, background: dark ? "rgba(13,148,136,0.06)" : "rgba(13,148,136,0.04)", border: "1px solid rgba(13,148,136,0.15)", borderRadius: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: teal, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Supabase</div>
            <div style={{ fontSize: 11, color: s.sub, marginBottom: 4 }}>djiosqlexflaqzrtuyqc</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: status === "loading" || status === "saving" ? "#f59e0b" : status === "error" ? "#ef4444" : "#10b981" }} />
              <span style={{ fontSize: 11, color: s.sub }}>{status === "loading" ? "Chargement..." : status === "saving" ? "Sauvegarde..." : status === "error" ? "Erreur" : "Connecté ✓"}</span>
            </div>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 32 }}>
          {status === "loading" ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, flexDirection: "column", gap: 16, color: s.sub }}>
              <div style={{ width: 44, height: 44, border: "3px solid rgba(13,148,136,0.2)", borderTop: "3px solid " + teal, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              <span>Chargement des données...</span>
            </div>
          ) : (
            <div style={{ maxWidth: 780 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, paddingBottom: 20, borderBottom: "1px solid " + s.border }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span style={{ fontSize: 26 }}>{NAV.find(n => n.key === active)?.icon}</span>
                    <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>{NAV.find(n => n.key === active)?.label}</h1>
                    {isDirty && <span style={{ fontSize: 11, fontWeight: 700, color: "#f59e0b", background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 20, padding: "2px 10px" }}>Non sauvegardé</span>}
                  </div>
                  {activeRow && <div style={{ fontSize: 12, color: s.sub }}>Dernière modification : {formatDate(activeRow.updated_at)}</div>}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {isDirty && <button onClick={resetDraft} style={{ background: "transparent", border: "1px solid " + s.border, color: s.sub, borderRadius: 9, padding: "9px 16px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>↺ Annuler</button>}
                  <button onClick={save} disabled={!isDirty || status === "saving"} style={{ background: isDirty ? tealGrad : "rgba(51,65,85,0.3)", border: "none", borderRadius: 9, padding: "9px 22px", color: isDirty ? "#fff" : s.sub, fontSize: 14, fontWeight: 700, cursor: isDirty ? "pointer" : "not-allowed", transition: "all 0.2s" }}>
                    {status === "saving" ? "⏳ Sauvegarde..." : "💾 Sauvegarder"}
                  </button>
                </div>
              </div>
              <div style={{ background: s.card, border: "1px solid " + s.border, borderRadius: 16, padding: 28 }}>
                {active === "hero"     && drafts.hero     && <HeroEditor     data={drafts.hero}     onChange={setDraft} dark={dark} />}
                {active === "services" && drafts.services  && <ServicesEditor data={drafts.services} onChange={setDraft} dark={dark} />}
                {active === "about"    && drafts.about     && <AboutEditor    data={drafts.about}    onChange={setDraft} dark={dark} />}
                {active === "contact"  && drafts.contact   && <ContactEditor  data={drafts.contact}  onChange={setDraft} dark={dark} />}
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`* { box-sizing: border-box; } input:focus, textarea:focus { border-color: rgba(13,148,136,0.7) !important; box-shadow: 0 0 0 3px rgba(13,148,136,0.12) !important; } @keyframes spin { to { transform: rotate(360deg); } } ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.3); border-radius: 4px; }`}</style>
    </div>
  );
}
