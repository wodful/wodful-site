import { navigate } from "gatsby";
import * as React from "react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { SUBSCRIPTION_MAX_WIDTH_CLASS } from "../../constants/eventBanner";
import ArrowRight from "../../images/arrow-right.svg";
import Calendar from "../../images/calendar-black.svg";
import MapPin from "../../images/map-pin.svg";
import {
  EventResponse,
  Ticket,
  TshirtSizeResponse,
} from "../../models/EventResponse";
import { IParticipantForm } from "../../models/ParticipantDTO";
import { EventService } from "../../services/events";
import { ParticipantsService } from "../../services/participants";
import type { ValidateCouponResponse } from "../../services/payments";
import { SubscriptionService } from "../../services/subscription";
import { isValidDocument, regexOnlyNumber } from "../../utils";
import { formatPriceBRL } from "../../utils/formatPrice";
import { Combobox } from "../ui/Combobox";
import { Container } from "../ui/Container";
import { fieldInputClass, FormField } from "../ui/FormField";
import {
  SubscriptionProgress,
  type SubscriptionStepId,
} from "./SubscriptionProgress";
import { SubscriptionSkeleton } from "./SubscriptionSkeleton";
import { SubscriptionSummary } from "./SubscriptionSummary";
import { SubscriptionTermsStep } from "./SubscriptionTermsStep";

