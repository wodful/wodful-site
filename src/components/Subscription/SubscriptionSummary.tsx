import * as React from "react";
import { Ticket } from "../../models/EventResponse";
import { formatPriceBRL } from "../../utils/formatPrice";
import { Button } from "../ui/Button";

type DiscountInfo = {
  original: number;
  final: number;
  discountAmount: number;
  type: string;
  value: number;
};

type SubscriptionSummaryProps = {
  ticket: Ticket;
  discounted: DiscountInfo | null;
  discountBadgeText: string | null;
  ticketPriceNumber: number;
  canSubmit: boolean;
  submitLabel?: string;
  helperText?: string;
  loading?: boolean;
  onContinue?: () => void;
  showSubmit?: boolean;
  /** Cupom / conteúdo extra acima do CTA */
  couponSlot?: React.ReactNode;
  /** Exibe barra fixa de CTA no mobile */
  stickyMobileCta?: boolean;
};

export const SubscriptionSummary = ({
  ticket,
  discounted,
  discountBadgeText,
  ticketPriceNumber,
  canSubmit,
  submitLabel = "Continuar",
  helperText,
  loading = false,
  onContinue,
  showSubmit = true,
  couponSlot,
  stickyMobileCta = false,
}: SubscriptionSummaryProps) => {
  const isFree = discounted ? discounted.final <= 0 : ticketPriceNumber <= 0;
  const displayPrice = discounted ? discounted.final : ticketPriceNumber;

  const submitButton = showSubmit ? (
    <Button
      type={onContinue ? "button" : "submit"}
      disabled={!canSubmit || loading}
      className="!w-full"
      onClick={onContinue}
    >
      {loading ? "Processando…" : submitLabel}
    </Button>
  ) : null;

  const helper = helperText ? (
    <p className="text-center text-xs leading-relaxed text-gray-500">
      {helperText}
    </p>
  ) : (
    <p className="text-center text-xs leading-relaxed text-gray-500">
      {isFree
        ? "Inscrição gratuita — confirmação imediata após revisão."
        : "A inscrição só é confirmada após a aprovação do pagamento."}
    </p>
  );

  return (
    <>
      <aside
        className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-lg shadow-gray-900/5"
        aria-labelledby="resumo-inscricao-heading"
      >
        <div className="border-b border-gray-100 bg-gray-50 px-5 py-4">
          <h2
            id="resumo-inscricao-heading"
            className="text-base font-semibold text-gray-900"
          >
            Resumo da inscrição
          </h2>
        </div>

        <div className="p-4 sm:p-5">
          <article className="rounded-xl border border-gray-200/80 bg-white p-4">
            <p className="font-semibold leading-snug text-gray-900">
              {ticket.name}
            </p>
            {ticket.description ? (
              <p className="mt-1 text-sm leading-relaxed text-gray-500">
                {ticket.description}
              </p>
            ) : (
              <p className="mt-1 text-sm text-gray-500">Valor único</p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {discounted ? (
                <>
                  <span className="text-sm font-semibold text-gray-500 line-through tabular-nums">
                    {formatPriceBRL(discounted.original)}
                  </span>
                  <span className="text-xl font-bold tabular-nums text-emerald-600">
                    {formatPriceBRL(discounted.final)}
                  </span>
                  {discountBadgeText ? (
                    <span className="inline-flex h-[22px] items-center rounded-full bg-emerald-500/10 px-2 text-xs font-bold text-emerald-600">
                      {discountBadgeText}
                    </span>
                  ) : null}
                </>
              ) : (
                <span className="text-xl font-bold tabular-nums text-gray-900">
                  {formatPriceBRL(ticketPriceNumber)}
                </span>
              )}
            </div>
          </article>

          {couponSlot ? <div className="mt-4">{couponSlot}</div> : null}

          {showSubmit ? (
            <div
              className={`mt-5 space-y-3 ${stickyMobileCta ? "hidden lg:block" : ""}`}
            >
              {submitButton}
              {helper}
            </div>
          ) : helperText || !showSubmit ? (
            <div className="mt-3">{helper}</div>
          ) : null}
        </div>
      </aside>

      {stickyMobileCta && showSubmit ? (
        <div
          className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 p-3 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          <div className="mx-auto flex max-w-lg items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-gray-500">{ticket.name}</p>
              <p className="text-base font-bold tabular-nums text-gray-900">
                {formatPriceBRL(displayPrice)}
              </p>
            </div>
            <Button
              type={onContinue ? "button" : "submit"}
              disabled={!canSubmit || loading}
              className="!w-auto shrink-0 !px-4"
              onClick={onContinue}
            >
              {loading ? "…" : submitLabel}
            </Button>
          </div>
        </div>
      ) : null}
    </>
  );
};
