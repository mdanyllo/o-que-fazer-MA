import { createFileRoute, Link } from "@tanstack/react-router";
import { PaginaLegal } from "@/components/conta/PaginaLegal";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [{ title: "Termos de Uso | Azulejo" }, { name: "robots", content: "noindex" }],
  }),
  component: Termos,
});

const link = "font-bold text-cobalto underline underline-offset-4";

// TEXTO PROVISÓRIO — revisar com advogado antes do lançamento.
function Termos() {
  return (
    <PaginaLegal titulo="Termos de Uso" atualizado="outubro de 2026">
      <section>
        <h2>1. O que é o Azulejo</h2>
        <p>
          O Azulejo é um guia para descobrir e planejar viagens pelo Maranhão. Quem viaja usa o site
          sem conta. A conta serve para quem quer cadastrar um restaurante, uma hospedagem ou um
          passeio.
        </p>
      </section>
      <section>
        <h2>2. Sua conta</h2>
        <ul>
          <li>Use um e-mail seu e mantenha a senha em segredo.</li>
          <li>Você responde pelo que for feito com a sua conta.</li>
          <li>Podemos suspender contas usadas para fraude, spam ou para enganar quem viaja.</li>
        </ul>
      </section>
      <section>
        <h2>3. Cadastro de negócios</h2>
        <ul>
          <li>Só cadastre negócios que você representa e com informações verdadeiras.</li>
          <li>
            Cada cadastro passa por revisão da equipe antes de aparecer no site. Podemos recusar ou
            retirar um cadastro, explicando o motivo.
          </li>
          <li>
            Fotos e textos enviados precisam ser seus ou ter autorização de uso. Ao enviar, você
            permite que o Azulejo os mostre no site.
          </li>
        </ul>
      </section>
      <section>
        <h2>4. Informações do site</h2>
        <p>
          Preços, horários e condições mudam. Confira sempre com o negócio antes de viajar. Parte do
          conteúdo atual é de exemplo e está marcada como tal.
        </p>
      </section>
      <section>
        <h2>5. Privacidade</h2>
        <p>
          O que fazemos com seus dados está na{" "}
          <Link to="/privacidade" className={link}>
            Política de Privacidade
          </Link>
          .
        </p>
      </section>
      <section>
        <h2>6. Contato</h2>
        <p>[Canal de contato a definir antes do lançamento.]</p>
      </section>
    </PaginaLegal>
  );
}
