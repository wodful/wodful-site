import { navigate } from "gatsby";
import * as React from "react";
import { WHATSAPP_NUMBER } from "../../constants/whatsapp";
import { SubscriptionService } from "../../services/subscription";
import { LottiePlayer } from "../LottiePlayer";
import { Button } from "../ui/Button";
import { Container } from "../ui/Container";

type ReturnStatus = "success" | "pending" | "failure";

interface SuccessProps {
  status?: ReturnStatus;
  accessCode?: string;
  subscriptionId?: string;
  email?: string;
}

const LOTTIE_BY_STATUS: Record<ReturnStatus, string> = {
  success:
    "https://lottie.host/41a3108f-baaf-40eb-9c73-9043890130cb/I9hOxhavci.json",
  pending:
    "https://lottie.host/d76de692-2677-4679-9245-df44bdf74851/oK0dmlMmMt.json",
  failure:
    "https://lottie.host/938aaa0c-c767-4467-9d8d-518274fdfb6a/DNDJrpvTkh.json",
};

const content: Record<
  ReturnStatus,
  { badge: string; title: string; message: string; button: string }
> = {
  success: {
    badge: "Inscrição confirmada",
    title: "Pagamento confirmado!",
    message:
      "Sua inscrição foi concluída com sucesso e já está garantida. Fique de olho no seu e-mail para receber novidades sobre o evento.",
    button: "Voltar ao evento",
  },
  pending: {
    badge: "Aguardando confirmação",
    title: "Pagamento pendente",
    message:
      "Seu pagamento ainda não foi confirmado — a inscrição não está garantida. Assim que o Mercado Pago aprovar (PIX, boleto ou análise de cartão), você receberá a confirmação por e-mail.",
    button: "Voltar ao evento",
  },
  failure: {
    badge: "Pagamento não concluído",
    title: "Pagamento não aprovado",
    message:
      "Não foi possível concluir o pagamento. Sua inscrição não foi confirmada — você pode tentar novamente com o mesmo cadastro.",
    button: "Voltar ao evento",
  },
};

const badgeClasses: Record<ReturnStatus, string> = {
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200/80",
  pending: "bg-amber-50 text-amber-800 ring-amber-200/80",
  failure: "bg-red-50 text-red-700 ring-red-200/80",
};

function supportWhatsAppUrl() {
  const text = "Tive problemas no pagamento da inscrição, preciso de ajuda";
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

const subscriptionService = new SubscriptionService();

export const Success = ({
  status = "success",
  accessCode,
  subscriptionId,
  email,
}: SuccessProps) => {
  const { badge, title, message, button } = content[status];
  const backPath = accessCode ? `/event/${accessCode}/` : "/";
  const buttonLabel = accessCode ? button : "Voltar ao início";
  const [retryLoading, setRetryLoading] = React.useState(false);
  const [retryError, setRetryError] = React.useState<string | null>(null);

  const resolvedEmail =
    email ??
    (subscriptionId
      ? sessionStorage.getItem(`@Wodful:checkout:${subscriptionId}`)
      : null) ??
    undefined;

  const canRetry =
    (status === "failure" || status === "pending") &&
    subscriptionId &&
    resolvedEmail;

  async function handleRetryPayment() {
    if (!subscriptionId || !resolvedEmail) return;
    setRetryLoading(true);
    setRetryError(null);
    try {
      const result = await subscriptionService.retryPayment(
        subscriptionId,
        resolvedEmail
      );
      window.location.href = result.paymentUrl;
    } catch {
      setRetryError("Não foi possível gerar um novo link de pagamento.");
    } finally {
      setRetryLoading(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col bg-slate-50 text-gray-900">
      <Container className="flex flex-1 flex-col items-center justify-center py-10 sm:py-16">
        <div
          className="w-full max-w-md rounded-2xl border border-gray-200/80 bg-white p-6 shadow-lg shadow-gray-900/5 sm:p-8"
          role="status"
        >
          <div className="flex flex-col items-center text-center">
            <LottiePlayer
              src={LOTTIE_BY_STATUS[status]}
              style={{ height: "200px", width: "200px" }}
            />

            <span
              className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${badgeClasses[status]}`}
            >
              {badge}
            </span>

            <h1 className="mt-4 text-2xl font-bold text-gray-900">{title}</h1>
            <p className="mt-3 text-[15px] leading-relaxed text-gray-600">
              {message}
            </p>
          </div>

          <div className="mt-8 flex w-full flex-col gap-3">
            {canRetry ? (
              <Button
                type="button"
                disabled={retryLoading}
                onClick={handleRetryPayment}
                className="!w-full"
              >
                {retryLoading ? "Gerando link…" : "Tentar pagamento novamente"}
              </Button>
            ) : null}

            {retryError ? (
              <p className="text-center text-sm text-red-600" role="alert">
                {retryError}
              </p>
            ) : null}

            <Button
              type="button"
              variant="ghost"
              className="!w-full !border-gray-200 !text-gray-700"
              onClick={() => navigate(backPath)}
            >
              {buttonLabel}
            </Button>

            {status === "failure" ? (
              <a
                href={supportWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="text-center text-sm font-medium text-primary hover:underline"
              >
                Preciso de ajuda
              </a>
            ) : null}
          </div>
        </div>
      </Container>
    </div>
  );
};
