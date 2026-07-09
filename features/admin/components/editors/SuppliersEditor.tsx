"use client";

import { supabase } from "@/app/supabase";
import {
CircleAlert,
Check,
Pencil,
Plus,
RefreshCw,
Search,
Trash2,
Truck,
X
} from "lucide-react";
import React,{ useEffect,useState } from "react";
import { AdminIconButton } from "../shared/AdminIconButton";
import { createNotification } from "../../services/notification.service";
import { ms } from "../../styles";
import type { Supplier } from "../../types";

const emptySupplier = {
  name: "",
  phone: "",
  email: "",
  address: "",
  website: "",
  notes: ""
};

export function SuppliersEd({ dark }: { dark: boolean }) {
  const s = ms(dark);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState(emptySupplier);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [editDraft, setEditDraft] = useState(emptySupplier);
  const [pendingDelete, setPendingDelete] = useState<Supplier | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgOk, setMsgOk] = useState(true);

  const notify = (text: string, ok = true) => {
    setMsg(text); setMsgOk(ok);
    setTimeout(() => setMsg(""), 3500);
  };

  const load = async () => {
    const { data } = await supabase.from("suppliers").select("*").order("name");
    setSuppliers((data ?? []) as Supplier[]);
  };

  useEffect(() => { void Promise.resolve().then(load); }, []);

  const supplierPayload = (value: typeof emptySupplier, status?: string) => ({
    name: value.name.trim(),
    phone: value.phone.trim() || null,
    email: value.email.trim() || null,
    address: value.address.trim() || null,
    website: value.website.trim() || null,
    notes: value.notes.trim() || null,
    ...(status ? { status } : {}),
    updated_at: new Date().toISOString()
  });

  const createSupplier = async () => {
    if (!draft.name.trim()) { notify("Nom du fournisseur obligatoire", false); return; }
    setSaving(true);
    const { data, error } = await supabase.from("suppliers").insert([{ ...supplierPayload(draft, "active") }]).select("*").single();
    setSaving(false);
    if (error) {
      notify(error.message, false);
      return;
    }
    const supplier = data as Supplier | null;
    void createNotification({
      title: "Fournisseur ajouté",
      message: `${supplier?.name || draft.name.trim()} a été ajouté.`,
      type: "supplier_created",
      module: "suppliers",
      entity_id: supplier?.id ?? null,
      entity_type: "suppliers"
    });
    setDraft(emptySupplier);
    setAdding(false);
    notify("Fournisseur ajouté");
    load();
  };

  const startEdit = (supplier: Supplier) => {
    setEditingId(supplier.id);
    setEditDraft({
      name: supplier.name || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      address: supplier.address || "",
      website: supplier.website || "",
      notes: supplier.notes || ""
    });
  };

  const saveSupplier = async (supplier: Supplier) => {
    if (!editDraft.name.trim()) { notify("Nom du fournisseur obligatoire", false); return; }
    const { error } = await supabase.from("suppliers").update(supplierPayload(editDraft)).eq("id", supplier.id);
    if (error) {
      notify(error.message, false);
      return;
    }
    void createNotification({
      title: "Fournisseur modifié",
      message: `${editDraft.name.trim()} a été mis à jour.`,
      type: "supplier_updated",
      module: "suppliers",
      entity_id: supplier.id,
      entity_type: "suppliers"
    });
    setEditingId(null);
    notify("Fournisseur modifié");
    load();
  };

  const toggleSupplier = async (supplier: Supplier) => {
    const nextStatus = supplier.status === "active" ? "inactive" : "active";
    const { error } = await supabase
      .from("suppliers")
      .update({ status: nextStatus, updated_at: new Date().toISOString() })
      .eq("id", supplier.id);
    if (error) {
      notify(error.message, false);
      return;
    }
    void createNotification({
      title: "Fournisseur modifié",
      message: `${supplier.name} est maintenant ${nextStatus === "active" ? "actif" : "inactif"}.`,
      type: "supplier_updated",
      module: "suppliers",
      entity_id: supplier.id,
      entity_type: "suppliers"
    });
    load();
  };

  const deleteSupplier = async (supplier: Supplier) => {
    const { error } = await supabase.from("suppliers").delete().eq("id", supplier.id);
    if (error) {
      notify(error.message, false);
      return;
    }
    void createNotification({
      title: "Fournisseur supprimé",
      message: `${supplier.name} a été supprimé.`,
      type: "supplier_deleted",
      module: "suppliers",
      entity_id: supplier.id,
      entity_type: "suppliers"
    });
    setPendingDelete(null);
    notify("Fournisseur supprimé");
    load();
  };

  const visibleSuppliers = suppliers.filter(supplier => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [supplier.name, supplier.phone, supplier.email, supplier.address, supplier.website]
      .some(value => String(value || "").toLowerCase().includes(q));
  });

  const inp: React.CSSProperties = {
    ...s.inputStyle,
    width: "100%",
    boxSizing: "border-box",
    fontSize: 13,
  };

  const field = (label: string, key: keyof typeof emptySupplier, value: typeof emptySupplier, setValue: React.Dispatch<React.SetStateAction<typeof emptySupplier>>) => (
    <div>
      <label style={{ ...s.typography.label, color: s.tx, display: "block", marginBottom: 6 }}>{label}</label>
      <input value={value[key]} onChange={e => setValue(current => ({ ...current, [key]: e.target.value }))} style={inp} />
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ background: s.surface, border: "1px solid " + s.brd, borderRadius: s.radius.lg, padding: s.space.sm, fontSize: 13, color: s.sub, lineHeight: 1.7 }}>
        <div style={{ color: s.tx, fontWeight: 850, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
          <Truck className="w-4 h-4" /> Fournisseurs
        </div>
        Gestion centralisée des fournisseurs disponibles dans la fiche produit.
      </div>

      {msg && (
        <div style={{ background: s.hover, border: "1px solid " + s.brd, borderRadius: s.radius.md, padding: "10px 16px", fontSize: 13, fontWeight: 750, color: msgOk ? s.tx : s.sub }}>
          {msg}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button type="button" onClick={() => setAdding(true)} style={s.button("primary")}>
          <Plus className="w-4 h-4" />
          Ajouter fournisseur
        </button>
      </div>

      {adding && (
        <div className="admin-list-item" style={{ background: s.surface, border: "1px solid " + s.brd, borderRadius: s.radius.lg, padding: s.space.sm, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 10 }}>
            {field("Nom *", "name", draft, setDraft)}
            {field("Téléphone", "phone", draft, setDraft)}
            {field("Email", "email", draft, setDraft)}
            {field("Adresse", "address", draft, setDraft)}
            {field("Site web", "website", draft, setDraft)}
          </div>
          <div>
            <label style={{ ...s.typography.label, color: s.tx, display: "block", marginBottom: 6 }}>Notes</label>
            <textarea value={draft.notes} onChange={e => setDraft(current => ({ ...current, notes: e.target.value }))} placeholder="Notes" rows={3} style={{ ...inp, resize: "vertical" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => {
                setAdding(false);
                setDraft(emptySupplier);
              }}
              style={s.button("outline")}
            >
              Annuler
            </button>
            <button type="button" onClick={createSupplier} disabled={saving || !draft.name.trim()} style={s.button("primary", saving || !draft.name.trim())}>
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Créer fournisseur
            </button>
          </div>
        </div>
      )}

      <div style={{ position: "relative" }}>
        <Search className="w-4 h-4" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: s.sub }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un fournisseur..." style={{ ...inp, paddingLeft: 38 }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {visibleSuppliers.length === 0 ? (
          <div className="admin-empty-state">
            <div style={{ width: 52, height: 52, borderRadius: s.radius.lg, background: s.hover, color: s.sub, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Truck className="w-6 h-6" />
            </div>
            <div style={{ fontSize: 18, fontWeight: 850, color: s.tx }}>Aucun fournisseur</div>
            <div style={{ maxWidth: 360, fontSize: 13, color: s.sub, lineHeight: 1.6 }}>Ajoutez un fournisseur pour le rattacher aux fiches produits et centraliser les contacts.</div>
            <button type="button" onClick={() => setAdding(true)} style={s.button("primary")}>
              <Plus className="w-4 h-4" />
              Ajouter fournisseur
            </button>
          </div>
        ) : visibleSuppliers.map(supplier => {
          const isEditing = editingId === supplier.id;
          return (
            <div className="admin-list-item" key={String(supplier.id)} style={{ background: s.surface, border: "1px solid " + s.brd, borderRadius: s.radius.lg, padding: s.space.sm, display: "flex", flexDirection: "column", gap: 10, boxShadow: s.softShadow }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 8, alignItems: "center" }}>
                {isEditing ? (
                  <>
                    <input value={editDraft.name} onChange={e => setEditDraft(current => ({ ...current, name: e.target.value }))} style={inp} />
                    <input value={editDraft.phone} onChange={e => setEditDraft(current => ({ ...current, phone: e.target.value }))} style={inp} />
                  </>
                ) : (
                  <>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: s.tx }}>{supplier.name}</div>
                      <div style={{ fontSize: 11, color: s.sub }}>{supplier.phone || "—"}</div>
                    </div>
                    <div style={{ fontSize: 12, color: s.sub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{supplier.email || supplier.website || "—"}</div>
                  </>
                )}
                <button type="button" onClick={() => toggleSupplier(supplier)} style={{ background: s.hover, border: "none", borderRadius: s.radius.sm, color: s.sub, padding: "8px 10px", fontSize: 11, fontWeight: 850, cursor: "pointer", whiteSpace: "nowrap" }}>
                  {supplier.status === "active" ? "Actif" : "Inactif"}
                </button>
                <AdminIconButton dark={dark} label={isEditing ? "Sauvegarder" : "Modifier"} onClick={() => isEditing ? saveSupplier(supplier) : startEdit(supplier)} tone="primary" size={36}>
                  {isEditing ? <Check className="w-3 h-3" /> : <Pencil className="w-3 h-3" />}
                </AdminIconButton>
                <AdminIconButton dark={dark} label="Supprimer" onClick={() => setPendingDelete(supplier)} tone="danger" size={36}>
                  <Trash2 className="w-3 h-3" />
                </AdminIconButton>
              </div>
              {isEditing && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 8 }}>
                  <input value={editDraft.email} onChange={e => setEditDraft(current => ({ ...current, email: e.target.value }))} placeholder="Email" style={inp} />
                  <input value={editDraft.address} onChange={e => setEditDraft(current => ({ ...current, address: e.target.value }))} placeholder="Adresse" style={inp} />
                  <input value={editDraft.website} onChange={e => setEditDraft(current => ({ ...current, website: e.target.value }))} placeholder="Site web" style={inp} />
                  <input value={editDraft.notes} onChange={e => setEditDraft(current => ({ ...current, notes: e.target.value }))} placeholder="Notes" style={inp} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {pendingDelete && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(7, 22, 20, 0.62)", zIndex: 220, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={() => setPendingDelete(null)}>
          <div style={{ background: s.elevated, border: "1px solid " + s.brd, borderRadius: s.radius.xl, boxShadow: s.shadow, width: "min(440px, 100%)", padding: s.space.md }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: s.radius.lg, background: s.hover, color: s.sub, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <CircleAlert className="w-5 h-5" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 850, color: s.tx, marginBottom: 6 }}>Supprimer le fournisseur</div>
                <div style={{ fontSize: 13, color: s.sub, lineHeight: 1.65 }}>Confirmer la suppression de {pendingDelete.name} ? Cette action supprimera son entrée fournisseur.</div>
              </div>
              <AdminIconButton dark={dark} label="Fermer" onClick={() => setPendingDelete(null)} tone="ghost" size={36}>
                <X className="w-4 h-4" />
              </AdminIconButton>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: s.space.md }}>
              <button type="button" onClick={() => setPendingDelete(null)} style={s.button("outline")}>Annuler</button>
              <button type="button" onClick={() => deleteSupplier(pendingDelete)} style={s.button("danger")}>
                <Trash2 className="w-4 h-4" />
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
