"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/app/supabase";

type EmailSettings = {
  id: number;
  notify_email: string;
  resend_key: string;
  updated_at: string;
};

const teal = "#0d9488";

export default function EmailEd({ dark }: { dark: boolean }) {
  const tx  = dark ? "#e2e8f0" : "#1e293b";
  const sub = dark ? "#64748b" : "#94a3b8";
  const brd = dark ? "rgba(51,65,85,0.6)" : "#e2e8f0";
  const ibg = dark ? "rgba(10,15,26,0.8)" : "#fff";
  const ci  = dark ? "rgba(20,30,50,0.6)" : "#f8fafc";
  const mut = dark ? "#94a3b8" : "#64748b";

  const [settings, setSettings] = useState<EmailSettings | null>(null);
  const [email, setEmail]       = useState("modtech.srv@gmail.com");
  const [key, setKey]           = useState("");
  const [showKey, setShowKey]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [testing, setTesting]   = useState(false);
  const [msg, setMsg]           = useState("");
  const [msgOk, setMsgOk]       = useState(true);

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

  const notify = (text: string, ok = true) => {
    setMsg(text); setMsgOk(ok);
    setTimeout(() => setMsg(""), 4000);
  };

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("email_settings")
      .update({ notify_email: email, resend_key: key, updated_at: new Date().toISOString() })
      .eq("id", 1);
    setSaving(false);
    if (error) notify("❌ " + error.message, false);
    else notify("✅ تم الحفظ!");
  };

  const testEmail = async () => {
    if (!key) { notify("❌ أضف Resend API Key أولاً", false); return; }
    if (!email) { notify("❌ أضف إيميل الاستقبال", false); return; }
    setTesting(true);
    try {
      const res = await fetch("/api/send-order-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order: {
            customer_name: "عميل تجريبي",
            customer_phone: "0661234567",
            customer_address: "الجزائر العاصمة",
            customer_email: "",
            notes: "هذا إيميل تجريبي",
            items: [{ name: "كاميرا Hikvision", price: 15000, qty: 2 }],
            total: 30000,
          }
        })
      });
      const data = await res.json();
      if (data.ok) notify("✅ تم إرسال إيميل تجريبي لـ " + email);
      else notify("❌ فشل الإرسال: " + (data.result?.message || data.error || "خطأ غير معروف"), false);
    } catch (e: any) {
      notify("❌ " + e.message, false);
    }
    setTesting(false);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: ibg,
    border: "1px solid " + brd,
    borderRadius: 10,
    padding: "11px 14px",
    color: tx,
    fontSize: 14,
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Info */}
      <div style={{ background: dark ? "rgba(13,148,136,0.06)" : "rgba(13,148,136,0.04)", border: "1px solid rgba(13,148,136,0.2)", borderRadius: 12, padding: "14px 18px", fontSize: 13, color: sub, lineHeight: 1.7 }}>
        <div style={{ color: teal, fontWeight: 700, marginBottom: 6 }}>📧 كيف يعمل؟</div>
        عند كل طلب جديد من المتجر — يُرسل إيميل تلقائياً إلى الإيميل أدناه عبر Resend.
      </div>

      {/* Notify email */}
      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: mut, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8, fontFamily: "monospace" }}>
          📬 إيميل استقبال الإشعارات
        </label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="modtech.srv@gmail.com"
          style={inputStyle}
        />
        <div style={{ fontSize: 11, color: sub, marginTop: 5 }}>الإيميل الذي يستقبل إشعار كل طلب جديد</div>
      </div>

      {/* Resend API Key */}
      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: mut, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8, fontFamily: "monospace" }}>
          🔑 Resend API Key
        </label>
        <div style={{ position: "relative" }}>
          <input
            type={showKey ? "text" : "password"}
            value={key}
            onChange={e => setKey(e.target.value)}
            placeholder="re_xxxxxxxxxxxx"
            style={{ ...inputStyle, paddingLeft: 44 }}
          />
          <button onClick={() => setShowKey(!showKey)}
            style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", color: sub, fontSize: 16, padding: 0 }}>
            {showKey ? "🙈" : "👁️"}
          </button>
        </div>
        <div style={{ fontSize: 11, color: sub, marginTop: 5 }}>
          احصل على مفتاح مجاني من{" "}
          <a href="https://resend.com/signup" target="_blank" rel="noreferrer" style={{ color: teal, textDecoration: "none" }}>resend.com</a>
          {" "}← API Keys ← Create API Key
        </div>
      </div>

      {/* Current key status */}
      {key && (
        <div style={{ background: dark ? "rgba(16,185,129,0.06)" : "rgba(16,185,129,0.04)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 10, padding: "10px 16px", fontSize: 13, color: "#10b981", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>✅</span>
          API Key موجود — {key.substring(0, 8)}...
        </div>
      )}

      {/* Message */}
      {msg && (
        <div style={{ background: msgOk ? "rgba(52,211,153,0.1)" : "rgba(239,68,68,0.1)", border: "1px solid " + (msgOk ? "rgba(52,211,153,0.25)" : "rgba(239,68,68,0.25)"), borderRadius: 10, padding: "10px 16px", fontSize: 13, fontWeight: 600, color: msgOk ? "#34d399" : "#f87171" }}>
          {msg}
        </div>
      )}

      {/* Buttons */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button onClick={save} disabled={saving}
          style={{ background: "linear-gradient(135deg,#0d9488,#0f766e)", border: "none", borderRadius: 10, padding: "11px 24px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
          {saving ? "⏳ حفظ..." : "💾 حفظ الإعدادات"}
        </button>

        <button onClick={testEmail} disabled={testing || !key}
          style={{ background: key ? "rgba(59,130,246,0.1)" : "rgba(51,65,85,0.3)", border: "1px solid " + (key ? "rgba(59,130,246,0.3)" : brd), borderRadius: 10, padding: "11px 20px", color: key ? "#60a5fa" : sub, fontSize: 14, fontWeight: 600, cursor: (testing || !key) ? "not-allowed" : "pointer" }}>
          {testing ? "⏳ إرسال..." : "🧪 إيميل تجريبي"}
        </button>
      </div>

      {settings && (
        <div style={{ fontSize: 11, color: sub }}>
          آخر تعديل: {new Date(settings.updated_at).toLocaleString("fr-DZ")}
        </div>
      )}

      <style>{`input:focus{border-color:rgba(13,148,136,0.7)!important;box-shadow:0 0 0 3px rgba(13,148,136,0.12)!important;}`}</style>
    </div>
  );
}