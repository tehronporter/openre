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
  const user = await requireUser();
  const id = String(formData.get("offer_id") || "");
  const status = String(formData.get("status") || "");

  if (!["accepted", "rejected"].includes(status)) return;

  const supabase = await createClient();
  const { data: offer } = await supabase
    .from("offers")
    .select("id, listing_id, listings!inner(id, seller_id)")
    .eq("id", id)
    .eq("listings.seller_id", user.id)
    .single();

  if (!offer) return;

  if (status === "accepted") {
    await supabase
      .from("offers")
      .update({ status: "accepted" })
      .eq("id", id);

    await supabase
      .from("offers")
      .update({ status: "rejected" })
      .eq("listing_id", offer.listing_id)
      .neq("id", id)
      .eq("status", "pending");

    await supabase
      .from("listings")
      .update({ status: "under_contract" })
      .eq("id", offer.listing_id)
      .eq("seller_id", user.id);
  } else {
    await supabase.from("offers").update({ status: "rejected" }).eq("id", id);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/listings");
  revalidatePath(`/dashboard/listings/${offer.listing_id}`);
  revalidatePath("/dashboard/offers");
}
