import { supabase } from "@/src/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { user_id, video_id } = await req.json();

    if (!user_id || !video_id) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Log app_event: video_published
    await supabase.from("app_events").insert({
      user_id,
      type: "video_published",
      meta: { video_id },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("POST /api/publish error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
