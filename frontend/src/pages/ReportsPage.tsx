import React, { useEffect, useState } from 'react';
import { BarChart3, Download, DollarSign, ShoppingBag, TrendingUp } from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { ReportData } from '../types';
import { formatCurrency } from '../utils/formatters';
import { exportToCSV } from '../utils/csv';
import { Skeleton } from '../components/ui/Skeleton';

export const ReportsPage: React.FC = () => {
  const { activeBazaar } = useAuth();
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await apiService.getReportsData(activeBazaar?.id);
      setData(res);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [activeBazaar?.id]);

  const exportCSV = () => {
    if (!data) return;

    const rows: Record<string, any>[] = [];

    rows.push({ Tipo: '--- RESUMO ---', Detalhe: '', Valor: '' });
    rows.push({ Tipo: 'Total Faturado', Detalhe: `${data.totalQuantitySold} itens`, Valor: data.totalRevenue.toFixed(2) });
    rows.push({ Tipo: 'Ticket Médio', Detalhe: 'Média por transação', Valor: data.averageTicket.toFixed(2) });
    rows.push({ Tipo: 'Peças Vendidas', Detalhe: '', Valor: data.totalQuantitySold.toString() });
    rows.push({ Tipo: '', Detalhe: '', Valor: '' });

    if (data.topSellingCategories.length > 0) {
      rows.push({ Tipo: '--- VENDAS POR CATEGORIA ---', Detalhe: 'Qtd', Valor: 'Receita (R$)' });
      for (const cat of data.topSellingCategories) {
        rows.push({ Tipo: cat.category, Detalhe: cat.count.toString(), Valor: cat.revenue.toFixed(2) });
      }
      rows.push({ Tipo: '', Detalhe: '', Valor: '' });
    }

    if (data.topSellingProducts.length > 0) {
      rows.push({ Tipo: '--- PRODUTOS MAIS VENDIDOS ---', Detalhe: 'Código', Valor: 'Receita (R$)' });
      for (const prod of data.topSellingProducts) {
        rows.push({ Tipo: prod.name, Detalhe: prod.internalCode, Valor: prod.revenue.toFixed(2) });
      }
    }

    exportToCSV(`Relatorio_Vendas_MeuBazar_${Date.now()}`, rows);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Relatórios & Exportação CSV <BarChart3 className="w-5 h-5 text-emerald-600" />
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Acompanhe o desempenho das suas vendas e exporte planilhas em 1 clique.
          </p>
        </div>

        <button
          onClick={exportCSV}
          disabled={loading || !data}
          className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center space-x-2 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>Exportar CSV</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">
            <span>Total Faturado</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          {loading ? (
            <Skeleton className="h-8 w-3/4" />
          ) : (
            <div className="text-2xl font-black text-slate-900 dark:text-white">{formatCurrency(data?.totalRevenue)}</div>
          )}
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">{data?.totalQuantitySold || 0} itens vendidos</p>
        </div>

        <div className="glass-card p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">
            <span>Ticket Médio</span>
            <TrendingUp className="w-4 h-4 text-teal-600" />
          </div>
          {loading ? (
            <Skeleton className="h-8 w-3/4" />
          ) : (
            <div className="text-2xl font-black text-slate-900 dark:text-white">{formatCurrency(data?.averageTicket)}</div>
          )}
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">Média por transação</p>
        </div>

        <div className="glass-card p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">
            <span>Peças Vendidas</span>
            <ShoppingBag className="w-4 h-4 text-blue-600" />
          </div>
          {loading ? (
            <Skeleton className="h-8 w-3/4" />
          ) : (
            <div className="text-2xl font-black text-slate-900 dark:text-white">{data?.totalQuantitySold || 0}</div>
          )}
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">Itens entregues aos clientes</p>
        </div>
      </div>

      <div className="glass-card p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
          Vendas por Categoria
        </h3>

        <div className="space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : data?.topSellingCategories.map((item) => {
            const percentage = data.totalRevenue > 0 ? (item.revenue / data.totalRevenue) * 100 : 0;
            return (
              <div key={item.category} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                  <span>{item.category} ({item.count} peças)</span>
                  <span className="text-emerald-700 dark:text-emerald-400">{formatCurrency(item.revenue)} ({percentage.toFixed(1)}%)</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}

          {!loading && (!data?.topSellingCategories || data.topSellingCategories.length === 0) && (
            <div className="py-6 text-center text-slate-400 text-xs">
              Nenhuma venda registrada ainda.
            </div>
          )}
        </div>
      </div>

      {data?.topSellingProducts && data.topSellingProducts.length > 0 && (
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            Produtos Mais Vendidos
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="p-3">Produto</th>
                  <th className="p-3">Código</th>
                  <th className="p-3">Qtd Vendida</th>
                  <th className="p-3">Receita</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.topSellingProducts.map((product) => (
                  <tr key={product.internalCode} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{product.name}</td>
                    <td className="p-3 font-mono text-xs text-slate-500 dark:text-slate-400">{product.internalCode}</td>
                    <td className="p-3 text-slate-700 dark:text-slate-300">{product.count}x</td>
                    <td className="p-3 font-extrabold text-emerald-600 dark:text-emerald-400">{formatCurrency(product.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
