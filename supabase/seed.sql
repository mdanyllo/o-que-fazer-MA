-- GERADO por scripts/gerar-seed.ts (npm run seed:gerar). Não edite à mão.
-- Negócios de exemplo do MVP: publicados, sem dono, exemplo = true.
-- Rode no SQL Editor do Supabase (ou deixe o "supabase db reset" rodar). Pode rodar de novo.

begin;

insert into public.negocios (
  slug, tipo, subtipo, nome, nome_curto, cidade, descricao, latitude, longitude,
  preco, faixa_preco, duracao, horario, extras
)
select v.*
from (values
  ('circuito-lagoa-azul', 'passeio', null, 'Circuito Lagoa Azul de 4x4', null, 'Barreirinhas', 'O passeio mais clássico dos Lençóis. A caminhonete sai de Barreirinhas, atravessa o rio de balsa e segue pela areia até a entrada do parque. Dali você caminha entre a Lagoa Azul, a Lagoa Esmeralda e outras lagoas próximas.', -2.583, -42.84, 100, null, 'Cerca de 4 horas', 'Saídas às 8h e às 13h (exemplo)', '{"categoria":"lagoas-praias","resumo":"Travessia do Preguiças de balsa, areia de 4x4 e banho em várias lagoas.","tags":["4x4","Família","Clássico"],"mesesBons":[6,7,8,9],"horas":4,"dicas":["Leve água e protetor.","Lagoas cheias de junho a setembro.","Vá de roupa de banho."],"faixaPreco":2,"dificuldade":"Leve","lugares":["lagoa-azul"],"empresas":["dunas-e-lagoas-turismo","seu-raimundo-guia"],"ordem":0}'::jsonb),
  ('por-do-sol-lagoa-bonita', 'passeio', null, 'Pôr do sol na Lagoa Bonita', null, 'Barreirinhas', 'Saída à tarde de Barreirinhas, com subida de uma duna alta logo no começo. Depois do banho nas lagoas, o grupo espera o sol se pôr lá de cima.', -2.62, -42.93, 120, null, 'Cerca de 4 horas e meia', 'Saída por volta das 13h30 (exemplo)', '{"categoria":"lagoas-praias","resumo":"Subida da duna alta e fim de tarde com vista aberta para os Lençóis.","tags":["Pôr do sol","4x4"],"mesesBons":[6,7,8,9],"horas":4.5,"dicas":["A subida é íngreme, mas curta.","Leve um casaco leve: venta lá em cima."],"faixaPreco":2,"dificuldade":"Moderada","lugares":["lagoa-bonita"],"empresas":["dunas-e-lagoas-turismo","seu-raimundo-guia"],"ordem":1}'::jsonb),
  ('passeio-rio-preguicas', 'passeio', null, 'Descida do Rio Preguiças', null, 'Barreirinhas', 'A lancha desce o Preguiças entre manguezais e buritizais. As paradas incluem as dunas de Vassouras, o Farol de Mandacaru e o almoço em Caburé, entre o rio e o mar. Dá para terminar em Atins.', -2.745, -42.82, 110, null, 'Dia inteiro', 'Saída às 9h (exemplo)', '{"categoria":"natureza","resumo":"De lancha até a foz, com paradas em Vassouras, Mandacaru e Caburé.","tags":["Barco","Dia inteiro","Família"],"mesesBons":[1,2,3,4,5,6,7,8,9,10,11,12],"horas":7,"dicas":["Almoço não incluído.","Avise se quiser ficar em Atins."],"faixaPreco":2,"dificuldade":"Leve","lugares":["vassouras","mandacaru","cabure"],"empresas":["lancha-preguicas"],"ordem":2}'::jsonb),
  ('kitesurf-em-atins', 'passeio', null, 'Aula de kitesurf em Atins', null, 'Atins', 'Aula para iniciantes, com equipamento incluso e comunicação por rádio. O vento costuma ser constante de agosto a dezembro.', -2.566, -42.748, 300, null, '2 horas', 'Manhã ou tarde, conforme o vento (exemplo)', '{"categoria":"lagoas-praias","resumo":"Primeiras aulas com instrutor, no vento constante do segundo semestre.","tags":["Kitesurf","Aventura"],"mesesBons":[8,9,10,11,12],"horas":2,"dicas":["Saber nadar é obrigatório."],"faixaPreco":3,"dificuldade":"Puxada","lugares":["praia-de-atins"],"empresas":["kite-atins-escola"],"ordem":3,"precoTexto":"A partir de R$ 300 a aula (exemplo)"}'::jsonb),
  ('lagoa-da-gaivota-4x4', 'passeio', null, 'Lagoa da Gaivota de 4x4', null, 'Santo Amaro do Maranhão', 'Passeio de 4x4 pelas dunas de Santo Amaro até a Lagoa da Gaivota e lagoas vizinhas, no lado oeste do parque.', -2.483, -43.215, 120, null, 'Cerca de 4 horas', 'Saídas às 8h e às 14h (exemplo)', '{"categoria":"lagoas-praias","resumo":"Lagoas grandes e menos movimentadas, saindo de Santo Amaro.","tags":["4x4","Menos gente"],"mesesBons":[6,7,8,9],"horas":4,"dicas":["Lagoas cheias de junho a setembro."],"faixaPreco":2,"dificuldade":"Leve","lugares":["lagoa-da-gaivota"],"empresas":["santo-amaro-4x4"],"ordem":4}'::jsonb),
  ('caminhada-centro-historico', 'passeio', null, 'Caminhada guiada pelo Centro Histórico', null, 'São Luís', 'Caminhada com guia local saindo da Praça Benedito Leite, passando pela Rua Portugal, Casa das Tulhas, Palácio dos Leões e escadarias do Centro. O guia conta a história dos casarões e dos azulejos.', -2.5297, -44.3028, 80, null, '3 horas', 'Saída às 8h30 (exemplo)', '{"categoria":"cultura","resumo":"Três horas a pé pela Praia Grande, entre azulejos, sobrados e mirantes.","tags":["A pé","História","Azulejos"],"mesesBons":[1,2,3,4,5,6,7,8,9,10,11,12],"horas":3,"dicas":["Leve chapéu e água.","Termine com almoço na Praia Grande."],"faixaPreco":1,"dificuldade":"Leve","lugares":["centro-historico","rua-portugal","casa-das-tulhas","palacio-dos-leoes"],"empresas":["caminhos-da-ilha"],"ordem":5}'::jsonb),
  ('sabores-de-sao-luis', 'passeio', null, 'Sabores de São Luís', null, 'São Luís', 'Roteiro gastronômico com juçara batida na hora, provas na Casa das Tulhas e almoço com arroz de cuxá, peixe-pedra e torta de camarão. Termina com guaraná Jesus, o refrigerante cor-de-rosa do Maranhão.', -2.5287, -44.3062, 160, null, '5 horas', 'Das 9h às 14h (exemplo)', '{"categoria":"gastronomia","resumo":"Juçara no Maracanã, feira da Casa das Tulhas e almoço de cuxá.","tags":["Juçara","Arroz de cuxá"],"mesesBons":[1,2,3,4,5,6,7,8,9,10,11,12],"horas":5,"dicas":["Vá com fome."],"faixaPreco":2,"dificuldade":"Leve","lugares":["parque-da-jucara","casa-das-tulhas","cozinha-do-cuxa"],"empresas":["caminhos-da-ilha"],"ordem":6,"precoTexto":"A partir de R$ 160 por pessoa, com provas (exemplo)"}'::jsonb),
  ('bate-volta-alcantara', 'passeio', null, 'Bate-volta para Alcântara', null, 'Alcântara', 'Saída do Cais da Praia Grande, travessia de cerca de 1h20 pela Baía de São Marcos e caminhada guiada pelas ruínas, igrejas e museus de Alcântara.', -2.4086, -44.4153, 180, null, 'Dia inteiro', 'Saída conforme a maré, geralmente de manhã (exemplo)', '{"categoria":"cultura","resumo":"Travessia da baía de barco e um dia pelas ruas de pedra.","tags":["Barco","Colonial","Dia inteiro"],"mesesBons":[1,2,3,4,5,6,7,8,9,10,11,12],"horas":8,"dicas":["Quem enjoa deve tomar remédio antes: a baía costuma agitar.","Prove o doce de espécie."],"faixaPreco":2,"dificuldade":"Leve","lugares":["ruinas-de-sao-matias","casario-de-alcantara"],"empresas":["travessia-baia"],"ordem":7}'::jsonb),
  ('cachoeiras-de-riachao', 'passeio', null, 'Cachoeiras de Riachão', null, 'Carolina', 'Passeio de dia inteiro pela região de Riachão, com a Cachoeira de Santa Bárbara e o Poço Azul. Parte do caminho é por estrada de terra.', -7.42, -46.92, 180, null, 'Dia inteiro', 'Saída às 7h (exemplo)', '{"categoria":"natureza","resumo":"Santa Bárbara e Poço Azul no mesmo dia, de carro traçado.","tags":["Cachoeira","Estrada de terra"],"mesesBons":[5,6,7,8,9],"horas":9,"dicas":["Leve lanche e roupa de banho extra."],"faixaPreco":2,"dificuldade":"Moderada","lugares":["cachoeira-de-santa-barbara","poco-azul"],"empresas":["chapada-trilhas"],"ordem":8}'::jsonb),
  ('canion-pedra-caida', 'passeio', null, 'Trilha do cânion na Pedra Caída', null, 'Carolina', 'Trilha guiada dentro do complexo da Pedra Caída até a cachoeira do Santuário, que cai entre paredões estreitos.', -7.09, -47.45, 80, null, '3 horas', 'Horários marcados ao longo do dia (exemplo)', '{"categoria":"natureza","resumo":"Trilha curta até a cachoeira do Santuário, dentro do cânion.","tags":["Trilha","Cânion"],"mesesBons":[5,6,7,8,9],"horas":3,"dicas":["Use calçado que possa molhar."],"faixaPreco":2,"dificuldade":"Moderada","lugares":["pedra-caida"],"empresas":["chapada-trilhas"],"ordem":9}'::jsonb),
  ('revoada-dos-guaras', 'passeio', null, 'Delta e revoada dos guarás', null, 'Tutóia', 'Passeio de barco pelas ilhas e igarapés do Delta das Américas, terminando no fim da tarde com a revoada dos guarás, as aves vermelhas que voltam em bando para dormir no mangue.', -2.72, -42.05, 180, null, 'Dia inteiro', 'Saída pela manhã, conforme a maré (exemplo)', '{"categoria":"natureza","resumo":"Barco pelo delta e, no fim da tarde, os guarás voltando para o mangue.","tags":["Barco","Guarás"],"mesesBons":[7,8,9,10,11,12],"horas":8,"dicas":["Leve repelente para o fim da tarde."],"faixaPreco":2,"dificuldade":"Leve","lugares":["delta-das-americas"],"empresas":["delta-barcos"],"ordem":10}'::jsonb),
  ('rendeiras-da-raposa', 'passeio', null, 'Rendeiras e barcos da Raposa', null, 'Raposa', 'Visita às rendeiras de bilro na rua principal da Raposa, seguida de passeio de barco pelos canais e bancos de areia, na maré certa.', -2.425, -44.097, 90, null, '4 horas', 'Conforme a maré (exemplo)', '{"categoria":"cultura","resumo":"Manhã com as rendeiras e passeio de barco na maré cheia.","tags":["Renda de bilro","Barco"],"mesesBons":[1,2,3,4,5,6,7,8,9,10,11,12],"horas":4,"dicas":["Confira a tábua de marés antes de marcar."],"faixaPreco":1,"dificuldade":"Leve","lugares":["vila-da-raposa"],"empresas":["caminhos-da-ilha"],"ordem":11}'::jsonb),
  ('cozinha-do-cuxa', 'restaurante', null, 'Cozinha do Cuxá', null, 'São Luís', 'Restaurante fictício criado para o MVP. Serve a cozinha maranhense do dia a dia: arroz de cuxá feito com vinagreira, gergelim e camarão seco, peixe-pedra frito e torta de camarão.', -2.5294, -44.3045, null, '$$', null, 'Almoço todos os dias (exemplo)', '{"categoria":"gastronomia","resumo":"Arroz de cuxá, peixe-pedra frito e torta de camarão num sobrado da Praia Grande.","tags":["Arroz de cuxá","Peixe-pedra"],"mesesBons":[1,2,3,4,5,6,7,8,9,10,11,12],"horas":1.5,"dicas":["Peça o cuxá como acompanhamento do peixe."],"precoTexto":"Prato a partir de R$ 50 (exemplo)","duracaoTexto":"1 hora e meia"}'::jsonb),
  ('peixaria-beira-rio', 'restaurante', null, 'Peixaria Beira-Rio', null, 'Barreirinhas', 'Restaurante fictício criado para o MVP, na orla de Barreirinhas, com mesas de frente para o rio.', -2.7455, -42.8255, null, '$$', null, 'Almoço e jantar (exemplo)', '{"categoria":"gastronomia","resumo":"Peixe na brasa e camarão na orla do Preguiças.","tags":["Peixe","Beira-rio"],"mesesBons":[1,2,3,4,5,6,7,8,9,10,11,12],"horas":1.5,"dicas":["Bom para o jantar depois do passeio da Lagoa Bonita."],"precoTexto":"Prato a partir de R$ 60 (exemplo)","duracaoTexto":"1 hora e meia"}'::jsonb),
  ('mesa-da-chapada', 'restaurante', null, 'Mesa da Chapada', null, 'Carolina', 'Restaurante fictício criado para o MVP, com comida caseira servida no fogão a lenha.', -7.331, -47.471, null, '$', null, 'Almoço e jantar (exemplo)', '{"categoria":"gastronomia","resumo":"Comida caseira do sertão maranhense: carne de sol, paçoca e baião.","tags":["Comida caseira"],"mesesBons":[1,2,3,4,5,6,7,8,9,10,11,12],"horas":1,"dicas":["Peça a paçoca de carne de sol."],"precoTexto":"Prato a partir de R$ 45 (exemplo)","duracaoTexto":"1 hora"}'::jsonb),
  ('pousada-sobrado-azul', 'hospedagem', 'pousada', 'Pousada Sobrado Azul', null, 'São Luís', 'Pousada fictícia criada para o MVP. Fica num casarão do Centro Histórico, com pé-direito alto e café da manhã com frutas da região.', -2.5302, -44.3048, 280, null, null, 'Check-in a partir das 14h (exemplo)', '{"categoria":"hospedagem","resumo":"Quartos num casarão restaurado, a duas quadras da Rua Portugal.","tags":["Casarão","Centro Histórico"],"mesesBons":[1,2,3,4,5,6,7,8,9,10,11,12],"horas":0,"dicas":["Bom para quem quer fazer tudo a pé no Centro."],"faixaPreco":2,"duracaoTexto":"—","ondeFicar":false}'::jsonb),
  ('pousada-preguicas', 'hospedagem', 'pousada', 'Pousada Margem do Preguiças', 'Margem do Preguiças', 'Barreirinhas', 'Pousada fictícia criada para o MVP. Chalés de madeira, redário e deque para banho de rio.', -2.7495, -42.8205, 320, null, null, 'Check-in a partir das 14h (exemplo)', '{"categoria":"hospedagem","resumo":"Chalés com redário e deque sobre o rio.","tags":["Beira-rio","Redário"],"mesesBons":[1,2,3,4,5,6,7,8,9,10,11,12],"horas":0,"dicas":["As agências buscam os hóspedes na pousada para os passeios."],"faixaPreco":2,"duracaoTexto":"—","ordem":0,"avaliacao":4.7,"avaliacoes":218}'::jsonb),
  ('pousada-vento-leste', 'hospedagem', 'pousada', 'Pousada Vento Leste', null, 'Atins', 'Pousada fictícia criada para o MVP, com bangalôs de palha e café da manhã com tapioca e juçara.', -2.5715, -42.7405, 580, null, null, 'Check-in a partir das 13h (exemplo)', '{"categoria":"hospedagem","resumo":"Bangalôs no pé da duna, a 10 minutos a pé da praia.","tags":["Bangalô","Pé na areia"],"mesesBons":[1,2,3,4,5,6,7,8,9,10,11,12],"horas":0,"dicas":["Leve lanterna: as ruas de areia são escuras à noite."],"faixaPreco":3,"duracaoTexto":"—","ordem":2,"avaliacao":4.9,"avaliacoes":174}'::jsonb),
  ('pousada-mesa-alta', 'hospedagem', 'pousada', 'Pousada Mesa Alta', null, 'Carolina', 'Pousada fictícia criada para o MVP, com café da manhã regional e saída das agências na porta.', -7.334, -47.465, 260, null, null, 'Check-in a partir das 14h (exemplo)', '{"categoria":"hospedagem","resumo":"Quartos simples e piscina, no centro de Carolina.","tags":["Piscina","Centro"],"mesesBons":[1,2,3,4,5,6,7,8,9,10,11,12],"horas":0,"dicas":["Boa base para os passeios de Carolina e Riachão."],"faixaPreco":1,"duracaoTexto":"—","ordem":7,"avaliacao":4.8,"avaliacoes":157}'::jsonb),
  ('chales-rio-e-duna', 'hospedagem', 'chale', 'Chalés Rio e Duna', null, 'Barreirinhas', null, null, null, 450, null, null, null, '{"ordem":1,"avaliacao":4.8,"avaliacoes":96}'::jsonb),
  ('casa-pe-na-areia', 'hospedagem', 'casa_de_temporada', 'Casa Pé na Areia', null, 'Atins', null, null, null, 650, null, null, null, '{"ordem":3,"avaliacao":4.6,"avaliacoes":41}'::jsonb),
  ('hotel-mirante-da-baia', 'hospedagem', 'hotel', 'Hotel Mirante da Baía', null, 'São Luís', null, null, null, 390, null, null, null, '{"ordem":4,"avaliacao":4.4,"avaliacoes":512}'::jsonb),
  ('hostel-da-estrela', 'hospedagem', 'hostel', 'Hostel da Estrela', null, 'São Luís', null, null, null, 120, null, null, null, '{"ordem":5,"avaliacao":4.5,"avaliacoes":389}'::jsonb),
  ('pousada-sobrado-das-pedras', 'hospedagem', 'pousada', 'Sobrado das Pedras', null, 'Alcântara', null, null, null, 220, null, null, null, '{"ordem":6,"avaliacao":4.7,"avaliacoes":88}'::jsonb)
) as v (
  slug, tipo, subtipo, nome, nome_curto, cidade, descricao, latitude, longitude,
  preco, faixa_preco, duracao, horario, extras
)
on conflict (slug) do update set
  tipo = excluded.tipo,
  subtipo = excluded.subtipo,
  nome = excluded.nome,
  nome_curto = excluded.nome_curto,
  cidade = excluded.cidade,
  descricao = excluded.descricao,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  preco = excluded.preco,
  faixa_preco = excluded.faixa_preco,
  duracao = excluded.duracao,
  horario = excluded.horario,
  extras = excluded.extras;

