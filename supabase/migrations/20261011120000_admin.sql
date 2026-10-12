-- Área do administrador (/admin):
-- 1. recusar exige motivo; aprovar limpa o motivo antigo;
-- 2. "marcar como revisado" só tira a marca de alterado (não muda quem aprovou);
-- 3. a equipe pode cadastrar já publicado (registra quem publicou);
-- 4. admin_usuarios(): contas com e-mail e número de negócios, só para o admin.

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
    -- a equipe pode cadastrar já publicado: fica registrado quem publicou
    if equipe and pela_api and new.status = 'publicado' then
      new.aprovado_por := auth.uid();
      new.aprovado_em := now();
    end if;
    return new;
  end if;

  -- ——— editar ———

  if new.slug is distinct from old.slug then
    raise exception 'O endereço de um negócio não muda depois de criado.' using errcode = '42501';
  end if;

  if equipe then
    -- aprovar: publica, tira a marca de alterado e o motivo de recusa antigo, e registra quem
    if new.status = 'publicado' and old.status is distinct from 'publicado' then
      new.alterado_desde_revisao := false;
      new.motivo_recusa := null;
      if pela_api then
        new.aprovado_por := auth.uid();
        new.aprovado_em := now();
      end if;
    end if;
    -- recusar exige um motivo, que o dono vê no painel
    if pela_api and new.status = 'recusado' and old.status is distinct from 'recusado'
      and coalesce(btrim(new.motivo_recusa), '') = ''
    then
      raise exception 'Para recusar, escreva o motivo para o dono.'
        using errcode = 'P0001', hint = 'motivo_obrigatorio';
    end if;
    -- "marcar como revisado" (alterado_desde_revisao → false) só tira a marca
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

-- ——— contas (só admin) ———

create function public.admin_usuarios()
returns table (
  id uuid,
  nome text,
  email text,
  papel text,
  criado_em timestamptz,
  negocios bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.eh_admin() then
    raise exception 'Só a equipe do Azulejo vê as contas.' using errcode = '42501';
  end if;
  return query
    select p.id, p.nome, u.email::text, p.papel, p.criado_em,
      (select count(*) from public.negocios n where n.dono_id = p.id)
    from public.perfis p
    join auth.users u on u.id = p.id
    order by p.criado_em desc;
end;
$$;

revoke execute on function public.admin_usuarios() from public, anon;
grant execute on function public.admin_usuarios() to authenticated;
