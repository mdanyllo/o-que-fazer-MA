import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import type { User } from "@supabase/supabase-js";
import { BadgeCheck, Check, ExternalLink, Lock, Star } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { botao, Botao } from "@/components/azulejo/botao";
import { Selo, Tag } from "@/components/azulejo/etiquetas";
import { LoadingAzulejo } from "@/components/azulejo/LoadingAzulejo";
import {
  CaixaErro,
  CampoTexto,
  classeCampo,
  focarPrimeiroErro,
  Rotulo,
} from "@/components/conta/formulario";
import { AreaRestrita } from "@/components/conta/LayoutConta";
import { GrupoOpcoes } from "@/components/painel/campos";
import { LayoutPainel } from "@/components/painel/LayoutPainel";
import { PixNaTela } from "@/components/painel/PixNaTela";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  assinar,
  cancelarAssinatura,
  cpfCnpjValido,
  dataLonga,
  ehPro,
  mascararCpfCnpj,
  MAX_PARCELAS,
  opcoesParcelamento,
  PRECO_ANUAL,
  PRECO_MENSAL,
  reais,
  TOLERANCIA_DIAS,
  usePlano,
  type Assinatura,
} from "@/lib/plano";
import { cn } from "@/lib/utils";

type Busca = { plano?: "mensal" | "anual" };
type PlanoPago = "mensal" | "anual";

export const Route = createFileRoute("/painel/assinatura")({
  validateSearch: (s: Record<string, unknown>): Busca =>
    s["plano"] === "anual" || s["plano"] === "mensal" ? { plano: s["plano"] } : {},
  head: () => ({
    meta: [{ title: "Plano e pagamento | Azulejo" }, { name: "robots", content: "noindex" }],
  }),
  component: () => (
    <AreaRestrita>{({ usuario }) => <PaginaAssinatura usuario={usuario} />}</AreaRestrita>
  ),
});

function PaginaAssinatura({ usuario }: { usuario: User }) {
  const plano = usePlano(usuario.id, true);
  const { plano: planoBusca } = Route.useSearch();
  const [escolhido, setEscolhido] = useState<PlanoPago | null>(planoBusca ?? null);
  const queryClient = useQueryClient();
  const a = plano.data ?? null;
  const escolha = escolhido && disponiveis(a)[escolhido] ? escolhido : null;

  // o pagamento caiu enquanto a pessoa estava na aba do Asaas
  const statusAntes = useRef(a?.status);
  useEffect(() => {
    if (statusAntes.current === "aguardando_pagamento" && a?.status === "ativa")
      toast.success("Pagamento confirmado. Sua conta agora é Pro!");
    else if (statusAntes.current === "atrasada" && a?.status === "ativa")
      toast.success("Pagamento confirmado. Seu Pro continua ativo.");
    statusAntes.current = a?.status;
  }, [a?.status]);

  return (
    <LayoutPainel titulo="Plano e pagamento" largura="max-w-site" voltar={false}>
      {plano.isPending ? (
        <LoadingAzulejo className="self-center py-12" />
      ) : plano.isError ? (
        <CaixaErro>
          <p>Não conseguimos carregar o seu plano agora.</p>
          <button
            type="button"
            onClick={() => void plano.refetch()}
            className="mt-2 min-h-11 font-bold text-cobalto underline underline-offset-4"
          >
            Tentar de novo
          </button>
        </CaixaErro>
      ) : (
        <div className="flex flex-col gap-10">
          {ehPro(a) && <StatusPlano assinatura={a!} />}
          {a?.status === "aguardando_pagamento" && !escolha && (
            <AguardandoPagamento assinatura={a} />
          )}
          <CardsPlanos assinatura={a} escolhido={escolha} aoEscolher={setEscolhido} />
          {escolha && (
            <FormularioAssinatura
              key={escolha}
              plano={escolha}
              assinatura={a}
              email={usuario.email ?? ""}
              renovacao={ehPro(a) && a?.plano === "anual"}
              aoCriarCobranca={() => {
                setEscolhido(null);
                window.scrollTo({ top: 0, behavior: "smooth" });
                void queryClient.invalidateQueries({ queryKey: ["plano"] });
              }}
            />
          )}
        </div>
      )}
    </LayoutPainel>
  );
}

