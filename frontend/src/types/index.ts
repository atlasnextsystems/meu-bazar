export const UserRole = {
  OWNER: 'OWNER',
  MANAGER: 'MANAGER',
  CASHIER: 'CASHIER',
} as const;
export type UserRole = typeof UserRole[keyof typeof UserRole];

export const BazaarNiche = {
  MODA_FEMININA: 'Moda Feminina',
  MODA_MASCULINA: 'Moda Masculina',
  BRECHO_VINTAGE: 'Brechó & Vintage',
  INFANTIL: 'Infantil & Bebê',
  CALCADOS_ACESSORIOS: 'Calçados & Acessórios',
  VARIEDADES: 'Variedades & Outros',
} as const;
export type BazaarNiche = typeof BazaarNiche[keyof typeof BazaarNiche];

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
} as const;
export type PaymentMethod = typeof PaymentMethod[keyof typeof PaymentMethod];

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
  id: string;
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
  bazaarId?: string;
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
  bazaarId?: string;
  ownerId: string;
  items: SaleItem[];
  totalAmount: number;
  paymentMethod: PaymentMethod | string;
  paymentStatus: string;
  transactionId?: string;
  discount?: number;
  notes?: string;
  createdAt: number;
  updatedAt: number;
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
