"use client";

import { supabase } from "@/app/supabase";
import { motion } from "framer-motion";
import {
CircleAlert,
ChevronDown,
ChevronUp,
FileSpreadsheet,
FileText,
PhoneCall,
UserCheck,
Printer,
ShoppingBag,
Trash2,
X
} from "lucide-react";
import { useEffect,useState } from "react";
import { AdminIconButton } from "../shared/AdminIconButton";
import { createNotification } from "../../services/notification.service";
import { ms,teal } from "../../styles";
import type { Order,OrderAssignee } from "../../types";

const formatFileDate = () => new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");

const formatDateTime = (value: Date | string) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("fr-DZ", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
};

const escapeHtml = (value: unknown) => String(value ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#039;");

const loadImageAsDataUrl = async (url: string) => {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === "string" ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

export function OrdersEd({ dark }: { dark: boolean }) {
  const s = ms(dark);
  const [orders, setOrders] = useState<Order[]>([]);
  const [assignees, setAssignees] = useState<OrderAssignee[]>([]);
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [assignmentFilter, setAssignmentFilter] = useState("all");
  const [selected, setSelected] = useState<Order | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Order | null>(null);
  const [notice, setNotice] = useState<{ text: string; ok: boolean } | null>(null);

  const notify = (text: string, ok = true) => {
    setNotice({ text, ok });
    setTimeout(() => setNotice(null), 3500);
  };
  
  const loadOrders = async () => {
    setLoading(true);
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setOrders(data ?? []);
    setLoading(false);
  };

  const loadAssignees = async () => {
    const { data } = await supabase.from("order_assignees").select("*").order("name");
    setAssignees((data ?? []) as OrderAssignee[]);
  };
  
  useEffect(() => {
    void Promise.resolve().then(async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUserEmail(data.user?.email ?? "");
      await Promise.all([loadOrders(), loadAssignees()]);
    });
  }, []);
  
  const updateStatus = async (id: number, status: string) => {
    const previousOrder = orders.find(order => order.id === id);
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (!error) {
      const statusTitle = status === "confirmed"
        ? "Commande confirmée"
        : status === "delivered"
          ? "Commande livrée"
          : status === "cancelled"
            ? "Commande annulée"
            : "Statut de commande modifié";
      const type = status === "confirmed"
        ? "order_confirmed"
        : status === "delivered"
          ? "order_delivered"
          : status === "cancelled"
            ? "order_cancelled"
            : "order_status_changed";
      void createNotification({
        title: statusTitle,
        message: `La commande #${id} est passée de ${getStatusLabel(previousOrder?.status || "new")} à ${getStatusLabel(status)}.`,
        type,
        module: "orders",
        entity_id: id,
        entity_type: "orders"
      });
    }
    loadOrders();
    if (selected?.id === id) setSelected(o => o ? { ...o, status } : null);
  };

  const updateAssignee = async (id: number, assignedTo: string) => {
    const nextAssignedTo = assignedTo || null;
    const nextAssignedAt = nextAssignedTo ? new Date().toISOString() : null;
    const { error } = await supabase
      .from("orders")
      .update({ assigned_to: nextAssignedTo, assigned_at: nextAssignedAt })
      .eq("id", id);

    if (error) {
      notify("Erreur: " + error.message, false);
      return;
    }

    const previousOrder = orders.find(order => order.id === id);
    const previousAssignee = displayAssignee(previousOrder?.assigned_to);
    const nextAssignee = displayAssignee(nextAssignedTo);
    void createNotification({
      title: previousOrder?.assigned_to ? "Responsable de commande modifié" : "Commande assignée",
      message: previousOrder?.assigned_to
        ? `La commande #${id} est passée de ${previousAssignee} à ${nextAssignee}.`
        : `La commande #${id} a été assignée à ${nextAssignee}.`,
      type: previousOrder?.assigned_to ? "order_assignee_changed" : "order_assigned",
      module: "orders",
      entity_id: id,
      entity_type: "orders"
    });
    setOrders(current => current.map(order => order.id === id ? { ...order, assigned_to: nextAssignedTo, assigned_at: nextAssignedAt } : order));
    if (selected?.id === id) setSelected(o => o ? { ...o, assigned_to: nextAssignedTo, assigned_at: nextAssignedAt } : null);
  };
  
  const deleteOrder = async (id: number) => {
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (!error) {
      void createNotification({
        title: "Commande annulée",
        message: `La commande #${id} a été retirée du suivi.`,
        type: "order_cancelled",
        module: "orders",
        entity_id: id,
        entity_type: "orders"
      });
    }
    setPendingDelete(null);
    loadOrders();
    if (selected?.id === id) setSelected(null);
  };
  
  const ST: Record<string, { label: string; color: string; bg: string }> = {
    new: { label: " Nouveau", color: s.warning, bg: s.warningSoft },
    confirmed: { label: " Confirmé", color: s.success, bg: s.successSoft },
    shipped: { label: " Expédié", color: s.primary, bg: s.primarySoft },
    delivered: { label: " Livré", color: s.primary, bg: s.primarySoft },
    cancelled: { label: " Annulée", color: s.error, bg: s.errorSoft }
  };

  const assigneeMatchesValue = (assignee: OrderAssignee | undefined, value?: string | null) => {
    if (!assignee || !value) return false;
    const normalized = value.toLowerCase();
    return normalized === String(assignee.id).toLowerCase()
      || normalized === assignee.name.toLowerCase()
      || (!!assignee.email && normalized === assignee.email.toLowerCase());
  };

  const findAssignee = (value?: string | null) => {
    return assignees.find(assignee => assigneeMatchesValue(assignee, value));
  };

  const displayAssignee = (value?: string | null) => {
    if (!value) return "Non assignée";
    return findAssignee(value)?.name || value.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  };

  const currentAssignee = assignees.find(assignee => !!currentUserEmail && assignee.email?.toLowerCase() === currentUserEmail.toLowerCase());
  const activeAssignees = assignees.filter(assignee => assignee.is_active);

  const handleMine = () => {
    if (currentAssignee) setAssignmentFilter(`assignee:${currentAssignee.id}`);
    else setAssignmentFilter("mine");
  };
  
  const statusFiltered = statusFilter === "all" ? orders : orders.filter(o => o.status === statusFilter);
  const filtered = statusFiltered.filter(order => {
    if (assignmentFilter === "mine") return !!currentUserEmail && !!assignees.find(assignee => assignee.email?.toLowerCase() === currentUserEmail.toLowerCase() && assigneeMatchesValue(assignee, order.assigned_to));
    if (assignmentFilter === "unassigned") return !order.assigned_to;
    if (assignmentFilter.startsWith("assignee:")) return assigneeMatchesValue(assignees.find(assignee => String(assignee.id) === assignmentFilter.slice(9)), order.assigned_to);
    return true;
  });
  const counts = Object.keys(ST).reduce((a, k) => ({ ...a, [k]: orders.filter(o => o.status === k).length }), {} as Record<string, number>);
  const unassignedCount = orders.filter(order => !order.assigned_to).length;

  const getStatusLabel = (status: string) => (ST[status]?.label || status).trim();

  const getFilterLabel = () => {
    const statusLabel = statusFilter === "all" ? "Tous" : getStatusLabel(statusFilter);
    let assignmentLabel = "Toutes les affectations";
    if (assignmentFilter === "mine") assignmentLabel = "Mes commandes";
    else if (assignmentFilter === "unassigned") assignmentLabel = "Non assignées";
    else if (assignmentFilter.startsWith("assignee:")) {
      assignmentLabel = assignees.find(assignee => String(assignee.id) === assignmentFilter.slice(9))?.name || "Responsable";
    }
    return `${statusLabel} / ${assignmentLabel}`;
  };

  const buildOrderRows = () => filtered.map(order => ({
    id: order.id,
    customer: order.customer_name || "",
    phone: order.customer_phone || "",
    address: order.customer_address || "",
    assignedTo: displayAssignee(order.assigned_to),
    status: getStatusLabel(order.status),
    total: Number(order.total) || 0,
    createdAt: order.created_at ? formatDateTime(order.created_at) : ""
  }));

  const formatMoney = (value: number) => `${value.toLocaleString("fr-DZ")} DA`;

  const handleExportPdf = async () => {
    try {
      const [{ jsPDF }, autoTableModule] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable")
      ]);
      const autoTable = autoTableModule.default;
      const rows = buildOrderRows();
      const generatedAt = new Date();
      const filterLabel = getFilterLabel();
      const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
      const logo = await loadImageAsDataUrl("/images/logo.png");

      if (logo) doc.addImage(logo, "PNG", 36, 28, 48, 48);
      doc.setFontSize(18);
      doc.setTextColor(15, 23, 42);
      doc.text("MOD-TECH - Rapport Commandes", logo ? 104 : 36, 42);
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Filtre: ${filterLabel}`, logo ? 104 : 36, 62);
      doc.text(`Nombre de commandes: ${rows.length}`, logo ? 104 : 36, 78);
      doc.text(`Date de generation: ${formatDateTime(generatedAt)}`, logo ? 104 : 36, 94);

      autoTable(doc, {
        startY: 118,
        head: [["Order ID", "Customer", "Phone", "Address", "Assigned To", "Status", "Total", "Created At"]],
        body: rows.map(row => [
          row.id,
          row.customer,
          row.phone,
          row.address,
          row.assignedTo,
          row.status,
          formatMoney(row.total),
          row.createdAt
        ]),
        margin: { left: 24, right: 24 },
        styles: { fontSize: 8, cellPadding: 4, overflow: "linebreak" },
        headStyles: { fillColor: [13, 148, 136], textColor: 255, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        didDrawPage: () => {
          const pageSize = doc.internal.pageSize;
          const pageWidth = pageSize.getWidth();
          const pageHeight = pageSize.getHeight();
          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184);
          doc.text(`MOD-TECH - ${formatDateTime(generatedAt)}`, 24, pageHeight - 18);
          doc.text(`Page ${doc.getNumberOfPages()}`, pageWidth - 64, pageHeight - 18);
        }
      });

      doc.save(`mod-tech-orders-${formatFileDate()}.pdf`);
    } catch (error) {
      notify("Export PDF impossible: " + (error instanceof Error ? error.message : "Erreur inconnue"), false);
    }
  };

  const handleExportExcel = async () => {
    try {
      const XLSX = await import("xlsx");
      const rows = buildOrderRows().map(row => ({
        "Order ID": row.id,
        Customer: row.customer,
        Phone: row.phone,
        Address: row.address,
        "Assigned To": row.assignedTo,
        Status: row.status,
        Total: row.total,
        "Created At": row.createdAt
      }));
      const worksheet = XLSX.utils.json_to_sheet(rows);
      worksheet["!cols"] = [
        { wch: 10 },
        { wch: 24 },
        { wch: 16 },
        { wch: 36 },
        { wch: 20 },
        { wch: 16 },
        { wch: 14 },
        { wch: 20 }
      ];
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
      XLSX.writeFile(workbook, `mod-tech-orders-${formatFileDate()}.xlsx`);
    } catch (error) {
      notify("Export Excel impossible: " + (error instanceof Error ? error.message : "Erreur inconnue"), false);
    }
  };

  const handlePrint = () => {
    const rows = buildOrderRows();
    const generatedAt = new Date();
    const filterLabel = getFilterLabel();
    const printWindow = window.open("", "_blank", "width=1200,height=800");
    if (!printWindow) {
      notify("La fenêtre d'impression a été bloquée.", false);
      return;
    }

    const tableRows = rows.map(row => `
      <tr>
        <td>${escapeHtml(row.id)}</td>
        <td>${escapeHtml(row.customer)}</td>
        <td>${escapeHtml(row.phone)}</td>
        <td>${escapeHtml(row.address)}</td>
        <td>${escapeHtml(row.assignedTo)}</td>
        <td>${escapeHtml(row.status)}</td>
        <td>${escapeHtml(formatMoney(row.total))}</td>
        <td>${escapeHtml(row.createdAt)}</td>
      </tr>
    `).join("");

    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>MOD-TECH - Commandes</title>
          <style>
            * { box-sizing: border-box; }
            body { margin: 0; padding: 28px; color: #0f172a; font-family: Arial, sans-serif; background: #fff; }
            header { display: flex; align-items: center; gap: 16px; margin-bottom: 22px; border-bottom: 2px solid #0d9488; padding-bottom: 14px; }
            img { width: 58px; height: 58px; object-fit: contain; }
            h1 { margin: 0; font-size: 22px; color: #0f172a; }
            p { margin: 4px 0 0; color: #64748b; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; }
            th { background: #0d9488; color: #fff; text-align: left; padding: 8px; border: 1px solid #0f766e; }
            td { padding: 7px 8px; border: 1px solid #dbe4ee; vertical-align: top; }
            tr:nth-child(even) td { background: #f8fafc; }
            @media print {
              body { padding: 18px; }
              table { page-break-inside: auto; }
              tr { page-break-inside: avoid; page-break-after: auto; }
            }
          </style>
        </head>
        <body>
          <header>
            <img src="/images/logo.png" alt="MOD-TECH" onerror="this.style.display='none'" />
            <div>
              <h1>MOD-TECH - Rapport Commandes</h1>
              <p>Filtre: ${escapeHtml(filterLabel)}</p>
              <p>${rows.length} commande${rows.length !== 1 ? "s" : ""}</p>
              <p>Date de generation: ${escapeHtml(formatDateTime(generatedAt))}</p>
            </div>
          </header>
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Assigned To</th>
                <th>Status</th>
                <th>Total</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
          <script>
            window.onload = function() {
              window.focus();
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{
        background: dark ? "rgba(13,148,136,0.06)" : "rgba(13,148,136,0.04)",
        border: "1px solid rgba(13,148,136,0.2)",
        borderRadius: 12,
        padding: "12px 16px",
        fontSize: 13,
        color: s.sub,
        display: "flex",
        alignItems: "center",
        gap: 8
      }}>
        <ShoppingBag className="w-4 h-4" style={{ color: teal }} />
        <span>
          <span style={{ color: teal, fontWeight: 700 }}>{orders.length} commande{orders.length !== 1 ? "s" : ""}</span>
        </span>
      </div>

      {notice && (
        <div style={{
          background: notice.ok ? s.successSoft : s.errorSoft,
          border: "1px solid " + s.brd,
          borderRadius: s.radius.md,
          padding: "10px 16px",
          color: notice.ok ? s.success : s.error,
          fontSize: 13,
          fontWeight: 750
        }}>
          {notice.text}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "minmax(180px, 1fr) auto", gap: 10, alignItems: "end" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 10, color: s.mut, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "monospace" }}>Suivi</span>
          <select
            value={assignmentFilter}
            onChange={e => setAssignmentFilter(e.target.value)}
            style={{
              width: "100%",
              background: s.ibg,
              border: "1px solid " + s.brd,
              borderRadius: 10,
              padding: "10px 12px",
              color: s.tx,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            <option value="all">Toutes les commandes</option>
            <option value="unassigned">Non assignées ({unassignedCount})</option>
            {assignees.map(assignee => (
              <option key={String(assignee.id)} value={`assignee:${assignee.id}`}>{assignee.name}</option>
            ))}
          </select>
        </label>
        <button type="button"
          onClick={handleMine}
          style={{ background: dark ? "rgba(13,148,136,0.15)" : "rgba(13,148,136,0.08)", border: "1px solid rgba(13,148,136,0.35)", borderRadius: 10, padding: "10px 12px", color: teal, fontSize: 12, fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" }}
        >
          Mes commandes
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 8 }}>
        {[["all", " Tous", orders.length, "#64748b"], ...Object.entries(ST).map(([k, v]) => [k, v.label, counts[k] || 0, v.color])].map(([k, l, c, col]) => (
          <button type="button"
            key={k as string}
            onClick={() => setStatusFilter(k as string)}
            style={{
              background: statusFilter === k ? (dark ? "rgba(13,148,136,0.15)" : "rgba(13,148,136,0.08)") : "transparent",
              border: statusFilter === k ? "1px solid rgba(13,148,136,0.4)" : "1px solid " + s.brd,
              borderRadius: 10,
              padding: "10px 6px",
              cursor: "pointer",
              textAlign: "center"
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 800, color: col as string }}>{c as number}</div>
            <div style={{ fontSize: 10, color: s.sub, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{l as string}</div>
          </button>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <AdminIconButton dark={dark} label="Export PDF" onClick={handleExportPdf}>
          <FileText className="w-4 h-4" />
        </AdminIconButton>
        <AdminIconButton dark={dark} label="Export Excel" onClick={handleExportExcel}>
          <FileSpreadsheet className="w-4 h-4" />
        </AdminIconButton>
        <AdminIconButton dark={dark} label="Print" onClick={handlePrint} tone="ghost">
          <Printer className="w-4 h-4" />
        </AdminIconButton>
      </div>
      
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} style={{ background: s.surface, border: "1px solid " + s.brd, borderRadius: s.radius.lg, padding: s.space.sm, boxShadow: s.softShadow }}>
              <div className="admin-skeleton" style={{ width: "18%", height: 18, borderRadius: 999, marginBottom: 14 }} />
              <div className="admin-skeleton" style={{ width: "52%", height: 14, borderRadius: 999, marginBottom: 10 }} />
              <div className="admin-skeleton" style={{ width: "34%", height: 12, borderRadius: 999 }} />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="admin-empty-state">
          <div style={{ width: 52, height: 52, borderRadius: s.radius.lg, background: s.primarySoft, color: s.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div style={{ fontSize: 18, fontWeight: 850, color: s.tx }}>Aucune commande</div>
          <div style={{ maxWidth: 360, fontSize: 13, color: s.sub, lineHeight: 1.6 }}>Aucune commande ne correspond aux filtres actuels.</div>
          <button type="button" onClick={() => { setStatusFilter("all"); setAssignmentFilter("all"); }} style={s.button("primary")}>
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(order => {
            const st = ST[order.status] || ST.new;
            return (
              <motion.div
                className="admin-list-item"
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: s.card,
                  border: "1px solid " + s.brd,
                  borderRadius: 14,
                  overflow: "hidden",
                  cursor: "pointer"
                }}
                onClick={() => setSelected(selected?.id === order.id ? null : order)}
              >
                <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ background: st.bg, borderRadius: 8, padding: "4px 10px", fontSize: 11, fontWeight: 700, color: st.color, whiteSpace: "nowrap" }}>
                    {st.label}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{order.customer_name}</div>
                    <div style={{ fontSize: 12, color: s.sub }}>
                      {order.customer_phone} · {new Date(order.created_at).toLocaleString("fr-DZ")}
                    </div>
                  </div>
                  <div style={{ background: order.assigned_to ? "rgba(13,148,136,0.1)" : s.ci, border: "1px solid " + (order.assigned_to ? "rgba(13,148,136,0.25)" : s.brd), borderRadius: 8, padding: "4px 9px", color: order.assigned_to ? teal : s.sub, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 5, maxWidth: 150, whiteSpace: "nowrap" }}>
                    <UserCheck className="w-3 h-3" />
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{displayAssignee(order.assigned_to)}</span>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: teal, whiteSpace: "nowrap" }}>
                    {order.total.toLocaleString()} DA
                  </div>
                  <div style={{ color: s.sub, fontSize: 16 }}>
                    {selected?.id === order.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
                
                {selected?.id === order.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    style={{ borderTop: "1px solid " + s.brd, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 14 }}
                    onClick={e => e.stopPropagation()}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {order.items.map((item, i) => (
                        <div className="admin-list-item" key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "6px 10px", background: s.ci, border: "1px solid " + s.brd, borderRadius: 8 }}>
                          <span>{item.name} × {item.qty}</span>
                          <span style={{ fontWeight: 700, color: teal }}>{(item.price * item.qty).toLocaleString()} DA</span>
                        </div>
                      ))}
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800, padding: "8px 10px", borderTop: "1px solid " + s.brd }}>
                        <span>Total</span>
                        <span style={{ color: teal }}>{order.total.toLocaleString()} DA</span>
                      </div>
                    </div>

                    <div style={{ background: s.ci, border: "1px solid " + s.brd, borderRadius: 10, padding: "10px 12px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 10, color: s.sub, marginBottom: 3, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Responsable</div>
                        <div style={{ fontSize: 12, color: order.assigned_to ? teal : s.sub, fontWeight: 700 }}>{displayAssignee(order.assigned_to)}</div>
                      </div>
                      <select
                        value={order.assigned_to ?? ""}
                        onChange={e => updateAssignee(order.id, e.target.value)}
                        style={{
                          width: "100%",
                          background: s.ibg,
                          border: "1px solid " + s.brd,
                          borderRadius: 8,
                          padding: "8px 10px",
                          color: s.tx,
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "pointer"
                        }}
                      >
                        <option value="">Non assignée</option>
                        {activeAssignees.map(assignee => (
                          <option key={String(assignee.id)} value={String(assignee.id)}>{assignee.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8, fontSize: 13 }}>
                      {[
                        ["address", order.customer_address],
                        ["email", order.customer_email || "—"],
                        ["phone", order.customer_phone || "—"],
                        ["notes", order.notes || "—"]


                      ].map(([l, v]) => (
                        <div className="admin-list-item" key={l as string} style={{ background: s.ci, border: "1px solid " + s.brd, borderRadius: 8, padding: "8px 12px" }}>
                          <div style={{ fontSize: 10, color: s.sub, marginBottom: 3, fontWeight: 600 }}>{l}</div>
                          <div style={{ color: s.tx }}>{v as string}</div>
                        </div>
                      ))}
                    </div>
                    
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {Object.entries(ST).filter(([k]) => k !== order.status).map(([k, v]) => (
                        <button type="button"
                          key={k}
                          onClick={() => updateStatus(order.id, k)}
                          style={{
                            background: v.bg,
                            borderRadius: 8,
                            border: "none",
                            padding: "6px 12px",
                            color: v.color,
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: "pointer"
                          }}
                        >
                          {v.label}
                        </button>
                      ))}
                      <div style={{ flex: 1 }} />
                      <a
                        href={`tel:${order.customer_phone}`}
                        style={{
                          background: "rgba(16,185,129,0.1)",
                          border: "1px solid rgba(16,185,129,0.3)",
                          borderRadius: 8,
                          padding: "6px 14px",
                          color: "#10b981",
                          fontSize: 12,
                          fontWeight: 700,
                          textDecoration: "none",
                          display: "flex",
                          alignItems: "center",
                          gap: 6
                        }}
                      >
                        <PhoneCall className="w-3 h-3" />
                        Appeler
                      </a>
                      <button type="button"
                        onClick={() => setPendingDelete(order)}
                        style={{
                          background: "rgba(239,68,68,0.08)",
                          border: "1px solid rgba(239,68,68,0.2)",
                          borderRadius: 8,
                          padding: "6px 10px",
                          color: "#f87171",
                          fontSize: 12,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 4
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {pendingDelete && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(7, 22, 20, 0.62)", zIndex: 220, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={() => setPendingDelete(null)}>
          <div style={{ background: s.elevated, border: "1px solid " + s.brd, borderRadius: s.radius.xl, boxShadow: s.shadow, width: "min(460px, 100%)", padding: s.space.md }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: s.radius.lg, background: s.errorSoft, color: s.error, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <CircleAlert className="w-5 h-5" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 850, color: s.tx, marginBottom: 6 }}>Supprimer la commande</div>
                <div style={{ fontSize: 13, color: s.sub, lineHeight: 1.65 }}>Confirmer la suppression de la commande de {pendingDelete.customer_name || "ce client"} ?</div>
              </div>
              <AdminIconButton dark={dark} label="Fermer" onClick={() => setPendingDelete(null)} tone="ghost" size={36}>
                <X className="w-4 h-4" />
              </AdminIconButton>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: s.space.md }}>
              <button type="button" onClick={() => setPendingDelete(null)} style={s.button("outline")}>Annuler</button>
              <button type="button" onClick={() => deleteOrder(pendingDelete.id)} style={s.button("danger")}>
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
