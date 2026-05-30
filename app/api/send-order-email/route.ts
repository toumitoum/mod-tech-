import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest,NextResponse } from "next/server";

async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
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
            // ignore in Server Components
          }
        },
      },
    }
  );
}

type OrderEmailItem = {
  name: string;
  price: number;
  qty: number;
};

type OrderEmailPayload = {
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_email?: string;
  notes?: string;
  items: OrderEmailItem[];
  total: number;
};

export async function POST(req: NextRequest) {
  try {
    const { order } = await req.json() as { order: OrderEmailPayload };

    // ✅ Create client INSIDE the handler
    const supabase = await createClient();

    // جلب إعدادات الإيميل من Supabase
    const { data: settings, error: settingsError } = await supabase
      .from("email_settings")
      .select("*")
      .eq("id", 1)
      .single();

    if (settingsError || !settings) {
      console.error("Failed to fetch email settings:", settingsError);
      return NextResponse.json(
        { ok: false, error: "Failed to fetch email settings" },
        { status: 500 }
      );
    }

    const notifyEmail = settings.notify_email || "";
    const resendKey = settings.resend_key || process.env.RESEND_API_KEY || "";

    if (!resendKey) {
      console.error("No Resend API key found");
      return NextResponse.json(
        { ok: false, error: "No Resend API key configured" },
        { status: 500 }
      );
    }

    if (!notifyEmail) {
      console.error("No notification email found");
      return NextResponse.json(
        { ok: false, error: "No notification email configured" },
        { status: 500 }
      );
    }

    const itemsHtml = order.items
      .map(
        (i: OrderEmailItem) =>
          `<tr>
        <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#1e293b">${i.name}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;text-align:center;font-size:14px;color:#1e293b">${i.qty}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;text-align:right;color:#0d9488;font-weight:700;font-size:14px">${(i.price * i.qty).toLocaleString()} دج</td>
      </tr>`
      )
      .join("");

    const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:20px;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0d9488,#0f766e);padding:28px 32px;text-align:center">
      <div style="font-size:32px;margin-bottom:8px">🛒</div>
      <h1 style="color:#fff;margin:0;font-size:22px;font-weight:800">طلب جديد!</h1>
      <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px">MOD-TECHNOLOGIE Store</p>
    </div>

    <!-- Body -->
    <div style="padding:28px 32px">

      <!-- Customer Info -->
      <h2 style="margin:0 0 16px;font-size:16px;color:#0d9488;border-right:3px solid #0d9488;padding-right:10px">معلومات العميل</h2>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;background:#f8fafc;border-radius:10px;overflow:hidden">
        <tr><td style="padding:10px 14px;color:#64748b;width:130px;font-size:13px;font-weight:600">👤 الاسم</td><td style="padding:10px 14px;font-weight:700;color:#1e293b;font-size:14px">${order.customer_name}</td></tr>
        <tr style="background:#fff"><td style="padding:10px 14px;color:#64748b;font-size:13px;font-weight:600">📞 الهاتف</td><td style="padding:10px 14px;font-weight:800;color:#0d9488;font-size:16px">${order.customer_phone}</td></tr>
        <tr><td style="padding:10px 14px;color:#64748b;font-size:13px;font-weight:600">📍 العنوان</td><td style="padding:10px 14px;color:#1e293b;font-size:13px">${order.customer_address}</td></tr>
        ${order.customer_email ? `<tr style="background:#fff"><td style="padding:10px 14px;color:#64748b;font-size:13px;font-weight:600">📧 البريد</td><td style="padding:10px 14px;color:#1e293b;font-size:13px">${order.customer_email}</td></tr>` : ""}
        ${order.notes ? `<tr><td style="padding:10px 14px;color:#64748b;font-size:13px;font-weight:600">📝 ملاحظات</td><td style="padding:10px 14px;color:#1e293b;font-size:13px">${order.notes}</td></tr>` : ""}
      </table>

      <!-- Products -->
      <h2 style="margin:0 0 16px;font-size:16px;color:#0d9488;border-right:3px solid #0d9488;padding-right:10px">المنتجات المطلوبة</h2>
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;border-radius:10px;overflow:hidden">
        <thead>
          <tr style="background:#f1f5f9">
            <th style="padding:10px 14px;text-align:right;font-size:12px;color:#64748b;font-weight:700">المنتج</th>
            <th style="padding:10px 14px;text-align:center;font-size:12px;color:#64748b;font-weight:700">الكمية</th>
            <th style="padding:10px 14px;text-align:right;font-size:12px;color:#64748b;font-weight:700">السعر</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
        <tfoot>
          <tr style="background:linear-gradient(135deg,rgba(13,148,136,0.08),rgba(15,118,110,0.08))">
            <td colspan="2" style="padding:14px;font-weight:800;font-size:17px;color:#1e293b">💰 المجموع الكلي</td>
            <td style="padding:14px;font-weight:800;font-size:20px;color:#0d9488;text-align:right">${order.total.toLocaleString()} دج</td>
          </tr>
        </tfoot>
      </table>

      <!-- Payment -->
      <div style="background:#fef3c7;border:1px solid #f59e0b;border-radius:10px;padding:14px 18px;margin-bottom:24px;display:flex;align-items:center;gap:10px">
        <span style="font-size:20px">💳</span>
        <div>
          <strong style="color:#92400e;font-size:14px">الدفع عند الاستلام</strong>
          <p style="margin:2px 0 0;font-size:12px;color:#b45309">Cash on Delivery</p>
        </div>
      </div>

      <!-- CTA -->
      <div style="text-align:center">
        <a href="https://toumitoum-mod-tech.vercel.app/admin" style="display:inline-block;background:linear-gradient(135deg,#0d9488,#0f766e);color:#fff;text-decoration:none;padding:13px 28px;border-radius:10px;font-size:14px;font-weight:700;letter-spacing:0.03em">
          📦 عرض الطلب في لوحة التحكم
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="padding:16px 32px;background:#f8fafc;text-align:center;border-top:1px solid #e2e8f0">
      <p style="margin:0;font-size:11px;color:#94a3b8">MOD-TECHNOLOGIE © ${new Date().getFullYear()} · تم الإرسال تلقائياً عند تأكيد الطلب</p>
    </div>
  </div>
</body>
</html>`;

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: "MOD-TECH Store <onboarding@resend.dev>",
        to: [notifyEmail],
        subject: `🛒 طلب جديد — ${order.customer_name} — ${order.total.toLocaleString()} دج`,
        html,
      }),
    });

    // ✅ Safe JSON parsing — Resend may return HTML on auth errors
    const contentType = resendRes.headers.get("content-type") || "";
    let result: unknown;
    if (contentType.includes("application/json")) {
      result = await resendRes.json();
    } else {
      const text = await resendRes.text();
      console.error("Resend returned non-JSON:", text);
      return NextResponse.json(
        { ok: false, error: "Resend returned an unexpected response", raw: text },
        { status: 500 }
      );
    }

    if (!resendRes.ok) {
      console.error("Resend error:", result);
      return NextResponse.json({ ok: false, result }, { status: 500 });
    }

    // ================= SEND TO GOOGLE SHEET =================
    try {
      const sheetRes = await fetch(
        "https://script.google.com/macros/s/AKfycbyinV7bf7Uxkn64svqmeanzi2aB8eNMRil2Eb2TgPq7E-I7tnsJjw4WQUiq2JZY_cc4OQ/exec",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(order),
        }
      );
      if (!sheetRes.ok) {
        console.error("Google Sheet error: HTTP", sheetRes.status);
      }
    } catch (sheetErr) {
      console.error("Google Sheet error:", sheetErr);
    }

    return NextResponse.json({ ok: true, result });
  } catch (err: unknown) {
    console.error("API error:", err);
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
