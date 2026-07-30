import React, { useEffect, useState } from 'react';
import { Store, Users, UserPlus, Trash2, Save, Shield } from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { BazaarNiche, UserRole } from '../types';
import type { BazaarMember } from '../types';
import { ToastContainer } from '../components/ui/Toast';
import type { ToastMessage } from '../components/ui/Toast';

export const SettingsPage: React.FC = () => {
  const { activeBazaar, activeRole, refreshBazaars } = useAuth();

  const [activeTab, setActiveTab] = useState<'info' | 'team'>('info');

  const [bazarName, setBazarName] = useState(activeBazaar?.name || '');
  const [cnpj, setCnpj] = useState(activeBazaar?.cnpj || '');
  const [niche, setNiche] = useState<string>(activeBazaar?.niche || BazaarNiche.MODA_FEMININA);
  const [phone, setPhone] = useState(activeBazaar?.phone || '');
  const [address, setAddress] = useState(activeBazaar?.address || '');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState(activeBazaar?.logoUrl || '');
  const [saving, setSaving] = useState(false);

  const [members, setMembers] = useState<BazaarMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('CASHIER');
  const [inviting, setInviting] = useState(false);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    if (activeBazaar) {
      setBazarName(activeBazaar.name || '');
      setCnpj(activeBazaar.cnpj || '');
      setNiche(activeBazaar.niche || BazaarNiche.MODA_FEMININA);
      setPhone(activeBazaar.phone || '');
      setAddress(activeBazaar.address || '');
      setLogoPreview(activeBazaar.logoUrl || '');

      const unsub = apiService.subscribeBazaarMembers(activeBazaar.id, (memberList) => {
        setMembers(memberList);
      });
      return () => unsub();
    }
  }, [activeBazaar]);

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

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBazaar) return;
    if (activeRole !== 'OWNER') {
      return addToast('error', 'Acesso Negado', 'Apenas o Dono do Bazar pode editar estas informações.');
    }

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

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBazaar) return;
    if (!inviteEmail.trim()) return;
    setInviting(true);

    try {
      await apiService.inviteMember(activeBazaar.id, inviteEmail.trim(), inviteRole);
      setInviteEmail('');
      addToast('success', 'Convite Enviado!', `Membro ${inviteEmail} convidado como ${inviteRole}.`);
    } catch (err: any) {
      addToast('error', 'Erro no Convite', err.message || 'Falha ao convidar membro.');
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!activeBazaar) return;
    if (!confirm('Deseja remover este membro da equipe?')) return;

    try {
      await apiService.removeMember(activeBazaar.id, memberId);
      addToast('success', 'Membro Removido', 'O membro foi removido com sucesso.');
    } catch (err: any) {
      addToast('error', 'Erro ao Remover', err.message || 'Falha ao remover.');
    }
  };

  if (!activeBazaar) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800">Nenhum Bazar Selecionado</h2>
        <p className="text-slate-500 text-sm mt-1">Crie ou selecione um bazar para acessar as configurações.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Configurações do Bazar: <span className="text-emerald-600">{activeBazaar.name}</span>
          </h1>
          <p className="text-sm text-slate-500">
            Edite a marca do seu bazar e gerencie as permissões da equipe (RBAC).
          </p>
        </div>

        <div className="flex bg-slate-200 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'info' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Store className="w-3.5 h-3.5 inline-block mr-1.5" /> Dados do Bazar
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'team' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 inline-block mr-1.5" /> Equipe & Permissões (RBAC)
          </button>
        </div>
      </div>

      {activeTab === 'info' && (
        <form onSubmit={handleSaveInfo} className="glass-card p-6 space-y-6">
          <div className="flex items-center space-x-4 pb-4 border-b border-slate-100">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Store className="w-8 h-8 text-slate-400" />
              )}
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Logotipo da Loja
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                disabled={activeRole !== 'OWNER'}
                className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Nome do Bazar *
              </label>
              <input
                type="text"
                required
                disabled={activeRole !== 'OWNER'}
                value={bazarName}
                onChange={(e) => setBazarName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-emerald-600 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                CNPJ (Opcional)
              </label>
              <input
                type="text"
                disabled={activeRole !== 'OWNER'}
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                placeholder="00.000.000/0001-00"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-emerald-600 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Nicho Principal *
              </label>
              <select
                disabled={activeRole !== 'OWNER'}
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-emerald-600 disabled:opacity-60"
              >
                {Object.values(BazaarNiche).map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Telefone / WhatsApp
              </label>
              <input
                type="text"
                disabled={activeRole !== 'OWNER'}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 99999-8888"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-emerald-600 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Endereço
              </label>
              <input
                type="text"
                disabled={activeRole !== 'OWNER'}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Rua Principal, 100"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-emerald-600 disabled:opacity-60"
              />
            </div>
          </div>

          {activeRole === 'OWNER' && (
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition flex items-center space-x-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Salvando...' : 'Salvar Alterações'}</span>
              </button>
            </div>
          )}
        </form>
      )}

      {activeTab === 'team' && (
        <div className="space-y-6">
          {activeRole === 'OWNER' ? (
            <form onSubmit={handleInviteMember} className="glass-card p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <UserPlus className="w-4 h-4 text-emerald-600" /> Convidar Membro para o Bazar
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    E-mail do Usuário *
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="funcionario@exemplo.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Cargo / Permissão *
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as UserRole)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-emerald-600"
                  >
                    <option value={UserRole.MANAGER}>Gerente (MANAGER)</option>
                    <option value={UserRole.CASHIER}>Operador de Caixa (CASHIER)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={inviting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{inviting ? 'Enviando...' : 'Convidar Membro'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-600" />
              <span>Apenas o Dono do Bazar (`OWNER`) possui permissão para convidar ou remover membros da equipe.</span>
            </div>
          )}

          <div className="glass-card p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Users className="w-4 h-4 text-slate-700" /> Membros da Equipe ({members.length})
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-xs font-bold uppercase">
                    <th className="py-3 px-3">E-mail do Membro</th>
                    <th className="py-3 px-3">Cargo</th>
                    <th className="py-3 px-3">Status</th>
                    {activeRole === 'OWNER' && <th className="py-3 px-3 text-right">Ação</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {members.map((m) => (
                    <tr key={m.id || m.userEmail} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        {m.userEmail}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-extrabold uppercase ${
                            m.role === 'OWNER'
                              ? 'bg-purple-100 text-purple-800'
                              : m.role === 'MANAGER'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {m.role}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-xs font-semibold text-slate-600 capitalize">
                          {m.status}
                        </span>
                      </td>
                      {activeRole === 'OWNER' && (
                        <td className="py-3 px-3 text-right">
                          {m.role !== 'OWNER' && m.id && (
                            <button
                              onClick={() => handleRemoveMember(m.id!)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition"
                              title="Remover Membro"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
