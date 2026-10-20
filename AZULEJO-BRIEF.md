# Azulejo — reformulação do projeto

Este arquivo é o briefing completo para reformular este projeto. Leia tudo antes de mexer em qualquer código.

## 0. Como você deve trabalhar

1. **Entenda o projeto antes de mudar.** Explore o repositório: stack, framework, roteamento, estrutura de pastas, componentes existentes, dados e dependências. Não troque de framework. Reaproveite o que funciona e reorganize o que for preciso.
2. **Mostre um plano antes de executar.** Liste as etapas, as páginas que vai criar ou refazer, as bibliotecas que pretende instalar e o que vai remover. Espere minha aprovação.
3. **Trabalhe por etapas**, nesta ordem: (a) tokens, fontes e componentes base; (b) layout geral, navegação e rodapé; (c) Home; (d) demais páginas; (e) animações; (f) revisão de responsividade, acessibilidade e performance. Se o projeto usa git, faça um commit por etapa.
4. **Verifique o que fez.** Rode o projeto, confira o build e o lint, abra cada página e corrija erros de console antes de seguir.
5. No final, me entregue um resumo: o que mudou, como rodar, o que é mockado e o que falta.

## 1. O produto

O Azulejo é uma plataforma para descobrir, explorar e planejar viagens pelo Maranhão. A promessa é: **"O que fazer no Maranhão, sem precisar procurar em dezenas de lugares diferentes."**

Ela reúne destinos, cidades, pontos turísticos, experiências, praias, cachoeiras, parques, gastronomia, hospedagem, passeios, roteiros, mapas, eventos e empresas locais.

O produto precisa responder a duas situações:

- **"Cheguei ao Maranhão. O que eu posso fazer aqui?"** (descoberta perto de mim, agora)
- **"Vou viajar para o Maranhão. Monte minha viagem."** (planejamento)

Não pode parecer um diretório de empresas, nem uma landing page de SaaS. Deve parecer um produto turístico real e premium: muito visual, com fotos grandes, mapas, cards, rotas e recomendações. As empresas locais aparecem dentro do contexto (no lugar, no roteiro), nunca como uma lista de anúncios.

**Fora do escopo do MVP:** pagamentos reais e conta para o turista. Login, cadastro e painel existem só para negócios e para a equipe (seção 10).

**Tudo navegável:** use dados mockados realistas. Nenhum botão importante fica sem ação. O que não tem backend funciona de forma simulada (salvar favoritos, montar roteiro, filtrar, reservar mostra uma confirmação etc.), guardando estado no navegador quando fizer sentido.

## 2. Identidade visual

O nome Azulejo vem dos azulejos portugueses que cobrem os casarões do Centro Histórico de São Luís. A marca usa muito fundo claro e azul cobalto, e as outras cores do Maranhão aparecem em pequenas doses, como os detalhes de uma fachada: o vermelho do guará, o ouro do Bumba-meu-boi, o verde do babaçu, o roxo da juçara e as lagoas dos Lençóis.

### 2.1 Logo

Os arquivos estão na pasta `azulejo-brand/` (mova para a pasta pública do projeto, por exemplo `public/brand/`):

- `azulejo-logo.svg`: símbolo + nome, versão principal, sobre fundos claros
- `azulejo-logo-negativo.svg`: para fundos azuis escuros (cobalto, cobalto-forte)
- `azulejo-logo-branco.svg`: versão toda em branco, só os traços do azulejo. Use no rodapé roxo (juçara) e sobre fotos escuras
- `azulejo-simbolo.svg`, `azulejo-simbolo-negativo.svg` e `azulejo-simbolo-branco.svg`: só o símbolo (favicon, ícone de app, avatar, loading)
- `azulejo-padrao.svg`: padrão de azulejos repetidos

O símbolo é um azulejo: quatro pétalas em cobalto, quartos de círculo nos cantos e um ponto vermelho no centro (o guará). Quando os azulejos se repetem, os quartos de círculo formam círculos inteiros. Não redesenhe, não recolora e não distorça o logo. Espaço livre mínimo ao redor: metade da largura do símbolo. Use o símbolo também como favicon.

### 2.2 Cores (tokens)

Crie estes tokens como variáveis CSS (e no tema do Tailwind, se o projeto usar Tailwind). Use sempre os tokens, nunca hex soltos nos componentes.

```css
:root {
  /* superfícies */
  --louca: #FBF8F2;          /* fundo principal (branco quente da louça) */
  --areia: #F4EDE1;          /* seções e cartões */
  --linha: #E2D7C4;          /* bordas e divisórias */
  /* texto */
  --ink: #1A1A22;            /* texto principal */
  --ink-suave: #5E5560;      /* texto de apoio, legendas */
  /* marca */
  --cobalto: #1F4E8C;        /* cor da marca, ação principal, links */
  --cobalto-forte: #163A6A;  /* hover/pressionado */
  --sobre-cobalto: #FFFFFF;  /* texto sobre cobalto */
  /* cores maranhenses (papéis fixos) */
  --guara: #C73A22;          /* avisos, erros, detalhe do símbolo. Usar pouco */
  --ouro: #E8A33D;           /* selos, badges, destaques. Sempre com texto --ink */
  --lagoa: #1E9AA8;          /* ilustrações, mapas, gráficos. Não é cor de texto */
  --babacu: #3E6B3A;         /* sucesso, confirmações */
  --jucara: #4A1E3D;         /* rodapé (com o logo branco) e citações */
}

[data-theme="noite"] {
  --louca: #15161E; --areia: #1E2030; --linha: #343648;
  --ink: #F4EDE1; --ink-suave: #B9B3AE;
  --cobalto: #7DB0F0; --cobalto-forte: #A9CBF5; --sobre-cobalto: #15161E;
  --guara: #FF7A5C; --ouro: #F0B85A; --lagoa: #3FC0CC; --babacu: #7FC07A; --jucara: #C99BBB;
}
```

