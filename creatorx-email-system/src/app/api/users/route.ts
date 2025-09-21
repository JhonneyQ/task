import { supabase } from "@/src/lib/supabase";

export async function POST(req: Request) {
  const { email, fullName, timezone } = await req.json();

  const { data, error } = await supabase
    .from("profiles")
    .insert([{ email, full_name: fullName, timezone }])
    .select()
    .single();

  if (error) {
    return new Response(error.message, { status: 400 });
  }

  return Response.json(data);
}
