import { ProductCategory, ProductCondition, ProductStatus, PaymentMethod, PaymentStatus, AuditAction } from './enums';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: string | number;
  updatedAt: string | number;
}

export interface Product {
  id?: string;
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
  createdAt: string | number;
  updatedAt: string | number;
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
  ownerId: string;
  items: SaleItem[];
  totalAmount: number;
  paymentMethod: PaymentMethod | string;
  paymentStatus: PaymentStatus;
  transactionId?: string;
  discount?: number;
  notes?: string;
  createdAt: string | number;
  updatedAt: string | number;
}

export interface Settings {
  ownerId: string;
  bazarName: string;
  phone?: string;
  address?: string;
  logoUrl?: string;
  theme: 'light' | 'dark';
  pagSeguroEmail?: string;
  pagSeguroToken?: string;
  updatedAt: string | number;
}

export interface AuditLog {
  id?: string;
  ownerId: string;
  action: AuditAction | string;
  details: string;
  entityId?: string;
  timestamp: string | number;
}
