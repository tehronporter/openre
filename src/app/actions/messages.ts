"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { messageSchema } from "@/lib/validators";

export type MessageActionState = {
  error?: string;
};

export async function sendMessage(
  _prevState: MessageActionState,
  formData: FormData,
): Promise<MessageActionState> {
  const user = await requireUser();
  const parsed = messageSchema.safeParse({
    conversation_id: formData.get("conversation_id") || undefined,
    listing_id: formData.get("listing_id"),
    offer_id: formData.get("offer_id") || undefined,
    seller_id: formData.get("seller_id"),
    buyer_id: formData.get("buyer_id"),
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Check your message." };
  }

  const supabase = await createClient();
  let conversationId = parsed.data.conversation_id;

  if (!conversationId) {
    const { data: conversation, error } = await supabase
      .from("conversations")
      .upsert(
        {
          listing_id: parsed.data.listing_id,
          seller_id: parsed.data.seller_id,
          buyer_id: parsed.data.buyer_id,
          offer_id: parsed.data.offer_id || null,
        },
        { onConflict: "listing_id,buyer_id" },
      )
      .select("id")
      .single();

    if (error || !conversation) {
      return { error: error?.message || "Could not start conversation." };
    }
    conversationId = conversation.id;
  }

  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    body: parsed.data.body,
  });

  if (error) return { error: "Message failed to send. Please retry." };

  revalidatePath("/dashboard/messages");
  return {};
}
