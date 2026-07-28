import * as React from "react";

export type SubscriptionStepId = "terms" | "form" | "review";

const STEPS: {
  id: SubscriptionStepId;
  label: string;
  shortLabel: string;
}[] = [
  { id: "terms", label: "Termos", shortLabel: "Termos" },
  { id: "form", label: "Dados", shortLabel: "Dados" },
  { id: "review", label: "Pagamento", shortLabel: "Pagar" },
];

type SubscriptionProgressProps = {
  current: SubscriptionStepId;
};

export function SubscriptionProgress({ current }: SubscriptionProgressProps) {
  const currentIndex = STEPS.findIndex((step) => step.id === current);

  return (
    <nav aria-label="Progresso da inscrição" className="mb-8">
      <p className="sr-only">
        Etapa {currentIndex + 1} de {STEPS.length}: {STEPS[currentIndex]?.label}
      </p>
      <ol className="flex items-center gap-2 sm:gap-3">
        {STEPS.map((step, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = step.id === current;
          const statusLabel = isComplete
            ? "concluído"
            : isCurrent
              ? "etapa atual"
              : "pendente";

          return (
            <li
              key={step.id}
              className="flex min-w-0 flex-1 items-center gap-2"
              aria-current={isCurrent ? "step" : undefined}
            >
              <span
                className={[
                  "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                  isComplete
                    ? "bg-emerald-600 text-white"
                    : isCurrent
                      ? "bg-primary text-white"
                      : "bg-slate-200 text-slate-600",
                ].join(" ")}
                aria-hidden
              >
                {isComplete ? "✓" : index + 1}
              </span>
              <span
                className={[
                  "min-w-0 text-sm font-medium",
                  isCurrent ? "text-slate-900" : "text-slate-500",
                ].join(" ")}
              >
                <span className="sr-only">
                  {step.label}, {statusLabel}.{" "}
                </span>
                <span aria-hidden className="sm:hidden">
                  {step.shortLabel}
                </span>
                <span aria-hidden className="hidden truncate sm:inline">
                  {step.label}
                </span>
              </span>
              {index < STEPS.length - 1 ? (
                <span
                  className="hidden h-px flex-1 bg-slate-200 sm:block"
                  aria-hidden
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
