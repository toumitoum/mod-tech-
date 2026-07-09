export type JsonObject = Record<string, unknown>;

export type SiteContentRow = {
  id: number;
  section: string;
  content: JsonObject | unknown[];
  updated_at: string;
};

export type Slide = { id: number; title: string; description: string; image: string; sort_order: number; is_active: boolean };
export type Partner = { id: number; name: string; logo: string; website: string; sort_order: number; is_active: boolean };

export type Supplier = {
  id: number | string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  website: string | null;
  notes: string | null;
  status: string;
  created_at?: string | null;
  updated_at?: string | null;
};

export type OrderAssignee = {
  id: number | string;
  name: string;
  email: string | null;
  is_active: boolean;
  created_at?: string | null;
  updated_at?: string | null;
};

export type OrderItem = { id: number; name: string; price: number; qty: number };
export type Order = {
  id: number; customer_name: string; customer_phone: string;
  customer_email: string; customer_address: string;
  items: OrderItem[];
  total: number; status: string; notes: string; created_at: string;
  assigned_to?: string | null; assigned_at?: string | null;
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
  purchase_price?: number | null;
  profit_margin?: number | null;
  selling_price?: number | null;
  discounted_price?: number | null;
  image: string;
  images: string[];
  category: string;
  is_active: boolean;
  sort_order: number;
  in_stock: boolean;
  stock_quantity?: number;
  minimum_stock_alert?: number | null;
  supplier_id?: number | string | null;
  supplier_reference?: string | null;
  sku?: string | null;
  barcode?: string | null;
  warranty_months?: number | null;
  purchase_date?: string | null;
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

export type AuditLog = {
  id: number;
  user_id: string | null;
  user_email: string | null;
  action: string;
  operation_type: string;
  section: string;
  item_name: string | null;
  item_id: string | null;
  old_data: JsonObject | unknown[] | null;
  new_data: JsonObject | unknown[] | null;
  details: JsonObject | null;
  ip_address: string | null;
  description: string | null;
  created_at: string;
};

export type NotificationModule = "orders" | "products" | "suppliers" | "users";

export type NotificationType =
  | "order_created"
  | "order_assigned"
  | "order_assignee_changed"
  | "order_confirmed"
  | "order_status_changed"
  | "order_delivered"
  | "order_cancelled"
  | "product_created"
  | "product_updated"
  | "product_deleted"
  | "product_low_stock"
  | "product_out_of_stock"
  | "supplier_created"
  | "supplier_updated"
  | "supplier_deleted"
  | "user_created"
  | "user_updated"
  | "user_deleted";

export type NotificationRow = {
  id: number;
  title: string;
  message: string;
  type: NotificationType | string;
  module: NotificationModule | string;
  entity_id: string | null;
  entity_type: string | null;
  created_by: string | null;
  is_read: boolean;
  created_at: string;
};

export type IntegrationService = "google_sheets";

export type Integration = {
  id: number;
  service: IntegrationService | string;
  endpoint: string | null;
  enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type QueueJobType =
  | "EMAIL"
  | "GOOGLE_SHEETS"
  | "NOTIFICATION"
  | "WHATSAPP"
  | "SMS"
  | "WEBHOOK"
  | "EXPORT_PDF"
  | "EXPORT_EXCEL"
  | "GENERATE_REPORT";

export type QueueJobStatus = "Pending" | "Processing" | "Completed" | "Failed" | "Cancelled";

export type QueueJob = {
  id: number;
  job_type: QueueJobType | string;
  payload: JsonObject | unknown[] | null;
  status: QueueJobStatus | string;
  retries: number;
  max_retries: number;
  error_message: string | null;
  created_by: string | null;
  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};
