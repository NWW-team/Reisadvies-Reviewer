-- Toegangscontrole voor de Reisadvies-Reviewer.
--
-- Twee tabellen, allebei met row level security aan. Zonder passende policy komt
-- er niets door, ook niet met een geldige publishable key en ook niet bij een
-- rechtstreeks verzoek aan de REST-API buiten de pagina om. De pagina zelf is
-- publiek; deze regels zijn wat de gegevens beschermt.

-- ============================================================== de allowlist

create table if not exists public.toegestane_gebruikers (
  gebruiker_id  uuid primary key references auth.users (id) on delete cascade,
  email         text        not null,
  rol           text        not null default 'reviewer',
  toegevoegd_op timestamptz not null default now(),
  constraint rol_bekend check (rol in ('reviewer', 'redacteur'))
);

comment on table public.toegestane_gebruikers is
  'Wie toegang heeft. Rijen worden met de hand toegevoegd in het dashboard; '
  'de pagina kan hier niets aan veranderen.';

alter table public.toegestane_gebruikers enable row level security;

-- Een ingelogde gebruiker mag precies één rij zien: die van zichzelf. Daarmee kan
-- de pagina vaststellen of iemand toegang heeft, zonder de hele lijst prijs te geven.
drop policy if exists "eigen rij lezen" on public.toegestane_gebruikers;
create policy "eigen rij lezen"
  on public.toegestane_gebruikers
  for select
  to authenticated
  using (gebruiker_id = (select auth.uid()));

-- Bewust géén insert-, update- of delete-policy. Zonder policy is de actie
-- geweigerd, ook voor een ingelogde gebruiker. Zo kan niemand zichzelf toegang
-- geven, en hangt de beperking niet af van een verborgen knop in de frontend.

-- ================================================================== de helper

-- Draait als de aanroeper (geen security definer), dus de policy hierboven geldt
-- ook binnen deze functie: hij ziet alleen de eigen rij.
create or replace function public.is_toegestaan()
returns boolean
language sql
stable
set search_path = ''
as $$
  select exists (
    select 1
    from public.toegestane_gebruikers t
    where t.gebruiker_id = (select auth.uid())
  );
$$;

comment on function public.is_toegestaan() is
  'Staat de ingelogde gebruiker op de allowlist? Uitgelogd levert dit false op.';

-- =================================================================== oordelen

create table if not exists public.oordelen (
  id           bigint      generated always as identity primary key,
  gebruiker_id uuid        not null default auth.uid() references auth.users (id) on delete cascade,
  land         text        not null,
  regel        text        not null,
  fragment     text        not null default '',
  oordeel      text        not null,
  notitie      text,
  tijd         timestamptz not null default now(),
  constraint oordeel_bekend check (oordeel in ('eens', 'oneens', 'onterecht'))
);

comment on table public.oordelen is
  'Het oordeel van een beoordelaar over een bevinding. Dit is het enige gegeven '
  'dat over sessies heen moet stapelen.';
comment on column public.oordelen.gebruiker_id is
  'Wie het oordeel gaf. Dit veld ontbrak in de Artifact-database, waardoor twee '
  'beoordelaars elkaar overschreven.';

alter table public.oordelen enable row level security;

-- Eén oordeel per persoon per bevinding. De hash vermijdt de lengtegrens van een
-- btree-index op lange fragmenten, en daarmee ook de botsing die in
-- datastromen.html als aanname 1 stond.
create unique index if not exists oordelen_uniek
  on public.oordelen (gebruiker_id, land, regel, md5(fragment));

create index if not exists oordelen_op_land on public.oordelen (land);

-- Lezen: iedereen op de allowlist ziet alle oordelen. Dat is precies het punt van
-- het spoor 'vertrouwen opbouwen' — je wilt jouw oordeel naast dat van de
-- redacteur kunnen leggen.
drop policy if exists "toegestane gebruikers lezen alle oordelen" on public.oordelen;
create policy "toegestane gebruikers lezen alle oordelen"
  on public.oordelen
  for select
  to authenticated
  using (public.is_toegestaan());

-- Schrijven: alleen je eigen oordelen, en alleen als je op de allowlist staat.
drop policy if exists "eigen oordeel aanmaken" on public.oordelen;
create policy "eigen oordeel aanmaken"
  on public.oordelen
  for insert
  to authenticated
  with check (public.is_toegestaan() and gebruiker_id = (select auth.uid()));

drop policy if exists "eigen oordeel wijzigen" on public.oordelen;
create policy "eigen oordeel wijzigen"
  on public.oordelen
  for update
  to authenticated
  using      (public.is_toegestaan() and gebruiker_id = (select auth.uid()))
  with check (public.is_toegestaan() and gebruiker_id = (select auth.uid()));

drop policy if exists "eigen oordeel verwijderen" on public.oordelen;
create policy "eigen oordeel verwijderen"
  on public.oordelen
  for delete
  to authenticated
  using (public.is_toegestaan() and gebruiker_id = (select auth.uid()));
