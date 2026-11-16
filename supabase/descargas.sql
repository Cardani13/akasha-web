-- Enlaces de descarga de cada obra. Los lee lib/descargas.ts.
-- Lectura pública (sin iniciar sesión); solo se escribe desde el panel de Supabase.
-- Los enlaces en sí no están aquí: se añaden como filas desde el Table Editor.

create table public.descargas (
  id bigint generated always as identity primary key,
  obra_id text not null,                -- id de la obra en data/catalogo.json
  orden smallint not null default 1,    -- orden de los botones si hay varios
  etiqueta text,                        -- "Temporada 1", "OVA"... (vacío si solo hay uno)
  url text not null check (url ~ '^https://'),
  creado_en timestamptz not null default now(),
  unique (obra_id, orden)
);

alter table public.descargas enable row level security;

create policy "Cualquiera puede leer las descargas" on public.descargas
  for select to anon, authenticated using (true);

revoke insert, update, delete, truncate on public.descargas from anon, authenticated;
