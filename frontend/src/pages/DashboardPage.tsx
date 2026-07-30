import React, { useEffect, useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  Package,
  ShoppingBag,
  Sparkles,
  ArrowUpRight,
  RefreshCw,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { apiService } from '../services/api';
import type { DashboardData } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Skeleton } from '../components/ui/Skeleton';

const CATEGORY_COLORS = ['#10b981', '#06b6d4', '#6366f1', '#ec4899', '#f59e0b'];

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await apiService.getDashboardData();
      setData(res);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Visão Geral do Bazar <Sparkles className="w-5 h-5 text-amber-500" />
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Acompanhe suas vendas, estoque e resultado em tempo real.
          </p>
        </div>
        <button
          onClick={fetchDashboard}
          disabled={loading}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Atualizar</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="glass-card p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Vendido Hoje</span>
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-3/4" />
          ) : (
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {formatCurrency(data?.totalSoldToday)}
            </div>
          )}
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> Atualizado hoje
          </span>
        </div>

        <div className="glass-card p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Vendido no Mês</span>
            <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-3/4" />
          ) : (
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {formatCurrency(data?.totalSoldMonth)}
            </div>
          )}
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Acumulado mensal</span>
        </div>

        <div className="glass-card p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Lucro do Mês</span>
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-3/4" />
          ) : (
            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
              {formatCurrency(data?.profitMonth)}
            </div>
          )}
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Resultado líquido</span>
        </div>

        <div className="glass-card p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Em Estoque</span>
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-3/4" />
          ) : (
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {data?.itemsInStockCount || 0} <span className="text-xs font-normal text-slate-500">peças</span>
            </div>
          )}
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Disponíveis</span>
        </div>

        <div className="glass-card p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Peças Vendidas</span>
            <div className="p-2 rounded-xl bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-3/4" />
          ) : (
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {data?.productsSoldCount || 0} <span className="text-xs font-normal text-slate-500">itens</span>
            </div>
          )}
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total histórico</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Desempenho de Vendas (Últimos 7 dias)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Faturamento diário registrado no sistema
              </p>
            </div>
            <Calendar className="w-5 h-5 text-slate-400" />
          </div>

          <div className="h-64 w-full pt-4">
            {loading ? (
              <Skeleton className="w-full h-full rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.salesChartData || []}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      color: '#fff',
                    }}
                    formatter={(val: any) => [formatCurrency(Number(val)), 'Vendido']}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#salesGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="glass-card p-6 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Top Categorias</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Faturamento por categoria</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {loading ? (
              <Skeleton className="w-full h-full rounded-xl" />
            ) : !data?.topCategories || data.topCategories.length === 0 ? (
              <div className="text-sm text-slate-400 text-center">Nenhuma venda gravada ainda</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.topCategories}
                    dataKey="total"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={50}
                    paddingAngle={5}
                  >
                    {data.topCategories.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      color: '#fff',
                    }}
                    formatter={(val: any) => [formatCurrency(Number(val)), 'Total']}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            {data?.topCategories.slice(0, 3).map((cat, idx) => (
              <div key={cat.category} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                  />
                  <span className="font-medium text-slate-700 dark:text-slate-300">{cat.category}</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(cat.total)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Últimas Vendas Realizadas</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Transações mais recentes no bazar</p>
          </div>
        </div>

        {loading ? (
          <Skeleton className="h-32 w-full" />
        ) : !data?.recentSales || data.recentSales.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">Nenhuma venda registrada até o momento.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="p-3 rounded-l-lg">Data</th>
                  <th className="p-3">Itens</th>
                  <th className="p-3">Forma de Pagamento</th>
                  <th className="p-3">Valor Total</th>
                  <th className="p-3 rounded-r-lg">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.recentSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                    <td className="p-3 font-medium text-slate-700 dark:text-slate-300">
                      {formatDate(sale.createdAt)}
                    </td>
                    <td className="p-3 font-medium text-slate-900 dark:text-white">
                      {sale.items.map((i) => i.productName).join(', ')}
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">
                      <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 font-medium text-xs">
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td className="p-3 font-extrabold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(sale.totalAmount)}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        {sale.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
