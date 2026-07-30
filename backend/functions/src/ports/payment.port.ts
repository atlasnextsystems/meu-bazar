import { PaymentMethod, PaymentStatus } from '../domain/enums';

export interface ProcessPaymentRequest {
  saleId: string;
  amount: number;
  paymentMethod: PaymentMethod | string;
  customerEmail?: string;
  customerName?: string;
}

export interface ProcessPaymentResponse {
  success: boolean;
  transactionId: string;
  status: PaymentStatus;
  qrCodeUrl?: string;
  checkoutUrl?: string;
  message?: string;
}

export interface PaymentProcessorPort {
  processPayment(request: ProcessPaymentRequest): Promise<ProcessPaymentResponse>;
  checkPaymentStatus(transactionId: string): Promise<PaymentStatus>;
}
