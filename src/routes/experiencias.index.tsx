import { createFileRoute, redirect } from "@tanstack/react-router";

// Endereço antigo: a lista de experiências agora é a página Explorar.
export const Route = createFileRoute("/experiencias/")({
  beforeLoad: () => {
    throw redirect({ to: "/explorar", replace: true });
  },
});
