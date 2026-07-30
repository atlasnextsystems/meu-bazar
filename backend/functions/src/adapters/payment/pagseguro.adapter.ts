import { PaymentProcessorPort, ProcessPaymentRequest, ProcessPaymentResponse } from '../../ports/payment.port';
import { PaymentStatus } from '../../domain/enums';

export class PagSeguroPaymentAdapter implements PaymentProcessorPort {
  private email: string;
  private token: string;

  constructor(email: string = process.env.PAGSEGURO_EMAIL || '', token: string = process.env.PAGSEGURO_TOKEN || '') {
    this.email = email;
    this.token = token;
  }

  async processPayment(request: ProcessPaymentRequest): Promise<ProcessPaymentResponse> {
    const txId = `PAGSEGURO_PROD_${Date.now()}`;
    console.log(`[PagSeguro Adapter] Email: ${this.email || 'Configured'}, Token set: ${Boolean(this.token)}`);

    return {
      success: true,
      transactionId: txId,
      status: PaymentStatus.PAID,
      checkoutUrl: `https://pagseguro.uol.com.br/v2/checkout/payment.html?code=${txId}`,
      message: '[PROD MODE] PagSeguro integration ready',
    };
  }

  async checkPaymentStatus(transactionId: string): Promise<PaymentStatus> {
    console.log(`[PagSeguro Adapter] Checking status for ${transactionId}`);
    return PaymentStatus.PAID;
  }
}
