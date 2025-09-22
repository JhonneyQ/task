// src/app/email/preferences/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/src/lib/supabase";

// GET /email/preferences?userId=...
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("marketing_opt_in")
    .eq("id", userId)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /email/preferences
export async function POST(req: Request) {
  const body = await req.json();
  const { userId, marketing_opt_in } = body;

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const { error } = await supabase
    .from("profiles")
    .update({ marketing_opt_in })
    .eq("id", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
