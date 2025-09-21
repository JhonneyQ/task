
import { resend } from "../lib/resend";
import { supabase } from "../lib/supabase";


const BATCH_SIZE = 10;

async function renderTemplate(template: string, payload: Record<string, any>) {
  let html = template;
  for (const key of Object.keys(payload)) {
    html = html.replace(new RegExp(`{{${key}}}`, "g"), payload[key]);
  }
  return html;
}

export async function senderLoop() {
  // 1. Claim batch
  const { data: claimed, error: claimError } = await supabase.rpc(
    "claim_email_batch",
    { batch_size: BATCH_SIZE }
  );

  if (claimError) {
    console.error("Claim error:", claimError);
    return;
  }

  if (!claimed || claimed.length === 0) {
    console.log("No emails to send.");
    return;
  }

  for (const email of claimed) {
    try {
      // 2. Load template
      const { data: templates } = await supabase
        .from("email_templates")
        .select("*")
        .eq("key", email.template_key);

      if (!templates || templates.length === 0) {
        throw new Error(`Template ${email.template_key} not found`);
      }

      const template = templates[0];
      const html = await renderTemplate(template.html, {
        name: email.payload?.name || "there",
      });

      // 3. Send with Resend
      const { data, error: sendError } = await resend.emails.send({
        from: "onboarding@resend.dev",
        to: "your.email@example.com", // sandbox mode
        subject: template.subject,
        html,
      });

      if (sendError) throw sendError;

      // 4. Update queue + log event
      await supabase
        .from("email_queue")
        .update({ status: "sent" })
        .eq("id", email.id);

      await supabase.from("email_events").insert([
        {
          user_id: email.user_id,
          type: "delivered",
          meta: { provider_id: data?.id },
        },
      ]);

      console.log(`✅ Sent ${template.key} to user ${email.user_id}`);
    } catch (err) {
      console.error("❌ Failed sending:", err);

      await supabase
        .from("email_queue")
        .update({ status: "failed" })
        .eq("id", email.id);
    }
  }
}