function normalizeAffiliation(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function resolveAffiliation(value: string, options: string[]) {
  const normalized = normalizeAffiliation(value);
  if (!normalized) return normalized;
  const match = options.find(
    (option) => option.toLowerCase() === normalized.toLowerCase()
  );
  return match ?? normalized;
}
type ISubscriptionData = {
  accessCode: string;
};

type IGetParticipantsRequest = {
  type: "nickname" | "code";
  search: string;
  index?: number;
} & ISubscriptionData;

const subscriptionService = new SubscriptionService();

const Validation = {
  invalidEmpty: "Campo obrigatório",
  invalid: "Valor inválido",
  invalidSM: "Mínimo 1 caracteres",
  invalidLG: "Máximo 50 caracteres",
};

export const SubscriptionData = ({ accessCode }: ISubscriptionData) => {
  const [event, setEvent] = useState<EventResponse>();
  const [ticket, setTicket] = useState<Ticket>();
  const [indexes, setIndexes] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [affiliations, setAffiliations] = useState<string[]>([]);
  const [tshirtConfigs, setTshirtConfigs] = useState<TshirtSizeResponse>(
    {} as TshirtSizeResponse
  );
  const [step, setStep] = useState<SubscriptionStepId>("terms");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [pendingSubmission, setPendingSubmission] = useState<
    (IParticipantForm & { couponCode?: string; ticketId: string }) | null
  >(null);

  const {
    register,
    setValue,
    handleSubmit,
    setError,
    watch,
    control,
    formState: { errors, isValid },
  } = useForm<IParticipantForm & { couponCode?: string }>({
    mode: "all",
  });

  const [fake_field, setFakeField] = React.useState("");

  const canSubmit = !fake_field && isValid;

  const getEvent = React.useCallback(
    async (access: string, ticketId: string) => {
      setIsLoading(true);
      await new EventService()
        .getEvent(access)
        .then((eventResponse: EventResponse) => {
          if (eventResponse.isFinished) {
            navigate(`/event/${eventResponse.accessCode}`);
            return;
          }
          setIndexes([]);
          let singleTicket = eventResponse.tickets.find(
            (ticket: Ticket) => ticket.id === ticketId
          );
          setEvent(eventResponse);
          setTicket(singleTicket);
          for (let index = 0; index < singleTicket!.category.members; index++) {
            setIndexes((indexes) => [...indexes, index]);
          }
        })
        .catch(() => navigate("/404"))
        .finally(() => setIsLoading(false));
    },
    []
  );

  const getEventTshirt = React.useCallback(async (access: string) => {
    setIsLoading(true);
    await new EventService()
      .getEventTshirts(access)
      .then((tshirtconfig: TshirtSizeResponse) =>
        setTshirtConfigs(tshirtconfig)
      )
      .finally(() => setIsLoading(false));
  }, []);

  const getEventAffiliations = React.useCallback(async (access: string) => {
    await new EventService()
      .getEventAffiliations(access)
      .then(setAffiliations)
      .catch(() => setAffiliations([]));
  }, []);

  const getParticipant = React.useCallback(
    async ({ accessCode, search, type, index }: IGetParticipantsRequest) => {
      if (search && type === "code") {
        await new ParticipantsService()
          .getParticipantByCode({ accessCode, search })
          .catch(() =>
            setError(`participants.${index!}.identificationCode`, {
              message: "Documento já cadastrado",
            })
          );
      }

      if (search && type === "nickname") {
        await new ParticipantsService()
          .getParticipantByNickname({ accessCode, search, ticket: ticket?.id })
          .catch(() =>
            setError("nickname", { message: "Nome ou apelido já cadastrado" })
          );
      }
    },
    [ticket]
  );

  const couponCode = watch('couponCode');
  const [couponValidation, setCouponValidation] = React.useState<{
    status: "idle" | "loading" | "valid" | "invalid";
    message?: string;
    result?: ValidateCouponResponse;
  }>({ status: "idle" });

  const applyCoupon = React.useCallback(async () => {
    const code = (couponCode || "").trim().toUpperCase();
    if (!code || !ticket?.id) return;

    try {
      const { PaymentsService } = await import("../../services/payments");
      const paymentsService = new PaymentsService();

      setCouponValidation({ status: "loading" });
      const result = await paymentsService.validateCoupon({
        ticketId: ticket.id,
        couponCode: code,
      });

      if (result.valid) {
        setValue("couponCode", result.coupon.code);
        setCouponValidation({
          status: "valid",
          result,
          message: "Cupom aplicado!",
        });
      } else {
        const reason = result.reason;
        const message =
          reason === "NOT_FOUND"
            ? "Cupom não encontrado!"
            : reason === "INACTIVE"
              ? "Cupom inativo!"
              : reason === "OUT_OF_WINDOW"
                ? "Cupom fora do período de validade!"
                : reason === "MAX_REDEMPTIONS_REACHED"
                  ? "Cupom esgotado!"
                  : "Cupom inválido.";

        setCouponValidation({ status: "invalid", result, message });
      }
    } catch {
      setCouponValidation({
        status: "invalid",
        message: "Não foi possível validar o cupom agora. Tente novamente.",
      });
    }
  }, [couponCode, ticket?.id, setValue]);

  const ticketPriceNumber = React.useMemo(() => {
    const raw: any = ticket?.price as any;
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  }, [ticket?.price]);

  const discounted = React.useMemo(() => {
    const r = couponValidation.result;
    if (couponValidation.status === "valid" && r && (r as any).valid) {
      const vr = r as Extract<ValidateCouponResponse, { valid: true }>;
      return {
        original: vr.amountOriginal,
        final: vr.amountFinal,
        discountAmount: vr.discountAmount,
        type: vr.coupon.type,
        value: vr.coupon.value,
      };
    }
    return null;
  }, [couponValidation.result, couponValidation.status]);

  const discountBadgeText = React.useMemo(() => {
    if (!discounted) return null;
    if (discounted.type === "PERCENTAGE") return `-${discounted.value}%`;
    return `-${formatPriceBRL(discounted.discountAmount)}`;
  }, [discounted]);

  const submitCheckout = React.useCallback(
    async (subscription: IParticipantForm & { couponCode?: string; ticketId: string }) => {
      setCheckoutLoading(true);
      setCheckoutError(null);
      try {
        const result = await subscriptionService.checkout(subscription);

        if (result.status === "confirmed") {
          navigate(
            `/subscription-success?status=success&accessCode=${accessCode}&subscriptionId=${result.subscriptionId}`
          );
          return;
        }

        sessionStorage.setItem(
          `@Wodful:checkout:${result.subscriptionId}`,
          subscription.responsibleEmail
        );

        window.location.href = result.paymentUrl;
      } catch {
        setCheckoutError(
          "Não foi possível iniciar o pagamento. Revise os dados e tente novamente."
        );
      } finally {
        setCheckoutLoading(false);
      }
    },
    [accessCode]
  );

  const onSubmit = (subscription: IParticipantForm) => {
    if (fake_field !== "") {
      console.error("it's a bot!");
      window.gtag("event", "click", {
        event_label: "bot_detected",
        content_type: "bot_detected_on_subscription",
        value: `bot_detected_on_subscription`,
        description: `bot_detected_on_subscription`,
      });
      return;
    }

    const subs: IParticipantForm & { couponCode?: string; ticketId: string } = {
      ...subscription,
      participants: subscription.participants.map((participant) => ({
        ...participant,
        identificationCode: regexOnlyNumber(participant.identificationCode),
        affiliation: resolveAffiliation(
          participant.affiliation ?? "",
          affiliations
        ),
        tShirtSize:
          tshirtConfigs.hasTshirt === "true"
            ? participant.tShirtSize
            : "Sem camiseta",
      })),
      ticketId: ticket!.id,
      couponCode: couponCode?.trim() || undefined,
    };

    setPendingSubmission(subs);
    setStep("review");
  };

  const handleConfirmCheckout = () => {
    if (!pendingSubmission) return;
    submitCheckout(pendingSubmission);
  };

  const formatPhone = (phoneNumber: string) => {
    phoneNumber = regexOnlyNumber(phoneNumber);
    setValue("responsiblePhone", phoneNumber);
  };

  const formatDocument = (document: string, index: number) => {
    document = regexOnlyNumber(document);
    setValue(`participants.${index}.identificationCode`, document);
  };

  useEffect(() => {
    const ticketStorage = localStorage.getItem("@Wodful:ticket");
    if (!ticketStorage) navigate(`/event/${accessCode}/`);
    getEvent(accessCode, ticketStorage!.replaceAll('"', ""));
    getEventTshirt(accessCode);
    getEventAffiliations(accessCode);
  }, [accessCode, getEvent, getEventTshirt, getEventAffiliations]);

  useEffect(() => {
    setCouponValidation({ status: "idle" });
  }, [couponCode, ticket?.id]);

  return (
    <>
      {!isLoading ? (
        <div className="min-h-screen bg-slate-50 text-gray-900">
          <Container className={`py-6 sm:py-10 ${SUBSCRIPTION_MAX_WIDTH_CLASS}`}>
            <SubscriptionProgress current={step} />

            {step === "terms" ? (
              <SubscriptionTermsStep
                accepted={termsAccepted}
                onAcceptedChange={setTermsAccepted}
                onContinue={() => setStep("form")}
                onBack={() => navigate(`/event/${accessCode}/`)}
              />
            ) : null}

            {step === "form" ? (
            <form onSubmit={handleSubmit(onSubmit)}>
              <input
                type="hidden"
                name="fake_field"
                value={fake_field}
                onChange={(e) => setFakeField(e.target.value)}
              />

              <button
                type="button"
                onClick={() => navigate(`/event/${accessCode}/`)}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition hover:text-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <img
                  src={ArrowRight}
                  alt=""
                  className="h-5 w-5 rotate-180"
                  aria-hidden
                />
                Voltar
              </button>

              <header className="mt-4 border-b border-gray-200/80 pb-6 sm:mt-6">
                <h1 className="text-2xl font-bold leading-tight tracking-tight text-gray-900 sm:text-3xl">
                  {event?.name}
                </h1>
                <ul className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-x-6">
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <img
                      src={Calendar}
                      alt=""
                      className="h-4 w-4 shrink-0 opacity-70"
                      aria-hidden
                    />
                    <span>
                      {event?.startDate} até {event?.endDate}
                    </span>
                  </li>
                  {event?.address ? (
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <img
                        src={MapPin}
                        alt=""
                        className="h-4 w-4 shrink-0 opacity-70"
                        aria-hidden
                      />
                      <span>{event.address}</span>
                    </li>
                  ) : null}
                </ul>
              </header>

              {ticket ? (
                <div className="mt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)] lg:items-start lg:gap-10 xl:gap-12">
                  <div className="min-w-0 space-y-8">
                    <section aria-labelledby="dados-responsavel">
                      <h2
                        id="dados-responsavel"
                        className="text-lg font-semibold text-gray-900"
                      >
                        Dados do responsável
                      </h2>

                      <div className="mt-5 space-y-4">
                        <FormField
                          id="nickname"
                          label={
                            ticket.category.members > 1
                              ? "Nome do time"
                              : "Nome ou Apelido"
                          }
                          error={errors.nickname?.message}
                        >
                          <input
                            autoFocus
                            id="nickname"
                            placeholder={
                              ticket.category.members > 1
                                ? "Wodful team"
                                : "João da silva"
                            }
                            type="text"
                            className={fieldInputClass(!!errors.nickname)}
                            {...register("nickname", {
                              onBlur: (ev) =>
                                getParticipant({
                                  accessCode: event?.accessCode!,
                                  search: ev.target.value,
                                  type: "nickname",
                                }),
                              required: Validation.invalidEmpty,
                              minLength: {
                                value: 3,
                                message: Validation.invalidSM,
                              },
                              maxLength: {
                                value: 50,
                                message: Validation.invalidLG,
                              },
                            })}
                          />
                        </FormField>

                        <FormField
                          id="responsibleName"
                          label="Nome do responsável"
                          error={errors.responsibleName?.message}
                        >
                          <input
                            id="responsibleName"
                            placeholder="João da silva"
                            type="text"
                            className={fieldInputClass(!!errors.responsibleName)}
                            {...register("responsibleName", {
                              required: Validation.invalidEmpty,
                              minLength: {
                                value: 3,
                                message: Validation.invalidSM,
                              },
                              maxLength: {
                                value: 50,
                                message: Validation.invalidLG,
                              },
                            })}
                          />
                        </FormField>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <FormField
                            id="responsibleEmail"
                            label="E-mail do responsável"
                            error={errors.responsibleEmail?.message}
                          >
                            <input
                              id="responsibleEmail"
                              placeholder="joao@email.com"
                              type="email"
                              className={fieldInputClass(!!errors.responsibleEmail)}
                              {...register("responsibleEmail", {
                                required: Validation.invalidEmpty,
                                minLength: {
                                  value: 4,
                                  message: Validation.invalidSM,
                                },
                                maxLength: {
                                  value: 50,
                                  message: Validation.invalidLG,
                                },
                                pattern: {
                                  value:
                                    /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                  message: Validation.invalid,
                                },
                              })}
                            />
                          </FormField>

                          <FormField
                            id="responsiblePhone"
                            label="Telefone do responsável"
                            error={errors.responsiblePhone?.message}
                          >
                            <input
                              id="responsiblePhone"
                              placeholder="xx x xxxx-xxxx"
                              type="tel"
                              className={fieldInputClass(!!errors.responsiblePhone)}
                              {...register("responsiblePhone", {
                                required: Validation.invalidEmpty,
                                minLength: {
                                  value: 9,
                                  message: Validation.invalidSM,
                                },
                                maxLength: {
                                  value: 13,
                                  message: Validation.invalidLG,
                                },
                                onChange(event) {
                                  formatPhone(event.target.value);
                                },
                              })}
                            />
                          </FormField>
                        </div>
                      </div>
                    </section>

                    <section aria-labelledby="dados-participantes">
                      <h2
                        id="dados-participantes"
                        className="text-lg font-semibold text-gray-900"
                      >
                        {ticket.category.members > 1
                          ? "Dados dos participantes"
                          : "Dados do participante"}
                      </h2>

                      <div className="mt-5 space-y-6">
                        {indexes.map((index) => {
                          const participants = `participants[${index}]`;
                          const participantErrors = errors.participants?.[index];

                          return (
                            <div
                              key={index}
                              className="rounded-xl border border-gray-200/80 bg-white p-5 sm:p-6"
                            >
                              {indexes.length > 1 ? (
                                <p className="mb-4 text-sm font-semibold text-gray-800">
                                  Atleta {index + 1}
                                </p>
                              ) : null}

                              <div className="space-y-4">
                                <FormField
                                  id={`${participants}.name`}
                                  label={indexes.length > 1 ? "Nome" : "Nome"}
                                  error={participantErrors?.name?.message}
                                >
                                  <input
                                    id={`${participants}.name`}
                                    placeholder="João da silva"
                                    type="text"
                                    className={fieldInputClass(
                                      !!participantErrors?.name
                                    )}
                                    {...register(`participants.${index}.name`, {
                                      required: Validation.invalidEmpty,
                                      minLength: {
                                        value: 4,
                                        message: Validation.invalidSM,
                                      },
                                      maxLength: {
                                        value: 50,
                                        message: Validation.invalidLG,
                                      },
                                    })}
                                  />
                                </FormField>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                  <FormField
                                    id={`${participants}.identificationCode`}
                                    label="Documento"
                                    error={
                                      participantErrors?.identificationCode
                                        ?.message
                                    }
                                  >
                                    <input
                                      id={`${participants}.identificationCode`}
                                      placeholder="CPF"
                                      type="tel"
                                      className={fieldInputClass(
                                        !!participantErrors?.identificationCode
                                      )}
                                      {...register(
                                        `participants.${index}.identificationCode`,
                                        {
                                          required: Validation.invalidEmpty,
                                          onBlur: (ev) =>
                                            getParticipant({
                                              accessCode: event?.accessCode!,
                                              search: ev.target.value,
                                              type: "code",
                                              index,
                                            }),
                                          minLength: {
                                            value: 11,
                                            message: "Mínimo 11 caracteres",
                                          },
                                          onChange(event) {
                                            formatDocument(
                                              event.target.value,
                                              index
                                            );
                                          },
                                          validate: (value) =>
                                            isValidDocument(value) ||
                                            Validation.invalid,
                                        }
                                      )}
                                    />
                                  </FormField>

                                  <FormField
                                    id={`${participants}.tShirtSize`}
                                    label="Camiseta"
                                    error={participantErrors?.tShirtSize?.message}
                                  >
                                    <select
                                      id={`${participants}.tShirtSize`}
                                      disabled={tshirtConfigs?.hasTshirt === "false"}
                                      className={fieldInputClass(
                                        !!participantErrors?.tShirtSize
                                      )}
                                      {...register(
                                        `participants.${index}.tShirtSize`,
                                        {
                                          required: Validation.invalidEmpty,
                                          disabled:
                                            tshirtConfigs?.hasTshirt === "false",
                                        }
                                      )}
                                    >
                                      <option value="">
                                        {tshirtConfigs?.hasTshirt === "true"
                                          ? "Selecione um tamanho"
                                          : "Sem camiseta"}
                                      </option>
                                      {tshirtConfigs?.tShirtSizes?.map((size) => (
                                        <option key={size} value={size}>
                                          {size}
                                        </option>
                                      ))}
                                    </select>
                                  </FormField>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                  <FormField
                                    id={`${participants}.city`}
                                    label="Cidade"
                                    error={participantErrors?.city?.message}
                                  >
                                    <input
                                      id={`${participants}.city`}
                                      placeholder="Rua do wodful, paraná"
                                      type="text"
                                      className={fieldInputClass(
                                        !!participantErrors?.city
                                      )}
                                      {...register(`participants.${index}.city`, {
                                        required: Validation.invalidEmpty,
                                        minLength: {
                                          value: 4,
                                          message: Validation.invalidSM,
                                        },
                                        maxLength: {
                                          value: 50,
                                          message: Validation.invalidLG,
                                        },
                                      })}
                                    />
                                  </FormField>

                                  <FormField
                                    id={`${participants}.affiliation`}
                                    label="Box do participante"
                                    error={participantErrors?.affiliation?.message}
                                  >
                                    <Controller
                                      name={`participants.${index}.affiliation`}
                                      control={control}
                                      rules={{
                                        required: Validation.invalidEmpty,
                                        minLength: {
                                          value: 3,
                                          message: Validation.invalidSM,
                                        },
                                        maxLength: {
                                          value: 50,
                                          message: Validation.invalidLG,
                                        },
                                      }}
                                      render={({ field }) => (
                                        <Combobox
                                          id={`${participants}.affiliation`}
                                          value={field.value ?? ""}
                                          onChange={field.onChange}
                                          onBlur={field.onBlur}
                                          options={affiliations}
                                          placeholder="Busque ou digite o box"
                                          invalid={
                                            !!participantErrors?.affiliation
                                          }
                                          resolveCanonical={(value, options) =>
                                            resolveAffiliation(value, options)
                                          }
                                        />
                                      )}
                                    />
                                  </FormField>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>

                    <section aria-labelledby="cupom-desconto">
                      <FormField
                        id="couponCode"
                        label="Cupom de desconto (opcional)"
                        error={
                          couponValidation.status === "invalid"
                            ? couponValidation.message
                            : undefined
                        }
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                          <input
                            id="couponCode"
                            placeholder="INSIRA SEU CUPOM AQUI"
                            type="text"
                            className={`${fieldInputClass(false)} sm:flex-1`}
                            {...register("couponCode", {
                              setValueAs: (v) =>
                                typeof v === "string"
                                  ? v.toUpperCase().trim()
                                  : v,
                            })}
                          />
                          <button
                            type="button"
                            onClick={applyCoupon}
                            disabled={
                              !couponCode ||
                              couponValidation.status === "loading"
                            }
                            className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-lg border border-primary bg-primary/5 px-5 text-sm font-semibold text-primary transition hover:bg-primary/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-[7.5rem]"
                          >
                            {couponValidation.status === "loading"
                              ? "Aplicando..."
                              : "Aplicar"}
                          </button>
                        </div>
                        {couponValidation.status === "valid" &&
                        couponValidation.message ? (
                          <span className="text-sm text-emerald-600" role="status">
                            {couponValidation.message}
                          </span>
                        ) : null}
                      </FormField>
                    </section>
                  </div>

                  <div className="mt-8 lg:mt-0 lg:sticky lg:top-6">
                    <SubscriptionSummary
                      ticket={ticket}
                      discounted={discounted}
                      discountBadgeText={discountBadgeText}
                      ticketPriceNumber={ticketPriceNumber}
                      canSubmit={canSubmit}
                      submitLabel="Revisar inscrição"
                      helperText="Na próxima etapa você confere os dados antes do pagamento."
                    />
                  </div>
                </div>
              ) : null}

              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setStep("terms")}
                  className="text-sm font-medium text-gray-600 hover:text-primary"
                >
                  ← Voltar aos termos
                </button>
              </div>
            </form>
            ) : null}

            {step === "review" && ticket && pendingSubmission ? (
              <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
                <section className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm sm:p-8">
                  <h2 className="text-xl font-bold text-gray-900">
                    Revise antes de pagar
                  </h2>
                  <p className="mt-2 text-sm text-gray-600">
                    Confira os dados abaixo. A inscrição só será confirmada após
                    a aprovação do pagamento no Mercado Pago.
                  </p>

                  <dl className="mt-6 space-y-4 text-sm">
                    <div>
                      <dt className="text-gray-500">Responsável</dt>
                      <dd className="font-medium text-gray-900">
                        {pendingSubmission.responsibleName}
                      </dd>
                      <dd className="text-gray-700">
                        {pendingSubmission.responsibleEmail} ·{" "}
                        {pendingSubmission.responsiblePhone}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Time / apelido</dt>
                      <dd className="font-medium text-gray-900">
                        {pendingSubmission.nickname}
                      </dd>
                    </div>
                    {pendingSubmission.participants.map((participant, index) => (
                      <div key={`review-${index}`}>
                        <dt className="text-gray-500">Atleta {index + 1}</dt>
                        <dd className="font-medium text-gray-900">
                          {participant.name}
                        </dd>
                        <dd className="text-gray-700">
                          {participant.affiliation} · {participant.city}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  {checkoutError ? (
                    <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                      {checkoutError}
                    </p>
                  ) : null}

                  <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                    <button
                      type="button"
                      onClick={() => setStep("form")}
                      className="text-sm font-medium text-gray-600 hover:text-primary"
                    >
                      ← Editar dados
                    </button>
                  </div>
                </section>

                <SubscriptionSummary
                  ticket={ticket}
                  discounted={discounted}
                  discountBadgeText={discountBadgeText}
                  ticketPriceNumber={ticketPriceNumber}
                  canSubmit={!checkoutLoading}
                  submitLabel={
                    discounted && discounted.final <= 0
                      ? "Confirmar inscrição gratuita"
                      : "Ir para pagamento"
                  }
                  helperText={
                    discounted && discounted.final <= 0
                      ? "Cupom aplicado — confirmação imediata."
                      : "Você será redirecionado ao Mercado Pago. PIX e cartão podem ficar pendentes até a confirmação."
                  }
                  loading={checkoutLoading}
                  onContinue={handleConfirmCheckout}
                />
              </div>
            ) : null}
          </Container>
        </div>
      ) : (
        <SubscriptionSkeleton />
      )}
    </>
  );
};
