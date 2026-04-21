create extension if not exists "pgcrypto";

create type public.listing_status as enum ('draft', 'published', 'under_contract', 'archived');
create type public.property_type as enum ('single_family', 'condo', 'townhouse', 'multi_family', 'land');
create type public.property_condition as enum ('move_in_ready', 'minor_updates', 'needs_work', 'investment');
create type public.offer_type as enum ('cash', 'financed');
create type public.financing_type as enum ('cash', 'conventional', 'fha_va', 'other');
create type public.offer_status as enum ('pending', 'accepted', 'rejected', 'withdrawn');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  slug text not null unique,
  title text not null,
  description text not null,
  price integer check (price is null or price > 0),
  street text,
  city text not null,
  state text not null,
  zip text not null,
  city_normalized text not null,
  state_normalized text not null,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  property_type public.property_type not null,
  condition public.property_condition not null,
  bedrooms numeric(4, 1),
  bathrooms numeric(4, 1),
  square_feet integer,
  status public.listing_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  image_url text not null,
  storage_path text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.offers (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  offer_price integer not null check (offer_price > 0),
  offer_type public.offer_type not null,
  financing_type public.financing_type not null,
  closing_days integer not null check (closing_days between 1 and 365),
  note text,
  status public.offer_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint offer_financing_matches_type check (
    (offer_type = 'cash' and financing_type = 'cash')
    or (offer_type = 'financed' and financing_type <> 'cash')
  )
);

create unique index one_active_offer_per_buyer_listing
  on public.offers (listing_id, buyer_id)
  where status in ('pending', 'accepted');

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  offer_id uuid references public.offers(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint conversation_seller_buyer_distinct check (seller_id <> buyer_id)
);

create unique index one_conversation_per_buyer_listing
  on public.conversations (listing_id, buyer_id);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index listings_public_search_idx on public.listings (status, city_normalized, state_normalized, property_type, price);
create index listings_seller_idx on public.listings (seller_id, status, updated_at desc);
create index listing_images_listing_idx on public.listing_images (listing_id, sort_order);
create index offers_listing_compare_idx on public.offers (listing_id, status, offer_price desc, closing_days asc, created_at desc);
create index offers_buyer_idx on public.offers (buyer_id, created_at desc);
create index conversations_participants_idx on public.conversations (seller_id, buyer_id, created_at desc);
create index messages_conversation_time_idx on public.messages (conversation_id, created_at);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger set_listings_updated_at
before update on public.listings
for each row execute function public.set_updated_at();

create trigger set_offers_updated_at
before update on public.offers
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email
  )
  on conflict (id) do update
  set email = excluded.email,
      full_name = coalesce(nullif(excluded.full_name, ''), profiles.full_name);

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.listing_images enable row level security;
alter table public.offers enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

create policy "Profiles are visible to authenticated users"
on public.profiles for select
to authenticated
using (true);

create policy "Users update their own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Public can read published listings"
on public.listings for select
to anon, authenticated
using (status = 'published' or seller_id = auth.uid());

create policy "Sellers create their listings"
on public.listings for insert
to authenticated
with check (seller_id = auth.uid());

create policy "Sellers update their listings"
on public.listings for update
to authenticated
using (seller_id = auth.uid())
with check (seller_id = auth.uid());

create policy "Published listing images are public"
on public.listing_images for select
to anon, authenticated
using (
  exists (
    select 1 from public.listings
    where listings.id = listing_images.listing_id
    and (listings.status = 'published' or listings.seller_id = auth.uid())
  )
);

create policy "Sellers insert images for their listings"
on public.listing_images for insert
to authenticated
with check (
  exists (
    select 1 from public.listings
    where listings.id = listing_images.listing_id
    and listings.seller_id = auth.uid()
  )
);

create policy "Sellers delete images for their listings"
on public.listing_images for delete
to authenticated
using (
  exists (
    select 1 from public.listings
    where listings.id = listing_images.listing_id
    and listings.seller_id = auth.uid()
  )
);

create policy "Buyers and sellers read relevant offers"
on public.offers for select
to authenticated
using (
  buyer_id = auth.uid()
  or exists (
    select 1 from public.listings
    where listings.id = offers.listing_id
    and listings.seller_id = auth.uid()
  )
);

create policy "Buyers create offers on published listings"
on public.offers for insert
to authenticated
with check (
  buyer_id = auth.uid()
  and exists (
    select 1 from public.listings
    where listings.id = offers.listing_id
    and listings.status = 'published'
    and listings.seller_id <> auth.uid()
  )
);

create policy "Sellers update offer status on their listings"
on public.offers for update
to authenticated
using (
  exists (
    select 1 from public.listings
    where listings.id = offers.listing_id
    and listings.seller_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.listings
    where listings.id = offers.listing_id
    and listings.seller_id = auth.uid()
  )
);

create policy "Participants read conversations"
on public.conversations for select
to authenticated
using (seller_id = auth.uid() or buyer_id = auth.uid());

create policy "Participants create conversations"
on public.conversations for insert
to authenticated
with check (
  (seller_id = auth.uid() or buyer_id = auth.uid())
  and exists (
    select 1 from public.listings
    where listings.id = conversations.listing_id
    and listings.seller_id = conversations.seller_id
    and listings.status = 'published'
  )
);

create policy "Participants read messages"
on public.messages for select
to authenticated
using (
  exists (
    select 1 from public.conversations
    where conversations.id = messages.conversation_id
    and (conversations.seller_id = auth.uid() or conversations.buyer_id = auth.uid())
  )
);

create policy "Participants send messages"
on public.messages for insert
to authenticated
with check (
  sender_id = auth.uid()
  and exists (
    select 1 from public.conversations
    where conversations.id = messages.conversation_id
    and (conversations.seller_id = auth.uid() or conversations.buyer_id = auth.uid())
  )
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'listing-images',
  'listing-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = true,
    file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

create policy "Anyone can read listing images"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'listing-images');

create policy "Authenticated users upload listing images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'listing-images' and owner = auth.uid());

create policy "Owners update uploaded listing images"
on storage.objects for update
to authenticated
using (bucket_id = 'listing-images' and owner = auth.uid())
with check (bucket_id = 'listing-images' and owner = auth.uid());

create policy "Owners delete uploaded listing images"
on storage.objects for delete
to authenticated
using (bucket_id = 'listing-images' and owner = auth.uid());
