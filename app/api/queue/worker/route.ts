import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient,type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextRequest,NextResponse } from "next/server";

type QueueJob = {
  id: number;
  job_type: string;
  payload: Record<string, unknown>;
  status: string;
  retries: number;
  max_retries: number;
};

type OrderPayload = {
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  customer_address?: string;
  notes?: string;
  total?: number;
  status?: string;
  items?: Array<{ name?: string; price?: number; qty?: number }>;
};

type DbClient = SupabaseClient;

async function createClient(): Promise<DbClient> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (serviceRoleKey) {
    return createSupabaseClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  const cookieStore = await cookies();
  return createServerClient(
    supabaseUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore when cookies are not writable in this runtime path.
          }
        },
      },
    }
  );
}

const asOrder = (payload: Record<string, unknown>) => (
  "order" in payload ? payload.order as OrderPayload : payload as OrderPayload
);

const getErrorMessage = (error: unknown) => (
  error instanceof Error ? error.message : String(error || "Job failed")
);

const sendEmail = async (supabase: DbClient, payload: Record<string, unknown>) => {
  const order = asOrder(payload);
  const { data: settings, error: settingsError } = await supabase
    .from("email_settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (settingsError || !settings) throw new Error("Failed to fetch email settings");

  const notifyEmail = settings.notify_email || "";
  const resendKey = settings.resend_key || process.env.RESEND_API_KEY || "";
  if (!resendKey) throw new Error("No Resend API key configured");
  if (!notifyEmail) throw new Error("No notification email configured");

  const items = Array.isArray(order.items) ? order.items : [];
  const itemsHtml = items.map((item) => `
    <tr>
      <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0">${item.name || ""}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;text-align:center">${item.qty || 0}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;text-align:right;color:#0d9488;font-weight:700">${Number((item.price || 0) * (item.qty || 0)).toLocaleString()} دج</td>
    </tr>
  `).join("");

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden">
      <div style="background:#0d9488;color:#fff;padding:22px 26px">
        <h1 style="margin:0;font-size:20px">طلب جديد</h1>
        <p style="margin:6px 0 0;opacity:.86">MOD-TECH Store</p>
      </div>
      <div style="padding:24px">
        <p><strong>Client:</strong> ${order.customer_name || ""}</p>
        <p><strong>Téléphone:</strong> ${order.customer_phone || ""}</p>
        <p><strong>Adresse:</strong> ${order.customer_address || ""}</p>
        ${order.notes ? `<p><strong>Notes:</strong> ${order.notes}</p>` : ""}
        <table style="width:100%;border-collapse:collapse;margin-top:18px">
          <thead><tr style="background:#f8fafc"><th style="padding:10px;text-align:left">Produit</th><th>Qté</th><th style="text-align:right">Total</th></tr></thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <h2 style="text-align:right;color:#0d9488">${Number(order.total || 0).toLocaleString()} دج</h2>
      </div>
    </div>
  `;

  const resendRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${resendKey}`,
    },
    body: JSON.stringify({
      from: "MOD-TECH Store <onboarding@resend.dev>",
      to: [notifyEmail],
      subject: `طلب جديد - ${order.customer_name || "Client"} - ${Number(order.total || 0).toLocaleString()} دج`,
      html,
    }),
  });

  if (!resendRes.ok) {
    const text = await resendRes.text();
    throw new Error(`Resend failed: ${text.slice(0, 500)}`);
  }
};

const sendGoogleSheets = async (supabase: DbClient, payload: Record<string, unknown>) => {
  const order = asOrder(payload);
  const { data: integration, error } = await supabase
    .from("integrations")
    .select("*")
    .eq("service", "google_sheets")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!integration?.enabled || !integration.endpoint) throw new Error("Google Sheets integration is disabled or missing endpoint");

  const response = await fetch(integration.endpoint, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ order })
  });
  const text = await response.text();
  let result: unknown = text;
  try {
    result = JSON.parse(text);
  } catch {
    // Apps Script can return plain text when deployment is misconfigured.
  }

  if (!response.ok) throw new Error(`Google Sheets HTTP ${response.status}: ${text.slice(0, 300)}`);
  if (typeof result !== "object" || result === null || (result as { ok?: unknown }).ok !== true) {
    throw new Error(`Google Sheets failed: ${typeof result === "string" ? result.slice(0, 300) : JSON.stringify(result)}`);
  }
};

