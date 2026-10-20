-- Plano Pro (por conta), pago pelo Asaas:
-- 1. assinaturas: uma linha por conta, escrita só pelas funções do servidor (service_role);
-- 2. eh_pro(): a conta é Pro enquanto pro_ate estiver no futuro (o vencimento já inclui a
--    tolerância de 3 dias do mensal). Parou de pagar, o Pro acaba sozinho na data;
-- 3. negocios_verificados(): negócios publicados de contas Pro (selo de verificado);
-- 4. estatísticas por negócio e por dia (visitas, cliques, aparições), gravadas por
--    registrar_evento() e lidas por estatisticas_negocio() só pelo dono Pro ou pelo admin;
-- 5. asaas_eventos: avisos do webhook já processados (o Asaas pode mandar o mesmo duas vezes).

-- ——— 1. assinaturas ———

create table public.assinaturas (
  perfil_id uuid primary key references public.perfis (id) on delete cascade,
  plano text check (plano in ('mensal', 'anual')),
  forma text check (forma in ('pix', 'cartao')),
  status text not null default 'sem_plano'
    check (status in ('sem_plano', 'aguardando_pagamento', 'ativa', 'atrasada', 'cancelada', 'encerrada')),
  -- o Pro vale até aqui
  pro_ate timestamptz,
  proximo_vencimento date,
  -- fatura em aberto no Asaas (Pix ou cartão)
  link_pagamento text,
  parcelas integer check (parcelas between 1 and 12),
  valor numeric(10, 2),
  -- dados para a cobrança e a nota fiscal
  nome_fiscal text check (char_length(nome_fiscal) <= 120),
  cpf_cnpj text check (cpf_cnpj ~ '^([0-9]{11}|[0-9]{14})$'),
  asaas_cliente_id text,
  asaas_assinatura_id text,
  asaas_cobranca_id text,
  asaas_parcelamento_id text,
  -- pagamentos (ou parcelamentos) que já estenderam o Pro: o Asaas avisa "confirmado" e
  -- depois "recebido" do mesmo pagamento, e isso não pode estender o plano duas vezes
  ativado_por text[] not null default '{}',
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

comment on table public.assinaturas is
  'Plano de cada conta. Só as funções do servidor (Asaas) escrevem aqui.';

create index assinaturas_cliente_idx on public.assinaturas (asaas_cliente_id);
create index assinaturas_assinatura_idx on public.assinaturas (asaas_assinatura_id);

create trigger assinaturas_atualizado_em
  before update on public.assinaturas
  for each row execute function public.tocar_atualizado_em();

alter table public.assinaturas enable row level security;

create policy "assinaturas: a própria ou admin"
  on public.assinaturas for select
  to authenticated
  using (perfil_id = (select auth.uid()) or (select public.eh_admin()));

-- ninguém escreve pela API: só a service_role (funções do servidor), que passa pela RLS
revoke all on public.assinaturas from anon, authenticated;
grant select on public.assinaturas to authenticated;

-- ——— 2. quem é Pro ———

create function public.eh_pro(perfil uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.assinaturas a
    where a.perfil_id = perfil and a.pro_ate > now()
  );
$$;

revoke execute on function public.eh_pro(uuid) from public;
grant execute on function public.eh_pro(uuid) to anon, authenticated;

-- ——— 3. selo de verificado ———

-- Ids dos negócios publicados cujo dono é Pro (o site marca o selo com eles).
create function public.negocios_verificados()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select n.id
  from public.negocios n
  join public.assinaturas a on a.perfil_id = n.dono_id
  where n.status = 'publicado' and a.pro_ate > now();
$$;

revoke execute on function public.negocios_verificados() from public;
grant execute on function public.negocios_verificados() to anon, authenticated;

-- ——— 4. estatísticas ———

create table public.negocio_estatisticas (
  negocio_id uuid not null references public.negocios (id) on delete cascade,
  dia date not null,
  tipo text not null check (tipo in ('visita', 'whatsapp', 'instagram', 'site', 'aparicao')),
  total integer not null default 0,
  primary key (negocio_id, dia, tipo)
);

comment on table public.negocio_estatisticas is
  'Contagem diária (horário de Brasília) de visitas, cliques e aparições de cada negócio.';

alter table public.negocio_estatisticas enable row level security;
-- sem políticas nem permissões: só as funções abaixo leem e escrevem
revoke all on public.negocio_estatisticas from anon, authenticated;

-- Conta um evento de um negócio publicado. Qualquer visitante pode chamar.
create function public.registrar_evento(negocio uuid, evento text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if evento not in ('visita', 'whatsapp', 'instagram', 'site', 'aparicao') then
    return;
  end if;
  if not exists (
    select 1 from public.negocios n where n.id = negocio and n.status = 'publicado'
  ) then
    return;
  end if;
  insert into public.negocio_estatisticas (negocio_id, dia, tipo, total)
  values (negocio, (now() at time zone 'America/Sao_Paulo')::date, evento, 1)
  on conflict (negocio_id, dia, tipo)
  do update set total = public.negocio_estatisticas.total + 1;
end;
$$;

revoke execute on function public.registrar_evento(uuid, text) from public;
grant execute on function public.registrar_evento(uuid, text) to anon, authenticated;

-- Estatísticas de um negócio desde uma data: só o dono com Pro ativo, ou o admin.
create function public.estatisticas_negocio(negocio uuid, desde date)
returns table (dia date, tipo text, total integer)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.eh_admin() and not exists (
    select 1 from public.negocios n
    where n.id = negocio and n.dono_id = (select auth.uid()) and public.eh_pro(n.dono_id)
  ) then
    raise exception 'As estatísticas fazem parte do plano Pro.'
      using errcode = '42501', hint = 'pro_necessario';
  end if;
  return query
    select e.dia, e.tipo, e.total
    from public.negocio_estatisticas e
    where e.negocio_id = negocio and e.dia >= desde
    order by e.dia;
end;
$$;

revoke execute on function public.estatisticas_negocio(uuid, date) from public, anon;
grant execute on function public.estatisticas_negocio(uuid, date) to authenticated;

-- ——— 5. avisos do Asaas já processados ———

create table public.asaas_eventos (
  id text primary key,
  evento text not null,
  recebido_em timestamptz not null default now(),
  dados jsonb not null
);

alter table public.asaas_eventos enable row level security;
revoke all on public.asaas_eventos from anon, authenticated;
