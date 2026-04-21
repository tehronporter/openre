import { Activity, Home, Scale, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth";
import { financingTypeLabels, listingStatusLabels, offerStatusLabels } from "@/lib/constants";
import { getSellerListings, getSellerOffers } from "@/lib/data";
import type { Offer } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const user = await requireUser();
  const [listings, offers] = await Promise.all([
    getSellerListings(user.id),
    getSellerOffers(user.id),
  ]);

  const activeListings = listings.filter((listing) =>
    ["published", "under_contract"].includes(listing.status),
  );
  const bestOffer = offers.reduce<Offer | null>(
    (best, offer) => (!best || offer.offer_price > best.offer_price ? offer : best),
    null,
  );
  const recentOffers = offers.slice(0, 3);
  const recentActivity = recentOffers[0]
    ? `${formatCurrency(recentOffers[0].offer_price)} offer on ${recentOffers[0].listings?.title || "a listing"}`
    : "No offer activity yet";

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary">
            Seller command center
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Control your deal</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Manage your listings, compare every offer, and decide which deal moves forward.
          </p>
        </div>
        <LinkButton href="/dashboard/listings/new">Create New Listing</LinkButton>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric icon={<Home />} label="Active Listings" value={String(activeListings.length)} />
        <Metric icon={<Scale />} label="Total Offers Received" value={String(offers.length)} />
        <Metric
          icon={<Trophy />}
          label="Best Offer"
          value={bestOffer ? formatCurrency(bestOffer.offer_price) : "-"}
        />
        <Metric icon={<Activity />} label="Recent Activity" value={recentActivity} compact />
      </div>

      {listings.length ? (
        <Card className="overflow-hidden">
          <div className="flex flex-col justify-between gap-3 border-b border-border p-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-semibold">Your active deal rooms</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Open a listing to review offers and choose the best outcome.
              </p>
            </div>
            <LinkButton href="/dashboard/listings" variant="secondary">
              View listings
            </LinkButton>
          </div>
          <div className="divide-y divide-border">
            {listings.slice(0, 4).map((listing) => (
              <div
                key={listing.id}
                className="flex flex-col justify-between gap-4 p-5 md:flex-row md:items-center"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{listing.title}</p>
                    <Badge tone={listing.status === "under_contract" ? "success" : "neutral"}>
                      {listingStatusLabels[listing.status]}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatCurrency(listing.price)} · {listing.city}, {listing.state}
                  </p>
                </div>
                <LinkButton href={`/dashboard/listings/${listing.id}`} variant="secondary">
                  Open Command Center
                </LinkButton>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <EmptyState
          title="Create your first listing to start receiving offers"
          description="Publish a property, share the listing, and use OpenRE to compare offers side-by-side."
          action={<LinkButton href="/dashboard/listings/new">Create New Listing</LinkButton>}
        />
      )}

      <Card className="overflow-hidden">
        <div className="border-b border-border p-5">
          <h2 className="text-xl font-semibold">Recent offers</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The latest buyer activity across your listings.
          </p>
        </div>
        {recentOffers.length ? (
          <div className="divide-y divide-border">
            {recentOffers.map((offer) => (
              <div
                key={offer.id}
                className="flex flex-col justify-between gap-4 p-5 md:flex-row md:items-center"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{formatCurrency(offer.offer_price)}</p>
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
                  <p className="mt-1 text-sm text-muted-foreground">
                    {offer.listings?.title || "Listing"} · {financingTypeLabels[offer.financing_type]} ·{" "}
                    {offer.closing_days} days · {formatDate(offer.created_at)}
                  </p>
                </div>
                {offer.listings ? (
                  <LinkButton href={`/dashboard/listings/${offer.listing_id}`} variant="secondary">
                    Compare
                  </LinkButton>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-5 text-sm text-muted-foreground">
            No offers yet. Share your listing to attract buyers.
          </div>
        )}
      </Card>
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
  compact,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  compact?: boolean;
}) {
  return (
    <Card className="p-5">
      <div className="text-primary [&_svg]:size-5">{icon}</div>
      <p className="mt-4 text-sm text-muted-foreground">{label}</p>
      <p className={compact ? "mt-1 text-base font-semibold leading-6" : "mt-1 text-3xl font-semibold"}>
        {value}
      </p>
    </Card>
  );
}
