import { PaymentProcessorPort } from '../../ports/payment.port';
import { MockPaymentAdapter } from './mock-payment.adapter';
import { PagSeguroPaymentAdapter } from './pagseguro.adapter';

export class PaymentProcessorFactory {
  static getAdapter(): PaymentProcessorPort {
    const envMode = (process.env.ENV_MODE || 'dev').toLowerCase();

    if (envMode === 'prod' || envMode === 'production') {
      return new PagSeguroPaymentAdapter();
    }

    return new MockPaymentAdapter();
  }
}
