import { supabase } from "../lib/supabase";
import { enqueueEmail } from "../lib/email";

const DEMO_MODE = process.env.ACCELERATE_MODE === "true"; // fast mode for demo
const LOOP_INTERVAL = DEMO_MODE ? 10 * 1000 : 10 * 60 * 1000; // every 10s in demo, else 10min

export async function journeyEvaluator() {
  console.log("🔄 Running journey evaluator...");

  // 1. Load all users' journey states
  const { data: journeys, error } = await supabase
    .from("email_journey_state")
    .select("*");

  if (error) {
    console.error("Error fetching journey states:", error);
    return;
  }

  if (!journeys || journeys.length === 0) {
    console.log("No journeys found.");
    return;
  }

  for (const journey of journeys) {
    try {
      const { user_id, step_no, last_advanced_at } = journey;
      const last = new Date(last_advanced_at);

      // ✅ Check if user has published a video (using app_events)
      const { data: videoEvents, error: eventErr } = await supabase
        .from("app_events")
        .select("id, type, meta")
        .eq("user_id", user_id)
        .eq("type", "video_published")
        .limit(1);

      if (eventErr) {
        console.error(`Error checking app_events for ${user_id}:`, eventErr);
        continue;
      }

      if (videoEvents && videoEvents.length > 0 && step_no < 99) {
        // First video publish event → send congrats email
        await enqueueEmail({
          userId: user_id,
          templateKey: "congrats_first_publish",
          delaySeconds: DEMO_MODE ? 10 : 0,
        });

        await supabase
          .from("email_journey_state")
          .update({ step_no: 99, last_advanced_at: new Date().toISOString() })
          .eq("user_id", user_id);

        console.log(`🎉 Queued congrats_first_publish for ${user_id}`);
        continue; // skip the rest
      }

      // 📨 Regular onboarding journey
      if (step_no === 0) {
        await enqueueEmail({
          userId: user_id,
          templateKey: "welcome_day0",
          delaySeconds: DEMO_MODE ? 15 : 0,
        });

        await supabase
          .from("email_journey_state")
          .update({ step_no: 1, last_advanced_at: new Date().toISOString() })
          .eq("user_id", user_id);

        console.log(`👋 Queued welcome_day0 for ${user_id}`);
      }

      if (step_no === 1) {
        const wait = DEMO_MODE ? 60 * 1000 : 2 * 24 * 60 * 60 * 1000; // 60s or 2 days
        if (Date.now() - last.getTime() >= wait) {
          await enqueueEmail({
            userId: user_id,
            templateKey: "welcome_day2",
          });

          await supabase
            .from("email_journey_state")
            .update({ step_no: 2, last_advanced_at: new Date().toISOString() })
            .eq("user_id", user_id);

          console.log(`📩 Queued welcome_day2 for ${user_id}`);
        }
      }

      if (step_no === 2) {
        const wait = DEMO_MODE ? 120 * 1000 : 6 * 24 * 60 * 60 * 1000; // 120s or 6 days
        if (Date.now() - last.getTime() >= wait) {
          await enqueueEmail({
            userId: user_id,
            templateKey: "welcome_day6",
          });

          await supabase
            .from("email_journey_state")
            .update({ step_no: 3, last_advanced_at: new Date().toISOString() })
            .eq("user_id", user_id);

          console.log(`📩 Queued welcome_day6 for ${user_id}`);
        }
      }

    } catch (err) {
      console.error("Journey evaluator failed:", err);
    }
  }
}

// Run on interval
setInterval(journeyEvaluator, LOOP_INTERVAL);

console.log(`🚀 Journey evaluator running every ${LOOP_INTERVAL / 1000}s`);