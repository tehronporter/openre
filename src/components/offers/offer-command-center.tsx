"use client";

import { useMemo, useState } from "react";
import { ArrowDownUp, Check, X } from "lucide-react";
import { updateOfferStatus } from "@/app/actions/offers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ShareButton } from "@/components/share-button";
import {
  financingTypeLabels,
  offerStatusLabels,
} from "@/lib/constants";
import type { Listing, Offer } from "@/lib/types";
import { formatCurrency, formatDate, getSiteUrl } from "@/lib/utils";

type SortKey = "price" | "closing" | "financing" | "date";

export function OfferCommandCenter({
  listing,
  offers,
}: {
  listing: Listing;
  offers: Offer[];
}) {
  const [sort, setSort] = useState<SortKey>("price");
  const listingUrl = `${getSiteUrl()}/listings/${listing.slug}`;

  const markers = useMemo(() => {
    if (!offers.length) return {};
    const highest = offers.reduce((best, offer) =>
      offer.offer_price > best.offer_price ? offer : best,
    );
    const fastest = offers.reduce((best, offer) =>
      offer.closing_days < best.closing_days ? offer : best,
    );
    const recent = offers.reduce((best, offer) =>
      new Date(offer.created_at) > new Date(best.created_at) ? offer : best,
    );
    const strongest = [...offers].sort((a, b) => {
      const priceDiff = b.offer_price - a.offer_price;
      const comparisonBase = listing.price || b.offer_price || a.offer_price || 1;
      if (Math.abs(priceDiff) > comparisonBase * 0.01) return priceDiff;
      if (a.offer_type !== b.offer_type) return a.offer_type === "cash" ? -1 : 1;
      return a.closing_days - b.closing_days;
    })[0];

    return {
      highest: highest.id,
      fastest: fastest.id,
      recent: recent.id,
      strongest: strongest?.id,
    };
  }, [offers, listing.price]);

  const sortedOffers = useMemo(() => {
    return [...offers].sort((a, b) => {
      if (sort === "price") return b.offer_price - a.offer_price;
      if (sort === "closing") return a.closing_days - b.closing_days;
      if (sort === "financing") return a.financing_type.localeCompare(b.financing_type);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [offers, sort]);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-surface p-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-medium text-primary">Offers on your listing</p>
            <h1 className="mt-1 text-3xl font-semibold">{listing.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Decision engine for comparing price, speed, financing, and buyer context.
            </p>
          </div>
          <ShareButton url={listingUrl} />
        </div>
      </div>

      {!offers.length ? (
        <EmptyState
          title="No offers yet"
          description="Early OpenRE liquidity starts with direct sharing. Copy your listing link and send it to buyers, investors, and people already asking about the property."
          action={<ShareButton url={listingUrl} label="Copy listing link" />}
        />
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-4">
            <Signal label="Highest price" value={formatCurrency(offers.find((o) => o.id === markers.highest)?.offer_price)} />
            <Signal label="Fastest close" value={`${offers.find((o) => o.id === markers.fastest)?.closing_days || "-"} days`} />
            <Signal label="Most recent" value={formatDate(offers.find((o) => o.id === markers.recent)?.created_at)} />
            <Signal label="Pending offers" value={String(offers.filter((o) => o.status === "pending").length)} />
          </div>

          <Card className="overflow-hidden">
            <div className="border-b border-border p-5">
              <h2 className="text-xl font-semibold">Offer comparison</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Side-by-side terms for price, close speed, buyer type, and financing.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-muted text-xs uppercase tracking-[0.08em] text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Buyer</th>
                    <th className="px-5 py-3 font-semibold">Offer price</th>
                    <th className="px-5 py-3 font-semibold">Close time</th>
                    <th className="px-5 py-3 font-semibold">Buyer type</th>
                    <th className="px-5 py-3 font-semibold">Financing type</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sortedOffers.map((offer) => (
                    <tr key={offer.id} className={markers.strongest === offer.id ? "bg-green-50/70" : "bg-white"}>
                      <td className="px-5 py-4 font-medium">
                        {offer.profiles?.full_name || offer.profiles?.email || "Buyer"}
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-semibold">{formatCurrency(offer.offer_price)}</span>
                        {markers.highest === offer.id ? (
                          <Badge tone="accent" className="ml-2">Highest</Badge>
                        ) : null}
                      </td>
                      <td className="px-5 py-4">
                        {offer.closing_days} days
                        {markers.fastest === offer.id ? (
                          <Badge tone="accent" className="ml-2">Fastest</Badge>
                        ) : null}
                      </td>
                      <td className="px-5 py-4">
                        {offer.offer_type === "cash" ? "Cash buyer" : "Financed buyer"}
                      </td>
                      <td className="px-5 py-4">{financingTypeLabels[offer.financing_type]}</td>
                      <td className="px-5 py-4">
                        <OfferStatusBadge status={offer.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <ArrowDownUp size={16} /> Sort
            </span>
            {[
              ["price", "Price"],
              ["closing", "Closing timeline"],
              ["financing", "Financing"],
              ["date", "Date submitted"],
            ].map(([key, label]) => (
              <Button
                key={key}
                type="button"
                size="sm"
                variant={sort === key ? "primary" : "secondary"}
                onClick={() => setSort(key as SortKey)}
              >
                {label}
              </Button>
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            {sortedOffers.map((offer) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                listing={listing}
                markers={markers}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Signal({ label, value }: { label: string; value: string | undefined }) {
  return (
    <Card className="p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value || "-"}</p>
    </Card>
  );
}

function OfferCard({
  offer,
  listing,
  markers,
}: {
  offer: Offer;
  listing: Listing;
  markers: Record<string, string | undefined>;
}) {
  const isStrongest = markers.strongest === offer.id;
  const actionsDisabled = listing.status === "under_contract" || offer.status !== "pending";

  async function action(formData: FormData) {
    const status = String(formData.get("status"));
    const label = status === "accepted" ? "accept" : "decline";
    if (!window.confirm(`Are you sure you want to ${label} this offer?`)) return;
    await updateOfferStatus(formData);
  }

  return (
    <Card className={isStrongest ? "border-primary ring-2 ring-primary/15" : ""}>
      <div className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap gap-2">
              {isStrongest ? <Badge tone="success">Strongest offer</Badge> : null}
              {markers.highest === offer.id ? <Badge tone="accent">Highest price</Badge> : null}
              {markers.fastest === offer.id ? <Badge tone="accent">Fastest close</Badge> : null}
              {markers.recent === offer.id ? <Badge tone="accent">Most recent</Badge> : null}
            </div>
            <p className="mt-3 text-3xl font-semibold">
              {formatCurrency(offer.offer_price)}
            </p>
          </div>
          <OfferStatusBadge status={offer.status} />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Fact label="Closing" value={`${offer.closing_days} days`} />
          <Fact label="Buyer type" value={offer.offer_type === "cash" ? "Cash buyer" : "Financed buyer"} />
          <Fact label="Financing" value={financingTypeLabels[offer.financing_type]} />
        </div>

        <div className="mt-5 rounded-md bg-muted p-4">
          <p className="text-sm font-medium">
            {offer.profiles?.full_name || offer.profiles?.email || "Buyer"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Submitted {formatDate(offer.created_at)} · Updated {formatDate(offer.updated_at)}
          </p>
          {offer.note ? (
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{offer.note}</p>
          ) : null}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <form action={action}>
            <input type="hidden" name="offer_id" value={offer.id} />
            <input type="hidden" name="status" value="accepted" />
            <Button size="sm" disabled={actionsDisabled}>
              <Check size={16} /> Accept
            </Button>
          </form>
          <form action={action}>
            <input type="hidden" name="offer_id" value={offer.id} />
            <input type="hidden" name="status" value="rejected" />
            <Button size="sm" variant="danger" disabled={actionsDisabled}>
              <X size={16} /> Decline
            </Button>
          </form>
        </div>
      </div>
    </Card>
  );
}

function OfferStatusBadge({ status }: { status: Offer["status"] }) {
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

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}
