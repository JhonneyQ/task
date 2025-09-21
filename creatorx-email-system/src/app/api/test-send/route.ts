import { NextResponse } from "next/server";

import { senderLoop } from "@/src/workers/sender";
import { enqueueTestEmail } from "@/src/lib/email";


// ⚠️ replace this with a real UUID from your `profiles` table
const TEST_USER_ID = "85629cc3-edfc-434a-962b-951e0121ed1d";

export async function GET() {
  try {
    console.log("👉 Enqueueing test email...");
    await enqueueTestEmail(TEST_USER_ID);

    console.log("👉 Running sender loop...");
    await senderLoop();
    
    return NextResponse.json({ success: true, message: "Email sent via Resend sandbox 🚀" });
  } catch (err: any) {
    console.error("Error in test-send route:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
