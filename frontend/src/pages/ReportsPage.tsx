import React, { useEffect, useState } from 'react';
import { BarChart3, Download, DollarSign, ShoppingBag, TrendingUp } from 'lucide-react';
import { apiService } from '../services/api';
import type { Sale } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

export const ReportsPage: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [filter, setFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  useEffect(() => {
    const loadSales = async () => {
      try {
        const data = await apiService.getSaleHistory(filter);
        setSales(data);
      } catch (err) {
        console.error('Error fetching sales history for reports:', err);
      }
    };
    loadSales();
  }, [filter]);

  const totalRevenue = sales.reduce((acc, s) => acc + s.totalAmount, 0);
  const totalItemsSold = sales.reduce((acc, s) => acc + (s.items?.length || 0), 0);
  const totalSalesCount = sales.length;
  const averageTicket = totalSalesCount > 0 ? totalRevenue / totalSalesCount : 0;

  const categoryMap: { [cat: string]: { count: number; total: number } } = {};
  sales.forEach((s) => {
    s.items?.forEach((item) => {
      const cat = item.category || 'Outros';
      if (!categoryMap[cat]) {
        categoryMap[cat] = { count: 0, total: 0 };
      }
      categoryMap[cat].count += 1;
      categoryMap[cat].total += item.price;
    });
  });

  const categoryBreakdown = Object.entries(categoryMap).map(([category, val]) => ({
    category,
    count: val.count,
    total: val.total,
  })).sort((a, b) => b.total - a.total);

  const exportCSV = () => {
    if (sales.length === 0) return;

    const headers = ['ID Venda', 'Data', 'Forma Pagamento', 'Qtd Itens', 'Desconto (R$)', 'Total (R$)'];
    const rows = sales.map((s) => [
      s.id || '',
      formatDate(s.createdAt),
      s.paymentMethod,
      s.items?.length || 0,
      s.discount || 0,
      s.totalAmount.toFixed(2),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Relatorio_Vendas_MeuBazar_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Relatórios & Exportação CSV <BarChart3 className="w-5 h-5 text-emerald-600" />
          </h1>
          <p className="text-sm text-slate-500">
            Acompanhe o desempenho das suas vendas e exporte planilhas em 1 clique.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-bold focus:outline-none focus:border-emerald-600"
          >
            <option value="all">Todo o Período</option>
            <option value="today">Hoje</option>
            <option value="week">Últimos 7 dias</option>
            <option value="month">Este Mês</option>
          </select>

          <button
            onClick={exportCSV}
            disabled={sales.length === 0}
            className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center space-x-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
            <span>Total Faturado</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{formatCurrency(totalRevenue)}</div>
          <p className="text-[10px] text-slate-400 font-semibold">{totalSalesCount} vendas registradas</p>
        </div>

        <div className="glass-card p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
            <span>Ticket Médio</span>
            <TrendingUp className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{formatCurrency(averageTicket)}</div>
          <p className="text-[10px] text-slate-400 font-semibold">Média por transação</p>
        </div>

        <div className="glass-card p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
            <span>Peças Vendidas</span>
            <ShoppingBag className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalItemsSold}</div>
          <p className="text-[10px] text-slate-400 font-semibold">Itens entregues aos clientes</p>
        </div>
      </div>

      <div className="glass-card p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          Vendas por Categoria
        </h3>

        <div className="space-y-3">
          {categoryBreakdown.map((item) => {
            const percentage = totalRevenue > 0 ? (item.total / totalRevenue) * 100 : 0;
            return (
              <div key={item.category} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-800">
                  <span>{item.category} ({item.count} peças)</span>
                  <span className="text-emerald-700">{formatCurrency(item.total)} ({percentage.toFixed(1)}%)</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}

          {categoryBreakdown.length === 0 && (
            <div className="py-6 text-center text-slate-400 text-xs">
              Nenhuma venda registrada no período selecionado.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
