import React, { useEffect, useState } from 'react';
import {
  ShoppingCart,
  Plus,
  Trash2,
  CheckCircle2,
  CreditCard,
  Banknote,
  QrCode as QrCodeIcon,
  ShieldCheck,
  Search,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { PaymentMethod } from '../types';
import type { Product, Sale } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Modal } from '../components/ui/Modal';
import { ToastContainer } from '../components/ui/Toast';
import type { ToastMessage } from '../components/ui/Toast';
import { Skeleton } from '../components/ui/Skeleton';

export const SalesPage: React.FC = () => {
  const { user } = useAuth();
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [cart, setCart] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.DINHEIRO);
  const [discount, setDiscount] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [registering, setRegistering] = useState(false);

  const [completedSale, setCompletedSale] = useState<Sale | null>(null);

  const envMode = import.meta.env.VITE_ENV_MODE || 'dev';

  const addToast = (type: 'success' | 'error' | 'info', title: string, description?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, description }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const unsubscribe = apiService.subscribeProducts(user.uid, (products) => {
      setAvailableProducts(products.filter((p) => !p.isSold));
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  const addToCart = (product: Product) => {
    if (cart.find((item) => item.id === product.id)) {
      return addToast('info', 'Já no carrinho', `"${product.name}" já foi adicionado.`);
    }
    setCart((prev) => [...prev, product]);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscount('');
    setNotes('');
  };

  const subtotal = cart.reduce((acc, curr) => acc + curr.price, 0);
  const discountVal = Number(discount) || 0;
  const grandTotal = Math.max(0, subtotal - discountVal);

  const handleRegisterSale = async () => {
    if (cart.length === 0) {
      return addToast('error', 'Carrinho Vazio', 'Selecione pelo menos um produto para vender.');
    }

    setRegistering(true);
    try {
      const productIds = cart.map((p) => p.id!).filter(Boolean);
      const sale = await apiService.registerSale({
        productIds,
        paymentMethod,
        discount: discountVal,
        notes,
      });

      addToast('success', 'Venda Registrada!', `Total: ${formatCurrency(sale.totalAmount)}`);
      setCompletedSale(sale);
      clearCart();
    } catch (err: any) {
      addToast('error', 'Erro ao Registrar Venda', err.message || 'Falha na transação.');
    } finally {
      setRegistering(false);
    }
  };

  const filteredProducts = availableProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.internalCode.toLowerCase().includes(search.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Ponto de Venda (PDV) <ShoppingCart className="w-5 h-5 text-emerald-500" />
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Selecione as peças no estoque e registre a venda instantaneamente.
          </p>
        </div>
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Integrador de Pagamento: </span>
          <span className="uppercase text-emerald-600 dark:text-emerald-400 font-extrabold">{envMode}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card p-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Pesquisar peça no estoque por nome ou código..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <div className="glass-card p-4 space-y-3">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Disponíveis para Venda ({filteredProducts.length})
            </h3>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                Nenhum produto disponível em estoque.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
                {filteredProducts.map((product) => {
                  const isSelected = Boolean(cart.find((i) => i.id === product.id));
                  return (
                    <div
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-sm'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-400'
                      }`}
                    >
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <ShoppingCart className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                            {product.name}
                          </h4>
                          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                            {product.internalCode} • {product.category}
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0 pl-2">
                        <div className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                          {formatCurrency(product.price)}
                        </div>
                        <button
                          type="button"
                          className={`mt-1 p-1 rounded-lg text-xs font-bold flex items-center space-x-1 ${
                            isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {isSelected ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="glass-card p-5 space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Resumo do Pedido ({cart.length})
              </h3>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-rose-500 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Limpar
                </button>
              )}
            </div>

            <div className="space-y-2 my-4 max-h-60 overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">
                  Clique nas peças ao lado para adicionar ao carrinho.
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs"
                  >
                    <div className="truncate pr-2">
                      <div className="font-bold text-slate-900 dark:text-white truncate">{item.name}</div>
                      <div className="text-slate-500 font-mono">{item.internalCode}</div>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <span className="font-black text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(item.price)}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.id!)}
                        className="text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                Forma de Pagamento
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { method: PaymentMethod.DINHEIRO, label: 'Dinheiro', icon: Banknote },
                  { method: PaymentMethod.PIX, label: 'PIX Instantâneo', icon: QrCodeIcon },
                  { method: PaymentMethod.CARTAO_CREDITO, label: 'Cartão de Crédito', icon: CreditCard },
                  { method: PaymentMethod.PAGSEGURO_ONLINE, label: 'PagSeguro Checkout', icon: Sparkles },
                ].map(({ method, label, icon: Icon }) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`p-2.5 rounded-xl border flex items-center space-x-2 transition ${
                      paymentMethod === method
                        ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-sm'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Desconto (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value ? parseFloat(e.target.value) : '')}
                  placeholder="0.00"
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Observações
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Cliente Maria"
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {discountVal > 0 && (
                <div className="flex justify-between text-rose-500">
                  <span>Desconto:</span>
                  <span>- {formatCurrency(discountVal)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-700">
                <span>Total a Pagar:</span>
                <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            <button
              onClick={handleRegisterSale}
              disabled={registering || cart.length === 0}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/30 transition disabled:opacity-50"
            >
              {registering ? (
                <span>Processando Venda...</span>
              ) : (
                <>
                  <span>Finalizar Venda</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={Boolean(completedSale)}
        onClose={() => setCompletedSale(null)}
        title="Venda Concluída com Sucesso!"
        subtitle="Comprovante de pagamento gerado pelo sistema Meu Bazar"
      >
        {completedSale && (
          <div className="space-y-5">
            <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-4 font-mono text-xs shadow-xl">
              <div className="text-center border-b border-slate-800 pb-3">
                <div className="font-extrabold text-sm uppercase text-emerald-400">Meu Bazar - SaaS</div>
                <div className="text-slate-400">{formatDate(completedSale.createdAt)}</div>
                <div className="text-slate-500">ID: {completedSale.id}</div>
              </div>

              <div className="space-y-2 py-2">
                {completedSale.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="truncate max-w-[200px]">{item.productName} ({item.internalCode})</span>
                    <span>{formatCurrency(item.price)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-800 pt-3 space-y-1">
                <div className="flex justify-between">
                  <span>Forma Pagamento:</span>
                  <span className="text-emerald-400">{completedSale.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-sm font-bold pt-1 border-t border-slate-800">
                  <span>VALOR TOTAL:</span>
                  <span className="text-emerald-400">{formatCurrency(completedSale.totalAmount)}</span>
                </div>
                {completedSale.transactionId && (
                  <div className="text-slate-500 text-[10px] pt-1 truncate">
                    Transação ID: {completedSale.transactionId}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setCompletedSale(null)}
              className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-md"
            >
              Concluir e Voltar
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};
