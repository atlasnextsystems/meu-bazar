import { PaymentProcessorPort, ProcessPaymentRequest, ProcessPaymentResponse } from '../../ports/payment.port';
import { PaymentStatus } from '../../domain/enums';

export class MockPaymentAdapter implements PaymentProcessorPort {
  async processPayment(request: ProcessPaymentRequest): Promise<ProcessPaymentResponse> {
    const mockTxId = `MOCK_PAGSEGURO_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    return {
      success: true,
      transactionId: mockTxId,
      status: PaymentStatus.PAID,
      qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=00020126580014BR.GOV.BCB.PIX0136mock-pix-key-meubazar520400005303986540510.005802BR5915MEU%20BAZAR%20SAAS6009SAO%20PAULO62070503***6304E2CA',
      message: '[DEV MODE MOCK] Payment processed successfully via Mock Adapter',
    };
  }

  async checkPaymentStatus(transactionId: string): Promise<PaymentStatus> {
    return PaymentStatus.PAID;
  }
}
