import { db } from '../utils/firebase';
import { Product } from '../domain/entities';
import { ProductStatus, AuditAction } from '../domain/enums';
import { AuditService } from './audit.service';

export class ProductService {
  private static generateInternalCode(): string {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `MBZ-${randomNum}`;
  }

  static async createProduct(ownerId: string, data: Omit<Product, 'id' | 'ownerId' | 'internalCode' | 'createdAt' | 'updatedAt' | 'isSold' | 'status'>): Promise<Product> {
    if (!data.name || data.name.trim() === '') {
      throw new Error('Product name is required.');
    }
    if (data.price <= 0) {
      throw new Error('Price must be greater than zero.');
    }

    const internalCode = this.generateInternalCode();
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
    const created = { id: docRef.id, ...newProduct };

    await AuditService.logAction(ownerId, AuditAction.CREATE_PRODUCT, `Created product "${data.name}" (${internalCode})`, docRef.id);

    return created;
  }

  static async updateProduct(ownerId: string, productId: string, updates: Partial<Product>): Promise<void> {
    const docRef = db.collection('products').doc(productId);
    const snap = await docRef.get();

    if (!snap.exists) {
      throw new Error('Product not found.');
    }

    const productData = snap.data() as Product;
    if (productData.ownerId !== ownerId) {
      throw new Error('Permission denied: You do not own this product.');
    }

    const cleanedUpdates: Partial<Product> = {
      ...updates,
      updatedAt: Date.now(),
    };
    delete cleanedUpdates.id;
    delete cleanedUpdates.ownerId;
    delete cleanedUpdates.internalCode;

    await docRef.update(cleanedUpdates);
    await AuditService.logAction(ownerId, AuditAction.UPDATE_PRODUCT, `Updated product "${productData.name}"`, productId);
  }

  static async deleteProduct(ownerId: string, productId: string): Promise<void> {
    const docRef = db.collection('products').doc(productId);
    const snap = await docRef.get();

    if (!snap.exists) {
      throw new Error('Product not found.');
    }

    const productData = snap.data() as Product;
    if (productData.ownerId !== ownerId) {
      throw new Error('Permission denied.');
    }

    await docRef.delete();
    await AuditService.logAction(ownerId, AuditAction.DELETE_PRODUCT, `Deleted product "${productData.name}"`, productId);
  }

  static async restoreProduct(ownerId: string, productId: string): Promise<void> {
    const docRef = db.collection('products').doc(productId);
    const snap = await docRef.get();

    if (!snap.exists) {
      throw new Error('Product not found.');
    }

    const productData = snap.data() as Product;
    if (productData.ownerId !== ownerId) {
      throw new Error('Permission denied.');
    }

    await docRef.update({
      isSold: false,
      status: ProductStatus.DISPONIVEL,
      updatedAt: Date.now(),
    });

    await AuditService.logAction(ownerId, AuditAction.RESTORE_PRODUCT, `Restored product "${productData.name}" to available stock`, productId);
  }

  static async markAsSold(ownerId: string, productId: string): Promise<void> {
    const docRef = db.collection('products').doc(productId);
    const snap = await docRef.get();

    if (!snap.exists) {
      throw new Error('Product not found.');
    }

    const productData = snap.data() as Product;
    if (productData.ownerId !== ownerId) {
      throw new Error('Permission denied.');
    }

    await docRef.update({
      isSold: true,
      status: ProductStatus.VENDIDO,
      updatedAt: Date.now(),
    });

    await AuditService.logAction(ownerId, AuditAction.MARK_SOLD, `Marked product "${productData.name}" as sold`, productId);
  }
}
