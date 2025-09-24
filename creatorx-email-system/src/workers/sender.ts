import { resend } from "../lib/resend";
import { supabase } from "../lib/supabase";

const BATCH_SIZE = 10;

// replace {{placeholders}} in template with payload values
async function renderTemplate(template: string, payload: Record<string, any>) {
  let html = template;
  for (const key of Object.keys(payload)) {
    html = html.replace(new RegExp(`{{${key}}}`, "g"), payload[key]);
  }
  return html;
}

export async function senderLoop() {
  // 1. Get batch of pending emails ready to send
  const { data: emails, error: fetchError } = await supabase
    .from("email_queue")
    .select("*")
    .eq("status", "pending")
    .lte("send_after", new Date().toISOString())
    .limit(10);

  if (fetchError) {
    console.error("Fetch error:", fetchError);
    return;
  }

  if (!emails || emails.length === 0) {
    console.log("No emails to send.");
    return;
  }

  // 2. Mark them as "sending" (to avoid duplicates if loop overlaps)
  const ids = emails.map((e) => e.id);
  await supabase.from("email_queue").update({ status: "sending" }).in("id", ids);

  // 3. Process each
  for (const email of emails) {
    try {
      // Get recipient
      const { data: user, error: userError } = await supabase
        .from("profiles")
        .select("email, marketing_opt_in")
        .eq("id", email.user_id)
        .single();

      if (userError || !user?.email) {
        throw new Error(`User email not found for user_id=${email.user_id}`);
      }

      if (user.marketing_opt_in === false) {
        console.log(`⚠️ User ${email.user_id} unsubscribed, skipping email`);
        await supabase.from("email_queue").update({ status: "skipped" }).eq("id", email.id);
        continue;
      }

      const recipientEmail =
        process.env.NODE_ENV === "production"
          ? user.email
          : "kananqadirov2005@gmail.com"; // test email

      // Get template
      const { data: templates } = await supabase
        .from("email_templates")
        .select("*")
        .eq("key", email.template_key);

      if (!templates || templates.length === 0) {
        throw new Error(`Template ${email.template_key} not found`);
      }

      const template = templates[0];
      const html = await renderTemplate(template.html, email.payload || { name: "there" });

      // Send
      const { data, error: sendError } = await resend.emails.send({
        from: "onboarding@resend.dev",
        to: recipientEmail,
        subject: template.subject,
        html: `${html}
          <br><br>
          <small>
            <a href="${process.env.NEXT_PUBLIC_URL}/email/preferences?u=${email.user_id}">
              Manage your email preferences
            </a>
          </small>`,
        headers: {
          "List-Unsubscribe": `<${process.env.NEXT_PUBLIC_URL}/email/preferences?u=${email.user_id}>`,
        },
      });

      if (sendError) throw sendError;

      // Update queue
      await supabase.from("email_queue").update({ status: "sent" }).eq("id", email.id);

      await supabase.from("email_events").insert([
        {
          user_id: email.user_id,
          type: "delivered",
          meta: { provider_id: data?.id },
        },
      ]);

      console.log(`✅ Sent ${template.key} to ${recipientEmail}`);
    } catch (err) {
      console.error("❌ Failed sending:", err);
      await supabase.from("email_queue").update({ status: "failed" }).eq("id", email.id);
    }
  }
}
