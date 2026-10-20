# Resumo: área do administrador (11/10/2026)

A área do administrador está pronta e foi testada contra o Supabase real. Os 163 testes de banco, os 29 do fluxo do admin no banco real e os 37 do fluxo do dono passam. Typecheck e build passam, e o lint não dá erro. O hero não foi mexido e não houve commit.

## 0. WhatsApp
A mensagem agora é "Olá! Vi [nome] no Azulejo e gostaria de mais informações."

## 1. Lista (`/admin`)
- Abas com contagem: Em análise, Alterados, Publicados, Recusados, Rascunhos e Todos.
- Busca por nome e filtros por tipo e cidade, guardados na URL.
- Cada linha mostra capa, nome, tipo, cidade, dono (nome e e-mail, ou "Cadastrado pela equipe") e status.
- A aba Alterados traz os mais recentes primeiro, com a data da alteração.

## 2. Página do negócio (`/admin/:id`)
- **Formulário:** o mesmo do dono, para editar qualquer campo, inclusive as fotos.
- **Ao lado:**
  - Status, com as ações Aprovar e publicar, Recusar (motivo obrigatório, que o banco também exige), Marcar como revisado, Despublicar e Excluir.
  - Posição no mapa, com pin arrastável, clique no mapa e campos numéricos para o ajuste fino.
  - Notas internas e histórico (dono, criação, última alteração, quem aprovou e quando).
- **Extras:** a coluna `extras` não aparece em nenhuma tela.

## 3. Cadastro pela equipe (`/admin/novo`)
O mesmo componente do dono, sem dono e sem o limite de 5. Na etapa 1 o admin escolhe o status ao terminar (rascunho ou publicado) e se o negócio é de exemplo.

## 4. Usuários (`/admin/usuarios`)
Nome, e-mail, papel, número de negócios e data de cadastro. A ação "Transferir negócio para este usuário" lista os negócios da equipe que estão sem dono. Não há como mudar o papel pela interface.

## 5. Segurança
Visitante e dono comum recebem "Página não encontrada" em todas as rotas `/admin`. A migração nova é `supabase/migrations/20261011120000_admin.sql`, já aplicada no Supabase.

## Fluxo completo no Supabase real
- O dono enviou um chalé com 4 fotos e o admin aprovou. O chalé apareceu em primeiro na seção "Onde ficar" da Home e com as 4 fotos na página pública.
- O dono editou o chalé e ele apareceu na aba Alterados. Pela interface: marcar como revisado, mover o pin no mapa e salvar, gravar uma nota interna.
- O restaurante recusado mostrou o motivo no painel do dono.
- Um negócio cadastrado pela equipe foi transferido para outra conta, despublicado e excluído, com as fotos apagadas.

Depois dos prints, os negócios de teste foram apagados do banco real.
- Recriar: `npm run test:admin-real -- --manter`
- Apagar: `npm run test:admin-real -- --limpar`

## Prints
Pasta temporária da sessão (pode sumir se o Windows limpar o Temp):
`C:\Users\danieljr\AppData\Local\Temp\claude\C--Users-danieljr-Documents-Projetos-o-que-fazer-MA\37e6cfd3-9a39-417f-8ab6-984bfa4effe7\scratchpad\fotos-admin`

Em 1440px e 390px: a lista na aba Alterados, a página do negócio com o mapa, `/admin/novo`, a Home e a página pública depois da aprovação. Há também `/admin/usuarios` em 1440px e o painel do dono com o motivo da recusa.

## Decisões para conferir
- **Reais antes dos exemplos:** na Home e nas listas, negócios reais vêm antes dos de exemplo. Sem isso, um negócio aprovado não aparecia na Home, porque o "Onde ficar" mostra só 8 cards e os exemplos vinham na frente.
- **Marcar como revisado:** só tira a marca de alterado. Não grava quem revisou, para o histórico continuar mostrando quem aprovou.
- **Aprovar:** limpa o motivo da recusa anterior.
- **Aprovar incompleto:** o painel lista o que falta, mas deixa a equipe publicar mesmo assim.
- **Recusar um publicado:** o botão Recusar também aparece para negócio já publicado.
- **Conta de teste admin:** `danieljunior.me+azulejo3@gmail.com` tem papel admin no seu banco. Para tirar, troque o papel para `dono` pelo SQL ou apague a conta em Authentication → Users.

Este arquivo é só um recado: pode apagar depois de ler.
