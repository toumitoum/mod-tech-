"use client";

import { motion } from "framer-motion";
import {
Layers,
Plus,
Trash2,
Wrench
} from "lucide-react";
import { ms,teal } from "../../styles";
import { AdminIconButton } from "../shared/AdminIconButton";
import { Field } from "../shared/Field";
import { ImgUpload } from "../shared/ImageUpload";

type ServiceDraft = {
  id?: number;
  title?: string;
  description?: string;
  icon?: string;
  image?: string;
};

export function ServicesEd({ data, onChange, dark }: { data: ServiceDraft[]; onChange: (d: ServiceDraft[]) => void; dark: boolean }) {
  const s = ms(dark);
  const cleanIconValue = (value: string) => value.replace(/[\p{Extended_Pictographic}\uFE0F]/gu, "").trim();
  const upd = (i: number, k: string, v: string) => onChange(data.map((x, j) => j === i ? { ...x, [k]: v } : x));
  const del = (i: number) => onChange(data.filter((_, j) => j !== i));
  const add = () => onChange([...data, { id: Date.now(), title: "Nouveau service", description: "", icon: "wrench", image: "" }]);
  
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
          className="admin-list-item"
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
              <span style={{ width: 34, height: 34, borderRadius: 10, background: s.accentSoft, color: teal, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Wrench className="w-4 h-4" />
              </span>
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
            <AdminIconButton
              dark={dark}
              label="Supprimer"
              onClick={() => del(i)}
              tone="danger"
              size={34}
            >
              <Trash2 className="w-3 h-3" />
            </AdminIconButton>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Field label="Icône" value={cleanIconValue(svc.icon ?? "")} onChange={v => upd(i, "icon", v)} dark={dark} placeholder="wrench, network, lock..." />
            <Field label="Titre" value={svc.title ?? ""} onChange={v => upd(i, "title", v)} dark={dark} />
            <Field label="Description" value={svc.description ?? ""} onChange={v => upd(i, "description", v)} multi dark={dark} />
            <ImgUpload label="Photo" cur={svc.image ?? ""} path={"service-" + i} onDone={v => upd(i, "image", v)} dark={dark} height={120} />
          </div>
        </motion.div>
      ))}
      
      <button type="button"
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
