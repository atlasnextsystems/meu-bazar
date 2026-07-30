import React, { useEffect, useState } from 'react';
import { ShoppingCart, Plus, Trash2, Printer, Search, CheckCircle2, DollarSign, CreditCard, QrCode } from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { PaymentMethod, ProductCategory } from '../types';
import type { Product, Sale } from '../types';
import { formatCurrency } from '../utils/formatters';
import { ToastContainer } from '../components/ui/Toast';
import type { ToastMessage } from '../components/ui/Toast';

interface CartItem {
  id: string;
  name: string;
  price: number;
  category: string;
  internalCode: string;
}

export const SalesPage: React.FC = () => {
  const { user, activeBazaar } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);

  // Quick custom item inputs
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [customCategory, setCustomCategory] = useState<string>(ProductCategory.FEMININO);

  // Payment settings
  const [paymentMethod, setPaymentMethod] = useState<string>(PaymentMethod.DINHEIRO);
  const [discount, setDiscount] = useState<number>(0);
  const [notes, setNotes] = useState('');

  const [registering, setRegistering] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    if (user) {
      const unsub = apiService.subscribeProducts(user.uid, (prods) => {
        setProducts(prods.filter((p) => !p.isSold));
      });
      return () => unsub();
    }
  }, [user]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, description?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, description }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addToCart = (prod: Product) => {
    if (cart.some((item) => item.id === prod.id)) {
      return addToast('info', 'Item no Carrinho', 'Este item já foi adicionado.');
    }

    setCart((prev) => [
      ...prev,
      {
        id: prod.id || `PROD_${Date.now()}`,
        name: prod.name,
        price: prod.price,
        category: prod.category,
        internalCode: prod.internalCode,
      },
    ]);
  };

  const addCustomToCart = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(customPrice);
    if (!customName.trim() || isNaN(priceNum) || priceNum <= 0) {
      return addToast('error', 'Dados Inválidos', 'Informe um nome e valor válido.');
    }

    const newItem: CartItem = {
      id: `CUSTOM_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: customName.trim(),
      price: priceNum,
      category: customCategory,
      internalCode: `AVULSO-${Math.floor(100 + Math.random() * 900)}`,
    };

    setCart((prev) => [...prev, newItem]);
    setCustomName('');
    setCustomPrice('');
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price, 0);
  const total = Math.max(0, subtotal - (discount || 0));

  const handleRegisterSale = async () => {
    if (cart.length === 0) {
      return addToast('error', 'Carrinho Vazio', 'Adicione pelo menos um item para registrar a venda.');
    }

    setRegistering(true);

    try {
      const realProductIds: string[] = [];

      for (const item of cart) {
        if (item.id.startsWith('CUSTOM_')) {
          const created = await apiService.createProduct({
            name: item.name,
            price: item.price,
            category: item.category,
            condition: 'Seminovo Perfeito',
            bazaarId: activeBazaar?.id,
          });
          if (created.id) realProductIds.push(created.id);
        } else {
          realProductIds.push(item.id);
        }
      }

      const saleData = await apiService.registerSale({
        bazaarId: activeBazaar?.id,
        productIds: realProductIds,
        paymentMethod,
        discount,
        notes,
      });

      setCompletedSale(saleData);
      setCart([]);
      setDiscount(0);
      setNotes('');
      addToast('success', 'Venda Registrada com Sucesso!', `Total: ${formatCurrency(saleData.totalAmount)}`);
    } catch (err: any) {
      addToast('error', 'Erro na Venda', err.message || 'Falha ao registrar venda.');
    } finally {
      setRegistering(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.internalCode.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          Ponto de Venda (PDV) <ShoppingCart className="w-5 h-5 text-emerald-600" />
        </h1>
        <p className="text-sm text-slate-500">
          Registre vendas rápidas, selecione formas de pagamento e imprima o recibo.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Quick Item Catalog & Custom Item Creation */}
        <div className="lg:col-span-7 space-y-6">
          {/* Quick Custom Item Entry */}
          <form onSubmit={addCustomToCart} className="glass-card p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-600" /> Adicionar Item Avulso Rápido
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Descrição do item (ex: Blusa Azul)"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-emerald-600"
              />
              <input
                type="number"
                step="0.01"
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                placeholder="Preço (R$)"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-emerald-600"
              />
              <select
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="w-full px-2 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-emerald-600"
              >
                {Object.values(ProductCategory).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition flex items-center justify-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar</span>
              </button>
            </div>
          </form>

          {/* Product Catalog Picker */}
          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Itens Cadastrados no Bazar</h3>
              <div className="relative w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar peça ou código..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => addToCart(p)}
                  className="p-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-emerald-50/60 hover:border-emerald-400 cursor-pointer transition flex items-center justify-between group"
                >
                  <div className="overflow-hidden pr-2">
                    <div className="font-bold text-slate-900 text-sm truncate">{p.name}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      <span className="font-mono bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded text-[10px]">
                        {p.internalCode}
                      </span>
                      <span>{p.category}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-extrabold text-emerald-700 text-sm">{formatCurrency(p.price)}</div>
                    <span className="text-[10px] text-emerald-600 font-bold group-hover:underline">
                      + Incluir
                    </span>
                  </div>
                </div>
              ))}

              {filteredProducts.length === 0 && (
                <div className="col-span-full py-8 text-center text-xs text-slate-400">
                  Nenhum produto cadastrado ou encontrado.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Shopping Cart & Checkout */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card p-6 space-y-5">
            <h3 className="text-base font-bold text-slate-900 flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-emerald-600" /> Caixa / Venda
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
                {cart.length} itens
              </span>
            </h3>

            {/* Cart Items List */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                >
                  <div className="overflow-hidden pr-2">
                    <div className="font-bold text-slate-900 truncate">{item.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{item.internalCode}</div>
                  </div>
                  <div className="flex items-center space-x-3 flex-shrink-0">
                    <span className="font-extrabold text-slate-900">{formatCurrency(item.price)}</span>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {cart.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-400">
                  O carrinho está vazio. Adicione itens para finalizar.
                </div>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 uppercase">Forma de Pagamento</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: PaymentMethod.DINHEIRO, icon: DollarSign, label: 'Dinheiro' },
                  { key: PaymentMethod.PIX, icon: QrCode, label: 'PIX' },
                  { key: PaymentMethod.CARTAO_CREDITO, icon: CreditCard, label: 'Crédito' },
                  { key: PaymentMethod.CARTAO_DEBITO, icon: CreditCard, label: 'Débito' },
                ].map((pm) => {
                  const Icon = pm.icon;
                  const selected = paymentMethod === pm.key;
                  return (
                    <button
                      key={pm.key}
                      type="button"
                      onClick={() => setPaymentMethod(pm.key)}
                      className={`flex items-center space-x-2 p-2.5 rounded-xl border text-xs font-bold transition ${
                        selected
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{pm.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Discount */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Desconto (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={discount || ''}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  placeholder="0,00"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Observações</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Opcional..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            {/* Totals & Submit */}
            <div className="pt-4 border-t border-slate-200 space-y-2">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-xs text-rose-600">
                  <span>Desconto:</span>
                  <span>- {formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-black text-slate-900 pt-1">
                <span>Total:</span>
                <span className="text-emerald-700">{formatCurrency(total)}</span>
              </div>

              <button
                type="button"
                onClick={handleRegisterSale}
                disabled={registering || cart.length === 0}
                className="w-full py-4 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base shadow-lg shadow-emerald-600/30 transition disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>{registering ? 'Finalizando...' : 'Concluir Venda'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      {completedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200">
            <div className="text-center space-y-1">
              <div className="inline-flex p-3 rounded-2xl bg-emerald-100 text-emerald-700 mb-1">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">Venda Concluída!</h3>
              <p className="text-xs text-slate-500">{activeBazaar?.name || 'Meu Bazar'}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2 font-mono">
              <div className="flex justify-between">
                <span>ID:</span>
                <span className="font-bold">{completedSale.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Pagamento:</span>
                <span className="font-bold">{completedSale.paymentMethod}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 space-y-1">
                {completedSale.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{item.productName}</span>
                    <span>{formatCurrency(item.price)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-sm text-slate-900 font-sans">
                <span>Total Pago:</span>
                <span className="text-emerald-700">{formatCurrency(completedSale.totalAmount)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Recibo</span>
              </button>
              <button
                onClick={() => setCompletedSale(null)}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
              >
                Nova Venda
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
