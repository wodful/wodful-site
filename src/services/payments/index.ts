import wodfulApi from "../api";

interface CreatePaymentRequest {
  subscriptionId: string;
  couponCode?: string;
}

interface CreatePaymentResponse {
  paymentId: string;
  paymentUrl: string;
}

export type ValidateCouponResponse =
  | {
      valid: true;
      coupon: { id: string; code: string; type: "PERCENTAGE" | "FIXED"; value: number };
      amountOriginal: number;
      discountAmount: number;
      amountFinal: number;
    }
  | {
      valid: false;
      reason: string;
    };

export class PaymentsService {
  constructor(private readonly path = "/payments/checkout") {}

  async createPayment(
    payload: CreatePaymentRequest
  ): Promise<CreatePaymentResponse> {
    const response = await wodfulApi.post<CreatePaymentResponse>(
      this.path,
      payload
    );
    return response.data;
  }

  async processBrickPayment(payload: {
    paymentId: string;
    formData: Record<string, unknown>;
  }): Promise<{
    status: "approved" | "pending" | "rejected";
    paymentId: string;
    subscriptionId: string;
  }> {
    try {
      const response = await wodfulApi.post<{
        status: "approved" | "pending" | "rejected";
        paymentId: string;
        subscriptionId: string;
      }>("/payments/brick", payload);
      return response.data;
    } catch (err: any) {
      const message =
        err?.response?.data?.message ??
        err?.message ??
        "Não foi possível processar o pagamento";
      throw new Error(message);
    }
  }

  async validateCoupon(payload: {
    ticketId: string;
    couponCode: string;
  }): Promise<ValidateCouponResponse> {
    const response = await wodfulApi.post<ValidateCouponResponse>(
      "/payments/coupons/validate",
      payload
    );
    return response.data;
  }
}

