import React, { useEffect, useState, useCallback } from 'react';
import { History, Search, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { Sale } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Modal } from '../components/ui/Modal';
import { TableSkeleton } from '../components/ui/Skeleton';

const ITEMS_PER_PAGE = 10;

export const HistoryPage: React.FC = () => {
  const { activeBazaar } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'today' | 'week' | 'month' | 'year' | 'all'>('month');
  const [search, setSearch] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [page, setPage] = useState(1);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiService.getSaleHistory(filter, activeBazaar?.id);
      setSales(data);
    } catch (err) {
      console.error('Error fetching sales history:', err);
    } finally {
      setLoading(false);
    }
  }, [filter, activeBazaar?.id]);

  useEffect(() => {
    fetchHistory();
    setPage(1);
  }, [fetchHistory]);

  const filteredSales = sales.filter((s) => {
    const searchLower = search.toLowerCase();
    const matchId = (s.id || '').toLowerCase().includes(searchLower);
    const matchPayment = (s.paymentMethod || '').toLowerCase().includes(searchLower);
    const matchItems = s.items.some(
      (item) =>
        item.productName.toLowerCase().includes(searchLower) ||
        item.internalCode.toLowerCase().includes(searchLower)
    );
    return matchId || matchPayment || matchItems;
  });

  const totalPages = Math.ceil(filteredSales.length / ITEMS_PER_PAGE) || 1;
  const paginatedSales = filteredSales.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Histórico de Vendas <History className="w-5 h-5 text-emerald-500" />
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Consulte todas as transações realizadas com filtros de período.
          </p>
        </div>
      </div>

      <div className="glass-card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por ID, produto ou pagamento..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
            {[
              { id: 'today', label: 'Hoje' },
              { id: 'week', label: 'Esta Semana' },
              { id: 'month', label: 'Este Mês' },
              { id: 'year', label: 'Este Ano' },
              { id: 'all', label: 'Todas' },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setFilter(btn.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filter === btn.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-6">
            <TableSkeleton />
          </div>
        ) : filteredSales.length === 0 ? (
          <div className="p-12 text-center text-slate-400 dark:text-slate-500 text-sm">
            Nenhuma venda encontrada para o período selecionado.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="p-4">Data / Hora</th>
                    <th className="p-4">Itens Vendidos</th>
                    <th className="p-4">Pagamento</th>
                    <th className="p-4">Valor Total</th>
                    <th className="p-4">Transação ID</th>
                    <th className="p-4 text-right">Comprovante</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                      <td className="p-4 font-medium text-slate-700 dark:text-slate-300">
                        {formatDate(sale.createdAt)}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {sale.items.map((i) => i.productName).join(', ')}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{sale.items.length} peça(s)</div>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-slate-700">
                          {sale.paymentMethod}
                        </span>
                      </td>
                      <td className="p-4 font-black text-emerald-600 dark:text-emerald-400 text-base">
                        {formatCurrency(sale.totalAmount)}
                      </td>
                      <td className="p-4 font-mono text-xs text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                        {sale.transactionId || sale.id}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedSale(sale)}
                          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition"
                          title="Ver Comprovante"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">
                  Página {page} de {totalPages} ({filteredSales.length} vendas)
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Modal
        isOpen={Boolean(selectedSale)}
        onClose={() => setSelectedSale(null)}
        title="Detalhes da Venda"
        subtitle={`Comprovante da venda realizada em ${formatDate(selectedSale?.createdAt)}`}
      >
        {selectedSale && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white font-mono text-xs space-y-3">
              <div className="flex justify-between border-b border-slate-800 dark:border-slate-700 pb-2">
                <span>Venda ID:</span>
                <span className="text-emerald-400">{selectedSale.id}</span>
              </div>
              <div className="space-y-1">
                {selectedSale.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{item.productName} ({item.internalCode})</span>
                    <span>{formatCurrency(item.price)}</span>
                  </div>
                ))}
              </div>
              {selectedSale.discount ? (
                <div className="flex justify-between text-rose-400">
                  <span>Desconto aplicado:</span>
                  <span>- {formatCurrency(selectedSale.discount)}</span>
                </div>
              ) : null}
              <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-800 dark:border-slate-700 text-emerald-400">
                <span>TOTAL PAGO:</span>
                <span>{formatCurrency(selectedSale.totalAmount)}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedSale(null)}
              className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm"
            >
              Fechar
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};
