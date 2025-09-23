import { enqueueEmail } from "@/src/lib/email";
import { supabase } from "@/src/lib/supabase";
import { journeyEvaluator } from "@/src/workers/journey"; // 👈 add evaluator
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { user_id, title } = await req.json();

    if (!user_id) {
      return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
    }

    // Log app_event: video_published
    await supabase.from("app_events").insert({
      user_id,
      type: "video_published",
      meta: { title },
    });

    // 👇 Run journeys immediately (this can enqueue the email)
    await journeyEvaluator();

     await enqueueEmail({
          userId: user_id,
          templateKey: "congrats_first_publish", // 👈 adjust to your template key
          delaySeconds: 0,
        });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("POST /api/publish error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