Regras:
- Fundo padrão `--louca`; seções alternadas em `--areia`; uma faixa forte por página em `--cobalto`, no máximo. Rodapé em `--jucara` com o logo branco.
- Botão principal: fundo `--cobalto`, texto `--sobre-cobalto`. Botão secundário: borda 2px `--cobalto`, texto `--cobalto`.
- Numa mesma tela, no máximo duas cores maranhenses além do cobalto.
- Texto pequeno só em `--ink`, `--ink-suave`, `--cobalto`, `--guara` ou `--babacu`. Contraste mínimo 4.5:1.
- Categorias no mapa e nos filtros usam as cores maranhenses de forma consistente, por exemplo: praias e lagoas → `--lagoa`; cultura e centro histórico → `--cobalto`; natureza e cachoeiras → `--babacu`; gastronomia → `--ouro`; eventos e festas → `--guara`; hospedagem → `--jucara`.

### 2.3 Tipografia

- **Títulos:** Bricolage Grotesque, pesos 800 (títulos grandes) e 600 (títulos de seção e cartão)
- **Texto:** DM Sans, pesos 400 e 700

```html
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=DM+Sans:wght@400;700&display=swap" rel="stylesheet">
```

(Se for Next.js, use `next/font/google` com as mesmas famílias.)

Escala sugerida: display 64–96px (line-height 0.95, letter-spacing -0.02em, uma vez por página); título 1 40–48px; título 2 26–32px; corpo 17px (line-height 1.6); legenda 14px; rótulo 13px bold. Use `clamp()` para escalar no celular. Linhas de texto com no máximo 70 caracteres. Títulos em caixa normal, só a primeira letra maiúscula.

### 2.4 Forma, espaço e profundidade

- Grade de 8px: espaços de 4, 8, 16, 24, 48, 64, 96px.
- Raios: 4px para badges, tags e peças decorativas (quase reto, como cerâmica); 10px para botões, campos e cartões; pílula só para chips de filtro.
- Sem sombras na interface plana: separe com `--areia` e `--linha`. Sombra suave só em elementos que flutuam (cartões sobre o mapa, menus, bottom sheets).
- Alvos de toque com no mínimo 44px.

### 2.5 O padrão de azulejos

O `azulejo-padrao.svg` é a assinatura visual. Use no loading, na página 404 e em fundos de capa. Nunca atrás de texto corrido. Prefira mostrar só um trecho cortado pela borda.

### 2.6 Ícones

Lucide (ou a biblioteca de ícones que o projeto já usa, se for de traço): traço 2px, 24px, cantos arredondados, na cor do texto ou em `--cobalto`. Nada de emoji na interface.

### 2.7 Voz e textos

O Azulejo fala como alguém daqui apresentando a própria terra para um amigo: direto, caloroso, sem exagero. Frases curtas, nomes reais das coisas.

- Bom: "As lagoas ficam cheias de junho a setembro." / "Saindo de São Luís, são cerca de quatro horas até Barreirinhas."
- Evitar: "Descubra experiências mágicas e inesquecíveis!" / "Transforme sua viagem."

Use "juçara" (não "açaí maranhense"), "Lençóis" (não "paraíso"). Todo texto em português do Brasil.

### 2.8 Hero da Home (aprovado)

O hero da Home segue o arquivo `referencia-hero.html`. Composição:
- Header numa faixa própria sobre `--louca`, nunca por cima da foto.
- Esquerda: selo "Guia do Maranhão" em `--ouro`, título "O Maranhão, um azulejo de cada vez." em `--cobalto` com o ponto final em `--guara`, subtítulo em `--ink-suave`, cartão branco com o seletor "Já estou no Maranhão / Vou viajar" e a busca, e a linha "Mais procurados" com links.
- Direita: um painel `--cobalto` que vai até a borda direita da tela, começando a cerca de 24% da largura da coluna, com cantos arredondados só do lado esquerdo e o padrão de azulejos por cima com opacidade 0.12.
- A foto principal fica inteira, num retângulo com raio de 10px, centralizada verticalmente e avançando sobre o fundo claro à esquerda do painel (ela fica metade sobre o claro, metade sobre o azul). Sem recortes em onda.
- Legenda do lugar abaixo da foto, alinhada à direita, em `--louca` sobre o azul. Símbolo do azulejo (48px) no canto superior direito do painel.
- O hero termina onde termina o painel azul (cantos de 24px no lado esquerdo, retos à direita, colados na borda da tela). Depois dele vem só um respiro de `clamp(72px, 9vw, 128px)` sobre `--louca` antes da próxima seção, sem divisor (o mesmo respiro vertical de todas as seções da Home).
- O padrão de azulejos só aparece dentro do painel azul do hero (opacity 0.12) e no rodapé, nunca como faixa solta entre seções.
- No celular: o texto vem primeiro; o painel azul vira um bloco atrás da foto, ocupando a largura toda.

## 3. Direção de arte: moderno, não "cara de IA"

O site deve parecer feito por um estúdio de design para uma marca de turismo, com o Maranhão no centro.

