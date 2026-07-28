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
}: SubscriptionSummaryProps) => {
  const isFree = discounted ? discounted.final <= 0 : ticketPriceNumber <= 0;

  return (
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
          <p className="font-semibold leading-snug text-gray-900">{ticket.name}</p>
          {ticket.description ? (
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              {ticket.description}
            </p>
          ) : null}

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

        {showSubmit ? (
          <Button
            type={onContinue ? "button" : "submit"}
            disabled={!canSubmit || loading}
            className="mt-5 !w-full"
            onClick={onContinue}
          >
            {loading ? "Processando…" : submitLabel}
          </Button>
        ) : null}

        {helperText ? (
          <p className="mt-3 text-center text-xs leading-relaxed text-gray-500">
            {helperText}
          </p>
        ) : (
          <p className="mt-3 text-center text-xs leading-relaxed text-gray-500">
            {isFree
              ? "Inscrição gratuita — confirmação imediata após revisão."
              : "A inscrição só é confirmada após a aprovação do pagamento."}
          </p>
        )}
      </div>
    </aside>
  );
};
