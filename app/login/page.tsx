"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("mt_theme");
    if (t) setDark(t === "dark");
    // تحقق بسيط بدون blocking
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.push("/admin");
    });
  }, [router]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !pw) return;
    setLoading(true);
    setError("");

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password: pw });
      if (authError) {
        if (authError.message.includes("Invalid login credentials")) setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
        else if (authError.message.includes("Email not confirmed")) setError("يرجى تأكيد البريد الإلكتروني أولاً");
        else if (authError.message.includes("Too many requests")) setError("محاولات كثيرة، يرجى الانتظار قليلاً");
        else setError("حدث خطأ: " + authError.message);
        setLoading(false);
      } else {
        router.push("/admin");
      }
    } catch (err: any) {
      setError("خطأ في الاتصال: " + err.message);
      setLoading(false);
    }
  };

  const colors = dark
    ? {
        bg: "#0b1220",
        bg2: "#0f172a",
        card: "rgba(15,23,42,0.92)",
        text: "#e2e8f0",
        sub: "#94a3b8",
        brd: "rgba(148,163,184,0.18)",
        ibg: "rgba(15,23,42,0.6)",
        accent: "#14b8a6",
        accent2: "#0f766e",
        ring: "rgba(20,184,166,0.35)",
      }
    : {
        bg: "#f8fafc",
        bg2: "#e2e8f0",
        card: "#ffffff",
        text: "#0f172a",
        sub: "#64748b",
        brd: "#e2e8f0",
        ibg: "#f8fafc",
        accent: "#0f766e",
        accent2: "#0d9488",
        ring: "rgba(13,148,136,0.25)",
      };
  const shadow = dark ? "0 30px 70px rgba(2,6,23,0.6)" : "0 30px 70px rgba(15,23,42,0.12)";
  const ready = email.length > 0 && pw.length > 0;

  return (
    <div
      dir="rtl"
      style={{
        minHeight: "100vh",
        background: `radial-gradient(900px 500px at 85% 5%, ${colors.ring} 0%, transparent 60%), linear-gradient(135deg, ${colors.bg} 0%, ${colors.bg2} 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-geist-sans), 'Segoe UI', Tahoma, Arial, sans-serif",
        position: "relative",
        padding: "48px 20px",
      }}
    >
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div
          style={{
            position: "absolute",
            width: 480,
            height: 480,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${colors.ring} 0%, transparent 70%)`,
            top: "-10%",
            right: "-5%",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 360,
            height: 360,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${colors.ring} 0%, transparent 70%)`,
            bottom: "-5%",
            left: "10%",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
            opacity: dark ? 0.08 : 0.12,
          }}
        />
      </div>

      <button
        onClick={() => {
          const nd = !dark;
          setDark(nd);
          localStorage.setItem("mt_theme", nd ? "dark" : "light");
        }}
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          background: dark ? "rgba(15,23,42,0.7)" : "rgba(255,255,255,0.9)",
          border: `1px solid ${colors.brd}`,
          borderRadius: 999,
          padding: "8px 14px",
          cursor: "pointer",
          color: colors.text,
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        {dark ? "الوضع الداكن" : "الوضع الفاتح"}
      </button>

      <div
        style={{
          background: colors.card,
          border: `1px solid ${colors.brd}`,
          borderRadius: 22,
          padding: "46px 44px",
          width: "100%",
          maxWidth: 440,
          boxShadow: shadow,
          position: "relative",
          zIndex: 1,
          backdropFilter: "blur(12px)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent2})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              margin: "0 auto 16px",
              boxShadow: `0 10px 28px ${colors.ring}`,
              color: "#ffffff",
              fontWeight: 800,
              letterSpacing: 1,
            }}
          >
            MT
          </div>
          <h1 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 800, color: colors.text }}>
            لوحة تحكم MOD-TECH
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: colors.sub }}>الدخول إلى منطقة الإدارة بأمان</p>
        </div>

        <form onSubmit={login} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <label htmlFor="mt-email" style={{ fontSize: 12, fontWeight: 700, color: colors.sub }}>
              البريد الإلكتروني
            </label>
            <input
              id="mt-email"
              type="email"
              placeholder="admin@modtech.dz"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              autoFocus
              autoComplete="email"
              style={{
                width: "100%",
                background: colors.ibg,
                border: `1px solid ${error ? "#ef4444" : colors.brd}`,
                borderRadius: 12,
                padding: "12px 16px",
                color: colors.text,
                fontSize: 15,
                outline: "none",
                boxSizing: "border-box",
                fontFamily: "inherit",
                textAlign: "right",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <label htmlFor="mt-password" style={{ fontSize: 12, fontWeight: 700, color: colors.sub }}>
              كلمة المرور
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="mt-password"
                type={show ? "text" : "password"}
                placeholder="••••••••"
                value={pw}
                onChange={(e) => {
                  setPw(e.target.value);
                  setError("");
                }}
                autoComplete="current-password"
                style={{
                  width: "100%",
                  background: colors.ibg,
                  border: `1px solid ${error ? "#ef4444" : colors.brd}`,
                  borderRadius: 12,
                  padding: "12px 88px 12px 16px",
                  color: colors.text,
                  fontSize: 15,
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                  textAlign: "right",
                }}
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: `1px solid ${colors.brd}`,
                  cursor: "pointer",
                  color: colors.sub,
                  fontSize: 12,
                  padding: "4px 10px",
                  borderRadius: 999,
                }}
              >
                {show ? "إخفاء" : "إظهار"}
              </button>
            </div>
          </div>

          {error && (
            <div
              style={{
                color: "#f87171",
                fontSize: 13,
                padding: "10px 14px",
                background: "rgba(239,68,68,0.1)",
                borderRadius: 10,
                border: "1px solid rgba(239,68,68,0.2)",
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !ready}
            style={{
              background: ready ? `linear-gradient(135deg, ${colors.accent}, ${colors.accent2})` : "rgba(51,65,85,0.3)",
              border: "none",
              borderRadius: 12,
              padding: "14px",
              color: ready ? "#fff" : colors.sub,
              fontSize: 15,
              fontWeight: 700,
              cursor: ready ? "pointer" : "not-allowed",
              marginTop: 4,
              transition: "all 0.2s",
              boxShadow: ready ? `0 8px 20px ${colors.ring}` : "none",
            }}
          >
            {loading ? "جاري التحقق..." : "تسجيل الدخول"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: 11, color: colors.sub, marginTop: 26, marginBottom: 0 }}>
          MOD-TECHNOLOGIE © {new Date().getFullYear()}
        </p>
      </div>
      <style>{`*{box-sizing:border-box;}input:focus-visible{border-color:${colors.accent}!important;box-shadow:0 0 0 3px ${colors.ring}!important;}button:focus-visible{outline:2px solid ${colors.accent};outline-offset:2px;}`}</style>
    </div>
  );
}