**Fazer:**
- Layout editorial: fotos grandes que sangram até a borda, grades assimétricas, alternância de tamanhos (um cartão grande ao lado de dois pequenos), texto sobre foto só com contraste garantido.
- Tipografia grande e confiante como elemento visual principal.
- O azulejo como fio condutor: padrão, transições e pequenos detalhes (o ponto vermelho do guará em marcadores, loading, bullets).
- Informação útil e concreta nos cards: melhor época, distância de São Luís, tempo de deslocamento, faixa de preço, tags.
- Microinterações cuidadosas em tudo que é clicável.
- Celular primeiro: o turista vai usar no celular, na rua. Bottom navigation no mobile, filtros em bottom sheet, mapa em tela cheia.

**Não fazer:**
- Gradientes roxo/azul, brilhos, glassmorphism por toda parte, blobs flutuando.
- Hero centralizado genérico com "Bem-vindo" e dois botões.
- Seção de "3 cards com ícone e benefício" estilo SaaS.
- Números inventados ("+10.000 viajantes felizes"), depoimentos falsos com foto de banco.
- Emoji como ícone, sombras pesadas, bordas coloridas na esquerda dos cards.
- Fontes Inter, Roboto, Arial, Poppins ou Montserrat.
- Tudo com o mesmo tamanho e o mesmo espaçamento.

## 4. Animação

Animações devem dar sensação de produto premium e conduzir o olhar, nunca atrapalhar a leitura.

**Bibliotecas:** escolha conforme a stack. Em React/Next: Motion (Framer Motion) para componentes e transições, e GSAP + ScrollTrigger se precisar de animações ligadas ao scroll mais complexas. Fora do React: GSAP + ScrollTrigger. Rolagem suave com Lenis. Justifique a escolha no plano.

**Tokens de movimento:**
- Durações: 150ms (hover, toque), 300ms (UI), 600ms (revelações), 900ms (hero, transições de página)
- Easing principal: `cubic-bezier(0.22, 1, 0.36, 1)` (saída suave). Para saídas rápidas: `cubic-bezier(0.4, 0, 1, 1)`.
- Stagger entre itens de uma lista: 60–80ms.

**Momentos de assinatura:**
1. **Hero da Home:** título entra palavra por palavra, subindo de trás de uma máscara; a foto de fundo começa levemente ampliada (scale 1.08) e assenta em 1.0; o resto entra em sequência.
2. **Transição azulejo:** uma grade de quadrados (como azulejos) que se preenche em cascata diagonal e revela a próxima tela. Use na troca de página ou ao abrir um destino, com moderação. Duração total até 900ms.
3. **Revelação no scroll:** seções e cards surgem com fade + translateY de 24px, em stagger, uma única vez.
4. **Parallax suave** nas fotos grandes (deslocamento máximo de 8%).
5. **Mapa e roteiros:** a linha da rota se desenha (stroke-dashoffset) quando entra na tela; os pins caem em sequência; ao selecionar um pin, o mapa voa suavemente até ele e o card sobe.
6. **Cards:** no hover, a foto aproxima levemente (scale 1.04) e as informações extras sobem. Favoritar tem um "pop" (scale 1 → 1.25 → 1) com o ícone preenchendo.
7. **Seletor "Cheguei / Vou viajar"** na Home: a troca entre os dois modos anima o indicador e o conteúdo.
8. **Loading:** o símbolo do azulejo com as pétalas girando ou se montando, nunca um spinner genérico.
9. Opcional: uma faixa em movimento lento com nomes de cidades e experiências.

**Regras:**
- Anime só `transform` e `opacity` (60fps).
- Respeite `prefers-reduced-motion`: desligue parallax, rolagem suave, transição azulejo e movimentos; mantenha apenas fades curtos.
- Nada em loop infinito, exceto a faixa opcional e o loading.
- Nenhum conteúdo pode ficar invisível se o JavaScript falhar ou a animação não rodar.

## 5. Páginas do MVP

Adapte aos arquivos e rotas que já existem. Mínimo:

1. **Home**: hero com foto grande e o seletor "Cheguei ao Maranhão / Vou viajar"; busca ("Para onde você vai?"); destinos em destaque em grade editorial; experiências por categoria; roteiros prontos; onde ficar (ver 5.1); próximos eventos; chamada para o mapa; chamada para planejar a viagem.
2. **Explorar**: tudo o que fazer, com filtros (categoria, cidade, época do ano, duração, preço, "perto de mim" simulado) e alternância lista / mapa.
3. **Destino (cidade)**: ex. São Luís, Barreirinhas, Alcântara, Carolina. Capa grande, resumo, melhor época, como chegar, o que fazer, onde comer, onde ficar, roteiros que passam por ali, mapa.
4. **Lugar / experiência**: galeria, descrição, informações práticas (horário, preço, duração, dicas), mapa com localização, empresas locais que oferecem o passeio (com botão de reservar que abre uma confirmação simulada), lugares próximos.
5. **Mapa**: tela cheia, pins por categoria com as cores da seção 2.2, filtros, card do lugar ao tocar no pin, rotas dos roteiros.
6. **Roteiros**: lista de roteiros prontos (ex. "3 dias em São Luís", "Lençóis em 4 dias", "Chapada das Mesas em 5 dias") e página de roteiro com linha do tempo dia a dia, mapa da rota e botão "Usar este roteiro".
7. **Planejar viagem**: assistente em passos (datas ou número de dias, interesses, ritmo, orçamento, cidade de chegada) que gera um roteiro mockado e editável (reordenar, remover, adicionar), salvo em "Minha viagem".
8. **Eventos**: agenda por mês com as festas do estado.
9. **Minha viagem**: favoritos e roteiros salvos (guardados no navegador).
10. **404** com o padrão de azulejos e um link de volta.

### 5.1 Home: "Onde ficar"

