-- Negócios (restaurantes, hospedagens e passeios) e as fotos deles.
--
-- Quem pode o quê (RLS + gatilho negocios_proteger):
--   visitante  lê só os publicados (sem notas_internas, que nem tem permissão de leitura);
--   dono       lê e edita só os próprios; salva como 'rascunho' ou envia para 'pendente';
--   admin      lê e edita tudo. Notas internas: função notas_internas(id).
-- O SQL Editor e a service_role passam por cima de tudo isso (seed, manutenção).

create table public.negocios (
  id uuid primary key default gen_random_uuid(),
  -- nulo quando a equipe cadastra sem dono (ex.: os dados de exemplo)
  dono_id uuid references public.perfis (id) on delete set null,
  tipo text not null check (tipo in ('restaurante', 'hospedagem', 'passeio')),
  -- hospedagem: lista fechada; restaurante e passeio: texto livre
  subtipo text check (char_length(subtipo) <= 40),
  nome text not null check (char_length(trim(nome)) between 1 and 60),
  -- usado nos cards
  nome_curto text check (char_length(nome_curto) <= 22),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 80),
  cidade text check (char_length(cidade) <= 60),
  descricao text check (char_length(descricao) <= 2000),
  endereco text check (char_length(endereco) <= 160),
  latitude double precision check (latitude between -90 and 90),
  longitude double precision check (longitude between -180 and 180),
  whatsapp text check (char_length(whatsapp) <= 30),
  instagram text check (char_length(instagram) <= 60),
  site text check (char_length(site) <= 200),
  -- hospedagem: por noite; passeio: por pessoa; restaurante usa faixa_preco
  preco numeric(10, 2) check (preco >= 0),
  faixa_preco text check (faixa_preco in ('$', '$$', '$$$')),
  duracao text check (char_length(duracao) <= 60),
  horario text check (char_length(horario) <= 160),
  status text not null default 'rascunho'
    check (status in ('rascunho', 'pendente', 'publicado', 'recusado')),
  motivo_recusa text check (char_length(motivo_recusa) <= 1000),
  -- só o admin lê (ver permissões por coluna abaixo)
  notas_internas text,
  -- dado de exemplo do MVP: o rodapé avisa quando aparece na tela
  exemplo boolean not null default false,
  -- campos editoriais definidos pela equipe (categoria do mapa, tags, meses bons, dicas,
  -- nota de exemplo...). O dono não edita. Formato em src/lib/negocios.ts (ExtrasNegocio).
  extras jsonb not null default '{}'::jsonb check (jsonb_typeof(extras) = 'object'),
  aprovado_por uuid references public.perfis (id) on delete set null,
  aprovado_em timestamptz,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),

  constraint subtipo_da_hospedagem check (
    tipo <> 'hospedagem'
    or subtipo is null
    or subtipo in ('pousada', 'hotel', 'chale', 'hostel', 'casa_de_temporada')
  ),
  constraint faixa_so_restaurante check (faixa_preco is null or tipo = 'restaurante'),
  constraint duracao_so_passeio check (duracao is null or tipo = 'passeio')
);

comment on column public.negocios.notas_internas is 'Só o admin lê, pela função notas_internas(id).';
comment on column public.negocios.extras is 'Campos editoriais da equipe. O dono não edita.';

create index negocios_status_idx on public.negocios (status);
create index negocios_dono_idx on public.negocios (dono_id);

create table public.negocio_fotos (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references public.negocios (id) on delete cascade,
  -- caminho no bucket fotos-negocios ("<negocio_id>/arquivo.jpg").
  -- Os dados de exemplo usam fotos do próprio site ("/images/...").
  caminho text not null check (char_length(caminho) <= 300),
  -- a de menor ordem é a capa
  ordem integer not null default 0,
  legenda text check (char_length(legenda) <= 140),
  criado_em timestamptz not null default now()
);

create index negocio_fotos_negocio_idx on public.negocio_fotos (negocio_id, ordem);

-- ——— atualizado_em ———

create function public.tocar_atualizado_em()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.atualizado_em := now();
  return new;
end;
$$;

create trigger negocios_atualizado_em
  before update on public.negocios
  for each row execute function public.tocar_atualizado_em();

-- ——— o que o dono não pode mexer ———
-- Roda como quem chamou (security invoker): pela API é 'authenticated'; no SQL Editor é
-- 'postgres' e na service_role é 'service_role', que passam direto.