-- os campos abaixo ficam fora do insert para valer também no update
update public.negocios
set status = 'publicado', exemplo = true, dono_id = null, aprovado_em = coalesce(aprovado_em, now())
where slug in ('circuito-lagoa-azul', 'por-do-sol-lagoa-bonita', 'passeio-rio-preguicas', 'kitesurf-em-atins', 'lagoa-da-gaivota-4x4', 'caminhada-centro-historico', 'sabores-de-sao-luis', 'bate-volta-alcantara', 'cachoeiras-de-riachao', 'canion-pedra-caida', 'revoada-dos-guaras', 'rendeiras-da-raposa', 'cozinha-do-cuxa', 'peixaria-beira-rio', 'mesa-da-chapada', 'pousada-sobrado-azul', 'pousada-preguicas', 'pousada-vento-leste', 'pousada-mesa-alta', 'chales-rio-e-duna', 'casa-pe-na-areia', 'hotel-mirante-da-baia', 'hostel-da-estrela', 'pousada-sobrado-das-pedras');

-- fotos: as dos exemplos são trocadas inteiras (caminhos "/images/..." são fotos do próprio site)
delete from public.negocio_fotos f
using public.negocios n
where f.negocio_id = n.id and n.exemplo;

insert into public.negocio_fotos (negocio_id, caminho, ordem)
select n.id, f.caminho, f.ordem
from (values
  ('circuito-lagoa-azul', '/images/lugares/lagoa-azul.jpg', 0),
  ('por-do-sol-lagoa-bonita', '/images/lugares/lagoa-bonita.jpg', 0),
  ('passeio-rio-preguicas', '/images/experiencias/passeio-rio-preguicas.jpg', 0),
  ('kitesurf-em-atins', '/images/experiencias/kitesurf-em-atins.jpg', 0),
  ('lagoa-da-gaivota-4x4', '/images/lugares/lagoa-da-gaivota.jpg', 0),
  ('caminhada-centro-historico', '/images/destinos/sao-luis.jpg', 0),
  ('sabores-de-sao-luis', '/images/categorias/gastronomia.jpg', 0),
  ('bate-volta-alcantara', '/images/destinos/alcantara.jpg', 0),
  ('cachoeiras-de-riachao', '/images/lugares/cachoeira-de-santa-barbara.jpg', 0),
  ('canion-pedra-caida', '/images/lugares/pedra-caida.jpg', 0),
  ('revoada-dos-guaras', '/images/lugares/delta-das-americas.jpg', 0),
  ('rendeiras-da-raposa', '/images/lugares/vila-da-raposa.jpg', 0),
  ('cozinha-do-cuxa', '/images/lugares/cozinha-do-cuxa.jpg', 0),
  ('peixaria-beira-rio', '/images/lugares/peixaria-beira-rio.jpg', 0),
  ('mesa-da-chapada', '/images/lugares/mesa-da-chapada.jpg', 0),
  ('pousada-sobrado-azul', '/images/lugares/pousada-sobrado-azul.jpg', 0),
  ('pousada-preguicas', '/images/categorias/hospedagem.jpg', 0),
  ('pousada-vento-leste', '/images/lugares/pousada-vento-leste.jpg', 0),
  ('pousada-mesa-alta', '/images/lugares/pousada-mesa-alta.jpg', 0),
  ('chales-rio-e-duna', '/images/hospedagens/chales-rio-e-duna.jpg', 0),
  ('casa-pe-na-areia', '/images/hospedagens/casa-pe-na-areia.jpg', 0),
  ('hotel-mirante-da-baia', '/images/hospedagens/hotel-mirante-da-baia.jpg', 0),
  ('hostel-da-estrela', '/images/hospedagens/hostel-da-estrela.jpg', 0),
  ('pousada-sobrado-das-pedras', '/images/hospedagens/pousada-sobrado-das-pedras.jpg', 0)
) as f (slug, caminho, ordem)
join public.negocios n on n.slug = f.slug;

commit;
