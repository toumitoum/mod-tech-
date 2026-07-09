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
Users,
X
} from "lucide-react";
import { useRef,useState } from "react";
import { uploadSiteImage } from "../../services/storage.service";
import { ms,teal,tG } from "../../styles";
import type { Partner } from "../../types";

type UploadPartnerImage = (file: File, path: string) => Promise<string>;

function PartnerLogoImage({ cur, pid, dark, uploadImg, onReload }: { cur: string; pid: number; dark: boolean; uploadImg: UploadPartnerImage; onReload: () => void }) {
  const s = ms(dark);
  const [prev, setPrev] = useState(cur);
  const [up, setUp] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setUp(true);
    try {
      const url = await uploadImg(file, `partner-${pid}`);
      setPrev(url);
      await supabase.from("partners").update({ logo: url }).eq("id", pid);
      onReload();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : String(e));
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
          {up ? "Upload" : "Changer"}
        </span>
      </div>
      <input ref={ref} type="file" accept="image/*" style={{ display: "none" }} onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} />
    </div>
  );
}

function NewPartnerLogo({ dark, onUrl, uploadImg }: { dark: boolean; onUrl: (u: string) => void; uploadImg: UploadPartnerImage }) {
  const s = ms(dark);
  const [prev, setPrev] = useState("");
  const [up, setUp] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setUp(true);
    try {
      const url = await uploadImg(file, "partner-new");
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
          <button type="button"
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
      <input ref={ref} type="file" accept="image/*" style={{ display: "none" }} onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} />
      <button type="button"
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
        {up ? "Upload..." : "Logo *"}
      </button>
    </div>
  );
}

export function PartnersEd({ partners, onReload, dark }: { partners: Partner[]; onReload: () => void; dark: boolean }) {
  const s = ms(dark);
  const [saving, setSaving] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [newP, setNewP] = useState({ name: "", logo: "", website: "", sort_order: partners.length + 1 });
  
  const uploadImg = async (file: File, path: string): Promise<string> => {
    return uploadSiteImage(file, path);
  };
  
  const updateField = async (id: number, field: string, value: unknown) => {
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
          className="admin-list-item"
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
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <PartnerLogoImage cur={p.logo} pid={p.id} dark={dark} uploadImg={uploadImg} onReload={onReload} />
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
              <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
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
                <button type="button"
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
                <button type="button"
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
            <NewPartnerLogo dark={dark} uploadImg={uploadImg} onUrl={url => setNewP(n => ({ ...n, logo: url }))} />
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
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button type="button"
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
                {saving === -1 ? "Ajout..." : "Ajouter"}
              </button>
              <button type="button"
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
        <button type="button"
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
