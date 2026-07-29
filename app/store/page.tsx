"use client";

import { supabase } from "@/app/supabase";
import { createNotification } from "@/features/admin/services/notification.service";
import { AnimatePresence,motion } from "framer-motion";
import { runOrderSideEffects } from "./order-side-effects";
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
  selling_price?: number | null;
  discounted_price?: number | null;
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

const getDisplayPrice = (product: Product) => {
  const discounted = Number(product.discounted_price);
  return discounted > 0 ? discounted : product.price;
};

const getOriginalPrice = (product: Product) => {
  const selling = Number(product.selling_price);
  return selling > 0 ? selling : product.original_price;
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

const inputCls = "mod-input w-full px-4 text-sm outline-none placeholder:text-slate-400";

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
        : [...prev, { ...p, price: getDisplayPrice(p), qty: 1, selectedColor: opts.color, selectedSize: opts.size }];
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

  /* ─── LOADING ─── */
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f8f7]">
        <div className="w-10 h-10 border-2 border-[#14C8B8]/30 border-t-[#14C8B8] rounded-full animate-spin" />
      </div>
    );

  /* ─── SUCCESS ─── */
  if (success)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f8f7] p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mod-card p-10 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-[#14C8B8] rounded-[24px] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#14C8B8]/25">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Commande confirmée !</h2>
          <p className="text-slate-500 mb-1 text-sm">Nous vous contacterons au <span className="font-semibold text-slate-700">{form.phone}</span></p>
          <p className="text-slate-400 text-xs mb-8">Paiement à la livraison · Livraison dans toute l&apos;Algérie</p>
          <button type="button"
            onClick={() => { setSuccess(false); setForm({ name:"", phone:"", email:"", wilaya:"", commune:"", address:"", notes:"" }); }}
            className="mod-button-primary inline-flex items-center gap-2 px-6 text-white font-bold text-sm active:scale-[0.98]"
          >
            Nouvelle commande
          </button>
        </motion.div>
      </div>
    );

  /* ─── PAGE ─── */
  return (
    <div className="min-h-screen bg-[#f6f8f7]">

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080b0d]/95 text-white shadow-[0_8px_30px_rgba(0,0,0,0.18)] backdrop-blur-2xl">
        <div className="mod-container flex items-center justify-between h-16 sm:h-[76px]">

          {/* Left */}
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setMobileMenu(!mobileMenu)} title="Menu" aria-label="Ouvrir le menu" className="lg:hidden flex h-10 w-10 items-center justify-center rounded-2xl border border-white/15 bg-white/5 text-white/75 transition-all hover:border-[#14C8B8]/50 hover:text-[#59dfaa]">
              <Menu className="w-4 h-4" />
            </button>
            <Link href="/" className="flex items-center gap-1.5 text-sm font-semibold text-white/65 transition-colors hover:text-[#59dfaa]">
              <ArrowLeft className="w-4 h-4" /> Accueil
            </Link>
            <span className="hidden sm:inline text-white/20">|</span>
            <span className="hidden sm:inline text-sm font-bold tracking-wide text-white">MOD-TECH <span className="text-[#59dfaa]">Store</span></span>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setSearchOpen(v => !v)} title="Rechercher" aria-label="Rechercher un produit" className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/15 bg-white/5 text-white/75 transition-all hover:border-[#14C8B8]/50 hover:text-[#59dfaa]">
              <Search className="w-4 h-4" />
            </button>
            <button type="button" onClick={() => setCartOpen(true)} className="relative flex h-10 items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 text-sm font-bold text-white transition-all hover:border-[#14C8B8]/50 hover:text-[#59dfaa]">
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Panier</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#14C8B8] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow">
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
            className="fixed inset-0 z-[60] bg-black/65 backdrop-blur-sm"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={e => e.stopPropagation()}
              className="border-b border-white/10 bg-[#090c0f] px-4 py-5 shadow-2xl"
            >
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <input
                  autoFocus value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Rechercher un produit..."
                  className="h-14 w-full rounded-2xl border border-white/15 bg-white/[0.07] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-[#14C8B8] focus:ring-4 focus:ring-[#14C8B8]/15"
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
            className="lg:hidden fixed top-16 left-0 right-0 z-40 overflow-hidden border-b border-white/10 bg-[#080b0d] shadow-2xl sm:top-[76px]"
          >
            <div className="mod-container space-y-1 py-4">
              {[{ label: "Accueil", href: "/" }, { label: "Store", href: "/store" }].map(l => (
                <a key={l.href} href={l.href} className="block rounded-2xl px-4 py-3 text-sm font-semibold text-white/75 transition-all hover:bg-white/8 hover:text-[#59dfaa]">{l.label}</a>
              ))}
              <button type="button" onClick={() => { setCartOpen(true); setMobileMenu(false); }} className="w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold text-white/75 transition-all hover:bg-white/8 hover:text-[#59dfaa]">
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
            className="fixed top-24 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#59dfaa] px-4 py-2.5 text-sm font-semibold text-[#07140f] shadow-[0_14px_36px_rgba(89,223,170,0.25)]"
          >
            <Check className="w-4 h-4" /> {addedMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SLIDER ── */}
      {slides.length > 0 ? (
        <section className="border-b border-white/10 bg-[#06090c] py-4 sm:py-6">
          <div className="mod-container">
            <div className="group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.035] shadow-[0_20px_65px_rgba(0,0,0,0.22)] sm:rounded-[28px]">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${slideIdx * 100}%)` }}
            >
              {slides.map(slide => (
                <div key={slide.id} className="min-w-full relative">
                  <img
                    src={slide.image} alt={slide.title || "Slide"}
                    className="h-[220px] w-full object-contain bg-white sm:h-[300px] lg:h-[420px]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />
                  {slide.title && (
                    <div className="absolute bottom-8 left-0 right-0 text-center px-6">
                      <h3 className="text-base font-semibold tracking-tight text-white drop-shadow sm:text-xl">{slide.title}</h3>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {slides.length > 1 && (
              <>
                <button type="button" onClick={() => setSlideIdx(p => (p - 1 + slides.length) % slides.length)}
                  title="Précédent"
                  className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/35 text-white opacity-100 backdrop-blur-sm transition-all hover:border-[#59dfaa]/70 hover:bg-white/15 sm:opacity-0 sm:group-hover:opacity-100">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => setSlideIdx(p => (p + 1) % slides.length)}
                  title="Suivant"
                  className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/35 text-white opacity-100 backdrop-blur-sm transition-all hover:border-[#59dfaa]/70 hover:bg-white/15 sm:opacity-0 sm:group-hover:opacity-100">
                  <ChevronRight className="w-4 h-4" />
                </button>
                <div className="absolute bottom-3 right-4 flex gap-1.5">
                  {slides.map((_, i) => (
                    <button type="button" key={i} onClick={() => setSlideIdx(i)} title={`Aller à la diapositive ${i + 1}`}
                      className={`rounded-full transition-all duration-300 ${i === slideIdx ? "w-5 h-1.5 bg-[#14C8B8]" : "w-1.5 h-1.5 bg-white/50"}`} />
                  ))}
                </div>
              </>
            )}
            </div>
          </div>
        </section>
      ) : (
        <section className="bg-[#06090c] py-4 sm:py-6">
          <div className="mod-container relative flex h-[300px] items-center overflow-hidden rounded-[24px] border border-white/10 bg-slate-900 shadow-[0_20px_65px_rgba(0,0,0,0.22)] sm:h-[340px] sm:rounded-[28px] lg:h-[420px]">
            <img src={heroData.bgImage} alt="Hero" className="absolute inset-0 h-full w-full object-cover opacity-65" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050708] via-[#050708]/75 to-[#050708]/15" />
            <div className="relative z-10 max-w-2xl px-6 sm:px-10 lg:px-14">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <span className="mb-5 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#59dfaa]"><span className="h-2 w-2 rounded-full bg-[#59dfaa]" />{heroData.badge}</span>
                <h1 className="mb-4 text-3xl font-light uppercase leading-[1.06] tracking-[0.04em] text-white sm:text-4xl lg:text-5xl">{heroData.title}</h1>
                <p className="max-w-xl text-sm leading-6 text-white/70 sm:text-base">{heroData.subtitle}</p>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* ── CATEGORIES ── */}
      <div className="mod-container py-6 sm:py-8">
        <div className="flex flex-wrap items-center gap-2 rounded-[22px] border border-slate-200/90 bg-white p-3 shadow-[0_10px_32px_rgba(15,23,42,0.05)] sm:p-4">
          {CATS.map(c => (
            <button type="button" key={c} onClick={() => setCat(c)}
              className={`rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 ${
                cat === c
                  ? "bg-[#0f172a] text-white shadow-md shadow-slate-900/15"
                  : "bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-200 transition hover:bg-white hover:text-[#0f766e] hover:ring-[#14C8B8]/45"
              }`}
            >{c}</button>
          ))}
          <span className="ml-auto whitespace-nowrap px-1 text-xs font-semibold text-slate-400">
            {filteredProducts.length} produit{filteredProducts.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* ── PRODUCTS ── */}
      <main className="mod-container pb-20 sm:pb-24">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-24 flex flex-col items-center gap-4">
            <Package className="w-12 h-12 text-slate-300" />
            <p className="text-slate-500 font-medium">Aucun produit trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((p, i) => {
              const disc = p.discount_percent || 0;
              const opts = selectedOptions[p.id] || {};
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.4 }}
                  className="group flex flex-col overflow-hidden rounded-[22px] border border-slate-200/90 bg-white shadow-[0_12px_34px_rgba(15,23,42,0.055)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#14C8B8]/45 hover:shadow-[0_22px_50px_rgba(15,23,42,0.11)] sm:rounded-[24px]"
                >
                  {/* Image */}
                  <button
                    type="button"
                    aria-label={`Voir ${p.name}`}
                    className="relative aspect-[4/3] w-full overflow-hidden border-b border-slate-100 bg-[linear-gradient(145deg,#f8fbfa,#ffffff)] text-left"
                    onClick={() => router.push(`/store/${p.id}`)}
                  >
                    <img src={p.image} alt={p.name} className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-[1.06]" />
                    {disc > 0 && (
                      <span className="absolute left-3 top-3 rounded-full bg-red-500 px-2 py-1 text-[10px] font-bold text-white shadow-sm">-{disc}%</span>
                    )}
                    {!p.in_stock && (
                      <span className="absolute left-3 top-3 rounded-full bg-slate-700 px-2 py-1 text-[10px] font-bold text-white shadow-sm">Épuisé</span>
                    )}
                  </button>

                  {/* Body */}
                  <div className="flex flex-1 flex-col gap-3 p-3.5 sm:p-4">
                    <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-800 sm:text-[15px]">{p.name}</h3>

                    {/* Colors */}
                    {p.colors?.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {p.colors.map(c => (
                          <button type="button" key={c.name} onClick={() => updateOption(p.id, "color", c.name)}
                            style={{ backgroundColor: c.hex }}
                            title={c.name}
                            aria-label={`Choisir la couleur ${c.name}`}
                            className={`h-4 w-4 rounded-full border-2 transition-transform ${opts.color === c.name ? "border-[#0f172a] scale-110 ring-2 ring-[#14C8B8]/25" : "border-transparent"}`}
                          />
                        ))}
                      </div>
                    )}

                    {/* Sizes */}
                    {p.sizes?.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {p.sizes.map(s => (
                          <button type="button" key={s} onClick={() => updateOption(p.id, "size", s)}
                            className={`text-[10px] px-1.5 py-0.5 rounded border transition-all ${opts.size === s ? "bg-[#14C8B8] text-white border-[#14C8B8]" : "bg-white text-slate-600 border-slate-200 hover:border-[#14C8B8]/50"}`}>
                            {s}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Price + Add */}
                    <div className="mt-auto flex items-end justify-between border-t border-slate-100 pt-3">
                      <div>
                        <p className="text-base font-extrabold leading-none tracking-tight text-[#0f766e] sm:text-lg">{getDisplayPrice(p).toLocaleString()} <span className="text-xs font-semibold">DA</span></p>
                        {disc > 0 && getOriginalPrice(p) > getDisplayPrice(p) && (
                          <p className="text-[10px] text-slate-400 line-through mt-0.5">{getOriginalPrice(p).toLocaleString()} DA</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => addToCart(p)}
                        disabled={!p.in_stock}
                        title="Ajouter au panier"
                        aria-label={`Ajouter ${p.name} au panier`}
                        className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 ${
                          p.in_stock ? "bg-[#0f172a] text-white shadow-sm shadow-slate-900/20 hover:bg-[#0f766e] active:scale-95" : "cursor-not-allowed bg-slate-100 text-slate-400"
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
      <div className="border-t border-white/10 bg-[#080b0d] text-white">
        <div className="mod-container py-7 sm:py-8">
          <div className="grid grid-cols-2 items-center gap-6 md:grid-cols-4">
            <div className="col-span-2 flex items-center gap-3 md:col-span-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/15 bg-white p-1.5">
                <img src="/lovable-uploads/5c0baea8-dfe7-4330-a35f-643db8adb0b0.png" className="h-full w-full object-contain" alt="logo" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">MOD-TECH</p>
                {contact?.phone1 && <p className="text-xs text-white/45">{contact.phone1}</p>}
              </div>
            </div>
            {[
              { icon: Truck,  title: "Livraison rapide",   sub: "Toute l'Algérie" },
              { icon: Shield, title: "Paiement sécurisé",  sub: "À la livraison"  },
              { icon: Clock,  title: "Support 7j/7",       sub: "Réponse rapide"  },
            ].map(({ icon: Icon, title, sub }, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#14C8B8]/20 bg-[#14C8B8]/10">
                  <Icon className="h-4 w-4 text-[#59dfaa]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white/85">{title}</p>
                  <p className="text-[10px] text-white/45">{sub}</p>
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
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => { setCartOpen(false); setCheckout(false); }}
            />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.28 }}
              className="absolute bottom-0 right-0 top-0 flex w-full flex-col bg-[#f6f8f7] shadow-2xl md:w-[500px]"
            >
              {/* Drawer header */}
              <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-[#080b0d] px-5 py-5 text-white md:px-7">
                {checkout && (
                  <button type="button" onClick={() => setCheckout(false)} title="Retour" className="mr-2 rounded-xl p-2 text-white/65 transition-colors hover:bg-white/10 hover:text-white">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
                <h2 className="flex-1 text-base font-bold text-white">
                  {checkout ? "Finaliser la commande" : `Panier (${cartCount})`}
                </h2>
                <button type="button" title="Fermer" aria-label="Fermer le panier" onClick={() => { setCartOpen(false); setCheckout(false); }} className="rounded-xl p-2 text-white/65 transition-colors hover:bg-white/10 hover:text-white">
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
                  <button type="button" onClick={() => setCartOpen(false)} className="mod-button-primary px-5 text-sm font-bold text-white active:scale-[0.98]">
                    Continuer les achats
                  </button>
                </div>

              ) : !checkout ? (
                <>
                  {/* Cart items */}
                  <div className="flex-1 space-y-3 overflow-y-auto px-5 py-5 md:px-7">
                    {cart.map((item, idx) => (
                      <div key={`${item.id}-${item.selectedColor}-${item.selectedSize}-${idx}`}
                        className="flex gap-3 rounded-[20px] border border-slate-200/90 bg-white p-3.5 shadow-[0_8px_22px_rgba(15,23,42,0.04)]">
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-[#f8fbfa]">
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
                            <span className="text-sm font-bold text-[#0f766e]">{(item.price * item.qty).toLocaleString()} DA</span>
                            <div className="flex items-center gap-1">
                              <button type="button" title="Diminuer la quantité" onClick={() => updateQty(item.id, item.qty - 1, item.selectedColor, item.selectedSize)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white transition-colors hover:border-[#14C8B8]/50 hover:text-[#0f766e]">
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-6 text-center text-xs font-semibold">{item.qty}</span>
                              <button type="button" title="Augmenter la quantité" onClick={() => updateQty(item.id, item.qty + 1, item.selectedColor, item.selectedSize)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white transition-colors hover:border-[#14C8B8]/50 hover:text-[#0f766e]">
                                <Plus className="w-3 h-3" />
                              </button>
                              <button type="button" title="Supprimer du panier" onClick={() => removeFromCart(item.id, item.selectedColor, item.selectedSize)}
                                className="ml-1 flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white transition-all hover:border-red-200 hover:text-red-500">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Cart footer */}
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
                  {/* Checkout form */}
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

                    {/* Fields */}
                    <Field label="Nom complet *">
                      <input placeholder="Votre nom complet" title="Nom complet" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputCls} />
                    </Field>
                    <Field label="Téléphone *">
                      <input type="tel" placeholder="ex. 06 XX XX XX XX" title="Téléphone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className={inputCls} />
                    </Field>
                    <Field label="Email">
                      <input type="email" placeholder="ex@email.com" title="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inputCls} />
                    </Field>
                    <Field label="Wilaya *">
                      <select title="Sélectionnez une wilaya" value={form.wilaya} onChange={e => setForm(f => ({ ...f, wilaya: e.target.value }))} className={inputCls}>
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
                  <div className="shrink-0 space-y-2 border-t border-slate-200 bg-white px-5 py-5 md:px-7">
                    <button type="button" onClick={sendOrder} disabled={sending}
                      className="mod-button-primary flex w-full items-center justify-center gap-2 px-5 text-sm font-bold text-white disabled:opacity-50 active:scale-[0.98]">
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