const venceEmBreve = (a: Assinatura) =>
  Boolean(a.pro_ate && new Date(a.pro_ate).getTime() - Date.now() < 30 * 86400000);

/** Quais planos a conta pode contratar agora. */
function disponiveis(a: Assinatura | null): Record<PlanoPago, boolean> {
  const pro = ehPro(a);
  const mensalAtivo =
    pro && a?.plano === "mensal" && (a.status === "ativa" || a.status === "atrasada");
  const anualAtivo = pro && a?.plano === "anual";
  return {
    mensal: !mensalAtivo && !anualAtivo,
    // o anual pode ser renovado nos últimos 30 dias; com o mensal ativo, cancele antes
    anual: !mensalAtivo && (!anualAtivo || venceEmBreve(a!)),
  };
}

/** Em que plano a conta está agora. */
function planoAtual(a: Assinatura | null): "gratuito" | PlanoPago {
  return ehPro(a) && a?.plano ? a.plano : "gratuito";
}

const ECONOMIA_ANUAL = PRECO_MENSAL * 12 - PRECO_ANUAL;

const RECURSOS_GRATUITO = [
  "Página do negócio, revisada pela equipe",
  "Até 8 fotos, WhatsApp, Instagram e site",
  "Aparece nos destinos, no mapa e nos roteiros",
];

const RECURSOS_PRO = [
  "Tudo do Gratuito",
  "Selo de verificado nos cards e na página",
  "Estatísticas de visitas, WhatsApp, Instagram e site",
  "Comparação com o período anterior, dia a dia",
];

/** Gratuito, Pro mensal e Pro anual lado a lado, com o plano atual marcado. */
function CardsPlanos({
  assinatura: a,
  escolhido,
  aoEscolher,
}: {
  assinatura: Assinatura | null;
  escolhido: PlanoPago | null;
  aoEscolher: (p: PlanoPago) => void;
}) {
  const atual = planoAtual(a);
  const pode = disponiveis(a);
  const em12 = opcoesParcelamento()[MAX_PARCELAS - 1]!;

  const acao = (p: PlanoPago) => {
    if (!pode[p])
      return atual === p ? (
        <PlanoAtual />
      ) : (
        <Aviso>
          {atual === "mensal"
            ? "Para trocar para o anual, cancele o mensal antes."
            : "Disponível quando o seu anual terminar."}
        </Aviso>
      );
    const marcado = escolhido === p;
    return (
      <Botao
        tamanho="lg"
        // o mais escolhido já chama com o botão cheio enquanto nada foi escolhido
        variante={marcado || (p === "mensal" && !escolhido) ? "principal" : "secundario"}
        aria-pressed={marcado}
        onClick={() => aoEscolher(p)}
        className="mt-auto w-full"
      >
        {marcado ? (
          <>
            <Check aria-hidden /> Escolhido
          </>
        ) : atual === p ? (
          "Renovar o anual"
        ) : (
          `Escolher o ${p}`
        )}
      </Botao>
    );
  };

  return (
    <section aria-labelledby="titulo-planos" className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2 id="titulo-planos" className="text-t2">
          Planos
        </h2>
        <p className="text-ink-suave">
          O Pro vale para todos os negócios da sua conta.{" "}
          <Link to="/planos" className="font-bold text-cobalto underline underline-offset-4">
            Comparar em detalhes
          </Link>
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3 md:py-4">
        <CardPlano
          nome="Gratuito"
          preco="R$ 0"
          apoio="Para estar no guia, sem custo."
          recursos={RECURSOS_GRATUITO}
          atual={atual === "gratuito"}
        >
          {atual === "gratuito" ? (
            <PlanoAtual />
          ) : (
            <Aviso>Sua conta volta para cá se o Pro terminar.</Aviso>
          )}
        </CardPlano>
        <CardPlano
          nome="Pro mensal"
          preco={reais(PRECO_MENSAL)}
          periodo="/ mês"
          apoio="No Pix ou no cartão. Cancele quando quiser."
          recursos={RECURSOS_PRO}
          atual={atual === "mensal"}
          destaque={escolhido === "mensal"}
          popular
          pro
        >
          {acao("mensal")}
        </CardPlano>
        <CardPlano
          nome="Pro anual"
          preco={reais(PRECO_ANUAL)}
          periodo="/ ano"
          apoio={`No cartão, à vista ou em até ${MAX_PARCELAS}x de ${reais(em12.parcela)}.`}
          selo={`Economize ${reais(ECONOMIA_ANUAL)}`}
          recursos={RECURSOS_PRO}
          atual={atual === "anual"}
          destaque={escolhido === "anual"}
          pro
        >
          {acao("anual")}
        </CardPlano>
      </div>
    </section>
  );
}

