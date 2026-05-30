"use client";

import { supabase } from "@/app/supabase";
import { AnimatePresence,motion } from "framer-motion";
import {
ArrowLeft,
Check,
ChevronLeft,ChevronRight,
Clock,
Menu,
Minus,
Package,
Plus,
Search,
Shield,
ShoppingCart,
Trash2,
Truck,
X
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect,useMemo,useState } from "react";

/* ─────────────── TYPES ─────────────── */

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  original_price: number;
  discount_percent: number;
  image: string;
  images: string[];
  category: string;
  is_active: boolean;
  sort_order: number;
  in_stock: boolean;
  colors: { name: string; hex: string }[];
  sizes: string[];
};

type CartItem = Product & { qty: number; selectedColor?: string; selectedSize?: string };

type OrderForm = {
  name: string; phone: string; email: string;
  wilaya: string; commune: string; address: string; notes: string;
};

type StoreHero = {
  title: string; subtitle: string; badge: string;
  bgImage: string; btnPrimary: string; btnSecondary: string;
};

type ContactInfo = {
  phone1?: string;
};

type Slide = {
  id: number; title: string; description: string;
  image: string; sort_order: number; is_active: boolean;
};

/* ─────────────── CONSTANTS ─────────────── */

const CATS = ["Tous", "Caméras", "Réseau", "Accès", "Sonorisation", "Domotique", "Autre"];

const WILAYAS = ["Adrar","Chlef","Laghouat","Oum El Bouaghi","Batna","Béjaïa","Biskra","Béchar","Blida","Bouira","Tamanrasset","Tébessa","Tlemcen","Tiaret","Tizi Ouzou","Alger","Djelfa","Jijel","Sétif","Saïda","Skikda","Sidi Bel Abbès","Annaba","Guelma","Constantine","Médéa","Mostaganem","M'Sila","Mascara","Ouargla","Oran","El Bayadh","Illizi","Bordj Bou Arreridj","Boumerdès","El Tarf","Tindouf","Tissemsilt","El Oued","Khenchela","Souk Ahras","Tipaza","Mila","Aïn Defla","Naâma","Aïn Témouchent","Ghardaïa","Relizane","Timimoun","Bordj Badji Mokhtar","Ouled Djellal","Béni Abbès","In Salah","In Guezzam","Touggourt","Djanet","El M'Ghair","El Menia"];

const DEFAULT_STORE_HERO: StoreHero = {
  title: "Équipements Professionnels",
  subtitle: "Sécurité · Réseau · Domotique — Livraison dans toute l'Algérie",
  badge: "NOTRE CATALOGUE",
  bgImage: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=2000&q=80",
  btnPrimary: "Commander maintenant",
  btnSecondary: "Découvrir",
};

const CART_KEY = "modtech_cart";
const loadCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); } catch { return []; }
};
const saveCart = (cart: CartItem[]) => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new CustomEvent("cartUpdated", { detail: cart }));
};

/* ─────────────── FIELD ─────────────── */

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

