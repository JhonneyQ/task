import { supabase } from "@/src/lib/supabase";
import { NextResponse } from "next/server";


export async function POST(req: Request) {
  try {
    const { user_id, project_name } = await req.json();

    if (!user_id) {
      return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
    }

    // Log app_event: project_created
    await supabase.from("app_events").insert({
      user_id,
      type: "project_created",
      meta: { project_name },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("POST /api/projects error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
