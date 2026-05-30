import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {}
          },
        },
      }
    );

    // ── INSERT ──
    const { data, error: insertError } = await supabase
      .from("keep_alive_log")
      .insert([{ pinged_at: new Date().toISOString() }])
      .select("id")
      .single();

    if (insertError) {
      return NextResponse.json({ ok: false, error: insertError.message }, { status: 500 });
    }

    // ── DELETE ──
    await supabase
      .from("keep_alive_log")
      .delete()
      .eq("id", data.id);

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      message: "Supabase is alive!"
    });

  } catch (err: unknown) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
