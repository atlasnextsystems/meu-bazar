import { db } from '../utils/firebase';
import { Product } from '../domain/entities';
import { ProductStatus } from '../domain/enums';

export class ProductService {
  private static async generateUniqueCode(): Promise<string> {
    let code: string;
    let exists = true;
    while (exists) {
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      code = `MBZ-${randomNum}`;
      const snap = await db.collection('products').where('internalCode', '==', code).limit(1).get();
      exists = !snap.empty;
    }
    return code!;
  }

  static async createProduct(ownerId: string, data: Omit<Product, 'id' | 'ownerId' | 'internalCode' | 'createdAt' | 'updatedAt' | 'isSold' | 'status'>): Promise<Product> {
    if (!data.name || data.name.trim() === '') {
      throw new Error('Nome da peça é obrigatório.');
    }
    if (data.price <= 0) {
      throw new Error('O preço deve ser maior que zero.');
    }

    const internalCode = await this.generateUniqueCode();
    const now = Date.now();

    const newProduct: Omit<Product, 'id'> = {
      ...data,
      ownerId,
      internalCode,
      isSold: false,
      status: ProductStatus.DISPONIVEL,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await db.collection('products').add(newProduct);
    return { id: docRef.id, ...newProduct };
  }

  static async updateProduct(ownerId: string, productId: string, updates: Partial<Product>): Promise<void> {
    const docRef = db.collection('products').doc(productId);
    const snap = await docRef.get();

    if (!snap.exists) {
      throw new Error('Produto não encontrado.');
    }

    const productData = snap.data() as Product;
    if (productData.ownerId !== ownerId) {
      throw new Error('Sem permissão para alterar este produto.');
    }

    const cleanedUpdates: Partial<Product> = {
      ...updates,
      updatedAt: Date.now(),
    };
    delete cleanedUpdates.id;
    delete cleanedUpdates.ownerId;
    delete cleanedUpdates.internalCode;

    await docRef.update(cleanedUpdates);
  }

  static async deleteProduct(ownerId: string, productId: string): Promise<void> {
    const docRef = db.collection('products').doc(productId);
    const snap = await docRef.get();

    if (!snap.exists) throw new Error('Produto não encontrado.');

    const productData = snap.data() as Product;
    if (productData.ownerId !== ownerId) throw new Error('Sem permissão.');

    await docRef.delete();
  }

  static async restoreProduct(ownerId: string, productId: string): Promise<void> {
    const docRef = db.collection('products').doc(productId);
    const snap = await docRef.get();

    if (!snap.exists) throw new Error('Produto não encontrado.');

    const productData = snap.data() as Product;
    if (productData.ownerId !== ownerId) throw new Error('Sem permissão para restaurar este produto.');

    await docRef.update({
      isSold: false,
      status: ProductStatus.DISPONIVEL,
      updatedAt: Date.now(),
    });
  }

  static async markAsSold(ownerId: string, productId: string): Promise<void> {
    const docRef = db.collection('products').doc(productId);
    const snap = await docRef.get();

    if (!snap.exists) throw new Error('Produto não encontrado.');

    const productData = snap.data() as Product;
    if (productData.ownerId !== ownerId) throw new Error('Sem permissão para alterar este produto.');

    await docRef.update({
      isSold: true,
      status: ProductStatus.VENDIDO,
      updatedAt: Date.now(),
    });
  }
}
