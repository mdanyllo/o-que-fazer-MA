-- Ajustes de regra antes do formulário do dono:
-- 1. Negócio publicado editado pelo dono continua publicado, marcado como "alterado desde a
--    revisão" (com a data). Recusado editado pelo dono volta para 'pendente'. Aprovar ou marcar
--    como revisado tira a marca.
-- 2. O slug é gerado no banco a partir do nome e da cidade, único, e nunca muda depois.

alter table public.negocios
  add column alterado_desde_revisao boolean not null default false,
  add column alterado_em timestamptz;

comment on column public.negocios.alterado_desde_revisao is
  'O dono editou depois da última revisão. Volta para false quando a equipe aprova ou revisa.';
comment on column public.negocios.alterado_em is 'Última edição feita pelo dono.';

create index negocios_alterados_idx on public.negocios (alterado_desde_revisao)
  where alterado_desde_revisao;

-- o dono vê a marca no painel; o visitante não precisa dela
grant select (alterado_desde_revisao, alterado_em) on public.negocios to authenticated;

-- ——— slug ———

-- "Pousada Café & Cia." + "São Luís" → "pousada-cafe-cia-sao-luis"
create function public.slugificar(texto text)
returns text
language sql
immutable
set search_path = ''
as $$
  select coalesce(
    nullif(
      trim(both '-' from regexp_replace(
        translate(
          lower(coalesce(texto, '')),
          'áàâãäåéèêëíìîïóòôõöúùûüçñý',
          'aaaaaaeeeeiiiiooooouuuucny'
        ),
        '[^a-z0-9]+', '-', 'g'
      )),
      ''
    ),
    'negocio'
  );
$$;

-- Slug único para um negócio novo. Security definer para enxergar também os rascunhos de
-- outros donos (que a RLS esconde) e não gerar um repetido.
create function public.gerar_slug_negocio(nome text, cidade text)
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  base text := public.slugificar(concat_ws(' ', nome, cidade));
  candidato text;
  n integer := 1;
begin
  -- até 60 caracteres, sem cortar no meio de um hífen (o sufixo cabe nos 80 do limite)
  base := trim(both '-' from left(base, 60));
  candidato := base;
  while exists (select 1 from public.negocios where slug = candidato) loop
    n := n + 1;
    candidato := base || '-' || n;
  end loop;
  return candidato;
end;
$$;

revoke execute on function public.gerar_slug_negocio(text, text) from public, anon;
grant execute on function public.gerar_slug_negocio(text, text) to authenticated;

-- ——— regras de escrita (substitui a versão da migração 20261008120100) ———

create or replace function public.negocios_proteger()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  -- pela API o papel é anon/authenticated; SQL Editor (postgres) e service_role passam direto
  pela_api boolean := current_user in ('anon', 'authenticated');
  equipe boolean := not pela_api or public.eh_admin();
begin
  -- ——— criar ———
  if tg_op = 'INSERT' then
    if not equipe then
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
      new.alterado_desde_revisao := false;
      new.alterado_em := null;
      -- o dono não escolhe o slug: é sempre gerado
      new.slug := null;
    end if;
    if new.slug is null or btrim(new.slug) = '' then
      new.slug := public.gerar_slug_negocio(new.nome, new.cidade);
    end if;
    return new;
  end if;

  -- ——— editar ———

  -- o slug nunca muda (links, roteiros e favoritos dependem dele), nem pela equipe
  if new.slug is distinct from old.slug then
    raise exception 'O endereço de um negócio não muda depois de criado.' using errcode = '42501';
  end if;

  if equipe then
    -- aprovar, ou marcar como revisado, tira a marca e registra quem revisou
    if (new.status = 'publicado' and old.status is distinct from 'publicado')
      or (old.alterado_desde_revisao and not new.alterado_desde_revisao)
    then
      new.alterado_desde_revisao := false;
      if pela_api then
        new.aprovado_por := auth.uid();
        new.aprovado_em := now();
      end if;
    end if;
    return new;
  end if;

  -- edição feita pelo dono
  if new.dono_id is distinct from old.dono_id
    or new.exemplo is distinct from old.exemplo
    or new.extras is distinct from old.extras
    or new.notas_internas is distinct from old.notas_internas
    or new.motivo_recusa is distinct from old.motivo_recusa
    or new.aprovado_por is distinct from old.aprovado_por
    or new.aprovado_em is distinct from old.aprovado_em
    or new.alterado_desde_revisao is distinct from old.alterado_desde_revisao
    or new.alterado_em is distinct from old.alterado_em
    or new.criado_em is distinct from old.criado_em
  then
    raise exception 'Este campo é reservado à equipe do Azulejo.' using errcode = '42501';
  end if;

  if old.status = 'publicado' then
    -- publicado continua publicado: só a equipe muda o status
    if new.status is distinct from old.status then
      raise exception 'Só a equipe do Azulejo muda o status de um negócio publicado.'
        using errcode = '42501';
    end if;
    -- marca a alteração (se algo mudou de fato) para a equipe revisar depois
    if (to_jsonb(new) - 'atualizado_em') is distinct from (to_jsonb(old) - 'atualizado_em') then
      new.alterado_desde_revisao := true;
      new.alterado_em := now();
    end if;
    return new;
  end if;

  -- rascunho, pendente ou recusado: o dono só alterna entre rascunho e pendente
  if new.status is distinct from old.status and new.status not in ('rascunho', 'pendente') then
    raise exception 'Só a equipe do Azulejo publica ou recusa um negócio.'
      using errcode = '42501';
  end if;

  -- recusado editado pelo dono volta para revisão
  if old.status = 'recusado' and new.status = 'recusado' then
    new.status := 'pendente';
  end if;

  return new;
end;
$$;
