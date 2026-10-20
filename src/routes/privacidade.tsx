import { createFileRoute } from "@tanstack/react-router";
import { PaginaLegal } from "@/components/conta/PaginaLegal";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [{ title: "Política de Privacidade | Azulejo" }, { name: "robots", content: "noindex" }],
  }),
  component: Privacidade,
});

// TEXTO PROVISÓRIO — revisar com advogado (LGPD) antes do lançamento.
function Privacidade() {
  return (
    <PaginaLegal titulo="Política de Privacidade" atualizado="outubro de 2026">
      <section>
        <h2>1. Quem viaja</h2>
        <p>
          Não pedimos conta nem dados pessoais para usar o guia. Favoritos e roteiros salvos ficam
          só no seu navegador e não são enviados para nós.
        </p>
      </section>
      <section>
        <h2>2. Quem cadastra um negócio</h2>
        <p>Para criar a conta, guardamos:</p>
        <ul>
          <li>nome e e-mail, para identificar você e mandar avisos da conta;</li>
          <li>a senha, sempre criptografada (nem a equipe consegue lê-la);</li>
          <li>os dados e as fotos do negócio que você cadastrar.</li>
        </ul>
        <p>
          Os dados do negócio (nome, endereço, contatos, fotos) ficam públicos depois de aprovados,
          porque esse é o objetivo do cadastro.
        </p>
      </section>
      <section>
        <h2>3. Onde os dados ficam</h2>
        <p>
          Usamos o Supabase para contas, banco de dados e fotos. [Região do servidor e demais
          operadores a confirmar antes do lançamento.]
        </p>
      </section>
      <section>
        <h2>4. Seus direitos</h2>
        <p>
          Pela LGPD, você pode pedir acesso, correção ou exclusão dos seus dados e da sua conta.
          [Canal para esses pedidos a definir antes do lançamento.]
        </p>
      </section>
      <section>
        <h2>5. Cookies e armazenamento</h2>
        <p>
          Usamos o armazenamento do navegador para manter você logado e para guardar favoritos e
          preferências, como o tema. Não usamos cookies de publicidade.
        </p>
      </section>
    </PaginaLegal>
  );
}
