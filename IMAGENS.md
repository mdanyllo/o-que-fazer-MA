# Fotos do Azulejo

O site usa fotos grandes. Enquanto um arquivo não existir, o componente `<Foto>` mostra um fundo areia com o símbolo do azulejo pequeno e apagado, sem texto (o nome do que vai ali fica no atributo `data-foto-falta`, para achar no inspetor). Nenhuma página quebra por falta de foto.

## Como trocar ou acrescentar uma foto

1. Salve o arquivo em `src/assets/images/<pasta>/<nome>` com o nome exato da tabela abaixo.
2. Pode ser `.jpg`, `.jpeg`, `.png`, `.webp` ou `.avif`: a extensão não precisa bater com a da tabela.
3. Reinicie o `npm run dev` (ou rode o build). O Vite encontra o arquivo sozinho (`src/lib/imagens.ts`), não há mais nada para configurar.

Use só fotos suas ou com licença que permita uso comercial, e guarde o crédito do autor. Não use imagens aleatórias da internet.

## Tamanho e enquadramento

| Uso | Tamanho ideal | Observação |
|---|---|---|
| Padrão (destinos, lugares, experiências, eventos, categorias) | **2400 × 1600 px** (3:2), horizontal | A mesma foto aparece em 21:9 no topo das páginas, em 4:3 nos cards e em quadrado nas miniaturas. Deixe o assunto principal **no centro**, com folga nas bordas. |
| `home/hero.jpg` | **1600 × 2000 px** (4:5), vertical | Ocupa a coluna direita do topo da Home, na altura inteira. |
| `eventos/sao-joao.jpg` | 2400 × 1600 px, mas pensando em corte **4:5** | Também aparece em retrato na seção "Junho é mês de boi" da Home. |

- JPG com qualidade 75–80, até ~400 KB cada. Sem texto ou logo sobre a imagem.
- Prefira luz natural e gente de verdade nos lugares. Evite fotos com rostos em close sem autorização.

## Situação atual

- **Provisória**: arquivo existe, mas é uma imagem gerada no Lovable que não retrata o lugar de verdade. Troque por uma foto real.
- **Falta**: o site mostra o fallback neutro (fundo areia com o símbolo).

Algumas fotos servem a mais de uma página: a coluna "Onde aparece" lista todas.

### Home

| Arquivo | O que deve aparecer | Onde aparece | Situação |
|---|---|---|---|
| `home/hero.jpg` | Lençóis Maranhenses: dunas brancas e lagoas azuis, de cima ou de pé na duna | Topo da Home; roteiro "Maranhão essencial em 7 dias" | Provisória |
| `comida/torta-de-camarao.jpg` | Torta de camarão assada, servida em travessa ou fatia no prato | Card "Torta de camarão" em "O que comer primeiro" | Falta |

### Categorias

| Arquivo | O que deve aparecer | Onde aparece | Situação |
|---|---|---|---|
| `categorias/lagoas-praias.jpg` | Lagoa entre dunas ou praia larga do litoral maranhense | Categoria "Lagoas e praias" | Falta |
| `categorias/cultura.jpg` | Fachadas de azulejo e ruas de pedra do Centro Histórico de São Luís | Categoria "Cultura e centro histórico" | Falta |
| `categorias/natureza.jpg` | Cachoeira ou morros em forma de mesa da Chapada das Mesas | Categoria "Natureza e cachoeiras" | Falta |
| `categorias/gastronomia.jpg` | Mesa maranhense: arroz de cuxá, peixe, camarão, juçara | Categoria "Gastronomia"; experiência "Sabores de São Luís" | Provisória |
| `categorias/festas.jpg` | Bumba-meu-boi ou tambor de crioula em apresentação | Categoria "Festas e eventos" | Falta |
| `categorias/hospedagem.jpg` | Chalé de pousada com redário, de preferência à beira do rio | Categoria "Onde ficar"; lugar e hospedagem "Pousada Margem do Preguiças" | Provisória |

### Destinos

