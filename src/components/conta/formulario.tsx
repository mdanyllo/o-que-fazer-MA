import { Eye, EyeOff } from "lucide-react";
import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/*
 * Peças dos formulários de conta: label sempre visível, campo de 48px, foco em cobalto,
 * erro em guará logo abaixo do campo e ligado a ele por aria-describedby.
 */

export const classeCampo =
  "min-h-12 w-full rounded-md border-2 border-linha bg-louca px-4 text-base text-ink transition-colors duration-150 placeholder:text-ink-suave hover:border-ink-suave focus:border-cobalto aria-[invalid=true]:border-guara";

type CampoProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "onChange" | "value"> & {
  id: string;
  rotulo: string;
  valor: string;
  aoMudar: (valor: string) => void;
  erro?: string | undefined;
  dica?: string;
  /** mostra "(opcional)" ao lado do rótulo */
  opcional?: boolean;
  /** texto fixo antes do valor, como "R$" */
  prefixo?: string;
};

export function CampoTexto({
  id,
  rotulo,
  valor,
  aoMudar,
  erro,
  dica,
  opcional,
  prefixo,
  type = "text",
  className,
  ...props
}: CampoProps) {
  const [mostrar, setMostrar] = useState(false);
  const senha = type === "password";
  const descricoes = [dica && `${id}-dica`, erro && `${id}-erro`].filter(Boolean).join(" ");

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Rotulo id={id} rotulo={rotulo} opcional={opcional} />
      <div className="relative">
        {prefixo && (
          <span
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-ink-suave"
          >
            {prefixo}
          </span>
        )}
        <input
          id={id}
          type={senha && mostrar ? "text" : type}
          value={valor}
          onChange={(e) => aoMudar(e.target.value)}
          aria-invalid={erro ? true : undefined}
          aria-describedby={descricoes || undefined}
          className={cn(classeCampo, senha && "pr-14", prefixo && "pl-12")}
          {...props}
        />
        {senha && (
          <button
            type="button"
            onClick={() => setMostrar((m) => !m)}
            aria-label={mostrar ? "Esconder senha" : "Mostrar senha"}
            aria-pressed={mostrar}
            className="absolute top-0.5 right-0.5 grid size-11 place-items-center rounded-md text-ink-suave hover:text-cobalto"
          >
            {mostrar ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
          </button>
        )}
      </div>
      <DicaErro id={id} dica={dica} erro={erro} />
    </div>
  );
}

/** Rótulo visível de um campo, com "(opcional)" quando for o caso. */
export function Rotulo({
  id,
  rotulo,
  opcional,
}: {
  id: string;
  rotulo: string;
  opcional?: boolean | undefined;
}) {
  return (
    <label htmlFor={id} className="text-rotulo">
      {rotulo}
      {opcional && <span className="font-normal text-ink-suave"> (opcional)</span>}
    </label>
  );
}

/** Dica e erro abaixo do campo (ids `<id>-dica` e `<id>-erro` para o aria-describedby). */
export function DicaErro({
  id,
  dica,
  erro,
}: {
  id: string;
  dica?: ReactNode;
  erro?: string | undefined;
}) {
  return (
    <>
      {dica && (
        <p id={`${id}-dica`} className="text-legenda text-ink-suave">
          {dica}
        </p>
      )}
      {erro && (
        <p id={`${id}-erro`} className="text-legenda font-bold text-guara">
          {erro}
        </p>
      )}
    </>
  );
}

export const descritoPor = (id: string, dica: unknown, erro: unknown) =>
  [dica && `${id}-dica`, erro && `${id}-erro`].filter(Boolean).join(" ") || undefined;

/** Erro geral do formulário (depois de enviar). Lido pelo leitor de tela ao aparecer. */
export function CaixaErro({ children }: { children: ReactNode }) {
  return (
    <div role="alert" className="rounded-md border-2 border-guara bg-louca p-4 text-ink">
      {children}
    </div>
  );
}

/** Confirmação depois de enviar (e-mail enviado, senha trocada). */
export function CaixaAviso({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div role="status" className="rounded-md border border-linha bg-areia p-5">
      <p className="font-bold text-babacu">{titulo}</p>
      <div className="mt-2 flex flex-col gap-3">{children}</div>
    </div>
  );
}

export const linkConta =
  "font-bold text-cobalto underline underline-offset-4 hover:text-cobalto-forte";

/** Depois de validar, leva o foco ao primeiro campo com erro (teclado e leitor de tela). */
export function focarPrimeiroErro() {
  setTimeout(() => {
    const campo = document.querySelector<HTMLElement>('[aria-invalid="true"]');
    // num grupo de opções, o foco vai para a primeira opção
    const alvo = campo?.matches("fieldset") ? campo.querySelector<HTMLElement>("input") : campo;
    alvo?.focus();
  }, 0);
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validarEmail(email: string) {
  if (!email.trim()) return "Informe seu e-mail.";
  if (!EMAIL.test(email.trim())) return "Confira o e-mail: ele parece incompleto.";
  return undefined;
}

export const SENHA_MINIMA = 8;

export function validarSenha(senha: string) {
  if (!senha) return "Crie uma senha.";
  if (senha.length < SENHA_MINIMA)
    return `A senha precisa ter pelo menos ${SENHA_MINIMA} caracteres.`;
  return undefined;
}