Seção entre "Roteiros prontos" e "Junho é mês de boi", no fundo `--louca`. Tudo mockado, sem reserva de verdade.
- Cabeçalho: título "Onde ficar", subtítulo "Pousadas e hospedagens para dormir bem em cada parada." e, à direita, o link "Ver todas as hospedagens →" (vai para o Explorar filtrado em hospedagem), alinhado à base do título.
- Chips: Todas, Pousada, Hotel, Chalé, Hostel. "Todas" vem ativo por padrão; o ativo fica em `--cobalto` com texto branco, os outros só com borda. Filtra no front; tocar num tipo desativa "Todas", e tocar no chip ativo de novo volta para "Todas". "Casa de temporada" não tem chip: essas hospedagens continuam nos dados e aparecem em "Todas".
- Grade de 4 cards no desktop, 2 no tablet, 1 no celular. Card no mesmo estilo dos outros: foto 4:3 com raio de 10px e coração no canto, cidade, nome, nota com estrela pequena em `--ouro` e o número de avaliações entre parênteses, e o preço "**R$ 280** / noite". Sem sombra pesada, sem gradiente, sem ícone de brilho.
- O nome ocupa uma linha só (com reticências por segurança). Os nomes mostrados nos cards têm no máximo 22 caracteres (ex.: "Margem do Preguiças", "Sobrado das Pedras"); a página do lugar mantém o nome completo. Nota e preço ficam presos na base do card, alinhados entre todos os cards da linha.
- Placeholder temporário, só nestes cards: enquanto a foto não existir, fundo sólido alternando `--lagoa`, `--jucara` e `--cobalto` pela posição do card (na Home e em "Minha viagem"), com o símbolo do azulejo branco centralizado em opacity 0.35, sem texto. Quando a foto existe, ela substitui tudo. Os outros cards do site continuam com o placeholder neutro (seção 7).
- O card leva para a página do lugar quando a hospedagem já existe em `lugares.ts`; senão, para a página da cidade. O coração salva em "Minha viagem", na seção "Onde ficar".

Navegação: header com logo, Explorar, Destinos, Roteiros, Mapa, Eventos e o botão "Planejar viagem"; no celular, bottom navigation com Início, Explorar, Mapa, Roteiros e Minha viagem.

## 6. Dados mockados

Crie arquivos de dados separados (destinos, lugares, experiências, roteiros, eventos, empresas, hospedagens). Use lugares reais do Maranhão e informações gerais corretas. Exemplos de base:

- **São Luís**: Centro Histórico (Patrimônio Mundial da UNESCO desde 1997), Praia Grande, Casa das Tulhas, Praia do Calhau, Palácio dos Leões
- **Barreirinhas e Lençóis Maranhenses**: Lagoa Azul, Lagoa Bonita, passeio pelo Rio Preguiças, Vassouras, Caburé, Atins
- **Santo Amaro do Maranhão**: outra porta de entrada para os Lençóis
- **Alcântara**: cidade colonial do outro lado da baía de São Marcos
- **Chapada das Mesas** (Carolina e Riachão): Pedra Caída, Cachoeira de Santa Bárbara, Poço Azul
- **Tutóia**: acesso ao Delta das Américas
- **Raposa**: vila de pescadores e rendeiras
- **Gastronomia**: arroz de cuxá, juçara, torta de camarão, peixe-pedra
- **Eventos**: São João e Bumba-meu-boi (junho), Carnaval, Festa do Divino em Alcântara, aniversário de São Luís (8 de setembro)

Regras para os dados:
- Não invente datas exatas de eventos, horários ou preços como se fossem oficiais. Use mês e faixas ("a partir de R$ [preço]" ou valores claramente de exemplo) e deixe um comentário no arquivo dizendo que são dados de exemplo.
- Empresas, avaliações e nomes de guias são fictícios e devem estar marcados como exemplo no código.
- Distâncias e tempos de deslocamento: use valores aproximados e arredondados.

Formato das hospedagens (`src/data/hospedagens.ts`, tipo `Hospedagem` em `tipos.ts`), todas fictícias:

```ts
{
  slug: "chales-rio-e-duna",
  nome: "Chalés Rio e Duna",                 // nome inventado
  tipo: "Chalé",                             // "Pousada" | "Hotel" | "Chalé" | "Hostel" | "Casa de temporada"
  destino: "barreirinhas",                   // slug do destino (cidade)
  avaliacao: 4.8,                            // nota de exemplo, 0 a 5 (mostrada como "4,8")
  avaliacoes: 96,                            // número de avaliações de exemplo
  precoNoite: 450,                           // reais por noite, entre R$ 120 e R$ 650
  foto: "/images/hospedagens/chales-rio-e-duna.jpg",
  lugar: "pousada-preguicas",                // opcional: slug do lugar com página própria
}
```

## 7. Fotos

O produto depende de fotos grandes. Faça assim:
- Crie um componente de imagem com fallback: enquanto a foto não existir, mostra um fundo `--areia` com o símbolo do azulejo pequeno e centralizado, em opacity 0.15, sem nenhum texto.
- Organize as imagens em uma pasta por tipo (ex. `public/images/destinos/barreirinhas.jpg`) e gere um arquivo `IMAGENS.md` listando cada arquivo esperado, o que deve aparecer nele e o tamanho ideal, para eu substituir por fotos reais.
- Não use imagens aleatórias da internet nem links externos sem licença.
- Use carregamento otimizado (lazy loading, tamanhos responsivos, `next/image` se for Next.js) e `alt` descritivo em todas.

## 8. Mapa

Use Leaflet ou MapLibre com tiles do OpenStreetMap (gratuito, com a atribuição exigida). Comece enquadrando o Maranhão. Pins customizados no estilo da marca (círculo na cor da categoria com o ponto central), agrupamento quando houver muitos, rotas desenhadas como linhas em `--cobalto`. Cards do mapa em bottom sheet no celular.

