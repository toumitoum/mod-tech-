"use client";

import { supabase } from "@/app/supabase";
import { motion } from "framer-motion";
import {
AlertTriangle,
ChevronDown,
ChevronUp,
FileSpreadsheet,
FileText,
Pencil,
Eye,
EyeOff,
Image as ImageIcon,
Printer,
Plus,
Palette,
RefreshCw,
Ruler,
Save,
ShoppingBag,
Settings2,
Star,
Trash2,
X,
PackageX
} from "lucide-react";
import { useEffect,useState } from "react";
import { AdminIconButton } from "../shared/AdminIconButton";
import { createNotification } from "../../services/notification.service";
import { uploadSiteImage } from "../../services/storage.service";
import { ms } from "../../styles";
import type { Product,Supplier } from "../../types";

const normalizeStockQuantity = (value: unknown) => Math.max(0, Number(value) || 0);
const normalizeMoney = (value: unknown) => Math.max(0, Number(value) || 0);
const normalizePercent = (value: unknown) => Math.max(0, Number(value) || 0);

const normalizeMinimumStockAlert = (value: unknown) => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};

const isLowStock = (product: Product) => {
  const minimum = normalizeMinimumStockAlert(product.minimum_stock_alert);
  if (minimum === null) return false;
  const quantity = normalizeStockQuantity(product.stock_quantity);
  return quantity > 0 && quantity <= minimum;
};

const getStockAlertState = (product: Product | undefined | null) => {
  if (!product) return "normal";
  const quantity = normalizeStockQuantity(product.stock_quantity);
  if (quantity === 0) return "out";
  if (isLowStock(product)) return "low";
  return "normal";
};

const calculatePricing = (product: Pick<Product, "price" | "original_price" | "discount_percent"> & Partial<Product>) => {
  const purchasePrice = normalizeMoney(product.purchase_price);
  const profitMargin = normalizePercent(product.profit_margin);
  const discountPercent = normalizePercent(product.discount_percent);
  const hasPurchasePricing = purchasePrice > 0;
  const sellingPrice = hasPurchasePricing
    ? purchasePrice + (purchasePrice * profitMargin / 100)
    : normalizeMoney(product.selling_price ?? product.original_price ?? product.price);
  const discountedPrice = hasPurchasePricing
    ? Math.max(0, sellingPrice - (sellingPrice * discountPercent / 100))
    : normalizeMoney(product.discounted_price ?? product.price);

  return {
    purchasePrice,
    profitMargin,
    discountPercent,
    hasPurchasePricing,
    sellingPrice: Math.round(sellingPrice * 100) / 100,
    discountedPrice: Math.round(discountedPrice * 100) / 100
  };
};

const normalizeWarrantyMonths = (value: unknown) => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : null;
};

const formatMoney = (value: number) => `${value.toLocaleString("fr-DZ")} DA`;

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

const getProductCreatedAt = (product: Product) => (
  (product as Product & { created_at?: string | null }).created_at || ""
);

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

