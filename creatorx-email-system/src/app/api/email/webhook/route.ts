// /app/api/email/webhook/route.ts
import { supabase } from "@/src/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    const event = payload.type; // e.g. "bounced" or "complained"
    const email = payload.data?.to; // recipient address
    const providerId = payload.data?.id; // Resend message id

    // Log all events
    await supabase.from("email_events").insert([
      {
        user_id: null, // we'll look it up below
        type: event,
        meta: payload,
      },
    ]);

    if (email && ["bounced", "complained"].includes(event)) {
      // Find user by email
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .single();

      if (profile) {
        // Suppress further sends
        await supabase
          .from("profiles")
          .update({ marketing_opt_in: false })
          .eq("id", profile.id);

        // Also update email_queue (optional)
        await supabase
          .from("email_queue")
          .update({ status: "skipped" })
          .eq("user_id", profile.id)
          .eq("status", "pending");
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Webhook error", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