## 9. Qualidade

- Responsivo de 360px a 1440px+, sem rolagem horizontal.
- Acessível: HTML semântico, `<button>` e `<a>` de verdade, foco visível em `--cobalto`, labels nos campos, contraste 4.5:1, navegação por teclado.
- Performance: imagens otimizadas, fontes com `display=swap`, bibliotecas de animação carregadas só onde forem usadas.
- Zero erros no console e no build.

## 10. Contas, negócios e banco (Supabase)

Restaurantes, hospedagens e passeios saíram dos arquivos mockados e vêm do Supabase (Auth, Postgres e Storage). Destinos, atrativos, roteiros, eventos e as empresas fictícias continuam em `src/data`. Como configurar: README, seção "Contas e negócios (Supabase)".

### 10.1 Modelo de dados (`supabase/migrations`)

- **perfis**: `id` (= `auth.users.id`), `nome`, `papel` (`dono` | `admin`, padrão `dono`), `criado_em`. Criado por gatilho quando a conta nasce; o nome vem do cadastro.
- **negocios**: `id`, `dono_id` (nulo quando a equipe cadastra), `tipo` (`restaurante` | `hospedagem` | `passeio`), `subtipo` (hospedagem: `pousada`, `hotel`, `chale`, `hostel`, `casa_de_temporada`; os outros: texto livre), `nome` (até 60), `nome_curto` (até 22, nos cards), `slug` (único, gerado pelo banco, ver 10.2), `cidade` (nome, ex. "São Luís"), `descricao`, `endereco`, `latitude`, `longitude`, `whatsapp`, `instagram`, `site`, `preco` (por noite na hospedagem, por pessoa no passeio), `faixa_preco` (`$` a `$$$`, só restaurante), `duracao` (só passeio), `horario`, `status` (`rascunho` | `pendente` | `publicado` | `recusado`), `motivo_recusa`, `notas_internas` (só admin), `exemplo`, `extras`, `aprovado_por`, `aprovado_em`, `alterado_desde_revisao` (o dono editou depois da última revisão), `alterado_em` (última edição do dono), `ponto_encontro` (passeios), `criado_em`, `atualizado_em`. Restaurante guarda o tipo de culinária em `subtipo`.
- **extras** (jsonb, só a equipe edita): campos editoriais que o site usa e o dono não preenche: categoria do mapa, resumo, tags, meses bons, horas, dicas, textos de preço/duração, dificuldade, lugares visitados, empresas, nota de exemplo, ordem em "Onde ficar". Tipo `ExtrasNegocio` em `src/lib/negocios.ts`. Sem extras, o site usa padrões pelo tipo.
- **negocio_fotos**: `id`, `negocio_id`, `caminho` (no bucket, `<negocio_id>/arquivo.jpg`; os exemplos usam `/images/...` do próprio site), `ordem` (a menor é a capa), `legenda`.
- **Storage**: bucket `fotos-negocios`, leitura pública, só jpg/png/webp, até 5 MB.
- Um negócio tem página própria (`/lugares/:slug` ou `/experiencias/:slug`) quando tem descrição e localização; sem isso, aparece só no card e leva para a cidade.

### 10.2 Papéis e regras (RLS em todas as tabelas)

| Quem | Lê | Escreve |
| --- | --- | --- |
| Visitante (sem login) | negócios `publicado` e as fotos deles | nada |
| Dono | os publicados + os próprios | só os próprios, até 5 por conta. Cria sempre como `rascunho`; o único status que escolhe é `pendente` (enviar para análise, a partir de rascunho ou recusado). Nunca mexe em `exemplo`, `extras`, `aprovado_*`, `motivo_recusa`, `notas_internas`, `dono_id`, `alterado_*` ou `slug`. Exclui o próprio negócio em qualquer status. Fotos: até 8, só na pasta do próprio negócio. |
| Admin | tudo (notas internas pela função `notas_internas(id)`; contas com e-mail por `admin_usuarios()`) | tudo, sem limite: aprova, recusa (motivo obrigatório), despublica, marca como revisado, edita notas, transfere (`dono_id`) e exclui negócio de qualquer pessoa |

- **Completo para análise:** para ir ou ficar em `pendente`/`publicado`, o banco exige cidade, descrição de 50 a 600 caracteres, WhatsApp válido (`55` + DDD + 9 dígitos), endereço (hospedagem e restaurante), os campos do tipo (hospedagem: tipo e preço por noite; restaurante: culinária, faixa e horário; passeio: preço por pessoa, duração e ponto de encontro) e 1 foto. A mensagem diz o que falta.
- **Edição pelo dono:** negócio `publicado` continua publicado (o status não muda) e ganha `alterado_desde_revisao = true` e `alterado_em`, se algo mudou de fato; negócio `recusado` editado volta para `pendente`. A marca só some quando o admin aprova (`status` → `publicado`) ou marca como revisado (`alterado_desde_revisao` → `false`); nos dois casos o banco preenche `aprovado_por` e `aprovado_em`. Mexer nas fotos de um publicado também marca. Edições do admin não marcam.
- **Slug:** gerado no banco ao criar, a partir do nome e da cidade (`"Café & Cia." + "São Luís"` → `cafe-cia-sao-luis`), sem acentos, até 60 caracteres; se já existir (inclusive rascunho de outro dono), ganha sufixo `-2`, `-3`… O slug mandado pelo dono é ignorado; o admin pode escolher um ao criar. Depois de criado, não muda nunca, nem pelo admin e nem se o nome mudar, para não quebrar links, roteiros e favoritos.
- `notas_internas` não tem permissão de leitura pela API: nunca use `select("*")` em `negocios`, liste as colunas. `alterado_desde_revisao` e `alterado_em` só são lidos por quem está logado.
- **Testes:** `npm run test:admin-real` repete o fluxo do admin no Supabase real (aprovar, recusar, revisar, cadastrar pela equipe, transferir, despublicar, excluir; precisa da conta `TESTE_*_3` com papel admin). `npm run test:real` repete o fluxo do dono contra o Supabase do `.env.local`, com duas contas de teste (`-- --criar-contas` para criar), e apaga o que criou. `npm run test:banco` roda as migrações e o seed num Postgres em memória (PGlite) e confere cada regra como visitante, dono e admin (`supabase/tests/permissoes.mjs`). Rode depois de qualquer mudança nas migrações.
- O papel `admin` só é dado à mão no SQL Editor (comando no README). O papel de perfil não pode ser alterado pela API.
- O turista continua sem login; favoritos e roteiros ficam no navegador.

