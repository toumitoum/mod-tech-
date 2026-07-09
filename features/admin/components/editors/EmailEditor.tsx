"use client";

import { supabase } from "@/app/supabase";
import {
CheckCircle2,
Eye,
EyeOff,
Mail,
RefreshCw,
Save
} from "lucide-react";
import React,{ useEffect,useState } from "react";
import { ms,teal,tG } from "../../styles";
import type { EmailSettings } from "../../types";

export function EmailEd({ dark }: { dark: boolean }) {
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
    if (error) notify(error.message, false);
    else notify("Sauvegardé !");
  };

  const testEmail = async () => {
    if (!key) { notify("Ajoutez la clé API Resend d'abord", false); return; }
    if (!email) { notify("Ajoutez l'email de notification", false); return; }
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
      if (data.ok) notify("Email test envoyé à " + email);
      else notify("Échec: " + (data.result?.message || data.error || "Erreur"), false);
    } catch (e: unknown) {
      notify(e instanceof Error ? e.message : String(e), false);
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
          <button type="button"
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
        <button type="button"
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
        <button type="button"
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
