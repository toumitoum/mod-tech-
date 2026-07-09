"use client";

import { supabase } from "@/app/supabase";
import {
Eye,
EyeOff,
RefreshCw,
Save,
Shield
} from "lucide-react";
import React,{ useState } from "react";
import { ms,teal,tG } from "../../styles";

export function SecurityEd({ dark }: { dark: boolean }) {
  const s = ms(dark);
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgOk, setMsgOk] = useState(true);

  const notify = (text: string, ok = true) => {
    setMsg(text); setMsgOk(ok);
    setTimeout(() => setMsg(""), 4000);
  };

  const changePassword = async () => {
    if (!newPw || !confirmPw) { notify("Remplissez tous les champs", false); return; }
    if (newPw.length < 6) { notify("Mot de passe trop court (min 6)", false); return; }
    if (newPw !== confirmPw) { notify("Les mots de passe ne correspondent pas", false); return; }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPw });
    setSaving(false);
    if (error) { notify(error.message, false); }
    else { notify("Mot de passe modifié !"); setNewPw(""); setConfirmPw(""); }
  };

  const inp: React.CSSProperties = {
    width: "100%", background: s.ibg, border: "1px solid " + s.brd,
    borderRadius: 10, padding: "11px 14px", color: s.tx,
    fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ background: dark ? "rgba(13,148,136,0.06)" : "rgba(13,148,136,0.04)", border: "1px solid rgba(13,148,136,0.2)", borderRadius: 12, padding: "14px 18px", fontSize: 13, color: s.sub, display: "flex", alignItems: "center", gap: 8 }}>
        <Shield className="w-4 h-4" style={{ color: teal }} />
        <span>Changer le mot de passe de votre compte admin.</span>
      </div>

      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: s.mut, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8, fontFamily: "monospace" }}>Nouveau mot de passe</label>
        <div style={{ position: "relative" }}>
          <input type={show ? "text" : "password"} value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="••••••••" style={{ ...inp, paddingRight: 80 }} />
          <button type="button" onClick={() => setShow(!show)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "transparent", border: `1px solid ${s.brd}`, cursor: "pointer", color: s.sub, fontSize: 12, padding: "3px 10px", borderRadius: 999 }}>
            {show ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          </button>
        </div>
        {newPw && <div style={{ fontSize: 11, color: s.sub, marginTop: 4 }}>{newPw.length < 6 ? "Trop court" : newPw.length < 10 ? "Moyen" : "Fort"}</div>}
      </div>

      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: s.mut, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8, fontFamily: "monospace" }}>Confirmer le mot de passe</label>
        <input type={show ? "text" : "password"} value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="••••••••" style={{ ...inp, borderColor: confirmPw ? (confirmPw === newPw ? "#10b981" : "#ef4444") : s.brd }} />
        {confirmPw && <div style={{ fontSize: 11, marginTop: 4, color: confirmPw === newPw ? "#10b981" : "#ef4444" }}>{confirmPw === newPw ? "Identiques" : "Ne correspondent pas"}</div>}
      </div>

      {msg && <div style={{ background: msgOk ? "rgba(52,211,153,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${msgOk ? "rgba(52,211,153,0.25)" : "rgba(239,68,68,0.25)"}`, borderRadius: 10, padding: "10px 16px", fontSize: 13, fontWeight: 600, color: msgOk ? "#34d399" : "#f87171" }}>{msg}</div>}

      <button type="button" onClick={changePassword} disabled={saving || !newPw || !confirmPw || newPw !== confirmPw || newPw.length < 6}
        style={{ background: (newPw && confirmPw && newPw === confirmPw && newPw.length >= 6) ? tG : "rgba(51,65,85,0.3)", border: "none", borderRadius: 10, padding: "12px 24px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 6, opacity: saving ? 0.7 : 1 }}>
        {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {saving ? "Modification..." : "Changer le mot de passe"}
      </button>
    </div>
  );
}
// ─── ALLOWED EMAILS — same list as login page ─────────────────────────────
