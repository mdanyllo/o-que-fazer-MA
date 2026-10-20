-- Compartilhamentos nas estatísticas: o botão "Compartilhar" da página do negócio conta
-- por canal (WhatsApp, Instagram e link copiado), do mesmo jeito que os outros cliques.

alter table public.negocio_estatisticas
  drop constraint negocio_estatisticas_tipo_check,
  add constraint negocio_estatisticas_tipo_check check (
    tipo in (
      'visita', 'whatsapp', 'instagram', 'site', 'aparicao',
      'compartilhar_whatsapp', 'compartilhar_instagram', 'compartilhar_link'
    )
  );

create or replace function public.registrar_evento(negocio uuid, evento text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if evento not in (
    'visita', 'whatsapp', 'instagram', 'site', 'aparicao',
    'compartilhar_whatsapp', 'compartilhar_instagram', 'compartilhar_link'
  ) then
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
