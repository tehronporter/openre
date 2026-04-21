"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { sendMessage, type MessageActionState } from "@/app/actions/messages";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/field";
import { createClient } from "@/lib/supabase/client";
import type { Conversation, Message } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type ComposeTarget = {
  conversation_id?: string;
  listing_id: string;
  seller_id: string;
  buyer_id: string;
  offer_id?: string;
};

export function MessagePanel({
  userId,
  conversations,
  messages,
  compose,
}: {
  userId: string;
  conversations: Conversation[];
  messages: Message[];
  compose?: {
    listing_id: string;
    seller_id: string;
    buyer_id: string;
    offer_id?: string;
  };
}) {
  const [activeId, setActiveId] = useState(conversations[0]?.id || "");
  const [liveMessages, setLiveMessages] = useState(messages);
  const [state, formAction, pending] = useActionState<MessageActionState, FormData>(
    sendMessage,
    {},
  );

  const activeConversation = conversations.find((c) => c.id === activeId);
  const thread = useMemo(
    () => liveMessages.filter((message) => message.conversation_id === activeId),
    [liveMessages, activeId],
  );

  useEffect(() => {
    if (!activeId) return;
    let channel: ReturnType<ReturnType<typeof createClient>["channel"]> | null = null;
    try {
      const supabase = createClient();
      channel = supabase
        .channel(`messages:${activeId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `conversation_id=eq.${activeId}`,
          },
          (payload) => {
            setLiveMessages((current) => [...current, payload.new as Message]);
          },
        )
        .subscribe();
    } catch {
      channel = null;
    }

    return () => {
      if (channel) createClient().removeChannel(channel);
    };
  }, [activeId]);

  const target: ComposeTarget | undefined = activeConversation
    ? {
        conversation_id: activeConversation.id,
        listing_id: activeConversation.listing_id,
        seller_id: activeConversation.seller_id,
        buyer_id: activeConversation.buyer_id,
        offer_id: activeConversation.offer_id || undefined,
      }
    : compose;

  return (
    <div className="grid min-h-[560px] gap-4 lg:grid-cols-[320px_1fr]">
      <Card className="overflow-hidden">
        <div className="border-b border-border p-4">
          <h2 className="font-semibold">Conversations</h2>
        </div>
        {conversations.length ? (
          <div className="divide-y divide-border">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                className="block w-full px-4 py-3 text-left transition hover:bg-muted"
                onClick={() => setActiveId(conversation.id)}
              >
                <p className="font-medium">
                  {conversation.listings?.title || "Listing conversation"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Started {formatDate(conversation.created_at)}
                </p>
              </button>
            ))}
          </div>
        ) : (
          <p className="p-4 text-sm leading-6 text-muted-foreground">
            No messages yet. Conversations appear after a buyer or seller starts one
            from a listing or offer.
          </p>
        )}
      </Card>

      <Card className="flex flex-col">
        <div className="border-b border-border p-4">
          <h2 className="font-semibold">
            {activeConversation?.listings?.title || "New conversation"}
          </h2>
          <p className="text-sm text-muted-foreground">Text-only listing conversation</p>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {thread.length ? (
            thread.map((message) => (
              <div
                key={message.id}
                className={
                  message.sender_id === userId
                    ? "ml-auto max-w-[80%] rounded-lg bg-primary p-3 text-primary-foreground"
                    : "max-w-[80%] rounded-lg bg-muted p-3"
                }
              >
                <p className="text-sm leading-6">{message.body}</p>
                <p className="mt-1 text-xs opacity-75">{formatDate(message.created_at)}</p>
              </div>
            ))
          ) : (
            <div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
              No messages in this thread yet.
            </div>
          )}
        </div>
        {target ? (
          <form action={formAction} className="border-t border-border p-4">
            {target.conversation_id ? (
              <input type="hidden" name="conversation_id" value={target.conversation_id} />
            ) : null}
            <input type="hidden" name="listing_id" value={target.listing_id} />
            <input type="hidden" name="seller_id" value={target.seller_id} />
            <input type="hidden" name="buyer_id" value={target.buyer_id} />
            {target.offer_id ? <input type="hidden" name="offer_id" value={target.offer_id} /> : null}
            <Textarea name="body" placeholder="Write a message..." required />
            {state.error ? (
              <p className="mt-2 text-sm text-danger">{state.error}</p>
            ) : null}
            <div className="mt-3 flex justify-end">
              <Button disabled={pending}>{pending ? "Sending..." : "Send message"}</Button>
            </div>
          </form>
        ) : null}
      </Card>
    </div>
  );
}
