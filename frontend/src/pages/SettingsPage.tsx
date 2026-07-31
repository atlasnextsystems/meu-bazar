import React, { useEffect, useState } from 'react';
import { Store, Save, Users, UserPlus, Trash2, Shield, Crown, CreditCard } from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { BazaarNiche, UserRole } from '../types';
import type { BazaarMember } from '../types';
import { ToastContainer } from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';

const ROLE_LABELS: Record<string, string> = {
  OWNER: 'Dono',
  MANAGER: 'Gerente',
  CASHIER: 'Caixa',
};

const ROLE_COLORS: Record<string, string> = {
  OWNER: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  MANAGER: 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  CASHIER: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
};

const ROLE_ICONS: Record<string, React.FC<{ className?: string }>> = {
  OWNER: Crown,
  MANAGER: Shield,
  CASHIER: CreditCard,
};

export const SettingsPage: React.FC = () => {
  const { activeBazaar, activeRole, refreshBazaars } = useAuth();
  const { toasts, addToast, removeToast } = useToast();

  const [bazarName, setBazarName] = useState(activeBazaar?.name || '');
  const [cnpj, setCnpj] = useState(activeBazaar?.cnpj || '');
  const [niche, setNiche] = useState<string>(activeBazaar?.niche || BazaarNiche.MODA_FEMININA);
  const [phone, setPhone] = useState(activeBazaar?.phone || '');
  const [address, setAddress] = useState(activeBazaar?.address || '');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState(activeBazaar?.logoUrl || '');
  const [saving, setSaving] = useState(false);

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

  const [members, setMembers] = useState<BazaarMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<string>(UserRole.CASHIER);
  const [inviting, setInviting] = useState(false);

  const isOwner = activeRole === 'OWNER';

  useEffect(() => {
    if (activeBazaar) {
      setBazarName(activeBazaar.name || '');
      setCnpj(activeBazaar.cnpj || '');
      setNiche(activeBazaar.niche || BazaarNiche.MODA_FEMININA);
      setPhone(activeBazaar.phone || '');
      setAddress(activeBazaar.address || '');
      setLogoPreview(activeBazaar.logoUrl || '');
    }
  }, [activeBazaar]);

  useEffect(() => {
    if (!activeBazaar?.id) return;
    const unsub = apiService.subscribeBazaarMembers(activeBazaar.id, (m) => setMembers(m));
    return () => unsub();
  }, [activeBazaar?.id]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBazaar) return;
    setSaving(true);

    try {
      let logoUrl = logoPreview;
      if (logoFile) {
        logoUrl = await apiService.uploadImage(logoFile, activeBazaar.ownerId, 'logo');
      }

      await apiService.updateBazaar(activeBazaar.id, {
        name: bazarName,
        cnpj,
        niche,
        logoUrl,
        phone,
        address,
      });

      await refreshBazaars();
      addToast('success', 'Bazar Atualizado!', 'As informações do seu bazar foram salvas.');
    } catch (err: any) {
      addToast('error', 'Erro ao Salvar', err.message || 'Ocorreu uma falha.');
    } finally {
      setSaving(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBazaar?.id || !inviteEmail.trim()) return;
    setInviting(true);

    try {
      await apiService.inviteMember(activeBazaar.id, inviteEmail.trim(), inviteRole);
      addToast('success', 'Convite Enviado!', `Convite enviado para ${inviteEmail.trim()}`);
      setInviteEmail('');
      setInviteRole(UserRole.CASHIER);
    } catch (err: any) {
      addToast('error', 'Erro ao Convidar', err.message || 'Falha ao enviar convite.');
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberEmail: string) => {
    if (!activeBazaar?.id) return;
    if (!window.confirm(`Remover ${memberEmail} deste bazar?`)) return;

    try {
      await apiService.removeMember(activeBazaar.id, memberId);
      addToast('success', 'Membro Removido', `${memberEmail} foi removido do bazar.`);
    } catch (err: any) {
      addToast('error', 'Erro ao Remover', err.message || 'Falha ao remover membro.');
    }
  };

  if (!activeBazaar) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Nenhum Bazar Selecionado</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Crie ou selecione um bazar para acessar as configurações.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          Configurações do Bazar: <span className="text-emerald-600 dark:text-emerald-400">{activeBazaar.name}</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Edite as informações, gerencie a equipe e configure seu bazar.
        </p>
      </div>

      <form onSubmit={handleSaveInfo} className="glass-card p-6 space-y-6">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
          <Store className="w-4 h-4 text-emerald-600" /> Dados do Bazar
        </h3>

        <div className="flex items-center space-x-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden">
            {logoPreview ? (
              <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Store className="w-8 h-8 text-slate-400" />
            )}
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Logotipo da Loja
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 dark:file:bg-emerald-950/40 file:text-emerald-700 dark:file:text-emerald-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Nome do Bazar *
            </label>
            <input
              type="text"
              required
              value={bazarName}
              onChange={(e) => setBazarName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-600"
            />
          </div>

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
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Nicho Principal *
            </label>
            <select
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-600"
            >
              {Object.values(BazaarNiche).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

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
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-600"
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
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-600"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Salvando...' : 'Salvar Alterações'}</span>
          </button>
        </div>
      </form>

      <div className="glass-card p-6 space-y-6">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-600" /> Equipe do Bazar
        </h3>

        {isOwner && (
          <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div className="flex-1">
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="E-mail do membro para convidar"
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-600"
              />
            </div>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-600"
            >
              <option value={UserRole.CASHIER}>Caixa</option>
              <option value={UserRole.MANAGER}>Gerente</option>
            </select>
            <button
              type="submit"
              disabled={inviting}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>{inviting ? 'Enviando...' : 'Convidar'}</span>
            </button>
          </form>
        )}

        <div className="space-y-2">
          {members.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">Nenhum membro cadastrado ainda.</p>
          )}

          {members.map((m) => {
            const RoleIcon = ROLE_ICONS[m.role] || CreditCard;
            return (
              <div
                key={m.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 font-bold text-sm flex-shrink-0">
                    {m.userEmail?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {m.userName || m.userEmail}
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{m.userEmail}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${ROLE_COLORS[m.role] || ROLE_COLORS.CASHIER}`}>
                    <RoleIcon className="w-3 h-3" />
                    {ROLE_LABELS[m.role] || m.role}
                  </span>

                  {m.status === 'pending' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                      Pendente
                    </span>
                  )}

                  {isOwner && m.role !== UserRole.OWNER && (
                    <button
                      onClick={() => handleRemoveMember(m.id!, m.userEmail)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                      title="Remover membro"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
