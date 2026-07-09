import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest,NextResponse } from "next/server";

type GoogleSheetOrder = {
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  customer_address?: string;
  notes?: string;
  total?: number;
  status?: string;
  items?: unknown[];
};

type GoogleSheetRequest = {
  endpoint?: string;
  test?: boolean;
  order?: GoogleSheetOrder;
};

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
            // Ignore when cookies are not writable in the current runtime path.
          }
        },
      },
    }
  );
}

const buildTestOrder = (): GoogleSheetOrder => ({
  customer_name: "MOD-TECH Test",
  customer_phone: "0000000000",
  customer_email: "test@mod-tech.local",
  customer_address: "Integration test",
  notes: "Google Sheets connection test",
  total: 0,
  status: "test",
  items: [{ name: "Connection test", price: 0, qty: 1 }]
});

const isGoogleScriptFailure = (result: unknown) => (
  typeof result === "object"
  && result !== null
  && "ok" in result
  && (result as { ok?: unknown }).ok === false
);

const getGoogleScriptError = (result: unknown) => {
  if (typeof result === "object" && result !== null && "error" in result) {
    return String((result as { error?: unknown }).error || "Google Apps Script returned an error");
  }
  return "Google Apps Script returned an error";
};

const isGoogleScriptSuccess = (result: unknown) => (
  typeof result === "object"
  && result !== null
  && "ok" in result
  && (result as { ok?: unknown }).ok === true
);

const forwardToGoogleSheets = async (endpoint: string, order: GoogleSheetOrder) => {
  const body = JSON.stringify({ order });
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body
  });
  const text = await response.text();
  let result: unknown = text;

  try {
    result = JSON.parse(text);
  } catch {
    // Apps Script can return plain text depending on deployment settings.
  }

  if (typeof result === "string" && result.trim().startsWith("<")) {
    return {
      ok: false,
      status: response.status,
      error: "Google returned an HTML page instead of JSON. Check that the URL is the Web App /exec URL and access is set to Anyone.",
      result: result.slice(0, 240)
    };
  }

  if (response.ok && isGoogleScriptFailure(result)) {
    return {
      ok: false,
      status: response.status,
      error: getGoogleScriptError(result),
      result
    };
  }

  if (response.ok && !isGoogleScriptSuccess(result)) {
    return {
      ok: false,
      status: response.status,
      error: "Unexpected Google Apps Script response. Redeploy the generated script as a Web App and use the /exec URL.",
      result
    };
  }

  return { ok: response.ok, status: response.status, result };
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as GoogleSheetRequest | GoogleSheetOrder;
    const payload = "order" in body || "test" in body || "endpoint" in body
      ? body as GoogleSheetRequest
      : { order: body as GoogleSheetOrder };

    const supabase = await createClient();
    const { data: integration, error: integrationError } = await supabase
      .from("integrations")
      .select("*")
      .eq("service", "google_sheets")
      .maybeSingle();

    const endpoint = (payload.endpoint || integration?.endpoint || "").trim();

    if (!endpoint) {
      if (integrationError) {
        return NextResponse.json({
          ok: false,
          error: "Unable to read Google Sheets integration settings",
          details: integrationError.message
        }, { status: 500 });
      }

      return NextResponse.json({ ok: false, error: "Google Apps Script URL is not configured" }, { status: 400 });
    }

    if (!payload.test && integration && integration.enabled === false) {
      return NextResponse.json({ ok: true, skipped: true, reason: "Google Sheets sync is disabled" });
    }

    const order = payload.test ? buildTestOrder() : payload.order;
    if (!order) {
      return NextResponse.json({ ok: false, error: "Missing order payload" }, { status: 400 });
    }

    const result = await forwardToGoogleSheets(endpoint, order);
    return NextResponse.json(result, { status: result.ok ? 200 : 502 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Google Sheets sync failed" },
      { status: 500 }
    );
  }
}
