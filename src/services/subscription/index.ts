import { IParticipantForm } from "../../models/ParticipantDTO";
import { CURRENT_PRIVACY_POLICY_VERSION } from "../../constants/privacyPolicy";
import wodfulApi from "../api";

export type CheckoutResponse =
  | { status: "confirmed"; subscriptionId: string }
  | {
      status: "payment_required";
      subscriptionId: string;
      paymentId: string;
      preferenceId: string;
      amountFinal: number;
      publicKey: string;
      paymentUrl: string;
      expiresAt: string;
    };

export type CheckoutPayload = IParticipantForm & {
  ticketId: string;
  couponCode?: string;
};

export class SubscriptionService {
  constructor(
    private readonly checkoutPath = "/public/events/subscriptions/checkout"
  ) {}

  async checkout(payload: CheckoutPayload): Promise<CheckoutResponse> {
    const response = await wodfulApi.post<CheckoutResponse>(
      this.checkoutPath,
      {
        ...payload,
        privacyPolicyVersion: CURRENT_PRIVACY_POLICY_VERSION,
      },
      {
        headers: {
          ["x-api-key"]: `${process.env.GATSBY_WODFUL_API_KEY}`,
        },
      }
    );

    return response.data;
  }

  async retryPayment(
    subscriptionId: string,
    responsibleEmail: string
  ): Promise<{ paymentUrl: string }> {
    const response = await wodfulApi.post<{ paymentUrl: string }>(
      `/public/events/subscriptions/${subscriptionId}/payment-link`,
      { responsibleEmail },
      {
        headers: {
          ["x-api-key"]: `${process.env.GATSBY_WODFUL_API_KEY}`,
        },
      }
    );

    return response.data;
  }
}
