import { MessagePanel } from "@/components/messages/message-panel";
import { requireUser } from "@/lib/auth";
import { getConversations, getMessages, getSellerListing } from "@/lib/data";

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{
    listing?: string;
    seller?: string;
    buyer?: string;
    offer?: string;
  }>;
}) {
  const [query, user] = await Promise.all([searchParams, requireUser()]);
  const conversations = await getConversations(user.id);
  const messages = await getMessages(conversations.map((conversation) => conversation.id));

  let sellerId = query.seller;
  if (!sellerId && query.listing) {
    const listing = await getSellerListing(query.listing, user.id);
    sellerId = listing?.seller_id;
  }

  const compose =
    query.listing && sellerId && query.buyer
      ? {
          listing_id: query.listing,
          seller_id: sellerId,
          buyer_id: query.buyer,
          offer_id: query.offer,
        }
      : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Messages</h1>
        <p className="mt-2 text-muted-foreground">
          Lightweight text conversations attached to listings and offers.
        </p>
      </div>
      <MessagePanel
        userId={user.id}
        conversations={conversations}
        messages={messages}
        compose={compose}
      />
    </div>
  );
}
