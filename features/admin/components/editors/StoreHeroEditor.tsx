"use client";

import {
Store
} from "lucide-react";
import { teal } from "../../styles";
import type { StoreHero } from "../../types";
import { Field } from "../shared/Field";
import { ImgUpload } from "../shared/ImageUpload";

export function StoreHeroEd({ data, onChange, dark }: { data: StoreHero; onChange: (d: StoreHero) => void; dark: boolean }) {
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
