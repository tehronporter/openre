"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { offerSchema } from "@/lib/validators";

export type OfferActionState = {
  error?: string;
};

export async function submitOffer(
  _prevState: OfferActionState,
  formData: FormData,
): Promise<OfferActionState> {
  const user = await requireUser();
  const parsed = offerSchema.safeParse({
    listing_id: formData.get("listing_id"),
    offer_price: formData.get("offer_price"),
    offer_type: formData.get("offer_type"),
    financing_type: formData.get("financing_type"),
    closing_days: formData.get("closing_days"),
    note: formData.get("note"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Check the offer." };
  }

  const supabase = await createClient();
  const { data: listing } = await supabase
    .from("listings")
    .select("id, seller_id, status")
    .eq("id", parsed.data.listing_id)
    .single();

  if (!listing || listing.status !== "published") {
    return { error: "This listing is not accepting offers." };
  }

  if (listing.seller_id === user.id) {
    return { error: "You cannot submit an offer on your own listing." };
  }

  const { data: existing } = await supabase
    .from("offers")
    .select("id")
    .eq("listing_id", parsed.data.listing_id)
    .eq("buyer_id", user.id)
    .in("status", ["pending", "accepted"])
    .maybeSingle();

  if (existing) {
    return { error: "You already have an active offer on this listing." };
  }

  const { error } = await supabase.from("offers").insert({
    ...parsed.data,
    buyer_id: user.id,
    note: parsed.data.note || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/offers");
  redirect("/dashboard/offers?submitted=1");
}

export async function updateOfferStatus(formData: FormData) {
  await requireUser();
  const id = String(formData.get("offer_id") || "");
  const status = String(formData.get("status") || "");

  if (!["accepted", "rejected"].includes(status)) return;

  const supabase = await createClient();
  await supabase.from("offers").update({ status }).eq("id", id);

  revalidatePath("/dashboard/listings");
}
