"use client";

import { supabase } from "@/app/supabase";
import {
Check,
Eye,
EyeOff,
Pencil,
Plus,
RefreshCw,
Search,
Trash2,
UserCheck,
Users
} from "lucide-react";
import React,{ useEffect,useState } from "react";
import { createNotification } from "../../services/notification.service";
import { ms } from "../../styles";
import type { Order,OrderAssignee } from "../../types";
import { AdminIconButton } from "../shared/AdminIconButton";

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
  const [assignees, setAssignees] = useState<OrderAssignee[]>([]);
  const [assignedOrders, setAssignedOrders] = useState<Order[]>([]);
  const [assigneeSearch, setAssigneeSearch] = useState("");
  const [addingAssignee, setAddingAssignee] = useState(false);
  const [assigneeName, setAssigneeName] = useState("");
  const [assigneeEmail, setAssigneeEmail] = useState("");
  const [assigneeSaving, setAssigneeSaving] = useState(false);
  const [editingAssignee, setEditingAssignee] = useState<number | string | null>(null);
  const [assigneeDraft, setAssigneeDraft] = useState({ name: "", email: "" });

  const load = async () => {
    const { data } = await supabase.from("admin_users").select("*").order("created_at");
    setUsers(data ?? []);
  };

  const loadAssignees = async () => {
    const [{ data: assigneesData }, { data: ordersData }] = await Promise.all([
      supabase.from("order_assignees").select("*").order("name"),
      supabase.from("orders").select("id,assigned_to")
    ]);
    setAssignees((assigneesData ?? []) as OrderAssignee[]);
    setAssignedOrders((ordersData ?? []) as Order[]);
  };

  useEffect(() => {
    void Promise.resolve().then(async () => {
      await Promise.all([load(), loadAssignees()]);
    });
  }, []);

  const notify = (text: string, ok = true) => {
    setMsg(text); setMsgOk(ok);
    setTimeout(() => setMsg(""), 5000);
  };

  const createUser = async () => {
    if (!email) { notify("Email obligatoire", false); return; }
    if (!pw || pw.length < 6) { notify("Mot de passe min 6 caractères", false); return; }

    setSaving(true);

    // 1 — إنشاء الحساب في Supabase Auth
    const { error: authError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password: pw,
    });

    if (authError && !authError.message.includes("already registered")) {
      notify(authError.message, false);
      setSaving(false);
      return;
    }

    // 2 — إضافة في جدول admin_users تلقائياً
    const { error: dbError } = await supabase
      .from("admin_users")
      .insert([{ email: email.trim().toLowerCase() }]);

    setSaving(false);

    if (dbError) {
      if (dbError.message.includes("duplicate")) notify("Cet email est déjà autorisé", false);
      else notify(dbError.message, false);
    } else {
      void createNotification({
        title: "Utilisateur ajouté",
        message: `${email.trim().toLowerCase()} a été autorisé dans l'administration.`,
        type: "user_created",
        module: "users",
        entity_type: "admin_users"
      });
      notify(`Compte créé et autorisé : ${email}`);
      setEmail(""); setPw("");
      load(); // refresh list
    }
  };

  const deleteUser = async (id: number, userEmail: string) => {
    if (!confirm(`Supprimer l'accès de ${userEmail} ?`)) return;
    setDeleting(id);
    const { error } = await supabase.from("admin_users").delete().eq("id", id);
    if (!error) {
      void createNotification({
        title: "Utilisateur supprimé",
        message: `${userEmail} n'a plus accès à l'administration.`,
        type: "user_deleted",
        module: "users",
        entity_id: id,
        entity_type: "admin_users"
      });
    }
    setDeleting(null);
    load();
  };

  const assigneeMatchesOrder = (assignee: OrderAssignee, assignedTo?: string | null) => {
    if (!assignedTo) return false;
    const normalized = assignedTo.toLowerCase();
    return normalized === String(assignee.id).toLowerCase()
      || normalized === assignee.name.toLowerCase()
      || (!!assignee.email && normalized === assignee.email.toLowerCase());
  };

  const getAssignedCount = (assignee: OrderAssignee) => {
    return assignedOrders.filter(order => assigneeMatchesOrder(assignee, order.assigned_to)).length;
  };

  const createAssignee = async () => {
    if (!assigneeName.trim()) { notify("Nom du responsable obligatoire", false); return; }
    setAssigneeSaving(true);
    const { error } = await supabase.from("order_assignees").insert([{
      name: assigneeName.trim(),
      email: assigneeEmail.trim().toLowerCase() || null,
      is_active: true
    }]);
    setAssigneeSaving(false);
    if (error) {
      notify(error.message, false);
      return;
    }
    setAssigneeName("");
    setAssigneeEmail("");
    setAddingAssignee(false);
    void createNotification({
      title: "Utilisateur ajouté",
      message: `${assigneeName.trim()} a été ajouté comme responsable de commande.`,
      type: "user_created",
      module: "users",
      entity_type: "order_assignees"
    });
    notify("Responsable ajouté");
    loadAssignees();
  };

  const startAssigneeEdit = (assignee: OrderAssignee) => {
    setEditingAssignee(assignee.id);
    setAssigneeDraft({ name: assignee.name, email: assignee.email || "" });
  };

  const saveAssignee = async (assignee: OrderAssignee) => {
    if (!assigneeDraft.name.trim()) { notify("Nom du responsable obligatoire", false); return; }
    const { error } = await supabase
      .from("order_assignees")
      .update({
        name: assigneeDraft.name.trim(),
        email: assigneeDraft.email.trim().toLowerCase() || null,
        updated_at: new Date().toISOString()
      })
      .eq("id", assignee.id);
    if (error) {
      notify(error.message, false);
      return;
    }
    void createNotification({
      title: "Utilisateur modifié",
      message: `${assigneeDraft.name.trim()} a été mis à jour.`,
      type: "user_updated",
      module: "users",
      entity_id: assignee.id,
      entity_type: "order_assignees"
    });
    setEditingAssignee(null);
    notify("Responsable modifié");
    loadAssignees();
  };

  const toggleAssignee = async (assignee: OrderAssignee) => {
    const { error } = await supabase
      .from("order_assignees")
      .update({ is_active: !assignee.is_active, updated_at: new Date().toISOString() })
      .eq("id", assignee.id);
    if (error) {
      notify(error.message, false);
      return;
    }
    void createNotification({
      title: "Utilisateur modifié",
      message: `${assignee.name} est maintenant ${assignee.is_active ? "inactif" : "actif"}.`,
      type: "user_updated",
      module: "users",
      entity_id: assignee.id,
      entity_type: "order_assignees"
    });
    loadAssignees();
  };

  const deleteAssignee = async (assignee: OrderAssignee) => {
    if (!confirm(`Supprimer ${assignee.name} ?`)) return;
    const { error } = await supabase.from("order_assignees").delete().eq("id", assignee.id);
    if (error) {
      notify(error.message, false);
      return;
    }
    void createNotification({
      title: "Utilisateur supprimé",
      message: `${assignee.name} a été supprimé des responsables de commande.`,
      type: "user_deleted",
      module: "users",
      entity_id: assignee.id,
      entity_type: "order_assignees"
    });
    notify("Responsable supprimé");
    loadAssignees();
  };

  const visibleAssignees = assignees.filter(assignee => {
    const q = assigneeSearch.trim().toLowerCase();
    if (!q) return true;
    return assignee.name.toLowerCase().includes(q) || (assignee.email || "").toLowerCase().includes(q);
  });

  const inp: React.CSSProperties = {
    width: "100%", background: s.ibg, border: "1px solid " + s.brd,
    borderRadius: 10, padding: "11px 14px", color: s.tx,
    fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Info */}
      <div style={{ background: s.surface, border: "1px solid " + s.brd, borderRadius: 14, padding: "14px 18px", fontSize: 13, color: s.sub, lineHeight: 1.7 }}>
        <div style={{ color: s.tx, fontWeight: 800, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
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
            <div className="admin-list-item" key={u.id} style={{ display: "flex", alignItems: "center", gap: 12, background: s.surface, border: "1px solid " + s.brd, borderRadius: 14, padding: "14px 18px", flexWrap: "wrap" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: s.hover, display: "flex", alignItems: "center", justifyContent: "center", color: s.tx, fontSize: 13, fontWeight: 800, flexShrink: 0 }}>
                {u.email[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, color: s.tx, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</div>
                <div style={{ fontSize: 12, color: s.sub, marginTop: 2 }}>{new Date(u.created_at).toLocaleDateString("fr-DZ")}</div>
              </div>
              <div style={{ fontSize: 11, fontWeight: 750, color: s.sub, background: s.hover, border: "none", borderRadius: 8, padding: "4px 10px", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 4 }}>
                <Check className="w-3 h-3" />
                Autorisé
              </div>
              <AdminIconButton
                dark={dark}
                label="Supprimer"
                onClick={() => deleteUser(u.id, u.email)}
                disabled={deleting === u.id}
                tone="danger"
                size={30}
              >
                {deleting === u.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
              </AdminIconButton>
            </div>
          ))}
        </div>
      </div>

      <div style={{ borderTop: "1px solid " + s.brd }} />

      {/* Create form */}
      <div style={{ fontSize: 13, fontWeight: 700, color: s.tx, display: "flex", alignItems: "center", gap: 7 }}>
        <Plus className="w-4 h-4" style={{ color: s.sub }} />
        Créer un nouveau compte
      </div>

      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: s.mut, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8, fontFamily: "monospace" }}>Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="nouveau@admin.dz" style={inp} />
      </div>

      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: s.mut, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8, fontFamily: "monospace" }}>Mot de passe</label>
        <div style={{ position: "relative" }}>
          <input type={show ? "text" : "password"} value={pw} onChange={e => setPw(e.target.value)} placeholder="••••••••" style={{ ...inp, paddingRight: 80 }} />
          <button type="button" onClick={() => setShow(!show)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: s.hover, border: "none", cursor: "pointer", color: s.sub, fontSize: 12, padding: "3px 10px", borderRadius: 999 }}>
            {show ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          </button>
        </div>
        {pw && <div style={{ fontSize: 11, color: s.sub, marginTop: 4 }}>{pw.length < 6 ? "Trop court" : pw.length < 10 ? "Moyen" : "Fort"}</div>}
      </div>

      {msg && (
        <div style={{ background: s.hover, border: "1px solid " + s.brd, borderRadius: 10, padding: "10px 16px", fontSize: 13, fontWeight: 600, color: msgOk ? s.tx : s.sub, lineHeight: 1.6 }}>
          {msg}
        </div>
      )}

      <button type="button" onClick={createUser} disabled={saving || !email || pw.length < 6}
        style={s.button("primary", saving || !email || pw.length < 6)}>
        {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        {saving ? "Création..." : "Créer et autoriser"}
      </button>

      <div style={{ borderTop: "1px solid " + s.brd, marginTop: 8 }} />

      <div style={{ background: s.surface, border: "1px solid " + s.brd, borderRadius: 14, padding: "14px 18px", fontSize: 13, color: s.sub, lineHeight: 1.7 }}>
        <div style={{ color: s.tx, fontWeight: 800, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
          <UserCheck className="w-4 h-4" /> Responsables des commandes
        </div>
        Gestion des personnes affichées dans la liste Responsable des commandes.
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button type="button"
          onClick={() => setAddingAssignee(true)}
          style={s.button("primary")}
        >
          <Plus className="w-4 h-4" />
          Ajouter responsable
        </button>
      </div>

      {addingAssignee && (
        <div className="admin-list-item" style={{ background: s.surface, border: "1px solid " + s.brd, borderRadius: s.radius.lg, padding: s.space.sm, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: s.mut, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8, fontFamily: "monospace" }}>Nom</label>
              <input value={assigneeName} onChange={e => setAssigneeName(e.target.value)} placeholder="Nom du responsable" style={inp} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: s.mut, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8, fontFamily: "monospace" }}>Email lié</label>
              <input type="email" value={assigneeEmail} onChange={e => setAssigneeEmail(e.target.value)} placeholder="optionnel@admin.dz" style={inp} />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => {
                setAddingAssignee(false);
                setAssigneeName("");
                setAssigneeEmail("");
              }}
              style={s.button("outline")}
            >
              Annuler
            </button>
            <button type="button"
              onClick={createAssignee}
              disabled={assigneeSaving || !assigneeName.trim()}
              style={s.button("primary", assigneeSaving || !assigneeName.trim())}
            >
              {assigneeSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Créer responsable
            </button>
          </div>
        </div>
      )}

      <div style={{ position: "relative" }}>
        <Search className="w-4 h-4" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: s.sub }} />
        <input value={assigneeSearch} onChange={e => setAssigneeSearch(e.target.value)} placeholder="Rechercher un responsable..." style={{ ...inp, paddingLeft: 38 }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {visibleAssignees.map((assignee) => {
          const isEditing = editingAssignee === assignee.id;
          return (
            <div className="admin-list-item" key={String(assignee.id)} style={{ display: "grid", gridTemplateColumns: "minmax(160px, 1fr) minmax(180px, 1fr) auto auto auto", gap: 8, alignItems: "center", background: s.surface, border: "1px solid " + s.brd, borderRadius: 14, padding: "14px 18px" }}>
              <div>
                {isEditing ? (
                  <input value={assigneeDraft.name} onChange={e => setAssigneeDraft(current => ({ ...current, name: e.target.value }))} style={{ ...inp, padding: "8px 10px" }} />
                ) : (
                  <div style={{ fontSize: 13, color: s.tx, fontWeight: 800 }}>{assignee.name}</div>
                )}
                <div style={{ fontSize: 11, color: s.sub }}>{getAssignedCount(assignee)} commande{getAssignedCount(assignee) !== 1 ? "s" : ""}</div>
              </div>
              <div>
                {isEditing ? (
                  <input value={assigneeDraft.email} onChange={e => setAssigneeDraft(current => ({ ...current, email: e.target.value }))} style={{ ...inp, padding: "8px 10px" }} />
                ) : (
                  <div style={{ fontSize: 12, color: s.sub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{assignee.email || "—"}</div>
                )}
              </div>
              <button type="button" onClick={() => toggleAssignee(assignee)} style={{ background: s.hover, border: "none", borderRadius: 8, color: s.sub, padding: "7px 10px", fontSize: 11, fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" }}>
                {assignee.is_active ? "Actif" : "Inactif"}
              </button>
              <button type="button" onClick={() => isEditing ? saveAssignee(assignee) : startAssigneeEdit(assignee)} style={{ background: s.hover, border: "none", borderRadius: 8, color: s.tx, padding: "7px 9px", cursor: "pointer", display: "flex", alignItems: "center" }}>
                {isEditing ? <Check className="w-3 h-3" /> : <Pencil className="w-3 h-3" />}
              </button>
              <AdminIconButton dark={dark} label="Supprimer" onClick={() => deleteAssignee(assignee)} tone="danger" size={32}>
                <Trash2 className="w-3 h-3" />
              </AdminIconButton>
            </div>
          );
        })}
      </div>
    </div>
  );
}
// ── LINKS ED — أضف هذه الدالة في admin/page.tsx قبل const NAV ──────────────
