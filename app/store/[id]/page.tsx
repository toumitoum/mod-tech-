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

const inputCls = "w-full bg-slate-50 border border-slate-200 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 rounded-xl px-4 py-2.5 text-sm text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400";

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
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
      <Package className="w-12 h-12 text-slate-300" />
      <p className="text-slate-500 font-medium">Produit introuvable</p>
      <button type="button" onClick={() => router.push("/store")}
        className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-xl text-sm transition-all">
        ← Retour au store
      </button>
    </div>
  );

  if (success) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-xl border border-slate-100 p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-teal-500/25">
          <Check className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Commande confirmée !</h2>
        <p className="text-slate-500 text-sm mb-1">Nous vous contacterons au <span className="font-semibold text-slate-700">{form.phone}</span></p>
        <p className="text-slate-400 text-xs mb-8">Paiement à la livraison · Livraison dans toute l&apos;Algérie</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button type="button" onClick={() => router.push("/store")}
            className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-xl text-sm transition-all active:scale-[0.98]">
            Continuer les achats
          </button>
          <button type="button" onClick={() => { setSuccess(false); setForm({ name:"", phone:"", email:"", wilaya:"", commune:"", address:"", notes:"" }); }}
            className="px-6 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold rounded-xl text-sm transition-all">
            Nouvelle commande
          </button>
        </div>
      </motion.div>
    </div>
  );

  /* ─── MAIN PAGE ─── */
  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-15 sm:h-16">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => router.push("/store")}
              className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-teal-600 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Store
            </button>
            <span className="text-slate-200 hidden sm:inline">|</span>
            {product.category && <span className="hidden sm:inline text-xs text-slate-400">{product.category}</span>}
            <span className="text-slate-200 hidden sm:inline">›</span>
            <span className="hidden sm:inline text-xs text-slate-600 font-medium truncate max-w-[200px]">{product.name}</span>
          </div>

          <button type="button" onClick={() => setCartOpen(true)}
            className="relative flex items-center gap-2 px-3 h-9 rounded-xl border border-slate-200 text-slate-600 hover:border-teal-300 hover:text-teal-600 transition-all text-sm font-medium">
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">Panier</span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-teal-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow">
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
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-teal-500 text-white px-4 py-2.5 rounded-full shadow-lg text-sm font-semibold">
            <Check className="w-4 h-4" /> {addedMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CONTENT ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-14">

          {/* ── LEFT: Gallery ── */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>

            {/* Main image */}
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-white border border-slate-100 shadow-sm mb-3 group">
              {allImgs.length > 0 ? (
                <img src={allImgs[imgIdx]} alt={product.name}
                  className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-16 h-16 text-slate-200" />
                </div>
              )}

              {/* Discount badge */}
              {discPct > 0 && (
                <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                  -{discPct}%
                </span>
              )}

              {/* Out of stock */}
              {!product.in_stock && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-3xl">
                  <span className="bg-slate-100 border border-slate-200 text-slate-600 font-bold px-6 py-3 rounded-2xl text-sm">
                    Rupture de stock
                  </span>
                </div>
              )}

              {/* Arrows */}
              {allImgs.length > 1 && (
                <>
                  <button type="button" onClick={() => setImgIdx(i => (i - 1 + allImgs.length) % allImgs.length)}
                    title="Previous image"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white border border-slate-100 text-slate-700 flex items-center justify-center shadow transition-all opacity-0 group-hover:opacity-100">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => setImgIdx(i => (i + 1) % allImgs.length)}
                    title="Next image"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white border border-slate-100 text-slate-700 flex items-center justify-center shadow transition-all opacity-0 group-hover:opacity-100">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <span className="absolute bottom-3 right-3 text-xs text-slate-500 bg-white/80 backdrop-blur-sm border border-slate-100 px-2.5 py-1 rounded-full">
                    {imgIdx + 1} / {allImgs.length}
                  </span>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {allImgs.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImgs.map((img, i) => (
                  <button type="button" key={i} onClick={() => setImgIdx(i)}
                    title={`View image ${i + 1}`}
                    className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      imgIdx === i ? "border-teal-500 shadow-md shadow-teal-100" : "border-transparent opacity-50 hover:opacity-80"
                    }`}>
                    <img src={img} alt="" className="w-full h-full object-contain p-1 bg-white" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* ── RIGHT: Info ── */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
            className="flex flex-col gap-5">

            {/* Category + Reference */}
            <div className="flex items-center gap-2 flex-wrap">
              {product.category && (
                <span className="text-xs font-semibold text-teal-600 bg-teal-50 border border-teal-100 px-3 py-1 rounded-full">
                  {product.category}
                </span>
              )}
              {product.reference && (
                <span className="text-xs text-slate-400 font-mono bg-slate-100 px-2.5 py-1 rounded-full">
                  Réf: {product.reference}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl sm:text-4xl font-extrabold text-teal-600 tabular-nums">
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
              <span className={`w-2 h-2 rounded-full ${product.in_stock ? "bg-teal-500" : "bg-red-400"}`} />
              <span className={`text-sm font-medium ${product.in_stock ? "text-teal-600" : "text-red-500"}`}>
                {product.in_stock ? "En stock — livraison rapide" : "Rupture de stock"}
              </span>
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-slate-500 text-[15px] leading-relaxed border-t border-slate-100 pt-5">
                {product.description}
              </p>
            )}

            {/* Colors */}
            {product.colors?.length > 0 && (
              <div className="bg-white border border-slate-100 rounded-2xl p-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
                  Couleur {selColor && <span className="text-teal-600 normal-case font-medium ml-1">— {selColor}</span>}
                </p>
                <div className="flex gap-2 flex-wrap">
                  {product.colors.map(c => (
                    <button type="button" key={c.name} onClick={() => setSelColor(selColor === c.name ? "" : c.name)}
                      title={c.name}
                      className={`relative w-9 h-9 rounded-full border-2 transition-all ${selColor === c.name ? "border-teal-500 scale-110 shadow-md" : "border-slate-200 hover:border-slate-300"}`}
                      style={{ backgroundColor: c.hex }}>
                      {selColor === c.name && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-teal-500 rounded-full border-2 border-white flex items-center justify-center">
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
              <div className="bg-white border border-slate-100 rounded-2xl p-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Taille / Dimension</p>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map(sz => (
                    <button type="button" key={sz} onClick={() => setSelSize(selSize === sz ? "" : sz)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                        selSize === sz ? "bg-teal-500 text-white shadow-md shadow-teal-500/20" : "bg-slate-50 border border-slate-200 text-slate-600 hover:border-teal-200"
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
              <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden">
                <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))}
                  title="Decrease quantity"
                  className="w-9 h-9 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-teal-600 transition-colors">
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center text-sm font-bold text-slate-800">{qty}</span>
                <button type="button" onClick={() => setQty(q => q + 1)}
                  title="Increase quantity"
                  className="w-9 h-9 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-teal-600 transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button type="button" onClick={addToCart} disabled={!product.in_stock}
                className={`flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 active:scale-[0.98] ${
                  product.in_stock
                    ? "bg-white border-2 border-teal-500 text-teal-600 hover:bg-teal-50"
                    : "bg-slate-100 border-2 border-slate-200 text-slate-400 cursor-not-allowed"
                }`}>
                <ShoppingCart className="w-4 h-4" />
                Ajouter au panier
              </button>
              <button type="button" onClick={() => setCartOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-sm font-bold bg-teal-500 hover:bg-teal-400 text-white shadow-lg shadow-teal-500/25 transition-all duration-200 active:scale-[0.98]">
                Voir le panier
                {cartCount > 0 && <span className="bg-white/20 px-1.5 py-0.5 rounded-lg text-xs">{cartCount}</span>}
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-5">
              {[
                { icon: Truck,  label: "Livraison",  sub: "Toute l'Algérie" },
                { icon: Shield, label: "Paiement",   sub: "À la livraison" },
                { icon: Clock,  label: "Support",    sub: "7j / 7" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center gap-1.5 text-center p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <Icon className="w-4 h-4 text-teal-500" />
                  <span className="text-[11px] font-semibold text-slate-700">{label}</span>
                  <span className="text-[10px] text-slate-400">{sub}</span>
                </div>
              ))}
            </div>

            {/* Specs */}
            {product.specs && Object.keys(product.specs).length > 0 && (
              <div className="border-t border-slate-100 pt-5">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="w-4 h-4 text-teal-500" />
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Spécifications techniques</h3>
                </div>
                <div className="rounded-2xl overflow-hidden border border-slate-100">
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
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => { setCartOpen(false); setCheckout(false); }} />

            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.28 }}
              className="absolute top-0 right-0 bottom-0 w-full md:w-[480px] bg-white shadow-2xl flex flex-col">

              {/* Drawer header */}
              <div className="px-5 md:px-6 py-4 border-b border-slate-100 flex items-center shrink-0">
                {checkout && (
                  <button type="button" onClick={() => setCheckout(false)} title="Go back" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 mr-2 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
                <h2 className="text-base font-bold text-slate-900 flex-1">
                  {checkout ? "Finaliser la commande" : `Panier (${cartCount})`}
                </h2>
                <button type="button" onClick={() => { setCartOpen(false); setCheckout(false); }} title="Close cart" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Empty */}
              {!cart.length && !checkout ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                    <ShoppingCart className="w-7 h-7 text-slate-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700 mb-1">Votre panier est vide</p>
                    <p className="text-sm text-slate-400">Ajoutez des produits pour commencer</p>
                  </div>
                  <button type="button" onClick={() => setCartOpen(false)}
                    className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-white text-sm font-bold rounded-xl transition-all active:scale-[0.98]">
                    Continuer les achats
                  </button>
                </div>

              ) : !checkout ? (
                <>
                  <div className="flex-1 overflow-y-auto px-5 md:px-6 py-4 space-y-3">
                    {cart.map((item, idx) => (
                      <div key={`${item.id}-${item.selectedColor}-${item.selectedSize}-${idx}`}
                        className="flex gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="w-14 h-14 rounded-xl bg-white border border-slate-100 overflow-hidden shrink-0">
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
                            <span className="text-sm font-bold text-teal-600">{(item.price * item.qty).toLocaleString()} DA</span>
                            <div className="flex items-center gap-1">
                              <button type="button" onClick={() => updateQty(item.id, item.qty - 1, item.selectedColor, item.selectedSize)}
                                title="Decrease quantity"
                                className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:border-teal-300 transition-colors">
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-6 text-center text-xs font-semibold">{item.qty}</span>
                              <button type="button" onClick={() => updateQty(item.id, item.qty + 1, item.selectedColor, item.selectedSize)}
                                title="Increase quantity"
                                className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:border-teal-300 transition-colors">
                                <Plus className="w-3 h-3" />
                              </button>
                              <button type="button" onClick={() => removeItem(item.id, item.selectedColor, item.selectedSize)}
                                title="Remove item"
                                className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:border-red-200 hover:text-red-500 transition-all ml-1">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-5 md:px-6 py-4 border-t border-slate-100 bg-white shrink-0">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-slate-500">Total</span>
                      <span className="text-lg font-extrabold text-teal-600">{cartTotal.toLocaleString()} DA</span>
                    </div>
                    <button type="button" onClick={() => setCheckout(true)}
                      className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-teal-500/20 active:scale-[0.98]">
                      Commander ({cartCount} produit{cartCount > 1 ? "s" : ""})
                    </button>
                  </div>
                </>

              ) : (
                <>
                  <div className="flex-1 overflow-y-auto px-5 md:px-6 py-4 space-y-4">
                    {/* Summary */}
                    <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4">
                      <p className="text-xs font-semibold text-teal-700 uppercase tracking-wider mb-3">Récapitulatif</p>
                      {cart.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-xs text-slate-600 mb-1.5">
                          <span className="truncate mr-2">{item.name} ×{item.qty}{item.selectedColor && ` · ${item.selectedColor}`}{item.selectedSize && ` · ${item.selectedSize}`}</span>
                          <span className="font-semibold text-teal-600 shrink-0">{(item.price * item.qty).toLocaleString()} DA</span>
                        </div>
                      ))}
                      <div className="flex justify-between font-bold text-sm pt-3 mt-2 border-t border-teal-200">
                        <span>Total</span>
                        <span className="text-teal-600">{cartTotal.toLocaleString()} DA</span>
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

                  <div className="px-5 md:px-6 py-4 border-t border-slate-100 bg-white shrink-0">
                    <button type="button" onClick={sendOrder} disabled={sending}
                      className="w-full py-3 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-teal-500/20 active:scale-[0.98] flex items-center justify-center gap-2">
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
