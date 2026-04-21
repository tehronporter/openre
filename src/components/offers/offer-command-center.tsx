"use client";

import { useMemo, useState } from "react";
import { ArrowDownUp, Check, MessageCircle, X } from "lucide-react";
import { updateOfferStatus } from "@/app/actions/offers";
import { Badge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
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
      if (Math.abs(priceDiff) > listing.price * 0.01) return priceDiff;
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

  async function action(formData: FormData) {
    const status = String(formData.get("status"));
    if (!window.confirm(`Mark this offer as ${status}?`)) return;
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

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Fact label="Closing" value={`${offer.closing_days} days`} />
          <Fact label="Offer type" value={offer.offer_type === "cash" ? "Cash" : "Financed"} />
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
            <Button size="sm" disabled={offer.status === "accepted"}>
              <Check size={16} /> Accept
            </Button>
          </form>
          <form action={action}>
            <input type="hidden" name="offer_id" value={offer.id} />
            <input type="hidden" name="status" value="rejected" />
            <Button size="sm" variant="danger" disabled={offer.status === "rejected"}>
              <X size={16} /> Reject
            </Button>
          </form>
          <LinkButton
            href={`/dashboard/messages?listing=${listing.id}&buyer=${offer.buyer_id}&offer=${offer.id}`}
            variant="secondary"
            size="sm"
          >
            <MessageCircle size={16} /> Message buyer
          </LinkButton>
        </div>
      </div>
    </Card>
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
