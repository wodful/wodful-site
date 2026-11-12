import { navigate } from "gatsby";
import * as React from "react";
import { Ticket } from "../../../models/EventResponse";
import { formatPriceBRL } from "../../../utils/formatPrice";

interface SubscriptionChoiceProps {
  tickets?: Ticket[];
  accessCode: string;
  isFinished?: boolean;
}

function categoryBadge(ticket: Ticket): string | null {
  const isTeam =
    ticket.category.isTeam === "true" ||
    ticket.category.isTeam === "1" ||
    ticket.category.isTeam === "yes";

  if (!isTeam) return null;

  const members = Number(ticket.category.members);
  if (members > 1) return `Time · ${members} atletas`;
  return "Dupla";
}

type TicketRowProps = {
  ticket: Ticket;
  onSelect: (ticket: Ticket) => void;
};

function TicketRow({ ticket, onSelect }: TicketRowProps) {
  const badge = categoryBadge(ticket);
  const showFee =
    Boolean(ticket.passFeeToAthlete) && Number(ticket.athleteFeeAmount) > 0;

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(ticket)}
        className="group flex w-full min-h-[4.5rem] flex-col rounded-xl border border-gray-200/80 bg-white px-4 py-4 text-left shadow-sm transition hover:border-primary/40 hover:bg-primary/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.99]"
      >
        <span className="flex w-full items-center gap-4">
          <span className="min-w-0 flex-1">
            <span className="block font-semibold leading-snug text-gray-900">
              {ticket.name}
            </span>
            {ticket.description ? (
              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                {ticket.description}
              </span>
            ) : null}
            {badge ? (
              <span className="mt-2 inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-gray-600">
                {badge}
              </span>
            ) : null}
          </span>
          <span className="flex shrink-0 flex-col items-end gap-0.5">
            <span className="text-lg font-bold tabular-nums text-gray-900">
              {formatPriceBRL(
                showFee ? (ticket.athleteTotal ?? ticket.price) : ticket.price
              )}
            </span>
            <span className="text-xs font-medium text-primary opacity-80 transition group-hover:opacity-100">
              Selecionar →
            </span>
          </span>
        </span>
        {showFee ? (
          <span className="mt-2 block w-full text-right text-xs tabular-nums leading-snug text-gray-500">
            {formatPriceBRL(ticket.inscriptionAmount ?? ticket.price)} +{" "}
            {formatPriceBRL(ticket.athleteFeeAmount ?? 0)} taxa
          </span>
        ) : null}
      </button>
    </li>
  );
}

export const SubscriptionChoice = ({
  tickets,
  accessCode,
  isFinished,
}: SubscriptionChoiceProps) => {
  const handleSelect = (ticket: Ticket) => {
    localStorage.setItem("@Wodful:ticket", JSON.stringify(ticket.id));
    navigate(`/subscription/${accessCode}/`);
  };

  return (
    <aside
      className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-lg shadow-gray-900/5"
      aria-labelledby="inscricoes-heading"
    >
      <div className="border-b border-gray-100 bg-gray-50 px-5 py-4">
        <h2
          id="inscricoes-heading"
          className="text-base font-semibold text-gray-900"
        >
          Inscrições
        </h2>
        {!isFinished && tickets && tickets.length > 0 ? (
          <p className="mt-1 text-sm text-gray-500">
            {tickets.length}{" "}
            {tickets.length === 1 ? "opção disponível" : "opções disponíveis"}
          </p>
        ) : null}
      </div>

      <div className="p-4 sm:p-5">
        {isFinished ? (
          <div
            className="rounded-xl border border-red-100 bg-red-50/80 px-4 py-5 text-center"
            role="status"
          >
            <p className="font-semibold text-red-800">Inscrições encerradas</p>
            <p className="mt-1 text-sm text-red-700/90">
              Este evento não aceita novas inscrições.
            </p>
          </div>
        ) : tickets && tickets.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {tickets.map((ticket) => (
              <TicketRow
                key={ticket.id}
                ticket={ticket}
                onSelect={handleSelect}
              />
            ))}
          </ul>
        ) : (
          <div
            className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center"
            role="status"
          >
            <p className="font-medium text-gray-800">Nenhum ingresso disponível</p>
            <p className="mt-1 text-sm text-gray-500">
              O organizador ainda não liberou categorias para inscrição.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};
