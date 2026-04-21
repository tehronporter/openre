"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { MAX_IMAGE_BYTES, MAX_LISTING_IMAGES } from "@/lib/constants";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { listingSchema } from "@/lib/validators";
import { normalizeText, slugify } from "@/lib/utils";

export type ListingActionState = {
  error?: string;
  uploadWarning?: string;
};

function publicImageUrl(path: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${url}/storage/v1/object/public/listing-images/${path}`;
}

async function uniqueSlug(supabase: Awaited<ReturnType<typeof createClient>>, base: string) {
  const slug = base || `listing-${Date.now()}`;
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const candidate = attempt === 0 ? slug : `${slug}-${attempt + 1}`;
    const { data } = await supabase
      .from("listings")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (!data) return candidate;
  }
  return `${slug}-${crypto.randomUUID().slice(0, 8)}`;
}

export async function createListing(
  _prevState: ListingActionState,
  formData: FormData,
): Promise<ListingActionState> {
  const user = await requireUser();
  const parsed = listingSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    price: formData.get("price"),
    street: formData.get("street"),
    city: formData.get("city"),
    state: formData.get("state"),
    zip: formData.get("zip"),
    property_type: formData.get("property_type"),
    condition: formData.get("condition"),
    bedrooms: formData.get("bedrooms"),
    bathrooms: formData.get("bathrooms"),
    square_feet: formData.get("square_feet"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Check the listing." };
  }

  const supabase = await createClient();
  const slug = await uniqueSlug(
    supabase,
    slugify(`${parsed.data.title}-${parsed.data.city}-${parsed.data.state}`),
  );

  const { data: listing, error } = await supabase
    .from("listings")
    .insert({
      ...parsed.data,
      seller_id: user.id,
      slug,
      street: parsed.data.street,
      city_normalized: normalizeText(parsed.data.city),
      state_normalized: normalizeText(parsed.data.state),
    })
    .select("id, slug, status")
    .single();

  if (error || !listing) {
    return { error: error?.message || "Could not create listing." };
  }

  const files = formData
    .getAll("images")
    .filter((value): value is File => value instanceof File && value.size > 0)
    .slice(0, MAX_LISTING_IMAGES);

  let failedUploads = 0;

  for (const [index, file] of files.entries()) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > MAX_IMAGE_BYTES) {
      failedUploads += 1;
      continue;
    }

    const path = `${user.id}/${listing.id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "")}`;
    const upload = await supabase.storage
      .from("listing-images")
      .upload(path, file, { contentType: file.type, upsert: false });

    if (upload.error) {
      failedUploads += 1;
      continue;
    }

    await supabase.from("listing_images").insert({
      listing_id: listing.id,
      storage_path: path,
      image_url: publicImageUrl(path),
      sort_order: index,
    });
  }

  revalidatePath("/");
  revalidatePath("/listings");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/listings");

  redirect(`/dashboard/listings/${listing.id}${failedUploads ? "?upload=partial" : ""}`);
}

export async function archiveListing(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") || "");
  const supabase = await createClient();
  await supabase
    .from("listings")
    .update({ status: "archived" })
    .eq("id", id)
    .eq("seller_id", user.id);
  revalidatePath("/dashboard/listings");
}
