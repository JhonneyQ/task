import { NextResponse } from "next/server";
import { supabase } from "@/src/lib/supabase";
import { enqueueEmail } from "@/src/lib/email";

export async function POST(req: Request) {
  try {
    const { user_id, title } = await req.json();
    // console.log(user_id);
    
    
    if (!user_id ) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    // 1. Save publish event in app_events
    await supabase.from("app_events").insert([
      {
        user_id: user_id,
        type: "video_published", // 🔥 or "project_created",
      },
    ]);

    // 2. Immediately enqueue a congrats email
    await enqueueEmail({
      userId: user_id,
      templateKey: "congrats_first_publish", // 👈 adjust to your template key
      delaySeconds: 0,
    });

    return NextResponse.json({ success: true, message: "Video published + email queued 🚀" });
  } catch (err: any) {
    console.error("❌ Publish error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
