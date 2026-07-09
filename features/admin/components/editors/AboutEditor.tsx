"use client";

import {
Award,
Eye,
EyeOff,
Image as ImageIcon,
RefreshCw,
X
} from "lucide-react";
import { useRef,useState } from "react";
import { uploadSiteImage } from "../../services/storage.service";
import { ms,teal,tG } from "../../styles";
import { AdminIconButton } from "../shared/AdminIconButton";
import { Field } from "../shared/Field";

type AboutDraft = {
  visible?: boolean;
  title?: string;
  description?: string;
  mission?: string;
  years?: string;
  clients?: string;
  projects?: string;
  image?: string;
};

export function AboutEd({ data, onChange, dark }: { data: AboutDraft; onChange: (d: AboutDraft) => void; dark: boolean }) {
  const s = ms(dark);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const f = (k: keyof AboutDraft, v: string | boolean) => onChange({ ...data, [k]: v });

  const uploadImage = async (file: File) => {
    setUploading(true);
    try {
      const publicUrl = await uploadSiteImage(file, "about/image");
      f("image", publicUrl);
    } catch (error) {
      alert("Upload error: " + (error instanceof Error ? error.message : String(error)));
    }
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
        <span>Section À propos — Présentation de l&apos;entreprise sur la page d&apos;accueil</span>
      </div>

      {/* ── VISIBLE TOGGLE ── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
        background: data.visible
          ? (dark ? "rgba(13,148,136,0.08)" : "rgba(13,148,136,0.04)")
          : (dark ? "rgba(51,65,85,0.3)" : "rgba(226,232,240,0.5)"),
        border: "1px solid " + (data.visible ? "rgba(13,148,136,0.3)" : s.brd),
        borderRadius: 12,
        padding: "14px 18px",
      }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: s.tx, display: "flex", alignItems: "center", gap: 7 }}>
            {data.visible ? <Eye className="w-4 h-4" style={{ color: teal }} /> : <EyeOff className="w-4 h-4" style={{ color: s.sub }} />}
            {data.visible ? "Section visible sur le site" : "Section masquée"}
          </div>
          <div style={{ fontSize: 12, color: s.sub, marginTop: 3 }}>
            {data.visible
              ? "La section «À propos» est affichée sur la page d'accueil"
              : "La section est cachée — personne ne la voit"}
          </div>
        </div>
        <button type="button"
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 12 }}>
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
            <AdminIconButton
              dark={dark}
              label="Supprimer"
              onClick={() => f("image", "")}
              tone="danger"
              style={{
                position: "absolute", top: 8, right: 8,
                width: 32,
                height: 32,
                borderRadius: 9,
              }}
            >
              <X className="w-3.5 h-3.5" />
            </AdminIconButton>
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
            {uploading ? <RefreshCw className="w-6 h-6 animate-spin" /> : <ImageIcon className="w-6 h-6" />}
            {uploading ? "Upload en cours..." : "Cliquer pour ajouter une image"}
          </div>
        )}
      </div>
    </div>
  );
}
