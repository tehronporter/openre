alter type public.listing_status add value if not exists 'under_contract';

alter table public.listings
  alter column price drop not null;

alter table public.listings
  drop constraint if exists listings_price_check;

alter table public.listings
  add constraint listings_price_check check (price is null or price > 0);
