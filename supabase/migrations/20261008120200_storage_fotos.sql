-- Bucket das fotos dos negócios: leitura pública, só jpg/png/webp, até 5 MB.
-- Arquivos ficam em "<negocio_id>/<nome>.<ext>" e o dono só escreve na pasta do próprio negócio.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'fotos-negocios',
  'fotos-negocios',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- A pasta (primeiro trecho do caminho) é o id de um negócio que a pessoa pode editar?
create function public.pode_editar_pasta(pasta text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.eh_admin() or exists (
    select 1 from public.negocios n
    where n.id::text = pasta and n.dono_id = (select auth.uid())
  );
$$;

revoke execute on function public.pode_editar_pasta(text) from public;
grant execute on function public.pode_editar_pasta(text) to authenticated;

create policy "fotos-negocios: enviar na pasta do próprio negócio"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'fotos-negocios'
    and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp')
    and public.pode_editar_pasta((storage.foldername(name))[1])
  );

create policy "fotos-negocios: trocar na pasta do próprio negócio"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'fotos-negocios'
    and public.pode_editar_pasta((storage.foldername(name))[1])
  )
  with check (
    bucket_id = 'fotos-negocios'
    and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp')
    and public.pode_editar_pasta((storage.foldername(name))[1])
  );

create policy "fotos-negocios: apagar na pasta do próprio negócio"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'fotos-negocios'
    and public.pode_editar_pasta((storage.foldername(name))[1])
  );

-- Listar os arquivos da pasta (necessário para trocar e apagar). A leitura das imagens em si
-- é pública pela URL, porque o bucket é público.
create policy "fotos-negocios: listar a pasta do próprio negócio"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'fotos-negocios'
    and public.pode_editar_pasta((storage.foldername(name))[1])
  );