| Arquivo | O que deve aparecer | Onde aparece | Situação |
|---|---|---|---|
| `destinos/sao-luis.jpg` | Casarões azulejados da Praia Grande, no Centro Histórico | Destino São Luís; experiência "Caminhada guiada pelo Centro Histórico"; roteiro "3 dias em São Luís" | Provisória |
| `destinos/barreirinhas.jpg` | Rio Preguiças com a cidade na margem, ou a entrada dos Lençóis | Destino Barreirinhas; roteiro "Lençóis em 4 dias" | Provisória |
| `destinos/atins.jpg` | Povoado de ruas de areia entre o rio, o mar e as dunas | Destino Atins | Provisória |
| `destinos/santo-amaro.jpg` | Dunas começando junto às casas de Santo Amaro, com lagoas | Destino Santo Amaro; roteiro "Fim de semana em Santo Amaro"; card "Lençóis Maranhenses" da Home | Provisória |
| `destinos/alcantara.jpg` | Ruas de pedra, sobrados e ruínas de igreja em Alcântara | Destino Alcântara; lugar "Casario de Alcântara"; experiência "Bate-volta para Alcântara" | Provisória |
| `destinos/carolina.jpg` | Morros em forma de mesa da Chapada das Mesas | Destino Carolina; roteiro "Chapada das Mesas em 5 dias" | Provisória |
| `destinos/tutoia.jpg` | Barcos e igarapés do Delta das Américas, saindo de Tutóia | Destino Tutóia | Falta |
| `destinos/raposa.jpg` | Casas de palafita e barcos coloridos da Raposa | Destino Raposa | Falta |

### Lugares

| Arquivo | O que deve aparecer | Onde aparece | Situação |
|---|---|---|---|
| `lugares/lagoa-azul.jpg` | Lagoas de água azul entre dunas, no circuito Lagoa Azul | Lugar Lagoa Azul; experiência "Circuito Lagoa Azul de 4x4"; evento "Temporada das lagoas cheias" | Falta |
| `lugares/lagoa-bonita.jpg` | Duna alta e lagoa no fim de tarde | Lugar Lagoa Bonita; experiência "Pôr do sol na Lagoa Bonita" | Provisória |
| `lugares/lagoa-da-gaivota.jpg` | Lagoa grande e vazia nos Lençóis, lado de Santo Amaro | Lugar Lagoa da Gaivota; experiência "Lagoa da Gaivota de 4x4" | Falta |
| `lugares/betania.jpg` | Rio de água escura encostado nas dunas, em Betânia | Lugar "Betânia e o Rio Alegre" | Falta |
| `lugares/vassouras.jpg` | Pequenas dunas na beira do Rio Preguiças | Lugar Vassouras | Falta |
| `lugares/mandacaru.jpg` | Farol Preguiças e vista da foz do rio | Lugar Mandacaru | Falta |
| `lugares/cabure.jpg` | Faixa de areia entre o rio e o mar | Lugar Caburé | Falta |
| `lugares/peixaria-beira-rio.jpg` | Peixe na brasa e camarão numa mesa na orla do rio | Lugar "Peixaria Beira-Rio" (exemplo) | Falta |
| `lugares/praia-de-atins.jpg` | Praia larga com kites no céu | Lugar "Praia de Atins" | Falta |
| `lugares/canto-do-atins.jpg` | Prato de camarão num restaurante simples na beira dos Lençóis | Lugar "Canto do Atins" | Falta |
| `lugares/pousada-vento-leste.jpg` | Bangalô de pousada no pé da duna | Lugar e hospedagem "Pousada Vento Leste" (exemplo) | Falta |
| `lugares/centro-historico.jpg` | Ruas de pedra e fachadas de azulejo em São Luís | Lugar "Centro Histórico de São Luís" | Falta |
| `lugares/rua-portugal.jpg` | Rua Portugal com as fachadas azulejadas | Lugar "Rua Portugal" | Falta |
| `lugares/teatro-arthur-azevedo.jpg` | Fachada ou plateia do Teatro Arthur Azevedo | Lugar "Teatro Arthur Azevedo" | Falta |
| `lugares/palacio-dos-leoes.jpg` | Palácio dos Leões com a Baía de São Marcos | Lugar "Palácio dos Leões" | Falta |
| `lugares/casa-das-tulhas.jpg` | Bancas da feira com camarão seco, doces e cachaças | Lugar "Casa das Tulhas" | Falta |
| `lugares/parque-da-jucara.jpg` | Tigela de juçara com farinha e camarão, nas barracas do Maracanã | Lugar "Parque da Juçara"; evento "Festa da Juçara" | Falta |
| `lugares/cozinha-do-cuxa.jpg` | Arroz de cuxá e torta de camarão num sobrado | Lugar "Cozinha do Cuxá" (exemplo) | Falta |
| `lugares/lagoa-da-jansen.jpg` | Lagoa com os prédios refletidos na água | Lugar "Lagoa da Jansen" | Falta |
| `lugares/praia-do-calhau.jpg` | Faixa larga de areia na maré baixa, com calçadão | Lugar "Praia do Calhau" | Falta |
| `lugares/pousada-sobrado-azul.jpg` | Quarto ou fachada de casarão restaurado | Lugar "Pousada Sobrado Azul" (exemplo) | Falta |
| `lugares/ruinas-de-sao-matias.jpg` | Paredes da antiga matriz e o pelourinho de Alcântara | Lugar "Ruínas da Igreja de São Matias" | Falta |
| `lugares/vila-da-raposa.jpg` | Palafitas, barcos e rendeiras de bilro | Lugar "Vila da Raposa"; experiência "Rendeiras e barcos da Raposa" | Falta |
| `lugares/delta-das-americas.jpg` | Igarapés do delta e revoada de guarás vermelhos | Lugar "Delta das Américas"; experiência "Delta e revoada dos guarás" | Falta |
| `lugares/cachoeira-da-prata.jpg` | Queda larga do Rio Farinha | Lugar "Cachoeira da Prata" | Falta |
| `lugares/cachoeira-de-santa-barbara.jpg` | Poço azul-esverdeado entre paredões | Lugar "Cachoeira de Santa Bárbara"; experiência "Cachoeiras de Riachão" | Falta |
| `lugares/poco-azul.jpg` | Poço de água transparente, alguém flutuando | Lugar "Poço Azul" | Falta |
| `lugares/pedra-caida.jpg` | Cânion e a cachoeira do Santuário | Lugar "Pedra Caída"; experiência "Trilha do cânion na Pedra Caída" | Falta |
| `lugares/portal-da-chapada.jpg` | Arco de pedra com os morros em mesa ao fundo | Lugar "Portal da Chapada" | Falta |
| `lugares/mesa-da-chapada.jpg` | Carne de sol, paçoca e baião numa mesa caseira | Lugar "Mesa da Chapada" (exemplo) | Falta |
| `lugares/pousada-mesa-alta.jpg` | Pousada simples com piscina | Lugar e hospedagem "Pousada Mesa Alta" (exemplo) | Falta |

