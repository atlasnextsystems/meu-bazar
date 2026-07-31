import * as admin from 'firebase-admin';
import { db } from '../utils/firebase';
import { Sale, SaleItem } from '../domain/entities';
import { PaymentMethod, ProductStatus } from '../domain/enums';
import { PaymentProcessorFactory } from '../adapters/payment/payment.factory';

export interface SaleItemInput {
  name: string;
  price: number;
  category: string;
}

export interface RegisterSaleRequest {
  bazaarId?: string;
  productIds?: string[];
  items?: SaleItemInput[];
  paymentMethod: PaymentMethod | string;
  discount?: number;
  notes?: string;
}

export class SaleService {
  static async registerSale(ownerId: string, request: RegisterSaleRequest): Promise<Sale> {
    const hasProducts = request.productIds && request.productIds.length > 0;
    const hasItems = request.items && request.items.length > 0;

    if (!hasProducts && !hasItems) {
      throw new Error('Adicione pelo menos um item para registrar a venda.');
    }

    const saleId = `SALE_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const bazaarId = request.bazaarId || 'default';

    const saleItems: SaleItem[] = [];
    let grossTotal = 0;
    const batch = db.batch();

    if (hasProducts) {
      for (const pid of request.productIds!) {
        const pRef = db.collection('products').doc(pid);
        const pSnap = await pRef.get();

        if (!pSnap.exists) {
          throw new Error(`Produto ${pid} não encontrado.`);
        }

        const product = pSnap.data()!;
        if (product.ownerId !== ownerId) {
          throw new Error(`Produto ${pid} não pertence a este usuário.`);
        }
        if (bazaarId !== 'default' && product.bazaarId !== bazaarId) {
          throw new Error(`Produto ${pid} não pertence a este bazar.`);
        }
        if (product.isSold) {
          throw new Error(`O produto "${product.name}" (${product.internalCode}) já foi vendido.`);
        }

        grossTotal += product.price;
        saleItems.push({
          productId: pid,
          productName: product.name,
          price: product.price,
          category: product.category,
          internalCode: product.internalCode,
          imageUrl: product.imageUrl,
        });

        batch.update(pRef, {
          isSold: true,
          status: ProductStatus.VENDIDO,
          updatedAt: Date.now(),
        });
      }
    }

    if (hasItems) {
      for (const item of request.items!) {
        const itemCode = `AVULSO-${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        grossTotal += item.price;
        saleItems.push({
          productId: `CUSTOM_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          productName: item.name,
          price: item.price,
          category: item.category,
          internalCode: itemCode,
        });
      }
    }

    const discount = request.discount || 0;
    const totalAmount = Math.max(0, grossTotal - discount);

    const paymentAdapter = PaymentProcessorFactory.getAdapter();
    const paymentResult = await paymentAdapter.processPayment({
      saleId,
      amount: totalAmount,
      paymentMethod: request.paymentMethod,
    });

    if (!paymentResult.success) {
      throw new Error(`Falha no pagamento: ${paymentResult.message}`);
    }

    const now = Date.now();
    const saleData: Sale = {
      id: saleId,
      bazaarId,
      ownerId,
      items: saleItems,
      totalAmount,
      paymentMethod: request.paymentMethod,
      paymentStatus: paymentResult.status,
      transactionId: paymentResult.transactionId,
      discount,
      notes: request.notes || '',
      createdAt: now,
      updatedAt: now,
    };

    const saleRef = db.collection('sales').doc(saleId);
    batch.set(saleRef, saleData);

    await batch.commit();
    return saleData;
  }

  static async getSaleHistory(ownerId: string, filter?: 'today' | 'week' | 'month' | 'year' | 'all', bazaarId?: string): Promise<Sale[]> {
    let query: admin.firestore.Query = db.collection('sales').where('ownerId', '==', ownerId);
    if (bazaarId) {
      query = query.where('bazaarId', '==', bazaarId);
    }

    const now = new Date();
    let startTime = 0;

    if (filter === 'today') {
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      startTime = todayStart.getTime();
    } else if (filter === 'week') {
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      startTime = weekStart.getTime();
    } else if (filter === 'month') {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      startTime = monthStart.getTime();
    } else if (filter === 'year') {
      const yearStart = new Date(now.getFullYear(), 0, 1);
      startTime = yearStart.getTime();
    }

    if (startTime > 0) {
      query = query.where('createdAt', '>=', startTime);
    }

    const snap = await query.get();
    const sales: Sale[] = [];
    snap.forEach((doc: admin.firestore.QueryDocumentSnapshot) => {
      sales.push(doc.data() as Sale);
    });

    return sales.sort((a, b) => (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0));
  }
}
