import React, { useEffect, useState } from 'react';
import { BarChart3, Download, ShoppingBag, DollarSign, TrendingUp, Award, Layers } from 'lucide-react';
import { apiService } from '../services/api';
import type { ReportData } from '../types';
import { formatCurrency } from '../utils/formatters';
import { exportToCSV } from '../utils/csv';
import { Skeleton } from '../components/ui/Skeleton';

export const ReportsPage: React.FC = () => {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await apiService.getReportsData();
      setData(res);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleExportCSV = () => {
    if (!data) return;

    const exportRows = data.topSellingProducts.map((p) => ({
      Produto: p.name,
      CodigoInterno: p.internalCode,
      QuantidadeVendida: p.count,
      FaturamentoTotal: p.revenue,
    }));

    exportToCSV(`relatorio_vendas_meubazar_${Date.now()}`, exportRows);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Relatórios e Métricas <BarChart3 className="w-5 h-5 text-emerald-500" />
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Análise detalhada do desempenho financeiro e produtos mais vendidos.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={!data || loading}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition flex items-center space-x-2 shadow-md shadow-emerald-600/30 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>Exportar CSV</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase">
            <span>Quantidade Vendida</span>
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-1/2" />
          ) : (
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {data?.totalQuantitySold || 0} <span className="text-sm font-normal text-slate-500">peças</span>
            </div>
          )}
        </div>

        <div className="glass-card p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase">
            <span>Faturamento Total</span>
            <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-1/2" />
          ) : (
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {formatCurrency(data?.totalRevenue)}
            </div>
          )}
        </div>

        <div className="glass-card p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase">
            <span>Ticket Médio por Venda</span>
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-1/2" />
          ) : (
            <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
              {formatCurrency(data?.averageTicket)}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-slate-900 dark:text-white">Produtos Mais Vendidos</h3>
          </div>

          {loading ? (
            <Skeleton className="h-48 w-full" />
          ) : !data?.topSellingProducts || data.topSellingProducts.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">Nenhum dado disponível.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase bg-slate-100 dark:bg-slate-800/80 text-slate-500">
                  <tr>
                    <th className="p-3">Produto</th>
                    <th className="p-3">Código</th>
                    <th className="p-3">Qtd</th>
                    <th className="p-3 text-right">Faturamento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {data.topSellingProducts.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="p-3 font-medium text-slate-900 dark:text-white">{p.name}</td>
                      <td className="p-3 font-mono text-xs text-slate-500">{p.internalCode}</td>
                      <td className="p-3 font-bold text-slate-700 dark:text-slate-300">{p.count}</td>
                      <td className="p-3 text-right font-black text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(p.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-teal-500" />
            <h3 className="font-bold text-slate-900 dark:text-white">Categorias Mais Vendidas</h3>
          </div>

          {loading ? (
            <Skeleton className="h-48 w-full" />
          ) : !data?.topSellingCategories || data.topSellingCategories.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">Nenhum dado disponível.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase bg-slate-100 dark:bg-slate-800/80 text-slate-500">
                  <tr>
                    <th className="p-3">Categoria</th>
                    <th className="p-3">Peças Vendidas</th>
                    <th className="p-3 text-right">Faturamento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {data.topSellingCategories.map((c, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="p-3 font-medium text-slate-900 dark:text-white">{c.category}</td>
                      <td className="p-3 font-bold text-slate-700 dark:text-slate-300">{c.count}</td>
                      <td className="p-3 text-right font-black text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(c.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
