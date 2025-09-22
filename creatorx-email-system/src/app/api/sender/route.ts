import { NextResponse } from "next/server";
import { senderLoop } from "@/src/workers/sender";

// Simple GET to trigger sender manually
export async function GET() {
  await senderLoop();
  return NextResponse.json({ ok: true });
}
