import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import type { Conversation, Listing, Message, Offer } from "@/lib/types";

const listingSelect =
  "*, listing_images(*), profiles(id, full_name, email)";

export async function getRecentListings(limit = 6): Promise<Listing[]> {
  if (!hasSupabaseEnv()) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select(listingSelect)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data || []) as Listing[];
}

export async function getListingBySlug(slug: string): Promise<Listing | null> {
  if (!hasSupabaseEnv()) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select(listingSelect)
    .eq("slug", slug)
    .maybeSingle();
  return (data as Listing | null) || null;
}

export async function getSellerListing(id: string, sellerId: string): Promise<Listing | null> {
  if (!hasSupabaseEnv()) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select("*, listing_images(*)")
    .eq("id", id)
    .eq("seller_id", sellerId)
    .maybeSingle();
  return (data as Listing | null) || null;
}

export async function getFilteredListings(searchParams: {
  location?: string;
  property_type?: string;
  min_price?: string;
  max_price?: string;
}): Promise<Listing[]> {
  if (!hasSupabaseEnv()) return [];
  const supabase = await createClient();
  let query = supabase
    .from("listings")
    .select("*, listing_images(*)")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (searchParams.location) {
    const location = searchParams.location.trim().toLowerCase();
    query = query.or(
      `city_normalized.ilike.%${location}%,state_normalized.ilike.%${location}%,zip.ilike.%${location}%`,
    );
  }
  if (searchParams.property_type) {
    query = query.eq("property_type", searchParams.property_type);
  }
  if (searchParams.min_price) {
    query = query.gte("price", Number(searchParams.min_price));
  }
  if (searchParams.max_price) {
    query = query.lte("price", Number(searchParams.max_price));
  }

  const { data } = await query;
  return (data || []) as Listing[];
}

export async function getSellerListings(sellerId: string): Promise<Listing[]> {
  if (!hasSupabaseEnv()) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select("*, listing_images(*), offers(id, listing_id, status, offer_price, closing_days, financing_type, offer_type, created_at)")
    .eq("seller_id", sellerId)
    .order("updated_at", { ascending: false });
  return (data || []) as Listing[];
}

export async function getOffersForListing(listingId: string): Promise<Offer[]> {
  if (!hasSupabaseEnv()) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("offers")
    .select("*, profiles(id, full_name, email)")
    .eq("listing_id", listingId)
    .order("created_at", { ascending: false });
  return (data || []) as Offer[];
}

export async function getBuyerOffers(buyerId: string): Promise<Offer[]> {
  if (!hasSupabaseEnv()) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("offers")
    .select("*, listings(*)")
    .eq("buyer_id", buyerId)
    .order("created_at", { ascending: false });
  return (data || []) as Offer[];
}

export async function getSellerOffers(
  sellerId: string,
  filters?: {
    listing_id?: string;
    status?: string;
  },
): Promise<Offer[]> {
  if (!hasSupabaseEnv()) return [];
  const supabase = await createClient();
  let query = supabase
    .from("offers")
    .select("*, profiles(id, full_name, email), listings!inner(*)")
    .eq("listings.seller_id", sellerId)
    .order("created_at", { ascending: false });

  if (filters?.listing_id) {
    query = query.eq("listing_id", filters.listing_id);
  }

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  const { data } = await query;
  return (data || []) as Offer[];
}

export async function getConversations(userId: string): Promise<Conversation[]> {
  if (!hasSupabaseEnv()) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("conversations")
    .select("*, listings(*)")
    .or(`seller_id.eq.${userId},buyer_id.eq.${userId}`)
    .order("created_at", { ascending: false });
  return (data || []) as Conversation[];
}

export async function getMessages(conversationIds: string[]): Promise<Message[]> {
  if (!hasSupabaseEnv() || !conversationIds.length) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("messages")
    .select("*")
    .in("conversation_id", conversationIds)
    .order("created_at", { ascending: true });
  return (data || []) as Message[];
}
