import * as React from "react";
import { initMercadoPago, Payment } from "@mercadopago/sdk-react";
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
  const initializedKey = React.useRef<string | null>(null);

  const handleHoldExpired = React.useCallback(() => {
    setHoldExpired(true);
    onHoldExpired();
  }, [onHoldExpired]);

  React.useEffect(() => {
    setHoldExpired(false);
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
        // Cartão + PIX only (PIX = bankTransfer no Brick BR)
        creditCard: "all" as const,
        debitCard: "all" as const,
        bankTransfer: "all" as const,
        maxInstallments: 12,
      },
    }),
    []
  );

  // Sem preferenceId: evita "Failed to get preference details".
  // Preference só é necessária para Wallet (conta Mercado Pago).
  const initialization = React.useMemo(
    () => ({
      amount: session.amountFinal,
      payer: {
        email: session.payerEmail,
      },
    }),
    [session.amountFinal, session.payerEmail]
  );

  if (!session.publicKey) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Pagamento embutido indisponível: configure MERCADO_PAGO_PUBLIC_KEY na API.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm sm:p-5">
      <h3 className="text-base font-semibold text-gray-900">Pagamento</h3>
      <p className="mt-1 text-sm text-gray-600">
        Pague com cartão ou PIX sem sair desta página. A inscrição só é
        confirmada após a aprovação.
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

      {!ready && !holdExpired ? (
        <p className="mt-4 text-sm text-gray-500" role="status">
          Carregando formas de pagamento…
        </p>
      ) : null}

      {error && !holdExpired ? (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      {!holdExpired ? (
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
                return;
              }
              if (result.status === "pending") {
                onPending(result.subscriptionId);
                return;
              }
              onRejected("Pagamento não aprovado. Tente outra forma de pagamento.");
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
