import { httpsCallable } from 'firebase/functions';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { functions, storage, db } from '../firebase/config';
import type { Product, Sale, DashboardData, ReportData, Settings } from '../types';

const createProductFn = httpsCallable(functions, 'createProduct');
const updateProductFn = httpsCallable(functions, 'updateProduct');
const deleteProductFn = httpsCallable(functions, 'deleteProduct');
const restoreProductFn = httpsCallable(functions, 'restoreProduct');
const markProductSoldFn = httpsCallable(functions, 'markProductSold');
const registerSaleFn = httpsCallable(functions, 'registerSale');
const getSaleHistoryFn = httpsCallable(functions, 'getSaleHistory');
const getDashboardDataFn = httpsCallable(functions, 'getDashboardData');
const getReportsDataFn = httpsCallable(functions, 'getReportsData');
const updateSettingsFn = httpsCallable(functions, 'updateSettings');

export const apiService = {
  async createProduct(productData: any): Promise<Product> {
    const res = await createProductFn(productData);
    return res.data as Product;
  },

  async updateProduct(productId: string, updates: any): Promise<void> {
    await updateProductFn({ productId, updates });
  },

  async deleteProduct(productId: string): Promise<void> {
    await deleteProductFn({ productId });
  },

  async restoreProduct(productId: string): Promise<void> {
    await restoreProductFn({ productId });
  },

  async markProductSold(productId: string): Promise<void> {
    await markProductSoldFn({ productId });
  },

  async registerSale(saleRequest: { productIds: string[]; paymentMethod: string; discount?: number; notes?: string }): Promise<Sale> {
    const res = await registerSaleFn(saleRequest);
    return res.data as Sale;
  },

  async getSaleHistory(filter?: string): Promise<Sale[]> {
    const res = await getSaleHistoryFn({ filter });
    return res.data as Sale[];
  },

  async getDashboardData(): Promise<DashboardData> {
    const res = await getDashboardDataFn();
    return res.data as DashboardData;
  },

  async getReportsData(): Promise<ReportData> {
    const res = await getReportsDataFn();
    return res.data as ReportData;
  },

  async updateSettings(settings: Partial<Settings>): Promise<Settings> {
    const res = await updateSettingsFn(settings);
    return res.data as Settings;
  },

  async uploadImage(file: File, userId: string, folder: 'products' | 'logo' = 'products'): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const storageRef = ref(storage, `bazaars/${userId}/${folder}/${fileName}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  },

  subscribeProducts(userId: string, callback: (products: Product[]) => void) {
    const q = query(collection(db, 'products'), where('ownerId', '==', userId));
    return onSnapshot(q, (snapshot) => {
      const products: Product[] = [];
      snapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() } as Product);
      });
      products.sort((a, b) => (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0));
      callback(products);
    });
  },
};