### 10.3 Rotas

- Públicas: `/entrar`, `/cadastrar`, `/esqueci-senha`, `/redefinir-senha` (destino do link do e-mail), `/termos` e `/privacidade` (texto provisório, marcado como rascunho para revisão jurídica).
- **Entrar com o Google:** botão "Continuar com o Google" em `/entrar` e `/cadastrar` (`EntrarComGoogle`), visível só quando o provedor está ligado no Supabase (o site lê `/auth/v1/settings`). Volta para `/entrar?redirect=…`. Conta nova pelo Google ganha perfil com `full_name`/`name` (migração `20261020120000_perfil_google.sql`). Configuração no README, seção 4.
- `/painel` ("Meus negócios"): exige login; sem login vai para `/entrar?redirect=/painel`.
- **Horário de funcionamento:** campo opcional nos três tipos (migração `20261021120000_horario_opcional.sql`), aparece em "Informações práticas".
- **E-mail de aprovação:** `aprovar()` publica e chama a Edge Function `avisar-aprovacao` (Resend; secrets `RESEND_API_KEY`, `EMAIL_REMETENTE`, `SITE_URL`). Falha no e-mail não desfaz a aprovação.
- **Localização:** na etapa Contato o dono marca o ponto (toque no mapa, arrastar o pin ou "Usar minha localização atual"; `CampoLocalizacao`). Sem marcar, fica o centro da cidade; trocar de cidade desmarca. Na página pública, "Como chegar" abre o ponto no Google Maps, no Waze e no Uber (`ComoChegar`, só links).
- **Moldura do painel** (`MolduraPainel`): `/painel/*` e `/admin/*` não usam o header e o rodapé do site. Topo só com o logo e o nome; menu lateral (gaveta no celular) com "Seu negócio" (Meus negócios, Estatísticas, Plano e pagamento), "Equipe Azulejo" para admin (Negócios, Usuários, Cadastrar negócio), "Ver o site" e "Sair". `/painel/estatisticas` lista os negócios para escolher (com um só, vai direto). Quem tem conta e abre o site pelo início vai direto para `/painel` (uma vez por carregamento).
- `/admin`, `/admin/:id`, `/admin/novo` e `/admin/usuarios`: exigem papel admin; para os outros (logados ou não) mostram "Página não encontrada".
- Header: deslogado, um "Entrar" discreto em `--ink-suave` (no celular, dentro do menu); logado, menu com o nome, "Meus negócios", "Administração" (só admin) e "Sair". Rodapé: link "Cadastre seu negócio".

### 10.4 Painel do dono

