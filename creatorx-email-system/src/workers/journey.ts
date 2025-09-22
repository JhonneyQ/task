import { supabase } from "../lib/supabase";
import { enqueueEmail } from "../lib/email";

const DEMO_MODE = process.env.ACCELERATE_MODE === "true"; 
const LOOP_INTERVAL = DEMO_MODE ? 10 * 1000 : 10 * 60 * 1000; 

export async function journeyEvaluator() {
  console.log("🔄 Running journey evaluator...");

  // 1. Load all users’ journey states
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

      // --- 🔥 NEW: Check if user published a video
      const { data: events } = await supabase
        .from("app_events")
        .select("*")
        .eq("user_id", user_id)
        .eq("type", "video_published")
        .gte("created_at", last.toISOString()); // only after last step

      if (events && events.length > 0) {
        // 🎉 Immediately send congrats email
        await enqueueEmail({
          userId: user_id,
          templateKey: "congrats_first_publish",
          delaySeconds: 0,
        });

        await supabase
          .from("email_journey_state")
          .update({ step_no: 99, last_advanced_at: new Date().toISOString() }) // mark journey as finished
          .eq("user_id", user_id);

        console.log(`🎉 Queued congrats_first_publish for ${user_id}`);
        continue; // skip rest of checks
      }

      // --- Step 0
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

      // --- Step 1 → Day 2
      if (step_no === 1) {
        const wait = DEMO_MODE ? 60 * 1000 : 2 * 24 * 60 * 60 * 1000;
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

      // --- Step 2 → Day 6
      if (step_no === 2) {
        const wait = DEMO_MODE ? 120 * 1000 : 6 * 24 * 60 * 60 * 1000;
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

// ⏱ Run on interval
setInterval(journeyEvaluator, LOOP_INTERVAL);
console.log(`🚀 Journey evaluator running every ${LOOP_INTERVAL / 1000}s`);
