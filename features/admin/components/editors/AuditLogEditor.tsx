"use client";

import {
  Activity,
  AlertTriangle,
  ArrowDownUp,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  Package,
  Printer,
  RefreshCw,
  Search,
  ShoppingBag,
  Trash2,
  Truck,
  User,
  Users
} from "lucide-react";
import React,{ useCallback,useEffect,useMemo,useState } from "react";
import { AdminIconButton } from "../shared/AdminIconButton";
import {
  clearAuditLogs,
  fetchAuditLogStats,
  fetchAuditLogs,
  fetchAuditLogsForExport,
  type AuditLogFilters,
  type AuditLogSort
} from "../../services/audit-log.service";
import { ms,teal } from "../../styles";
import type { AuditLog,JsonObject } from "../../types";

const PAGE_SIZE = 15;

const defaultFilters: AuditLogFilters = {
  user: "",
  section: "all",
  action: "all",
  from: "",
  to: "",
  search: ""
};

const sectionLabels: Record<string, string> = {
  products: "Produits",
  orders: "Commandes",
  suppliers: "Fournisseurs",
  users: "Utilisateurs"
};

const operationLabels: Record<string, string> = {
  create: "Ajout",
  update: "Modification",
  delete: "Suppression"
};

const actionLabels: Record<string, string> = {
  product_create: "Ajout produit",
  product_update: "Modification produit",
  product_delete: "Suppression produit",
  product_price_change: "Changement prix",
  product_stock_change: "Modification stock",
  product_toggle: "Activation produit",
  order_create: "Création commande",
  order_confirm: "Confirmation commande",
  order_status_change: "Changement statut",
  order_assign: "Assignation commande",
  order_assignee_change: "Changement responsable",
  order_deliver: "Livraison commande",
  order_cancel: "Annulation commande",
  order_delete: "Suppression commande",
  order_update: "Modification commande",
  supplier_create: "Ajout fournisseur",
  supplier_update: "Modification fournisseur",
  supplier_delete: "Suppression fournisseur",
  supplier_toggle: "Activation fournisseur",
  admin_create: "Ajout admin",
  admin_update: "Modification admin",
  admin_delete: "Suppression admin",
  assignee_create: "Ajout responsable",
  assignee_update: "Modification responsable",
  assignee_toggle: "Activation responsable",
  assignee_delete: "Suppression responsable"
};

const actionColors: Record<string, { color: string; bg: string }> = {
  create: { color: "#10b981", bg: "rgba(16,185,129,0.12)" },
  update: { color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  delete: { color: "#ef4444", bg: "rgba(239,68,68,0.12)" }
};

const statusLabels: Record<string, string> = {
  new: "Nouveau",
  confirmed: "Confirmé",
  shipped: "Expédié",
  delivered: "Livré",
  cancelled: "Annulée"
};

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

const formatFileDate = () => new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");

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

const isRecord = (value: unknown): value is JsonObject => (
  typeof value === "object" && value !== null && !Array.isArray(value)
);

const fieldLabels: Record<string, string> = {
  name: "Produit",
  description: "Description",
  private_note: "Note privée",
  price: "Prix",
  original_price: "Prix original",
  discount_percent: "Remise",
  purchase_price: "Prix d'achat",
  profit_margin: "Marge",
  selling_price: "Prix de vente",
  discounted_price: "Prix remisé",
  stock_quantity: "Stock",
  minimum_stock_alert: "Alerte stock",
  in_stock: "Disponibilité",
  supplier_id: "Fournisseur",
  supplier_reference: "Référence fournisseur",
  sku: "SKU",
  barcode: "Code-barres",
  warranty_months: "Garantie",
  purchase_date: "Date d'achat",
  category: "Catégorie",
  is_active: "Statut",
  sort_order: "Ordre",
  image: "Image",
  images: "Images",
  colors: "Couleurs",
  sizes: "Tailles",
  specs: "Spécifications",
  reference: "Référence",
  customer_name: "Client",
  customer_phone: "Téléphone",
  customer_email: "Email",
  customer_address: "Adresse",
  items: "Produits commandés",
  total: "Total",
  status: "Statut",
  notes: "Notes",
  assigned_to: "Responsable",
  assigned_at: "Date d'assignation",
  phone: "Téléphone",
  email: "Email",
  address: "Adresse",
  website: "Site web"
};

const hiddenDiffFields = new Set(["id", "created_at", "updated_at"]);

const preferredCreateFields: Record<string, string[]> = {
  products: ["name", "price", "stock_quantity", "supplier_id", "category", "is_active"],
  orders: ["customer_name", "customer_phone", "status", "assigned_to", "total", "notes"],
  suppliers: ["name", "phone", "email", "status", "address"],
  users: ["name", "email", "is_active"]
};

const preferredDeleteFields: Record<string, string[]> = {
  products: ["name"],
  orders: ["customer_name", "customer_phone", "status", "assigned_to"],
  suppliers: ["name", "phone", "email"],
  users: ["name", "email"]
};

type AuditChange = {
  key: string;
  field: string;
  before: string;
  after: string;
};

type AuditExportRow = {
  date: string;
  sectionKey: string;
  section: string;
  item: string;
  user: string;
  operation: string;
  field: string;
  before: string;
  after: string;
  description: string;
};

type AuditExportGroup = {
  key: string;
  title: string;
  rows: AuditExportRow[];
};

const stringFrom = (value: unknown) => {
  if (value === null || value === undefined) return "";
  return String(value);
};

const fieldFrom = (data: JsonObject, key: string) => stringFrom(data[key]);

const statusLabel = (value: string) => statusLabels[value] || value;

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "Oui" : "Non";
  if (typeof value === "number") return new Intl.NumberFormat("fr-DZ").format(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return "-";
    return value.map(item => {
      if (!isRecord(item)) return formatValue(item);
      const name = stringFrom(item.name) || stringFrom(item.title) || stringFrom(item.id) || "Produit";
      const qty = item.qty ?? item.quantity;
      const price = item.price;
      return [
        name,
        qty !== undefined ? `x${formatValue(qty)}` : "",
        price !== undefined ? formatCurrency(price) : ""
      ].filter(Boolean).join(" ");
    }).join(", ");
  }
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
};

