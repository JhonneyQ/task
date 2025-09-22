// src/app/api/run-journey/route.ts
import { journeyEvaluator } from "@/src/workers/journey";
import { NextResponse } from "next/server";

export async function POST() {
  await journeyEvaluator();
  return NextResponse.json({ ok: true });
}
