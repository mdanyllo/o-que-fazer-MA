-- Horário de funcionamento: opcional para todos os tipos (antes era obrigatório no restaurante).
-- Mesma função de 20261010120000_cadastro_dono.sql, sem a exigência do horário.

create or replace function public.o_que_falta(n public.negocios)
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
