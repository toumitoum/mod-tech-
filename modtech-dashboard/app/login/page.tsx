"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const ADMIN_PASSWORD = "modtech2024";

export default function LoginPage() {
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [dark, setDark] = useState(true);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("mt_theme");
    if (saved) setDark(saved === "dark");
    if (localStorage.getItem("mt_auth") === "1") router.push("/admin");
  }, [router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (pw === ADMIN_PASSWORD) {
        localStorage.setItem("mt_auth", "1");
        router.push("/admin");
      } else {
        setError("Mot de passe incorrect");
        setLoading(false);
      }
    }, 600);
  };

  const bg = dark ? "#0a0f1a" : "#f1f5f9";
  const card = dark ? "rgba(15,23,42,0.95)" : "#ffffff";
  const text = dark ? "#e2e8f0" : "#1e293b";
  const sub = dark ? "#64748b" : "#94a3b8";
  const border = dark ? "rgba(51,65,85,0.6)" : "#e2e8f0";
  const inputBg = dark ? "rgba(15,23,42,0.6)" : "#f8fafc";

  return (
    <div style={{ minHeight: "100vh", background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', system-ui, sans-serif", position: "relative", transition: "background 0.3s" }}>
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(13,148,136,0.12) 0%, transparent 70%)", top: "10%", left: "15%" }} />
        <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(20,184,166,0.08) 0%, transparent 70%)", bottom: "15%", right: "20%" }} />
      </div>
      <button onClick={() => { setDark(!dark); localStorage.setItem("mt_theme", !dark ? "dark" : "light"); }}
        style={{ position: "absolute", top: 20, right: 20, background: dark ? "rgba(51,65,85,0.4)" : "rgba(226,232,240,0.8)", border: "1px solid " + border, borderRadius: 10, padding: "8px 14px", cursor: "pointer", color: text, fontSize: 18 }}>
        {dark ? "☀️" : "🌙"}
      </button>
      <div style={{ background: card, border: "1px solid " + border, borderRadius: 20, padding: "44px 40px", width: "100%", maxWidth: 400, boxShadow: dark ? "0 25px 60px rgba(0,0,0,0.5)" : "0 25px 60px rgba(0,0,0,0.1)", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, background: "linear-gradient(135deg, #0d9488, #0f766e)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 16px" }}>⚙️</div>
          <h1 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 800, color: text }}>MOD-TECH Dashboard</h1>
          <p style={{ margin: 0, fontSize: 13, color: sub }}>Entrez votre mot de passe pour continuer</p>
        </div>
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ position: "relative" }}>
            <input
              type={show ? "text" : "password"}
              placeholder="Mot de passe"
              value={pw}
              onChange={e => { setPw(e.target.value); setError(""); }}
              autoFocus
              style={{ width: "100%", background: inputBg, border: "1px solid " + (error ? "#ef4444" : border), borderRadius: 10, padding: "12px 44px 12px 16px", color: text, fontSize: 15, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
            />
            <button type="button" onClick={() => setShow(!show)}
              style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", color: sub, fontSize: 16, padding: 0 }}>
              {show ? "🙈" : "👁️"}
            </button>
          </div>
          {error && <div style={{ color: "#f87171", fontSize: 13, fontWeight: 500, padding: "8px 12px", background: "rgba(239,68,68,0.1)", borderRadius: 8 }}>❌ {error}</div>}
          <button type="submit" disabled={loading || !pw}
            style={{ background: pw ? "linear-gradient(135deg, #0d9488, #0f766e)" : "rgba(51,65,85,0.3)", border: "none", borderRadius: 10, padding: "13px", color: pw ? "#fff" : sub, fontSize: 15, fontWeight: 700, cursor: pw ? "pointer" : "not-allowed" }}>
            {loading ? "⏳ Connexion..." : "🔐 Se connecter"}
          </button>
        </form>
        <p style={{ textAlign: "center", fontSize: 11, color: sub, marginTop: 24, marginBottom: 0 }}>MOD-TECHNOLOGIE © {new Date().getFullYear()}</p>
      </div>
      <style>{`* { box-sizing: border-box; }`}</style>
    </div>
  );
}
