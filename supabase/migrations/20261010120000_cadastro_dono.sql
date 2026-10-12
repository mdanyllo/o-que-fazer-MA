-- Regras do cadastro feito pelo dono (formulário em /painel):
-- 1. coluna ponto_encontro (passeios);
-- 2. limite de 5 negócios por conta;
-- 3. o dono cria sempre como rascunho e só muda o status para enviar à análise
--    (rascunho → pendente, recusado → pendente);
-- 4. para ir (ou ficar) em análise ou publicado, o negócio precisa estar completo, com 1 foto;
-- 5. o dono pode excluir o próprio negócio em qualquer status;
-- 6. fotos: até 8 por negócio; mexer nas fotos de um publicado marca "alterado desde a revisão".

-- ——— 1. ponto de encontro ———

alter table public.negocios
  add column ponto_encontro text check (char_length(ponto_encontro) <= 160);

comment on column public.negocios.ponto_encontro is 'Passeios: onde o grupo se encontra.';

grant select (ponto_encontro) on public.negocios to anon, authenticated;

-- ——— 4. negócio completo ———

-- O que falta para enviar à análise, em português, ou null se está completo.
-- Security definer para contar as fotos sem depender da RLS.
create function public.o_que_falta(n public.negocios)
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  falta text[] := '{}';
begin
  if coalesce(btrim(n.cidade), '') = '' then falta := array_append(falta, 'cidade'); end if;
  if char_length(coalesce(btrim(n.descricao), '')) not between 50 and 600 then
    falta := array_append(falta, 'descrição (de 50 a 600 caracteres)');
  end if;
  if n.whatsapp is null or n.whatsapp !~ '^55[1-9]{2}9[0-9]{8}$' then
    falta := array_append(falta, 'WhatsApp');
  end if;
  if n.tipo in ('hospedagem', 'restaurante') and coalesce(btrim(n.endereco), '') = '' then
    falta := array_append(falta, 'endereço');
  end if;
  if n.tipo = 'hospedagem' then
    if n.subtipo is null then falta := array_append(falta, 'tipo de hospedagem'); end if;
    if n.preco is null then falta := array_append(falta, 'preço por noite'); end if;
  elsif n.tipo = 'restaurante' then
    if coalesce(btrim(n.subtipo), '') = '' then falta := array_append(falta, 'tipo de culinária'); end if;
    if n.faixa_preco is null then falta := array_append(falta, 'faixa de preço'); end if;
    if coalesce(btrim(n.horario), '') = '' then falta := array_append(falta, 'horário'); end if;
  elsif n.tipo = 'passeio' then
    if n.preco is null then falta := array_append(falta, 'preço por pessoa'); end if;
    if coalesce(btrim(n.duracao), '') = '' then falta := array_append(falta, 'duração'); end if;
    if coalesce(btrim(n.ponto_encontro), '') = '' then falta := array_append(falta, 'ponto de encontro'); end if;
  end if;
  if not exists (select 1 from public.negocio_fotos f where f.negocio_id = n.id) then
    falta := array_append(falta, '1 foto');
  end if;
  return case when cardinality(falta) = 0 then null else array_to_string(falta, ', ') end;
end;
$$;

revoke execute on function public.o_que_falta(public.negocios) from public, anon;
grant execute on function public.o_que_falta(public.negocios) to authenticated;

-- ——— 2, 3 e 4: regras de escrita (substitui a versão de 20261009120000) ———

create or replace function public.negocios_proteger()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  pela_api boolean := current_user in ('anon', 'authenticated');
  equipe boolean := not pela_api or public.eh_admin();
  falta text;
begin
  -- ——— criar ———
  if tg_op = 'INSERT' then
    if not equipe then
      if (select count(*) from public.negocios where dono_id = auth.uid()) >= 5 then
        raise exception 'Você chegou ao limite de 5 negócios por conta.'
          using errcode = 'P0001', hint = 'limite_negocios';
      end if;
      if new.status <> 'rascunho' then
        raise exception 'Um negócio novo começa como rascunho.' using errcode = '42501';
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
      new.slug := null;
    end if;
    if new.slug is null or btrim(new.slug) = '' then
      new.slug := public.gerar_slug_negocio(new.nome, new.cidade);
    end if;
    return new;
  end if;

  -- ——— editar ———

  if new.slug is distinct from old.slug then
    raise exception 'O endereço de um negócio não muda depois de criado.' using errcode = '42501';
  end if;

  if equipe then
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

  -- o único status que o dono escolhe é "pendente" (enviar para análise),
  -- e só a partir de rascunho ou recusado
  if new.status is distinct from old.status
    and not (new.status = 'pendente' and old.status in ('rascunho', 'recusado'))
  then
    raise exception 'Só a equipe do Azulejo muda esse status.' using errcode = '42501';
  end if;

  -- recusado editado volta para análise
  if old.status = 'recusado' then
    new.status := 'pendente';
  end if;

  -- em análise ou no ar, o negócio precisa continuar completo
  if new.status in ('pendente', 'publicado') then
    falta := public.o_que_falta(new);
    if falta is not null then
      raise exception 'Para enviar para análise, falta: %.', falta
        using errcode = 'P0001', hint = 'incompleto';
    end if;
  end if;

  if old.status = 'publicado'
    and (to_jsonb(new) - 'atualizado_em') is distinct from (to_jsonb(old) - 'atualizado_em')
  then
    new.alterado_desde_revisao := true;
    new.alterado_em := now();
  end if;

  return new;
end;
$$;

-- ——— 5. o dono exclui o próprio negócio em qualquer status ———

drop policy "negocios: dono apaga o próprio que não está publicado; admin apaga qualquer um"
  on public.negocios;

create policy "negocios: dono apaga o próprio, admin apaga qualquer um"
  on public.negocios for delete
  to authenticated
  using (dono_id = (select auth.uid()) or (select public.eh_admin()));

-- ——— 6. fotos ———

-- até 8 por negócio (a equipe passa direto)
create function public.negocio_fotos_limite()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user in ('anon', 'authenticated') and not public.eh_admin()
    and (select count(*) from public.negocio_fotos where negocio_id = new.negocio_id) >= 8
  then
    raise exception 'Cada negócio pode ter até 8 fotos.' using errcode = 'P0001', hint = 'limite_fotos';
  end if;
  return new;
end;
$$;

create trigger negocio_fotos_limite
  before insert on public.negocio_fotos
  for each row execute function public.negocio_fotos_limite();

-- Dono mexeu nas fotos de um negócio publicado: marca para a equipe conferir.
-- Security definer porque o dono não pode escrever alterado_* diretamente.
create function public.negocio_fotos_marcar_alterado()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  alvo uuid := coalesce(new.negocio_id, old.negocio_id);
begin
  if auth.uid() is not null and not public.eh_admin() then
    update public.negocios
    set alterado_desde_revisao = true, alterado_em = now()
    where id = alvo and status = 'publicado' and dono_id = auth.uid();
  end if;
  return null;
end;
$$;

revoke execute on function public.negocio_fotos_marcar_alterado() from public, anon, authenticated;

create trigger negocio_fotos_marcar_alterado
  after insert or update or delete on public.negocio_fotos
  for each row execute function public.negocio_fotos_marcar_alterado();
