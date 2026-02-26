"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingCart, 
  Search, 
  X, 
  Check, 
  Plus, 
  Minus, 
  Trash2,
  Menu,
  ChevronDown,
  ChevronUp,
  Truck,
  Shield,
  Clock
} from "lucide-react";
import { supabase } from "@/app/supabase";

/* ================= TYPES ================= */

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

type CartItem = Product & {
  qty: number;
  selectedColor?: string;
  selectedSize?: string;
};

type OrderForm = {
  name: string;
  phone: string;
  email: string;
  wilaya: string;
  commune: string;
  address: string;
  notes: string;
};

type StoreHero = {
  title: string;
  subtitle: string;
  badge: string;
  bgImage: string;
  btnPrimary: string;
  btnSecondary: string;
};

const CATS = ["Tous", "Caméras", "Réseau", "Accès", "Sonorisation", "Domotique", "Autre"];

const WILAYAS = ["Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra", "Béchar", "Blida", "Bouira", "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Alger", "Djelfa", "Jijel", "Sétif", "Saïda", "Skikda", "Sidi Bel Abbès", "Annaba", "Guelma", "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara", "Ouargla", "Oran", "El Bayadh", "Illizi", "Bordj Bou Arreridj", "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt", "El Oued", "Khenchela", "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent", "Ghardaïa", "Relizane", "Timimoun", "Bordj Badji Mokhtar", "Ouled Djellal", "Béni Abbès", "In Salah", "In Guezzam", "Touggourt", "Djanet", "El M'Ghair", "El Menia"];

/* ================= DEFAULT HERO ================= */

const DEFAULT_STORE_HERO: StoreHero = {
  title: "Équipements Professionnels",
  subtitle: "Sécurité · Réseau · Domotique — Livraison dans toute l'Algérie",
  badge: "NOTRE CATALOGUE",
  bgImage:
    "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=2000&q=80",
  btnPrimary: "Commander maintenant",
  btnSecondary: "Découvrir",
};

/* ================= STORAGE ================= */

const CART_STORAGE_KEY = "modtech_cart";

const loadCartFromStorage = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveCartToStorage = (cart: CartItem[]) => {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  window.dispatchEvent(new CustomEvent('cartUpdated', { detail: cart }));
};

/* ================= PAGE ================= */

