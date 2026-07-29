"use client";

import { supabase } from "@/app/supabase";
import { createNotification } from "@/features/admin/services/notification.service";
import { runOrderSideEffects } from "@/app/store/order-side-effects";
import { AnimatePresence,motion } from "framer-motion";
import {
ArrowLeft,
Check,
ChevronLeft,ChevronRight,
Clock,
Minus,
Package,
Plus,
Shield,
ShoppingCart,
Tag,
Trash2,
Truck,
X,
} from "lucide-react";
import { useParams,useRouter } from "next/navigation";
import { useEffect,useState } from "react";

/* ─────────────── TYPES ─────────────── */

type Product = {
  id: number; name: string; description: string;
  price: number; original_price: number; discount_percent: number;
  selling_price?: number | null; discounted_price?: number | null;
  image: string; images: string[]; category: string;
  colors: { name: string; hex: string }[]; sizes: string[];
  specs: Record<string, string>; reference: string; in_stock: boolean;
};

type CartItem = Product & { qty: number; selectedColor?: string; selectedSize?: string };
type OrderForm = { name: string; phone: string; email: string; wilaya: string; commune: string; address: string; notes: string };

/* ─────────────── CONSTANTS ─────────────── */

const WILAYAS = ["Adrar","Chlef","Laghouat","Oum El Bouaghi","Batna","Béjaïa","Biskra","Béchar","Blida","Bouira","Tamanrasset","Tébessa","Tlemcen","Tiaret","Tizi Ouzou","Alger","Djelfa","Jijel","Sétif","Saïda","Skikda","Sidi Bel Abbès","Annaba","Guelma","Constantine","Médéa","Mostaganem","M'Sila","Mascara","Ouargla","Oran","El Bayadh","Illizi","Bordj Bou Arreridj","Boumerdès","El Tarf","Tindouf","Tissemsilt","El Oued","Khenchela","Souk Ahras","Tipaza","Mila","Aïn Defla","Naâma","Aïn Témouchent","Ghardaïa","Relizane","Timimoun","Bordj Badji Mokhtar","Ouled Djellal","Béni Abbès","In Salah","In Guezzam","Touggourt","Djanet","El M'Ghair","El Menia"];

const CART_KEY = "modtech_cart";
const loadCart = (): CartItem[] => { try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); } catch { return []; } };
const saveCart = (cart: CartItem[]) => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new CustomEvent("cartUpdated", { detail: cart }));
};

const getDisplayPrice = (product: Product) => {
  const discounted = Number(product.discounted_price);
  return discounted > 0 ? discounted : Math.round(product.price * (1 - (product.discount_percent || 0) / 100));
};

const getOriginalPrice = (product: Product) => {
  const selling = Number(product.selling_price);
  return selling > 0 ? selling : product.price;
};

/* ─────────────── HELPERS ─────────────── */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "mod-input w-full px-4 text-sm outline-none placeholder:text-slate-400";

/* ─────────────── PAGE ─────────────── */

