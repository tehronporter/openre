"use client";

import { useActionState, useState } from "react";
import { submitOffer, type OfferActionState } from "@/app/actions/offers";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import { financingTypeLabels } from "@/lib/constants";

export function OfferForm({ listingId }: { listingId: string }) {
  const [state, formAction, pending] = useActionState<OfferActionState, FormData>(
    submitOffer,
    {},
  );
  const [offerType, setOfferType] = useState("cash");

  return (
    <Card className="p-5">
      <h2 className="text-xl font-semibold">Submit an offer</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Your offer goes directly to the seller for comparison. Use clear terms so
        they can make a confident decision.
      </p>
      <form action={formAction} className="mt-5 space-y-4">
        <input type="hidden" name="listing_id" value={listingId} />
        <div>
          <Label htmlFor="offer_price">Offer price</Label>
          <Input id="offer_price" name="offer_price" type="number" min="1" required />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="offer_type">Offer type</Label>
            <Select
              id="offer_type"
              name="offer_type"
              value={offerType}
              onChange={(event) => setOfferType(event.target.value)}
            >
              <option value="cash">Cash</option>
              <option value="financed">Financed</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="financing_type">Financing</Label>
            <Select id="financing_type" name="financing_type" defaultValue={offerType === "cash" ? "cash" : "conventional"}>
              {offerType === "cash" ? (
                <option value="cash">{financingTypeLabels.cash}</option>
              ) : (
                <>
                  <option value="conventional">{financingTypeLabels.conventional}</option>
                  <option value="fha_va">{financingTypeLabels.fha_va}</option>
                  <option value="other">{financingTypeLabels.other}</option>
                </>
              )}
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="closing_days">Closing timeline</Label>
          <Input
            id="closing_days"
            name="closing_days"
            type="number"
            min="1"
            max="365"
            placeholder="30"
            required
          />
          <p className="mt-1 text-xs text-muted-foreground">Enter number of days.</p>
        </div>
        <div>
          <Label htmlFor="note">Note to seller</Label>
          <Textarea id="note" name="note" placeholder="Add context about your offer." />
        </div>
        {state.error ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-danger">
            {state.error}
          </p>
        ) : null}
        <Button className="w-full" disabled={pending}>
          {pending ? "Submitting..." : "Submit offer"}
        </Button>
      </form>
    </Card>
  );
}
