"use client";

import {
Phone
} from "lucide-react";
import { ms,teal } from "../../styles";
import { Field } from "../shared/Field";

type ContactDraft = Record<string, string | undefined>;

export function ContactEd({ data, onChange, dark }: { data: ContactDraft; onChange: (d: ContactDraft) => void; dark: boolean }) {
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
            <div key={key} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
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
