-- Convite para o dono assumir um negócio cadastrado pela equipe (sem dono):
-- a equipe gera um link de uso único (/convite/<token>), manda pelo WhatsApp, e quem abrir
-- logado vira o dono. Vale 7 dias; gerar outro invalida o anterior.

create table public.negocio_convites (
  -- dois uuid v4 sem hífens (244 bits aleatórios): não dá para adivinhar
  token text primary key,
  negocio_id uuid not null references public.negocios (id) on delete cascade,
  criado_por uuid references public.perfis (id) on delete set null,
  criado_em timestamptz not null default now(),
  expira_em timestamptz not null default now() + interval '7 days',
  usado_por uuid references public.perfis (id) on delete set null,
  usado_em timestamptz
);

comment on table public.negocio_convites is
  'Links para o dono assumir um negócio cadastrado pela equipe. Só as funções abaixo leem e escrevem.';

create index negocio_convites_negocio_idx on public.negocio_convites (negocio_id);

alter table public.negocio_convites enable row level security;
revoke all on public.negocio_convites from anon, authenticated;

-- ——— equipe: gerar e consultar ———

-- Novo convite para um negócio sem dono. Devolve { token, expira_em }.
create function public.gerar_convite(negocio uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  novo public.negocio_convites;
begin
  if not public.eh_admin() then
    raise exception 'Só a equipe gera convites.' using errcode = '42501';
  end if;
  if not exists (select 1 from public.negocios n where n.id = negocio) then
    raise exception 'Negócio não encontrado.' using errcode = 'P0002';
  end if;
  if exists (select 1 from public.negocios n where n.id = negocio and n.dono_id is not null) then
    raise exception 'Este negócio já tem dono.' using errcode = 'P0001', hint = 'ja_tem_dono';
  end if;
  -- um convite valendo por negócio: o anterior, não usado, deixa de valer
  delete from public.negocio_convites c where c.negocio_id = negocio and c.usado_em is null;
  insert into public.negocio_convites (token, negocio_id, criado_por)
  values (replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''), negocio, auth.uid())
  returning * into novo;
  return jsonb_build_object('token', novo.token, 'expira_em', novo.expira_em);
end;
$$;

revoke execute on function public.gerar_convite(uuid) from public, anon;
grant execute on function public.gerar_convite(uuid) to authenticated;

-- O convite que está valendo para o negócio (ou null), para o admin ver o link de novo.
create function public.convite_do_negocio(negocio uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  c public.negocio_convites;
begin
  if not public.eh_admin() then
    raise exception 'Só a equipe vê os convites.' using errcode = '42501';
  end if;
  select * into c
  from public.negocio_convites x
  where x.negocio_id = negocio and x.usado_em is null and x.expira_em > now()
  order by x.criado_em desc
  limit 1;
  if c.token is null then
    return null;
  end if;
  return jsonb_build_object('token', c.token, 'expira_em', c.expira_em);
end;
$$;

revoke execute on function public.convite_do_negocio(uuid) from public, anon;
grant execute on function public.convite_do_negocio(uuid) to authenticated;

-- ——— dono: ver e aceitar ———

-- Situação do convite, para a página /convite (qualquer pessoa, logada ou não):
-- { situacao: valido | usado | expirado | invalido, nome, cidade, tipo }
create function public.ver_convite(token text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  c public.negocio_convites;
  n public.negocios;
begin
  select * into c from public.negocio_convites x where x.token = ver_convite.token;
  if c.token is null then
    return jsonb_build_object('situacao', 'invalido');
  end if;
  select * into n from public.negocios x where x.id = c.negocio_id;
  if c.usado_em is not null or n.dono_id is not null then
    return jsonb_build_object('situacao', 'usado');
  end if;
  if c.expira_em <= now() then
    return jsonb_build_object('situacao', 'expirado');
  end if;
  return jsonb_build_object(
    'situacao', 'valido',
    'nome', n.nome,
    'cidade', n.cidade,
    'tipo', n.tipo,
    'expira_em', c.expira_em
  );
end;
$$;

revoke execute on function public.ver_convite(text) from public;
grant execute on function public.ver_convite(text) to anon, authenticated;

-- Quem está logado assume o negócio do convite. Devolve { negocio_id, nome }.
create function public.aceitar_convite(token text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  c public.negocio_convites;
  n public.negocios;
begin
  if auth.uid() is null then
    raise exception 'Entre na sua conta para aceitar o convite.' using errcode = '42501';
  end if;
  -- trava o convite: dois cliques ao mesmo tempo não viram dois donos
  select * into c from public.negocio_convites x where x.token = aceitar_convite.token for update;
  if c.token is null then
    raise exception 'Este convite não existe.' using errcode = 'P0001', hint = 'convite_invalido';
  end if;
  if c.usado_em is not null then
    raise exception 'Este convite já foi usado.' using errcode = 'P0001', hint = 'convite_usado';
  end if;
  if c.expira_em <= now() then
    raise exception 'Este convite expirou. Peça um novo à equipe do Azulejo.'
      using errcode = 'P0001', hint = 'convite_expirado';
  end if;
  -- a função roda como o dono do banco, que a regra de negocios_proteger trata como equipe
  update public.negocios x
  set dono_id = auth.uid()
  where x.id = c.negocio_id and x.dono_id is null
  returning * into n;
  if n.id is null then
    raise exception 'Este negócio já tem dono.' using errcode = 'P0001', hint = 'convite_usado';
  end if;
  update public.negocio_convites x
  set usado_por = auth.uid(), usado_em = now()
  where x.token = c.token;
  return jsonb_build_object('negocio_id', n.id, 'nome', n.nome);
end;
$$;

revoke execute on function public.aceitar_convite(text) from public, anon;
grant execute on function public.aceitar_convite(text) to authenticated;
