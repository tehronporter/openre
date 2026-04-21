import { MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth";
import { financingTypeLabels, offerStatusLabels } from "@/lib/constants";
import { getBuyerOffers } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function BuyerOffersPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string }>;
}) {
  const [query, user] = await Promise.all([searchParams, requireUser()]);
  const offers = await getBuyerOffers(user.id);

  return (
    <div className="space-y-6">
      {query.submitted ? (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-success">
          Offer submitted. You can track its status here.
        </div>
      ) : null}
      <div>
        <h1 className="text-3xl font-semibold">Submitted offers</h1>
        <p className="mt-2 text-muted-foreground">
          Track your offer status and continue conversations related to listings.
        </p>
      </div>

      {offers.length ? (
        <div className="grid gap-4">
          {offers.map((offer) => (
            <Card key={offer.id} className="p-5">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold">
                      {offer.listings?.title || "Listing"}
                    </h2>
                    <Badge
                      tone={
                        offer.status === "accepted"
                          ? "success"
                          : offer.status === "rejected"
                            ? "danger"
                            : "warning"
                      }
                    >
                      {offerStatusLabels[offer.status]}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {formatCurrency(offer.offer_price)} · {financingTypeLabels[offer.financing_type]} ·{" "}
                    {offer.closing_days} day close · Submitted {formatDate(offer.created_at)}
                  </p>
                </div>
                {offer.listings ? (
                  <div className="flex gap-2">
                    <LinkButton href={`/listings/${offer.listings.slug}`} variant="secondary">
                      View listing
                    </LinkButton>
                    <LinkButton
                      href={`/dashboard/messages?listing=${offer.listing_id}&seller=${offer.listings.seller_id}&buyer=${user.id}&offer=${offer.id}`}
                      variant="ghost"
                    >
                      <MessageCircle size={16} /> Message
                    </LinkButton>
                  </div>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No submitted offers"
          description="Browse listings and submit an offer when you find a property that fits."
          action={<LinkButton href="/listings">Browse listings</LinkButton>}
        />
      )}
    </div>
  );
}
