export type ListingStatus = "draft" | "published" | "under_contract" | "archived";
export type PropertyType =
  | "single_family"
  | "condo"
  | "townhouse"
  | "multi_family"
  | "land";
export type PropertyCondition =
  | "move_in_ready"
  | "minor_updates"
  | "needs_work"
  | "investment";
export type OfferType = "cash" | "financed";
export type FinancingType = "cash" | "conventional" | "fha_va" | "other";
export type OfferStatus = "pending" | "accepted" | "rejected" | "withdrawn";

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
};

export type ListingImage = {
  id: string;
  listing_id: string;
  image_url: string;
  storage_path: string | null;
  sort_order: number;
};

export type Listing = {
  id: string;
  seller_id: string;
  slug: string;
  title: string;
  description: string;
  price: number | null;
  street: string | null;
  city: string;
  state: string;
  zip: string;
  city_normalized: string;
  state_normalized: string;
  latitude: number | null;
  longitude: number | null;
  property_type: PropertyType;
  condition: PropertyCondition;
  bedrooms: number | null;
  bathrooms: number | null;
  square_feet: number | null;
  status: ListingStatus;
  created_at: string;
  updated_at: string;
  listing_images?: ListingImage[];
  profiles?: Profile | null;
};

export type Offer = {
  id: string;
  listing_id: string;
  buyer_id: string;
  offer_price: number;
  offer_type: OfferType;
  financing_type: FinancingType;
  closing_days: number;
  note: string | null;
  status: OfferStatus;
  created_at: string;
  updated_at: string;
  profiles?: Profile | null;
  listings?: Listing | null;
};

export type Conversation = {
  id: string;
  listing_id: string;
  seller_id: string;
  buyer_id: string;
  offer_id: string | null;
  created_at: string;
  listings?: Listing | null;
  buyer?: Profile | null;
  seller?: Profile | null;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};