export default function StorePage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [heroData, setHeroData] = useState<StoreHero>(DEFAULT_STORE_HERO);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState("Tous");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, { color?: string; size?: string }>>({});
  const [addedMessage, setAddedMessage] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  const [form, setForm] = useState<OrderForm>({
    name: "",
    phone: "",
    email: "",
    wilaya: "",
    commune: "",
    address: "",
    notes: "",
  });

  /* ================= MOUNT FIX ================= */
  useEffect(() => {
    setIsMounted(true);
    setCart(loadCartFromStorage());
  }, []);

  /* ================= SAVE CART ================= */
  useEffect(() => {
    if (isMounted) {
      saveCartToStorage(cart);
    }
  }, [cart, isMounted]);

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    const load = async () => {
      const [productsRes, heroRes] = await Promise.all([
        supabase
          .from("products")
          .select("*")
          .eq("is_active", true)
          .order("sort_order"),

        supabase
          .from("site_content")
          .select("content")
          .eq("section", "store-hero")
          .single(),
      ]);

      setProducts(productsRes.data ?? []);
      setFilteredProducts(productsRes.data ?? []);

      if (heroRes.data?.content) {
        setHeroData({ ...DEFAULT_STORE_HERO, ...heroRes.data.content });
      }

      setLoading(false);
    };

    load();
  }, []);

  /* ================= FILTER PRODUCTS ================= */
  useEffect(() => {
    let filtered = products;
    
    // Filter by category
    if (cat !== "Tous") {
      filtered = filtered.filter(p => p.category === cat);
    }
    
    // Filter by search
    if (search) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) || 
        p.description?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    setFilteredProducts(filtered);
  }, [cat, search, products]);

  /* ================= CART FUNCTIONS ================= */
  const addToCart = (product: Product) => {
    const options = selectedOptions[product.id] || {};
    
    setCart(prev => {
      const existing = prev.find(item => 
        item.id === product.id && 
        item.selectedColor === options.color &&
        item.selectedSize === options.size
      );
      
      if (existing) {
        return prev.map(item =>
          item.id === product.id && 
          item.selectedColor === options.color &&
          item.selectedSize === options.size
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      } else {
        return [...prev, { 
          ...product, 
          qty: 1,
          selectedColor: options.color,
          selectedSize: options.size
        }];
      }
    });
    
    setAddedMessage("✅ Produit ajouté au panier!");
    setTimeout(() => setAddedMessage(""), 3000);
    setCartOpen(true);
  };

  const updateQty = (id: number, qty: number, color?: string, size?: string) => {
    if (qty < 1) {
      removeFromCart(id, color, size);
      return;
    }
    
    setCart(prev =>
      prev.map(item =>
        item.id === id && item.selectedColor === color && item.selectedSize === size
          ? { ...item, qty }
          : item
      )
    );
  };

  const removeFromCart = (id: number, color?: string, size?: string) => {
    setCart(prev =>
      prev.filter(item => 
        !(item.id === id && item.selectedColor === color && item.selectedSize === size)
      )
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const updateOption = (productId: number, type: 'color' | 'size', value: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [productId]: { ...prev[productId], [type]: value }
    }));
  };

  /* ================= SEND ORDER ================= */
  const sendOrder = async () => {
    if (!form.name || !form.phone || !form.wilaya || !form.commune || !form.address) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }
    
    if (cart.length === 0) {
      alert("Votre panier est vide");
      return;
    }
    
    setSending(true);
    
    const items = cart.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      qty: item.qty,
      color: item.selectedColor,
      size: item.selectedSize
    }));
    
    const notes = [
      form.notes,
      ...cart.map(item => {
        const options = [];
        if (item.selectedColor) options.push(`Couleur: ${item.selectedColor}`);
        if (item.selectedSize) options.push(`Taille: ${item.selectedSize}`);
        return options.length ? `${item.name} (${options.join(', ')})` : null;
      }).filter(Boolean)
    ].filter(Boolean).join(" | ");
    
    const orderData = {
      customer_name: form.name,
      customer_phone: form.phone,
      customer_email: form.email,
      customer_address: `${form.address}, ${form.commune}, ${form.wilaya}`,
      notes,
      items,
      total: cartTotal,
      status: "new",
    };
    
    const { error } = await supabase.from("orders").insert([orderData]);
    if (error) {
      alert("Erreur: " + error.message);
      setSending(false);
      return;
    }
    
    try {
      await fetch("/api/send-order-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: orderData })
      });
    } catch (e) {
      console.log("Email skipped:", e);
    }
    
    setCart([]);
    setSending(false);
    setSuccess(true);
    setCartOpen(false);
    setCheckout(false);
  };

  /* ================= LOADING ================= */

  if (!isMounted || loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
      </div>
    );

  /* ================= SUCCESS ================= */

  if (success)
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white shadow-xl border rounded-2xl p-8 max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-2xl font-bold text-teal-600 mb-2">
            Commande confirmée !
          </h2>

          <p className="text-slate-600 mb-2">
            Nous contacterons le{" "}
            <span className="font-semibold">{form.phone}</span>
          </p>
          
          <p className="text-slate-500 text-sm mb-6">💳 Paiement à la livraison</p>

          <button
            onClick={() => {
              setSuccess(false);
              setForm({ name: "", phone: "", email: "", wilaya: "", commune: "", address: "", notes: "" });
            }}
            className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-6 py-2 rounded-xl"
          >
            Nouvelle commande
          </button>
        </motion.div>
      </div>
    );

  /* ================= PAGE ================= */

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileMenu(!mobileMenu)}
                className="lg:hidden text-slate-500"
              >
                <Menu className="w-6 h-6" />
              </button>
              <a href="/" className="text-slate-500 hover:text-slate-700 text-sm">
                ← Accueil
              </a>
              <span className="font-bold text-lg bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent hidden sm:inline">
                MOD-TECH Store
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Rechercher..."
                  className="w-64 bg-slate-50 border rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-teal-500/50"
                />
              </div>

              {/* Cart button */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative bg-white hover:bg-slate-50 border rounded-lg px-3 py-2 text-teal-600"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile search */}
          <div className="md:hidden pb-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher..."
                className="w-full bg-slate-50 border rounded-lg pl-9 pr-4 py-2 text-sm"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenu && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden fixed top-16 left-0 right-0 bg-white border-b z-40 shadow-md"
          >
            <div className="container mx-auto px-4 py-4">
              <a href="/" className="block py-2 text-slate-600 hover:text-teal-600">Accueil</a>
              <a href="/store" className="block py-2 text-teal-600 font-medium">Store</a>
              <button
                onClick={() => {
                  setCartOpen(true);
                  setMobileMenu(false);
                }}
                className="block py-2 text-slate-600 hover:text-teal-600 w-full text-left"
              >
                Panier ({cartCount})
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Added to cart message */}
      <AnimatePresence>
        {addedMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-2 rounded-full shadow-lg z-50 text-sm font-medium"
          >
            {addedMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO */}
      <section className="relative overflow-hidden min-h-[400px] md:min-h-[500px] flex items-center">
        <div className="absolute inset-0">
          <img
            src={heroData.bgImage}
            alt="Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/70 to-transparent" />
        </div>

        <div className="relative container mx-auto px-4 py-12 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <span className="inline-block text-sm text-teal-600 bg-teal-50 border px-4 py-1 rounded-full mb-4">
              {heroData.badge}
            </span>

            <h1 className="text-3xl md:text-4xl font-bold mb-4">{heroData.title}</h1>

            <p className="text-base md:text-lg text-slate-700 mb-6">
              {heroData.subtitle}
            </p>

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setCartOpen(true)}
                className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-6 py-2.5 rounded-xl"
              >
                {heroData.btnPrimary}
              </button>

              <button className="bg-white border px-6 py-2.5 rounded-xl">
                {heroData.btnSecondary}
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-wrap gap-2 justify-center">
          {CATS.map(c => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium transition ${
                cat === c
                  ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border'
              }`}
            >
              {c}
            </button>
          ))}
          <span className="ml-auto text-xs md:text-sm text-slate-500 self-center">
            {filteredProducts.length} produit{filteredProducts.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* PRODUCTS */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📦</div>
          <p className="text-lg text-slate-600">Aucun produit trouvé</p>
        </div>
      ) : (
        <section className="container mx-auto px-4 pb-14 grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.map((p) => {
            const disc = p.discount_percent || 0;
            const productOptions = selectedOptions[p.id] || {};

            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow hover:shadow-lg transition-all p-3 md:p-4 border"
              >
                <div
                  className="relative h-36 md:h-40 overflow-hidden rounded-lg mb-3 cursor-pointer"
                  onClick={() => router.push(`/store/${p.id}`)}
                >
                  <img
                    src={p.image}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    alt={p.name}
                  />
                  
                  {/* Badges */}
                  {disc > 0 && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      -{disc}%
                    </span>
                  )}
                  
                  {!p.in_stock && (
                    <span className="absolute top-2 left-2 bg-slate-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                      Épuisé
                    </span>
                  )}
                </div>

                <h3 className="font-semibold text-sm md:text-base mb-1 line-clamp-1">{p.name}</h3>
                
                {p.description && (
                  <p className="text-xs text-slate-500 mb-2 line-clamp-2">{p.description}</p>
                )}

                {/* Colors */}
                {p.colors && p.colors.length > 0 && (
                  <div className="mb-2">
                    <div className="text-xs text-slate-500 mb-1">Couleurs:</div>
                    <div className="flex gap-1 flex-wrap">
                      {p.colors.map(c => (
                        <button
                          key={c.name}
                          onClick={() => updateOption(p.id, 'color', c.name)}
                          className={`w-4 h-4 md:w-5 md:h-5 rounded-full border-2 transition ${
                            productOptions.color === c.name ? 'border-teal-500 scale-110' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: c.hex }}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Sizes */}
                {p.sizes && p.sizes.length > 0 && (
                  <div className="mb-3">
                    <div className="text-xs text-slate-500 mb-1">Tailles:</div>
                    <div className="flex gap-1 flex-wrap">
                      {p.sizes.map(s => (
                        <button
                          key={s}
                          onClick={() => updateOption(p.id, 'size', s)}
                          className={`text-xs px-2 py-0.5 rounded border ${
                            productOptions.size === s
                              ? 'bg-teal-600 text-white border-teal-600'
                              : 'bg-white text-slate-600 border hover:bg-slate-50'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mt-2">
                  <div>
                    <p className="text-teal-600 font-bold text-base md:text-lg">
                      {p.price.toLocaleString()} DA
                    </p>
                    {disc > 0 && p.original_price > 0 && (
                      <p className="text-xs text-slate-400 line-through">
                        {p.original_price.toLocaleString()} DA
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => addToCart(p)}
                    disabled={!p.in_stock}
                    className={`p-2 rounded-lg ${
                      p.in_stock
                        ? 'bg-teal-600 hover:bg-teal-700 text-white'
                        : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </section>
      )}

      {/* Trust badges */}
      <div className="bg-white border-t py-6 md:py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Truck, text: "Livraison rapide", sub: "Dans toute l'Algérie" },
              { icon: Shield, text: "Paiement sécurisé", sub: "À la livraison" },
              { icon: Clock, text: "Support 24/7", sub: "Service client réactif" }
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <div className="font-semibold text-sm md:text-base">{item.text}</div>
                  <div className="text-xs md:text-sm text-slate-500">{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Shopping Cart Drawer */}
      <AnimatePresence>
        {cartOpen && (
          <div className="fixed inset-0 z-50">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => { setCartOpen(false); setCheckout(false); }}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="absolute top-0 right-0 bottom-0 w-full md:w-[500px] bg-white shadow-xl flex flex-col"
            >
              {/* Header */}
              <div className="p-4 md:p-6 border-b flex justify-between items-center">
                <h2 className="text-lg md:text-xl font-bold">
                  {checkout ? 'Finaliser la commande' : `Panier (${cartCount})`}
                </h2>
                <button
                  onClick={() => { setCartOpen(false); setCheckout(false); }}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {cart.length === 0 && !checkout ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6">
                  <ShoppingCart className="w-16 h-16 text-slate-300 mb-4" />
                  <p className="text-slate-600 mb-4">Votre panier est vide</p>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-6 py-2 rounded-lg"
                  >
                    Continuer vos achats
                  </button>
                </div>
              ) : !checkout ? (
                <>
                  {/* Cart items */}
                  <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                    {cart.map((item, index) => (
                      <div
                        key={`${item.id}-${item.selectedColor}-${item.selectedSize}-${index}`}
                        className="bg-slate-50 border rounded-lg p-4"
                      >
                        <div className="flex gap-4">
                          <div className="w-16 h-16 bg-white border rounded-lg overflow-hidden flex-shrink-0">
                            <img src={item.image} alt="" className="w-full h-full object-cover" />
                          </div>
                          
                          <div className="flex-1">
                            <h4 className="font-medium mb-1">{item.name}</h4>
                            
                            {(item.selectedColor || item.selectedSize) && (
                              <div className="text-xs text-slate-500 mb-2">
                                {item.selectedColor && <span>Couleur: {item.selectedColor}</span>}
                                {item.selectedColor && item.selectedSize && <span> · </span>}
                                {item.selectedSize && <span>Taille: {item.selectedSize}</span>}
                              </div>
                            )}

                            <div className="flex items-center justify-between">
                              <div className="text-teal-600 font-bold">
                                {(item.price * item.qty).toLocaleString()} DA
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => updateQty(item.id, item.qty - 1, item.selectedColor, item.selectedSize)}
                                  className="p-1 hover:bg-white rounded"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-8 text-center">{item.qty}</span>
                                <button
                                  onClick={() => updateQty(item.id, item.qty + 1, item.selectedColor, item.selectedSize)}
                                  className="p-1 hover:bg-white rounded"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => removeFromCart(item.id, item.selectedColor, item.selectedSize)}
                                  className="p-1 hover:bg-red-50 text-red-500 rounded ml-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="p-4 md:p-6 border-t bg-white">
                    <div className="flex justify-between text-lg mb-4">
                      <span className="text-slate-600">Total</span>
                      <span className="font-bold text-teal-600">{cartTotal.toLocaleString()} DA</span>
                    </div>
                    <button
                      onClick={() => setCheckout(true)}
                      className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-semibold py-3 rounded-lg"
                    >
                      Commander ({cartCount} produit{cartCount > 1 ? 's' : ''})
                    </button>
                  </div>
                </>
              ) : (
                // Checkout form
                <>
                  <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                    {/* Order summary */}
                    <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                      <h3 className="font-medium text-teal-800 mb-2">Récapitulatif</h3>
                      {cart.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm text-slate-600 mb-1">
                          <span>
                            {item.name} x{item.qty}
                            {item.selectedColor && ` (${item.selectedColor})`}
                            {item.selectedSize && `, ${item.selectedSize}`}
                          </span>
                          <span className="text-teal-600 font-medium">
                            {(item.price * item.qty).toLocaleString()} DA
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between font-bold mt-3 pt-3 border-t border-teal-200">
                        <span>Total</span>
                        <span className="text-teal-600">{cartTotal.toLocaleString()} DA</span>
                      </div>
                    </div>

                    {/* Form fields */}
                    {[
                      { k: 'name', l: 'Nom complet *', p: 'name' },
                      { k: 'phone', l: 'Téléphone *', p: '06**' },
                      { k: 'email', l: 'Email', p: 'email@exemple.com' },
                    ].map(({ k, l, p }) => (
                      <div key={k}>
                        <label className="text-xs font-medium text-slate-500 uppercase mb-1 block">{l}</label>
                        <input
                          type={k === 'email' ? 'email' : 'text'}
                          placeholder={p}
                          value={form[k as keyof OrderForm]}
                          onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                          className="w-full bg-white border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-teal-500/50"
                        />
                      </div>
                    ))}

                    {/* Wilaya */}
                    <div>
                      <label className="text-xs font-medium text-slate-500 uppercase mb-1 block">Wilaya *</label>
                      <select
                        value={form.wilaya}
                        onChange={e => setForm(f => ({ ...f, wilaya: e.target.value }))}
                        className="w-full bg-white border rounded-lg px-4 py-2 text-sm"
                      >
                        <option value="">Sélectionnez une wilaya</option>
                        {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
                      </select>
                    </div>

                    {/* Commune and Address */}
                    {[
                      { k: 'commune', l: 'Commune *', p: 'Commune' },
                      { k: 'address', l: 'Adresse complète *', p: 'Rue, numéro, cité...' },
                    ].map(({ k, l, p }) => (
                      <div key={k}>
                        <label className="text-xs font-medium text-slate-500 uppercase mb-1 block">{l}</label>
                        <input
                          type="text"
                          placeholder={p}
                          value={form[k as keyof OrderForm]}
                          onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                          className="w-full bg-white border rounded-lg px-4 py-2 text-sm"
                        />
                      </div>
                    ))}

                    {/* Notes */}
                    <div>
                      <label className="text-xs font-medium text-slate-500 uppercase mb-1 block">Notes</label>
                      <textarea
                        placeholder="Instructions particulières..."
                        value={form.notes}
                        onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                        rows={3}
                        className="w-full bg-white border rounded-lg px-4 py-2 text-sm resize-none"
                      />
                    </div>
                  </div>

                  {/* Checkout footer */}
                  <div className="p-4 md:p-6 border-t bg-white space-y-2">
                    <button
                      onClick={sendOrder}
                      disabled={sending}
                      className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-semibold py-3 rounded-lg disabled:opacity-50"
                    >
                      {sending ? '⏳ Envoi...' : ' Confirmer la commande'}
                    </button>
                    <button
                      onClick={() => setCheckout(false)}
                      className="w-full bg-transparent border hover:bg-slate-50 text-slate-600 font-semibold py-3 rounded-lg"
                    >
                      ← Retour au panier
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