const formatCurrency = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return "-";
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return formatValue(value);
  return `${new Intl.NumberFormat("fr-DZ").format(numberValue)} DA`;
};

const normalizeComparable = (value: unknown) => JSON.stringify(value ?? null);

const fieldLabel = (key: string) => fieldLabels[key] || key
  .replace(/_/g, " ")
  .replace(/\b\w/g, letter => letter.toUpperCase());

const isPriceField = (key: string) => (
  key.includes("price") || key === "total"
);

const formatDiffValue = (log: AuditLog, key: string, value: unknown, side: "before" | "after") => {
  if (key === "status") {
    const details = isRecord(log.details) ? log.details : {};
    const detailKey = side === "before" ? "previousStatusLabel" : "currentStatusLabel";
    return fieldFrom(details, detailKey) || statusLabel(stringFrom(value)) || "-";
  }
  if (key === "assigned_to") {
    const details = isRecord(log.details) ? log.details : {};
    const detailKey = side === "before" ? "previousAssignee" : "currentAssignee";
    return fieldFrom(details, detailKey) || formatValue(value);
  }
  if (key === "supplier_id") return formatValue(value);
  if (isPriceField(key)) return formatCurrency(value);
  return formatValue(value);
};

const getMeaningfulKeys = (log: AuditLog, data: JsonObject, preferredFields: Record<string, string[]>) => {
  const preferred = preferredFields[log.section] || [];
  const keys = [
    ...preferred.filter(key => Object.prototype.hasOwnProperty.call(data, key)),
    ...Object.keys(data).filter(key => !preferred.includes(key))
  ];
  return keys.filter(key => !hiddenDiffFields.has(key) && formatValue(data[key]) !== "-");
};

const changedFields = (log: AuditLog): AuditChange[] => {
  const oldData = isRecord(log.old_data) ? log.old_data : {};
  const newData = isRecord(log.new_data) ? log.new_data : {};

  if (log.operation_type === "create") {
    return getMeaningfulKeys(log, newData, preferredCreateFields).map(key => ({
      key,
      field: fieldLabel(key),
      before: "-",
      after: formatDiffValue(log, key, newData[key], "after")
    }));
  }

  if (log.operation_type === "delete") {
    const keys = getMeaningfulKeys(log, oldData, preferredDeleteFields);
    const deleteLabel = actionLabels[log.action] || operationLabels.delete || "Suppression";
    if (keys.length === 0 && log.item_name) {
      return [{ key: "item", field: "Élément", before: log.item_name, after: deleteLabel }];
    }
    return keys.map((key, index) => ({
      key,
      field: fieldLabel(key),
      before: formatDiffValue(log, key, oldData[key], "before"),
      after: index === 0 ? deleteLabel : "-"
    }));
  }

  const oldRecord = isRecord(oldData) ? oldData : {};
  const newRecord = isRecord(newData) ? newData : {};
  const keys = Array.from(new Set([...Object.keys(oldRecord), ...Object.keys(newRecord)]));
  return keys
    .filter(key => !hiddenDiffFields.has(key))
    .filter(key => normalizeComparable(oldRecord[key]) !== normalizeComparable(newRecord[key]))
    .map(key => ({
      key,
      field: fieldLabel(key),
      before: formatDiffValue(log, key, oldRecord[key], "before"),
      after: formatDiffValue(log, key, newRecord[key], "after")
    }));
};

