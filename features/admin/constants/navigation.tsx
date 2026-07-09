import {
Award,
BarChart3,
ClipboardList,
ExternalLink,
Home,
Image as ImageIcon,
Layers,
Mail,
Phone,
Plug,
Shield,
ShoppingBag,
ShoppingCart,
Star,
Store,
Truck,
Users,
} from "lucide-react";

export const ADMIN_NAV = [
  { key: "audit-log", label: "Journal des opérations", icon: <ClipboardList className="w-5 h-5" />, desc: "Audit Log" },
  { key: "products", label: "Produits", icon: <ShoppingBag className="w-5 h-5" />, desc: "Catalogue du store" },
  { key: "suppliers", label: "Fournisseurs", icon: <Truck className="w-5 h-5" />, desc: "Gestion fournisseurs" },
  { key: "orders", label: "Commandes", icon: <ShoppingCart className="w-5 h-5" />, desc: "Gestion des commandes" },
  { key: "hero", label: "Accueil", icon: <Home className="w-5 h-5" />, desc: "Hero page d'accueil" },
  { key: "store-hero", label: "Store", icon: <Store className="w-5 h-5" />, desc: "Hero catalogue" },
  { key: "slider", label: "Slider", icon: <ImageIcon className="w-5 h-5" />, desc: "Images du carrousel" },
  { key: "services", label: "Services", icon: <Layers className="w-5 h-5" />, desc: "Cartes + photos" },
  { key: "partners", label: "Partenaires", icon: <Users className="w-5 h-5" />, desc: "Logos des clients" },
  { key: "about", label: "À propos", icon: <Award className="w-5 h-5" />, desc: "Stats & description" },
  { key: "contact", label: "Contact", icon: <Phone className="w-5 h-5" />, desc: "Tél, email, réseaux" },
  { key: "reussites", label: "Nos Réussites", icon: <Star className="w-5 h-5" />, desc: "Portfolio photos" },
  { key: "users", label: "Utilisateurs", icon: <Users className="w-5 h-5" />, desc: "Comptes admin & responsables" },
  { key: "security", label: "Sécurité", icon: <Shield className="w-5 h-5" />, desc: "Mot de passe" },
  { key: "emails", label: "Email", icon: <Mail className="w-5 h-5" />, desc: "Notifications email" },
  { key: "integrations", label: "Integrations", icon: <Plug className="w-5 h-5" />, desc: "Google Sheets & outils externes" },
  { key: "links", label: "Contact Links", icon: <ExternalLink className="w-5 h-5" />, desc: "Page QR code" },
] as const;

export const ADMIN_NAV_GROUPS = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: <BarChart3 className="w-4 h-4" />,
    items: ["audit-log"],
  },
  {
    key: "system",
    label: "System",
    icon: <Shield className="w-4 h-4" />,
    items: [],
  },
  {
    key: "store",
    label: "Gestion du magasin",
    icon: <Store className="w-4 h-4" />,
    items: ["products", "suppliers"],
  },
  {
    key: "orders",
    label: "Commandes",
    icon: <ShoppingCart className="w-4 h-4" />,
    items: ["orders"],
  },
  {
    key: "website",
    label: "Site Web",
    icon: <Home className="w-4 h-4" />,
    items: ["hero", "store-hero", "slider", "services", "partners", "about", "contact", "reussites"],
  },
  {
    key: "settings",
    label: "Paramètres",
    icon: <Shield className="w-4 h-4" />,
    items: ["users", "security", "emails", "integrations", "links"],
  },
] as const;

export const AUTO_SAVE_SECTIONS = ["slider", "partners", "products", "suppliers", "orders", "audit-log", "emails", "security", "users", "integrations", "links"];
