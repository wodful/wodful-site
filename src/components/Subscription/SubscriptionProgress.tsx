import * as React from "react";

export type SubscriptionStepId = "terms" | "form" | "review";

const STEPS: { id: SubscriptionStepId; label: string }[] = [
  { id: "terms", label: "Termos" },
  { id: "form", label: "Dados" },
  { id: "review", label: "Pagamento" },
];

type SubscriptionProgressProps = {
  current: SubscriptionStepId;
};

export function SubscriptionProgress({ current }: SubscriptionProgressProps) {
  const currentIndex = STEPS.findIndex((step) => step.id === current);

  return (
    <nav aria-label="Progresso da inscrição" className="mb-8">
      <ol className="flex items-center gap-2 sm:gap-4">
        {STEPS.map((step, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = step.id === current;

          return (
            <li key={step.id} className="flex min-w-0 flex-1 items-center gap-2">
              <span
                className={[
                  "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                  isComplete
                    ? "bg-emerald-600 text-white"
                    : isCurrent
                      ? "bg-primary text-white"
                      : "bg-slate-200 text-slate-600",
                ].join(" ")}
                aria-current={isCurrent ? "step" : undefined}
              >
                {isComplete ? "✓" : index + 1}
              </span>
              <span
                className={[
                  "truncate text-sm font-medium",
                  isCurrent ? "text-slate-900" : "text-slate-500",
                ].join(" ")}
              >
                {step.label}
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
