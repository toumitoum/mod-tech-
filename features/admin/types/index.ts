export type JsonObject = Record<string, unknown>;

export type SiteContentRow = {
  id: number;
  section: string;
  content: JsonObject | unknown[];
  updated_at: string;
};

export type Slide = { id: number; title: string; description: string; image: string; sort_order: number; is_active: boolean };
export type Partner = { id: number; name: string; logo: string; website: string; sort_order: number; is_active: boolean };

export type OrderItem = { id: number; name: string; price: number; qty: number };
export type Order = {
  id: number; customer_name: string; customer_phone: string;
  customer_email: string; customer_address: string;
  items: OrderItem[];
  total: number; status: string; notes: string; created_at: string;
};

export type ProductColor = { name: string; hex: string };
export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  private_note: string;
  original_price: number;
  discount_percent: number;
  image: string;
  images: string[];
  category: string;
  is_active: boolean;
  sort_order: number;
  in_stock: boolean;
  colors: ProductColor[];
  sizes: string[];
  specs: Record<string, string>;
  reference: string;
};

export type EmailSettings = { id: number; notify_email: string; resend_key: string; updated_at: string };
export type Status = "idle" | "loading" | "saving" | "error";

export type HomeHero = {
  title: string;
  titleHighlight?: string;
  subtitle: string;
  badge: string;
  btnPrimary: string;
  btnSecondary: string;
  bgImage: string;
  logoUrl?: string;
};

export type StoreHero = {
  title: string;
  subtitle: string;
  badge: string;
  bgImage: string;
  btnPrimary: string;
  btnSecondary: string;
};

export type AdminDrafts = Record<string, unknown>;
