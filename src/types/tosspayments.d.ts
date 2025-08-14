declare module '@tosspayments/payment-sdk' {
  export interface TossPaymentsInstance {
    requestPayment(
      method: string,
      options: PaymentRequestOptions
    ): Promise<void>;
    
    widgets(options: WidgetOptions): PaymentWidget;
  }

  export interface PaymentRequestOptions {
    amount: number;
    orderId: string;
    orderName: string;
    customerName: string;
    customerEmail?: string;
    customerMobilePhone?: string;
    successUrl: string;
    failUrl: string;
    validHours?: number;
    useEscrow?: boolean;
    cashReceipt?: {
      type: '소득공제' | '지출증빙';
      registrationNumber: string;
    };
    virtualAccount?: {
      validHours?: number;
      cashReceipt?: {
        type: '소득공제' | '지출증빙';
        registrationNumber: string;
      };
    };
  }

  export interface WidgetOptions {
    customerKey: string;
  }

  export interface PaymentWidget {
    setAmount(amount: { currency: string; value: number }): Promise<void>;
    renderPaymentMethods(selector: string, amount: { value: number; currency: string }): Promise<void>;
    renderAgreement(selector: string): Promise<void>;
    requestPayment(options: {
      orderId: string;
      orderName: string;
      customerName: string;
      customerEmail?: string;
      successUrl: string;
      failUrl: string;
    }): Promise<void>;
  }

  export function loadTossPayments(clientKey: string): Promise<TossPaymentsInstance>;
}