import { db } from '../utils/firebase';
import { Sale } from '../domain/entities';

export interface ReportData {
  totalQuantitySold: number;
  totalRevenue: number;
  averageTicket: number;
  topSellingCategories: { category: string; count: number; revenue: number }[];
  topSellingProducts: { name: string; internalCode: string; count: number; revenue: number }[];
}

export class ReportService {
  static async getReportsData(ownerId: string): Promise<ReportData> {
    const salesSnap = await db.collection('sales').where('ownerId', '==', ownerId).get();
    const sales: Sale[] = [];
    salesSnap.forEach((doc) => sales.push(doc.data() as Sale));

    let totalRevenue = 0;
    let totalQuantitySold = 0;

    const categoryMap: { [cat: string]: { count: number; revenue: number } } = {};
    const productMap: { [code: string]: { name: string; count: number; revenue: number } } = {};

    sales.forEach((s) => {
      totalRevenue += s.totalAmount;
      s.items.forEach((item) => {
        totalQuantitySold += 1;

        // Categories
        const cat = item.category || 'Outros';
        if (!categoryMap[cat]) categoryMap[cat] = { count: 0, revenue: 0 };
        categoryMap[cat].count += 1;
        categoryMap[cat].revenue += item.price;

        // Products
        const code = item.internalCode || item.productName;
        if (!productMap[code]) productMap[code] = { name: item.productName, count: 0, revenue: 0 };
        productMap[code].count += 1;
        productMap[code].revenue += item.price;
      });
    });

    const averageTicket = sales.length > 0 ? totalRevenue / sales.length : 0;

    const topSellingCategories = Object.keys(categoryMap)
      .map((cat) => ({
        category: cat,
        count: categoryMap[cat].count,
        revenue: Number(categoryMap[cat].revenue.toFixed(2)),
      }))
      .sort((a, b) => b.revenue - a.revenue);

    const topSellingProducts = Object.keys(productMap)
      .map((code) => ({
        name: productMap[code].name,
        internalCode: code,
        count: productMap[code].count,
        revenue: Number(productMap[code].revenue.toFixed(2)),
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return {
      totalQuantitySold,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      averageTicket: Number(averageTicket.toFixed(2)),
      topSellingCategories,
      topSellingProducts,
    };
  }
}
