import { NextResponse } from "next/server";
import { supabase } from "@/src/lib/supabase";

export async function POST(req: Request) {
  const body = await req.json();

  // Example payload: { userId, event: "unsubscribed" }
  const { userId, event } = body;

  await supabase.from("email_events").insert([
    { user_id: userId, type: event, meta: body }
  ]);

  if (event === "unsubscribed") {
    await supabase.from("email_suppressions").insert([{ user_id: userId }]);
  }

  return NextResponse.json({ received: true });
}
