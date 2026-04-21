import { Badge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Select } from "@/components/ui/field";
import { requireUser } from "@/lib/auth";
import { financingTypeLabels, offerStatusLabels } from "@/lib/constants";
import { getSellerListings, getSellerOffers } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";

const statusOptions = [
  ["", "All statuses"],
  ["pending", "Pending"],
  ["accepted", "Accepted"],
  ["rejected", "Declined"],
];

export default async function SellerOffersPage({
  searchParams,
}: {
  searchParams: Promise<{ listing?: string; status?: string }>;
}) {
  const [query, user] = await Promise.all([searchParams, requireUser()]);
  const [listings, offers] = await Promise.all([
    getSellerListings(user.id),
    getSellerOffers(user.id, {
      listing_id: query.listing,
      status: query.status,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary">
            All seller offers
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Offers across listings</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Filter every offer received across your properties and jump into the
            listing command center to compare terms.
          </p>
        </div>
        <LinkButton href="/dashboard/listings/new">Create New Listing</LinkButton>
      </div>

      <form className="grid gap-3 rounded-lg border border-border bg-surface p-4 md:grid-cols-[1fr_220px_auto]">
        <Select name="listing" defaultValue={query.listing || ""}>
          <option value="">All listings</option>
          {listings.map((listing) => (
            <option key={listing.id} value={listing.id}>
              {listing.title}
            </option>
          ))}
        </Select>
        <Select name="status" defaultValue={query.status || ""}>
          {statusOptions.map(([value, label]) => (
            <option key={label} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Button type="submit">Filter</Button>
      </form>

      {offers.length ? (
        <div className="grid gap-4">
          {offers.map((offer) => (
            <Card key={offer.id} className="p-5">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xl font-semibold">
                      {formatCurrency(offer.offer_price)}
                    </p>
                    <OfferBadge status={offer.status} />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {offer.listings?.title || "Listing"} ·{" "}
                    {offer.offer_type === "cash" ? "Cash buyer" : "Financed buyer"} ·{" "}
                    {financingTypeLabels[offer.financing_type]} · {offer.closing_days} day close
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Submitted {formatDate(offer.created_at)}
                  </p>
                </div>
                <LinkButton href={`/dashboard/listings/${offer.listing_id}`} variant="secondary">
                  Compare in Command Center
                </LinkButton>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No offers yet"
          description="No offers match these filters. Share your listing to attract buyers."
          action={<LinkButton href="/dashboard/listings">View listings</LinkButton>}
        />
      )}
    </div>
  );
}

function OfferBadge({ status }: { status: "pending" | "accepted" | "rejected" | "withdrawn" }) {
  return (
    <Badge
      tone={
        status === "accepted"
          ? "success"
          : status === "rejected"
            ? "danger"
            : "warning"
      }
    >
      {offerStatusLabels[status]}
    </Badge>
  );
}
