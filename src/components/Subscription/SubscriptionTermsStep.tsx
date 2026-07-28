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

      <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-slate-50 p-4">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(event) => onAcceptedChange(event.target.checked)}
          className="mt-1 size-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
        <span className="text-sm leading-relaxed text-gray-800">
          Li e aceito a Política de Privacidade e autorizo o tratamento dos meus
          dados para esta inscrição, incluindo repasse ao Mercado Pago para
          pagamento.
        </span>
      </label>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button type="button" variant="ghost" className="!border-gray-200 !text-gray-700" onClick={onBack}>
          Voltar ao evento
        </Button>
        <Button type="button" disabled={!accepted} onClick={onContinue}>
          Continuar
        </Button>
      </div>
    </section>
  );
}
