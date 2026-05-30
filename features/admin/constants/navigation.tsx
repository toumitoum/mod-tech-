import {
Award,
ExternalLink,
Home,
Image as ImageIcon,
Layers,
Mail,
Phone,
Shield,
ShoppingBag,
Star,
Store,
Users,
} from "lucide-react";

export const ADMIN_NAV = [
  { key: "links", label: "Liens Contact", icon: <ExternalLink className="w-5 h-5" />, desc: "Page QR code" },
  { key: "users", label: "Utilisateurs", icon: <Users className="w-5 h-5" />, desc: "Comptes admin" },
  { key: "hero", label: "Hero - Accueil", icon: <Home className="w-5 h-5" />, desc: "Page d'accueil" },
  { key: "store-hero", label: "Hero - Store", icon: <Store className="w-5 h-5" />, desc: "Page du catalogue" },
  { key: "services", label: "Services", icon: <Layers className="w-5 h-5" />, desc: "Cartes + photos" },
  { key: "about", label: "À propos", icon: <Award className="w-5 h-5" />, desc: "Stats & description" },
  { key: "contact", label: "Contact", icon: <Phone className="w-5 h-5" />, desc: "Tél, email, réseaux" },
  { key: "slider", label: "Slider", icon: <ImageIcon className="w-5 h-5" />, desc: "Images du carrousel" },
  { key: "partners", label: "Partenaires", icon: <Users className="w-5 h-5" />, desc: "Logos des clients" },
  { key: "products", label: "Produits", icon: <ShoppingBag className="w-5 h-5" />, desc: "Catalogue du store" },
  { key: "reussites", label: "Nos Réussites", icon: <Star className="w-5 h-5" />, desc: "Portfolio photos" },
  { key: "orders", label: "Commandes", icon: <ShoppingBag className="w-5 h-5" />, desc: "Gestion des commandes" },
  { key: "emails", label: "Emails", icon: <Mail className="w-5 h-5" />, desc: "Notifications email" },
  { key: "security", label: "Sécurité", icon: <Shield className="w-5 h-5" />, desc: "Mot de passe" },
] as const;

export const AUTO_SAVE_SECTIONS = ["slider", "partners", "products", "orders", "emails", "security", "users", "links"];
