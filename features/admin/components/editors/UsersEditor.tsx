"use client";

import { supabase } from "@/app/supabase";
import {
Eye,
EyeOff,
Plus,
RefreshCw,
Trash2,
Users
} from "lucide-react";
import React,{ useEffect,useState } from "react";
import { ms,teal,tG } from "../../styles";

export function UsersEd({ dark }: { dark: boolean }) {
  const s = ms(dark);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgOk, setMsgOk] = useState(true);
  const [users, setUsers] = useState<{ id: number; email: string; created_at: string }[]>([]);
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = async () => {
    const { data } = await supabase.from("admin_users").select("*").order("created_at");
    setUsers(data ?? []);
  };

  useEffect(() => { void Promise.resolve().then(load); }, []);

  const notify = (text: string, ok = true) => {
    setMsg(text); setMsgOk(ok);
    setTimeout(() => setMsg(""), 5000);
  };

  const createUser = async () => {
    if (!email) { notify("❌ Email obligatoire", false); return; }
    if (!pw || pw.length < 6) { notify("❌ Mot de passe min 6 caractères", false); return; }

    setSaving(true);

    // 1 — إنشاء الحساب في Supabase Auth
    const { error: authError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password: pw,
    });

    if (authError && !authError.message.includes("already registered")) {
      notify("❌ " + authError.message, false);
      setSaving(false);
      return;
    }

    // 2 — إضافة في جدول admin_users تلقائياً
    const { error: dbError } = await supabase
      .from("admin_users")
      .insert([{ email: email.trim().toLowerCase() }]);

    setSaving(false);

    if (dbError) {
      if (dbError.message.includes("duplicate")) notify("⚠️ Cet email est déjà autorisé", false);
      else notify("❌ " + dbError.message, false);
    } else {
      notify(`✅ Compte créé et autorisé : ${email}`);
      setEmail(""); setPw("");
      load(); // refresh list
    }
  };

  const deleteUser = async (id: number, userEmail: string) => {
    if (!confirm(`Supprimer l'accès de ${userEmail} ?`)) return;
    setDeleting(id);
    await supabase.from("admin_users").delete().eq("id", id);
    setDeleting(null);
    load();
  };

  const inp: React.CSSProperties = {
    width: "100%", background: s.ibg, border: "1px solid " + s.brd,
    borderRadius: 10, padding: "11px 14px", color: s.tx,
    fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Info */}
      <div style={{ background: dark ? "rgba(13,148,136,0.06)" : "rgba(13,148,136,0.04)", border: "1px solid rgba(13,148,136,0.2)", borderRadius: 12, padding: "14px 18px", fontSize: 13, color: s.sub, lineHeight: 1.7 }}>
        <div style={{ color: teal, fontWeight: 700, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
          <Users className="w-4 h-4" /> Gestion des comptes admin
        </div>
        Les comptes créés ici sont automatiquement autorisés à accéder au panneau d&apos;administration. Aucune modification manuelle du code nécessaire.
      </div>

      {/* Existing users */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: s.mut, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10, fontFamily: "monospace" }}>
          Comptes autorisés ({users.length})
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {users.map((u) => (
            <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 10, background: s.ci, border: "1px solid " + s.brd, borderRadius: 10, padding: "10px 14px", flexWrap: "wrap" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: tG, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                {u.email[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: s.tx, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</div>
                <div style={{ fontSize: 11, color: s.sub }}>{new Date(u.created_at).toLocaleDateString("fr-DZ")}</div>
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#10b981", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 20, padding: "2px 8px", whiteSpace: "nowrap" }}>
                Autorisé ✓
              </div>
              <button
                onClick={() => deleteUser(u.id, u.email)}
                disabled={deleting === u.id}
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 7, padding: "5px 8px", color: "#f87171", cursor: "pointer", display: "flex", alignItems: "center", flexShrink: 0 }}
              >
                {deleting === u.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ borderTop: "1px solid " + s.brd }} />

      {/* Create form */}
      <div style={{ fontSize: 13, fontWeight: 700, color: s.tx }}>➕ Créer un nouveau compte</div>

      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: s.mut, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8, fontFamily: "monospace" }}>📧 Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="nouveau@admin.dz" style={inp} />
      </div>

      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: s.mut, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8, fontFamily: "monospace" }}>🔒 Mot de passe</label>
        <div style={{ position: "relative" }}>
          <input type={show ? "text" : "password"} value={pw} onChange={e => setPw(e.target.value)} placeholder="••••••••" style={{ ...inp, paddingRight: 80 }} />
          <button onClick={() => setShow(!show)} type="button" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "transparent", border: `1px solid ${s.brd}`, cursor: "pointer", color: s.sub, fontSize: 12, padding: "3px 10px", borderRadius: 999 }}>
            {show ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          </button>
        </div>
        {pw && <div style={{ fontSize: 11, color: s.sub, marginTop: 4 }}>{pw.length < 6 ? "❌ Trop court" : pw.length < 10 ? "⚠️ Moyen" : "✅ Fort"}</div>}
      </div>

      {msg && (
        <div style={{ background: msgOk ? "rgba(52,211,153,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${msgOk ? "rgba(52,211,153,0.25)" : "rgba(239,68,68,0.25)"}`, borderRadius: 10, padding: "10px 16px", fontSize: 13, fontWeight: 600, color: msgOk ? "#34d399" : "#f87171", lineHeight: 1.6 }}>
          {msg}
        </div>
      )}

      <button onClick={createUser} disabled={saving || !email || pw.length < 6}
        style={{ background: (email && pw.length >= 6) ? tG : "rgba(51,65,85,0.3)", border: "none", borderRadius: 10, padding: "12px 24px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: (saving || !email || pw.length < 6) ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 6, opacity: saving ? 0.7 : 1 }}>
        {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        {saving ? "Création..." : "Créer et autoriser"}
      </button>
    </div>
  );
}
// ── LINKS ED — أضف هذه الدالة في admin/page.tsx قبل const NAV ──────────────
