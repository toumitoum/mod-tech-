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

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.push("/admin");
    });
  }, [router]);

  // LOGIN
  const login = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: pw,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/admin");
    }
  };

  // CREATE ACCOUNT
  const signup = async () => {
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signUp({
      email: email,
      password: pw,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      alert("Account created successfully");
      router.push("/admin");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b1220",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          background: "#0f172a",
          padding: 40,
          borderRadius: 16,
          width: 400,
          color: "white",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: 30 }}>
          MOD-TECH Admin Login
        </h2>

        <form onSubmit={login} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              padding: 12,
              borderRadius: 8,
              border: "1px solid #334155",
              background: "#020617",
              color: "white",
            }}
          />

          <div style={{ position: "relative" }}>
            <input
              type={show ? "text" : "password"}
              placeholder="Password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              style={{
                padding: 12,
                borderRadius: 8,
                border: "1px solid #334155",
                background: "#020617",
                color: "white",
                width: "100%",
              }}
            />

            <button
              type="button"
              onClick={() => setShow(!show)}
              style={{
                position: "absolute",
                right: 10,
                top: 10,
                background: "transparent",
                border: "none",
                color: "#94a3b8",
                cursor: "pointer",
              }}
            >
              {show ? "Hide" : "Show"}
            </button>
          </div>

          {error && (
            <div style={{ color: "#ef4444", fontSize: 14 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{
              background: "#14b8a6",
              padding: 12,
              borderRadius: 8,
              border: "none",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            {loading ? "Loading..." : "Login"}
          </button>

         
        </form>
      </div>
    </div>
  );
}