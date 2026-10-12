import { createFileRoute } from "@tanstack/react-router";
import { LayoutAdmin } from "@/components/admin/LayoutAdmin";
import { AreaRestrita } from "@/components/conta/LayoutConta";
import { FormularioNegocio } from "@/components/painel/FormularioNegocio";

/** Cadastro em nome de terceiros: o mesmo formulário do dono, sem dono e sem limite. */
export const Route = createFileRoute("/admin/novo")({
  head: () => ({
    meta: [
      { title: "Cadastrar negócio | Administração | Azulejo" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <AreaRestrita papel="admin">
      {() => (
        <LayoutAdmin titulo="Cadastrar negócio" largura="max-w-4xl">
          <FormularioNegocio modo="equipe" />
        </LayoutAdmin>
      )}
    </AreaRestrita>
  ),
});