create function public.negocios_proteger()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user not in ('anon', 'authenticated') or public.eh_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.status not in ('rascunho', 'pendente') then
      raise exception 'Só a equipe do Azulejo publica ou recusa um negócio.'
        using errcode = '42501';
    end if;
    new.dono_id := auth.uid();
    new.exemplo := false;
    new.extras := '{}'::jsonb;
    new.notas_internas := null;
    new.motivo_recusa := null;
    new.aprovado_por := null;
    new.aprovado_em := null;
    return new;
  end if;

  -- UPDATE feito pelo dono
  if new.dono_id is distinct from old.dono_id
    or new.exemplo is distinct from old.exemplo
    or new.extras is distinct from old.extras
    or new.notas_internas is distinct from old.notas_internas
    or new.motivo_recusa is distinct from old.motivo_recusa
    or new.aprovado_por is distinct from old.aprovado_por
    or new.aprovado_em is distinct from old.aprovado_em
    or new.criado_em is distinct from old.criado_em
  then
    raise exception 'Este campo é reservado à equipe do Azulejo.' using errcode = '42501';
  end if;

  if new.status is distinct from old.status and new.status not in ('rascunho', 'pendente') then
    raise exception 'Só a equipe do Azulejo publica ou recusa um negócio.'
      using errcode = '42501';
  end if;

  -- Editar um negócio publicado ou recusado manda de volta para revisão.
  if new.status = old.status and old.status in ('publicado', 'recusado') then
    new.status := 'pendente';
  end if;

  return new;
end;
$$;

create trigger negocios_proteger
  before insert or update on public.negocios
  for each row execute function public.negocios_proteger();

-- ——— RLS: negocios ———

alter table public.negocios enable row level security;

create policy "negocios: publicados, os próprios ou admin"
  on public.negocios for select
  to anon, authenticated
  using (
    status = 'publicado'
    or dono_id = (select auth.uid())
    or (select public.eh_admin())
  );

create policy "negocios: dono cria o próprio, admin cria qualquer um"
  on public.negocios for insert
  to authenticated
  with check (dono_id = (select auth.uid()) or (select public.eh_admin()));

create policy "negocios: dono edita o próprio, admin edita qualquer um"
  on public.negocios for update
  to authenticated
  using (dono_id = (select auth.uid()) or (select public.eh_admin()))
  with check (dono_id = (select auth.uid()) or (select public.eh_admin()));

create policy "negocios: dono apaga o próprio que não está publicado; admin apaga qualquer um"
  on public.negocios for delete
  to authenticated
  using (
    (select public.eh_admin())
    or (dono_id = (select auth.uid()) and status <> 'publicado')
  );

-- Permissões por coluna: ninguém lê notas_internas pela API (nem com select *).
-- Por isso as consultas listam as colunas (ver COLUNAS_NEGOCIO em src/lib/negocios.ts).
revoke all on public.negocios from anon, authenticated;
grant select (
  id, dono_id, tipo, subtipo, nome, nome_curto, slug, cidade, descricao, endereco,
  latitude, longitude, whatsapp, instagram, site, preco, faixa_preco, duracao, horario,
  status, motivo_recusa, exemplo, extras, aprovado_por, aprovado_em, criado_em, atualizado_em
) on public.negocios to anon, authenticated;
grant insert, update, delete on public.negocios to authenticated;

-- Notas internas: só o admin lê.
create function public.notas_internas(negocio uuid)
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.eh_admin() then
    raise exception 'Só a equipe do Azulejo lê as notas internas.' using errcode = '42501';
  end if;
  return (select n.notas_internas from public.negocios n where n.id = negocio);
end;
$$;

revoke execute on function public.notas_internas(uuid) from public, anon;
grant execute on function public.notas_internas(uuid) to authenticated;

-- ——— RLS: negocio_fotos ———

-- Pode mexer no negócio? (dono dele ou admin). Security definer para não depender da RLS.
create function public.pode_editar_negocio(negocio uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.eh_admin() or exists (
    select 1 from public.negocios n
    where n.id = negocio and n.dono_id = (select auth.uid())
  );
$$;

revoke execute on function public.pode_editar_negocio(uuid) from public;
grant execute on function public.pode_editar_negocio(uuid) to anon, authenticated;

alter table public.negocio_fotos enable row level security;

-- Vê a foto quem vê o negócio (a subconsulta passa pela RLS de negocios).
create policy "fotos: de negócios visíveis"
  on public.negocio_fotos for select
  to anon, authenticated
  using (exists (select 1 from public.negocios n where n.id = negocio_id));

-- O dono só aponta para arquivos da pasta do próprio negócio.
create policy "fotos: dono ou admin cria"
  on public.negocio_fotos for insert
  to authenticated
  with check (
    (select public.pode_editar_negocio(negocio_id))
    and ((select public.eh_admin()) or caminho like negocio_id::text || '/%')
  );

create policy "fotos: dono ou admin edita"
  on public.negocio_fotos for update
  to authenticated
  using ((select public.pode_editar_negocio(negocio_id)))
  with check (
    (select public.pode_editar_negocio(negocio_id))
    and ((select public.eh_admin()) or caminho like negocio_id::text || '/%')
  );

create policy "fotos: dono ou admin apaga"
  on public.negocio_fotos for delete
  to authenticated
  using ((select public.pode_editar_negocio(negocio_id)));

revoke all on public.negocio_fotos from anon, authenticated;
grant select on public.negocio_fotos to anon, authenticated;
grant insert, update, delete on public.negocio_fotos to authenticated;
