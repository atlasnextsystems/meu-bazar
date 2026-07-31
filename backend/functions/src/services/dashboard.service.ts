import { db } from '../utils/firebase';
import { Sale } from '../domain/entities';

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

export class DashboardService {
  static async getDashboardData(ownerId: string, bazaarId?: string): Promise<DashboardData> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    let salesQuery: FirebaseFirestore.Query = db.collection('sales').where('ownerId', '==', ownerId);
    if (bazaarId) {
      salesQuery = salesQuery.where('bazaarId', '==', bazaarId);
    }
    const salesSnap = await salesQuery.get();
    const sales: Sale[] = [];
    salesSnap.forEach((doc) => sales.push(doc.data() as Sale));

    let totalSoldToday = 0;
    let totalSoldMonth = 0;
    let productsSoldCount = 0;

    const categoryMap: { [cat: string]: { count: number; total: number } } = {};
    const chartMap: { [dayKey: string]: { total: number; count: number } } = {};

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      chartMap[key] = { total: 0, count: 0 };
    }

    sales.forEach((s) => {
      const saleTime = Number(s.createdAt) || 0;
      const saleDate = new Date(saleTime);

      if (saleTime >= todayStart) {
        totalSoldToday += s.totalAmount;
      }

      if (saleTime >= monthStart) {
        totalSoldMonth += s.totalAmount;
      }

      s.items.forEach((item) => {
        productsSoldCount += 1;
        const cat = item.category || 'Outros';
        if (!categoryMap[cat]) {
          categoryMap[cat] = { count: 0, total: 0 };
        }
        categoryMap[cat].count += 1;
        categoryMap[cat].total += item.price;
      });

      const dayDiff = Math.floor((now.getTime() - saleTime) / (24 * 60 * 60 * 1000));
      if (dayDiff >= 0 && dayDiff < 7) {
        const key = `${saleDate.getDate().toString().padStart(2, '0')}/${(saleDate.getMonth() + 1).toString().padStart(2, '0')}`;
        if (chartMap[key]) {
          chartMap[key].total += s.totalAmount;
          chartMap[key].count += s.items.length;
        }
      }
    });

    let productsQuery: FirebaseFirestore.Query = db
      .collection('products')
      .where('ownerId', '==', ownerId)
      .where('isSold', '==', false);
    if (bazaarId) {
      productsQuery = productsQuery.where('bazaarId', '==', bazaarId);
    }
    const productsSnap = await productsQuery.get();
    const itemsInStockCount = productsSnap.size;

    const salesChartData = Object.keys(chartMap).map((date) => ({
      date,
      total: Number(chartMap[date].total.toFixed(2)),
      count: chartMap[date].count,
    }));

    const topCategories = Object.keys(categoryMap)
      .map((cat) => ({
        category: cat,
        count: categoryMap[cat].count,
        total: Number(categoryMap[cat].total.toFixed(2)),
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    const recentSales = sales
      .sort((a, b) => (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0))
      .slice(0, 5);

    return {
      totalSoldToday: Number(totalSoldToday.toFixed(2)),
      totalSoldMonth: Number(totalSoldMonth.toFixed(2)),
      itemsInStockCount,
      productsSoldCount,
      profitMonth: totalSoldMonth,
      recentSales,
      salesChartData,
      topCategories,
    };
  }
}
