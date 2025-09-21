import { supabase } from "./supabase";

type EnqueueEmailParams = {
  userId: string;
  templateKey: string;
  variant?: string;
  payload?: Record<string, any>;
  delaySeconds?: number;
};

export async function enqueueEmail({
  userId,
  templateKey,
  variant,
  payload = {},
  delaySeconds = 0,
}: EnqueueEmailParams) {
  const sendAfter = new Date(Date.now() + delaySeconds * 1000).toISOString();

  const { data, error } = await supabase.from("email_queue").insert([
    {
      user_id: userId,
      template_key: templateKey,
      variant,
      payload,
      send_after: sendAfter,
    },
  ]);

  if (error) {
    console.error("Error enqueueing email:", error);
    throw error;
  }

  return data;
}
