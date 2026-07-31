import { httpsCallable } from 'firebase/functions';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { functions, storage, db } from '../firebase/config';
import type { Product, Sale, DashboardData, ReportData, Bazaar, BazaarMember, UserProfile } from '../types';

const createBazaarFn = httpsCallable(functions, 'createBazaar');
const getUserBazaarsFn = httpsCallable(functions, 'getUserBazaars');
const inviteMemberFn = httpsCallable(functions, 'inviteMember');
const removeMemberFn = httpsCallable(functions, 'removeMember');
const updateBazaarFn = httpsCallable(functions, 'updateBazaar');
const updateProfileFn = httpsCallable(functions, 'updateProfile');

const createProductFn = httpsCallable(functions, 'createProduct');
const updateProductFn = httpsCallable(functions, 'updateProduct');
const deleteProductFn = httpsCallable(functions, 'deleteProduct');
const restoreProductFn = httpsCallable(functions, 'restoreProduct');
const markProductSoldFn = httpsCallable(functions, 'markProductSold');
const registerSaleFn = httpsCallable(functions, 'registerSale');
const getSaleHistoryFn = httpsCallable(functions, 'getSaleHistory');
const getDashboardDataFn = httpsCallable(functions, 'getDashboardData');
const getReportsDataFn = httpsCallable(functions, 'getReportsData');

export interface CreateBazaarData {
  name: string;
  cnpj?: string;
  niche: string;
  logoUrl?: string;
  phone?: string;
  address?: string;
}

export interface CreateProductData {
  name: string;
  category: string;
  brand?: string;
  size?: string;
  color?: string;
  condition: string;
  price: number;
  costPrice?: number;
  description?: string;
  imageUrl?: string;
  bazaarId?: string;
}

export interface UpdateProductData {
  name?: string;
  category?: string;
  brand?: string;
  size?: string;
  color?: string;
  condition?: string;
  price?: number;
  costPrice?: number;
  description?: string;
  imageUrl?: string;
}

export interface RegisterSaleData {
  bazaarId?: string;
  productIds?: string[];
  items?: { name: string; price: number; category: string }[];
  paymentMethod: string;
  discount?: number;
  notes?: string;
}

export const apiService = {
  async createBazaar(data: CreateBazaarData): Promise<Bazaar> {
    const res = await createBazaarFn(data);
    return res.data as Bazaar;
  },

  async getUserBazaars(): Promise<Bazaar[]> {
    const res = await getUserBazaarsFn();
    return res.data as Bazaar[];
  },

  async inviteMember(bazaarId: string, targetEmail: string, role: string): Promise<BazaarMember> {
    const res = await inviteMemberFn({ bazaarId, targetEmail, role });
    return res.data as BazaarMember;
  },

  async removeMember(bazaarId: string, targetMemberId: string): Promise<void> {
    await removeMemberFn({ bazaarId, targetMemberId });
  },

  async updateBazaar(bazaarId: string, updates: Partial<Bazaar>): Promise<void> {
    await updateBazaarFn({ bazaarId, updates });
  },

  async updateProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
    const res = await updateProfileFn(profileData);
    return res.data as UserProfile;
  },

  async createProduct(productData: CreateProductData): Promise<Product> {
    const res = await createProductFn(productData);
    return res.data as Product;
  },

  async updateProduct(productId: string, updates: UpdateProductData): Promise<void> {
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

  async registerSale(saleRequest: RegisterSaleData): Promise<Sale> {
    const res = await registerSaleFn(saleRequest);
    return res.data as Sale;
  },

  async getSaleHistory(filter?: string, bazaarId?: string): Promise<Sale[]> {
    const res = await getSaleHistoryFn({ filter, bazaarId });
    return res.data as Sale[];
  },

  async getDashboardData(bazaarId?: string): Promise<DashboardData> {
    const res = await getDashboardDataFn({ bazaarId });
    return res.data as DashboardData;
  },

  async getReportsData(bazaarId?: string): Promise<ReportData> {
    const res = await getReportsDataFn({ bazaarId });
    return res.data as ReportData;
  },

  async uploadImage(file: File, userId: string, folder: 'products' | 'logo' | 'avatars' = 'products'): Promise<string> {
    const fileExt = file.name.split('.').pop() || 'png';
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const storageRef = ref(storage, `bazaars/${userId}/${folder}/${fileName}`);
    
    const mimeType = file.type || `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`;
    await uploadBytes(storageRef, file, { contentType: mimeType });
    return await getDownloadURL(storageRef);
  },

  subscribeProducts(bazaarId: string, callback: (products: Product[]) => void) {
    const q = query(collection(db, 'products'), where('bazaarId', '==', bazaarId));
    return onSnapshot(q, (snapshot) => {
      const products: Product[] = [];
      snapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() } as Product);
      });
      products.sort((a, b) => (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0));
      callback(products);
    });
  },

  subscribeBazaarMembers(bazaarId: string, callback: (members: BazaarMember[]) => void) {
    const q = query(collection(db, 'bazaar_members'), where('bazaarId', '==', bazaarId));
    return onSnapshot(q, (snapshot) => {
      const members: BazaarMember[] = [];
      snapshot.forEach((doc) => {
        members.push({ id: doc.id, ...doc.data() } as BazaarMember);
      });
      callback(members);
    });
  },
};
