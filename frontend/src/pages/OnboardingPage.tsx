import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, CreditCard, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../utils/formatters';

export const OnboardingPage: React.FC = () => {
  const { userProfile, createBazarWithSubscription } = useAuth();
  const navigate = useNavigate();

  const [bazarName, setBazarName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const envMode = import.meta.env.VITE_ENV_MODE || 'dev';
  const planPrice = 49.9;

  const handleOpenCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!bazarName.trim()) {
      return setError('Informe o nome do seu bazar para continuar.');
    }
    setIsCheckoutOpen(true);
  };

  const handleConfirmSubscription = async () => {
    setProcessing(true);
    setError('');
    try {
      await createBazarWithSubscription(bazarName.trim(), phone.trim(), address.trim());
      setIsCheckoutOpen(false);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Falha ao processar assinatura do SaaS.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100 text-slate-900">
      <div className="w-full max-w-xl bg-white border border-slate-200 p-8 rounded-3xl shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-100 text-emerald-700 border border-emerald-200 mb-2">
            <Store className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Criar Seu Bazar & Assinar SaaS
          </h1>
          <p className="text-sm text-slate-500">
            Olá {userProfile?.firstName || 'Usuário'}! Preencha as informações do seu bazar e realize a assinatura.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleOpenCheckout} className="space-y-5">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2 flex items-center gap-2">
              <Store className="w-4 h-4 text-emerald-600" /> 1. Dados do Bazar
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Nome do Bazar / Brechó *
              </label>
              <input
                type="text"
                required
                value={bazarName}
                onChange={(e) => setBazarName(e.target.value)}
                placeholder="Ex: Bazar Chic & Usados"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Telefone / WhatsApp
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 99999-8888"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Endereço
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Rua Principal, 100"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" /> 2. Assinatura do SaaS (PagSeguro)
            </h3>

            <div className="p-5 rounded-2xl border-2 border-emerald-500 bg-emerald-50/60 flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-slate-900 text-base">Plano Mensal Meu Bazar</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-200 text-emerald-800">
                    Acesso Total
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Inclui gestão de estoque, código de barras, impressor de etiquetas e PDV ilimitado.
                </p>
              </div>

              <div className="text-right flex-shrink-0 pl-4">
                <div className="text-2xl font-black text-emerald-700">
                  {formatCurrency(planPrice)}
                </div>
                <div className="text-[10px] text-slate-500 font-bold uppercase">por mês</div>
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
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 border border-slate-200">
              <div className="text-center space-y-2">
                <div className="inline-flex p-3 rounded-2xl bg-teal-100 text-teal-700 mb-1">
                  <CreditCard className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">PagSeguro Checkout</h3>
                <p className="text-xs text-slate-500">
                  Assinatura do SaaS Meu Bazar para <strong className="text-slate-800">{bazarName}</strong>
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Item:</span>
                  <span className="font-bold text-slate-900">Assinatura Mensal SaaS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Gateway:</span>
                  <span className="font-bold text-emerald-600">PagSeguro</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Modo:</span>
                  <span className="font-bold uppercase text-amber-600">{envMode}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold pt-2 border-t border-slate-200 text-slate-900">
                  <span>Valor:</span>
                  <span className="text-emerald-600">{formatCurrency(planPrice)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleConfirmSubscription}
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
                  className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition"
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