const PlanoAtual = () => (
  <p className="mt-auto flex min-h-13 items-center justify-center rounded-md bg-areia font-bold text-ink-suave">
    Seu plano atual
  </p>
);

const Aviso = ({ children }: { children: ReactNode }) => (
  <p className="mt-auto flex min-h-13 items-center text-legenda text-ink-suave">{children}</p>
);

function CardPlano({
  nome,
  preco,
  periodo,
  apoio,
  selo,
  recursos,
  atual,
  destaque = false,
  popular = false,
  pro = false,
  children,
}: {
  nome: string;
  preco: string;
  periodo?: string;
  apoio: string;
  selo?: string;
  recursos: string[];
  atual: boolean;
  destaque?: boolean;
  /** "Mais escolhido": borda cobalto, etiqueta na borda e, no desktop, um pouco mais alto. */
  popular?: boolean;
  pro?: boolean;
  children: ReactNode;
}) {
  return (
    <article
      className={cn(
        "relative flex flex-col gap-5 rounded-md border-2 bg-louca p-6 transition-colors duration-150",
        destaque || popular || (atual && pro) ? "border-cobalto" : "border-linha",
        popular && "md:-my-4 md:py-10",
        (popular || (selo && !atual)) && "mt-3 md:mt-0",
      )}
    >
      {/* pendurados na borda, para não desalinhar o preço dos outros cards */}
      {popular && (
        <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-sm bg-cobalto px-2 py-0.5 text-rotulo text-sobre-cobalto">
          <Star className="size-3.5 fill-current" aria-hidden /> Mais escolhido
        </span>
      )}
      {selo && !atual && <Selo className="absolute -top-3 left-6">{selo}</Selo>}
      <header className="flex flex-col gap-2">
        <div className="flex min-h-7 flex-wrap items-center gap-2">
          <h3 className={cn("flex items-center gap-1.5 text-t3", pro && "text-cobalto")}>
            {nome}
            {pro && <BadgeCheck className="size-5" aria-hidden />}
          </h3>
          {atual && <Tag>Atual</Tag>}
        </div>
        <p className="font-display text-[2rem] leading-none font-extrabold">
          {preco}
          {periodo && (
            <span className="font-sans text-base font-normal text-ink-suave"> {periodo}</span>
          )}
        </p>
        <p className="text-legenda text-ink-suave">{apoio}</p>
      </header>
      <ul className="flex flex-col gap-2.5 border-t border-linha pt-5">
        {recursos.map((r) => (
          <li key={r} className="flex gap-2.5 text-[0.9375rem]">
            <Check className="mt-0.5 size-4.5 shrink-0 text-babacu" aria-hidden />
            {r}
          </li>
        ))}
      </ul>
      {children}
    </article>
  );
}

