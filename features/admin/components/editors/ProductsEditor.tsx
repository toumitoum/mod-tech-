"use client";

import { supabase } from "@/app/supabase";
import { motion } from "framer-motion";
import {
ChevronDown,
ChevronUp,
Eye,
EyeOff,
Image as ImageIcon,
Plus,
RefreshCw,
ShoppingBag,
Star,
Trash2,
X
} from "lucide-react";
import { useEffect,useState } from "react";
import { uploadSiteImage } from "../../services/storage.service";
import { ms,teal } from "../../styles";
import type { Product } from "../../types";

export function ProductsEd({ dark }: { dark: boolean }) {
  const s = ms(dark);
  const [products, setProducts] = useState<Product[]>([]);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState<number | null>(null);
  const [editingProduct, setEditingProduct] = useState<number | null>(null);
  const [newP, setNewP] = useState({
    name: "",
    description: "",
    price: 0,
    original_price: 0,
    discount_percent: 0,
    image: "",
    images: [] as string[],
    category: "Caméras",
    sort_order: 1,
    in_stock: true,
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

  useEffect(() => { void Promise.resolve().then(load); }, []);

  const uploadImg = async (file: File, path: string): Promise<string> => {
    return uploadSiteImage(file, path);
  };

  const updateField = async (id: number, field: string, value: unknown) => {
    setSaving(id);
    await supabase.from("products").update({ [field]: value }).eq("id", id);
    setSaving(null);
    load();
  };

  const toggleActive = async (p: Product) => {
    await supabase.from("products").update({ is_active: !p.is_active }).eq("id", p.id);
    load();
  };

  const del = async (id: number) => {
    if (!confirm("Supprimer ce produit ?")) return;
    await supabase.from("products").delete().eq("id", id);
    load();
  };

  const add = async () => {
    if (!newP.name) { alert("Nom obligatoire"); return; }
    if (!newP.price) { alert("Prix obligatoire"); return; }
    setSaving(-1);
    await supabase.from("products").insert([{ ...newP, is_active: true }]);
    setNewP({
      name: "", description: "", price: 0, original_price: 0, discount_percent: 0,
      image: "", images: [], category: "Caméras", sort_order: products.length + 2,
      in_stock: true, colors: [], sizes: [], specs: {}, reference: ""
    });
    setAdding(false);
    setSaving(null);
    load();
  };

  // Color management
  const addColor = (productId: number, color: { name: string; hex: string }) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const newColors = [...(product.colors || []), color];
    updateField(productId, 'colors', newColors);
  };

  const removeColor = (productId: number, colorName: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const newColors = (product.colors || []).filter(c => c.name !== colorName);
    updateField(productId, 'colors', newColors);
  };

  // Size management
  const addSize = (productId: number, size: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const newSizes = [...(product.sizes || []), size];
    updateField(productId, 'sizes', newSizes);
  };

  const removeSize = (productId: number, size: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const newSizes = (product.sizes || []).filter(s => s !== size);
    updateField(productId, 'sizes', newSizes);
  };

  // Specs management
  const updateSpec = (productId: number, key: string, value: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const newSpecs = { ...(product.specs || {}), [key]: value };
    updateField(productId, 'specs', newSpecs);
  };

  const removeSpec = (productId: number, key: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const newSpecs = { ...(product.specs || {}) };
    delete newSpecs[key];
    updateField(productId, 'specs', newSpecs);
  };

  // Multi-image upload
  const addImage = async (productId: number, file: File) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const url = await uploadImg(file, `product-${productId}-gallery`);
    const newImages = [...(product.images || []), url];
    await updateField(productId, 'images', newImages);
  };

  const removeImage = async (productId: number, imageUrl: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const newImages = (product.images || []).filter(img => img !== imageUrl);
    await updateField(productId, 'images', newImages);
  };

  const setMainImage = async (productId: number, imageUrl: string) => {
    await updateField(productId, 'image', imageUrl);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
          <span style={{ color: teal, fontWeight: 700 }}>{products.length} produit{products.length !== 1 ? "s" : ""}</span> ·
          <span style={{ color: "#10b981", fontWeight: 600 }}> {products.filter(x => x.is_active).length} actifs</span> ·
          <span style={{ color: "#f59e0b", fontWeight: 600 }}> {products.filter(x => x.discount_percent > 0).length} en promotion</span>
        </span>
      </div>

      {products.map(p => {
        const isEditing = editingProduct === p.id;

        return (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: s.card,
              border: "1px solid " + (p.is_active ? s.brd : "rgba(239,68,68,0.25)"),
              borderRadius: 16,
              overflow: "hidden",
              opacity: p.is_active ? 1 : 0.6
            }}
          >
            {/* Product header */}
            <div
              style={{
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: dark ? "rgba(13,148,136,0.02)" : "rgba(13,148,136,0.02)",
                borderBottom: isEditing ? "1px solid " + s.brd : "none",
                cursor: "pointer",
                flexWrap: "wrap"
              }}
              onClick={() => setEditingProduct(isEditing ? null : p.id)}
            >
              {/* Thumbnail */}
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 10,
                overflow: "hidden",
                background: dark ? "#1e2a3a" : "#f1f5f9",
                flexShrink: 0
              }}>
                {p.image ? (
                  <img src={p.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>📦</div>
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{p.name}</span>
                  {p.reference && <span style={{ fontSize: 10, color: s.sub, fontFamily: "monospace" }}>#{p.reference}</span>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: s.sub, marginTop: 4, flexWrap: "wrap" }}>
                  <span style={{ color: teal, fontWeight: 700 }}>{p.price.toLocaleString()} DA</span>
                  {p.original_price > 0 && <span style={{ textDecoration: "line-through", color: "#ef4444" }}>{p.original_price.toLocaleString()}</span>}
                  {p.discount_percent > 0 && <span style={{ background: "#ef4444", color: "#fff", borderRadius: 4, padding: "2px 6px", fontSize: 10 }}>-{p.discount_percent}%</span>}
                  <span>•</span>
                  <span style={{ color: p.in_stock ? "#10b981" : "#ef4444" }}>{p.in_stock ? "En stock" : "Rupture"}</span>
                  <span>•</span>
                  <span>{p.colors?.length || 0} couleurs</span>
                  <span>•</span>
                  <span>{p.images?.length || 0} images</span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {saving === p.id && <RefreshCw className="w-4 h-4 animate-spin" style={{ color: teal }} />}
                <button
                  onClick={(e) => { e.stopPropagation(); toggleActive(p); }}
                  style={{
                    background: p.is_active ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.08)",
                    border: "1px solid " + (p.is_active ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.2)"),
                    borderRadius: 6,
                    padding: "4px 9px",
                    color: p.is_active ? "#10b981" : "#f87171",
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4
                  }}
                >
                  {p.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  {p.is_active ? "Actif" : "Off"}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); del(p.id); }}
                  style={{
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    borderRadius: 6,
                    padding: "4px 7px",
                    color: "#f87171",
                    fontSize: 11,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
                <span style={{ color: s.sub, fontSize: 14 }}>
                  {isEditing ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </span>
              </div>
            </div>

            {/* Expanded edit panel */}
            {isEditing && (
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
                        border: "2px solid " + teal,
                        position: "relative"
                      }}>
                        {p.image ? (
                          <img src={p.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>📷</div>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        id={`main-img-${p.id}`}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = await uploadImg(file, `product-${p.id}-main`);
                            await updateField(p.id, 'image', url);
                          }
                        }}
                      />
                      <label
                        htmlFor={`main-img-${p.id}`}
                        style={{
                          background: "rgba(13,148,136,0.1)",
                          border: "1px dashed rgba(13,148,136,0.4)",
                          borderRadius: 8,
                          padding: "8px 16px",
                          color: teal,
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "pointer",
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
                        <div key={idx} style={{
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
                            <button
                              onClick={() => setMainImage(p.id, img)}
                              style={{
                                background: "rgba(13,148,136,0.9)",
                                border: "none",
                                borderRadius: 4,
                                color: "#fff",
                                fontSize: 10,
                                padding: "2px 4px",
                                cursor: "pointer"
                              }}
                            >
                              <Star className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => removeImage(p.id, img)}
                              style={{
                                background: "rgba(239,68,68,0.9)",
                                border: "none",
                                borderRadius: 4,
                                color: "#fff",
                                fontSize: 10,
                                padding: "2px 4px",
                                cursor: "pointer"
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
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              await addImage(p.id, file);
                            }
                          }}
                        />
                        <label
                          htmlFor={`gallery-${p.id}`}
                          style={{
                            width: 80,
                            height: 80,
                            borderRadius: 8,
                            border: "2px dashed rgba(13,148,136,0.3)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 24,
                            color: teal,
                            cursor: "pointer"
                          }}
                        >
                          <Plus className="w-6 h-6" />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Basic info grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: s.mut, display: "block", marginBottom: 4 }}>Nom *</label>
                    <input
                      defaultValue={p.name}
                      onBlur={e => updateField(p.id, "name", e.target.value)}
                      style={{
                        width: "100%",
                        background: s.ibg,
                        border: "1px solid " + s.brd,
                        borderRadius: 8,
                        padding: "8px 10px",
                        color: s.tx,
                        fontSize: 13,
                        outline: "none"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: s.mut, display: "block", marginBottom: 4 }}>Référence</label>
                    <input
                      defaultValue={p.reference || ""}
                      onBlur={e => updateField(p.id, "reference", e.target.value)}
                      style={{
                        width: "100%",
                        background: s.ibg,
                        border: "1px solid " + s.brd,
                        borderRadius: 8,
                        padding: "8px 10px",
                        color: s.tx,
                        fontSize: 13,
                        outline: "none"
                      }}
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: s.mut, display: "block", marginBottom: 4 }}>Description</label>
                  <textarea
                    defaultValue={p.description || ""}
                    onBlur={e => updateField(p.id, "description", e.target.value)}
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
                      resize: "vertical"
                    }}
                  />
                </div>

                {/* Price and promotion */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: s.mut, display: "block", marginBottom: 4 }}>Prix actuel (DA) *</label>
                    <input
                      type="number"
                      defaultValue={p.price}
                      onBlur={e => updateField(p.id, "price", parseFloat(e.target.value) || 0)}
                      style={{
                        width: "100%",
                        background: s.ibg,
                        border: "1px solid " + s.brd,
                        borderRadius: 8,
                        padding: "8px 10px",
                        color: teal,
                        fontSize: 13,
                        outline: "none"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: s.mut, display: "block", marginBottom: 4 }}>Prix original</label>
                    <input
                      type="number"
                      defaultValue={p.original_price || 0}
                      onBlur={e => updateField(p.id, "original_price", parseFloat(e.target.value) || 0)}
                      style={{
                        width: "100%",
                        background: s.ibg,
                        border: "1px solid " + s.brd,
                        borderRadius: 8,
                        padding: "8px 10px",
                        color: "#ef4444",
                        fontSize: 13,
                        outline: "none"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: s.mut, display: "block", marginBottom: 4 }}>Promotion %</label>
                    <input
                      type="number"
                      defaultValue={p.discount_percent || 0}
                      onBlur={e => updateField(p.id, "discount_percent", parseFloat(e.target.value) || 0)}
                      style={{
                        width: "100%",
                        background: s.ibg,
                        border: "1px solid " + s.brd,
                        borderRadius: 8,
                        padding: "8px 10px",
                        color: "#f59e0b",
                        fontSize: 13,
                        outline: "none"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: s.mut, display: "block", marginBottom: 4 }}>Ordre</label>
                    <input
                      type="number"
                      defaultValue={p.sort_order}
                      onBlur={e => updateField(p.id, "sort_order", parseInt(e.target.value) || 0)}
                      style={{
                        width: "100%",
                        background: s.ibg,
                        border: "1px solid " + s.brd,
                        borderRadius: 8,
                        padding: "8px 10px",
                        color: s.tx,
                        fontSize: 13,
                        outline: "none"
                      }}
                    />
                  </div>
                </div>

                {/* Category and stock */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: s.mut, display: "block", marginBottom: 4 }}>Catégorie</label>
                    <select
                      defaultValue={p.category}
                      onBlur={e => updateField(p.id, "category", e.target.value)}
                      style={{
                        width: "100%",
                        background: s.ibg,
                        border: "1px solid " + s.brd,
                        borderRadius: 8,
                        padding: "8px 10px",
                        color: s.tx,
                        fontSize: 13,
                        outline: "none"
                      }}
                    >
                      {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: s.mut, display: "block", marginBottom: 4 }}>Stock</label>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <button
                        onClick={() => updateField(p.id, "in_stock", !p.in_stock)}
                        style={{
                          background: p.in_stock ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.08)",
                          border: "1px solid " + (p.in_stock ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.2)"),
                          borderRadius: 8,
                          padding: "6px 12px",
                          color: p.in_stock ? "#10b981" : "#f87171",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 4
                        }}
                      >
                        {p.in_stock ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {p.in_stock ? "En stock" : "Rupture"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Colors */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: s.mut, display: "flex", alignItems: "center", gap: 4 }}>
                      🎨 Couleurs disponibles
                    </label>
                    <button
                      onClick={() => {
                        const colorName = prompt("Nom de la couleur (ex: Rouge, Bleu)");
                        if (!colorName) return;
                        const hex = prompt("Code hexadécimal (ex: #ff0000)");
                        if (!hex) return;
                        addColor(p.id, { name: colorName, hex });
                      }}
                      style={{
                        background: "transparent",
                        border: "1px dashed " + teal,
                        borderRadius: 6,
                        padding: "4px 12px",
                        color: teal,
                        fontSize: 12,
                        cursor: "pointer",
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
                      <div key={c.name} style={{
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
                        <button
                          onClick={() => removeColor(p.id, c.name)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#ef4444",
                            fontSize: 14,
                            cursor: "pointer",
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
                      📏 Tailles / Dimensions
                    </label>
                    <button
                      onClick={() => {
                        const size = prompt("Taille (ex: M, XL, 1TB, 4MP)");
                        if (size) addSize(p.id, size);
                      }}
                      style={{
                        background: "transparent",
                        border: "1px dashed " + teal,
                        borderRadius: 6,
                        padding: "4px 12px",
                        color: teal,
                        fontSize: 12,
                        cursor: "pointer",
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
                    {(p.sizes || []).map(s => (
                      <div key={s} style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        borderRadius: 20,
                        padding: "4px 10px 4px 10px"
                      }}>
                        <span style={{ fontSize: 12 }}>{s}</span>
                        <button
                          onClick={() => removeSize(p.id, s)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#ef4444",
                            fontSize: 14,
                            cursor: "pointer",
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
                      ⚙️ Spécifications techniques
                    </label>
                    <button
                      onClick={() => {
                        const key = prompt("Nom de la spécification (ex: Résolution)");
                        if (!key) return;
                        const value = prompt("Valeur (ex: 4MP)");
                        if (!value) return;
                        updateSpec(p.id, key, value);
                      }}
                      style={{
                        background: "transparent",
                        border: "1px dashed " + teal,
                        borderRadius: 6,
                        padding: "4px 12px",
                        color: teal,
                        fontSize: 12,
                        cursor: "pointer",
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
                      <div key={key} style={{
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
                          defaultValue={val as string}
                          onBlur={e => updateSpec(p.id, key, e.target.value)}
                          style={{
                            flex: 1,
                            background: "transparent",
                            border: "none",
                            borderBottom: "1px solid " + s.brd,
                            color: s.tx,
                            fontSize: 12,
                            padding: "4px",
                            outline: "none"
                          }}
                        />
                        <button
                          onClick={() => removeSpec(p.id, key)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#ef4444",
                            fontSize: 14,
                            cursor: "pointer",
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
      fontSize: 11, fontWeight: 700, color: "#f59e0b",
      textTransform: "uppercase" as const, letterSpacing: "0.1em",
      display: "flex", alignItems: "center", gap: 6
    }}>
      📝 Note privée (visible uniquement par l&apos;admin)
    </div>
  </div>
  <textarea
    key={`note-${p.id}`}
    defaultValue={p.private_note || ""}
    onBlur={e => {
      updateField(p.id, "private_note", e.target.value);
      e.currentTarget.style.borderColor = "#f59e0b";
      e.currentTarget.style.boxShadow = "none";
    }}
    rows={3}
    placeholder="Note interne sur ce produit — prix fournisseur, remarques, stock réel..."
    style={{
      width: "100%",
      background: dark ? "#1a1a2e" : "#fffbeb",
      border: "1.5px dashed #f59e0b",
      borderRadius: 10,
      padding: "10px 14px",
      color: dark ? "#fde68a" : "#92400e",
      fontSize: 13,
      outline: "none",
      fontFamily: "inherit",
      resize: "vertical" as const,
      boxSizing: "border-box" as const,
      lineHeight: 1.6,
    }}
    onFocus={e => { e.currentTarget.style.borderColor = "#f59e0b"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(245,158,11,0.15)"; }}
  />
  <div style={{ fontSize: 11, color: "#f59e0b", marginTop: 5, display: "flex", alignItems: "center", gap: 4 }}>
  </div>
</div>
              </motion.div>
            )}
          </motion.div>
        );
      })}

      {/* Add new product form */}
      {adding ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: s.card,
            border: "2px dashed rgba(13,148,136,0.4)",
            borderRadius: 16,
            padding: 24
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: teal, marginBottom: 16, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
            <Plus className="w-4 h-4" />
            Nouveau produit
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Main image */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: s.mut, marginBottom: 8 }}>Image principale *</div>
              <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                {newP.image ? (
                  <div style={{ width: 80, height: 80, borderRadius: 8, overflow: "hidden", border: "1px solid " + s.brd, position: "relative" }}>
                    <img src={newP.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button
                      onClick={() => setNewP({ ...newP, image: "" })}
                      style={{
                        position: "absolute",
                        top: 2,
                        right: 2,
                        background: "rgba(239,68,68,0.9)",
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
                    background: "rgba(13,148,136,0.1)",
                    border: "1px dashed rgba(13,148,136,0.4)",
                    borderRadius: 8,
                    padding: "8px 16px",
                    color: teal,
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

            {/* Basic fields */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: s.mut, display: "block", marginBottom: 4 }}>Nom *</label>
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
                <label style={{ fontSize: 11, fontWeight: 700, color: s.mut, display: "block", marginBottom: 4 }}>Référence</label>
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
              <label style={{ fontSize: 11, fontWeight: 700, color: s.mut, display: "block", marginBottom: 4 }}>Description</label>
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

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: s.mut, display: "block", marginBottom: 4 }}>Prix (DA) *</label>
                <input
                  type="number"
                  value={newP.price || ""}
                  onChange={e => setNewP({ ...newP, price: parseFloat(e.target.value) || 0 })}
                  style={{
                    width: "100%",
                    background: s.ibg,
                    border: "1px solid " + s.brd,
                    borderRadius: 8,
                    padding: "8px 10px",
                    color: teal,
                    fontSize: 13
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: s.mut, display: "block", marginBottom: 4 }}>Prix original</label>
                <input
                  type="number"
                  value={newP.original_price || ""}
                  onChange={e => setNewP({ ...newP, original_price: parseFloat(e.target.value) || 0 })}
                  style={{
                    width: "100%",
                    background: s.ibg,
                    border: "1px solid " + s.brd,
                    borderRadius: 8,
                    padding: "8px 10px",
                    color: "#ef4444",
                    fontSize: 13
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: s.mut, display: "block", marginBottom: 4 }}>Promotion %</label>
                <input
                  type="number"
                  value={newP.discount_percent || ""}
                  onChange={e => setNewP({ ...newP, discount_percent: parseFloat(e.target.value) || 0 })}
                  style={{
                    width: "100%",
                    background: s.ibg,
                    border: "1px solid " + s.brd,
                    borderRadius: 8,
                    padding: "8px 10px",
                    color: "#f59e0b",
                    fontSize: 13
                  }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: s.mut, display: "block", marginBottom: 4 }}>Catégorie</label>
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
                <label style={{ fontSize: 11, fontWeight: 700, color: s.mut, display: "block", marginBottom: 4 }}>Ordre</label>
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
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                onClick={add}
                disabled={saving === -1}
                style={{
                  background: teal,
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
              <button
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
      ) : (
        <button
          onClick={() => setAdding(true)}
          style={{
            border: "2px dashed rgba(13,148,136,0.3)",
            background: "transparent",
            color: teal,
            borderRadius: 12,
            padding: 16,
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8
          }}
        >
          <Plus className="w-4 h-4" />
          Ajouter un nouveau produit
        </button>
      )}
    </div>
  );
}