const sectionIcon = (section: string) => {
  if (section === "products") return <Package className="w-4 h-4" />;
  if (section === "orders") return <ShoppingBag className="w-4 h-4" />;
  if (section === "suppliers") return <Truck className="w-4 h-4" />;
  return <Users className="w-4 h-4" />;
};

const sectionOrder = ["products", "orders", "suppliers", "users"];

const groupExportRows = (rows: AuditExportRow[]): AuditExportGroup[] => {
  const grouped = rows.reduce((acc, row) => {
    if (!acc[row.sectionKey]) acc[row.sectionKey] = [];
    acc[row.sectionKey].push(row);
    return acc;
  }, {} as Record<string, AuditExportRow[]>);

  return Object.entries(grouped)
    .sort(([a], [b]) => {
      const aIndex = sectionOrder.indexOf(a);
      const bIndex = sectionOrder.indexOf(b);
      if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    })
    .map(([key, groupRows]) => ({
      key,
      title: sectionLabels[key] || key,
      rows: groupRows
    }));
};

const safeSheetName = (name: string, usedNames: Set<string>) => {
  const base = (name || "Module")
    .replace(/[\[\]:*?/\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 28) || "Module";
  let candidate = base;
  let index = 2;
  while (usedNames.has(candidate)) {
    const suffix = ` ${index}`;
    candidate = `${base.slice(0, 31 - suffix.length)}${suffix}`;
    index += 1;
  }
  usedNames.add(candidate);
  return candidate;
};

export function AuditLogEd({ dark }: { dark: boolean }) {
  const s = ms(dark);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [statsRows, setStatsRows] = useState<Pick<AuditLog, "created_at" | "user_email" | "section" | "operation_type">[]>([]);
  const [filters, setFilters] = useState<AuditLogFilters>(defaultFilters);
  const [sort, setSort] = useState<AuditLogSort>({ field: "created_at", ascending: false });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [cleanupOpen, setCleanupOpen] = useState(false);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [selected, setSelected] = useState<AuditLog | null>(null);
  const [notice, setNotice] = useState<{ text: string; ok: boolean } | null>(null);

  const notify = (text: string, ok = true) => {
    setNotice({ text, ok });
    setTimeout(() => setNotice(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data, error, count }, statsResult] = await Promise.all([
      fetchAuditLogs(filters, sort, page, PAGE_SIZE),
      fetchAuditLogStats(filters)
    ]);

    if (error || statsResult.error) {
      notify((error || statsResult.error)?.message || "Erreur lors du chargement", false);
    } else {
      setLogs(data);
      setTotal(count);
      setStatsRows(statsResult.data);
    }

    setLoading(false);
  }, [filters, page, sort]);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const stats = useMemo(() => {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfToday.getDate() - 6);
    const daily = statsRows.filter(row => new Date(row.created_at) >= startOfToday).length;
    const weekly = statsRows.filter(row => new Date(row.created_at) >= startOfWeek).length;
    const usersCount = statsRows.reduce((acc, row) => {
      const key = row.user_email || "system";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const sectionsCount = statsRows.reduce((acc, row) => {
      const key = row.section || "unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topUser = Object.entries(usersCount).sort((a, b) => b[1] - a[1])[0];
    const topSection = Object.entries(sectionsCount).sort((a, b) => b[1] - a[1])[0];
    return {
      daily,
      weekly,
      topUser: topUser ? `${topUser[0]} (${topUser[1]})` : "-",
      topSection: topSection ? `${sectionLabels[topSection[0]] || topSection[0]} (${topSection[1]})` : "-"
    };
  }, [statsRows]);

  const setFilter = <K extends keyof AuditLogFilters>(key: K, value: AuditLogFilters[K]) => {
    setFilters(current => ({ ...current, [key]: value }));
    setPage(1);
  };

  const updateSort = (field: AuditLogSort["field"]) => {
    setSort(current => (
      current.field === field
        ? { ...current, ascending: !current.ascending }
        : { field, ascending: field === "created_at" ? false : true }
    ));
    setPage(1);
  };

  const buildRows = (rows: AuditLog[]): AuditExportRow[] => rows.flatMap(row => {
    const changes = changedFields(row);
    const metadata = {
      date: formatDateTime(row.created_at),
      sectionKey: row.section,
      section: sectionLabels[row.section] || row.section,
      item: `${row.item_name || "-"}${row.item_id ? ` #${row.item_id}` : ""}`,
      user: row.user_email || "system",
      operation: actionLabels[row.action] || operationLabels[row.operation_type] || row.action,
      description: row.description || ""
    };

    if (changes.length === 0) {
      return [{
        ...metadata,
        field: "Aucune différence",
        before: "-",
        after: "-"
      }];
    }

    return changes.map(change => ({
      ...metadata,
      field: change.field,
      before: change.before,
      after: change.after
    }));
  });

  const getExportRows = async () => {
    setExporting(true);
    const { data, error } = await fetchAuditLogsForExport(filters, sort);
    setExporting(false);
    if (error) {
      notify("Export impossible: " + error.message, false);
      return null;
    }
    return buildRows(data);
  };

  const handleExportPdf = async () => {
    const rows = await getExportRows();
    if (!rows) return;
    if (rows.length === 0) {
      notify("Aucune donnée à exporter pour ces filtres.", false);
      return;
    }
    try {
      const [{ jsPDF }, autoTableModule] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable")
      ]);
      const autoTable = autoTableModule.default;
      const generatedAt = new Date();
      const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
      const logo = await loadImageAsDataUrl("/images/logo.png");
      const groups = groupExportRows(rows);
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = { left: 24, right: 24 };

      if (logo) doc.addImage(logo, "PNG", 36, 28, 48, 48);
      doc.setFontSize(18);
      doc.setTextColor(15, 23, 42);
      doc.text("MOD-TECH - Journal des opérations", logo ? 104 : 36, 42);
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Nombre de lignes detaillees: ${rows.length}`, logo ? 104 : 36, 62);
      doc.text(`Date de generation: ${formatDateTime(generatedAt)}`, logo ? 104 : 36, 78);

      let startY = 116;
      groups.forEach((group, index) => {
        if (index > 0 && startY > pageHeight - 120) {
          doc.addPage();
          startY = 48;
        }

        doc.setFontSize(13);
        doc.setTextColor(15, 23, 42);
        doc.text(`${group.title} (${group.rows.length})`, margin.left, startY);

        autoTable(doc, {
          startY: startY + 12,
          head: [[
            "Date",
            "Utilisateur",
            "Action",
            "Element",
            "Champ",
            "Avant",
            "Apres",
            "Details"
          ]],
          body: group.rows.map(row => [
            row.date,
            row.user,
            row.operation,
            row.item,
            row.field,
            row.before,
            row.after,
            row.description
          ]),
          margin,
          styles: { fontSize: 7, cellPadding: 3, overflow: "linebreak" },
          headStyles: { fillColor: [13, 148, 136], textColor: 255, fontStyle: "bold" },
          alternateRowStyles: { fillColor: [248, 250, 252] },
          didDrawPage: () => {
            doc.setFontSize(8);
            doc.setTextColor(100, 116, 139);
            doc.text("MOD-TECH - Journal des opérations", margin.left, pageHeight - 18);
          }
        });

        const tableEndY = (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY;
        startY = (tableEndY ?? startY) + 28;
      });

      const totalPages = doc.getNumberOfPages();
      for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
        doc.setPage(pageNumber);
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(`Page ${pageNumber} / ${totalPages}`, pageWidth - margin.right, pageHeight - 18, { align: "right" });
      }

      doc.save(`mod-tech-audit-log-${formatFileDate()}.pdf`);
      notify("Export PDF généré");
    } catch (error) {
      notify("Export PDF impossible: " + (error instanceof Error ? error.message : "Erreur inconnue"), false);
    }
  };

  const handleExportExcel = async () => {
    const rows = await getExportRows();
    if (!rows) return;
    if (rows.length === 0) {
      notify("Aucune donnée à exporter pour ces filtres.", false);
      return;
    }
    try {
      const XLSX = await import("xlsx");
      const workbook = XLSX.utils.book_new();
      const usedSheetNames = new Set<string>();
      const groups = groupExportRows(rows);

      groups.forEach(group => {
        const sheetRows = [
          [`MOD-TECH - Journal des opérations`],
          [`Module: ${group.title}`],
          [`Date de génération: ${formatDateTime(new Date())}`],
          [`Nombre de lignes: ${group.rows.length}`],
          [],
          ["Date", "Utilisateur", "Action", "Élément", "Champ", "Avant", "Après", "Détails"],
          ...group.rows.map(row => [
            row.date,
            row.user,
            row.operation,
            row.item,
            row.field,
            row.before,
            row.after,
            row.description
          ])
        ];
        const worksheet = XLSX.utils.aoa_to_sheet(sheetRows);
        worksheet["!cols"] = [
          { wch: 20 },
          { wch: 28 },
          { wch: 22 },
          { wch: 30 },
          { wch: 22 },
          { wch: 30 },
          { wch: 30 },
          { wch: 52 }
        ];
        worksheet["!merges"] = [
          { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
          { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } },
          { s: { r: 2, c: 0 }, e: { r: 2, c: 7 } },
          { s: { r: 3, c: 0 }, e: { r: 3, c: 7 } }
        ];
        worksheet["!autofilter"] = {
          ref: `A6:H${sheetRows.length}`
        };
        XLSX.utils.book_append_sheet(workbook, worksheet, safeSheetName(group.title, usedSheetNames));
      });

      XLSX.writeFile(workbook, `mod-tech-audit-log-${formatFileDate()}.xlsx`);
      notify("Export Excel généré");
    } catch (error) {
      notify("Export Excel impossible: " + (error instanceof Error ? error.message : "Erreur inconnue"), false);
    }
  };

  const handlePrint = async () => {
    const rows = await getExportRows();
    if (!rows) return;
    if (rows.length === 0) {
      notify("Aucune donnée à imprimer pour ces filtres.", false);
      return;
    }
    const printWindow = window.open("", "_blank", "width=1200,height=800");
    if (!printWindow) {
      notify("La fenêtre d'impression a été bloquée.", false);
      return;
    }

    const sectionsHtml = groupExportRows(rows).map(group => `
      <section>
        <h2>${escapeHtml(group.title)} <span>${group.rows.length}</span></h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Utilisateur</th>
              <th>Type opération</th>
              <th>Élément</th>
              <th>Champ</th>
              <th>Avant</th>
              <th>Après</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            ${group.rows.map(row => `
              <tr>
                <td>${escapeHtml(row.date)}</td>
                <td>${escapeHtml(row.user)}</td>
                <td>${escapeHtml(row.operation)}</td>
                <td>${escapeHtml(row.item)}</td>
                <td>${escapeHtml(row.field)}</td>
                <td class="before">${escapeHtml(row.before)}</td>
                <td class="after">${escapeHtml(row.after)}</td>
                <td>${escapeHtml(row.description)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </section>
    `).join("");

    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>MOD-TECH - Journal des operations</title>
          <style>
            * { box-sizing: border-box; }
            body { margin: 0; padding: 28px; color: #0f172a; font-family: Arial, sans-serif; background: #fff; }
            header { display: flex; align-items: center; gap: 16px; margin-bottom: 22px; border-bottom: 2px solid #0d9488; padding-bottom: 14px; }
            img { width: 58px; height: 58px; object-fit: contain; }
            h1 { margin: 0; font-size: 22px; }
            p { margin: 4px 0 0; color: #64748b; font-size: 12px; }
            section { break-inside: avoid; margin-top: 22px; }
            h2 { margin: 0 0 8px; color: #0f172a; font-size: 16px; }
            h2 span { color: #64748b; font-size: 12px; font-weight: 700; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; }
            th { background: #0d9488; color: #fff; text-align: left; padding: 8px; border: 1px solid #0f766e; }
            td { padding: 7px 8px; border: 1px solid #dbe4ee; vertical-align: top; }
            .before { color: #b91c1c; font-weight: 700; }
            .after { color: #047857; font-weight: 700; }
            tr:nth-child(even) td { background: #f8fafc; }
          </style>
        </head>
        <body>
          <header>
            <img src="/images/logo.png" alt="MOD-TECH" onerror="this.style.display='none'" />
            <div>
              <h1>MOD-TECH - Journal des opérations</h1>
              <p>${rows.length} ligne${rows.length !== 1 ? "s" : ""} détaillée${rows.length !== 1 ? "s" : ""}</p>
              <p>Date de generation: ${escapeHtml(formatDateTime(new Date()))}</p>
            </div>
          </header>
          ${sectionsHtml}
          <script>window.onload = function() { window.focus(); window.print(); };</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleCleanupConfirm = async () => {
    if (cleanupLoading) return;
    setCleanupLoading(true);

    const { error, count } = await clearAuditLogs();
    setCleanupLoading(false);

    if (error) {
      notify("Nettoyage impossible: " + error.message, false);
      return;
    }

    setSelected(null);
    setCleanupOpen(false);
    notify(`${count} enregistrement${count !== 1 ? "s" : ""} supprimé${count !== 1 ? "s" : ""}.`);

    if (page === 1) {
      await load();
    } else {
      setPage(1);
    }
  };

  const selectedChanges = selected ? changedFields(selected) : [];

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: s.ibg,
    border: "1px solid " + s.brd,
    borderRadius: 10,
    padding: "10px 12px",
    color: s.tx,
    fontSize: 13,
    outline: "none",
    fontFamily: "inherit"
  };

  const buttonStyle: React.CSSProperties = {
    background: dark ? "rgba(13,148,136,0.15)" : "rgba(13,148,136,0.08)",
    border: "1px solid rgba(13,148,136,0.3)",
    borderRadius: 9,
    padding: "9px 13px",
    color: teal,
    fontSize: 12,
    fontWeight: 800,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 6
  };

  const sortButton = (field: AuditLogSort["field"], label: string) => (
    <button
      type="button"
      onClick={() => updateSort(field)}
      style={{ background: "transparent", border: "none", color: "inherit", font: "inherit", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}
    >
      {label}
      <ArrowDownUp className="w-3 h-3" style={{ opacity: sort.field === field ? 1 : 0.35 }} />
    </button>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
        {[
          { label: "Aujourd'hui", value: stats.daily, icon: <Clock className="w-4 h-4" />, color: teal },
          { label: "7 derniers jours", value: stats.weekly, icon: <CalendarDays className="w-4 h-4" />, color: "#3b82f6" },
          { label: "Utilisateur actif", value: stats.topUser, icon: <User className="w-4 h-4" />, color: "#8b5cf6" },
          { label: "Section active", value: stats.topSection, icon: <Activity className="w-4 h-4" />, color: "#f59e0b" }
        ].map(card => (
          <div key={card.label} style={{ background: s.card, border: "1px solid " + s.brd, borderRadius: 12, padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: card.color, marginBottom: 8 }}>
              {card.icon}
              <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>{card.label}</span>
            </div>
            <div style={{ fontSize: typeof card.value === "number" ? 26 : 14, fontWeight: 900, color: s.tx, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{card.value}</div>
          </div>
        ))}
      </div>

      {notice && (
        <div style={{ background: notice.ok ? "rgba(52,211,153,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${notice.ok ? "rgba(52,211,153,0.25)" : "rgba(239,68,68,0.25)"}`, borderRadius: 10, padding: "10px 14px", color: notice.ok ? "#34d399" : "#f87171", fontSize: 13, fontWeight: 700 }}>
          {notice.text}
        </div>
      )}

      <div style={{ background: s.card, border: "1px solid " + s.brd, borderRadius: 12, padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: teal, fontSize: 13, fontWeight: 800 }}>
            <Filter className="w-4 h-4" />
            Filtres avancés
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <AdminIconButton dark={dark} label="Export PDF" onClick={handleExportPdf} disabled={exporting}>
              <FileText className="w-4 h-4" />
            </AdminIconButton>
            <AdminIconButton dark={dark} label="Export Excel" onClick={handleExportExcel} disabled={exporting}>
              <FileSpreadsheet className="w-4 h-4" />
            </AdminIconButton>
            <AdminIconButton dark={dark} label="Print" onClick={handlePrint} disabled={exporting} tone="ghost">
              <Printer className="w-4 h-4" />
            </AdminIconButton>
            <AdminIconButton
              dark={dark}
              label="Clear Audit Log"
              onClick={() => setCleanupOpen(true)}
              disabled={cleanupLoading || exporting}
              tone="danger"
            >
              {cleanupLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </AdminIconButton>
            <AdminIconButton dark={dark} label="Actualiser" onClick={load}>
              <RefreshCw className="w-4 h-4" />
            </AdminIconButton>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
          <input value={filters.user} onChange={e => setFilter("user", e.target.value)} placeholder="Utilisateur" style={inputStyle} />
          <select value={filters.section} onChange={e => setFilter("section", e.target.value)} style={inputStyle}>
            <option value="all">Toutes les sections</option>
            {Object.entries(sectionLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <select value={filters.action} onChange={e => setFilter("action", e.target.value)} style={inputStyle}>
            <option value="all">Toutes les opérations</option>
            <option value="create">Ajout</option>
            <option value="update">Modification</option>
            <option value="delete">Suppression</option>
          </select>
          <input type="date" value={filters.from} onChange={e => setFilter("from", e.target.value)} style={inputStyle} />
          <input type="date" value={filters.to} onChange={e => setFilter("to", e.target.value)} style={inputStyle} />
          <div style={{ position: "relative" }}>
            <Search className="w-4 h-4" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: s.sub }} />
            <input value={filters.search} onChange={e => setFilter("search", e.target.value)} placeholder="Recherche rapide..." style={{ ...inputStyle, paddingLeft: 38 }} />
          </div>
        </div>
      </div>

      <div style={{ background: s.card, border: "1px solid " + s.brd, borderRadius: 12, overflow: "hidden" }}>
        {loading ? (
          <div style={{ minHeight: 240, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, color: s.sub }}>
            <RefreshCw className="w-5 h-5 animate-spin" style={{ color: teal }} />
            Chargement du journal...
          </div>
        ) : logs.length === 0 ? (
          <div style={{ minHeight: 220, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10, color: s.sub }}>
            <Download className="w-10 h-10" style={{ color: s.mut }} />
            Aucun enregistrement pour ces filtres
          </div>
        ) : (
          <div style={{ overflowX: "auto", maxHeight: 620 }}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, minWidth: 860 }}>
              <thead style={{ position: "sticky", top: 0, zIndex: 2 }}>
                <tr style={{ background: dark ? "#1f2937" : "#f8fafc", color: s.sub }}>
                  <th style={{ padding: "12px 14px", textAlign: "left", borderBottom: "1px solid " + s.brd }}>{sortButton("created_at", "Date")}</th>
                  <th style={{ padding: "12px 14px", textAlign: "left", borderBottom: "1px solid " + s.brd }}>{sortButton("user_email", "Utilisateur")}</th>
                  <th style={{ padding: "12px 14px", textAlign: "left", borderBottom: "1px solid " + s.brd }}>{sortButton("section", "Section")}</th>
                  <th style={{ padding: "12px 14px", textAlign: "left", borderBottom: "1px solid " + s.brd }}>{sortButton("action", "Opération")}</th>
                  <th style={{ padding: "12px 14px", textAlign: "left", borderBottom: "1px solid " + s.brd }}>{sortButton("item_name", "Élément")}</th>
                  <th style={{ padding: "12px 14px", textAlign: "left", borderBottom: "1px solid " + s.brd }}>Description</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => {
                  const actionStyle = actionColors[log.operation_type] || actionColors.update;
                  return (
                    <tr className="admin-list-item" key={log.id} onClick={() => setSelected(log)} style={{ cursor: "pointer", background: selected?.id === log.id ? (dark ? "rgba(13,148,136,0.12)" : "rgba(13,148,136,0.06)") : "transparent" }}>
                      <td style={{ padding: "12px 14px", borderBottom: "1px solid " + s.brd, fontSize: 12, color: s.sub, whiteSpace: "nowrap" }}>{formatDateTime(log.created_at)}</td>
                      <td style={{ padding: "12px 14px", borderBottom: "1px solid " + s.brd, fontSize: 12, color: s.tx, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.user_email || "system"}</td>
                      <td style={{ padding: "12px 14px", borderBottom: "1px solid " + s.brd }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: teal, fontWeight: 800 }}>
                          {sectionIcon(log.section)}
                          {sectionLabels[log.section] || log.section}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px", borderBottom: "1px solid " + s.brd }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 999, padding: "4px 9px", background: actionStyle.bg, color: actionStyle.color, fontSize: 11, fontWeight: 800 }}>
                          {log.operation_type === "delete" ? <Trash2 className="w-3 h-3" /> : <Activity className="w-3 h-3" />}
                          {actionLabels[log.action] || operationLabels[log.operation_type] || log.action}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px", borderBottom: "1px solid " + s.brd, fontSize: 12, color: s.tx, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {log.item_name || "-"} {log.item_id ? <span style={{ color: s.sub }}>#{log.item_id}</span> : null}
                      </td>
                      <td style={{ padding: "12px 14px", borderBottom: "1px solid " + s.brd, fontSize: 12, color: s.sub }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.description || "-"}</span>
                          <Eye className="w-4 h-4" style={{ color: teal, flexShrink: 0 }} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, borderTop: "1px solid " + s.brd, flexWrap: "wrap" }}>
          <div style={{ fontSize: 12, color: s.sub }}>
            {total} opération{total !== 1 ? "s" : ""} · Page {page}/{totalPages}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button type="button" onClick={() => setPage(current => Math.max(1, current - 1))} disabled={page <= 1} style={{ ...buttonStyle, opacity: page <= 1 ? 0.45 : 1 }}>
              <ChevronLeft className="w-4 h-4" /> Précédent
            </button>
            <button type="button" onClick={() => setPage(current => Math.min(totalPages, current + 1))} disabled={page >= totalPages} style={{ ...buttonStyle, opacity: page >= totalPages ? 0.45 : 1 }}>
              Suivant <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {cleanupOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.62)", zIndex: 210, display: "flex", alignItems: "center", justifyContent: "center", padding: 18 }} onClick={() => !cleanupLoading && setCleanupOpen(false)}>
          <div style={{ background: s.card, border: "1px solid " + s.brd, borderRadius: 14, width: "min(520px, 100%)", maxHeight: "88vh", overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.35)" }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: "16px 18px", borderBottom: "1px solid " + s.brd, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(239,68,68,0.12)", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 900, color: s.tx }}>Clear Audit Log</div>
                <div style={{ fontSize: 12, color: s.sub, marginTop: 3 }}>Clear all log records.</div>
              </div>
            </div>

            <div style={{ padding: 18 }}>
              <div style={{ background: dark ? "rgba(239,68,68,0.08)" : "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.22)", borderRadius: 10, padding: 12, color: s.tx, fontSize: 13, lineHeight: 1.6 }}>
                <strong>Clear all audit logs?</strong><br />
                This will permanently delete all Audit Log records.
              </div>
            </div>

            <div style={{ padding: "14px 18px", borderTop: "1px solid " + s.brd, display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => setCleanupOpen(false)}
                disabled={cleanupLoading}
                style={{ ...buttonStyle, background: "transparent", color: s.sub, border: "1px solid " + s.brd, opacity: cleanupLoading ? 0.55 : 1 }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCleanupConfirm}
                disabled={cleanupLoading}
                style={{ ...buttonStyle, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.35)", color: "#ef4444", opacity: cleanupLoading ? 0.65 : 1 }}
              >
                {cleanupLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.62)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 18 }} onClick={() => setSelected(null)}>
          <div style={{ background: s.card, border: "1px solid " + s.brd, borderRadius: 14, width: "min(980px, 100%)", maxHeight: "88vh", overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.35)" }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: "16px 18px", borderBottom: "1px solid " + s.brd, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 900, color: s.tx }}>{actionLabels[selected.action] || selected.action}</div>
                <div style={{ fontSize: 12, color: s.sub, marginTop: 3 }}>{selected.item_name || "-"} {selected.item_id ? `#${selected.item_id}` : ""}</div>
              </div>
              <button type="button" onClick={() => setSelected(null)} style={{ background: "transparent", border: "1px solid " + s.brd, color: s.sub, borderRadius: 8, padding: "7px 10px", cursor: "pointer", fontWeight: 800 }}>Fermer</button>
            </div>

            <div style={{ padding: 18, overflowY: "auto", maxHeight: "calc(88vh - 74px)", display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
                {[
                  ["Utilisateur", selected.user_email || "system"],
                  ["Date", formatDateTime(selected.created_at)],
                  ["Section", sectionLabels[selected.section] || selected.section],
                  ["IP", selected.ip_address || "Non disponible"]
                ].map(([label, value]) => (
                  <div key={label} style={{ background: s.ci, border: "1px solid " + s.brd, borderRadius: 10, padding: 12 }}>
                    <div style={{ fontSize: 10, color: s.sub, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>{label}</div>
                    <div style={{ fontSize: 13, color: s.tx, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</div>
                  </div>
                ))}
              </div>

              <div>
                <div style={{ fontSize: 12, fontWeight: 900, color: s.tx, marginBottom: 8 }}>Détails des changements</div>
                <div style={{ border: "1px solid " + s.brd, borderRadius: 10, overflow: "hidden" }}>
                  {selectedChanges.length === 0 ? (
                    <div style={{ padding: 14, color: s.sub, fontSize: 13 }}>Aucune différence détaillée disponible.</div>
                  ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                      <thead>
                        <tr style={{ background: dark ? "rgba(13,148,136,0.12)" : "rgba(13,148,136,0.08)", color: s.sub }}>
                          <th style={{ padding: 11, textAlign: "left", borderBottom: "1px solid " + s.brd }}>Champ</th>
                          <th style={{ padding: 11, textAlign: "left", borderBottom: "1px solid " + s.brd }}>Avant</th>
                          <th style={{ padding: 11, textAlign: "left", borderBottom: "1px solid " + s.brd }}>Après</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedChanges.map(diff => (
                          <tr key={diff.key}>
                            <td style={{ padding: 11, color: teal, fontWeight: 900, borderBottom: "1px solid " + s.brd, verticalAlign: "top", width: "26%" }}>{diff.field}</td>
                            <td style={{ padding: 11, color: "#f87171", fontWeight: 800, borderBottom: "1px solid " + s.brd, verticalAlign: "top", whiteSpace: "pre-wrap" }}>{diff.before}</td>
                            <td style={{ padding: 11, color: "#34d399", fontWeight: 800, borderBottom: "1px solid " + s.brd, verticalAlign: "top", whiteSpace: "pre-wrap" }}>{diff.after}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