/** Situação do Pro: até quando, como paga, atraso ou cancelamento. */
function StatusPlano({ assinatura: a }: { assinatura: Assinatura }) {
  const queryClient = useQueryClient();
  const [pagarPix, setPagarPix] = useState(false);
  const pixEmAberto = Boolean(a.link_pagamento && a.plano === "mensal" && a.forma === "pix");
  const linhas: [string, string][] = [
    [
      "Forma de pagamento",
      a.plano === "anual"
        ? `Cartão${a.parcelas && a.parcelas > 1 ? `, em ${a.parcelas}x` : ", à vista"}`
        : a.forma === "pix"
          ? "Pix, todo mês"
          : "Cartão, todo mês",
    ],
    ["Pro até", dataLonga(a.pro_ate!)],
    ...(a.plano === "mensal" && a.proximo_vencimento && a.status !== "cancelada"
      ? ([["Próximo vencimento", dataLonga(a.proximo_vencimento)]] as [string, string][])
      : []),
  ];

  return (
    <section
      aria-label="Sua assinatura"
      className="flex flex-col gap-5 rounded-md border border-linha bg-areia p-6"
    >
      {a.status === "atrasada" && (
        <div role="status" className="rounded-md border-2 border-guara bg-louca p-4">
          <p className="font-bold">A mensalidade venceu</p>
          <p className="mt-1 text-ink-suave">
            Pague até {dataLonga(a.pro_ate!)} para não perder o Pro (são {TOLERANCIA_DIAS} dias de
            tolerância).
          </p>
        </div>
      )}
      {a.status === "cancelada" && (
        <p role="status" className="rounded-md bg-louca p-4">
          Assinatura cancelada. O Pro continua até {dataLonga(a.pro_ate!)} e não haverá novas
          cobranças.
        </p>
      )}
      <dl className="grid gap-4 sm:grid-cols-3">
        {linhas.map(([r, v]) => (
          <div key={r}>
            <dt className="text-rotulo text-ink-suave">{r}</dt>
            <dd className="font-bold">{v}</dd>
          </div>
        ))}
      </dl>
      {pixEmAberto && pagarPix && (
        <div className="rounded-md border-2 border-cobalto bg-louca p-6">
          <PixNaTela linkFatura={a.link_pagamento} />
        </div>
      )}
      {(pixEmAberto ||
        (a.plano === "mensal" && (a.status === "ativa" || a.status === "atrasada"))) && (
        <div className="flex flex-wrap gap-3">
          {pixEmAberto && !pagarPix && (
            <Botao onClick={() => setPagarPix(true)}>Pagar a próxima mensalidade no Pix</Botao>
          )}
          {a.plano === "mensal" && (a.status === "ativa" || a.status === "atrasada") && (
            <CancelarAssinatura
              proAte={a.pro_ate!}
              aoCancelar={() => void queryClient.invalidateQueries({ queryKey: ["plano"] })}
            />
          )}
        </div>
      )}
    </section>
  );
}

