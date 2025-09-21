import { NextResponse } from "next/server";

import { randomUUID } from "crypto";
import { supabase } from "@/src/lib/supabase";

export async function POST(req: Request) {
  try {
    const { email, full_name, timezone } = await req.json();

    if (!email || !full_name || !timezone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Insert profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: randomUUID(),
        email,
        full_name,
        timezone,
      })
      .select()
      .single();

    if (profileError) throw profileError;

    // Log app_event: user_signed_up
    await supabase.from("app_events").insert({
      user_id: profile.id,
      type: "user_signed_up",
      meta: {},
    });

    // Initialize journey state
    await supabase.from("email_journey_state").insert({
      user_id: profile.id,
      journey_key: "onboarding_v1",
      step_no: 0,
      data: {},
    });

    return NextResponse.json({ success: true, profile });
  } catch (err: any) {
    console.error("POST /api/users error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
