import { supabase } from "@/app/supabase";
import type { Integration } from "../types";

export const GOOGLE_SHEETS_SERVICE = "google_sheets";

export type GoogleSheetsPayload = {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  customer_address: string;
  notes?: string;
  total: number;
  status?: string;
  created_at?: string;
  items?: Array<{
    id?: number;
    name: string;
    price: number;
    qty: number;
    color?: string;
    size?: string;
  }>;
};

export const GOOGLE_APPS_SCRIPT_CODE = `const SHEET_NAME = "Orders";

function doGet() {
  return jsonResponse({
    ok: false,
    error: "POST request required. Use MOD-TECH Test Connection or order sync, not the browser address bar."
  });
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || "{}");
    const sheet = getOrdersSheet();
    const order = payload.order || payload;
    const items = Array.isArray(order.items) ? order.items : [];

    sheet.appendRow([
      new Date(),
      order.customer_name || "",
      order.customer_phone || "",
      order.customer_email || "",
      order.customer_address || "",
      items.map(item => item.name + " x" + item.qty).join(" | "),
      order.total || 0,
      order.status || "new",
      order.notes || ""
    ]);

    SpreadsheetApp.flush();

    return jsonResponse({
      ok: true,
      sheet: sheet.getName(),
      row: sheet.getLastRow(),
      spreadsheetUrl: SpreadsheetApp.getActiveSpreadsheet().getUrl()
    });
  } catch (error) {
    return jsonResponse({ ok: false, error: String(error) });
  }
}

function getOrdersSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) {
    throw new Error("No active spreadsheet found. Create this script from Extensions > Apps Script inside your Google Spreadsheet.");
  }

  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.getSheets()[0] || spreadsheet.insertSheet(SHEET_NAME);
    sheet.setName(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Created At",
      "Customer Name",
      "Phone",
      "Email",
      "Address",
      "Items",
      "Total",
      "Status",
      "Notes"
    ]);
  }

  return sheet;
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}`;

export const loadIntegration = async (service = GOOGLE_SHEETS_SERVICE) => {
  const { data, error } = await supabase
    .from("integrations")
    .select("*")
    .eq("service", service)
    .maybeSingle();

  return { data: data as Integration | null, error };
};

export const saveIntegration = async ({
  service = GOOGLE_SHEETS_SERVICE,
  endpoint,
  enabled
}: {
  service?: string;
  endpoint: string;
  enabled: boolean;
}) => {
  const { data, error } = await supabase
    .from("integrations")
    .upsert({
      service,
      endpoint: endpoint.trim() || null,
      enabled,
      updated_at: new Date().toISOString()
    }, { onConflict: "service" })
    .select("*")
    .single();

  return { data: data as Integration | null, error };
};

export const resetIntegration = async (service = GOOGLE_SHEETS_SERVICE) => {
  const { data, error } = await supabase
    .from("integrations")
    .upsert({
      service,
      endpoint: null,
      enabled: false,
      updated_at: new Date().toISOString()
    }, { onConflict: "service" })
    .select("*")
    .single();

  return { data: data as Integration | null, error };
};

export const loadLastOrder = async () => {
  return supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
};

export const loadPendingOrders = async () => {
  return supabase
    .from("orders")
    .select("*")
    .eq("status", "new")
    .order("created_at", { ascending: false })
    .limit(25);
};