- `/painel`: os negócios da pessoa (capa 4:3, nome, tipo, cidade, selo Rascunho, Em análise, Publicado ou Recusado; motivo da recusa; "Alterações em conferência" num publicado editado) e o botão "Cadastrar negócio". Com 5 negócios, o botão some e aparece o aviso do limite.
- `/painel/novo` e `/painel/:id`: o mesmo formulário em 5 etapas (1 tipo, 2 dados básicos, 3 contato, 4 fotos, 5 revisão), com o progresso no topo (no celular, "Etapa 2 de 5" e uma barra em 5 partes). Negócio de outra pessoa ou inexistente: "Página não encontrada".
- Ao sair da etapa 3 de um cadastro novo, o rascunho é gravado (as fotos precisam da pasta do negócio) e a página passa a ser `/painel/:id?etapa=4`.
- Botões: rascunho tem "Salvar rascunho" e, na revisão, "Enviar para análise"; em análise e publicado, "Salvar alterações"; recusado, "Corrigir e reenviar". "Continuar" confere os campos da etapa; enviar confere tudo e leva à etapa do primeiro erro, com foco no campo.
- Depois de enviar: "Enviado para análise. Volte aqui para ver o status." (sem prometer e-mail nem notificação).
- Avisos: em análise, "Estamos revisando" (dá para editar; no celular, uma faixa de uma linha que abre o texto completo ao tocar); recusado, o motivo; publicado, "Suas alterações já estão no ar e serão conferidas pela equipe".
- Campos: nome (60) e nome curto (22, com sugestão), cidade (lista de `src/data/cidades.ts`, que também dá a latitude e longitude do centro, gravadas ao criar ou trocar de cidade; o dono não edita), descrição com contador, WhatsApp com máscara `(98) 99123-4567` (gravado como `5598991234567`), Instagram (gravado sem @) e site (com https://) opcionais, endereço.
- Fotos: de 1 a 8, por toque ou arrastando; reduzidas no navegador para 1600px no lado maior e convertidas para WebP (ou JPEG); recusadas se passarem de 5 MB depois disso; barra de progresso por arquivo; reordenar com setas (a primeira é a capa, mostrada em 4:3) e remover. Cada mudança é gravada na hora. Arquivo em `<negocio_id>/<uuid>.webp`, com cache de 1 hora.
- Excluir (com confirmação) apaga os arquivos do Storage e depois o negócio. O `remove()` do Storage não dá erro quando a permissão bloqueia, então o código confere o que voltou.
- O formulário nunca lê nem grava `extras`, `exemplo`, `notas_internas`, `aprovado_*` ou `status` além do envio para análise (`src/lib/meus-negocios.ts`). O slug é do banco; se colidir ao salvar, o app tenta de novo até 2 vezes.
- Revisão: "Como vai aparecer" mostra o card (`CardHospedagem` ou `CardItem`) e a página (`ConteudoItem`, o miolo de `PaginaItem`) com os componentes do site, numa área `inert`.

### 10.5 Área do administrador

- Navegação própria e discreta (faixa em areia abaixo do header: Negócios, Usuários, Cadastrar negócio), dentro da casca do site.
- **Aviso de envios novos**: selo redondo em ouro (`bg-ouro text-sobre-ouro`) com o número de negócios "Em análise" (`status = pendente`) ao lado de "Negócios" na faixa do admin e de "Administração" no menu do usuário (desktop e celular). Com zero, não aparece. A contagem (`ContadorEmAnalise`, chave `["admin-negocios", "em-analise"]`) se atualiza ao aprovar ou recusar e a cada minuto; leitores de tela ouvem "3 negócios em análise".
- **`/admin`**: abas com contagem (Em análise, Alterados, Publicados, Recusados, Rascunhos, Todos), busca por nome e filtros por tipo e cidade, tudo na URL. "Alterados" são os publicados com `alterado_desde_revisao`, mais recentes primeiro, com a data. Cada linha: capa, nome, tipo, cidade, dono (nome e e-mail, ou "Cadastrado pela equipe") e status.
- **`/admin/:id`**: o mesmo `FormularioNegocio` do dono em `modo="equipe"` (edita tudo, inclusive fotos, com um botão "Salvar") e, ao lado, os cartões:
  - **Status**: Aprovar e publicar (o banco grava `aprovado_por` e `aprovado_em` e limpa o motivo antigo), Recusar (diálogo com motivo obrigatório, que o dono vê no painel), Marcar como revisado (só tira a marca de alterado, sem mudar status nem aprovação), Despublicar (volta para rascunho) e Excluir (com confirmação, apagando as fotos do Storage). Mostra o que falta antes de publicar.
  - **Posição no mapa**: pin arrastável, clique no mapa move o pin, campos de latitude e longitude para o ajuste fino e "Salvar posição". O mapa tem 384px de altura (`h-96`) e a atribuição fica compacta no canto inferior direito (classe `mapa-posicao`: 10px, até 70% da largura, alinhada à direita), longe do pin centralizado e sem virar uma faixa sobre os nomes do mapa.
  - **Convite para o dono** (só em negócio sem dono e que não é exemplo): "Gerar link de convite" cria `/convite/<token>`, de uso único e válido por 7 dias. Tem "Copiar link", "Enviar no WhatsApp" (para o WhatsApp do negócio, com mensagem pronta) e "Gerar outro", que invalida o anterior. Quem abre o link e entra (ou cria a conta) clica em "Assumir" e vira o dono. Sem conta, o token fica guardado no navegador e o `/painel` traz a pessoa de volta ao convite depois de confirmar o e-mail. Banco: tabela `negocio_convites` (sem acesso direto) e as funções `gerar_convite`, `convite_do_negocio`, `ver_convite` e `aceitar_convite` (migração `20261018120000_convites.sql`).
  - **Notas internas**: lidas pela função `notas_internas(id)` e gravadas direto (o banco recusa para quem não é admin).
  - **Histórico**: dono, criado em, última alteração, última edição do dono, aprovado quando e por quem, endereço no site.
  - A coluna `extras` não aparece nem é editada em lugar nenhum da interface.
- **`/admin/novo`**: o mesmo formulário, sem dono e sem o limite de 5. Na etapa 1, a equipe escolhe "Status ao terminar" (rascunho ou publicado: o "Salvar" da revisão publica) e se é "Exemplo".
- **`/admin/usuarios`**: contas com nome, e-mail, papel, número de negócios e data (função `admin_usuarios()`, só admin). "Transferir negócio para este usuário" entrega um negócio da equipe (sem dono) a uma conta; o status não muda. O papel não muda pela interface.
- Na Home e nas listas, negócios reais vêm antes dos de exemplo.

### 10.6 Página pública do negócio

Vale para restaurantes, hospedagens e passeios do banco (`/lugares/:slug`, `/experiencias/:slug`) e para a prévia do formulário. Os atrativos fixos continuam como antes.

- **Cabeçalho**: negócio real (`exemplo = false`) mostra só categoria e nome; a descrição aparece uma vez, em "Sobre" (o resumo seria a primeira frase dela repetida). Negócios de exemplo e atrativos fixos mantêm o resumo como subtítulo.
- **Galeria** (`GaleriaNegocio`): só as fotos do próprio negócio, na ordem do dono; nunca completa com fotos da cidade ou de outros lugares. 1 foto ocupa a largura toda (4:3 no celular, 21:9 no desktop); 2 ficam lado a lado; 3 ou mais mostram uma grande e duas menores (no celular, a grande em cima e as duas embaixo) com o botão "Ver as N fotos". Tocar em qualquer foto abre o lightbox (carrossel com setas, teclado e contador "2 de 5").
- **Informações práticas**: só aparecem as linhas que o negócio preencheu; nada de "Consulte" ou "Ano todo" por padrão. Hospedagem não mostra horário: mostra o preço por noite, o tipo (Pousada, Chalé…) e a cidade. Melhor época e dificuldade só aparecem quando a equipe informou (em `extras`).
- **Nota da ficha**: "Horários e preços são de exemplo…" só quando `exemplo = true` (e nos atrativos fixos); negócio real mostra "Confirme horários e valores com o estabelecimento antes de ir."
- **WhatsApp**: se houver número, botão "Falar no WhatsApp" (`wa.me`, abre em outra aba) com a mensagem "Olá! Vi [nome] no Azulejo e gostaria de mais informações."
- **Mapa**: só o pin do negócio, centralizado, zoom 13; botões de zoom no canto de cima (não cobrem a atribuição) e, embaixo do mapa, "[Cidade], Maranhão" (o pin fica sobre o nome da cidade no mapa).

### 10.7 Como as telas leem os negócios

- O loader da raiz (`src/routes/__root.tsx`) busca os publicados uma vez (SSR) e renova a cada 5 minutos de navegação. As telas usam `useCatalogo()` (`src/lib/use-catalogo.ts`), que junta atrativos e negócios no formato dos cards, do mapa e dos roteiros (`src/data/catalogo.ts`).
- Se o banco não responder, as seções de negócios mostram `<AvisoNegocios />` (mensagem curta + "Tentar de novo") e o resto da página continua de pé. Páginas de negócio mostram "Essa página não carregou" em vez de 404.
- O aviso de "dados de exemplo" do rodapé aparece só quando há na tela algum negócio com `exemplo = true` (`useMarcarExemplo` em `src/lib/aviso-exemplo.ts`).
- Dados de exemplo: a fonte é `src/data/exemplo` (o site não importa esses arquivos). `npm run seed:gerar` gera `supabase/seed.sql`.

### 10.8 Formulários

Label sempre visível, campos de 48px, borda 2px `--linha` e foco em `--cobalto`, erro em `--guara` abaixo do campo (ligado por `aria-describedby`) e foco no primeiro campo com erro ao enviar. Mensagens em português, sem detalhe técnico (`mensagemDeErro` em `src/lib/auth.tsx`). Sem sombras, gradientes ou ícones de brilho; celular primeiro.

## 11. Plano Pro

### 11.1 O que é

- **Gratuito:** o de toda conta nova (cadastrar, publicar e editar negócios).
- **Pro:** vale para a conta inteira. Dá o selo de verificado (`SeloVerificado`) em todos os negócios publicados dela e a página de estatísticas de cada negócio.
- **Mensal:** R$ 29,90, Pix ou cartão. Parou de pagar, o Pro acaba 3 dias depois do vencimento.
- **Anual:** R$ 329,90, só no cartão, à vista ou em até 12x com juros. Dá 12 meses e não renova sozinho; nos últimos 30 dias, `/painel/assinatura` oferece renovar (os meses se somam).
- Preços e regras: `supabase/functions/_shared/precos.ts` (o site importa por `src/lib/plano.ts`).

### 11.2 Pagamento (Asaas)

- A pessoa escolhe o plano em `/painel/assinatura`, informa nome e CPF/CNPJ e paga na fatura do Asaas (link aberto em nova aba). A tela consulta de novo a cada 5 s até o pagamento cair.
- Funções do servidor (Supabase Edge Functions): `asaas-assinar`, `asaas-cancelar` e `asaas-webhook`. Chaves só nos segredos do Supabase. Passo a passo no README, seção "6. Plano Pro".
- O Pro liga só pelo webhook. A regra é `eh_pro(perfil)`: `assinaturas.pro_ate` maior que agora. Estorno ou contestação encerram na hora.

### 11.3 Estatísticas

- Tabela `negocio_estatisticas`: um total por negócio, dia (horário de Brasília) e tipo: `visita`, `whatsapp`, `instagram`, `site` e `aparicao` (o card apareceu numa lista).
- O site grava por `registrar_evento` (`src/lib/estatisticas.ts`). Visita e aparição contam uma vez por sessão do navegador; nada conta na prévia do painel. A contagem vale para todos os negócios publicados, também os do Gratuito, para quem assinar já encontrar o histórico.
- **Compartilhar** (ao lado de "Informações práticas", em lugares e experiências): janela com a prévia do link e três canais — WhatsApp (`wa.me` com texto pronto), Instagram (folha de compartilhar do sistema no celular; no computador copia o link e diz onde colar) e Copiar link. Em negócio do banco, cada canal conta como `compartilhar_whatsapp`, `compartilhar_instagram` ou `compartilhar_link` (migração `20261020130000_compartilhamentos.sql`); o painel mostra o total, a divisão por canal e o gráfico por dia.
- **Prévia do link** (WhatsApp, Instagram, Facebook): `metaDaPagina` em `src/lib/compartilhar.ts` gera og:title ("Nome · Cidade"), og:description (resumo), og:url e og:image com endereço completo. Foto do Storage passa pelo recorte do Supabase (1200×630, `render/image`); sem foto, `/og-image.jpg`.
- Só o dono Pro ou o admin leem (`estatisticas_negocio`). Quem é Gratuito vê a tela bloqueada com o convite para o Pro.

### 11.4 Rotas

- `/planos`: comparativo Gratuito × Pro, mensal/anual e perguntas frequentes.
- `/painel/assinatura`: status, assinar, pagar, cancelar e renovar.
- `/painel/estatisticas/$id`: períodos de 7, 30 e 90 dias, comparação com o período anterior, gráfico por dia (recharts, uma série por gráfico, em cobalto) e tabela.
- `/admin/usuarios` mostra o plano de cada conta.