function CancelarAssinatura({ proAte, aoCancelar }: { proAte: string; aoCancelar: () => void }) {
  const [aberto, setAberto] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  async function confirmar() {
    setOcupado(true);
    try {
      await cancelarAssinatura();
      toast.success("Assinatura cancelada. O Pro continua até o fim do período pago.");
      setAberto(false);
      aoCancelar();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setOcupado(false);
    }
  }
  return (
    <AlertDialog open={aberto} onOpenChange={(v) => !ocupado && setAberto(v)}>
      <AlertDialogTrigger className={cn(botao({ variante: "fantasma" }), "text-guara")}>
        Cancelar assinatura
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-md border-linha bg-louca text-ink">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-t3">Cancelar o Pro?</AlertDialogTitle>
          <AlertDialogDescription className="text-base text-ink-suave">
            Não haverá novas cobranças. O Pro (estatísticas e selo) continua até {dataLonga(proAte)}
            ; depois, a conta volta para o Gratuito.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-3">
          <AlertDialogCancel
            disabled={ocupado}
            className={cn(botao({ variante: "secundario" }), "mt-0")}
          >
            Manter o Pro
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={ocupado}
            onClick={(e) => {
              e.preventDefault();
              void confirmar();
            }}
            className={cn(botao(), "bg-guara hover:bg-guara/90")}
          >
            {ocupado ? "Cancelando…" : "Cancelar assinatura"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function AguardandoPagamento({ assinatura: a }: { assinatura: Assinatura }) {
  if (a.forma === "pix")
    return (
      <section
        aria-labelledby="titulo-pix"
        className="flex flex-col gap-5 rounded-md border-2 border-cobalto bg-louca p-6 md:p-8"
      >
        <div className="flex flex-col gap-1">
          <h2 id="titulo-pix" className="text-t2">
            Pague com Pix
          </h2>
          <p className="text-ink-suave">
            {a.plano === "anual" ? "Pro anual" : "Pro mensal"}. Para trocar o plano ou a forma de
            pagamento, escolha um card abaixo.
          </p>
        </div>
        <PixNaTela linkFatura={a.link_pagamento} />
      </section>
    );
  return (
    <section
      role="status"
      className="flex flex-col gap-4 rounded-md border-2 border-cobalto bg-louca p-6"
    >
      <h2 className="text-t3">Aguardando o pagamento</h2>
      <p className="medida text-ink-suave">
        A fatura do Asaas abre em outra aba. Depois de pagar com o cartão, pode fechar aquela aba: a
        confirmação costuma levar até alguns minutos e esta tela atualiza sozinha. Para trocar o
        plano ou a forma de pagamento, escolha um card abaixo.
      </p>
      {a.link_pagamento && (
        <a
          href={a.link_pagamento}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(botao({ tamanho: "lg" }), "self-start")}
        >
          Abrir a fatura <ExternalLink aria-hidden />
        </a>
      )}
    </section>
  );
}

type Erros = Partial<Record<"nome" | "cpfCnpj", string>>;

function FormularioAssinatura({
  plano,
  assinatura: a,
  email,
  renovacao,
  aoCriarCobranca,
}: {
  plano: PlanoPago;
  assinatura: Assinatura | null;
  email: string;
  renovacao: boolean;
  aoCriarCobranca: () => void;
}) {
  const [forma, setForma] = useState<"pix" | "cartao">("pix");
  const [parcelas, setParcelas] = useState(1);
  const [nome, setNome] = useState(a?.nome_fiscal ?? "");
  const [cpfCnpj, setCpfCnpj] = useState(a?.cpf_cnpj ? mascararCpfCnpj(a.cpf_cnpj) : "");
  const [erros, setErros] = useState<Erros>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const titulo = useRef<HTMLHeadingElement>(null);
  const formaFinal = plano === "anual" ? "cartao" : forma;
  const opcoes = opcoesParcelamento();
  const escolhida = opcoes[parcelas - 1]!;

  // ao escolher um card, leva a pessoa até o pagamento (no celular os cards ocupam a tela)
  useEffect(() => {
    titulo.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    titulo.current?.focus({ preventScroll: true });
  }, []);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const novos: Erros = {
      ...(nome.trim().length < 3 ? { nome: "Informe o nome completo ou a razão social." } : {}),
      ...(!cpfCnpjValido(cpfCnpj) ? { cpfCnpj: "Confira o CPF ou o CNPJ." } : {}),
    };
    setErros(novos);
    setErroGeral(null);
    if (Object.keys(novos).length) return focarPrimeiroErro();
    setEnviando(true);
    // Pix: o QR Code aparece aqui mesmo. Cartão: a fatura do Asaas abre em outra aba e esta
    // fica esperando a confirmação (a aba é aberta já no clique, senão o navegador bloqueia).
    const aba = formaFinal === "cartao" ? window.open("", "_blank") : null;
    try {
      const url = await assinar({
        plano,
        forma: formaFinal,
        ...(plano === "anual" ? { parcelas } : {}),
        nome: nome.trim(),
        cpfCnpj: cpfCnpj.replace(/\D/g, ""),
      });
      if (formaFinal === "pix") aoCriarCobranca();
      else if (aba) {
        aba.opener = null;
        aba.location.href = url;
        aoCriarCobranca();
      } else window.location.assign(url);
    } catch (err) {
      aba?.close();
      setErroGeral((err as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form
      onSubmit={enviar}
      noValidate
      className="flex scroll-mt-24 flex-col gap-8 rounded-md border-2 border-cobalto p-6 md:p-8"
    >
      <h2 ref={titulo} tabIndex={-1} className="scroll-mt-24 text-t2 outline-none">
        {renovacao ? "Renovar o anual" : plano === "mensal" ? "Pro mensal" : "Pro anual"}
      </h2>
      {erroGeral && <CaixaErro>{erroGeral}</CaixaErro>}
      {plano === "mensal" ? (
        <GrupoOpcoes
          id="forma"
          rotulo="Forma de pagamento"
          opcoes={[
            { valor: "pix", rotulo: "Pix", detalhe: "Você paga cada mês pelo QR Code" },
            { valor: "cartao", rotulo: "Cartão de crédito", detalhe: "Cobrado sozinho todo mês" },
          ]}
          valor={forma}
          aoMudar={setForma}
          className="sm:grid-cols-2"
        />
      ) : (
        <div className="flex flex-col gap-2">
          <Rotulo id="parcelas" rotulo="Parcelas no cartão" />
          <select
            id="parcelas"
            value={parcelas}
            onChange={(e) => setParcelas(Number(e.target.value))}
            className={cn(classeCampo, "appearance-auto")}
          >
            {opcoes.map((o) => (
              <option key={o.vezes} value={o.vezes}>
                {o.vezes === 1
                  ? `À vista: ${reais(o.total)}`
                  : `${o.vezes}x de ${reais(o.parcela)} (total ${reais(o.total)})`}
              </option>
            ))}
          </select>
          <p className="text-legenda text-ink-suave">
            O anual é só no cartão. Parcelado tem juros; à vista sai por {reais(PRECO_ANUAL)}.
          </p>
        </div>
      )}

      <fieldset className="flex flex-col gap-5">
        <legend className="mb-1 text-t3">Dados para a cobrança e a nota fiscal</legend>
        <CampoTexto
          id="nome"
          rotulo="Nome completo ou razão social"
          valor={nome}
          aoMudar={setNome}
          erro={erros.nome}
          autoComplete="name"
          maxLength={120}
        />
        <CampoTexto
          id="cpfCnpj"
          rotulo="CPF ou CNPJ"
          valor={cpfCnpj}
          aoMudar={(v) => setCpfCnpj(mascararCpfCnpj(v))}
          erro={erros.cpfCnpj}
          inputMode="numeric"
          placeholder="000.000.000-00"
        />
        <p className="text-legenda text-ink-suave">
          A cobrança e a nota vão para {email}. O Asaas exige CPF ou CNPJ para cobrar.
        </p>
      </fieldset>

      <div className="flex flex-col gap-3 border-t border-linha pt-6">
        <p className="font-bold">
          Total:{" "}
          {plano === "mensal"
            ? `${reais(PRECO_MENSAL)} por mês`
            : escolhida.vezes === 1
              ? reais(escolhida.total)
              : `${escolhida.vezes}x de ${reais(escolhida.parcela)} (${reais(escolhida.total)})`}
        </p>
        <Botao
          type="submit"
          tamanho="lg"
          disabled={enviando}
          className="w-full sm:w-auto sm:self-start"
        >
          {enviando
            ? "Preparando o pagamento…"
            : formaFinal === "pix"
              ? "Gerar o Pix"
              : "Ir para o pagamento"}
        </Botao>
        <p className="flex items-center gap-2 text-legenda text-ink-suave">
          <Lock className="size-4" aria-hidden />
          {formaFinal === "pix"
            ? "O QR Code do Pix aparece aqui mesmo. Pagamento processado pelo Asaas."
            : "O cartão é pago numa aba do Asaas, página segura. O Azulejo não vê os dados do seu cartão."}
        </p>
      </div>
    </form>
  );
}