export default function StorePage() {
  const router = useRouter();

  const [products, setProducts]               = useState<Product[]>([]);
  const [slides, setSlides]                   = useState<Slide[]>([]);
  const [heroData, setHeroData]               = useState<StoreHero>(DEFAULT_STORE_HERO);
  const [contact, setContact]                 = useState<ContactInfo>({});
  const [slideIdx, setSlideIdx]               = useState(0);
  const [loading, setLoading]                 = useState(true);
  const [cat, setCat]                         = useState("Tous");
  const [search, setSearch]                   = useState("");
  const [searchOpen, setSearchOpen]           = useState(false);
  const [cart, setCart]                       = useState<CartItem[]>(() => (typeof window === "undefined" ? [] : loadCart()));
  const [cartOpen, setCartOpen]               = useState(false);
  const [checkout, setCheckout]               = useState(false);
  const [sending, setSending]                 = useState(false);
  const [success, setSuccess]                 = useState(false);
  const [mobileMenu, setMobileMenu]           = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, { color?: string; size?: string }>>({});
  const [addedMsg, setAddedMsg]               = useState("");
  const [form, setForm]                       = useState<OrderForm>({ name:"", phone:"", email:"", wilaya:"", commune:"", address:"", notes:"" });

  /* mount */
  useEffect(() => { saveCart(cart); }, [cart]);

  /* data */
  useEffect(() => {
    const load = async () => {
      const [prodRes, slideRes, heroRes, contactRes] = await Promise.all([
        supabase.from("products").select("*").eq("is_active", true).order("sort_order"),
        supabase.from("slider_slides").select("*").eq("is_active", true).order("sort_order"),
        supabase.from("site_content").select("content").eq("section", "store-hero").single(),
        supabase.from("site_content").select("content").eq("section", "contact").single(),
      ]);
      setProducts(prodRes.data ?? []);
      setSlides(slideRes.data ?? []);
      if (heroRes.data?.content) setHeroData({ ...DEFAULT_STORE_HERO, ...heroRes.data.content });
      if (contactRes.data?.content) setContact(contactRes.data.content);
      setLoading(false);
    };
    load();
  }, []);

  /* auto-slide */
  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setSlideIdx(p => (p + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);

  /* filter */
  const filteredProducts = useMemo(() => {
    let f = products;
    if (cat !== "Tous") f = f.filter(p => p.category === cat);
    if (search) f = f.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase()));
    return f;
  }, [cat, search, products]);

  /* resize close menu */
  useEffect(() => {
    const fn = () => { if (window.innerWidth >= 1024) setMobileMenu(false); };
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  /* cart helpers */
  const addToCart = (p: Product) => {
    const opts = selectedOptions[p.id] || {};
    setCart(prev => {
      const ex = prev.find(i => i.id === p.id && i.selectedColor === opts.color && i.selectedSize === opts.size);
      return ex
        ? prev.map(i => i.id === p.id && i.selectedColor === opts.color && i.selectedSize === opts.size ? { ...i, qty: i.qty + 1 } : i)
        : [...prev, { ...p, qty: 1, selectedColor: opts.color, selectedSize: opts.size }];
    });
    setAddedMsg("Produit ajouté !");
    setTimeout(() => setAddedMsg(""), 2500);
    setCartOpen(true);
  };

  const updateQty = (id: number, qty: number, color?: string, size?: string) => {
    if (qty < 1) { removeFromCart(id, color, size); return; }
    setCart(prev => prev.map(i => i.id === id && i.selectedColor === color && i.selectedSize === size ? { ...i, qty } : i));
  };

  const removeFromCart = (id: number, color?: string, size?: string) =>
    setCart(prev => prev.filter(i => !(i.id === id && i.selectedColor === color && i.selectedSize === size)));

  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const updateOption = (pid: number, type: "color" | "size", val: string) =>
    setSelectedOptions(prev => ({ ...prev, [pid]: { ...prev[pid], [type]: val } }));

  /* send order */
  const sendOrder = async () => {
    if (!form.name || !form.phone || !form.wilaya || !form.commune || !form.address) {
      alert("Veuillez remplir tous les champs obligatoires"); return;
    }
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

    try { await fetch("/api/send-order-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ order: orderData }) }); }
    catch (e) { console.log("Email skipped:", e); }

    setCart([]); setSending(false); setSuccess(true); setCartOpen(false); setCheckout(false);
  };

  /* ─── LOADING ─── */
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
      </div>
    );

  /* ─── SUCCESS ─── */
  if (success)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-xl border border-slate-100 p-10 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-teal-500/25">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Commande confirmée !</h2>
          <p className="text-slate-500 mb-1 text-sm">Nous vous contacterons au <span className="font-semibold text-slate-700">{form.phone}</span></p>
          <p className="text-slate-400 text-xs mb-8">Paiement à la livraison · Livraison dans toute l&apos;Algérie</p>
          <button
            onClick={() => { setSuccess(false); setForm({ name:"", phone:"", email:"", wilaya:"", commune:"", address:"", notes:"" }); }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-xl text-sm transition-all duration-200 shadow-md shadow-teal-500/20 active:scale-[0.98]"
          >
            Nouvelle commande
          </button>
        </motion.div>
      </div>
    );

  /* ─── PAGE ─── */
  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-15 sm:h-16">

          {/* Left */}
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenu(!mobileMenu)} className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:border-teal-300 hover:text-teal-600 transition-all">
              <Menu className="w-4 h-4" />
            </button>
            <Link href="/" className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-teal-600 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Accueil
            </Link>
            <span className="hidden sm:inline text-slate-200">|</span>
            <span className="hidden sm:inline text-sm font-bold text-slate-800">MOD-TECH <span className="text-teal-500">Store</span></span>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <button onClick={() => setSearchOpen(v => !v)} className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:border-teal-300 hover:text-teal-600 transition-all">
              <Search className="w-4 h-4" />
            </button>
            <button onClick={() => setCartOpen(true)} className="relative flex items-center gap-2 px-3 h-9 rounded-xl border border-slate-200 text-slate-600 hover:border-teal-300 hover:text-teal-600 transition-all text-sm font-medium">
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Panier</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-teal-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── SEARCH OVERLAY ── */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-slate-900/20 backdrop-blur-sm"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={e => e.stopPropagation()}
              className="bg-white border-b border-slate-100 px-4 py-4 shadow-lg"
            >
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  autoFocus value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Rechercher un produit..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none transition-all"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MOBILE MENU ── */}
      <AnimatePresence>
        {mobileMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="lg:hidden fixed top-[61px] left-0 right-0 bg-white border-b border-slate-100 z-40 shadow-md overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {[{ label: "Accueil", href: "/" }, { label: "Store", href: "/store" }].map(l => (
                <a key={l.href} href={l.href} className="block px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-600 transition-all">{l.label}</a>
              ))}
              <button onClick={() => { setCartOpen(true); setMobileMenu(false); }} className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-600 transition-all">
                Panier ({cartCount})
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {mobileMenu && <div className="fixed inset-0 z-30" onClick={() => setMobileMenu(false)} />}

      {/* ── ADDED TO CART TOAST ── */}
      <AnimatePresence>
        {addedMsg && (
          <motion.div
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-teal-500 text-white px-4 py-2.5 rounded-full shadow-lg text-sm font-semibold"
          >
            <Check className="w-4 h-4" /> {addedMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SLIDER ── */}
      {slides.length > 0 ? (
        <section className="w-full bg-white border-b border-slate-100">
          <div className="relative w-full overflow-hidden group">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${slideIdx * 100}%)` }}
            >
              {slides.map(slide => (
                <div key={slide.id} className="min-w-full relative">
                  <img
                    src={slide.image} alt={slide.title || "Slide"}
                    className="w-full h-[180px] md:h-[260px] lg:h-[320px] object-contain bg-white"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  {slide.title && (
                    <div className="absolute bottom-8 left-0 right-0 text-center px-6">
                      <h3 className="text-white font-bold text-base md:text-xl drop-shadow">{slide.title}</h3>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {slides.length > 1 && (
              <>
                <button onClick={() => setSlideIdx(p => (p - 1 + slides.length) % slides.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm border border-white/30 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setSlideIdx(p => (p + 1) % slides.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm border border-white/30 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                  <ChevronRight className="w-4 h-4" />
                </button>
                <div className="absolute bottom-3 right-4 flex gap-1.5">
                  {slides.map((_, i) => (
                    <button key={i} onClick={() => setSlideIdx(i)}
                      className={`rounded-full transition-all duration-300 ${i === slideIdx ? "w-5 h-1.5 bg-teal-400" : "w-1.5 h-1.5 bg-white/50"}`} />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      ) : (
        <section className="relative h-[260px] w-full flex items-center overflow-hidden bg-slate-900">
          <img src={heroData.bgImage} alt="Hero" className="absolute inset-0 w-full h-full object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
          <div className="relative z-10 max-w-7xl mx-auto px-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="inline-block text-xs bg-teal-500/20 border border-teal-400/30 text-teal-300 px-3 py-1 rounded-full mb-4 uppercase tracking-widest font-semibold">{heroData.badge}</span>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white mb-3">{heroData.title}</h1>
              <p className="text-sm text-slate-300">{heroData.subtitle}</p>
            </motion.div>
          </div>
        </section>
      )}

      {/* ── CATEGORIES ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        <div className="flex flex-wrap items-center gap-2">
          {CATS.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                cat === c
                  ? "bg-teal-500 text-white shadow-md shadow-teal-500/20"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-teal-300 hover:text-teal-600"
              }`}
            >{c}</button>
          ))}
          <span className="ml-auto text-xs text-slate-400 font-medium">
            {filteredProducts.length} produit{filteredProducts.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* ── PRODUCTS ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-24 flex flex-col items-center gap-4">
            <Package className="w-12 h-12 text-slate-300" />
            <p className="text-slate-500 font-medium">Aucun produit trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
            {filteredProducts.map((p, i) => {
              const disc = p.discount_percent || 0;
              const opts = selectedOptions[p.id] || {};
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.4 }}
                  className="bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-slate-200/60 hover:border-teal-200 transition-all duration-300 flex flex-col group"
                >
                  {/* Image */}
                  <div
                    className="relative h-36 md:h-44 bg-white overflow-hidden cursor-pointer"
                    onClick={() => router.push(`/store/${p.id}`)}
                  >
                    <img src={p.image} alt={p.name} className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-500" />
                    {disc > 0 && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">-{disc}%</span>
                    )}
                    {!p.in_stock && (
                      <span className="absolute top-2 left-2 bg-slate-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Épuisé</span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-3 flex flex-col flex-1 gap-2">
                    <h3 className="text-xs md:text-sm font-semibold text-slate-800 leading-snug line-clamp-2">{p.name}</h3>

                    {/* Colors */}
                    {p.colors?.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {p.colors.map(c => (
                          <button key={c.name} onClick={() => updateOption(p.id, "color", c.name)}
                            style={{ backgroundColor: c.hex }}
                            title={c.name}
                            className={`w-4 h-4 rounded-full border-2 transition-transform ${opts.color === c.name ? "border-teal-500 scale-110" : "border-transparent"}`}
                          />
                        ))}
                      </div>
                    )}

                    {/* Sizes */}
                    {p.sizes?.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {p.sizes.map(s => (
                          <button key={s} onClick={() => updateOption(p.id, "size", s)}
                            className={`text-[10px] px-1.5 py-0.5 rounded border transition-all ${opts.size === s ? "bg-teal-500 text-white border-teal-500" : "bg-white text-slate-600 border-slate-200 hover:border-teal-300"}`}>
                            {s}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Price + Add */}
                    <div className="flex items-end justify-between mt-auto pt-2 border-t border-slate-50">
                      <div>
                        <p className="text-teal-600 font-bold text-sm md:text-base leading-none">{p.price.toLocaleString()} <span className="text-xs font-medium">DA</span></p>
                        {disc > 0 && p.original_price > 0 && (
                          <p className="text-[10px] text-slate-400 line-through mt-0.5">{p.original_price.toLocaleString()} DA</p>
                        )}
                      </div>
                      <button
                        onClick={() => addToCart(p)}
                        disabled={!p.in_stock}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${
                          p.in_stock ? "bg-teal-500 hover:bg-teal-400 text-white shadow-sm shadow-teal-500/20 active:scale-95" : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* ── TRUST BAR ── */}
      <div className="bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center">
            <div className="flex items-center gap-3 col-span-2 md:col-span-1">
              <img src="/lovable-uploads/5c0baea8-dfe7-4330-a35f-643db8adb0b0.png" className="h-9 w-auto" alt="logo" />
              <div>
                <p className="text-sm font-bold text-slate-800">MOD-TECH</p>
                {contact?.phone1 && <p className="text-xs text-slate-400">{contact.phone1}</p>}
              </div>
            </div>
            {[
              { icon: Truck,  title: "Livraison rapide",   sub: "Toute l'Algérie" },
              { icon: Shield, title: "Paiement sécurisé",  sub: "À la livraison"  },
              { icon: Clock,  title: "Support 7j/7",       sub: "Réponse rapide"  },
            ].map(({ icon: Icon, title, sub }, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-teal-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">{title}</p>
                  <p className="text-[10px] text-slate-400">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CART DRAWER ── */}
      <AnimatePresence>
        {cartOpen && (
          <div className="fixed inset-0 z-50">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => { setCartOpen(false); setCheckout(false); }}
            />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.28 }}
              className="absolute top-0 right-0 bottom-0 w-full md:w-[480px] bg-white shadow-2xl flex flex-col"
            >
              {/* Drawer header */}
              <div className="px-5 md:px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                {checkout && (
                  <button onClick={() => setCheckout(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 mr-2 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
                <h2 className="text-base font-bold text-slate-900 flex-1">
                  {checkout ? "Finaliser la commande" : `Panier (${cartCount})`}
                </h2>
                <button onClick={() => { setCartOpen(false); setCheckout(false); }} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
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
                  <button onClick={() => setCartOpen(false)} className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-white text-sm font-bold rounded-xl transition-all duration-200 active:scale-[0.98]">
                    Continuer les achats
                  </button>
                </div>

              ) : !checkout ? (
                <>
                  {/* Cart items */}
                  <div className="flex-1 overflow-y-auto px-5 md:px-6 py-4 space-y-3">
                    {cart.map((item, idx) => (
                      <div key={`${item.id}-${item.selectedColor}-${item.selectedSize}-${idx}`}
                        className="flex gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="w-14 h-14 rounded-xl bg-white border border-slate-100 overflow-hidden shrink-0">
                          <img src={item.image} alt="" className="w-full h-full object-contain p-1" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 leading-snug truncate">{item.name}</p>
                          {(item.selectedColor || item.selectedSize) && (
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {[item.selectedColor && `Couleur: ${item.selectedColor}`, item.selectedSize && `Taille: ${item.selectedSize}`].filter(Boolean).join(" · ")}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm font-bold text-teal-600">{(item.price * item.qty).toLocaleString()} DA</span>
                            <div className="flex items-center gap-1">
                              <button onClick={() => updateQty(item.id, item.qty - 1, item.selectedColor, item.selectedSize)}
                                className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:border-teal-300 transition-colors">
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-6 text-center text-xs font-semibold">{item.qty}</span>
                              <button onClick={() => updateQty(item.id, item.qty + 1, item.selectedColor, item.selectedSize)}
                                className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:border-teal-300 transition-colors">
                                <Plus className="w-3 h-3" />
                              </button>
                              <button onClick={() => removeFromCart(item.id, item.selectedColor, item.selectedSize)}
                                className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:border-red-200 hover:text-red-500 transition-all ml-1">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Cart footer */}
                  <div className="px-5 md:px-6 py-4 border-t border-slate-100 bg-white shrink-0">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-slate-500">Total</span>
                      <span className="text-lg font-extrabold text-teal-600">{cartTotal.toLocaleString()} DA</span>
                    </div>
                    <button onClick={() => setCheckout(true)}
                      className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-white font-bold text-sm rounded-xl transition-all duration-200 shadow-md shadow-teal-500/20 active:scale-[0.98]">
                      Commander ({cartCount} produit{cartCount > 1 ? "s" : ""})
                    </button>
                  </div>
                </>

              ) : (
                <>
                  {/* Checkout form */}
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

                    {/* Fields */}
                    <Field label="Nom complet *">
                      <input  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputCls} />
                    </Field>
                    <Field label="Téléphone *">
                      <input type="tel" placeholder="ex. 06 XX XX XX XX" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className={inputCls} />
                    </Field>
                    <Field label="Email">
                      <input type="email" placeholder="ex@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inputCls} />
                    </Field>
                    <Field label="Wilaya *">
                      <select value={form.wilaya} onChange={e => setForm(f => ({ ...f, wilaya: e.target.value }))} className={inputCls}>
                        <option value="">Sélectionnez une wilaya</option>
                        {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
                      </select>
                    </Field>
                    <Field label="Commune *">
                      <input placeholder="Commune" value={form.commune} onChange={e => setForm(f => ({ ...f, commune: e.target.value }))} className={inputCls} />
                    </Field>
                    <Field label="Adresse complète *">
                      <input placeholder="Rue, numéro, cité..." value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className={inputCls} />
                    </Field>
                    <Field label="Notes">
                      <textarea placeholder="Instructions particulières..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} className={`${inputCls} resize-none`} />
                    </Field>
                  </div>

                  {/* Checkout footer */}
                  <div className="px-5 md:px-6 py-4 border-t border-slate-100 bg-white shrink-0 space-y-2">
                    <button onClick={sendOrder} disabled={sending}
                      className="w-full py-3 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all duration-200 shadow-md shadow-teal-500/20 active:scale-[0.98] flex items-center justify-center gap-2">
                      {sending ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Envoi...</> : "Confirmer la commande"}
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
