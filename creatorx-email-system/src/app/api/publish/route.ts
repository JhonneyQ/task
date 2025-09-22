import { NextResponse } from "next/server";

import { enqueueEmail } from "@/src/lib/email";
import { supabase } from "@/src/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // 1. Log event
    const { error: eventError } = await supabase.from("app_events").insert([
      {
        user_id: userId,
        type: "video_published",
        meta: {},
      },
    ]);

    if (eventError) {
      console.error("Error inserting publish event:", eventError);
      return NextResponse.json({ error: "Failed to log publish" }, { status: 500 });
    }

    // 2. Immediately enqueue congrats email
    await enqueueEmail({
      userId,
      templateKey: "congrats_first_publish",
    });

    // 3. End the onboarding journey
    await supabase
      .from("email_journey_state")
      .update({ step_no: 999, last_advanced_at: new Date().toISOString() })
      .eq("user_id", userId);

    return NextResponse.json({ ok: true, message: "Publish logged + Congrats email queued" });
  } catch (err) {
    console.error("Error in /api/publish:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
