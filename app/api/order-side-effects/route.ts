import { createClient } from "@supabase/supabase-js";
import { NextRequest,NextResponse } from "next/server";

type OrderSideEffectsRequest = {
  order?: Record<string, unknown>;
  created_by?: string | null;
};

const postInternal = async (req: NextRequest, path: string, body: unknown) => {
  const response = await fetch(new URL(path, req.url), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.ok === false) {
    throw new Error(data.error || data.reason || `${path} failed`);
  }

  return data;
};

const sendDirect = async (req: NextRequest, order: Record<string, unknown>) => {
  const payload = { order };
  const results = await Promise.allSettled([
    postInternal(req, "/api/send-order-email", payload),
    postInternal(req, "/api/google-sheet", payload)
  ]);
  const errors = results
    .filter((result): result is PromiseRejectedResult => result.status === "rejected")
    .map((result) => result.reason instanceof Error ? result.reason.message : String(result.reason));

  return { ok: errors.length === 0, mode: "direct", results, errors };
};

const queueAndProcess = async (req: NextRequest, order: Record<string, unknown>, createdBy: string | null) => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) return null;

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  const payload = { order };
  const { data, error } = await supabase
    .from("queue_jobs")
    .insert([
      { job_type: "EMAIL", payload, status: "Pending", retries: 0, max_retries: 3, scheduled_at: new Date().toISOString(), created_by: createdBy },
      { job_type: "GOOGLE_SHEETS", payload, status: "Pending", retries: 0, max_retries: 3, scheduled_at: new Date().toISOString(), created_by: createdBy }
    ])
    .select("id");

  if (error) throw new Error(error.message);

  const jobIds = (data ?? []).map((job) => Number(job.id)).filter(Number.isFinite);
  if (jobIds.length === 0) return null;

  const workerResult = await postInternal(req, "/api/queue/worker", { limit: jobIds.length, jobIds });
  const completedIds = new Set(
    (Array.isArray(workerResult.results) ? workerResult.results : [])
      .filter((result: { ok?: unknown }) => result.ok === true)
      .map((result: { id?: unknown }) => Number(result.id))
  );

  return {
    ok: jobIds.every((id) => completedIds.has(id)),
    mode: "queue",
    jobIds,
    workerResult
  };
};

export async function POST(req: NextRequest) {
  try {
    const { order, created_by = null } = await req.json() as OrderSideEffectsRequest;
    if (!order) {
      return NextResponse.json({ ok: false, error: "Missing order payload" }, { status: 400 });
    }

    const queueResult = await queueAndProcess(req, order, created_by);
    if (queueResult) {
      return NextResponse.json(queueResult, { status: queueResult.ok ? 200 : 502 });
    }

    const directResult = await sendDirect(req, order);
    return NextResponse.json(directResult, { status: directResult.ok ? 200 : 502 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Order side effects failed" },
      { status: 500 }
    );
  }
}