Os itens marcados "(exemplo)" são estabelecimentos fictícios: use uma foto genérica do tipo de lugar, sem fachada ou nome de empresa real.

### Hospedagens

Seção "Onde ficar" da Home. Hospedagens fictícias: use fotos genéricas do tipo de lugar, sem fachada ou nome de estabelecimento real.

| Arquivo | O que deve aparecer | Onde aparece | Situação |
|---|---|---|---|
| `hospedagens/chales-rio-e-duna.jpg` | Chalés de madeira com varanda e rede, perto do rio | Hospedagem "Chalés Rio e Duna" (exemplo) | Falta |
| `hospedagens/casa-pe-na-areia.jpg` | Casa de temporada simples com varanda, em rua de areia | Hospedagem "Casa Pé na Areia" (exemplo) | Falta |
| `hospedagens/hotel-mirante-da-baia.jpg` | Quarto de hotel com janela para a baía | Hospedagem "Hotel Mirante da Baía" (exemplo) | Falta |
| `hospedagens/hostel-da-estrela.jpg` | Sala ou quarto coletivo num casarão antigo | Hospedagem "Hostel da Estrela" (exemplo) | Falta |
| `hospedagens/pousada-sobrado-das-pedras.jpg` | Quarto ou pátio de pousada em sobrado colonial | Hospedagem "Pousada Sobrado das Pedras" (exemplo) | Falta |

### Experiências

| Arquivo | O que deve aparecer | Onde aparece | Situação |
|---|---|---|---|
| `experiencias/passeio-rio-preguicas.jpg` | Lancha descendo o Rio Preguiças | Experiência "Descida do Rio Preguiças" | Provisória |
| `experiencias/kitesurf-em-atins.jpg` | Aula de kitesurf com instrutor na praia de Atins | Experiência "Aula de kitesurf em Atins"; evento "Temporada de vento em Atins" | Falta |

### Eventos

| Arquivo | O que deve aparecer | Onde aparece | Situação |
|---|---|---|---|
| `eventos/sao-joao.jpg` | Bumba-meu-boi em apresentação num arraial | Evento "São João e Bumba-meu-boi"; seção "Junho é mês de boi" da Home | Provisória |
| `eventos/carnaval-de-sao-luis.jpg` | Blocos tradicionais e fofões no Centro | Evento "Carnaval de São Luís" | Falta |
| `eventos/festa-do-divino.jpg` | Caixeiras e cortejo da Festa do Divino em Alcântara | Evento "Festa do Divino Espírito Santo" | Falta |
| `eventos/aniversario-de-sao-luis.jpg` | Show ou programação cultural no Centro Histórico | Evento "Aniversário de São Luís" | Falta |

**Total:** 53 arquivos. 12 provisórios, 41 faltando.
