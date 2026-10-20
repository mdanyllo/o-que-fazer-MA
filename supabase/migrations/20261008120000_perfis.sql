-- Perfis de quem entra no site: donos de negócio e a equipe do Azulejo.
-- O turista não tem conta; os favoritos dele continuam só no navegador.

create table public.perfis (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null default '' check (char_length(nome) <= 80),
  -- 'admin' só é dado à mão, no SQL Editor (ver README). Ninguém vira admin pelo site.
  papel text not null default 'dono' check (papel in ('dono', 'admin')),
  criado_em timestamptz not null default now()
);

comment on table public.perfis is 'Uma linha por conta (auth.users). papel: dono ou admin.';

alter table public.perfis enable row level security;

-- Quem está logado é admin? Security definer para poder ser usada dentro das políticas
-- sem cair na própria RLS de perfis.
create function public.eh_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.perfis
    where id = (select auth.uid()) and papel = 'admin'
  );
$$;

revoke execute on function public.eh_admin() from public;
grant execute on function public.eh_admin() to anon, authenticated;

-- Cada pessoa lê o próprio perfil; o admin lê todos.
create policy "perfis: ler o próprio ou admin"
  on public.perfis for select
  to authenticated
  using (id = (select auth.uid()) or (select public.eh_admin()));

-- Cada pessoa edita o próprio nome. A coluna papel não tem permissão de escrita (abaixo).
create policy "perfis: editar o próprio"
  on public.perfis for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Permissões por coluna: pela API só dá para mudar o nome. Nada de insert/delete:
-- o perfil nasce pelo gatilho abaixo e some junto com a conta.
revoke all on public.perfis from anon, authenticated;
grant select (id, nome, papel, criado_em) on public.perfis to authenticated;
grant update (nome) on public.perfis to authenticated;

-- Cria o perfil quando a conta é criada. O nome vem do cadastro (options.data.nome).
-- Qualquer "papel" mandado pelo navegador é ignorado: todo mundo nasce 'dono'.
create function public.criar_perfil()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfis (id, nome)
  values (new.id, left(coalesce(trim(new.raw_user_meta_data ->> 'nome'), ''), 80));
  return new;
end;
$$;

revoke execute on function public.criar_perfil() from public, anon, authenticated;

create trigger ao_criar_conta
  after insert on auth.users
  for each row execute function public.criar_perfil();
