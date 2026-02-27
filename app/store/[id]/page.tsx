"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingCart, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Check, 
  Plus, 
  Minus, 
  Trash2,
  Star,
  Truck,
  Shield,
  Clock,
  Menu
} from "lucide-react";
import { supabase } from "@/app/supabase";

type Product = {
  id: number; name: string; description: string;
  price: number; original_price: number; discount_percent: number;
  image: string; images: string[]; category: string;
  colors: {name:string;hex:string}[]; sizes: string[];
  specs: Record<string,string>; reference: string; in_stock: boolean;
};

type CartItem = Product & {
  qty: number;
  selectedColor?: string;
  selectedSize?: string;
};

type OrderForm = {
  name: string; phone: string; email: string;
  wilaya: string; commune: string; address: string; notes: string;
};

const WILAYAS = ["Adrar","Chlef","Laghouat","Oum El Bouaghi","Batna","Béjaïa","Biskra","Béchar","Blida","Bouira","Tamanrasset","Tébessa","Tlemcen","Tiaret","Tizi Ouzou","Alger","Djelfa","Jijel","Sétif","Saïda","Skikda","Sidi Bel Abbès","Annaba","Guelma","Constantine","Médéa","Mostaganem","M'Sila","Mascara","Ouargla","Oran","El Bayadh","Illizi","Bordj Bou Arreridj","Boumerdès","El Tarf","Tindouf","Tissemsilt","El Oued","Khenchela","Souk Ahras","Tipaza","Mila","Aïn Defla","Naâma","Aïn Témouchent","Ghardaïa","Relizane","Timimoun","Bordj Badji Mokhtar","Ouled Djellal","Béni Abbès","In Salah","In Guezzam","Touggourt","Djanet","El M'Ghair","El Menia"];

// Helper functions for cart management
const CART_STORAGE_KEY = "modtech_cart";

const loadCartFromStorage = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error("Error loading cart:", e);
    return [];
  }
};

const saveCartToStorage = (cart: CartItem[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: cart }));
  } catch (e) {
    console.error("Error saving cart:", e);
  }
};

