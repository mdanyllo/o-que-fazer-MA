-- Entrar com o Google: o perfil novo pega o nome que o Google manda.
-- O cadastro por e-mail manda "nome"; o Google manda "full_name" e "name".

create or replace function public.criar_perfil()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfis (id, nome)
  values (
    new.id,
    left(
      coalesce(
        nullif(trim(new.raw_user_meta_data ->> 'nome'), ''),
        nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
        nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
        ''
      ),
      80
    )
  );
  return new;
end;
$$;

revoke execute on function public.criar_perfil() from public, anon, authenticated;
