import Image from "next/image";
import { BedDouble, Bath, Ruler } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  propertyConditionLabels,
  propertyTypeLabels,
} from "@/lib/constants";
import type { Listing } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export function ListingCard({ listing }: { listing: Listing }) {
  const image = listing.listing_images?.[0]?.image_url;

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[4/3] bg-muted">
        {image ? (
          <Image src={image} alt="" fill className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No photos yet
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-lg font-semibold">{formatCurrency(listing.price)}</p>
            <h3 className="mt-1 line-clamp-2 font-medium">{listing.title}</h3>
          </div>
          <Badge>{propertyTypeLabels[listing.property_type]}</Badge>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {listing.city}, {listing.state} {listing.zip}
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
          {listing.bedrooms ? (
            <span className="inline-flex items-center gap-1">
              <BedDouble size={15} /> {listing.bedrooms} bd
            </span>
          ) : null}
          {listing.bathrooms ? (
            <span className="inline-flex items-center gap-1">
              <Bath size={15} /> {listing.bathrooms} ba
            </span>
          ) : null}
          {listing.square_feet ? (
            <span className="inline-flex items-center gap-1">
              <Ruler size={15} /> {listing.square_feet.toLocaleString()} sqft
            </span>
          ) : null}
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          {propertyConditionLabels[listing.condition]}
        </p>
        <LinkButton
          href={`/listings/${listing.slug}`}
          variant="secondary"
          className="mt-4 w-full"
        >
          View listing
        </LinkButton>
      </div>
    </Card>
  );
}
