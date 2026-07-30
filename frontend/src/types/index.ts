export const ProductCategory = {
  FEMININO: 'Feminino',
  MASCULINO: 'Masculino',
  INFANTIL: 'Infantil',
  CALCADOS: 'Calçados',
  ACESSORIOS: 'Acessórios',
  CASA_DECORACAO: 'Casa & Decoração',
  OUTROS: 'Outros',
} as const;
export type ProductCategory = typeof ProductCategory[keyof typeof ProductCategory];

export const ProductCondition = {
  NOVO_COM_ETIQUETA: 'Novo com Etiqueta',
  SEMINOVO_PERFEITO: 'Seminovo Perfeito',
  MARCAS_DE_USO: 'Marcas de Uso',
  VINTAGE: 'Vintage / Raro',
} as const;
export type ProductCondition = typeof ProductCondition[keyof typeof ProductCondition];

export const ProductStatus = {
  DISPONIVEL: 'Disponível',
  VENDIDO: 'Vendido',
  RESERVADO: 'Reservado',
} as const;
export type ProductStatus = typeof ProductStatus[keyof typeof ProductStatus];

export const PaymentMethod = {
  DINHEIRO: 'Dinheiro',
  PIX: 'PIX',
  CARTAO_CREDITO: 'Cartão de Crédito',
  CARTAO_DEBITO: 'Cartão de Débito',
  PAGSEGURO_ONLINE: 'PagSeguro Online',
} as const;
export type PaymentMethod = typeof PaymentMethod[keyof typeof PaymentMethod];

export const PaymentStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  REFUNDED: 'REFUNDED',
  FAILED: 'FAILED',
} as const;
export type PaymentStatus = typeof PaymentStatus[keyof typeof PaymentStatus];

export interface UserProfile {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  hasActiveSubscription: boolean;
  createdAt: number;
  updatedAt: number;
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

export interface Settings {
  ownerId?: string;
  bazarName: string;
  phone?: string;
  address?: string;
  logoUrl?: string;
  theme: 'light';
  pagSeguroEmail?: string;
  pagSeguroToken?: string;
  hasActiveSubscription?: boolean;
  subscriptionPlan?: string;
  updatedAt?: number;
}

export interface DashboardData {
  totalSoldToday: number;
  totalSoldMonth: number;
  itemsInStockCount: number;
  productsSoldCount: number;
  profitMonth: number;
  recentSales: Sale[];
  salesChartData: { date: string; total: number; count: number }[];
  topCategories: { category: string; count: number; total: number }[];
}

export interface ReportData {
  totalQuantitySold: number;
  totalRevenue: number;
  averageTicket: number;
  topSellingCategories: { category: string; count: number; revenue: number }[];
  topSellingProducts: { name: string; internalCode: string; count: number; revenue: number }[];
}
