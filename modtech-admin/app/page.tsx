"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://djiosqlexflaqzrtuyqc.supabase.co",
  "sb_publishable_JMN6dsJOA2lUpSLYQcKD8A_3xBlz3bV"
);

type Row = { id: number; section: string; content: any; updated_at: string };
type Status = "idle" | "loading" | "saving" | "success" | "error";

const SECTIONS: Record<string, string> = {
  hero: "🏠 Hero",
  services: "🛠 Services",
  about: "ℹ️ À propos",
  contact: "📞 Contact",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("fr-DZ", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const inputStyle: React.CSSProperties = {
  background: "rgba(15,23,42,0.6)",
  border: "1px solid rgba(51,65,85,0.8)",
  borderRadius: 8,
  padding: "9px 13px",
  color: "#e2e8f0",
  fontSize: 14,
  width: "100%",
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
};

function ObjectEditor({ data, onChange }: { data: Record<string, string>; onChange: (d: any) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {Object.entries(data).map(([key, value]) => (
        <div key={key} style={{ display: "grid", gridTemplateColumns: "130px 1fr", gap: 12, alignItems: "start" }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", paddingTop: 10, fontFamily: "monospace" }}>
            {key}
          </label>
          {String(value).length > 55 ? (
            <textarea rows={3} value={String(value)} onChange={e => onChange({ ...data, [key]: e.target.value })} style={{ ...inputStyle, resize: "none" }} />
          ) : (
            <input value={String(value)} onChange={e => onChange({ ...data, [key]: e.target.value })} style={inputStyle} />
          )}
        </div>
      ))}
    </div>
  );
}

function ServicesEditor({ data, onChange }: { data: any[]; onChange: (d: any[]) => void }) {
  const update = (idx: number, field: string, val: string) =>
    onChange(data.map((item, i) => i === idx ? { ...item, [field]: val } : item));
  const remove = (idx: number) => onChange(data.filter((_, i) => i !== idx));
  const add = () => onChange([...data, { id: Date.now(), title: "Nouveau service", description: "", icon: "⚙️" }]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {data.map((svc, idx) => (
        <div key={svc.id} style={{ background: "rgba(20,184,166,0.04)", border: "1px solid rgba(20,184,166,0.15)", borderRadius: 12, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#2dd4bf", textTransform: "uppercase", letterSpacing: "0.1em" }}>Service {idx + 1}</span>
            <button onClick={() => remove(idx)} style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", borderRadius: 6, padding: "3px 10px", cursor: "pointer", fontSize: 12 }}>✕ Supprimer</button>
          </div>
          {[
            { field: "icon", label: "Icône", multiline: false },
            { field: "title", label: "Titre", multiline: false },
            { field: "description", label: "Description", multiline: true },
          ].map(({ field, label, multiline }) => (
            <div key={field} style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 10, alignItems: "start", marginBottom: 10 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", paddingTop: 10, fontFamily: "monospace" }}>{label}</label>
              {multiline
                ? <textarea rows={2} value={svc[field]} onChange={e => update(idx, field, e.target.value)} style={{ ...inputStyle, resize: "none" }} />
                : <input value={svc[field]} onChange={e => update(idx, field, e.target.value)} style={inputStyle} />
              }
            </div>
          ))}
        </div>
      ))}
      <button onClick={add}
        style={{ border: "2px dashed rgba(20,184,166,0.3)", background: "transparent", color: "#2dd4bf", borderRadius: 12, padding: "12px", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
        + Ajouter un service
      </button>
    </div>
  );
}

export default function AdminPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [active, setActive] = useState("hero");
  const [drafts, setDrafts] = useState<Record<string, any>>({});
  const [status, setStatus] = useState<Status>("loading");
  const [msg, setMsg] = useState("");

  const loadData = useCallback(async () => {
    setStatus("loading");
    const { data, error } = await supabase.from("site_content").select("*").order("id");
    if (error) { setStatus("error"); setMsg("Erreur: " + error.message); return; }
    setRows(data ?? []);
    const d: Record<string, any> = {};
    (data ?? []).forEach((r: Row) => { d[r.section] = r.content; });
    setDrafts(d);
    setStatus("idle");
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const save = async () => {
    setStatus("saving");
    const { error } = await supabase
      .from("site_content")
      .update({ content: drafts[active], updated_at: new Date().toISOString() })
      .eq("section", active);
    if (error) {
      setStatus("error"); setMsg("❌ " + error.message);
    } else {
      setStatus("success"); setMsg("✅ Sauvegardé !");
      await loadData();
    }
    setTimeout(() => { setStatus("idle"); setMsg(""); }, 3000);
  };

  const activeRow = rows.find(r => r.section === active);
  const isDirty = JSON.stringify(drafts[active]) !== JSON.stringify(activeRow?.content);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1a", color: "#e2e8f0", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ background: "rgba(15,23,42,0.95)", borderBottom: "1px solid rgba(51,65,85,0.5)", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #0d9488, #0f766e)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⚙️</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: "#f1f5f9" }}>MOD-TECH Admin</div>
            <div style={{ fontSize: 11, color: "#64748b" }}>Panneau d'administration</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {msg && <span style={{ fontSize: 13, color: status === "error" ? "#f87171" : "#34d399", fontWeight: 600, padding: "6px 14px", background: status === "error" ? "rgba(239,68,68,0.1)" : "rgba(52,211,153,0.1)", borderRadius: 8 }}>{msg}</span>}
          <button onClick={save} disabled={!isDirty || status === "saving"}
            style={{ background: isDirty ? "linear-gradient(135deg, #0d9488, #0f766e)" : "rgba(51,65,85,0.4)", border: "none", borderRadius: 10, padding: "9px 22px", color: isDirty ? "#fff" : "#475569", fontSize: 14, fontWeight: 700, cursor: isDirty ? "pointer" : "not-allowed" }}>
            {status === "saving" ? "⏳ Sauvegarde..." : "💾 Sauvegarder"}
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", minHeight: "calc(100vh - 64px)" }}>
        <div style={{ background: "rgba(15,23,42,0.5)", borderRight: "1px solid rgba(51,65,85,0.4)", padding: 20, display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8, paddingLeft: 4 }}>Sections</div>
          {Object.entries(SECTIONS).map(([key, label]) => {
            const row = rows.find(r => r.section === key);
            const dirty = JSON.stringify(drafts[key]) !== JSON.stringify(row?.content);
            return (
              <button key={key} onClick={() => setActive(key)}
                style={{ background: active === key ? "rgba(13,148,136,0.15)" : "transparent", border: active === key ? "1px solid rgba(13,148,136,0.4)" : "1px solid transparent", borderRadius: 10, padding: "12px 14px", textAlign: "left", color: active === key ? "#2dd4bf" : "#94a3b8", cursor: "pointer", fontSize: 14, fontWeight: active === key ? 700 : 500, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span>{label}</span>
                {dirty && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#f59e0b", display: "inline-block" }} />}
              </button>
            );
          })}
          <div style={{ marginTop: "auto", padding: "12px 14px", background: "rgba(13,148,136,0.06)", border: "1px solid rgba(13,148,136,0.15)", borderRadius: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#0d9488", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Supabase</div>
            <div style={{ fontSize: 11, color: "#475569" }}>djiosqlexflaqzrtuyqc</div>
            <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: status === "loading" ? "#f59e0b" : status === "error" ? "#ef4444" : "#10b981" }} />
              <span style={{ fontSize: 11, color: "#475569" }}>{status === "loading" ? "Connexion..." : status === "error" ? "Erreur" : "Connecté"}</span>
            </div>
          </div>
        </div>

        <div style={{ padding: 36, overflowY: "auto" }}>
          {status === "loading" ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, color: "#475569", flexDirection: "column", gap: 16 }}>
              <div style={{ width: 40, height: 40, border: "3px solid rgba(13,148,136,0.3)", borderTop: "3px solid #0d9488", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              <span>Chargement...</span>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 28, paddingBottom: 20, borderBottom: "1px solid rgba(51,65,85,0.4)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#f1f5f9" }}>{SECTIONS[active]}</h1>
                    {activeRow && <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>Dernière modification : {formatDate(activeRow.updated_at)}</div>}
                  </div>
                  {isDirty && (
                    <button onClick={() => setDrafts(d => ({ ...d, [active]: activeRow?.content }))}
                      style={{ background: "transparent", border: "1px solid rgba(51,65,85,0.6)", color: "#94a3b8", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 12 }}>
                      ↺ Annuler
                    </button>
                  )}
                </div>
              </div>
              <div style={{ maxWidth: 740 }}>
                {active === "services" && Array.isArray(drafts[active])
                  ? <ServicesEditor data={drafts[active]} onChange={v => setDrafts(d => ({ ...d, [active]: v }))} />
                  : drafts[active] && typeof drafts[active] === "object"
                    ? <ObjectEditor data={drafts[active]} onChange={v => setDrafts(d => ({ ...d, [active]: v }))} />
                    : <div style={{ color: "#475569" }}>Aucune donnée.</div>
                }
              </div>
            </>
          )}
        </div>
      </div>
      <style>{`* { box-sizing: border-box; } input:focus, textarea:focus { border-color: rgba(13,148,136,0.6) !important; box-shadow: 0 0 0 3px rgba(13,148,136,0.1); } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