export function ProductsEd({ dark }: { dark: boolean }) {
  const s = ms(dark);
  const [products, setProducts] = useState<Product[]>([]);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState<number | null>(null);
  const [expandedProduct, setExpandedProduct] = useState<number | null>(null);
  const [editingProduct, setEditingProduct] = useState<number | null>(null);
  const [draftProduct, setDraftProduct] = useState<Product | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [notice, setNotice] = useState<{ text: string; ok: boolean } | null>(null);
  const [newP, setNewP] = useState({
    name: "",
    description: "",
    price: 0,
    original_price: 0,
    discount_percent: 0,
    purchase_price: 0,
    profit_margin: 0,
    selling_price: 0,
    discounted_price: 0,
    image: "",
    images: [] as string[],
    category: "Caméras",
    sort_order: 1,
    in_stock: true,
    stock_quantity: 0,
    minimum_stock_alert: null as number | null,
    supplier_id: null as number | string | null,
    supplier_reference: "",
    sku: "",
    barcode: "",
    warranty_months: null as number | null,
    purchase_date: "",
    colors: [] as { name: string; hex: string }[],
    sizes: [] as string[],
    specs: {} as Record<string, string>,
    reference: ""
  });

  const CATS = ["Caméras", "Réseau", "Accès", "Sonorisation", "Domotique", "Autre"];

  const load = async () => {
    const { data } = await supabase.from("products").select("*").order("sort_order");
    setProducts(data ?? []);
  };

  const loadSuppliers = async () => {
    const { data, error } = await supabase
      .from("suppliers")
      .select("*")
      .order("name");
    if (!error) setSuppliers((data ?? []) as Supplier[]);
  };

  useEffect(() => {
    void Promise.resolve().then(async () => {
      await Promise.all([load(), loadSuppliers()]);
    });
  }, []);

  const uploadImg = async (file: File, path: string): Promise<string> => {
    return uploadSiteImage(file, path);
  };

  const notify = (text: string, ok = true) => {
    setNotice({ text, ok });
    setTimeout(() => setNotice(null), 3500);
  };

  const createStockNotifications = (product: Product, previousProduct?: Product | null) => {
    const currentState = getStockAlertState(product);
    const previousState = previousProduct ? getStockAlertState(previousProduct) : "normal";
    if (currentState === previousState) return;

    if (currentState === "out") {
      void createNotification({
        title: "Stock épuisé",
        message: `${product.name} n'a plus de stock disponible.`,
        type: "product_out_of_stock",
        module: "products",
        entity_id: product.id,
        entity_type: "products"
      });
      return;
    }

    if (currentState === "low") {
      const quantity = normalizeStockQuantity(product.stock_quantity);
      void createNotification({
        title: "Stock bas",
        message: `${product.name} est au seuil d'alerte avec ${quantity} unité${quantity > 1 ? "s" : ""}.`,
        type: "product_low_stock",
        module: "products",
        entity_id: product.id,
        entity_type: "products"
      });
    }
  };

  const cloneProduct = (product: Product) => JSON.parse(JSON.stringify(product)) as Product;

  const startEdit = (product: Product) => {
    setExpandedProduct(product.id);
    setEditingProduct(product.id);
    setDraftProduct(cloneProduct(product));
    setNotice(null);
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setDraftProduct(null);
  };

  const updateDraftField = <K extends keyof Product>(id: number, field: K, value: Product[K]) => {
    if (editingProduct !== id) return;
    setDraftProduct((current) => (
      current?.id === id ? { ...current, [field]: value } : current
    ));
  };

  const updateDraftPricingField = (id: number, field: "purchase_price" | "profit_margin" | "discount_percent", value: number) => {
    if (editingProduct !== id) return;
    setDraftProduct((current) => {
      if (!current || current.id !== id) return current;
      const next = { ...current, [field]: value };
      const pricing = calculatePricing(next);
      return {
        ...next,
        selling_price: pricing.sellingPrice,
        discounted_price: pricing.discountedPrice,
        price: pricing.hasPurchasePricing ? pricing.discountedPrice : next.price,
        original_price: pricing.hasPurchasePricing ? pricing.sellingPrice : next.original_price
      };
    });
  };

  const updateNewPricingField = (field: "purchase_price" | "profit_margin" | "discount_percent", value: number) => {
    setNewP((current) => {
      const next = { ...current, [field]: value };
      const pricing = calculatePricing(next);
      return {
        ...next,
        selling_price: pricing.sellingPrice,
        discounted_price: pricing.discountedPrice,
        price: pricing.hasPurchasePricing ? pricing.discountedPrice : next.price,
        original_price: pricing.hasPurchasePricing ? pricing.sellingPrice : next.original_price
      };
    });
  };

  const workingProduct = (id: number) => {
    if (draftProduct?.id === id) return draftProduct;
    return products.find(p => p.id === id);
  };

  const recordStockHistory = async (productId: number, oldQuantity: number, newQuantity: number) => {
    const { data: userData } = await supabase.auth.getUser();
    const changedBy = userData.user?.email || userData.user?.id || "admin";
    return supabase.from("product_stock_history").insert([{
      product_id: productId,
      old_quantity: oldQuantity,
      new_quantity: newQuantity,
      changed_by: changedBy,
      reason: "Manual stock update from admin panel"
    }]);
  };

  const saveEdit = async (id: number) => {
    if (!draftProduct || draftProduct.id !== id) return;
    const originalProduct = products.find(product => product.id === id);
    const oldQuantity = normalizeStockQuantity(originalProduct?.stock_quantity);
    const newQuantity = normalizeStockQuantity(draftProduct.stock_quantity);
    const minimumStockAlert = normalizeMinimumStockAlert(draftProduct.minimum_stock_alert);
    const pricing = calculatePricing(draftProduct);
    setSaving(id);
    try {
      const payload = {
        name: draftProduct.name,
        description: draftProduct.description,
        price: pricing.hasPurchasePricing ? pricing.discountedPrice : draftProduct.price,
        private_note: draftProduct.private_note,
        original_price: pricing.hasPurchasePricing ? pricing.sellingPrice : draftProduct.original_price,
        discount_percent: pricing.discountPercent,
        purchase_price: pricing.purchasePrice,
        profit_margin: pricing.profitMargin,
        selling_price: pricing.sellingPrice,
        discounted_price: pricing.discountedPrice,
        image: draftProduct.image,
        images: draftProduct.images,
        category: draftProduct.category,
        is_active: draftProduct.is_active,
        sort_order: draftProduct.sort_order,
        in_stock: draftProduct.in_stock,
        stock_quantity: newQuantity,
        minimum_stock_alert: minimumStockAlert,
        supplier_id: draftProduct.supplier_id || null,
        supplier_reference: draftProduct.supplier_reference || null,
        sku: draftProduct.sku || null,
        barcode: draftProduct.barcode || null,
        warranty_months: normalizeWarrantyMonths(draftProduct.warranty_months),
        purchase_date: draftProduct.purchase_date || null,
        colors: draftProduct.colors,
        sizes: draftProduct.sizes,
        specs: draftProduct.specs,
        reference: draftProduct.reference
      };
      const { data, error } = await supabase
        .from("products")
        .update(payload)
        .eq("id", id)
        .select("*")
        .single();

      if (error) {
        notify(error.message, false);
        return;
      }

      let historyWarning = "";
      if (oldQuantity !== newQuantity) {
        const { error: historyError } = await recordStockHistory(id, oldQuantity, newQuantity);
        if (historyError) {
          historyWarning = " Historique stock non enregistré: " + historyError.message;
        }
      }

      const updated = (data ?? draftProduct) as Product;
      void createNotification({
        title: "Produit modifié",
        message: `${updated.name} a été mis à jour.`,
        type: "product_updated",
        module: "products",
        entity_id: updated.id,
        entity_type: "products"
      });
      createStockNotifications(updated, originalProduct);
      setProducts((current) => (
        current
          .map(product => product.id === id ? updated : product)
          .sort((a, b) => a.sort_order - b.sort_order)
      ));
      setEditingProduct(null);
      setDraftProduct(null);
      notify(historyWarning ? "Produit sauvegardé." + historyWarning : "Produit sauvegardé !", !historyWarning);
    } catch (error) {
      notify(error instanceof Error ? error.message : "Erreur lors de la sauvegarde", false);
    } finally {
      setSaving(null);
    }
  };

  const toggleActive = async (p: Product) => {
    const { error } = await supabase.from("products").update({ is_active: !p.is_active }).eq("id", p.id);
    if (!error) {
      void createNotification({
        title: "Produit modifié",
        message: `${p.name} a été ${p.is_active ? "désactivé" : "activé"}.`,
        type: "product_updated",
        module: "products",
        entity_id: p.id,
        entity_type: "products"
      });
    }
    load();
  };

  const del = async (id: number) => {
    const product = products.find(item => item.id === id);
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (!error) {
      void createNotification({
        title: "Produit supprimé",
        message: `${product?.name || `Produit #${id}`} a été supprimé.`,
        type: "product_deleted",
        module: "products",
        entity_id: id,
        entity_type: "products"
      });
    }
    setPendingDelete(null);
    load();
  };

  const add = async () => {
    if (!newP.name) { notify("Nom obligatoire", false); return; }
    const pricing = calculatePricing(newP);
    const productToInsert = {
      ...newP,
      is_active: true,
      price: pricing.hasPurchasePricing ? pricing.discountedPrice : newP.price,
      original_price: pricing.hasPurchasePricing ? pricing.sellingPrice : newP.original_price,
      discount_percent: pricing.discountPercent,
      purchase_price: pricing.purchasePrice,
      profit_margin: pricing.profitMargin,
      selling_price: pricing.sellingPrice,
      discounted_price: pricing.discountedPrice,
      minimum_stock_alert: normalizeMinimumStockAlert(newP.minimum_stock_alert),
      supplier_id: newP.supplier_id || null,
      supplier_reference: newP.supplier_reference || null,
      sku: newP.sku || null,
      barcode: newP.barcode || null,
      warranty_months: normalizeWarrantyMonths(newP.warranty_months),
      purchase_date: newP.purchase_date || null
    };
    if (!productToInsert.price) { notify("Prix obligatoire", false); return; }
    setSaving(-1);
    const { data, error } = await supabase.from("products").insert([productToInsert]).select("*").single();
    if (!error && data) {
      const product = data as Product;
      void createNotification({
        title: "Produit ajouté",
        message: `${product.name} a été ajouté au catalogue.`,
        type: "product_created",
        module: "products",
        entity_id: product.id,
        entity_type: "products"
      });
      createStockNotifications(product);
    }
    setNewP({
      name: "", description: "", price: 0, original_price: 0, discount_percent: 0,
      purchase_price: 0, profit_margin: 0, selling_price: 0, discounted_price: 0,
      image: "", images: [], category: "Caméras", sort_order: products.length + 2,
      in_stock: true, stock_quantity: 0, minimum_stock_alert: null,
      supplier_id: null, supplier_reference: "", sku: "", barcode: "", warranty_months: null, purchase_date: "",
      colors: [], sizes: [], specs: {}, reference: ""
    });
    setAdding(false);
    setSaving(null);
    load();
  };

  // Color management
  const addColor = (productId: number, color: { name: string; hex: string }) => {
    const product = workingProduct(productId);
    if (!product) return;
    const newColors = [...(product.colors || []), color];
    updateDraftField(productId, 'colors', newColors);
  };

  const removeColor = (productId: number, colorName: string) => {
    const product = workingProduct(productId);
    if (!product) return;
    const newColors = (product.colors || []).filter(c => c.name !== colorName);
    updateDraftField(productId, 'colors', newColors);
  };

  // Size management
  const addSize = (productId: number, size: string) => {
    const product = workingProduct(productId);
    if (!product) return;
    const newSizes = [...(product.sizes || []), size];
    updateDraftField(productId, 'sizes', newSizes);
  };

  const removeSize = (productId: number, size: string) => {
    const product = workingProduct(productId);
    if (!product) return;
    const newSizes = (product.sizes || []).filter(s => s !== size);
    updateDraftField(productId, 'sizes', newSizes);
  };

  // Specs management
  const updateSpec = (productId: number, key: string, value: string) => {
    const product = workingProduct(productId);
    if (!product) return;
    const newSpecs = { ...(product.specs || {}), [key]: value };
    updateDraftField(productId, 'specs', newSpecs);
  };

  const removeSpec = (productId: number, key: string) => {
    const product = workingProduct(productId);
    if (!product) return;
    const newSpecs = { ...(product.specs || {}) };
    delete newSpecs[key];
    updateDraftField(productId, 'specs', newSpecs);
  };

  // Multi-image upload
  const addImage = async (productId: number, file: File) => {
    const product = workingProduct(productId);
    if (!product) return;
    try {
      const url = await uploadImg(file, `product-${productId}-gallery`);
      const newImages = [...(product.images || []), url];
      updateDraftField(productId, 'images', newImages);
    } catch (error) {
      notify(error instanceof Error ? error.message : "Erreur lors de l'upload", false);
    }
  };

  const removeImage = async (productId: number, imageUrl: string) => {
    const product = workingProduct(productId);
    if (!product) return;
    const newImages = (product.images || []).filter(img => img !== imageUrl);
    updateDraftField(productId, 'images', newImages);
  };

  const setMainImage = (productId: number, imageUrl: string) => {
    updateDraftField(productId, 'image', imageUrl);
  };

  const visibleProducts = products;

  const getSupplierName = (supplierId?: number | string | null) => {
    if (!supplierId) return "";
    return suppliers.find(supplier => String(supplier.id) === String(supplierId))?.name || "";
  };

  const getStockStatus = (product: Product) => {
    const quantity = normalizeStockQuantity(product.stock_quantity);
    if (!product.in_stock || quantity === 0) return "Rupture";
    if (isLowStock(product)) return "Stock bas";
    return "En stock";
  };

  const buildProductRows = () => visibleProducts.map(product => {
    const pricing = calculatePricing(product);
    return {
      id: product.id,
      name: product.name || "",
      category: product.category || "",
      reference: product.reference || "",
      purchasePrice: normalizeMoney(product.purchase_price),
      sellingPrice: pricing.sellingPrice,
      discountPercent: pricing.discountPercent,
      finalPrice: pricing.discountedPrice,
      stockQuantity: normalizeStockQuantity(product.stock_quantity),
      supplier: getSupplierName(product.supplier_id),
      status: getStockStatus(product),
      createdAt: getProductCreatedAt(product)
    };
  });

  const handleExportPdf = async () => {
    try {
      const [{ jsPDF }, autoTableModule] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable")
      ]);
      const autoTable = autoTableModule.default;
      const rows = buildProductRows();
      const generatedAt = new Date();
      const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
      const logo = await loadImageAsDataUrl("/images/logo.png");

      if (logo) {
        doc.addImage(logo, "PNG", 36, 24, 54, 54);
      }

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(18);
      doc.text("MOD-TECH - Rapport Produits", logo ? 104 : 36, 44);
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Date de generation: ${formatDateTime(generatedAt)}`, logo ? 104 : 36, 64);
      doc.text(`${rows.length} produit${rows.length !== 1 ? "s" : ""} affiche${rows.length !== 1 ? "s" : ""}`, logo ? 104 : 36, 80);

      autoTable(doc, {
        startY: 104,
        head: [[
          "Produit",
          "Reference",
          "Categorie",
          "Prix vente",
          "Remise %",
          "Prix final",
          "Stock",
          "Etat stock",
          "Fournisseur"
        ]],
        body: rows.map(row => [
          row.name,
          row.reference,
          row.category,
          formatMoney(row.sellingPrice),
          `${row.discountPercent}%`,
          formatMoney(row.finalPrice),
          row.stockQuantity,
          row.status,
          row.supplier || "-"
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

      doc.save(`mod-tech-products-${formatFileDate()}.pdf`);
    } catch (error) {
      notify("Export PDF impossible: " + (error instanceof Error ? error.message : "Erreur inconnue"), false);
    }
  };

  const handleExportExcel = async () => {
    try {
      const XLSX = await import("xlsx");
      const rows = buildProductRows().map(row => ({
        ID: row.id,
        "Product Name": row.name,
        Category: row.category,
        Reference: row.reference,
        "Purchase Price": row.purchasePrice,
        "Selling Price": row.sellingPrice,
        "Discount %": row.discountPercent,
        "Final Price": row.finalPrice,
        "Stock Quantity": row.stockQuantity,
        Supplier: row.supplier,
        Status: row.status,
        "Created At": row.createdAt ? formatDateTime(row.createdAt) : ""
      }));
      const worksheet = XLSX.utils.json_to_sheet(rows);
      worksheet["!cols"] = [
        { wch: 8 },
        { wch: 28 },
        { wch: 18 },
        { wch: 18 },
        { wch: 16 },
        { wch: 16 },
        { wch: 12 },
        { wch: 16 },
        { wch: 16 },
        { wch: 22 },
        { wch: 14 },
        { wch: 20 }
      ];
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
      XLSX.writeFile(workbook, `mod-tech-products-${formatFileDate()}.xlsx`);
    } catch (error) {
      notify("Export Excel impossible: " + (error instanceof Error ? error.message : "Erreur inconnue"), false);
    }
  };

  const handlePrint = () => {
    const rows = buildProductRows();
    const generatedAt = new Date();
    const printWindow = window.open("", "_blank", "width=1200,height=800");
    if (!printWindow) {
      notify("La fenêtre d'impression a été bloquée.", false);
      return;
    }

    const tableRows = rows.map(row => `
      <tr>
        <td>${escapeHtml(row.name)}</td>
        <td>${escapeHtml(row.reference)}</td>
        <td>${escapeHtml(row.category)}</td>
        <td>${escapeHtml(formatMoney(row.sellingPrice))}</td>
        <td>${escapeHtml(row.discountPercent)}%</td>
        <td>${escapeHtml(formatMoney(row.finalPrice))}</td>
        <td>${escapeHtml(row.stockQuantity)}</td>
        <td>${escapeHtml(row.status)}</td>
        <td>${escapeHtml(row.supplier || "-")}</td>
      </tr>
    `).join("");

    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>MOD-TECH - Produits</title>
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
              <h1>MOD-TECH - Rapport Produits</h1>
              <p>Date de generation: ${escapeHtml(formatDateTime(generatedAt))}</p>
              <p>${rows.length} produit${rows.length !== 1 ? "s" : ""} affiche${rows.length !== 1 ? "s" : ""}</p>
            </div>
          </header>
          <table>
            <thead>
              <tr>
                <th>Produit</th>
                <th>Reference</th>
                <th>Categorie</th>
                <th>Prix vente</th>
                <th>Remise %</th>
                <th>Prix final</th>
                <th>Stock</th>
                <th>Etat stock</th>
                <th>Fournisseur</th>
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

  const actionButtonStyle = (variant: "primary" | "soft" | "outline" = "soft") =>
    s.button(variant === "primary" ? "primary" : variant === "outline" ? "ghost" : "secondary");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: s.space.sm }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: s.space.sm }}>
        {[
          {
            label: "Total produits",
            value: products.length,
            icon: <ShoppingBag className="w-5 h-5" />,
          },
          {
            label: "Produits actifs",
            value: products.filter(x => x.is_active).length,
            icon: <ShoppingBag className="w-5 h-5" />,
          },
          {
            label: "En promotion",
            value: products.filter(x => x.discount_percent > 0).length,
            icon: <Palette className="w-5 h-5" />,
          },
          {
            label: "En rupture de stock",
            value: products.filter(x => normalizeStockQuantity(x.stock_quantity) === 0).length,
            icon: <PackageX className="w-5 h-5" />,
          },
        ].map((card) => (
          <div className="admin-list-item" key={card.label} style={{
            background: s.surface,
            border: "1px solid " + s.brd,
            borderRadius: s.radius.lg,
            padding: s.space.sm,
            display: "flex",
            alignItems: "center",
            gap: 14,
            minHeight: 92
          }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: s.hover,
              color: s.sub,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}>
              {card.icon}
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 850, color: s.tx, lineHeight: 1 }}>{card.value}</div>
              <div style={{ marginTop: 7, fontSize: 13, color: s.sub, fontWeight: 650 }}>{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {notice && (
        <div style={{
          background: s.hover,
          border: "1px solid " + s.brd,
          borderRadius: s.radius.md,
          padding: "10px 16px",
          color: notice.ok ? s.tx : s.sub,
          fontSize: 13,
          fontWeight: 700
        }}>
          {notice.text}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <AdminIconButton
          dark={dark}
          label="Export PDF"
          onClick={handleExportPdf}
        >
          <FileText className="w-4 h-4" />
        </AdminIconButton>
        <AdminIconButton
          dark={dark}
          label="Export Excel"
          onClick={handleExportExcel}
        >
          <FileSpreadsheet className="w-4 h-4" />
        </AdminIconButton>
        <AdminIconButton
          dark={dark}
          label="Print"
          onClick={handlePrint}
          tone="ghost"
        >
          <Printer className="w-4 h-4" />
        </AdminIconButton>
        </div>
        <button type="button"
          onClick={() => {
            setAdding(true);
            window.requestAnimationFrame(() => {
              document.getElementById("product-add-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
            });
          }}
          style={actionButtonStyle("primary")}
        >
          <Plus className="w-4 h-4" />
          Ajouter un produit
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: s.space.sm, order: 2 }}>
      {visibleProducts.map(product => {
	        const isExpanded = expandedProduct === product.id;
	        const isEditing = editingProduct === product.id;
	        const p = isEditing && draftProduct?.id === product.id ? draftProduct : product;
	        const stockQuantity = normalizeStockQuantity(p.stock_quantity);
	        const minimumAlert = normalizeMinimumStockAlert(p.minimum_stock_alert);
	        const lowStock = isLowStock(p);
	        const outOfStock = stockQuantity === 0;
	        const pricing = calculatePricing(p);
	        const stockStatus = outOfStock ? "نفد المخزون" : lowStock ? "مخزون منخفض" : "متوفر";
	        const stockStatusColor = s.sub;

	        return (
          <motion.div
            className="admin-list-item"
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: s.surface,
              border: "1px solid " + s.brd,
              borderRadius: 14,
              overflow: "hidden",
              opacity: p.is_active ? 1 : 0.6
            }}
          >
            {/* Product header */}
            <div
              style={{
                padding: s.space.sm,
                display: "flex",
                alignItems: "center",
                gap: s.space.sm,
                background: s.surface,
                borderBottom: isExpanded ? "1px solid " + s.brd : "none",
                cursor: "pointer",
                flexWrap: "wrap"
              }}
              onClick={() => setExpandedProduct(isExpanded ? null : p.id)}
            >
              {/* Thumbnail */}
              <div style={{
                width: 48,
                height: 48,
                borderRadius: s.radius.md,
                overflow: "hidden",
                background: s.hover,
                flexShrink: 0
              }}>
                {p.image ? (
                  <img src={p.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: s.sub }}>
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{p.name}</span>
                  {p.reference && <span style={{ fontSize: 10, color: s.sub, fontFamily: "monospace" }}>#{p.reference}</span>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: s.sub, marginTop: 4, flexWrap: "wrap" }}>
                  <span style={{ color: s.tx, fontWeight: 800 }}>{pricing.discountedPrice.toLocaleString()} DA</span>
                  {pricing.sellingPrice > pricing.discountedPrice && <span style={{ textDecoration: "line-through", color: s.sub }}>{pricing.sellingPrice.toLocaleString()}</span>}
                  {p.discount_percent > 0 && <span style={{ background: s.hover, color: s.sub, borderRadius: s.radius.sm, padding: "2px 6px", fontSize: 10, fontWeight: 800 }}>-{p.discount_percent}%</span>}
                  <span>•</span>
	                  <span style={{ color: s.sub }}>{p.in_stock ? "En stock" : "Rupture"}</span>
	                  <span>•</span>
	                  <span style={{ color: s.sub, fontWeight: outOfStock || lowStock ? 700 : 500 }}>
	                    Quantité: {stockQuantity}
	                  </span>
	                  {outOfStock && (
	                    <>
	                      <span>•</span>
	                      <span style={{ color: s.sub, fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 4 }}>
	                        <PackageX className="w-3 h-3" /> نفد المخزون
	                      </span>
	                    </>
	                  )}
	                  {lowStock && (
	                    <>
	                      <span>•</span>
	                      <span style={{ color: s.sub, fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 4 }}>
	                        <AlertTriangle className="w-3 h-3" /> Stock bas
	                      </span>
	                    </>
	                  )}
	                  <span>•</span>
	                  <span>{p.colors?.length || 0} couleurs</span>
                  <span>•</span>
                  <span>{p.images?.length || 0} images</span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {saving === p.id && <RefreshCw className="w-4 h-4 animate-spin" style={{ color: s.sub }} />}
                {isEditing ? (
                  <>
                    <button type="button"
                      onClick={(e) => { e.stopPropagation(); saveEdit(p.id); }}
                      disabled={saving === p.id}
                      style={{
                        background: dark ? "#f7f7f8" : s.tx,
                        border: "none",
                        borderRadius: s.radius.sm,
                        padding: "4px 9px",
                        color: "#fff",
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: saving === p.id ? "not-allowed" : "pointer",
                        opacity: saving === p.id ? 0.7 : 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 4
                      }}
                    >
                      {saving === p.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                      حفظ
                    </button>
                    <button type="button"
                      onClick={(e) => { e.stopPropagation(); cancelEdit(); }}
                      disabled={saving === p.id}
                      style={{
                        background: s.hover,
                        border: "none",
                        borderRadius: s.radius.sm,
                        padding: "4px 9px",
                        color: s.tx,
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: saving === p.id ? "not-allowed" : "pointer",
                        opacity: saving === p.id ? 0.65 : 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 4
                      }}
                    >
                      <X className="w-3 h-3" />
                      إلغاء
                    </button>
                  </>
                ) : (
                  <>
                    <AdminIconButton
                      dark={dark}
                      label="Modifier"
                      onClick={(e) => { e.stopPropagation(); startEdit(p); }}
                      tone="primary"
                      size={40}
                    >
                      <Pencil className="w-4 h-4" />
                    </AdminIconButton>
                    <AdminIconButton
                      dark={dark}
                      label={p.is_active ? "Désactiver" : "Activer"}
                      onClick={(e) => { e.stopPropagation(); toggleActive(p); }}
                      tone={p.is_active ? "default" : "danger"}
                      size={40}
                    >
                      {p.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </AdminIconButton>
                    <AdminIconButton
                      dark={dark}
                      label="Supprimer"
                      onClick={(e) => { e.stopPropagation(); setPendingDelete(p); }}
                      tone="danger"
                      size={40}
                    >
                      <Trash2 className="w-4 h-4" />
                    </AdminIconButton>
                  </>
                )}
                <span style={{ color: s.sub, fontSize: 14 }}>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </span>
              </div>
            </div>

            {/* Expanded edit panel */}
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 20 }}
              >
                {/* Main image and gallery */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: s.mut, textTransform: "uppercase", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                    <ImageIcon className="w-4 h-4" />
                    Images
                  </div>

                  {/* Main image */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, color: s.sub, marginBottom: 8 }}>Image principale</div>
                    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                      <div style={{
                        width: 100,
                        height: 100,
                        borderRadius: 10,
                        overflow: "hidden",
                        background: dark ? "#1e2a3a" : "#f1f5f9",
                        border: "2px solid " + s.sub,
                        position: "relative"
                      }}>
                        {p.image ? (
                          <img src={p.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: s.sub }}>
                            <ImageIcon className="w-7 h-7" />
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        id={`main-img-${p.id}`}
                        disabled={!isEditing}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const url = await uploadImg(file, `product-${p.id}-main`);
                              updateDraftField(p.id, 'image', url);
                            } catch (error) {
                              notify(error instanceof Error ? error.message : "Erreur lors de l'upload", false);
                            }
                          }
                        }}
                      />
                      <label
                        htmlFor={isEditing ? `main-img-${p.id}` : undefined}
                        style={{
                          background: s.hover,
                          border: "1px dashed " + s.brd,
                          borderRadius: 8,
                          padding: "8px 16px",
                          color: s.sub,
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: isEditing ? "pointer" : "not-allowed",
                          opacity: isEditing ? 1 : 0.55,
                          display: "flex",
                          alignItems: "center",
                          gap: 6
                        }}
                      >
                        <ImageIcon className="w-4 h-4" />
                        Changer
                      </label>
                    </div>
                  </div>

                  {/* Gallery images */}
                  <div>
                    <div style={{ fontSize: 12, color: s.sub, marginBottom: 8 }}>Images supplémentaires ({p.images?.length || 0})</div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
                      {(p.images || []).map((img, idx) => (
                        <div className="admin-list-item" key={idx} style={{
                          width: 80,
                          height: 80,
                          borderRadius: 8,
                          overflow: "hidden",
                          border: "1px solid " + s.brd,
                          position: "relative"
                        }}>
                          <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          <div style={{
                            position: "absolute",
                            top: 4,
                            right: 4,
                            display: "flex",
                            gap: 4
                          }}>
                            <button type="button"
                              onClick={() => setMainImage(p.id, img)}
                              disabled={!isEditing}
                              style={{
                                background: s.tx,
                                border: "none",
                                borderRadius: 4,
                                color: "#fff",
                                fontSize: 10,
                                padding: "2px 4px",
                                cursor: isEditing ? "pointer" : "not-allowed",
                                opacity: isEditing ? 1 : 0.5
                              }}
                            >
                              <Star className="w-3 h-3" />
                            </button>
                            <button type="button"
                              onClick={() => removeImage(p.id, img)}
                              disabled={!isEditing}
                              style={{
                                background: s.tx,
                                border: "none",
                                borderRadius: 4,
                                color: "#fff",
                                fontSize: 10,
                                padding: "2px 4px",
                                cursor: isEditing ? "pointer" : "not-allowed",
                                opacity: isEditing ? 1 : 0.5
                              }}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Add image button */}
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          id={`gallery-${p.id}`}
                          disabled={!isEditing}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              await addImage(p.id, file);
                            }
                          }}
                        />
                        <label
                          htmlFor={isEditing ? `gallery-${p.id}` : undefined}
                          style={{
                            width: 80,
                            height: 80,
                            borderRadius: 8,
                            border: "2px dashed " + s.brd,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 24,
                            color: s.sub,
                            cursor: isEditing ? "pointer" : "not-allowed",
                            opacity: isEditing ? 1 : 0.55
                          }}
                        >
                          <Plus className="w-6 h-6" />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: 11, fontWeight: 800, color: s.tx, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  المعلومات العامة
                </div>

                {/* Basic info grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: s.tx, display: "block", marginBottom: 4 }}>Nom *</label>
                    <input
                      value={p.name}
                      onChange={e => updateDraftField(p.id, "name", e.target.value)}
                      disabled={!isEditing}
                      style={{
                        width: "100%",
                        background: s.ibg,
                        border: "1px solid " + s.brd,
                        borderRadius: 8,
                        padding: "8px 10px",
                        color: s.tx,
                        fontSize: 13,
                        outline: "none",
                        opacity: isEditing ? 1 : 0.65,
                        cursor: isEditing ? "text" : "not-allowed"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: s.tx, display: "block", marginBottom: 4 }}>Référence</label>
                    <input
                      value={p.reference || ""}
                      onChange={e => updateDraftField(p.id, "reference", e.target.value)}
                      disabled={!isEditing}
                      style={{
                        width: "100%",
                        background: s.ibg,
                        border: "1px solid " + s.brd,
                        borderRadius: 8,
                        padding: "8px 10px",
                        color: s.tx,
                        fontSize: 13,
                        outline: "none",
                        opacity: isEditing ? 1 : 0.65,
                        cursor: isEditing ? "text" : "not-allowed"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: s.tx, display: "block", marginBottom: 4 }}>Catégorie</label>
                    <select
                      value={p.category}
                      onChange={e => updateDraftField(p.id, "category", e.target.value)}
                      disabled={!isEditing}
                      style={{
                        width: "100%",
                        background: s.ibg,
                        border: "1px solid " + s.brd,
                        borderRadius: 8,
                        padding: "8px 10px",
                        color: s.tx,
                        fontSize: 13,
                        outline: "none",
                        opacity: isEditing ? 1 : 0.65,
                        cursor: isEditing ? "pointer" : "not-allowed"
                      }}
                    >
                      {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: s.tx, display: "block", marginBottom: 4 }}>Description</label>
                  <textarea
                    value={p.description || ""}
                    onChange={e => updateDraftField(p.id, "description", e.target.value)}
                    disabled={!isEditing}
                    rows={2}
                    style={{
                      width: "100%",
                      background: s.ibg,
                      border: "1px solid " + s.brd,
                      borderRadius: 8,
                      padding: "8px 10px",
                      color: s.tx,
                      fontSize: 13,
                      outline: "none",
                      resize: "vertical",
                      opacity: isEditing ? 1 : 0.65,
                      cursor: isEditing ? "text" : "not-allowed"
                    }}
                  />
                </div>

                <div style={{ fontSize: 11, fontWeight: 800, color: s.tx, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  الأسعار
                </div>

                {/* Price and promotion */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: s.tx, display: "block", marginBottom: 4 }}>Prix d&apos;achat (DA)</label>
                    <input
                      type="number"
                      min={0}
                      value={p.purchase_price || ""}
                      onChange={e => updateDraftPricingField(p.id, "purchase_price", normalizeMoney(e.target.value))}
                      disabled={!isEditing}
                      style={{
                        width: "100%",
                        background: s.ibg,
                        border: "1px solid " + s.brd,
                        borderRadius: 8,
                        padding: "8px 10px",
                        color: s.sub,
                        fontSize: 13,
                        outline: "none",
                        opacity: isEditing ? 1 : 0.65,
                        cursor: isEditing ? "text" : "not-allowed"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: s.tx, display: "block", marginBottom: 4 }}>Marge bénéfice %</label>
                    <input
                      type="number"
                      min={0}
                      value={p.profit_margin || ""}
                      onChange={e => updateDraftPricingField(p.id, "profit_margin", normalizePercent(e.target.value))}
                      disabled={!isEditing}
                      style={{
                        width: "100%",
                        background: s.ibg,
                        border: "1px solid " + s.brd,
                        borderRadius: 8,
                        padding: "8px 10px",
                        color: s.sub,
                        fontSize: 13,
                        outline: "none",
                        opacity: isEditing ? 1 : 0.65,
                        cursor: isEditing ? "text" : "not-allowed"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: s.tx, display: "block", marginBottom: 4 }}>Prix de vente (calculé)</label>
                    <input
                      type="number"
                      value={pricing.sellingPrice || ""}
                      disabled
                      readOnly
                      style={{
                        width: "100%",
                        background: dark ? "rgba(15,23,42,0.45)" : "#f8fafc",
                        border: "1px solid " + s.brd,
                        borderRadius: 8,
                        padding: "8px 10px",
                        color: s.sub,
                        fontSize: 13,
                        outline: "none",
                        opacity: 0.85,
                        cursor: "not-allowed"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: s.tx, display: "block", marginBottom: 4 }}>Promotion %</label>
                    <input
                      type="number"
                      min={0}
                      value={p.discount_percent || ""}
                      onChange={e => updateDraftPricingField(p.id, "discount_percent", normalizePercent(e.target.value))}
                      disabled={!isEditing}
                      style={{
                        width: "100%",
                        background: s.ibg,
                        border: "1px solid " + s.brd,
                        borderRadius: 8,
                        padding: "8px 10px",
                        color: s.sub,
                        fontSize: 13,
                        outline: "none",
                        opacity: isEditing ? 1 : 0.65,
                        cursor: isEditing ? "text" : "not-allowed"
                      }}
                    />
	                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: s.tx, display: "block", marginBottom: 4 }}>Prix final (calculé)</label>
                    <input
                      type="number"
                      value={pricing.discountedPrice || ""}
                      disabled
                      readOnly
                      style={{
                        width: "100%",
                        background: dark ? "rgba(15,23,42,0.45)" : "#f8fafc",
                        border: "1px solid " + s.brd,
                        borderRadius: 8,
                        padding: "8px 10px",
                        color: s.sub,
                        fontSize: 13,
                        fontWeight: 800,
                        outline: "none",
                        opacity: 0.95,
                        cursor: "not-allowed"
                      }}
                    />
                  </div>
	              <div>
		                <label style={{ fontSize: 11, fontWeight: 700, color: s.tx, display: "block", marginBottom: 4 }}>Ordre</label>
	                <input
                      type="number"
                      value={p.sort_order || ""}
                      onChange={e => updateDraftField(p.id, "sort_order", parseInt(e.target.value) || 0)}
                      disabled={!isEditing}
                      style={{
                        width: "100%",
                        background: s.ibg,
                        border: "1px solid " + s.brd,
                        borderRadius: 8,
                        padding: "8px 10px",
                        color: s.tx,
                        fontSize: 13,
                        outline: "none",
                        opacity: isEditing ? 1 : 0.65,
                        cursor: isEditing ? "text" : "not-allowed"
	                  }}
	                />
	              </div>
		            </div>

                <div style={{ fontSize: 11, fontWeight: 800, color: s.tx, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  المخزون
                </div>

                {/* Stock */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
	                  <div>
	                    <label style={{ fontSize: 11, fontWeight: 700, color: s.tx, display: "block", marginBottom: 4 }}>Disponibilité</label>
	                    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
	                      <button type="button"
	                        onClick={() => updateDraftField(p.id, "in_stock", !p.in_stock)}
	                        disabled={!isEditing}
                        style={{
                          background: p.in_stock ? s.hover : s.hover,
                          border: "1px solid " + (p.in_stock ? s.brd : s.brd),
                          borderRadius: 8,
                          padding: "6px 12px",
                          color: p.in_stock ? s.sub : s.sub,
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: isEditing ? "pointer" : "not-allowed",
                          opacity: isEditing ? 1 : 0.65,
                          display: "flex",
                          alignItems: "center",
                          gap: 4
                        }}
                      >
	                        {p.in_stock ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
	                        {p.in_stock ? "En stock" : "Rupture"}
	                      </button>
	                      {outOfStock && (
	                        <span style={{ color: s.sub, fontSize: 12, fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 4 }}>
	                          <PackageX className="w-3 h-3" /> نفد المخزون
	                        </span>
	                      )}
	                    </div>
	                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: s.tx, display: "block", marginBottom: 4 }}>حالة المخزون</label>
                    <div style={{
                      width: "100%",
                      background: outOfStock ? s.hover : lowStock ? s.hover : s.hover,
                      border: "1px solid " + (outOfStock ? s.brd : lowStock ? s.brd : s.brd),
                      borderRadius: 8,
                      padding: "8px 10px",
                      color: stockStatusColor,
                      fontSize: 13,
                      fontWeight: 800
                    }}>
                      {stockStatus}
                    </div>
                  </div>
	                </div>

	                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
	                  <div>
	                    <label style={{ fontSize: 11, fontWeight: 700, color: s.tx, display: "block", marginBottom: 4 }}>Quantité actuelle</label>
	                    <input
	                      type="number"
	                      min={0}
	                      value={stockQuantity}
	                      onChange={e => updateDraftField(p.id, "stock_quantity", normalizeStockQuantity(e.target.value))}
	                      disabled={!isEditing}
	                      style={{
	                        width: "100%",
	                        background: s.ibg,
	                        border: "1px solid " + (outOfStock ? s.brd : lowStock ? s.brd : s.brd),
	                        borderRadius: 8,
	                        padding: "8px 10px",
	                        color: outOfStock ? s.sub : lowStock ? s.sub : s.tx,
	                        fontSize: 13,
	                        fontWeight: 700,
	                        outline: "none",
	                        opacity: isEditing ? 1 : 0.65,
	                        cursor: isEditing ? "text" : "not-allowed"
	                      }}
	                    />
	                  </div>
		              <div>
		                <label style={{ fontSize: 11, fontWeight: 700, color: s.tx, display: "block", marginBottom: 4 }}>Alerte minimum</label>
	                    <input
	                      type="number"
	                      min={0}
	                      value={minimumAlert ?? ""}
	                      onChange={e => updateDraftField(p.id, "minimum_stock_alert", normalizeMinimumStockAlert(e.target.value))}
	                      disabled={!isEditing}
	                      placeholder="Optionnel"
	                      style={{
	                        width: "100%",
	                        background: s.ibg,
	                        border: "1px solid " + s.brd,
	                        borderRadius: 8,
	                        padding: "8px 10px",
	                        color: s.tx,
	                        fontSize: 13,
	                        outline: "none",
	                        opacity: isEditing ? 1 : 0.65,
	                        cursor: isEditing ? "text" : "not-allowed"
	                      }}
	                    />
	                  </div>
	                </div>

	                {(outOfStock || lowStock) && (
	                  <div style={{
	                    background: outOfStock ? s.hover : s.hover,
	                    border: "1px solid " + (outOfStock ? s.brd : s.brd),
	                    borderRadius: 8,
	                    padding: "9px 12px",
	                    color: outOfStock ? s.sub : s.sub,
	                    fontSize: 12,
	                    fontWeight: 800,
	                    display: "flex",
	                    alignItems: "center",
	                    gap: 6
	                  }}>
	                    {outOfStock ? <PackageX className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
	                    {outOfStock ? "نفد المخزون" : `Stock inférieur au seuil minimum (${minimumAlert})`}
	                  </div>
	                )}

                <div style={{ fontSize: 11, fontWeight: 800, color: s.tx, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  المورد
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, alignItems: "end" }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: s.tx, display: "block", marginBottom: 4 }}>Fournisseur</label>
                    <select
                      value={p.supplier_id ? String(p.supplier_id) : ""}
                      onChange={e => updateDraftField(p.id, "supplier_id", e.target.value || null)}
                      disabled={!isEditing}
                      style={{
                        width: "100%",
                        background: s.ibg,
                        border: "1px solid " + s.brd,
                        borderRadius: 8,
                        padding: "8px 10px",
                        color: s.tx,
                        fontSize: 13,
                        outline: "none",
                        opacity: isEditing ? 1 : 0.65,
                        cursor: isEditing ? "pointer" : "not-allowed"
                      }}
                    >
                      <option value="">Sans fournisseur</option>
                      {suppliers.filter(supplier => supplier.status === "active" || String(supplier.id) === String(p.supplier_id)).map(supplier => (
                        <option key={String(supplier.id)} value={String(supplier.id)}>{supplier.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: s.tx, display: "block", marginBottom: 4 }}>Référence fournisseur</label>
                    <input
                      value={p.supplier_reference || ""}
                      onChange={e => updateDraftField(p.id, "supplier_reference", e.target.value)}
                      disabled={!isEditing}
                      style={{
                        width: "100%",
                        background: s.ibg,
                        border: "1px solid " + s.brd,
                        borderRadius: 8,
                        padding: "8px 10px",
                        color: s.tx,
                        fontSize: 13,
                        outline: "none",
                        opacity: isEditing ? 1 : 0.65,
                        cursor: isEditing ? "text" : "not-allowed"
                      }}
                    />
                  </div>
                </div>

                <div style={{ fontSize: 11, fontWeight: 800, color: s.tx, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  معلومات إضافية
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: s.tx, display: "block", marginBottom: 4 }}>SKU</label>
                    <input
                      value={p.sku || ""}
                      onChange={e => updateDraftField(p.id, "sku", e.target.value)}
                      disabled={!isEditing}
                      style={{ width: "100%", background: s.ibg, border: "1px solid " + s.brd, borderRadius: 8, padding: "8px 10px", color: s.tx, fontSize: 13, outline: "none", opacity: isEditing ? 1 : 0.65 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: s.tx, display: "block", marginBottom: 4 }}>Barcode</label>
                    <input
                      value={p.barcode || ""}
                      onChange={e => updateDraftField(p.id, "barcode", e.target.value)}
                      disabled={!isEditing}
                      style={{ width: "100%", background: s.ibg, border: "1px solid " + s.brd, borderRadius: 8, padding: "8px 10px", color: s.tx, fontSize: 13, outline: "none", opacity: isEditing ? 1 : 0.65 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: s.tx, display: "block", marginBottom: 4 }}>Garantie (mois)</label>
                    <input
                      type="number"
                      min={0}
                      value={p.warranty_months ?? ""}
                      onChange={e => updateDraftField(p.id, "warranty_months", normalizeWarrantyMonths(e.target.value))}
                      disabled={!isEditing}
                      style={{ width: "100%", background: s.ibg, border: "1px solid " + s.brd, borderRadius: 8, padding: "8px 10px", color: s.tx, fontSize: 13, outline: "none", opacity: isEditing ? 1 : 0.65 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: s.tx, display: "block", marginBottom: 4 }}>Date d&apos;achat</label>
                    <input
                      type="date"
                      value={p.purchase_date || ""}
                      onChange={e => updateDraftField(p.id, "purchase_date", e.target.value || null)}
                      disabled={!isEditing}
                      style={{ width: "100%", background: s.ibg, border: "1px solid " + s.brd, borderRadius: 8, padding: "8px 10px", color: s.tx, fontSize: 13, outline: "none", opacity: isEditing ? 1 : 0.65 }}
                    />
                  </div>
                </div>

	                {/* Colors */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: s.mut, display: "flex", alignItems: "center", gap: 4 }}>
                      <Palette className="w-4 h-4" />
                      Couleurs disponibles
                    </label>
                    <button type="button"
                      onClick={() => {
                        const colorName = prompt("Nom de la couleur (ex: Rouge, Bleu)");
                        if (!colorName) return;
                        const hex = prompt("Code hexadécimal (ex: #ff0000)");
                        if (!hex) return;
                        addColor(p.id, { name: colorName, hex });
                      }}
                      disabled={!isEditing}
                      style={{
                        background: "transparent",
                        border: "1px dashed " + s.sub,
                        borderRadius: 6,
                        padding: "4px 12px",
                        color: s.sub,
                        fontSize: 12,
                        cursor: isEditing ? "pointer" : "not-allowed",
                        opacity: isEditing ? 1 : 0.55,
                        display: "flex",
                        alignItems: "center",
                        gap: 4
                      }}
                    >
                      <Plus className="w-3 h-3" />
                      Ajouter
                    </button>
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {(p.colors || []).map(c => (
                      <div className="admin-list-item" key={c.name} style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        background: s.ci,
                        border: "1px solid " + s.brd,
                        borderRadius: 20,
                        padding: "4px 10px 4px 4px"
                      }}>
                        <div style={{ width: 20, height: 20, borderRadius: "50%", background: c.hex, border: "2px solid #fff" }} />
                        <span style={{ fontSize: 12 }}>{c.name}</span>
                        <button type="button"
                          onClick={() => removeColor(p.id, c.name)}
                          disabled={!isEditing}
                          style={{
                            background: "none",
                            border: "none",
                            color: s.sub,
                            fontSize: 14,
                            cursor: isEditing ? "pointer" : "not-allowed",
                            opacity: isEditing ? 1 : 0.5,
                            display: "flex",
                            alignItems: "center"
                          }}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sizes */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: s.mut, display: "flex", alignItems: "center", gap: 4 }}>
                      <Ruler className="w-4 h-4" />
                      Tailles / Dimensions
                    </label>
                    <button type="button"
                      onClick={() => {
                        const size = prompt("Taille (ex: M, XL, 1TB, 4MP)");
                        if (size) addSize(p.id, size);
                      }}
                      disabled={!isEditing}
                      style={{
                        background: "transparent",
                        border: "1px dashed " + s.sub,
                        borderRadius: 6,
                        padding: "4px 12px",
                        color: s.sub,
                        fontSize: 12,
                        cursor: isEditing ? "pointer" : "not-allowed",
                        opacity: isEditing ? 1 : 0.55,
                        display: "flex",
                        alignItems: "center",
                        gap: 4
                      }}
                    >
                      <Plus className="w-3 h-3" />
                      Ajouter
                    </button>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {(p.sizes || []).map(size => (
                      <div className="admin-list-item" key={size} style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        background: s.ci,
                        border: "1px solid " + s.brd,
                        borderRadius: 20,
                        padding: "4px 10px 4px 10px"
                      }}>
                        <span style={{ fontSize: 12 }}>{size}</span>
                        <button type="button"
                          onClick={() => removeSize(p.id, size)}
                          disabled={!isEditing}
                          style={{
                            background: "none",
                            border: "none",
                            color: s.sub,
                            fontSize: 14,
                            cursor: isEditing ? "pointer" : "not-allowed",
                            opacity: isEditing ? 1 : 0.5,
                            display: "flex",
                            alignItems: "center"
                          }}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Specifications */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: s.mut, display: "flex", alignItems: "center", gap: 4 }}>
                      <Settings2 className="w-4 h-4" />
                      Spécifications techniques
                    </label>
                    <button type="button"
                      onClick={() => {
                        const key = prompt("Nom de la spécification (ex: Résolution)");
                        if (!key) return;
                        const value = prompt("Valeur (ex: 4MP)");
                        if (!value) return;
                        updateSpec(p.id, key, value);
                      }}
                      disabled={!isEditing}
                      style={{
                        background: "transparent",
                        border: "1px dashed " + s.sub,
                        borderRadius: 6,
                        padding: "4px 12px",
                        color: s.sub,
                        fontSize: 12,
                        cursor: isEditing ? "pointer" : "not-allowed",
                        opacity: isEditing ? 1 : 0.55,
                        display: "flex",
                        alignItems: "center",
                        gap: 4
                      }}
                    >
                      <Plus className="w-3 h-3" />
                      Ajouter
                    </button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {Object.entries(p.specs || {}).map(([key, val]) => (
                      <div className="admin-list-item" key={key} style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        background: s.ci,
                        border: "1px solid " + s.brd,
                        borderRadius: 8,
                        padding: "6px 12px",
                        flexWrap: "wrap"
                      }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: s.tx, minWidth: 100 }}>{key}</span>
                        <input
                          value={val as string}
                          onChange={e => updateSpec(p.id, key, e.target.value)}
                          disabled={!isEditing}
                          style={{
                            flex: 1,
                            background: "transparent",
                            border: "none",
                            borderBottom: "1px solid " + s.brd,
                            color: s.tx,
                            fontSize: 12,
                            padding: "4px",
                            outline: "none",
                            opacity: isEditing ? 1 : 0.65,
                            cursor: isEditing ? "text" : "not-allowed"
                          }}
                        />
                        <button type="button"
                          onClick={() => removeSpec(p.id, key)}
                          disabled={!isEditing}
                          style={{
                            background: "none",
                            border: "none",
                            color: s.sub,
                            fontSize: 14,
                            cursor: isEditing ? "pointer" : "not-allowed",
                            opacity: isEditing ? 1 : 0.5,
                            display: "flex",
                            alignItems: "center"
                          }}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                {/* ── Private Note ── */}
<div>
  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
    <div style={{
      fontSize: 11, fontWeight: 700, color: s.sub,
      textTransform: "uppercase" as const, letterSpacing: "0.1em",
      display: "flex", alignItems: "center", gap: 6
    }}>
      <FileText className="w-4 h-4" />
      Note privée (visible uniquement par l&apos;admin)
    </div>
  </div>
  <textarea
    key={`note-${p.id}`}
    value={p.private_note || ""}
    onChange={e => updateDraftField(p.id, "private_note", e.target.value)}
    disabled={!isEditing}
    rows={3}
    placeholder="Note interne sur ce produit — prix fournisseur, remarques, stock réel..."
    style={{
      width: "100%",
      background: s.ibg,
      border: "1.5px dashed " + s.brd,
      borderRadius: 10,
      padding: "10px 14px",
      color: s.tx,
      fontSize: 13,
      outline: "none",
      fontFamily: "inherit",
      resize: "vertical" as const,
      boxSizing: "border-box" as const,
      lineHeight: 1.6,
      opacity: isEditing ? 1 : 0.65,
      cursor: isEditing ? "text" : "not-allowed",
    }}
    onFocus={e => {
      if (!isEditing) return;
      e.currentTarget.style.borderColor = s.sub;
      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(71,85,105,0.14)";
    }}
    onBlur={e => {
      e.currentTarget.style.borderColor = s.sub;
      e.currentTarget.style.boxShadow = "none";
    }}
  />
  <div style={{ fontSize: 11, color: s.sub, marginTop: 5, display: "flex", alignItems: "center", gap: 4 }}>
  </div>
</div>
              </motion.div>
            )}
          </motion.div>
        );
      })}
      </div>

      {/* Add new product form */}
      {adding && (
        <motion.div
          id="product-add-form"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: s.card,
            border: "2px dashed " + s.brd,
            borderRadius: 16,
            padding: 24,
            order: 1
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: s.sub, marginBottom: 16, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
            <Plus className="w-4 h-4" />
            Nouveau produit
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Main image */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: s.tx, marginBottom: 8 }}>Image principale *</div>
              <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                {newP.image ? (
                  <div style={{ width: 80, height: 80, borderRadius: 8, overflow: "hidden", border: "1px solid " + s.brd, position: "relative" }}>
                    <img src={newP.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button type="button"
                      onClick={() => setNewP({ ...newP, image: "" })}
                      style={{
                        position: "absolute",
                        top: 2,
                        right: 2,
                        background: s.tx,
                        color: "#fff",
                        border: "none",
                        borderRadius: 4,
                        fontSize: 10,
                        padding: "2px 4px",
                        cursor: "pointer"
                      }}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <input
                    type="file"
                    accept="image/*"
                    id="new-main-img"
                    style={{ display: "none" }}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = await uploadImg(file, "product-new-main");
                        setNewP({ ...newP, image: url });
                      }
                    }}
                  />
                )}
                <label
                  htmlFor="new-main-img"
                  style={{
                    background: s.hover,
                    border: "1px dashed " + s.brd,
                    borderRadius: 8,
                    padding: "8px 16px",
                    color: s.sub,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }}
                >
                  <ImageIcon className="w-4 h-4" />
                  Choisir
                </label>
              </div>
            </div>

            <div style={{ fontSize: 11, fontWeight: 800, color: s.tx, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              المعلومات العامة
            </div>

            {/* Basic fields */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: s.tx, display: "block", marginBottom: 4 }}>Nom *</label>
                <input
                  value={newP.name}
                  onChange={e => setNewP({ ...newP, name: e.target.value })}
                  style={{
                    width: "100%",
                    background: s.ibg,
                    border: "1px solid " + s.brd,
                    borderRadius: 8,
                    padding: "8px 10px",
                    color: s.tx,
                    fontSize: 13
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: s.tx, display: "block", marginBottom: 4 }}>Référence</label>
                <input
                  value={newP.reference}
                  onChange={e => setNewP({ ...newP, reference: e.target.value })}
                  style={{
                    width: "100%",
                    background: s.ibg,
                    border: "1px solid " + s.brd,
                    borderRadius: 8,
                    padding: "8px 10px",
                    color: s.tx,
                    fontSize: 13
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: s.tx, display: "block", marginBottom: 4 }}>Description</label>
              <textarea
                value={newP.description}
                onChange={e => setNewP({ ...newP, description: e.target.value })}
                rows={2}
                style={{
                  width: "100%",
                  background: s.ibg,
                  border: "1px solid " + s.brd,
                  borderRadius: 8,
                  padding: "8px 10px",
                  color: s.tx,
                  fontSize: 13
                }}
              />
            </div>

            <div style={{ fontSize: 11, fontWeight: 800, color: s.tx, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              الأسعار
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: s.tx, display: "block", marginBottom: 4 }}>Prix d&apos;achat (DA)</label>
                <input
                  type="number"
                  min={0}
                  value={newP.purchase_price || ""}
                  onChange={e => updateNewPricingField("purchase_price", normalizeMoney(e.target.value))}
                  style={{
                    width: "100%",
                    background: s.ibg,
                    border: "1px solid " + s.brd,
                    borderRadius: 8,
                    padding: "8px 10px",
                    color: s.sub,
                    fontSize: 13
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: s.tx, display: "block", marginBottom: 4 }}>Marge bénéfice %</label>
                <input
                  type="number"
                  min={0}
                  value={newP.profit_margin || ""}
                  onChange={e => updateNewPricingField("profit_margin", normalizePercent(e.target.value))}
                  style={{
                    width: "100%",
                    background: s.ibg,
                    border: "1px solid " + s.brd,
                    borderRadius: 8,
                    padding: "8px 10px",
                    color: s.sub,
                    fontSize: 13
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: s.tx, display: "block", marginBottom: 4 }}>Prix de vente (calculé)</label>
                <input
                  type="number"
                  value={newP.selling_price || ""}
                  disabled
                  readOnly
                  style={{
                    width: "100%",
                    background: dark ? "rgba(15,23,42,0.45)" : "#f8fafc",
                    border: "1px solid " + s.brd,
                    borderRadius: 8,
                    padding: "8px 10px",
                    color: s.sub,
                    fontSize: 13
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: s.tx, display: "block", marginBottom: 4 }}>Promotion %</label>
                <input
                  type="number"
                  min={0}
                  value={newP.discount_percent || ""}
                  onChange={e => updateNewPricingField("discount_percent", normalizePercent(e.target.value))}
                  style={{
                    width: "100%",
                    background: s.ibg,
                    border: "1px solid " + s.brd,
                    borderRadius: 8,
                    padding: "8px 10px",
                    color: s.sub,
                    fontSize: 13
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: s.tx, display: "block", marginBottom: 4 }}>Prix final (calculé)</label>
                <input
                  type="number"
                  value={newP.discounted_price || ""}
                  disabled
                  readOnly
                  style={{
                    width: "100%",
                    background: dark ? "rgba(15,23,42,0.45)" : "#f8fafc",
                    border: "1px solid " + s.brd,
                    borderRadius: 8,
                    padding: "8px 10px",
                    color: s.sub,
                    fontSize: 13,
                    fontWeight: 800
                  }}
                />
              </div>
            </div>

            <div style={{ fontSize: 11, fontWeight: 800, color: s.tx, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              المخزون
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: s.tx, display: "block", marginBottom: 4 }}>Catégorie</label>
                <select
                  value={newP.category}
                  onChange={e => setNewP({ ...newP, category: e.target.value })}
                  style={{
                    width: "100%",
                    background: s.ibg,
                    border: "1px solid " + s.brd,
                    borderRadius: 8,
                    padding: "8px 10px",
                    color: s.tx,
                    fontSize: 13
                  }}
                >
                  {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
	              <div>
	                <label style={{ fontSize: 11, fontWeight: 700, color: s.tx, display: "block", marginBottom: 4 }}>Ordre</label>
	                <input
	                  type="number"
	                  value={newP.sort_order}
                  onChange={e => setNewP({ ...newP, sort_order: parseInt(e.target.value) || 1 })}
                  style={{
                    width: "100%",
                    background: s.ibg,
                    border: "1px solid " + s.brd,
                    borderRadius: 8,
                    padding: "8px 10px",
                    color: s.tx,
                    fontSize: 13
	                  }}
	                />
	              </div>
	              <div>
	                <label style={{ fontSize: 11, fontWeight: 700, color: s.tx, display: "block", marginBottom: 4 }}>Quantité actuelle</label>
	                <input
	                  type="number"
	                  min={0}
	                  value={newP.stock_quantity}
	                  onChange={e => setNewP({ ...newP, stock_quantity: normalizeStockQuantity(e.target.value) })}
	                  style={{
	                    width: "100%",
	                    background: s.ibg,
	                    border: "1px solid " + s.brd,
	                    borderRadius: 8,
	                    padding: "8px 10px",
	                    color: s.tx,
	                    fontSize: 13
	                  }}
	                />
	              </div>
	              <div>
	                <label style={{ fontSize: 11, fontWeight: 700, color: s.tx, display: "block", marginBottom: 4 }}>Alerte minimum</label>
	                <input
	                  type="number"
	                  min={0}
	                  value={newP.minimum_stock_alert ?? ""}
	                  onChange={e => setNewP({ ...newP, minimum_stock_alert: normalizeMinimumStockAlert(e.target.value) })}
	                  placeholder="Optionnel"
	                  style={{
	                    width: "100%",
	                    background: s.ibg,
	                    border: "1px solid " + s.brd,
	                    borderRadius: 8,
	                    padding: "8px 10px",
	                    color: s.tx,
	                    fontSize: 13
	                  }}
		                />
		              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: s.tx, display: "block", marginBottom: 4 }}>حالة المخزون</label>
                {(() => {
                  const newQuantity = normalizeStockQuantity(newP.stock_quantity);
                  const newMinimum = normalizeMinimumStockAlert(newP.minimum_stock_alert);
                  const newOut = newQuantity === 0;
                  const newLow = newMinimum !== null && newQuantity > 0 && newQuantity <= newMinimum;
                  const label = newOut ? "نفد المخزون" : newLow ? "مخزون منخفض" : "متوفر";
                  const color = newOut ? s.sub : newLow ? s.sub : s.sub;
                  return (
                    <div style={{
                      width: "100%",
                      background: newOut ? s.hover : newLow ? s.hover : s.hover,
                      border: "1px solid " + (newOut ? s.brd : newLow ? s.brd : s.brd),
                      borderRadius: 8,
                      padding: "8px 10px",
                      color,
                      fontSize: 13,
                      fontWeight: 800
                    }}>
                      {label}
                    </div>
                  );
                })()}
              </div>
		            </div>

            <div style={{ fontSize: 11, fontWeight: 800, color: s.tx, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              المورد
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, alignItems: "end" }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: s.tx, display: "block", marginBottom: 4 }}>Fournisseur</label>
                <select
                  value={newP.supplier_id ? String(newP.supplier_id) : ""}
                  onChange={e => setNewP({ ...newP, supplier_id: e.target.value || null })}
                  style={{ width: "100%", background: s.ibg, border: "1px solid " + s.brd, borderRadius: 8, padding: "8px 10px", color: s.tx, fontSize: 13 }}
                >
                  <option value="">Sans fournisseur</option>
                  {suppliers.filter(supplier => supplier.status === "active").map(supplier => (
                    <option key={String(supplier.id)} value={String(supplier.id)}>{supplier.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: s.tx, display: "block", marginBottom: 4 }}>Référence fournisseur</label>
                <input
                  value={newP.supplier_reference}
                  onChange={e => setNewP({ ...newP, supplier_reference: e.target.value })}
                  style={{ width: "100%", background: s.ibg, border: "1px solid " + s.brd, borderRadius: 8, padding: "8px 10px", color: s.tx, fontSize: 13 }}
                />
              </div>
            </div>

            <div style={{ fontSize: 11, fontWeight: 800, color: s.tx, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              معلومات إضافية
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: s.tx, display: "block", marginBottom: 4 }}>SKU</label>
                <input value={newP.sku} onChange={e => setNewP({ ...newP, sku: e.target.value })} style={{ width: "100%", background: s.ibg, border: "1px solid " + s.brd, borderRadius: 8, padding: "8px 10px", color: s.tx, fontSize: 13 }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: s.tx, display: "block", marginBottom: 4 }}>Barcode</label>
                <input value={newP.barcode} onChange={e => setNewP({ ...newP, barcode: e.target.value })} style={{ width: "100%", background: s.ibg, border: "1px solid " + s.brd, borderRadius: 8, padding: "8px 10px", color: s.tx, fontSize: 13 }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: s.tx, display: "block", marginBottom: 4 }}>Garantie (mois)</label>
                <input type="number" min={0} value={newP.warranty_months ?? ""} onChange={e => setNewP({ ...newP, warranty_months: normalizeWarrantyMonths(e.target.value) })} style={{ width: "100%", background: s.ibg, border: "1px solid " + s.brd, borderRadius: 8, padding: "8px 10px", color: s.tx, fontSize: 13 }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: s.tx, display: "block", marginBottom: 4 }}>Date d&apos;achat</label>
                <input type="date" value={newP.purchase_date} onChange={e => setNewP({ ...newP, purchase_date: e.target.value })} style={{ width: "100%", background: s.ibg, border: "1px solid " + s.brd, borderRadius: 8, padding: "8px 10px", color: s.tx, fontSize: 13 }} />
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button type="button"
                onClick={add}
                disabled={saving === -1}
                style={{
                  background: s.sub,
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 20px",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: saving === -1 ? "not-allowed" : "pointer",
                  opacity: saving === -1 ? 0.7 : 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }}
              >
                {saving === -1 ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {saving === -1 ? "Création..." : "Créer le produit"}
              </button>
              <button type="button"
                onClick={() => setAdding(false)}
                style={{
                  background: "transparent",
                  border: "1px solid " + s.brd,
                  borderRadius: 8,
                  padding: "10px 16px",
                  color: s.sub,
                  fontSize: 13,
                  cursor: "pointer"
                }}
              >
                Annuler
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {pendingDelete && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(7, 22, 20, 0.62)", zIndex: 220, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={() => setPendingDelete(null)}>
          <div style={{ background: s.elevated, border: "1px solid " + s.brd, borderRadius: s.radius.xl, boxShadow: s.shadow, width: "min(460px, 100%)", padding: s.space.md }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: s.radius.lg, background: s.hover, color: s.sub, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 850, color: s.tx, marginBottom: 6 }}>Supprimer le produit</div>
                <div style={{ fontSize: 13, color: s.sub, lineHeight: 1.65 }}>Confirmer la suppression de {pendingDelete.name} ? Le produit sera retiré du catalogue.</div>
              </div>
              <AdminIconButton dark={dark} label="Fermer" onClick={() => setPendingDelete(null)} tone="ghost" size={36}>
                <X className="w-4 h-4" />
              </AdminIconButton>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: s.space.md }}>
              <button type="button" onClick={() => setPendingDelete(null)} style={s.button("outline")}>Annuler</button>
              <button type="button" onClick={() => del(pendingDelete.id)} style={s.button("danger")}>
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
