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

**Fora do escopo do MVP:** login, painel administrativo, pagamentos reais.

**Tudo navegável:** use dados mockados realistas. Nenhum botão importante fica sem ação. O que não tem backend funciona de forma simulada (salvar favoritos, montar roteiro, filtrar, reservar mostra uma confirmação etc.), guardando estado no navegador quando fizer sentido.

## 2. Identidade visual

O nome Azulejo vem dos azulejos portugueses que cobrem os casarões do Centro Histórico de São Luís. A marca usa muito fundo claro e azul cobalto, e as outras cores do Maranhão aparecem em pequenas doses, como os detalhes de uma fachada: o vermelho do guará, o ouro do Bumba-meu-boi, o verde do babaçu, o roxo da juçara e as lagoas dos Lençóis.

### 2.1 Logo

Os arquivos estão na pasta `azulejo-brand/` (mova para a pasta pública do projeto, por exemplo `public/brand/`):

- `azulejo-logo.svg`: símbolo + nome, versão principal, sobre fundos claros
- `azulejo-logo-negativo.svg`: para fundos escuros (cobalto, juçara)
- `azulejo-simbolo.svg` e `azulejo-simbolo-negativo.svg`: só o símbolo (favicon, ícone de app, avatar, loading)
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
  --jucara: #4A1E3D;         /* rodapé, faixas escuras, citações */
}

[data-theme="noite"] {
  --louca: #15161E; --areia: #1E2030; --linha: #343648;
  --ink: #F4EDE1; --ink-suave: #B9B3AE;
  --cobalto: #7DB0F0; --cobalto-forte: #A9CBF5; --sobre-cobalto: #15161E;
  --guara: #FF7A5C; --ouro: #F0B85A; --lagoa: #3FC0CC; --babacu: #7FC07A; --jucara: #C99BBB;
}
```

Regras:
- Fundo padrão `--louca`; seções alternadas em `--areia`; uma faixa forte por página em `--cobalto` ou `--jucara`, no máximo.
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

O `azulejo-padrao.svg` é a assinatura visual. Use em faixas divisórias, no loading, na página 404, em fundos de capa e como fallback de foto. Nunca atrás de texto corrido. Prefira mostrar só um trecho cortado pela borda.

### 2.6 Ícones

Lucide (ou a biblioteca de ícones que o projeto já usa, se for de traço): traço 2px, 24px, cantos arredondados, na cor do texto ou em `--cobalto`. Nada de emoji na interface.

### 2.7 Voz e textos

O Azulejo fala como alguém daqui apresentando a própria terra para um amigo: direto, caloroso, sem exagero. Frases curtas, nomes reais das coisas.

- Bom: "As lagoas ficam cheias de junho a setembro." / "Saindo de São Luís, são cerca de quatro horas até Barreirinhas."
- Evitar: "Descubra experiências mágicas e inesquecíveis!" / "Transforme sua viagem."

Use "juçara" (não "açaí maranhense"), "Lençóis" (não "paraíso"). Todo texto em português do Brasil.

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

1. **Home**: hero com foto grande e o seletor "Cheguei ao Maranhão / Vou viajar"; busca ("Para onde você vai?"); destinos em destaque em grade editorial; experiências por categoria; roteiros prontos; próximos eventos; chamada para o mapa; chamada para planejar a viagem.
2. **Explorar**: tudo o que fazer, com filtros (categoria, cidade, época do ano, duração, preço, "perto de mim" simulado) e alternância lista / mapa.
3. **Destino (cidade)**: ex. São Luís, Barreirinhas, Alcântara, Carolina. Capa grande, resumo, melhor época, como chegar, o que fazer, onde comer, onde ficar, roteiros que passam por ali, mapa.
4. **Lugar / experiência**: galeria, descrição, informações práticas (horário, preço, duração, dicas), mapa com localização, empresas locais que oferecem o passeio (com botão de reservar que abre uma confirmação simulada), lugares próximos.
5. **Mapa**: tela cheia, pins por categoria com as cores da seção 2.2, filtros, card do lugar ao tocar no pin, rotas dos roteiros.
6. **Roteiros**: lista de roteiros prontos (ex. "3 dias em São Luís", "Lençóis em 4 dias", "Chapada das Mesas em 5 dias") e página de roteiro com linha do tempo dia a dia, mapa da rota e botão "Usar este roteiro".
7. **Planejar viagem**: assistente em passos (datas ou número de dias, interesses, ritmo, orçamento, cidade de chegada) que gera um roteiro mockado e editável (reordenar, remover, adicionar), salvo em "Minha viagem".
8. **Eventos**: agenda por mês com as festas do estado.
9. **Minha viagem**: favoritos e roteiros salvos (guardados no navegador).
10. **404** com o padrão de azulejos e um link de volta.

Navegação: header com logo, Explorar, Destinos, Roteiros, Mapa, Eventos e o botão "Planejar viagem"; no celular, bottom navigation com Início, Explorar, Mapa, Roteiros e Minha viagem.

## 6. Dados mockados

Crie arquivos de dados separados (destinos, lugares, experiências, roteiros, eventos, empresas). Use lugares reais do Maranhão e informações gerais corretas. Exemplos de base:

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

## 7. Fotos

O produto depende de fotos grandes. Faça assim:
- Crie um componente de imagem com fallback: enquanto a foto não existir, mostra o padrão de azulejos sobre a cor da categoria com uma etiqueta discreta do que vai ali (ex. "Foto: Lagoa Bonita").
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