export default function ProductPage() {
  const { id } = useParams();
  const router = useRouter();

  const [product, setProduct]     = useState<Product | null>(null);
  const [loading, setLoading]     = useState(true);
  const [imgIdx, setImgIdx]       = useState(0);
  const [selColor, setSelColor]   = useState("");
  const [selSize, setSelSize]     = useState("");
  const [qty, setQty]             = useState(1);
  const [cart, setCart]           = useState<CartItem[]>(() => (typeof window === "undefined" ? [] : loadCart()));
  const [cartOpen, setCartOpen]   = useState(false);
  const [checkout, setCheckout]   = useState(false);
  const [sending, setSending]     = useState(false);
  const [success, setSuccess]     = useState(false);
  const [addedMsg, setAddedMsg]   = useState("");
  const [form, setForm]           = useState<OrderForm>({ name:"", phone:"", email:"", wilaya:"", commune:"", address:"", notes:"" });

  /* load product */
  useEffect(() => {
    supabase.from("products").select("*").eq("id", id).single()
      .then(({ data }) => { setProduct(data); setLoading(false); });
  }, [id]);

  /* cart init */
  useEffect(() => { saveCart(cart); }, [cart]);
  useEffect(() => {
    const fn = (e: CustomEvent) => setCart(e.detail);
    window.addEventListener("cartUpdated", fn as EventListener);
    return () => window.removeEventListener("cartUpdated", fn as EventListener);
  }, []);

  const allImgs   = product ? [product.image, ...(product.images || [])].filter(Boolean) : [];
  const discPct   = product?.discount_percent || 0;
  const finalPrice = product ? getDisplayPrice(product) : 0;
  const originalPrice = product ? getOriginalPrice(product) : 0;
  const cartCount  = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal  = cart.reduce((s, i) => s + i.price * i.qty, 0);

  /* cart actions */
  const addToCart = () => {
    if (!product) return;
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id && i.selectedColor === selColor && i.selectedSize === selSize);
      return ex
        ? prev.map(i => i.id === product.id && i.selectedColor === selColor && i.selectedSize === selSize ? { ...i, qty: i.qty + qty } : i)
        : [...prev, { ...product, price: finalPrice, qty, selectedColor: selColor, selectedSize: selSize }];
    });
    setAddedMsg("Produit ajouté !");
    setTimeout(() => setAddedMsg(""), 2500);
    setCartOpen(true);
  };

  const updateQty = (id: number, q: number, color?: string, size?: string) => {
    if (q < 1) { removeItem(id, color, size); return; }
    setCart(prev => prev.map(i => i.id === id && i.selectedColor === color && i.selectedSize === size ? { ...i, qty: q } : i));
  };

  const removeItem = (id: number, color?: string, size?: string) =>
    setCart(prev => prev.filter(i => !(i.id === id && i.selectedColor === color && i.selectedSize === size)));

  /* send order */
  const sendOrder = async () => {
    if (!form.name || !form.phone || !form.wilaya || !form.commune || !form.address) { alert("Veuillez remplir tous les champs obligatoires"); return; }
    if (!cart.length) { alert("Votre panier est vide"); return; }
    setSending(true);

    const notes = [form.notes, ...cart.map(item => {
      const opts = [item.selectedColor && `Couleur: ${item.selectedColor}`, item.selectedSize && `Taille: ${item.selectedSize}`].filter(Boolean);
      return opts.length ? `${item.name} (${opts.join(", ")})` : null;
    }).filter(Boolean)].filter(Boolean).join(" | ");

    const orderData = {
      customer_name: form.name, customer_phone: form.phone, customer_email: form.email,
      customer_address: `${form.address}, ${form.commune}, ${form.wilaya}`,
      notes, total: cartTotal, status: "new",
      items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty, color: i.selectedColor, size: i.selectedSize })),
    };

    const { error } = await supabase.from("orders").insert([orderData]);
    if (error) { alert("Erreur: " + error.message); setSending(false); return; }

    void createNotification({
      title: "Nouvelle commande",
      message: `${form.name} a créé une nouvelle commande.`,
      type: "order_created",
      module: "orders",
      entity_type: "orders",
      created_by: form.name
    });

    void runOrderSideEffects(orderData, form.name);

    setCart([]); setSending(false); setSuccess(true); setCartOpen(false); setCheckout(false);
  };

  /* ─── STATES ─── */
  if (loading) return (
    <div className="min-h-screen bg-[#f6f8f7] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-[#14C8B8]/30 border-t-[#14C8B8] rounded-full animate-spin" />
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-[#f6f8f7] flex flex-col items-center justify-center gap-4 px-4 text-center">
      <Package className="w-12 h-12 text-slate-300" />
      <p className="text-slate-500 font-medium">Produit introuvable</p>
      <button type="button" onClick={() => router.push("/store")}
        className="mod-button-primary px-5 text-white font-bold text-sm">
        ← Retour au store
      </button>
    </div>
  );

  if (success) return (
    <div className="min-h-screen bg-[#f6f8f7] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
        className="mod-card p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-[#14C8B8] rounded-[24px] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#14C8B8]/25">
          <Check className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Commande confirmée !</h2>
        <p className="text-slate-500 text-sm mb-1">Nous vous contacterons au <span className="font-semibold text-slate-700">{form.phone}</span></p>
        <p className="text-slate-400 text-xs mb-8">Paiement à la livraison · Livraison dans toute l&apos;Algérie</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button type="button" onClick={() => router.push("/store")}
            className="mod-button-primary px-6 text-white font-bold text-sm active:scale-[0.98]">
            Continuer les achats
          </button>
          <button type="button" onClick={() => { setSuccess(false); setForm({ name:"", phone:"", email:"", wilaya:"", commune:"", address:"", notes:"" }); }}
            className="mod-button-secondary px-6 text-sm font-semibold">
            Nouvelle commande
          </button>
        </div>
      </motion.div>
    </div>
  );

  /* ─── MAIN PAGE ─── */
  return (
    <div className="min-h-screen bg-[#f6f8f7]">

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080b0d]/95 text-white shadow-[0_8px_30px_rgba(0,0,0,0.18)] backdrop-blur-2xl">
        <div className="mod-container flex items-center justify-between h-16 sm:h-[76px]">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => router.push("/store")}
              className="flex items-center gap-1.5 text-sm font-semibold text-white/65 transition-colors hover:text-[#59dfaa]">
              <ArrowLeft className="w-4 h-4" /> Store
            </button>
            <span className="hidden text-white/20 sm:inline">|</span>
            {product.category && <span className="hidden text-xs text-white/45 sm:inline">{product.category}</span>}
            <span className="hidden text-white/20 sm:inline">›</span>
            <span className="hidden max-w-[200px] truncate text-xs font-medium text-white/75 sm:inline">{product.name}</span>
          </div>

          <button type="button" onClick={() => setCartOpen(true)}
            className="relative flex h-10 items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 text-sm font-bold text-white transition-all hover:border-[#14C8B8]/50 hover:text-[#59dfaa]">
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">Panier</span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#14C8B8] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ── TOAST ── */}
      <AnimatePresence>
        {addedMsg && (
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            className="fixed top-24 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#59dfaa] px-4 py-2.5 text-sm font-semibold text-[#07140f] shadow-[0_14px_36px_rgba(89,223,170,0.25)]">
            <Check className="w-4 h-4" /> {addedMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CONTENT ── */}
      <div className="mod-container py-7 sm:py-10 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-14 xl:gap-20">

          {/* ── LEFT: Gallery ── */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>

            {/* Main image */}
            <div className="group relative aspect-square overflow-hidden rounded-[24px] border border-slate-200/90 bg-[linear-gradient(145deg,#f9fcfb,#ffffff)] shadow-[0_18px_50px_rgba(15,23,42,0.07)] sm:rounded-[28px]">
              {allImgs.length > 0 ? (
                <img src={allImgs[imgIdx]} alt={product.name}
                  className="h-full w-full object-contain p-6 transition-transform duration-500 group-hover:scale-[1.045] sm:p-9" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-16 h-16 text-slate-200" />
                </div>
              )}

              {/* Discount badge */}
              {discPct > 0 && (
                <span className="absolute left-4 top-4 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                  -{discPct}%
                </span>
              )}

              {/* Out of stock */}
              {!product.in_stock && (
                <div className="absolute inset-0 flex items-center justify-center rounded-[24px] bg-white/80 backdrop-blur-sm">
                  <span className="rounded-[20px] border border-slate-200 bg-slate-100 px-6 py-3 text-sm font-bold text-slate-600">
                    Rupture de stock
                  </span>
                </div>
              )}

              {/* Arrows */}
              {allImgs.length > 1 && (
                <>
                  <button type="button" onClick={() => setImgIdx(i => (i - 1 + allImgs.length) % allImgs.length)}
                    title="Previous image"
                    className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-700 shadow-sm opacity-100 backdrop-blur-sm transition-all hover:border-[#14C8B8]/50 hover:text-[#0f766e] sm:opacity-0 sm:group-hover:opacity-100">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => setImgIdx(i => (i + 1) % allImgs.length)}
                    title="Next image"
                    className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-700 shadow-sm opacity-100 backdrop-blur-sm transition-all hover:border-[#14C8B8]/50 hover:text-[#0f766e] sm:opacity-0 sm:group-hover:opacity-100">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <span className="absolute bottom-4 right-4 rounded-full border border-slate-200 bg-white/85 px-2.5 py-1 text-xs text-slate-500 backdrop-blur-sm">
                    {imgIdx + 1} / {allImgs.length}
                  </span>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {allImgs.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {allImgs.map((img, i) => (
                  <button type="button" key={i} onClick={() => setImgIdx(i)}
                    title={`View image ${i + 1}`}
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 bg-white transition-all ${
                      imgIdx === i ? "border-[#14C8B8] shadow-md shadow-[#14C8B8]/15" : "border-slate-200 opacity-60 hover:border-slate-300 hover:opacity-100"
                    }`}>
                    <img src={img} alt="" className="w-full h-full object-contain p-1 bg-white" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* ── RIGHT: Info ── */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
            className="flex flex-col gap-5 lg:pt-2">

            {/* Category + Reference */}
            <div className="flex items-center gap-2 flex-wrap">
              {product.category && (
                <span className="rounded-full border border-[#14C8B8]/25 bg-[#14C8B8]/10 px-3 py-1 text-xs font-bold text-[#0f766e]">
                  {product.category}
                </span>
              )}
              {product.reference && (
                <span className="rounded-full bg-slate-200/75 px-2.5 py-1 font-mono text-xs text-slate-500">
                  Réf: {product.reference}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl font-semibold leading-[1.08] tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl font-extrabold tracking-tight text-[#0f766e] tabular-nums sm:text-4xl">
                {finalPrice.toLocaleString()} <span className="text-lg font-semibold">DA</span>
              </span>
              {discPct > 0 && (
                <>
                  <span className="text-base text-slate-400 line-through tabular-nums">
                    {originalPrice.toLocaleString()} DA
                  </span>
                  <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">
                    -{discPct}%
                  </span>
                </>
              )}
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${product.in_stock ? "bg-[#14C8B8]" : "bg-red-400"}`} />
              <span className={`text-sm font-semibold ${product.in_stock ? "text-[#0f766e]" : "text-red-500"}`}>
                {product.in_stock ? "En stock — livraison rapide" : "Rupture de stock"}
              </span>
            </div>

            {/* Description */}
            {product.description && (
              <p className="border-t border-slate-200 pt-5 text-[15px] leading-7 text-slate-500 sm:text-base">
                {product.description}
              </p>
            )}

            {/* Colors */}
            {product.colors?.length > 0 && (
              <div className="rounded-[20px] border border-slate-200/90 bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.04)]">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
                  Couleur {selColor && <span className="text-[#0fb3a4] normal-case font-medium ml-1">— {selColor}</span>}
                </p>
                <div className="flex gap-2 flex-wrap">
                  {product.colors.map(c => (
                    <button type="button" key={c.name} onClick={() => setSelColor(selColor === c.name ? "" : c.name)}
                      title={c.name}
                      aria-label={`Choisir la couleur ${c.name}`}
                      className={`relative h-9 w-9 rounded-full border-2 transition-all ${selColor === c.name ? "border-[#0f172a] scale-110 shadow-md ring-2 ring-[#14C8B8]/25" : "border-slate-200 hover:border-slate-300"}`}
                      style={{ backgroundColor: c.hex }}>
                      {selColor === c.name && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#14C8B8] rounded-full border-2 border-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div className="rounded-[20px] border border-slate-200/90 bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.04)]">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Taille / Dimension</p>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map(sz => (
                    <button type="button" key={sz} onClick={() => setSelSize(selSize === sz ? "" : sz)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                        selSize === sz ? "bg-[#0f172a] text-white shadow-md shadow-slate-900/15" : "border border-slate-200 bg-slate-50 text-slate-600 hover:border-[#14C8B8]/45 hover:text-[#0f766e]"
                      }`}>
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Quantité</span>
              <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))}
                  title="Decrease quantity"
                  className="flex h-10 w-10 items-center justify-center text-slate-500 transition-colors hover:bg-slate-50 hover:text-[#0f766e]">
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center text-sm font-bold text-slate-800">{qty}</span>
                <button type="button" onClick={() => setQty(q => q + 1)}
                  title="Increase quantity"
                  className="flex h-10 w-10 items-center justify-center text-slate-500 transition-colors hover:bg-slate-50 hover:text-[#0f766e]">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button type="button" onClick={addToCart} disabled={!product.in_stock}
                className={`flex min-h-14 flex-1 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-bold transition-all duration-200 active:scale-[0.98] ${
                  product.in_stock
                    ? "border-2 border-[#0f172a] bg-white text-[#0f172a] hover:border-[#0f766e] hover:bg-[#14C8B8]/10 hover:text-[#0f766e]"
                    : "cursor-not-allowed border-2 border-slate-200 bg-slate-100 text-slate-400"
                }`}>
                <ShoppingCart className="w-4 h-4" />
                Ajouter au panier
              </button>
              <button type="button" onClick={() => setCartOpen(true)}
                className="mod-button-primary flex min-h-14 flex-1 items-center justify-center gap-2 px-5 text-sm font-bold text-white active:scale-[0.98]">
                Voir le panier
                {cartCount > 0 && <span className="bg-white/20 px-1.5 py-0.5 rounded-lg text-xs">{cartCount}</span>}
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2 border-t border-slate-200 pt-5">
              {[
                { icon: Truck,  label: "Livraison",  sub: "Toute l'Algérie" },
                { icon: Shield, label: "Paiement",   sub: "À la livraison" },
                { icon: Clock,  label: "Support",    sub: "7j / 7" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center gap-1.5 rounded-[20px] border border-slate-200 bg-white p-3 text-center shadow-[0_8px_22px_rgba(15,23,42,0.035)]">
                  <Icon className="h-4 w-4 text-[#0f766e]" />
                  <span className="text-[11px] font-semibold text-slate-700">{label}</span>
                  <span className="text-[10px] text-slate-400">{sub}</span>
                </div>
              ))}
            </div>

            {/* Specs */}
            {product.specs && Object.keys(product.specs).length > 0 && (
              <div className="border-t border-slate-200 pt-5">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="w-4 h-4 text-[#14C8B8]" />
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Spécifications techniques</h3>
                </div>
                <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-white">
                  {Object.entries(product.specs).map(([key, value], i) => (
                    <div key={key} className={`flex justify-between items-center px-4 py-3 text-sm ${i % 2 === 0 ? "bg-slate-50" : "bg-white"}`}>
                      <span className="text-slate-500">{key}</span>
                      <span className="text-slate-800 font-semibold text-right ml-4">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </motion.div>
        </div>
      </div>

      {/* ── CART DRAWER ── */}
      <AnimatePresence>
        {cartOpen && (
          <div className="fixed inset-0 z-50">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => { setCartOpen(false); setCheckout(false); }} />

            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.28 }}
              className="absolute bottom-0 right-0 top-0 flex w-full flex-col bg-[#f6f8f7] shadow-2xl md:w-[500px]">

              {/* Drawer header */}
              <div className="flex shrink-0 items-center border-b border-white/10 bg-[#080b0d] px-5 py-5 text-white md:px-7">
                {checkout && (
                  <button type="button" onClick={() => setCheckout(false)} title="Go back" className="mr-2 rounded-xl p-2 text-white/65 transition-colors hover:bg-white/10 hover:text-white">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
                <h2 className="flex-1 text-base font-bold text-white">
                  {checkout ? "Finaliser la commande" : `Panier (${cartCount})`}
                </h2>
                <button type="button" onClick={() => { setCartOpen(false); setCheckout(false); }} title="Close cart" aria-label="Fermer le panier" className="rounded-xl p-2 text-white/65 transition-colors hover:bg-white/10 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Empty */}
              {!cart.length && !checkout ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-[22px] border border-[#14C8B8]/20 bg-[#14C8B8]/10">
                    <ShoppingCart className="h-7 w-7 text-[#0f766e]" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700 mb-1">Votre panier est vide</p>
                    <p className="text-sm text-slate-400">Ajoutez des produits pour commencer</p>
                  </div>
                  <button type="button" onClick={() => setCartOpen(false)}
                    className="mod-button-primary px-5 text-sm font-bold text-white active:scale-[0.98]">
                    Continuer les achats
                  </button>
                </div>

              ) : !checkout ? (
                <>
                  <div className="flex-1 space-y-3 overflow-y-auto px-5 py-5 md:px-7">
                    {cart.map((item, idx) => (
                      <div key={`${item.id}-${item.selectedColor}-${item.selectedSize}-${idx}`}
                        className="flex gap-3 rounded-[20px] border border-slate-200/90 bg-white p-3.5 shadow-[0_8px_22px_rgba(15,23,42,0.04)]">
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-[#f8fbfa]">
                          <img src={item.image} alt="" className="w-full h-full object-contain p-1" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{item.name}</p>
                          {(item.selectedColor || item.selectedSize) && (
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {[item.selectedColor && `${item.selectedColor}`, item.selectedSize && `${item.selectedSize}`].filter(Boolean).join(" · ")}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm font-bold text-[#0f766e]">{(item.price * item.qty).toLocaleString()} DA</span>
                            <div className="flex items-center gap-1">
                              <button type="button" onClick={() => updateQty(item.id, item.qty - 1, item.selectedColor, item.selectedSize)}
                                title="Decrease quantity"
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white transition-colors hover:border-[#14C8B8]/50 hover:text-[#0f766e]">
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-6 text-center text-xs font-semibold">{item.qty}</span>
                              <button type="button" onClick={() => updateQty(item.id, item.qty + 1, item.selectedColor, item.selectedSize)}
                                title="Increase quantity"
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white transition-colors hover:border-[#14C8B8]/50 hover:text-[#0f766e]">
                                <Plus className="w-3 h-3" />
                              </button>
                              <button type="button" onClick={() => removeItem(item.id, item.selectedColor, item.selectedSize)}
                                title="Remove item"
                                className="ml-1 flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white transition-all hover:border-red-200 hover:text-red-500">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="shrink-0 border-t border-slate-200 bg-white px-5 py-5 md:px-7">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-slate-500">Total</span>
                      <span className="text-lg font-extrabold tracking-tight text-[#0f766e]">{cartTotal.toLocaleString()} DA</span>
                    </div>
                    <button type="button" onClick={() => setCheckout(true)}
                      className="mod-button-primary w-full px-5 text-sm font-bold text-white active:scale-[0.98]">
                      Commander ({cartCount} produit{cartCount > 1 ? "s" : ""})
                    </button>
                  </div>
                </>

              ) : (
                <>
                  <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5 md:px-7">
                    {/* Summary */}
                    <div className="rounded-[20px] border border-[#14C8B8]/25 bg-[#14C8B8]/10 p-4">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#0f766e]">Récapitulatif</p>
                      {cart.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-xs text-slate-600 mb-1.5">
                          <span className="truncate mr-2">{item.name} ×{item.qty}{item.selectedColor && ` · ${item.selectedColor}`}{item.selectedSize && ` · ${item.selectedSize}`}</span>
                          <span className="shrink-0 font-semibold text-[#0f766e]">{(item.price * item.qty).toLocaleString()} DA</span>
                        </div>
                      ))}
                      <div className="mt-2 flex justify-between border-t border-[#14C8B8]/25 pt-3 text-sm font-bold">
                        <span>Total</span>
                        <span className="text-[#0f766e]">{cartTotal.toLocaleString()} DA</span>
                      </div>
                    </div>

                    <Field label="Nom complet *"><input placeholder="Nom complet" title="Full name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputCls} /></Field>
                    <Field label="Téléphone *"><input type="tel" placeholder="ex. 06 XX XX XX XX" title="Phone number" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className={inputCls} /></Field>
                    <Field label="Email"><input type="email" placeholder="ex@email.com" title="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inputCls} /></Field>
                    <Field label="Wilaya *">
                      <select value={form.wilaya} onChange={e => setForm(f => ({ ...f, wilaya: e.target.value }))} title="Select wilaya" className={inputCls}>
                        <option value="">Sélectionnez une wilaya</option>
                        {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
                      </select>
                    </Field>
                    <Field label="Commune *"><input placeholder="Commune" value={form.commune} onChange={e => setForm(f => ({ ...f, commune: e.target.value }))} className={inputCls} /></Field>
                    <Field label="Adresse complète *"><input placeholder="Rue, numéro, cité..." value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className={inputCls} /></Field>
                    <Field label="Notes"><textarea placeholder="Instructions particulières..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} className={`${inputCls} resize-none`} /></Field>
                  </div>

                  <div className="shrink-0 border-t border-slate-200 bg-white px-5 py-5 md:px-7">
                    <button type="button" onClick={sendOrder} disabled={sending}
                      className="mod-button-primary flex w-full items-center justify-center gap-2 px-5 text-sm font-bold text-white disabled:opacity-50 active:scale-[0.98]">
                      {sending
                        ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Envoi...</>
                        : "Confirmer la commande"}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
