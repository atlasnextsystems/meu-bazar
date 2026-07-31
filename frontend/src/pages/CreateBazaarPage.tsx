import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, CreditCard, Sparkles, CheckCircle2, Sun, Moon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/api';
import { BazaarNiche } from '../types';
import { formatCurrency } from '../utils/formatters';

export const CreateBazaarPage: React.FC = () => {
  const { user, refreshBazaars } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [bazarName, setBazarName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [niche, setNiche] = useState<string>(BazaarNiche.MODA_FEMININA);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState('');

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const envMode = import.meta.env.VITE_ENV_MODE || 'dev';
  const planPrice = 49.9;

  const formatCNPJ = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 14);
    return digits
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 10) {
      return digits
        .replace(/^(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }
    return digits
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2');
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleOpenCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!bazarName.trim()) {
      return setError('Informe o nome do bazar.');
    }
    setIsCheckoutOpen(true);
  };

  const handleConfirmSubscriptionAndCreate = async () => {
    if (!user) return;
    setProcessing(true);
    setError('');

    try {
      let logoUrl = '';
      if (logoFile) {
        logoUrl = await apiService.uploadImage(logoFile, user.uid, 'logo');
      }

      await apiService.createBazaar({
        name: bazarName.trim(),
        cnpj: cnpj.trim(),
        niche,
        logoUrl,
        phone: phone.trim(),
        address: address.trim(),
      });

      await refreshBazaars();
      setIsCheckoutOpen(false);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Falha ao criar o bazar e processar a assinatura.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-xl space-y-6">
        <div className="flex justify-end">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        </div>

        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 mb-2">
            <Store className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Criar Novo Bazar</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Cadastre os dados da sua loja e assine o plano mensal do SaaS via PagSeguro.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleOpenCheckout} className="space-y-5">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 pb-2 flex items-center gap-2">
              <Store className="w-4 h-4 text-emerald-600" /> Dados do Bazar
            </h3>

            <div className="flex items-center space-x-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Store className="w-8 h-8 text-slate-400" />
                )}
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Logo ou Foto do Bazar (Opcional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 dark:file:bg-emerald-950/40 file:text-emerald-700 dark:file:text-emerald-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Nome do Bazar *
              </label>
              <input
                type="text"
                required
                value={bazarName}
                onChange={(e) => setBazarName(e.target.value)}
                placeholder="Ex: Bazar Chic & Desapegos"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  CNPJ (Opcional)
                </label>
                <input
                  type="text"
                  value={cnpj}
                  onChange={(e) => setCnpj(formatCNPJ(e.target.value))}
                  placeholder="00.000.000/0001-00"
                  maxLength={18}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Nicho principal *
                </label>
                <select
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-600"
                >
                  {Object.values(BazaarNiche).map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Telefone / WhatsApp
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  placeholder="(11) 99999-8888"
                  maxLength={15}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Endereço
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Rua Principal, 100"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 pb-2 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" /> Assinatura do SaaS (PagSeguro)
            </h3>

            <div className="p-5 rounded-2xl border-2 border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-slate-900 dark:text-white text-base">Assinatura Mensal SaaS</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200">
                    Acesso Completo
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  PDV rápido, catálogo de itens, controle de caixa e relatórios em CSV.
                </p>
              </div>

              <div className="text-right flex-shrink-0 pl-4">
                <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                  {formatCurrency(planPrice)}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">por mês</div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/30 transition"
          >
            <Sparkles className="w-5 h-5" />
            <span>Assinar SaaS via PagSeguro e Criar Bazar</span>
          </button>
        </form>

        {isCheckoutOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 border border-slate-200 dark:border-slate-800">
              <div className="text-center space-y-2">
                <div className="inline-flex p-3 rounded-2xl bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 mb-1">
                  <CreditCard className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">PagSeguro Checkout</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Assinatura do SaaS Meu Bazar para <strong className="text-slate-800 dark:text-slate-200">{bazarName}</strong>
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Item:</span>
                  <span className="font-bold text-slate-900 dark:text-white">Assinatura Mensal SaaS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Gateway:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">PagSeguro</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Modo:</span>
                  <span className="font-bold uppercase text-amber-600 dark:text-amber-400">{envMode}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold pt-2 border-t border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                  <span>Valor:</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(planPrice)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleConfirmSubscriptionAndCreate}
                  disabled={processing}
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {processing ? (
                    <span>Processando Pagamento...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>{envMode === 'dev' ? 'Simular Pagamento Aprovado (Mock)' : 'Confirmar e Pagar'}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setIsCheckoutOpen(false)}
                  disabled={processing}
                  className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
