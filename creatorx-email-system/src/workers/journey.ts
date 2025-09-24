import { supabase } from "../lib/supabase";
import { enqueueEmail } from "../lib/email";

const LOOP_INTERVAL =  10 * 60 * 100;

export async function journeyEvaluator() {
  console.log("🔄 Running journey evaluator...");

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

      console.log(
        `➡️ User ${user_id}, step=${step_no}, last=${last.toISOString()}`
      );

      // Check for exit events (publish/project)
      const { data: events } = await supabase
        .from("app_events")
        .select("*")
        .eq("user_id", user_id)
        .in("type", ["video_published", "project_created"])
        .gte("created_at", last.toISOString());

      if (events && events.length > 0) {
        await enqueueEmail({
          userId: user_id,
          templateKey: "congrats_first_publish",
          delaySeconds: 0,
        });

        await supabase
          .from("email_journey_state")
          .update({
            step_no: 99,
            last_advanced_at: new Date().toISOString(),
          })
          .eq("user_id", user_id);

        console.log(`🎉 Queued congrats_first_publish for ${user_id}`);
        continue;
      }

      // Timings (compressed for demo)
      const waitStep1 =  30 * 1000; // 30s instead of 2 days
      const waitStep2 =  60 * 1000; // 60s instead of 6 days

      // Step 0 → Day0
      if (step_no === 0) {
        await enqueueEmail({
          userId: user_id,
          templateKey: "welcome_day0",
          delaySeconds: 0,
        });

        await supabase
          .from("email_journey_state")
          .update({
            step_no: 1,
            last_advanced_at: new Date().toISOString(),
          })
          .eq("user_id", user_id);

        console.log(`👋 Queued welcome_day0 for ${user_id}`);
        continue;
      }

      // Step 1 → Day2
      if (step_no === 1) {
        const elapsed = Date.now() - last.getTime();
        console.log(
          `⏱ Step 1 check: elapsed=${elapsed}, need=${waitStep1}`
        );

        if (elapsed >= waitStep1) {
          await enqueueEmail({
            userId: user_id,
            templateKey: "welcome_day2",
          });

          await supabase
            .from("email_journey_state")
            .update({
              step_no: 2,
              last_advanced_at: new Date().toISOString(),
            })
            .eq("user_id", user_id);

          console.log(`📩 Queued welcome_day2 for ${user_id}`);
        }
        continue;
      }

      // Step 2 → Day6
      if (step_no === 2) {
        const elapsed = Date.now() - last.getTime();
        console.log(
          `⏱ Step 2 check: elapsed=${elapsed}, need=${waitStep2}`
        );

        if (elapsed >= waitStep2) {
          await enqueueEmail({
            userId: user_id,
            templateKey: "welcome_day6",
          });

          await supabase
            .from("email_journey_state")
            .update({
              step_no: 3,
              last_advanced_at: new Date().toISOString(),
            })
            .eq("user_id", user_id);

          console.log(`📩 Queued welcome_day6 for ${user_id}`);
        }
        continue;
      }
    } catch (err) {
      console.error("Journey evaluator failed:", err);
    }
  }
}

// ⏱ Run on interval

console.log(
  `🚀 Journey evaluator running every ${LOOP_INTERVAL / 1000}s`
);