export default function ProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [selColor, setSelColor] = useState("");
  const [selSize, setSelSize] = useState("");
  const [qty, setQty] = useState(1);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [promo, setPromo] = useState("");
  const [promoDisc, setPromoDisc] = useState(0);
  const [promoMsg, setPromoMsg] = useState("");
  const [promoOk, setPromoOk] = useState(false);
  const [form, setForm] = useState<OrderForm>({
    name: "", phone: "", email: "", wilaya: "", commune: "", address: "", notes: ""
  });
  const [mobileMenu, setMobileMenu] = useState(false);
  const [addedMessage, setAddedMessage] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  // Load product
  useEffect(() => {
    supabase.from("products").select("*").eq("id", id).single()
      .then(({ data }) => { setProduct(data); setLoading(false); });
  }, [id]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = loadCartFromStorage();
    setCart(savedCart);
    setIsInitialized(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      saveCartToStorage(cart);
    }
  }, [cart, isInitialized]);

  // Listen for cart updates from other tabs
  useEffect(() => {
    const handleCartUpdate = (event: CustomEvent) => {
      setCart(event.detail);
    };

    window.addEventListener('cartUpdated', handleCartUpdate as EventListener);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate as EventListener);
  }, []);

  const allImgs = product ? [product.image, ...(product.images || [])].filter(Boolean) : [];
  const basePrice = product?.price || 0;
  const discPct = Math.max(product?.discount_percent || 0, promoDisc);
  const finalPrice = Math.round(basePrice * (1 - discPct / 100));
  const totalPrice = finalPrice * qty;
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const checkPromo = async () => {
    if (!promo.trim()) { setPromoMsg("Entrez un code"); setPromoOk(false); return; }
    const { data } = await supabase.from("promo_codes").select("*").eq("code", promo.trim().toUpperCase()).eq("is_active", true).single();
    if (!data) { setPromoMsg(" Code invalide ou expiré"); setPromoOk(false); setPromoDisc(0); }
    else { setPromoDisc(data.discount); setPromoMsg(` -${data.discount}% appliqué !`); setPromoOk(true); }
  };

  // Add to cart
  const addToCart = () => {
    if (!product) return;
    
    setCart(prev => {
      const existing = prev.find(item => 
        item.id === product.id && 
        item.selectedColor === selColor &&
        item.selectedSize === selSize
      );
      
      let newCart;
      if (existing) {
        newCart = prev.map(item =>
          item.id === product.id && 
          item.selectedColor === selColor &&
          item.selectedSize === selSize
            ? { ...item, qty: item.qty + qty }
            : item
        );
      } else {
        newCart = [...prev, {
          ...product,
          qty: qty,
          selectedColor: selColor,
          selectedSize: selSize
        }];
      }
      
      saveCartToStorage(newCart);
      return newCart;
    });
    
    setAddedMessage(" Produit ajouté au panier!");
    setTimeout(() => setAddedMessage(""), 3000);
  };

  // Update quantity in cart
  const updateCartQty = (id: number, newQty: number, color?: string, size?: string) => {
    if (newQty < 1) {
      removeFromCart(id, color, size);
      return;
    }
    
    setCart(prev => {
      const newCart = prev.map(item =>
        item.id === id && item.selectedColor === color && item.selectedSize === size
          ? { ...item, qty: newQty }
          : item
      );
      saveCartToStorage(newCart);
      return newCart;
    });
  };

  const removeFromCart = (id: number, color?: string, size?: string) => {
    setCart(prev => {
      const newCart = prev.filter(item => 
        !(item.id === id && item.selectedColor === color && item.selectedSize === size)
      );
      saveCartToStorage(newCart);
      return newCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    saveCartToStorage([]);
  };

  // Send order
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

    // Clear cart after successful order
    clearCart();

    setSending(false);
    setSuccess(true);
    setCartOpen(false);
    setCheckout(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex flex-col items-center justify-center text-slate-700 gap-4">
      <div className="text-6xl">❌</div>
      <p className="text-lg text-slate-500">Produit introuvable</p>
      <button 
        onClick={() => router.push("/store")} 
        className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold px-8 py-3 rounded-xl transition-all"
      >
        ← Retour au store
      </button>
    </div>
  );

  if (success) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white shadow-xl border border-slate-200 rounded-2xl p-8 max-w-md w-full text-center"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-teal-600 mb-2">Commande confirmée !</h2>
        <p className="text-slate-600 mb-2">
          Nous contacterons le <span className="text-slate-900 font-semibold">{form.phone}</span>
        </p>
        <p className="text-slate-500 text-sm mb-1"> Équipe MOD-TECH informée</p>
        <p className="text-slate-500 text-sm mb-6"> Paiement à la livraison</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.push("/store")}
            className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold px-6 py-2 rounded-xl transition-all"
          >
            🛍️ Continuer
          </button>
          <button
            onClick={() => { 
              setSuccess(false); 
              setForm({ name: "", phone: "", email: "", wilaya: "", commune: "", address: "", notes: "" }); 
            }}
            className="bg-transparent border border-slate-300 hover:bg-slate-100 text-slate-600 font-semibold px-6 py-2 rounded-xl transition-all"
          >
            Nouvelle commande
          </button>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white text-slate-700 font-sans">

      {/* Topbar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left section */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileMenu(!mobileMenu)}
                className="lg:hidden text-slate-500 hover:text-slate-700"
              >
                <Menu className="w-6 h-6" />
              </button>
              <button 
                onClick={() => router.push("/store")}
                className="text-slate-500 hover:text-slate-700 transition-colors text-sm flex items-center gap-1"
              >
                ← Store
              </button>
              <span className="text-slate-300 hidden sm:inline">|</span>
              <span className="font-bold text-lg bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent hidden sm:inline">
                MOD-TECH
              </span>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-4">
              {/* Breadcrumbs - Desktop */}
              <div className="hidden md:flex items-center gap-2 text-sm">
                <span className="text-slate-400">›</span>
                {product.category && (
                  <span className="text-slate-500">{product.category}</span>
                )}
                <span className="text-slate-400">›</span>
                <span className="text-slate-600 truncate max-w-[200px]">{product.name}</span>
              </div>

              {/* Cart button */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative bg-white hover:bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-teal-600 transition-colors"
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
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenu && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden fixed top-16 left-0 right-0 bg-white border-b border-slate-200 z-40 shadow-md"
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

      {/* Added to Cart Message */}
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

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* LEFT: Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Main image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-white border border-slate-200 mb-4 group shadow-sm">
              {allImgs.length > 0 ? (
                <img 
                  src={allImgs[imgIdx]} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl text-slate-300">
                  
                </div>
              )}

              {/* Discount badge */}
              {discPct > 0 && (
                <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">
                  -{discPct}%
                </div>
              )}

              {/* Out of stock overlay */}
              {!product.in_stock && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                  <span className="bg-slate-200 text-slate-700 font-bold px-6 py-3 rounded-xl text-lg">
                    Rupture de stock
                  </span>
                </div>
              )}

              {/* Navigation arrows */}
              {allImgs.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); setImgIdx(i => (i - 1 + allImgs.length) % allImgs.length); }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-700 rounded-full p-2 transition-colors shadow-md"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setImgIdx(i => (i + 1) % allImgs.length); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-700 rounded-full p-2 transition-colors shadow-md"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Image counter */}
              {allImgs.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-white/80 text-slate-700 text-sm px-3 py-1 rounded-full shadow-md">
                  {imgIdx + 1}/{allImgs.length}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {allImgs.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                {allImgs.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      imgIdx === i 
                        ? 'border-teal-500 opacity-100 shadow-md' 
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* RIGHT: Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Category */}
            {product.category && (
              <span className="inline-block bg-teal-50 border border-teal-200 text-teal-700 text-xs font-medium px-3 py-1 rounded-full">
                {product.category}
              </span>
            )}

            {/* Title */}
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-800">
              {product.name}
            </h1>

            {/* Reference */}
            {product.reference && (
              <div className="text-sm text-slate-500 font-mono">
                Réf: {product.reference}
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-4 flex-wrap">
              <span className="text-4xl lg:text-5xl font-bold text-teal-600">
                {finalPrice.toLocaleString()} DA
              </span>
              {discPct > 0 && (
                <>
                  <span className="text-lg text-slate-400 line-through">
                    {basePrice.toLocaleString()} DA
                  </span>
                  <span className="bg-red-50 border border-red-200 text-red-600 text-sm font-bold px-3 py-1 rounded-full">
                    -{discPct}%
                  </span>
                </>
              )}
            </div>

            {/* Stock indicator */}
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                product.in_stock ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
              }`} />
              <span className={`text-sm font-medium ${
                product.in_stock ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {product.in_stock ? 'En stock — livraison rapide' : 'Rupture de stock'}
              </span>
            </div>

            {/* Description */}
            {product.description && (
              <div className="border-t border-slate-200 pt-6">
                <p className="text-slate-600 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                <h3 className="text-sm font-medium text-slate-600 uppercase tracking-wider mb-4">
                  Couleur {selColor && <span className="text-teal-600 ml-2">— {selColor}</span>}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map(c => (
                    <button
                      key={c.name}
                      onClick={() => setSelColor(selColor === c.name ? "" : c.name)}
                      className="group relative"
                      title={c.name}
                    >
                      <div
                        className={`w-10 h-10 rounded-full border-2 transition-all ${
                          selColor === c.name
                            ? 'border-teal-500 scale-110 shadow-md'
                            : 'border-transparent group-hover:border-slate-300'
                        }`}
                        style={{ backgroundColor: c.hex }}
                      />
                      {selColor === c.name && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-teal-500 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                <h3 className="text-sm font-medium text-slate-600 uppercase tracking-wider mb-4">
                  Taille / Dimension
                </h3>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map(sz => (
                    <button
                      key={sz}
                      onClick={() => setSelSize(selSize === sz ? "" : sz)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        selSize === sz
                          ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-500/20'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-600 uppercase tracking-wider">
                Quantité
              </span>
              <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg p-1">
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded transition-colors text-slate-600"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-semibold text-slate-700">{qty}</span>
                <button
                  onClick={() => setQty(q => q + 1)}
                  className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded transition-colors text-slate-600"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={addToCart}
                disabled={!product.in_stock}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold transition-all ${
                  product.in_stock
                    ? 'bg-white hover:bg-slate-50 text-teal-600 border border-teal-200 shadow-sm'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                Ajouter au panier
              </button>

              <button
                onClick={() => setCartOpen(true)}
                className="flex-1 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold px-6 py-4 rounded-xl transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2"
              >
                Voir le panier ({cartCount})
              </button>
            </div>

            {/* Trust badges */}
           

            {/* Specifications */}
            {product.specs && Object.keys(product.specs).length > 0 && (
              <div className="border-t border-slate-200 pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-700">
                  <Star className="w-5 h-5 text-teal-500" />
                  Spécifications techniques
                </h3>
                <div className="space-y-3">
                  {Object.entries(product.specs).map(([key, value], i) => (
                    <div
                      key={key}
                      className={`flex justify-between p-3 rounded-lg ${
                        i % 2 === 0 ? 'bg-slate-50' : 'bg-white'
                      } border border-slate-100`}
                    >
                      <span className="text-slate-500">{key}</span>
                      <span className="text-slate-700 font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
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
              <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-white">
                <h2 className="text-xl font-bold text-slate-700">
                  {checkout ? 'Finaliser la commande' : `Panier (${cartCount})`}
                </h2>
                <button
                  onClick={() => { setCartOpen(false); setCheckout(false); }}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {cart.length === 0 && !checkout ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6">
                  <ShoppingCart className="w-16 h-16 text-slate-300 mb-4" />
                  <p className="text-slate-600 mb-4">Votre panier est vide</p>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-semibold px-6 py-2 rounded-lg"
                  >
                    Continuer vos achats
                  </button>
                </div>
              ) : !checkout ? (
                <>
                  {/* Cart items */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {cart.map((item, index) => (
                      <motion.div
                        key={`${item.id}-${item.selectedColor}-${item.selectedSize}-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-slate-50 border border-slate-200 rounded-lg p-4"
                      >
                        <div className="flex gap-4">
                          {/* Image */}
                          <div className="w-16 h-16 bg-white border border-slate-200 rounded-lg overflow-hidden flex-shrink-0">
                            {item.image ? (
                              <img src={item.image} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-2xl">
                                📦
                              </div>
                            )}
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-slate-700 mb-1 truncate">{item.name}</h4>
                            
                            {(item.selectedColor || item.selectedSize) && (
                              <div className="text-xs text-slate-500 mb-2">
                                {item.selectedColor && <span>Couleur: {item.selectedColor}</span>}
                                {item.selectedColor && item.selectedSize && <span> · </span>}
                                {item.selectedSize && <span>Taille: {item.selectedSize}</span>}
                              </div>
                            )}

                            {/* Quantity controls */}
                            <div className="flex items-center justify-between">
                              <div className="text-teal-600 font-bold">
                                {(item.price * item.qty).toLocaleString()} DA
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => updateCartQty(item.id, item.qty - 1, item.selectedColor, item.selectedSize)}
                                  className="p-1 hover:bg-white rounded transition-colors"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-8 text-center text-slate-700">{item.qty}</span>
                                <button
                                  onClick={() => updateCartQty(item.id, item.qty + 1, item.selectedColor, item.selectedSize)}
                                  className="p-1 hover:bg-white rounded transition-colors"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => removeFromCart(item.id, item.selectedColor, item.selectedSize)}
                                  className="p-1 hover:bg-red-50 text-red-500 rounded transition-colors ml-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="p-6 border-t border-slate-200 bg-white">
                    <div className="flex justify-between text-lg mb-4">
                      <span className="text-slate-500">Total</span>
                      <span className="font-bold text-teal-600">{cartTotal.toLocaleString()} DA</span>
                    </div>
                    <button
                      onClick={() => setCheckout(true)}
                      className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-lg transition-all"
                    >
                      Commander ({cartCount} produit{cartCount > 1 ? 's' : ''})
                    </button>
                  </div>
                </>
              ) : (
                // Checkout form
                <>
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {/* Order summary */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-teal-50 border border-teal-200 rounded-lg p-4"
                    >
                      <h3 className="font-medium text-teal-800 mb-2 flex items-center gap-2">
                        <Check className="w-4 h-4 text-teal-600" />
                        Récapitulatif
                      </h3>
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
                        <span className="text-slate-700">Total</span>
                        <span className="text-teal-600">{cartTotal.toLocaleString()} DA</span>
                      </div>
                    </motion.div>

                    {/* Form fields */}
                    {[
                      { k: 'name', l: 'Nom complet *', p: 'Name', t: 'text' },
                      { k: 'phone', l: 'Téléphone *', p: '06**', t: 'tel' },
                      { k: 'email', l: 'Email', p: 'email@exemple.com', t: 'email' },
                    ].map(({ k, l, p, t }, idx) => (
                      <motion.div
                        key={k}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + idx * 0.1 }}
                      >
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
                          {l}
                        </label>
                        <input
                          type={t}
                          placeholder={p}
                          value={form[k as keyof OrderForm]}
                          onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                          className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all"
                        />
                      </motion.div>
                    ))}

                    {/* Wilaya */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
                        Wilaya *
                      </label>
                      <select
                        value={form.wilaya}
                        onChange={e => setForm(f => ({ ...f, wilaya: e.target.value }))}
                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all"
                      >
                        <option value="">Sélectionnez une wilaya</option>
                        {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
                      </select>
                    </motion.div>

                    {/* Commune and Address */}
                    {[
                      { k: 'commune', l: 'Commune *', p: 'Commune' },
                      { k: 'address', l: 'Adresse complète *', p: 'Rue, numéro, cité...' },
                    ].map(({ k, l, p }, idx) => (
                      <motion.div
                        key={k}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + idx * 0.1 }}
                      >
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
                          {l}
                        </label>
                        <input
                          type="text"
                          placeholder={p}
                          value={form[k as keyof OrderForm]}
                          onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                          className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all"
                        />
                      </motion.div>
                    ))}

                    {/* Notes */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
                        Notes
                      </label>
                      <textarea
                        placeholder="Instructions particulières..."
                        value={form.notes}
                        onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                        rows={3}
                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all resize-none"
                      />
                    </motion.div>
                  </div>

                  {/* Checkout footer */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="p-6 border-t border-slate-200 bg-white space-y-2"
                  >
                    <button
                      onClick={sendOrder}
                      disabled={sending}
                      className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sending ? '⏳ Envoi en cours...' : ' Confirmer la commande'}
                    </button>
                    <button
                      onClick={() => setCheckout(false)}
                      className="w-full bg-transparent border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold py-3 rounded-lg transition-all"
                    >
                      ← Retour au panier
                    </button>
                  </motion.div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .scrollbar-thin::-webkit-scrollbar {
          height: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}