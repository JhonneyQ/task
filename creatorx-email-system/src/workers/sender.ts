import { resend } from "../lib/resend";
import { supabase } from "../lib/supabase";

const BATCH_SIZE = 10;
const QUIET_HOURS_START = 22; // 22:00
const QUIET_HOURS_END = 7;    // 07:00
const RATE_LIMIT_HOURS = 24;
const IDEMPOTENCY_HOURS = 48;

async function renderTemplate(template: string, payload: Record<string, any>) {
  let html = template;
  for (const key of Object.keys(payload)) {
    html = html.replace(new RegExp(`{{${key}}}`, "g"), payload[key]);
  }
  return html;
}

function isQuietHours(): boolean {
  const hour = new Date().getHours();
  return hour >= QUIET_HOURS_START || hour < QUIET_HOURS_END;
}

export async function senderLoop() {
  // 1. Get batch
  const { data: emails, error: fetchError } = await supabase
    .from("email_queue")
    .select("*")
    .eq("status", "pending")
    .lte("send_after", new Date().toISOString())
    .limit(BATCH_SIZE);

  if (fetchError) {
    console.error("Fetch error:", fetchError);
    return;
  }

  if (!emails || emails.length === 0) {
    console.log("No emails to send.");
    return;
  }

  // 2. Mark them as "sending"
  // const ids = emails.map((e) => e.id);
  // await supabase.from("email_queue").update({ status: "sending" }).in("id", ids);

  // 3. Process each
  for (const email of emails) {
    try {
      // (a) Quiet hours
      // if (isQuietHours() && true) {
      //   console.log("⏸ Quiet hours, delaying send");
      //   await supabase.from("email_queue").update({ status: "pending" }).eq("id", email.id);
      //   continue;
      // }

      // (b) Get user
      const { data: user, error: userError } = await supabase
        .from("profiles")
        .select("email, marketing_opt_in")
        .eq("id", email.user_id)
        .single();

      if (userError || !user?.email) {
        throw new Error(`User email not found for user_id=${email.user_id}`);
      }

      // (c) Suppression checks
      // -- unsubscribed
      if (user.marketing_opt_in === false) {
        console.log(`⚠️ User ${email.user_id} unsubscribed, skipping email`);
        await supabase.from("email_queue").update({ status: "skipped" }).eq("id", email.id);
        continue;
      }

      // -- bounced or spam-flagged
      const { data: suppression } = await supabase
        .from("email_events")
        .select("type")
        .eq("user_id", email.user_id)
        .in("type", ["bounced", "complained"]) // complained = spam
        .limit(1);

      if (suppression && suppression.length > 0) {
        console.log(`🚫 User ${email.user_id} is suppressed due to ${suppression[0].type}`);
        await supabase.from("email_queue").update({ status: "skipped" }).eq("id", email.id);
        continue;
      }

      // (d) Rate limit — 1/24h
      const { data: recent } = await supabase
        .from("email_events")
        .select("created_at")
        .eq("user_id", email.user_id)
        .eq("type", "delivered")
        .order("created_at", { ascending: false })
        .limit(1);

      // if (
      //   recent?.length &&
      //   new Date().getTime() - new Date(recent[0].created_at).getTime() <
      //     RATE_LIMIT_HOURS * 60 * 60 * 1000
      // ) {
      //   console.log(`⏳ Rate limited: user ${email.user_id} had an email in last 24h`);
      //   await supabase.from("email_queue").update({ status: "skipped" }).eq("id", email.id);
      //   continue;
      // }

      // (e) Idempotency — skip duplicate template within 48h
      const { data: dup } = await supabase
        .from("email_events")
        .select("created_at")
        .eq("user_id", email.user_id)
        .eq("type", "delivered")
        .contains("meta", { template_key: email.template_key })
        .order("created_at", { ascending: false })
        .limit(1);

      if (
        dup?.length &&
        new Date().getTime() - new Date(dup[0].created_at).getTime() <
          IDEMPOTENCY_HOURS * 60 * 60 * 1000
      ) {
        console.log(`🛑 Duplicate email suppressed for ${email.user_id}`);
        await supabase.from("email_queue").update({ status: "skipped" }).eq("id", email.id);
        continue;
      }

      // (f) Recipient
      const recipientEmail =
        process.env.NODE_ENV === "production"
          ? user.email
          : "kananqadirov2005@gmail.com";

      // (g) Template
      const { data: templates } = await supabase
        .from("email_templates")
        .select("*")
        .eq("key", email.template_key);

      if (!templates || templates.length === 0) {
        throw new Error(`Template ${email.template_key} not found`);
      }

      const template = templates[0];
      const html = await renderTemplate(template.html, email.payload || { name: "there" });

      // (h) Send
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

      // (i) Update + log
      await supabase.from("email_queue").update({ status: "sent" }).eq("id", email.id);

      await supabase.from("email_events").insert([
        {
          user_id: email.user_id,
          type: "delivered",
          meta: {
            provider_id: data?.id,
            template_key: email.template_key,
          },
        },
      ]);

      console.log(`✅ Sent ${template.key} to ${recipientEmail}`);
    } catch (err) {
      console.error("❌ Failed sending:", err);
      await supabase.from("email_queue").update({ status: "failed" }).eq("id", email.id);
    }
  }
}
