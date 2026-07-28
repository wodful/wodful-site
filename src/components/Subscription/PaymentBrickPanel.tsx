import * as React from "react";
import { initMercadoPago, Payment, StatusScreen } from "@mercadopago/sdk-react";
import { PaymentsService } from "../../services/payments";
import { CheckoutHoldTimer } from "./CheckoutHoldTimer";

type BrickCheckoutSession = {
  subscriptionId: string;
  paymentId: string;
  preferenceId: string;
  amountFinal: number;
  publicKey: string;
  accessCode: string;
  payerEmail: string;
  expiresAt: string;
};

type PaymentBrickPanelProps = {
  session: BrickCheckoutSession;
  onApproved: (subscriptionId: string) => void;
  onPending: (subscriptionId: string) => void;
  onRejected: (message?: string) => void;
  onHoldExpired: () => void;
};

const paymentsService = new PaymentsService();

export function PaymentBrickPanel({
  session,
  onApproved,
  onPending,
  onRejected,
  onHoldExpired,
}: PaymentBrickPanelProps) {
  const [ready, setReady] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [holdExpired, setHoldExpired] = React.useState(false);
  /** Mercado Pago payment id — when set, show Status Screen (PIX QR / aguardando) */
  const [mpPaymentId, setMpPaymentId] = React.useState<string | null>(null);
  const initializedKey = React.useRef<string | null>(null);

  const handleHoldExpired = React.useCallback(() => {
    setHoldExpired(true);
    onHoldExpired();
  }, [onHoldExpired]);

  React.useEffect(() => {
    setHoldExpired(false);
    setMpPaymentId(null);
  }, [session.paymentId, session.expiresAt]);

  React.useEffect(() => {
    if (!session.publicKey) {
      setError("Chave pública do Mercado Pago não configurada");
      return;
    }
    if (initializedKey.current === session.publicKey) return;
    initMercadoPago(session.publicKey, { locale: "pt-BR" });
    initializedKey.current = session.publicKey;
  }, [session.publicKey]);

  const customization = React.useMemo(
    () => ({
      paymentMethods: {
        creditCard: "all" as const,
        debitCard: "all" as const,
        bankTransfer: "all" as const,
        maxInstallments: 12,
      },
    }),
    []
  );

  const initialization = React.useMemo(
    () => ({
      amount: session.amountFinal,
      payer: {
        email: session.payerEmail,
      },
    }),
    [session.amountFinal, session.payerEmail]
  );

  const successUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/subscription-success?status=success&accessCode=${encodeURIComponent(
          session.accessCode
        )}&subscriptionId=${encodeURIComponent(session.subscriptionId)}`
      : undefined;

  if (!session.publicKey) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Pagamento embutido indisponível: configure MERCADO_PAGO_PUBLIC_KEY na API.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm sm:p-5">
      <h3 className="text-base font-semibold text-gray-900">
        {mpPaymentId ? "Conclua o pagamento" : "Pagamento"}
      </h3>
      <p className="mt-1 text-sm text-gray-600">
        {mpPaymentId
          ? "Escaneie o QR Code ou copie o código Pix. A inscrição só é confirmada após a aprovação."
          : "Pague com cartão ou PIX sem sair desta página. A inscrição só é confirmada após a aprovação."}
      </p>

      <div className="mt-4">
        <CheckoutHoldTimer
          expiresAt={session.expiresAt}
          onExpire={handleHoldExpired}
        />
      </div>

      {holdExpired ? (
        <p className="mt-4 text-sm text-red-700" role="alert">
          O tempo da reserva acabou. Revise os dados e inicie o pagamento
          novamente para garantir a vaga.
        </p>
      ) : null}

      {!ready && !holdExpired && !mpPaymentId ? (
        <p className="mt-4 text-sm text-gray-500" role="status">
          Carregando formas de pagamento…
        </p>
      ) : null}

      {error && !holdExpired ? (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      {!holdExpired && mpPaymentId ? (
        <div className="mp-payment-brick mt-4">
          <StatusScreen
            initialization={{ paymentId: mpPaymentId }}
            customization={{
              ...(successUrl
                ? {
                    backUrls: {
                      return: successUrl,
                    },
                  }
                : {}),
              visual: {
                hideStatusDetails: false,
                hideTransactionDate: true,
              },
            }}
            onReady={() => setReady(true)}
            onError={(err) => {
              setError(err?.message ?? "Erro ao exibir status do pagamento");
            }}
          />
          <p className="mt-3 text-center text-xs text-gray-500">
            Após pagar o Pix, a confirmação pode levar alguns segundos. Não feche
            esta página.
          </p>
        </div>
      ) : null}

      {!holdExpired && !mpPaymentId ? (
        <div className="mp-payment-brick mt-4">
          <Payment
            initialization={initialization}
            customization={customization}
            onReady={() => {
              setReady(true);
              setError(null);
            }}
            onError={(err) => {
              const message = err?.message ?? "Erro ao carregar o pagamento";
              setError(message);
              onRejected(message);
            }}
            onSubmit={async ({ formData }) => {
              setError(null);
              try {
                const result = await paymentsService.processBrickPayment({
                  paymentId: session.paymentId,
                  formData: formData as unknown as Record<string, unknown>,
                });

                if (result.status === "approved") {
                  onApproved(result.subscriptionId);
                  return result.providerPaymentId
                    ? { id: result.providerPaymentId }
                    : undefined;
                }

                if (result.status === "pending") {
                  if (!result.providerPaymentId) {
                    // Fallback: sem id do MP, mantém fluxo antigo
                    onPending(result.subscriptionId);
                    return;
                  }
                  // Fica na página e mostra QR / copia-e-cola via Status Screen
                  setMpPaymentId(result.providerPaymentId);
                  return { id: result.providerPaymentId };
                }

                onRejected(
                  "Pagamento não aprovado. Tente outra forma de pagamento."
                );
                throw new Error("Pagamento rejeitado");
              } catch (err) {
                const message =
                  err instanceof Error
                    ? err.message
                    : "Não foi possível processar o pagamento";
                setError(message);
                throw err;
              }
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
