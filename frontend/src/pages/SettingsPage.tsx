import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, Store, CreditCard } from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { ToastContainer } from '../components/ui/Toast';
import type { ToastMessage } from '../components/ui/Toast';

export const SettingsPage: React.FC = () => {
  const { user, settings, refreshSettings } = useAuth();

  const [bazarName, setBazarName] = useState(settings?.bazarName || 'Meu Bazar');
  const [phone, setPhone] = useState(settings?.phone || '');
  const [address, setAddress] = useState(settings?.address || '');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState(settings?.logoUrl || '');
  const [pagSeguroEmail, setPagSeguroEmail] = useState(settings?.pagSeguroEmail || '');
  const [pagSeguroToken, setPagSeguroToken] = useState(settings?.pagSeguroToken || '');
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const envMode = import.meta.env.VITE_ENV_MODE || 'dev';

  const addToast = (type: 'success' | 'error' | 'info', title: string, description?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, description }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    try {
      let logoUrl = logoPreview;
      if (logoFile) {
        logoUrl = await apiService.uploadImage(logoFile, user.uid, 'logo');
      }

      await apiService.updateSettings({
        bazarName,
        phone,
        address,
        logoUrl,
        theme: 'light',
        pagSeguroEmail,
        pagSeguroToken,
      });

      await refreshSettings();
      addToast('success', 'Configurações Salvas!', 'As informações do seu bazar foram atualizadas.');
    } catch (err: any) {
      addToast('error', 'Erro ao Salvar', err.message || 'Falha ao salvar configurações.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          Configurações do Bazar <SettingsIcon className="w-5 h-5 text-emerald-600" />
        </h1>
        <p className="text-sm text-slate-500">
          Personalize as informações da sua loja, marca e logotipo.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Store className="w-4 h-4 text-emerald-600" /> Informações Principais
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Nome do Bazar ou Loja *
              </label>
              <input
                type="text"
                required
                value={bazarName}
                onChange={(e) => setBazarName(e.target.value)}
                placeholder="Ex: Bazar Beneficiente Esperança"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Telefone / WhatsApp
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 99999-8888"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Endereço Completo
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Rua das Flores, 123 - Centro"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Logotipo da Loja
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700"
                />
                {logoPreview && (
                  <img
                    src={logoPreview}
                    alt="Logo Preview"
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-teal-600" /> Integração PagSeguro
            </h3>
            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                envMode === 'prod' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}
            >
              Modo Atual: {envMode}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                E-mail PagSeguro
              </label>
              <input
                type="email"
                value={pagSeguroEmail}
                onChange={(e) => setPagSeguroEmail(e.target.value)}
                placeholder="vendas@meubazar.com"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Token PagSeguro
              </label>
              <input
                type="password"
                value={pagSeguroToken}
                onChange={(e) => setPagSeguroToken(e.target.value)}
                placeholder="••••••••••••••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? 'Salvando...' : 'Salvar Alterações'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