const createNotification = async (supabase: DbClient, payload: Record<string, unknown>) => {
  const { error } = await supabase.from("notifications").insert([{
    title: String(payload.title || ""),
    message: String(payload.message || ""),
    type: String(payload.type || "notification"),
    module: String(payload.module || "orders"),
    entity_id: payload.entity_id === undefined || payload.entity_id === null ? null : String(payload.entity_id),
    entity_type: payload.entity_type === undefined || payload.entity_type === null ? null : String(payload.entity_type),
    created_by: payload.created_by === undefined || payload.created_by === null ? null : String(payload.created_by),
    is_read: false
  }]);

  if (error) throw new Error(error.message);
};

const jobHandlers: Record<string, (supabase: DbClient, payload: Record<string, unknown>) => Promise<void>> = {
  EMAIL: sendEmail,
  GOOGLE_SHEETS: sendGoogleSheets,
  NOTIFICATION: createNotification
};

const executeJob = async (supabase: DbClient, job: QueueJob) => {
  const handler = jobHandlers[job.job_type];
  if (!handler) throw new Error(`Unsupported job type: ${job.job_type}`);
  return handler(supabase, job.payload);
};

const backoffDate = (nextRetries: number) => {
  const seconds = Math.min(60, Math.max(5, nextRetries * 10));
  return new Date(Date.now() + seconds * 1000).toISOString();
};

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    limit = 5,
    jobIds = []
  } = await req.json().catch(() => ({ limit: 5, jobIds: [] })) as { limit?: number; jobIds?: number[] };
  const now = new Date().toISOString();
  const selectedJobIds = Array.isArray(jobIds)
    ? jobIds.map(Number).filter(Number.isFinite).slice(0, 20)
    : [];

  let query = supabase
    .from("queue_jobs")
    .select("*")
    .in("status", ["Pending", "Failed"])
    .lte("scheduled_at", now)
    .order("created_at", { ascending: true });

  if (selectedJobIds.length > 0) {
    query = query.in("id", selectedJobIds).limit(selectedJobIds.length);
  } else {
    query = query.limit(Math.min(Math.max(Number(limit) || 5, 1), 20));
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const jobs = ((data ?? []) as QueueJob[]).filter(job => job.status === "Pending" || job.retries < job.max_retries);
  const results: Array<{ id: number; ok: boolean; error?: string }> = [];

  for (const job of jobs) {
    const startedAt = new Date().toISOString();
    await supabase
      .from("queue_jobs")
      .update({ status: "Processing", started_at: startedAt, updated_at: startedAt })
      .eq("id", job.id);

    try {
      await executeJob(supabase, job);
      const completedAt = new Date().toISOString();
      await supabase
        .from("queue_jobs")
        .update({
          status: "Completed",
          completed_at: completedAt,
          error_message: null,
          updated_at: completedAt
        })
        .eq("id", job.id);
      results.push({ id: job.id, ok: true });
    } catch (jobError) {
      const nextRetries = job.retries + 1;
      const failedAt = new Date().toISOString();
      const message = getErrorMessage(jobError);
      await supabase
        .from("queue_jobs")
        .update({
          status: "Failed",
          retries: nextRetries,
          error_message: message,
          scheduled_at: nextRetries < job.max_retries ? backoffDate(nextRetries) : null,
          updated_at: failedAt
        })
        .eq("id", job.id);
      results.push({ id: job.id, ok: false, error: message });
    }
  }

  return NextResponse.json({ ok: true, processed: results.length, results });
}
