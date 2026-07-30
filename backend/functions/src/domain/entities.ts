import { UserRole, BazaarNiche, ProductCategory, ProductCondition, ProductStatus, PaymentMethod, PaymentStatus } from './enums';

export interface UserProfile {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  photoUrl?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Bazaar {
  id?: string;
  ownerId: string;
  name: string;
  cnpj?: string;
  niche: BazaarNiche | string;
  logoUrl?: string;
  phone?: string;
  address?: string;
  hasActiveSubscription: boolean;
  subscriptionPlan?: string;
  createdAt: number;
  updatedAt: number;
}

export interface BazaarMember {
  id?: string;
  bazaarId: string;
  userId?: string;
  userEmail: string;
  userName?: string;
  role: UserRole;
  invitedBy: string;
  status: 'active' | 'pending';
  createdAt: number;
}

export interface Product {
  id?: string;
  bazaarId: string;
  ownerId: string;
  name: string;
  category: ProductCategory | string;
  brand?: string;
  size?: string;
  color?: string;
  condition: ProductCondition | string;
  price: number;
  costPrice?: number;
  description?: string;
  imageUrl?: string;
  isSold: boolean;
  status: ProductStatus | string;
  internalCode: string;
  createdAt: number;
  updatedAt: number;
}

export interface SaleItem {
  productId: string;
  productName: string;
  price: number;
  category: string;
  internalCode: string;
  imageUrl?: string;
}

export interface Sale {
  id?: string;
  bazaarId: string;
  ownerId: string;
  items: SaleItem[];
  totalAmount: number;
  paymentMethod: PaymentMethod | string;
  paymentStatus: PaymentStatus;
  transactionId?: string;
  discount?: number;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}
