import * as React from "react";
import {
  CURRENT_PRIVACY_POLICY_VERSION,
  PRIVACY_POLICY_BULLETS,
  PRIVACY_POLICY_INTRO,
} from "../../constants/privacyPolicy";
import { Button } from "../ui/Button";

type SubscriptionTermsStepProps = {
  accepted: boolean;
  onAcceptedChange: (value: boolean) => void;
  onContinue: () => void;
  onBack: () => void;
};

export function SubscriptionTermsStep({
  accepted,
  onAcceptedChange,
  onContinue,
  onBack,
}: SubscriptionTermsStepProps) {
  const [showError, setShowError] = React.useState(false);
  const checkboxRef = React.useRef<HTMLInputElement>(null);
  const cardRef = React.useRef<HTMLLabelElement>(null);

  React.useEffect(() => {
    if (accepted) setShowError(false);
  }, [accepted]);

  const handleContinue = () => {
    if (!accepted) {
      setShowError(true);
      cardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      checkboxRef.current?.focus();
      return;
    }
    onContinue();
  };

  return (
    <section className="mx-auto max-w-2xl rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-xl font-bold text-gray-900">Privacidade e termos</h2>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">
        {PRIVACY_POLICY_INTRO}
      </p>

      <ul className="mt-5 space-y-3 text-sm leading-relaxed text-gray-700">
        {PRIVACY_POLICY_BULLETS.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <p className="mt-5 text-xs text-gray-500">
        Versão da política: {CURRENT_PRIVACY_POLICY_VERSION}
      </p>

      <label
        ref={cardRef}
        className={[
          "mt-6 flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition",
          showError
            ? "border-red-500 bg-red-50 ring-2 ring-red-500/40"
            : "border-gray-200 bg-slate-50",
        ].join(" ")}
      >
        <input
          ref={checkboxRef}
          type="checkbox"
          checked={accepted}
          onChange={(event) => onAcceptedChange(event.target.checked)}
          aria-invalid={showError || undefined}
          aria-describedby={showError ? "terms-accept-error" : undefined}
          className={[
            "mt-1 size-4 rounded text-primary focus:ring-primary",
            showError ? "border-red-500" : "border-gray-300",
          ].join(" ")}
        />
        <span className="text-sm leading-relaxed text-gray-800">
          Li e aceito a Política de Privacidade e autorizo o tratamento dos meus
          dados para esta inscrição, incluindo repasse ao Mercado Pago para
          pagamento.
        </span>
      </label>

      {showError ? (
        <p
          id="terms-accept-error"
          className="mt-2 text-sm font-medium text-red-600"
          role="alert"
        >
          Marque a opção acima para continuar.
        </p>
      ) : null}

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button
          type="button"
          variant="ghost"
          className="!border-gray-200 !text-gray-700"
          onClick={onBack}
        >
          Voltar ao evento
        </Button>
        <Button type="button" onClick={handleContinue}>
          Continuar
        </Button>
      </div>
    </section>
  );
}
