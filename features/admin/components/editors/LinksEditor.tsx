"use client";

import { supabase } from "@/app/supabase";
import { motion } from "framer-motion";
import {
Eye,
EyeOff,
Plus,
RefreshCw,
Trash2
} from "lucide-react";
import React,{ useEffect,useState } from "react";
import { ms,teal,tG } from "../../styles";

export function LinksEd({ dark }: { dark: boolean }) {
  const s = ms(dark);
  type ContactLink = {
    id: number;
    title: string;
    url: string;
    icon: string;
    sort_order: number;
    is_active: boolean;
  };
  const [links, setLinks] = useState<ContactLink[]>([]);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState<number | null>(null);
  const [newLink, setNewLink] = useState({ title: "", url: "", icon: "🔗", sort_order: 1 });

  const load = async () => {
    const { data } = await supabase.from("contact_links").select("*").order("sort_order");
    setLinks(data ?? []);
  };

  useEffect(() => { void Promise.resolve().then(load); }, []);

  const updateField = async (id: number, field: string, value: unknown) => {
    setSaving(id);
    await supabase.from("contact_links").update({ [field]: value }).eq("id", id);
    setSaving(null);
    load();
  };

  const toggleActive = async (link: ContactLink) => {
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
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
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
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            {/* Icon */}
            <div style={{ width: 44, height: 44, borderRadius: 12, background: dark ? "rgba(255,255,255,0.05)" : "#f8fafc", border: "1px solid " + s.brd, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
              {link.icon}
            </div>

            {/* Fields */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
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
                  style={{ ...inp, fontWeight: 600, flex: 1 }}
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
              <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
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
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
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
                style={{ ...inp, fontWeight: 600, flex: 1 }}
              />
            </div>
            <input
              value={newLink.url}
              onChange={e => setNewLink(n => ({ ...n, url: e.target.value }))}
              placeholder="https://... *"
              style={{ ...inp, fontSize: 12 }}
            />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
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
